"use client";

import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ClipLoader } from "react-spinners";

interface LoadingModalProps {
  isLoading: boolean;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ isLoading }) => {
  return (
    <Transition.Root show={isLoading} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        {/* Background Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-800 bg-opacity-60 transition-opacity" />
        </Transition.Child>

        {/* Modal Content */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
              <ClipLoader color="#4B5563" loading={isLoading} size={60} />
              <div className="mt-4 text-lg font-semibold text-gray-700">
                Please Wait...
              </div>
              <div className="mt-2 text-sm text-gray-500">
                We are processing your request. This may take a few moments.
              </div>
            </div>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  );
};

export default LoadingModal;
