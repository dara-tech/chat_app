"use client";
import ReactSelect, { MultiValue, ActionMeta } from "react-select";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
  image?: string;
}

interface SelectProps {
  label: string;
  value?: MultiValue<SelectOption>;
  onChange: (
    newValue: MultiValue<SelectOption>,
    actionMeta: ActionMeta<SelectOption>,
  ) => void;
  options: SelectOption[];
  disabled?: boolean;
  required?: boolean;
  error?: string;
  placeholder?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  isLoading?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  disabled,
  required,
  error,
  placeholder = "Select...",
  isSearchable = true,
  isClearable = false,
  isLoading = false,
  className,
}) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const customStyles = {
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? theme === "dark"
          ? "#2563eb"
          : "#3b82f6"
        : state.isFocused
          ? theme === "dark"
            ? "#1e3a8a"
            : "#bfdbfe"
          : "transparent",
      color: state.isSelected ? "white" : theme === "dark" ? "white" : "black",
      ":active": {
        backgroundColor: theme === "dark" ? "#1e3a8a" : "#bfdbfe",
      },
    }),
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: theme === "dark" ? "#1f2937" : "white",
      borderColor: error
        ? "rgb(239, 68, 68)"
        : state.isFocused
          ? theme === "dark"
            ? "#2563eb"
            : "#3b82f6"
          : theme === "dark"
            ? "#374151"
            : "#e5e7eb",
      boxShadow: error
        ? "0 0 0 1px rgb(239, 68, 68)"
        : state.isFocused
          ? theme === "dark"
            ? "0 0 0 1px #2563eb"
            : "0 0 0 1px #3b82f6"
          : "none",
      "&:hover": {
        borderColor: error
          ? "rgb(239, 68, 68)"
          : theme === "dark"
            ? "#2563eb"
            : "#3b82f6",
      },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: theme === "dark" ? "#1f2937" : "white",
      border: `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}`,
      boxShadow:
        theme === "dark"
          ? "0 4px 6px -1px rgba(0, 0, 0, 0.5)"
          : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: theme === "dark" ? "#374151" : "#e5e7eb",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: theme === "dark" ? "white" : "black",
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: theme === "dark" ? "white" : "black",
      ":hover": {
        backgroundColor: theme === "dark" ? "#4b5563" : "#d1d5db",
        color: theme === "dark" ? "white" : "black",
      },
    }),
  };

  return (
    <div className={cn("z-[100]", className)}>
      <label className="block text-sm font-medium leading-6 text-primary">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <div className="mt-2">
        <ReactSelect
          isDisabled={disabled}
          value={value}
          onChange={onChange}
          isMulti
          options={options}
          menuPortalTarget={document.body}
          isSearchable={isSearchable}
          isClearable={isClearable}
          isLoading={isLoading}
          placeholder={placeholder}
          noOptionsMessage={() => "No options available"}
          styles={customStyles}
          formatOptionLabel={(option: SelectOption) => (
            <div className="flex items-center gap-2">
              {option.image && (
                <img
                  src={option.image}
                  alt={option.label}
                  className="w-6 h-6 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.png";
                  }}
                />
              )}
              <span className="truncate">{option.label}</span>
            </div>
          )}
          classNames={{
            control: () => "text-lg",
            placeholder: () => "text-muted-foreground",
            input: () => "text-foreground",
            option: () => "hover:cursor-pointer",
          }}
        />
      </div>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default Select;
