import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast !bg-[#1c1c1c] !text-white !border !border-white/15 !shadow-2xl font-sans rounded-xl p-4",
          title: "!text-white font-medium text-sm",
          description: "!text-stone-300 text-xs mt-1",
          actionButton:
            "!bg-white !text-black font-semibold text-xs rounded-lg px-3 py-1.5",
          cancelButton:
            "!bg-[#2a2a2a] !text-stone-300 text-xs rounded-lg px-3 py-1.5",
          error: "!bg-[#281114] !border-red-500/40 !text-red-200",
          success: "!bg-[#112417] !border-emerald-500/40 !text-emerald-200",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
