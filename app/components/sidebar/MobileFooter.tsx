'use client'

import useConversation from "@/app/hooks/useConversation";
import useRoutes from "@/app/hooks/useRoutes"
import MobileItem from "./MobileItem";

const MobileFooter = () => {
    const routes = useRoutes();
    const {isOpen} = useConversation();
    if (isOpen) {
        return null; 
    }
    return (
        <div className="fixed justify-between w-full bottom-0 z-40 items-center bg-white dark:bg-black border-[1px] flex lg:hidden p-2">
            {routes.map((route) => (
                <MobileItem
                    key={route.href}
                    href={route.href}
                    active={route.active ?? false} // Ensuring active is always a boolean
                    icon={route.icon}
                    onClick={route.onClick}
                />
            ))}
        </div>
    );
}

export default MobileFooter
