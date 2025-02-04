import clsx from "clsx";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface InputProps {
  label: string;
  id: string;
  type?: string; // Optional to allow default type
  required?: boolean; // Correct type for required
  register: UseFormRegister<FieldValues>; // Proper type for register
  errors: FieldErrors; // Error type from react-hook-form
  disabled?: boolean;
}

const Inputs: React.FC<InputProps> = ({
  label,
  id,
  type = "text", // Default to "text" if not provided
  required = false,
  register,
  errors,
  disabled,
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium leading-6">
        {label}
      </label>
      <div className="mt-2">
        <input
          id={id}
          type={type}
          autoComplete={id}
          disabled={disabled}
          {...register(id, { required })}
          //   className="w-full bg-transparent p-2 border-2 border-gray-700 rounded-md"
          className={clsx(
            "form-input block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-none focus:ring-indigo-500 sm:text-sm bg-transparent",
            {
              "border-gray-300": !errors[id],
              "border-red-500": errors[id],
              "cursor-not-allowed opacity-50": disabled,
            },
          )}
        />
        {errors[id] && (
          <p className="mt-1 text-sm text-red-500">{`${label} is required`}</p>
        )}
      </div>
    </div>
  );
};

export default Inputs;
