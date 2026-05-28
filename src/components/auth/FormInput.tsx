import type { ChangeEvent } from "react";

interface FormInputProps {
  label: string;
  type?: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
}

const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  autoComplete,
  disabled = false,
}: FormInputProps) => {
  return (
    <div className="mb-5">
      <label
        htmlFor={name}
        className="block text-[13px] font-medium text-[#aaa] mb-2"
      >
        {label}
        {required && <span className="text-gold ml-1">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-md
          bg-surface-2 border
          ${error ? "border-red-500/50" : "border-border-subtle"}
          text-[14px] text-linen
          placeholder:text-[#555]
          focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
          transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      />
      {error && (
        <p className="mt-2 text-[12px] text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
