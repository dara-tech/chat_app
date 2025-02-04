import { useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import useConversation from "./useConversation";
import { LogOut, MessageCircle, User } from "lucide-react";
import { signOut } from "next-auth/react";

const useRoutes = () => {
  const pathname = usePathname();
  const { conversationId } = useConversation();
  const routes = useMemo(
    () => [
      {
        label: "Chat",
        href: "/conversations",
        icon: MessageCircle,
        active: pathname === "/conversations" || !!conversationId,
      },
      {
        label: "Users",
        href: "/users",
        icon: User,
        active: pathname === "/users",
      },
      {
        label: "Logout",
        href: "#",
        onClick: signOut,
        icon: LogOut,
      },
    ],
    [pathname, conversationId],
  );

  return routes;
};

export default useRoutes;
