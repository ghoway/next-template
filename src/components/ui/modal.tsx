"use client";

import { ReactNode, useEffect } from "react";

import { cn } from "@/lib/utils";

type ModalProps = {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  icon?: ReactNode;
  closeOnEsc?: boolean;
};

export function Modal({
  title,
  description,
  open,
  onClose,
  footer,
  children,
  className,
  icon,
  closeOnEsc = true,
}: ModalProps) {
  useEffect(() => {
    if (!open || !closeOnEsc) return;

    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, closeOnEsc, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <button
        aria-label="Close modal"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900",
          className,
        )}
      >
        {icon ? (
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300">
            {icon}
          </div>
        ) : null}
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
        {footer ? <div className="mt-6 flex gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}
