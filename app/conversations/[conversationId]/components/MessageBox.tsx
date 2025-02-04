"use client";

import { useState, useMemo, useCallback } from "react";
import { FullMessageType } from "@/app/types";
import Avatar from "@/components/Avatar";
import clsx from "clsx";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Check } from "lucide-react";

interface MessageBoxProps {
  data: FullMessageType;
  isLast?: boolean;
}

const MessageBox: React.FC<MessageBoxProps> = ({ data, isLast }) => {
  const session = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const isOwn = session.data?.user?.email === data?.sender?.email;

  const seenList = useMemo(() => {
    if (!data.seen || data.seen.length === 0) return "";

    return data.seen
      .filter((user) => user.email !== data?.sender?.email)
      .map((user) => user.name)
      .join(", ");
  }, [data.seen, data?.sender?.email]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(data.body || "");
    setIsCopied(true);
    console.log("Copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  }, [data.body]);

  const container = clsx("flex gap-3 p-4", isOwn && "justify-end");
  const avatar = clsx(isOwn && "order-2");
  const body = clsx("flex flex-col gap-2", isOwn && "items-end");
  const message = clsx(
    "text-sm w-fit overflow-hidden",
    isOwn
      ? "bg-primary text-white dark:bg-white dark:text-black"
      : "bg-gray-100 text-black",
    data.image ? "rounded-md p-0" : "rounded-2xl py-2 px-3",
  );

  return (
    <div className={container}>
      <div className={avatar}>
        <Avatar user={data.sender} />
      </div>
      <div className={body}>
        <div className="flex items-center gap-1">
          <div className="text-sm text-muted-foreground">
            {data.sender.name}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(data.createdAt), "p")}
          </div>
        </div>
        <div className={message}>
          {data.image ? (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Image
                  alt="Message Image"
                  height={288}
                  width={288}
                  src={data.image}
                  className="object-cover cursor-pointer transition-transform duration-300 transform hover:scale-105"
                />
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogTitle>Image Preview</DialogTitle>
                <DialogDescription>
                  <Image
                    alt="Full Image"
                    height={600}
                    width={600}
                    src={data.image}
                    className="object-cover rounded-md"
                  />
                </DialogDescription>
              </DialogContent>
            </Dialog>
          ) : (
            <div>{data.body}</div>
          )}
        </div>
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isCopied ? "Copied!" : "Copy message"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {isLast && isOwn && seenList && (
          <div className="text-xs font-light text-muted-foreground flex items-center gap-2">
            {`Seen by ${seenList}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBox;
