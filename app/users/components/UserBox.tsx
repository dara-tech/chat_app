'use client'

import LoadingModal from "@/app/components/LoadingModal"
import Avatar from "@/components/Avatar"
import { User } from "@prisma/client"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"

interface UserBoxProps {
    data: User
}

const UserBox: React.FC<UserBoxProps> = ({ data }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false)

    const handleClick = useCallback(() => {
        setIsLoading(true);
        axios.post('/api/conversations', {
            userId: data.id
        })
        .then((response) => {
            router.push(`/conversations/${response.data.id}`)
        })
        .finally(() => setIsLoading(false))
    }, [data, router])

    return (
        <>
            <LoadingModal isLoading={isLoading} />
            <div
                onClick={handleClick}
                className="w-full relative flex items-center space-x-3 p-3 hover:bg-gray-100 hover:dark:bg-gray-900 rounded-lg transition cursor-pointer"
            >
                <Avatar user={data} />
                <div className="min-w-0 flex-1">
                    <div className="focus:outline-none">
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-normal font-semibold dark:text-muted-foreground">{data.name}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UserBox
