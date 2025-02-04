'use client'

import Modal from "@/app/components/Modal";
import useConversation from "@/app/hooks/useConversation";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@headlessui/react";
import axios from "axios";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

interface ConfirmModalProps {
    isOpen?: boolean;
    onClose: () => void;
}
const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose
}) => {
    const router = useRouter();
    const {conversationId} = useConversation();
    const [isLoading, setIsLoading] = useState(false);
    const onDelete = useCallback(()=>{
        setIsLoading(true);
        axios.delete(`/api/conversations/${conversationId}`).then(()=>{
            onClose();
            router.push('/conversations')
            router.refresh();

        })
        .catch (()=> toast.error('Something went wrong'))
        .finally(()=>setIsLoading(false));


    },[conversationId,router,onClose])
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
        <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 items-center rounded-full bg-gray-100 dark:bg-gray-900 sm:mx-0 sm:h-10 sm:w-10 justify-center">
                <AlertTriangle className="h-6 w-6 text-red-800"/>
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <DialogTitle as='h3'className='text-base font-semibold leading-6 text-mute-foreground' >
                    Delete Conversations
                </DialogTitle>
                <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Are you sure you want to delete this conversation? This action connot be undone.</p>
                </div>
            </div>

        </div>
        <div className="gap-2 mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Button 
            className="bg-red-800"
            disabled={isLoading} 
            onClick={onDelete} >Delete</Button>
            <Button 
            className="bg-blue-800"
            disabled={isLoading} 
            onClick={onClose} >Cancel</Button>
        </div>

    </Modal>
  )
}

export default ConfirmModal
