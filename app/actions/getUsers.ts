import prisma from "@/lib/prismadb";
import getSession from "./getSession";

const getUsers = async () => {
  try {
    const session = await getSession();

    // Optionally, check if the user is authenticated to ensure security
    if (!session?.user?.email) {
      return [];
    }

    // Fetch all users without filtering by the session's email
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc", // Optional: Order users by creation date
      },
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export default getUsers;
