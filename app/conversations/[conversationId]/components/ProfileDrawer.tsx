import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Trash } from "lucide-react";
import useOtherUser from "@/app/hooks/useOtherUser";
import { Conversation, User } from "@prisma/client";
import Avatar from "@/components/Avatar";
import ConfirmModal from "./ConfirmModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AvatarGroup from "@/components/AvatarGroup";
import useActiveList from "@/app/hooks/useActiveList";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: Conversation & {
    users: User[];
  };
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const otherUser = useOtherUser(data);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const joinedDate = format(new Date(otherUser.createdAt), "PP");
  const title = data.name || otherUser.name;
  const { members } = useActiveList();
  const isActive = useMemo(
    () => members.includes(otherUser?.email || ""),
    [members, otherUser],
  );

  const statusText = useMemo(() => {
    if (data.isGroup) {
      return `${data.users.length} members`;
    }
    return isActive ? "Active Now" : "Offline";
  }, [data, isActive]);

  return (
    <>
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle></SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex flex-col items-center">
            {data.isGroup ? (
              <AvatarGroup users={data.users} />
            ) : (
              <Avatar user={otherUser} />
            )}

            <h2 className="mt-4 text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{statusText}</p>
          </div>
          <Separator className="my-4" />
          <div className="space-y-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Conversation
            </Button>

            {!data.isGroup && (
              <>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-sm text-muted-foreground">
                    {otherUser.email}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Joined</h3>
                  <p className="text-sm text-muted-foreground">{joinedDate}</p>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col gap-4 mt-8">
            {data.users.map((user, index) => (
              <div key={index} className="flex items-center gap-3">
                {/* Avatar or image */}
                <img
                  src={user.image || "/placeholder.png"}
                  alt={`${user.name || "User"}'s avatar`}
                  className="w-8 h-8 rounded-full"
                />
                {/* User email */}
                <div className="flex flex-col text-sm">
                  {" "}
                  <span>{user.name}</span>
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ProfileDrawer;
