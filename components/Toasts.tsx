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

  // TODO: timeouts to auto-remove, and transitions.
  return ReactDOM.createPortal(
    <div className="fixed w-screen h-screen top-0 left-0 p-3 flex items-end justify-end pointer-events-none">
      <div
        role="log"
        className="w-full items-end flex flex-col gap-4 pointer-events-auto"
      >
        {toasts.map(({ id, className, children }) => (
          <Toast key={id} className={className} onClose={() => popToast(id)}>
            {children}
          </Toast>
        ))}
      </div>
    </div>,
    container
  );
};

export default Toasts;
