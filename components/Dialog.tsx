import { Dialog as HeadlessDialog } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

const Dialog = ({
  children,
  description,
  focusRef,
  open,
  title,
  onClose,
}: DialogProps) => (
  <AnimatePresence>
    {open && (
      <HeadlessDialog
        className="fixed z-10 inset-0 overflow-y-auto"
        initialFocus={focusRef}
        open={open}
        static
        onClose={() => onClose(false)}
      >
        <div className="flex items-center justify-center min-h-screen p-2">
          <HeadlessDialog.Overlay
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              mass: 0.1,
              damping: 10,
              stiffness: 150,
            }}
            className="fixed inset-0 bg-black"
          />

          <motion.aside
            className="p-4 mx-auto sm:max-w-md w-full bg-white dark:bg-gray-900 dark:text-white rounded-2xl z-20 shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              type: "spring",
              mass: 0.1,
              damping: 10,
              stiffness: 150,
              velocity: 10,
            }}
          >
            <header>
              <HeadlessDialog.Title className="font-bold text-2xl">
                {title}
              </HeadlessDialog.Title>
              <HeadlessDialog.Description className="font-medium text-sm">
                {description}
              </HeadlessDialog.Description>
            </header>

            {children}
          </motion.aside>
        </div>
      </HeadlessDialog>
    )}
  </AnimatePresence>
);

export interface DialogProps {
  children: React.ReactNode;
  description: string;
  focusRef?: React.MutableRefObject<any>;
  open: boolean;
  title: string;
  onClose(value: boolean): void;
}

export const styles = {
  inputs: "my-4 flex flex-col gap-2",
  footer: "flex w-full items-center justify-end gap-2",
};

export default Dialog;
