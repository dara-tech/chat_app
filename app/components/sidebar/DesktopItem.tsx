"use client";
import clsx from "clsx";
import Link from "next/link";
interface DesktopItemProps {
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  onClick?: () => void;
  active?: boolean;
}
const DesktopItem: React.FC<DesktopItemProps> = ({
  label,
  icon: Icon,
  href,
  onClick,
  active,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };
  return (
    <li className="" onClick={handleClick}>
      <Link
        href={href}
        className={clsx(
          "group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold text-muted-foreground hover:dark:bg-gray-900 hover:bg-gray-100",
          active && "bg-gray-100 text-black",
        )}
      >
        <Icon className="h-6 w-6 shrink-0" />
        <span className="sr-only">{label}</span>
      </Link>
    </li>
  );
};

export default DesktopItem;
