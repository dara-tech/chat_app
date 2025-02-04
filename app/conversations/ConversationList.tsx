"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { FullConversationType } from "../types";
import { useRouter } from "next/navigation";
import useConversation from "../hooks/useConversation";
import clsx from "clsx";
import { Users, Search } from "lucide-react";
import ConversationBox from "./ConversationBox";
import GroupChatModal from "./[conversationId]/components/GroupChatModal";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/lib/pusher";
import { find, debounce } from "lodash";
import { Input } from "@/components/ui/input";

interface ConversationListProps {
  initialItems: FullConversationType[];
  users: User[];
}

const ConversationList: React.FC<ConversationListProps> = ({
  initialItems,
  users,
}) => {
  const session = useSession();
  const [items, setItems] = useState(initialItems);
  const [filteredItems, setFilteredItems] = useState(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { conversationId, isOpen } = useConversation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pusherKey = useMemo(() => {
    return session.data?.user?.email;
  }, [session.data?.user?.email]);

  const handleSearch = useCallback(
    debounce((query: string) => {
      if (!query.trim()) {
        setFilteredItems(items);
        return;
      }

      const filtered = items.filter((item) => {
        const searchStr =
          item.name?.toLowerCase() ||
          item.users
            .map((user) => user.name)
            .join(" ")
            .toLowerCase();
        return searchStr.includes(query.toLowerCase());
      });
      setFilteredItems(filtered);
    }, 300),
    [items],
  );

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    if (!pusherKey) {
      return;
    }

    setIsLoading(true);
    pusherClient.subscribe(pusherKey);

    const newHandler = (conversation: FullConversationType) => {
      setItems((current) => {
        if (find(current, { id: conversation.id })) {
          return current;
        }
        return [conversation, ...current];
      });
    };

    const updateHandler = (conversation: FullConversationType) => {
      setItems((current) =>
        current.map((currentConversation) => {
          if (currentConversation.id === conversation.id) {
            return {
              ...currentConversation,
              messages: conversation.messages,
            };
          }
          return currentConversation;
        }),
      );
    };

    const deleteHandler = (conversationId: string) => {
      setItems((current) =>
        current.filter((conv) => conv.id !== conversationId),
      );
    };

    pusherClient.bind("conversation:new", newHandler);
    pusherClient.bind("conversation:update", updateHandler);
    pusherClient.bind("conversation:delete", deleteHandler);

    setIsLoading(false);

    return () => {
      pusherClient.unsubscribe(pusherKey);
      pusherClient.unbind("conversation:new", newHandler);
      pusherClient.unbind("conversation:update", updateHandler);
      pusherClient.unbind("conversation:delete", deleteHandler);
    };
  }, [pusherKey]);

  return (
    <>
      <GroupChatModal
        users={users}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <aside
        className={clsx(
          `fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto border-muted`,
          isOpen ? "hidden" : "block w-full left-0",
        )}
      >
        <div className="px-5">
          <div className="flex justify-between mb-4 pt-4">
            <div className="text-2xl font-bold text-muted-foreground">
              Messages
            </div>
            <div
              onClick={() => setIsModalOpen(true)}
              className="rounded-full p-2 bg bg-gray-100 dark:bg-gray-900 cursor-pointer hover:opacity-75 transition"
            >
              <Users size={20} />
            </div>
          </div>
          <div className="mb-4 relative">
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No conversations found
            </div>
          ) : (
            filteredItems.map((item) => (
              <ConversationBox
                key={item.id}
                data={item}
                selected={conversationId === item.id}
              />
            ))
          )}
        </div>
      </aside>
    </>
  );
};

export default ConversationList;
