"use client";

import clsx from "clsx";
import Link from "next/link";

interface MobileItemsProps {
  href: string;
  icon: React.ComponentType<any>;
  active: boolean;
  onClick?: () => void;
}

const MobileItem: React.FC<MobileItemsProps> = ({
  href,
  icon: Icon,
  active,
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      return onClick();
    }
  };
  return (
    <Link
      onClick={onClick}
      href={href}
      className={clsx(
        "group flex gap-x-3 text-sm leading-6 font-semibold w-full justify-center p-2 text-muted-foreground hover:bg-gray-100 hover:dark:bg-gray-900 ",
        active && "bg-gray-100 dark:bg-gray-900 text-black",
      )}
    >
      <Icon className="h-6 w-6" />
    </Link>
  );
};

export default MobileItem;
