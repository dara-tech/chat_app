import prisma from '@/lib/prismadb'
import getCurrentUser from './getCurrentUser'

const getConversationById = async (conversationId: string): Promise<any> => {
    try {
        const currentUser: any = await getCurrentUser();
        if (!currentUser?.email) {
            return null;
        }
        const conversation: any = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                users: true
            }
        });
        return conversation;
    } catch (error) {
        console.error("Failed to fetch conversation:", error);
        return null;
    }
}
export default getConversationById;