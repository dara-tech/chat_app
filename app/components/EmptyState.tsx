'use client';
import React from 'react';

const EmptyState = () => {
    return (
        <div className="px-4 py-10 sm:px-6 lg:px-8 h-screen flex justify-center items-center bg-white dark:bg-black border-l-[1px]">
            <div className="text-center items-center flex flex-col ">
                <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100 ">
                    Select a chat or start a new conversation
                </div>
            </div>
        </div>
    )
}

export default EmptyState;