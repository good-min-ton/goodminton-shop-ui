"use client";

import { forwardRef, useId, useState } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldShellProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  admin?: boolean;
  children: (id: string) => ReactNode;
  className?: string;
}

function FieldHelper({
  error,
  hint,
  admin,
}: Readonly<{ error?: string; hint?: string; admin?: boolean }>) {
  if (error) {
    return <span className="text-[13px] text-red-400">{error}</span>;
  }
  if (hint) {
    return (
      <span
        className={cn(
          "text-[13px]",
          admin ? "text-admin-text-muted" : "text-stone-500",
        )}
      >
        {hint}
      </span>
    );
  }
  return null;
}

function FieldShell({
  label,
  required,
  error,
  hint,
  admin,
  children,
  className,
}: Readonly<FieldShellProps>) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium",
            admin ? "text-stone-200" : "text-stone-700",
          )}
        >
          {label}
          {required && <span className="ml-1 text-red-400">*</span>}
        </label>
      )}
      {children(id)}
      <FieldHelper error={error} hint={hint} admin={admin} />
    </div>
  );
}

const inputClassLight =
  "border-[1.5px] border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:border-primary-700";
const inputClassAdmin =
  "border border-admin-border bg-admin-surface-2 text-admin-text placeholder:text-admin-text-muted focus:border-primary-400 focus:bg-admin-surface-2";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  admin?: boolean;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    hint,
    admin,
    required,
    className,
    containerClassName,
    id: idProp,
    type,
    ...props
  },
  ref,
) {
  // Hiện/ẩn mật khẩu đặt ở đây chứ không ở từng trang: mọi ô mật khẩu đều đi
  // qua component này, nên chỉ cần một chỗ là cả sáu biểu mẫu cùng có.
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  // Phải đổi hẳn type: giữ type="password" thì trình duyệt vẫn che ký tự bất kể
  // CSS làm gì.
  const resolvedType = isPassword && revealed ? "text" : type;

  return (
    <FieldShell
      label={label}
      required={required}
      error={error}
      hint={hint}
      admin={admin}
      className={containerClassName}
    >
      {(autoId) => {
        const field = (
          <input
            id={idProp ?? autoId}
            ref={ref}
            type={resolvedType}
            className={cn(
              "w-full rounded-lg px-3.5 py-2.5 text-[15px] outline-none transition-colors",
              admin ? inputClassAdmin : inputClassLight,
              // Chừa chỗ cho nút, nếu không con trỏ chạy xuống dưới biểu tượng.
              isPassword && "pr-11",
              error && "!border-red-400",
              className,
            )}
            {...props}
          />
        );
        if (!isPassword) return field;
        return (
          <div className="relative">
            {field}
            {/* type="button" là bắt buộc: mặc định của button trong form là
                submit, nên thiếu nó thì bấm vào con mắt sẽ gửi luôn biểu mẫu.
                Nút vẫn nằm trong thứ tự Tab - người dùng bàn phím cũng cần bật
                tắt được, và aria-label đã đổi theo trạng thái nên không cần
                thêm nhãn nào khác. */}
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              aria-label={revealed ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              aria-pressed={revealed}
              className={cn(
                "absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg transition-colors",
                admin
                  ? "text-admin-text-muted hover:text-admin-text"
                  : "text-stone-400 hover:text-stone-700",
              )}
            >
              {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        );
      }}
    </FieldShell>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  admin?: boolean;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      error,
      hint,
      admin,
      required,
      className,
      containerClassName,
      id: idProp,
      ...props
    },
    ref,
  ) {
    return (
      <FieldShell
        label={label}
        required={required}
        error={error}
        hint={hint}
        admin={admin}
        className={containerClassName}
      >
        {(autoId) => (
          <textarea
            id={idProp ?? autoId}
            ref={ref}
            className={cn(
              "w-full resize-y rounded-lg px-3.5 py-2.5 text-[15px] outline-none transition-colors",
              admin ? inputClassAdmin : inputClassLight,
              error && "!border-red-400",
              className,
            )}
            {...props}
          />
        )}
      </FieldShell>
    );
  },
);

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  admin?: boolean;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      label,
      error,
      hint,
      admin,
      required,
      className,
      containerClassName,
      id: idProp,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <FieldShell
        label={label}
        required={required}
        error={error}
        hint={hint}
        admin={admin}
        className={containerClassName}
      >
        {(autoId) => (
          <select
            id={idProp ?? autoId}
            ref={ref}
            className={cn(
              "w-full rounded-lg px-3 py-2.5 text-[15px] outline-none transition-colors",
              admin ? inputClassAdmin : inputClassLight,
              error && "!border-red-400",
              className,
            )}
            {...props}
          >
            {children}
          </select>
        )}
      </FieldShell>
    );
  },
);
