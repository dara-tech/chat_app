import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { pusherServer } from "@/lib/pusher";

interface IParams {
  conversationId?: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: IParams },
) {
  try {
    const { conversationId } = params;
    const currentUser = await getCurrentUser();

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    // Fetch conversation with users in a single query
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
        userIds: {
          has: currentUser.id, // Verify user is participant
        },
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
          },
        },
        messages: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingConversation) {
      return new NextResponse("Conversation not found or access denied", {
        status: 404,
      });
    }

    // Delete conversation and all related messages in a transaction
    const [deletedMessages, deletedConversation] = await prisma.$transaction([
      // Delete all messages first
      prisma.message.deleteMany({
        where: {
          conversationId,
        },
      }),
      // Then delete the conversation
      prisma.conversation.delete({
        where: {
          id: conversationId,
        },
        include: {
          users: true,
        },
      }),
    ]);

    // Notify all participants about deletion
    const notificationPromises = existingConversation.users
      .filter((user) => user.email)
      .map((user) =>
        pusherServer.trigger(
          user.email!,
          "conversation:delete",
          conversationId,
        ),
      );

    await Promise.all(notificationPromises);

    return NextResponse.json({
      deletedConversation,
      messagesDeleted: deletedMessages.count,
    });
  } catch (error: any) {
    console.error("ERROR_CONVERSATION_DELETE:", error);
    return new NextResponse(`Internal Error: ${error.message}`, {
      status: 500,
    });
  }
}
