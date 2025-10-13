import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { isValidAccessToken } from "@/lib/pi/platform-api-client";
import prisma from "@/lib/prisma";
import { authResultSchema, defaultSession } from "@/lib/schema/auth";
import { GENESIS_THRESHOLD, siteConfig } from "@/config/site";
import { InngestEventDispatcher } from "@/inngest/dispatcher";

// login
export async function POST(request: NextRequest) {
  const authResult = (await request.json()) as unknown;

  const parsedParam = authResultSchema.safeParse(authResult);

  if (!parsedParam.success) {
    console.error("[LOGIN_API]", "Invalid authentication params");
    return new NextResponse("Invalid authentication params", { status: 400 });
  }

  const auth = parsedParam.data;

  const validToken = await isValidAccessToken(auth.accessToken);
  if (!validToken) {
    console.error("[LOGIN_API]", "Invalid Access Token");
    return Response.json(defaultSession, { status: 400 });
  }

  try {
    // create or update user then send user created event if created
    const existingUser = await prisma.user.findUnique({
      where: { piId: auth.user.uid },
    });
    if (existingUser) {
      // update accessToken and return session
      const updatedUser = await prisma.user.update({
        where: { piId: auth.user.uid },
        data: { accessToken: auth.accessToken, username: auth.user.username },
        select: { username: true, piId: true },
      });

      // revalidate path or tag
      revalidatePath("/");

      return Response.json(updatedUser);
    }

    // create user and check if number of users === GENESIS_THRESHOLD
    //  then call the initiate genesis workflow

    const newUser = await prisma.$transaction(async (tx) => {
      // check if referral is valid
      let referrer: string | null = null;

      if (!!auth.referral && auth.referral !== auth.user.username) {
        const validRef = await tx.user.findUnique({
          where: { username: auth.referral },
          select: { id: true },
        });
        // if valid referral update referrer no of referrals and referrer
        if (validRef) {
          await tx.user.update({
            where: { id: validRef.id },
            data: { noOfReferrals: { increment: 1 } },
            select: { noOfReferrals: true },
          });
          referrer = auth.referral;
        }
      }

      // create new user
      const createdUser = await tx.user.create({
        data: {
          accessToken: auth.accessToken,
          piId: auth.user.uid,
          username: auth.user.username,
          referrer,
        },
        select: { username: true, piId: true },
      });

      const [noOfUsers, genesisPhase] = await Promise.all([
        tx.user.count(),
        tx.gamePhase.findUnique({
          where: { phaseNumber: 1, triggerType: "GENESIS" },
        }),
      ]);

      if (noOfUsers === GENESIS_THRESHOLD && !genesisPhase) {
        await InngestEventDispatcher.startGenesisPhase();
      }

      return createdUser;
    });

    // send tg message of new user
    const content = `<b>New ${siteConfig.name} User Alert!</b>

    Welcome  ${newUser.username}
    `;
    await InngestEventDispatcher.sendHeraldAnnouncement(content, "bug");

    // revalidate path or tag
    revalidatePath("/");

    return Response.json(newUser);
  } catch (error) {
    console.error("[LOGIN_API]", error);
    return new NextResponse("Server Error", { status: 400 });
  }
}
