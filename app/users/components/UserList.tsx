"use client";

import { User } from "@prisma/client";
import UserBox from "./UserBox";
import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface UserListProps {
  items: User[];
}

const UserList: React.FC<UserListProps> = ({ items }) => {
  const session = useSession();
  const currentUserEmail = session?.data?.user?.email;
  const [searchQuery, setSearchQuery] = useState<string>(""); // Explicitly type as string
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredUsers = useMemo(() => {
    return items
      .filter((item) => item.email !== currentUserEmail)
      .filter(
        (item) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
  }, [items, currentUserEmail, searchQuery]);

  if (isLoading) {
    return (
      <aside className="fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto w-full left-0">
        <div className="px-5">
          <div className="flex-col">
            <div className="text-2xl font-bold text-muted-foreground py-4">
              People
            </div>
            <Input placeholder="Search users..." className="mb-4" disabled />
          </div>
          {[1, 2, 3, 4, 5].map((_, i) => (
            <Skeleton key={i} className="w-full h-16 mb-2 rounded-lg" />
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto w-full left-0">
      <div className="px-5">
        <div className="flex-col">
          <div className="text-2xl font-bold text-muted-foreground py-4">
            People
          </div>
          <Input
            placeholder="Search users..."
            defaultValue="" // Use defaultValue instead of value for uncontrolled input
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
        </div>
        {filteredUsers.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">
            No users found
          </div>
        ) : (
          filteredUsers.map((item) => <UserBox key={item.id} data={item} />)
        )}
      </div>
    </aside>
  );
};

export default UserList;
