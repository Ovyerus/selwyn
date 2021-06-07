import { AnimatePresence } from "framer-motion";
import React from "react";
import ReactDOM from "react-dom";
import shallow from "zustand/shallow";

import Toast from "./Toast";

import { useStore } from "~/util/store";

const Toasts = () => {
  const { toasts, popToast } = useStore(
    ({ toasts, popToast }) => ({ toasts, popToast }),
    shallow
  );

  if (typeof window === "undefined") return null;
  const container = document.getElementById("overlays-root")!;

  return ReactDOM.createPortal(
    <div className="floating-container z-50">
      <div
        role="log"
        className="items-end flex flex-col gap-4 pointer-events-auto sm:max-w-sm w-full overflow-visible"
      >
        <AnimatePresence initial={false}>
          {toasts.map(({ id, children, ...props }) => (
            <Toast key={id} onClose={() => popToast(id)} {...props}>
              {children}
            </Toast>
          ))}
        </AnimatePresence>
      </div>
    </div>,
    container
  );
};

export default Toasts;
