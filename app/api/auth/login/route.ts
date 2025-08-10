import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { isValidAccessToken } from "@/lib/pi/platform-api-client";
import prisma from "@/lib/prisma";
// import { inngest } from "@/inngest/client";
import { authResultSchema, defaultSession } from "@/lib/schema/auth";

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

    // create user
    const newUser = await prisma.user.create({
      data: {
        accessToken: auth.accessToken,
        piId: auth.user.uid,
        username: auth.user.username,
      },
      select: { username: true, piId: true },
    });

    // send tg message of new user
    // const message = `<b>New ${siteConfig.name} User Alert!</b>

    // Welcome  ${newUser.username}
    // `;
    // await inngest.send({
    //   name: "notifications/telegram.send-message",
    //   data: {
    //     message,
    //     type: "DEV_MODE",
    //   },
    // });

    // revalidate path or tag
    revalidatePath("/");

    return Response.json(newUser);
  } catch (error) {
    console.error("[LOGIN_API]", error);
    return new NextResponse("Server Error", { status: 400 });
  }
}
