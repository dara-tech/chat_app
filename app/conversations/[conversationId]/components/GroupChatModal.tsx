"use client";

import Modal from "@/app/components/Modal";
import Inputs from "@/app/components/Input/Inputs";
import { User } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { FieldValues, useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import Select from "@/app/components/Input/Selects";
import { Button } from "@/components/ui/button";

interface GroupChatModalProps {
  isOpen?: boolean;
  onClose: () => void;
  users: User[];
}

const GroupChatModal: React.FC<GroupChatModalProps> = ({
  isOpen,
  onClose,
  users,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      members: [],
    },
  });

  const members = watch("members");

  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedMembers([]);
    }
  }, [isOpen, reset]);

  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async (data) => {
      if (!data.name || !data.members || data.members.length < 2) {
        toast.error("Please fill in all required fields");
        return;
      }

      try {
        setIsLoading(true);
        await axios.post("/api/conversations", {
          ...data,
          isGroup: true,
        });
        router.refresh();
        toast.success("Group created successfully!");
        onClose();
      } catch (error) {
        console.error("Error creating group:", error);
        toast.error("Failed to create group chat");
      } finally {
        setIsLoading(false);
      }
    },
    [router, onClose],
  );

  const handleMemberSelect = useCallback(
    (value: any) => {
      setSelectedMembers(value.map((v: any) => v.value));
      setValue("members", value, {
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const filteredUsers = users.filter(
    (user) => !selectedMembers.includes(user.id),
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-12">
          <div className="border-b pb-12">
            <h2 className="text-xl font-semibold leading-7 text-primary">
              Create a group chat
              <p className="text-sm text-muted-foreground font-light mt-2">
                Create a chat with more than 2 people
              </p>
            </h2>
            <div className="mt-10 flex flex-col gap-y-8 dark:">
              <Inputs
                register={register}
                label="Group Name"
                id="name"
                disabled={isLoading}
                errors={errors}
              />
              <Select
                disabled={isLoading}
                options={filteredUsers.map((user) => ({
                  value: user.id,
                  label: `${user.name} (${user.email})`,
                  image: user.image || "/placeholder.png",
                }))}
                onChange={handleMemberSelect}
                value={members}
                label="Members"
              />
              {members.length < 2 && (
                <p className="text-sm text-red-500">
                  Please select at least 2 members
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-4">
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={onClose}
            type="button"
          >
            Cancel
          </Button>
          <Button
            disabled={isLoading || members.length < 2 || !watch("name")}
            type="submit"
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Creating..." : "Create Group"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GroupChatModal;
