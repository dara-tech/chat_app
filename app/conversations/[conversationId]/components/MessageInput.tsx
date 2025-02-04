'use client';

import { Send } from 'lucide-react';
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MessageInputProps {
    placeholder?: string;
    id: string;
    type?: string;
    required?: boolean;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
}

const MessageInput: React.FC<MessageInputProps> = ({
    placeholder,
    id,
    type = "text",
    required = false,
    register,
    errors,
}) => {
    return (
        <div className="relative w-full flex items-center space-x-2">
            <Input
                id={id}
                type={type}
                autoComplete={id}
                {...register(id, { required })}
                placeholder={placeholder}
                className="flex-grow"
            />
            <Button type="submit" size="icon" className="rounded-full">
                <Send className="h-4 w-4" />
            </Button>
        </div>
    );
};

export default MessageInput;
