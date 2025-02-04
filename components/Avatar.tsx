'use client';

import { User } from '@prisma/client';
import Image from 'next/image';
import useActiveList from '@/app/hooks/useActiveList';

interface AvatarProps {
  user?: User;
}

const Avatar: React.FC<AvatarProps> = ({ user }) => {
  const { members } = useActiveList();
  const isActive = members.includes(user?.email!); // Fixed incorrect index check

  return (
    <div className="relative inline-block rounded-full overflow-visible w-9 h-9 md:w-9 md:h-9">
      <Image
        alt={user?.name ? `${user.name}'s avatar` : 'Default avatar'}
        src={user?.image || '/placeholder.png'}
        fill
        sizes="(max-width: 768px) 36px, 48px"
        priority
        className="rounded-full"
      />
      {isActive && (
        <span className="absolute top-0 right-0 w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full ring-2 ring-white" />
      )}
    </div>
  );
};

export default Avatar;
