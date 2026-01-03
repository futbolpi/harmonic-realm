import { Decimal } from "@prisma/client/runtime/client";

import { prisma } from "@/lib/prisma";
import type {
  LocationContext,
  LoreGenerationContext,
} from "@/lib/node-lore/location-lore";
import { LORE_LEVELS } from "@/lib/node-lore/location-lore";
import { inngest } from "@/inngest/client";
import { locationIQ } from "@/lib/node-lore/locationiq";
import { aiLoreGenerator } from "@/lib/node-lore/ai-lore-generator";

/**
 * MAIN WORKFLOW: Complete Location Lore Generation Pipeline
 *
 * Orchestrates the complete process:
 * 1. Validate payment and update database
 * 2. Perform reverse geocoding
 * 3. Generate AI lore content
 * 4. Update cosmetic themes
 * 5. Notify user of completion
 */
export const generateLocationLore = inngest.createFunction(
  {
    id: "generate-location-lore",
    name: "Generate Location Lore",
    concurrency: [
      {
        scope: "fn",
        limit: 5, // Max 5 total concurrent generations
      },
    ],
  },
  {
    event: "lore/generation.started",
  },
  async ({ event, step, logger }) => {
    const { nodeId, targetLevel, jobId } = event.data;

    logger.info("Starting location lore generation", {
      nodeId,
      targetLevel,
      jobId,
    });

    // Step 1: Validate and prepare job
    const jobData = await step.run("validate-and-prepare", async () => {
      // Update job status to running
      await prisma.loreGenerationJob.update({
        where: { id: jobId },
        data: {
          status: "RUNNING",
          startedAt: new Date(),
        },
      });

      // Get node and existing lore data
      const node = await prisma.node.findUnique({
        where: { id: nodeId },
        include: {
          locationLore: {
            include: {
              stakes: {
                where: { paymentStatus: "COMPLETED" },
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      });

      if (!node) {
        throw new Error(`Node not found: ${nodeId}`);
      }

      // Validate users have paid for this level
      const totalPaid =
        node.locationLore?.stakes.reduce(
          (sum, stake) => sum.plus(stake.piAmount),
          new Decimal(0)
        ) || new Decimal(0);

      const levelConfig = LORE_LEVELS[targetLevel];

      if (totalPaid.lt(levelConfig.totalRequired || levelConfig.piRequired)) {
        throw new Error(`Insufficient payment for level ${targetLevel}`);
      }

      logger.info("Job validation completed", {
        nodeId,
        totalPaid: totalPaid.toString(),
        requiredAmount: levelConfig.totalRequired || levelConfig.piRequired,
      });

      return {
        node,
        coordinates: {
          latitude: node.latitude,
          longitude: node.longitude,
        },
        existingLore: node.locationLore,
        levelConfig,
      };
    });

    // Step 2: Perform reverse geocoding
    const locationContext = await step.run("reverse-geocoding", async () => {
      logger.info("Starting reverse geocoding", {
        coordinates: jobData.coordinates,
      });

      try {
        const context = await locationIQ.reverseGeocode(
          jobData.coordinates.latitude,
          jobData.coordinates.longitude,
          {
            retries: 2,
            timeout: 15000,
            useCache: true,
          }
        );

        // Store geocoding data in job record
        await prisma.loreGenerationJob.update({
          where: { id: jobId },
          data: {
            geoData: context,
          },
        });

        logger.info("Reverse geocoding completed", {
          displayName: context.displayName,
          country: context.address.country,
          city: context.address.city,
        });

        return context;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Reverse geocoding error";
        logger.error("Reverse geocoding failed", { error: errorMessage });

        // Create fallback context
        const fallback: LocationContext = {
          coordinates: jobData.coordinates,
          address: {},
          displayName: `Location ${jobData.coordinates.latitude.toFixed(
            4
          )}, ${jobData.coordinates.longitude.toFixed(4)}`,
          importance: 0,
          extratags: {},
        };

        return fallback;
      }
    });

    // Step 3: Generate AI lore content
    const loreResult = await step.run("generate-ai-lore", async () => {
      logger.info("Starting AI lore generation", {
        targetLevel,
        provider: "auto-select",
      });

      // Prepare generation context
      const generationContext: LoreGenerationContext = {
        nodeId,
        coordinates: jobData.coordinates,
        locationContext,
        targetLevel,
        previousLore: jobData.existingLore
          ? {
              basicHistory: jobData.existingLore.basicHistory || undefined,
              culturalSignificance:
                jobData.existingLore.culturalSignificance || undefined,
              mysticInterpretation:
                jobData.existingLore.mysticInterpretation || undefined,
              epicNarrative: jobData.existingLore.epicNarrative || undefined,
            }
          : undefined,
      };

      try {
        const result = await aiLoreGenerator.generateLore(generationContext, {
          temperature: 0.8,
          maxTokens: Math.min(jobData.levelConfig.maxWords * 2, 1500),
        });

        // Store generation data in job record
        await prisma.loreGenerationJob.update({
          where: { id: jobId },
          data: {
            aiResponse: result.content,
          },
        });

        logger.info("AI lore generation completed", {
          wordCount: result.metadata.wordCount,
          aiModel: result.metadata.aiModel,
        });

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "AI lore generation failed";
        logger.error("AI lore generation failed", { error: errorMessage });
        throw error;
      }
    });

    // Step 4: Validate and store lore content
    await step.run("validate-and-store-lore", async () => {
      logger.info("Validating and storing lore content");

      // Validate content quality
      const validation = aiLoreGenerator.validateLoreQuality(
        loreResult.content,
        targetLevel,
        locationContext
      );

      if (!validation.valid) {
        logger.warn("Lore quality validation failed", {
          issues: validation.issues,
        });
        // Continue anyway but log for improvement
      }

      // Prepare lore field update
      const loreFieldName = {
        1: "basicHistory",
        2: "culturalSignificance",
        3: "mysticInterpretation",
        4: "epicNarrative",
        5: "legendaryTale",
      }[targetLevel];

      // Update or create LocationLore record
      await prisma.locationLore.upsert({
        where: { nodeId },
        create: {
          nodeId,
          country: locationContext.address.country,
          state: locationContext.address.state,
          city: locationContext.address.city,
          district: locationContext.address.district,
          address: locationContext.displayName,
          reverseGeoData: locationContext,
          [loreFieldName]: loreResult.content,
          cosmeticThemes: loreResult.cosmeticThemes,
          audioThemes: loreResult.audioThemes,
          currentLevel: Math.max(targetLevel, 1),
          totalPiStaked: jobData.existingLore?.totalPiStaked || new Decimal(0),
          generationStatus: "COMPLETED",
          lastGeneratedAt: new Date(),
        },
        update: {
          country: locationContext.address.country,
          state: locationContext.address.state,
          city: locationContext.address.city,
          district: locationContext.address.district,
          address: locationContext.displayName,
          reverseGeoData: locationContext,
          [loreFieldName]: loreResult.content,
          cosmeticThemes: loreResult.cosmeticThemes,
          audioThemes: loreResult.audioThemes,
          currentLevel: Math.max(
            targetLevel,
            jobData.existingLore?.currentLevel || 1
          ),
          generationStatus: "COMPLETED",
          lastGeneratedAt: new Date(),
          generationError: null, // Clear any previous errors
        },
      });

      logger.info("Lore content stored successfully", {
        loreLevel: targetLevel,
        contentLength: loreResult.content.length,
      });
    });

    // Step 5: Complete job and notify
    await step.run("complete-job", async () => {
      // Update job status
      await prisma.loreGenerationJob.update({
        where: { id: jobId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      logger.info("Lore generation job completed", {
        jobId,
        nodeId,
        targetLevel,
      });
    });

    // Step 6: Send completion notification and revalidate lore path
    // await step.sendEvent("send-completion-notification", [
    //   {
    //     name: "lore/generation.completed",
    //     data: {
    //       nodeId,
    //       targetLevel,
    //       userId,
    //       jobId,
    //       success: true,
    //       loreContent: loreResult.content,
    //       cosmeticThemes: loreResult.cosmeticThemes,
    //     },
    //   },
    // ]);

    return {
      success: true,
      nodeId,
      targetLevel,
      contentLength: loreResult.content.length,
      wordCount: loreResult.metadata.wordCount,
    };
  }
);
