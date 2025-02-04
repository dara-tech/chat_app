"use client";

import { useEffect, useRef } from "react";
import { Channel, Members } from "pusher-js";
import { pusherClient } from "@/lib/pusher";
import useActiveList from "./useActiveList";

const useActiveChannel = () => {
  const { set, add, remove } = useActiveList();
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!channelRef.current) {
      channelRef.current = pusherClient.subscribe("presence-messenger");
    }

    const channel = channelRef.current;

    channel.bind("pusher:subscription_succeeded", (members: Members) => {
      const initialMembers: string[] = [];
      members.each((member: Record<string, any>) =>
        initialMembers.push(member.id),
      );
      set(initialMembers);
    });

    channel.bind("pusher:member_added", (member: Record<string, any>) => {
      add(member.id);
    });

    channel.bind("pusher:member_removed", (member: Record<string, any>) => {
      remove(member.id);
    });

    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        pusherClient.unsubscribe("presence-messenger");
        channelRef.current = null;
      }
    };
  }, [set, add, remove]); // Removed `activeChannel` dependency

  return null;
};

export default useActiveChannel;
