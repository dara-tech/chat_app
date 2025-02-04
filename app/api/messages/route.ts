import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from '@/lib/prismadb';
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        const body = await request.json();
        const { message, image, conversationId } = body;

        if (!currentUser?.id || !currentUser?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        if (!conversationId) {
            return new NextResponse('Conversation ID is required', { status: 400 });
        }

        if (!message && !image) {
            return new NextResponse('Message or image is required', { status: 400 });
        }

        // Verify conversation exists and user is a participant
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userIds: {
                    has: currentUser.id
                }
            }
        });

        if (!conversation) {
            return new NextResponse('Conversation not found or access denied', { status: 404 });
        }

        const newMessage = await prisma.message.create({
            data: {
                body: message || '',
                image: image || null,
                conversation: {
                    connect: {
                        id: conversationId,
                    },
                },
                sender: {
                    connect: {
                        id: currentUser.id,
                    },
                },
                seen: {
                    connect: {
                        id: currentUser.id,
                    },
                },
            },
            include: {
                seen: true,
                sender: true,
            },
        });

        const updateConversation = await prisma.conversation.update({
            where: {
                id: conversationId,
            },
            data: {
                lastMessageAt: new Date(),
                messages: {
                    connect: {
                        id: newMessage.id,
                    },
                },
            },
            include: {
                users: true,
                messages: {
                    include: {
                        seen: true,
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                },
            },
        });

        // Ensure we have users and messages before proceeding
        if (!updateConversation.users || !updateConversation.messages.length) {
            throw new Error('Failed to update conversation properly');
        }

        // Send notifications in parallel
        const notificationPromises = [];

        // Trigger new message notification
        notificationPromises.push(
            pusherServer.trigger(conversationId, 'messages:new', newMessage)
        );

        // Trigger conversation updates for all users
        updateConversation.users.forEach((user) => {
            if (user.email) {
                notificationPromises.push(
                    pusherServer.trigger(user.email, 'conversation:update', {
                        id: conversationId,
                        messages: [updateConversation.messages[0]]
                    })
                );
            }
        });

        // Wait for all notifications to be sent
        await Promise.all(notificationPromises);

        return NextResponse.json(newMessage);
    } catch (error: any) {
        console.error('ERROR_MESSAGES_POST:', error);
        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
}
