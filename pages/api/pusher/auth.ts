import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { pusherServer } from "@/lib/pusher";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  // Allow only POST requests
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Get session
    const session = await getServerSession(request, response, authOptions);
    if (!session?.user?.email) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    // Validate request body
    const { socket_id, channel_name } = request.body;
    if (!socket_id || !channel_name) {
      return response.status(400).json({ error: "Bad Request" });
    }

    // Authorize the Pusher channel
    const authResponse = await pusherServer.authorizeChannel(
      socket_id,
      channel_name,
      {
        user_id: session.user.email,
      },
    );

    return response.json(authResponse);
  } catch (error) {
    console.error("Pusher Auth Error:", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
}
