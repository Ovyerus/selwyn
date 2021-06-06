import close from "@iconify/icons-gg/close";
import { Icon } from "@iconify/react";
import cc from "classcat";
import { motion } from "framer-motion";
import React, { useEffect } from "react";

const Toast = ({ children, className, duration, onClose }: ToastProps) => {
  // TODO: useReducedMotion

  useEffect(() => {
    if (!duration) return;

    const timeout = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <motion.div
      role="status"
      className={cc([
        "bg-white dark:bg-black dark:text-white sm:max-w-sm w-full p-4 flex items-center leading-tight rounded-xl shadow-xl",
        className,
      ])}
      // Can't use percentage values here, otherwise we get a layout jump :s
      // https://github.com/framer/motion/issues/648
      initial={{ opacity: 0, x: 500 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 500 }}
      transition={{
        type: "spring",
        mass: 0.25,
        damping: 10,
        stiffness: 100,
        velocity: 2,
      }}
      layout
    >
      <div className="w-full flex-grow">{children}</div>
      <button className="rounded-button" onClick={() => onClose()}>
        <Icon icon={close} />
      </button>
    </motion.div>
  );
};

export interface ToastProps {
  children: React.ReactNode;
  className?: string;
  duration: number;
  onClose(): void;
}

export default Toast;
