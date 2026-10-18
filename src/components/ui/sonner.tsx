import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      theme="dark"
      richColors
      toastOptions={{
        classNames: {
          toast: "border border-border bg-popover text-popover-foreground shadow-lg",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}
