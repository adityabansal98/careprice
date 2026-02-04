"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog");
  }
  return context;
}

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(open);
  
  const isControlled = onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  }, [isControlled, onOpenChange]);

  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function DialogTrigger({ children, asChild }: DialogTriggerProps) {
  const { onOpenChange } = useDialogContext();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => onOpenChange(true),
    });
  }

  return (
    <button type="button" onClick={() => onOpenChange(true)}>
      {children}
    </button>
  );
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogContent({ children, className }: DialogContentProps) {
  const { open, onOpenChange } = useDialogContext();
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      
      {/* Content */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            ref={contentRef}
            className={cn(
              "relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl",
              "animate-in fade-in-0 zoom-in-95 duration-200",
              "border border-slate-200 dark:border-slate-800",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn("px-6 pt-6 pb-4", className)}>
      {children}
    </div>
  );
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2 className={cn("text-xl font-semibold text-slate-900 dark:text-white", className)}>
      {children}
    </h2>
  );
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
  return (
    <p className={cn("text-sm text-slate-500 dark:text-slate-400 mt-1.5", className)}>
      {children}
    </p>
  );
}

interface DialogBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogBody({ children, className }: DialogBodyProps) {
  return (
    <div className={cn("px-6 pb-6", className)}>
      {children}
    </div>
  );
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div className={cn("px-6 pb-6 flex justify-end gap-3", className)}>
      {children}
    </div>
  );
}
