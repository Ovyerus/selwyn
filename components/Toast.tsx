import close from "@iconify/icons-gg/close";
import { Icon } from "@iconify/react";
import cc from "classcat";
import React from "react";

const Toast = ({ children, className, onClose }: ToastProps) => (
  <div
    role="status"
    className={cc([
      "bg-white sm:max-w-sm w-full p-4 flex items-center leading-tight rounded-xl shadow-xl",
      className,
    ])}
  >
    <div className="w-full flex-grow">{children}</div>
    <button className="rounded-button" onClick={() => onClose()}>
      <Icon icon={close} />
    </button>
  </div>
);

export interface ToastProps {
  children: React.ReactNode;
  className?: string;
  onClose(): void;
}

export default Toast;
