"use client";

import useConversation from "@/app/hooks/useConversation";
import axios from "axios";
import { Image } from "lucide-react";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import MessageInput from "./MessageInput";
import { CldUploadButton } from "next-cloudinary";

const Form = () => {
  const { conversationId } = useConversation();
  const formOptions = { defaultValues: { message: "" } };
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>(formOptions);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setValue("message", "", { shouldValidate: true });
    axios.post("/api/messages", {
      ...data,
      conversationId,
    });
  };

  const handleUploadSuccess = (result: any) => {
    // Handle the image URL after a successful upload
    axios.post("/api/messages", {
      image: result?.info?.secure_url,
      conversationId,
    });
  };

  return (
    <div className="py-4 px-4 border-t flex items-center gap-2 lg:gap-4 w-full ">
      <CldUploadButton
        options={{ maxFiles: 1 }}
        onSuccess={handleUploadSuccess} // Use onSuccess instead of onUpload
        uploadPreset="upload_pre"
      >
        <Image
          size={30}
          className="text-muted-foreground hover:opacity-20 cursor-pointer"
        />
      </CldUploadButton>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-center gap-2 lg:gap-4 w-full"
      >
        <MessageInput
          id="message"
          register={register}
          errors={errors}
          required
          placeholder="Aa"
        />
      </form>
    </div>
  );
};

export default Form;
