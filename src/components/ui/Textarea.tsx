import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  variant?: "default" | "underline";
  className?: string;
}

export function Textarea({
  label,
  error,
  variant = "default",
  className,
  id,
  ...props
}: TextareaProps) {
  const inputId = id || props.name;
  const isUnderline = variant === "underline";

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-salon-brown mb-2"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "w-full text-salon-brown bg-transparent placeholder-salon-brown-muted/60 min-h-[100px] resize-y",
          "focus:outline-none transition-all duration-200",
          isUnderline
            ? "px-0 py-3 border-0 border-b-2 border-salon-cream-border focus:border-salon-gold"
            : "px-6 py-4 bg-salon-cream/50 border border-salon-cream-border rounded-2xl focus:ring-2 focus:ring-salon-gold/50 focus:border-transparent",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}
