import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, isToday, isYesterday } from 'date-fns';
import { useSession } from 'next-auth/react';
import clsx from 'clsx';

import { FullConversationType } from '../types';
import useOtherUser from '../hooks/useOtherUser';
import Avatar from '@/components/Avatar';
import AvatarGroup from '@/components/AvatarGroup';
import { Badge } from '@/components/ui/badge';

interface ConversationBoxProps {
  data: FullConversationType;
  selected?: boolean;
}

const ConversationBox: React.FC<ConversationBoxProps> = ({ data, selected }) => {
  const otherUser = useOtherUser(data);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [seen, setSeen] = useState<string[]>([]); // Added to store seen users

  const handleClick = useCallback(() => {
    router.push(`/conversations/${data.id}`);
  }, [data.id, router]);

  const lastMessage = useMemo(() => {
    const messages = data.messages || [];
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }, [data.messages]);

  const userEmail = useMemo(() => session?.user?.email || null, [session?.user?.email]);

  const hasSeen = useMemo(() => {
    if (!lastMessage || !userEmail) return false;
    const seenArray = lastMessage.seen || [];
    return seenArray.some((user) => user.email === userEmail);
  }, [lastMessage, userEmail]);

  useEffect(() => {
    const calculateUnreadMessages = () => {
      if (!userEmail || !data.messages) return;
      const count = data.messages.filter(message => 
        !message.seen.some(user => user.email === userEmail)
      ).length;
      setUnreadCount(count);
    };
    calculateUnreadMessages();
  }, [data.messages, userEmail]);

  useEffect(() => {
    const updateSeen = () => {
      if (!lastMessage || !userEmail) return;
      const seenArray = lastMessage.seen || [];
      const seenEmails = seenArray.map(user => user.email).filter(email => email !== null);
      setSeen(seenEmails);
    };
    updateSeen();
  }, [lastMessage, userEmail]);

  const formatMessageDate = useCallback((date: Date) => {
    if (isToday(date)) {
      return format(date, 'p');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  }, []);

  const lastMessageText = useMemo(() => {
    if (lastMessage?.image) return '📷 Photo';
    if (lastMessage?.body) {
      const maxLength = 30;
      return lastMessage.body.length > maxLength 
        ? `${lastMessage.body.substring(0, maxLength)}...`
        : lastMessage.body;
    }
    return 'Started a conversation';
  }, [lastMessage]);

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={clsx(
        'w-full relative flex items-center space-x-3 rounded-lg cursor-pointer p-3',
        'transform transition-all duration-300 ease-in-out hover:shadow-sm',
        selected ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-transparent',
        isHovered && !selected && 'bg-gray-50 dark:bg-gray-900 scale-[1.02]'
      )}
    >
      <div className="relative">
        {data.isGroup ? (
          <AvatarGroup users={data.users} />
        ) : ( 
          <Avatar user={otherUser || { 
            name: 'Unknown User', 
            email: '', 
            id: '', 
            createdAt: new Date(), 
            emailVerified: null, 
            image: null, 
            hashedPassword: null, 
            updatedAt: new Date(), 
            conversationIds: [], 
            seenMessageIds: [] 
          }} />
        )}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 px-2 min-w-[20px] h-5 flex items-center justify-center"
          >
            {unreadCount}
          </Badge>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="focus:outline-none">
          <div className="flex justify-between items-center mb-1">
            <p className="text-md font-bold text-primary truncate transition-colors duration-200">
              {data.name || otherUser?.name || 'Unknown User'}
            </p>
            {lastMessage?.createdAt && (
              <p className="text-xs text-muted-foreground font-light">
                {formatMessageDate(new Date(lastMessage.createdAt))}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!hasSeen && (
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            )}
            <p className={clsx(
              'truncate text-sm transition-colors duration-200',
              hasSeen ? 'text-muted-foreground' : 'font-semibold text-primary'
            )}>
              {lastMessageText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationBox;