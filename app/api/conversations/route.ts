import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { userId, isGroup, members, name } = body;

    // Validate user authentication
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate group chat requirements
    if (isGroup && (!members || members.length < 2 || !name)) {
      return new NextResponse(
        "Invalid group chat data. Name and at least 2 members required.",
        { status: 400 },
      );
    }

    // Handle group conversation creation
    if (isGroup) {
      // Verify all members exist
      const memberIds = members.map(
        (member: { value: string }) => member.value,
      );
      const existingMembers = await prisma.user.findMany({
        where: {
          id: {
            in: memberIds,
          },
        },
      });

      if (existingMembers.length !== memberIds.length) {
        return new NextResponse("One or more members not found", {
          status: 400,
        });
      }

      const newConversation = await prisma.conversation.create({
        data: {
          name,
          isGroup,
          users: {
            connect: [
              ...members.map((member: { value: string }) => ({
                id: member.value,
              })),
              {
                id: currentUser.id,
              },
            ],
          },
        },
        include: {
          users: true,
        },
      });

      // Notify all members about new group
      const notificationPromises = newConversation.users
        .filter((user) => user.email)
        .map((user) =>
          pusherServer.trigger(
            user.email!,
            "conversation:new",
            newConversation,
          ),
        );

      await Promise.all(notificationPromises);

      return NextResponse.json(newConversation);
    }

    // Handle direct conversation
    if (!userId) {
      return new NextResponse("User ID is required for direct conversations", {
        status: 400,
      });
    }

    // Check if user exists
    const otherUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!otherUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check for existing conversation
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            userIds: {
              hasEvery: [currentUser.id, userId],
            },
          },
          {
            isGroup: false,
          },
        ],
      },
      include: {
        users: true,
      },
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Create new direct conversation
    const newConversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [
            {
              id: currentUser.id,
            },
            {
              id: userId,
            },
          ],
        },
      },
      include: {
        users: true,
      },
    });

    // Notify both users about new conversation
    const notificationPromises = newConversation.users
      .filter((user) => user.email)
      .map((user) =>
        pusherServer.trigger(user.email!, "conversation:new", newConversation),
      );

    await Promise.all(notificationPromises);

    return NextResponse.json(newConversation);
  } catch (error: any) {
    console.error("ERROR_CONVERSATIONS:", error);
    return new NextResponse(`Internal Error: ${error.message}`, {
      status: 500,
    });
  }
}
