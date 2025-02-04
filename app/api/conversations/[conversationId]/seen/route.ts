import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { pusherServer } from "@/lib/pusher";

interface IParams {
  conversationId?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<IParams> },
) {
  try {
    // Get current user and validate authentication
    const currentUser = await getCurrentUser();
    const { conversationId } = await params;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    // Fetch conversation with related data in a single query
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            seen: true,
            sender: true,
          },
        },
        users: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!conversation) {
      return new NextResponse("Invalid Id", { status: 400 });
    }

    const [lastMessage] = conversation.messages;

    if (!lastMessage) {
      return NextResponse.json(conversation);
    }

    // Optimize message update with transaction
    const [updatedMessage] = await prisma.$transaction([
      prisma.message.update({
        where: {
          id: lastMessage.id,
        },
        data: {
          seen: {
            connect: {
              id: currentUser.id,
            },
          },
        },
        include: {
          sender: true,
          seen: true,
        },
      }),
    ]);

    // Batch Pusher notifications
    const notificationPromises = [];

    // Notify about conversation update
    notificationPromises.push(
      pusherServer.trigger(currentUser.email, "conversation:update", {
        id: conversationId,
        messages: [updatedMessage],
        timestamp: new Date().toISOString(),
      }),
    );

    // Only trigger message update if user hasn't seen it
    if (lastMessage.seenIds.indexOf(currentUser.id) === -1) {
      notificationPromises.push(
        pusherServer.trigger(conversationId, "message:update", {
          ...updatedMessage,
          seenAt: new Date().toISOString(),
        }),
      );

      // Notify other participants
      conversation.users
        .filter((user) => user.id !== currentUser.id && user.email)
        .forEach((user) => {
          notificationPromises.push(
            pusherServer.trigger(user.email!, "message:seen", {
              messageId: lastMessage.id,
              seenBy: currentUser.id,
              conversationId,
            }),
          );
        });
    }

    // Wait for all notifications to be sent
    await Promise.all(notificationPromises);

    return NextResponse.json(updatedMessage);
  } catch (error: any) {
    console.error("ERROR_MESSAGE_SEEN:", error);
    return new NextResponse(`Internal Error: ${error.message}`, {
      status: 500,
    });
  }
}
