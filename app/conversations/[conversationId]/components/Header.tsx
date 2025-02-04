"use client";

import useOtherUser from "@/app/hooks/useOtherUser";
import Avatar from "@/components/Avatar";
import { Conversation, User } from "@prisma/client";
import { ChevronLeft, Info } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import ProfileDrawer from "./ProfileDrawer";
import AvatarGroup from "@/components/AvatarGroup";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useActiveList from "@/app/hooks/useActiveList";

interface HeaderProps {
  conversation: Conversation & {
    users: User[];
  };
}

const Header: React.FC<HeaderProps> = ({ conversation }) => {
  const otherUser = useOtherUser(conversation);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { members } = useActiveList();
  const isActive = useMemo(
    () => members.includes(otherUser?.email || ""),
    [members, otherUser],
  );

  const statusText = useMemo(() => {
    if (conversation.isGroup) {
      return `${conversation.users.length} members`;
    }
    return isActive ? "Active Now" : "Offline";
  }, [conversation, isActive]);

  return (
    <>
      <ProfileDrawer
        data={conversation}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <div className="w-full border-b-[1px] sm:px-4 py-3 px-4 lg:px-6 flex justify-between items-center shadow-sm bg-background">
        <div className="flex gap-3 items-center">
          <Link
            href="/conversations"
            className="lg:hidden block hover:opacity-75 transition"
          >
            <ChevronLeft size={32} />
          </Link>

          {conversation.isGroup ? (
            <AvatarGroup users={conversation.users} />
          ) : (
            <Avatar user={otherUser} />
          )}

          <div className="flex flex-col">
            <div className="font-bold text-lg">
              {conversation.name || otherUser.name}
            </div>
            <div className="text-sm font-light text-muted-foreground">
              {statusText}
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info
                  size={24}
                  onClick={() => setDrawerOpen(true)}
                  className="text-muted-foreground hover:text-primary cursor-pointer transition"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Conversation Info</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </>
  );
};

export default Header;
