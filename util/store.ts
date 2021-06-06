import React from "react";
import create from "zustand";
import { devtools } from "zustand/middleware";

import { hashString } from ".";

interface State {
  toasts: Toast[];
  pushToast(toast: Omit<Toast, "id">): void;
  popToast(id: string): void;
}

interface Toast {
  id: string;
  duration: number;
  children: React.ReactNode;
  className?: string;
}

// TODO: maybe use a Map instead of a list
export const useStore = create<State>(
  devtools((set) => ({
    toasts: [],
    pushToast: (toast) =>
      set((state) => ({
        toasts: [
          ...state.toasts,
          { ...toast, id: hashString(Date.now().toString()) },
        ],
      })),
    popToast: (id) =>
      set((state) => ({ toasts: state.toasts.filter((x) => x.id !== id) })),
  }))
);
