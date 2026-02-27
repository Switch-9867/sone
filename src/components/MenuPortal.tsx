import { createPortal } from "react-dom";
import type { ReactNode } from "react";

export default function MenuPortal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}
