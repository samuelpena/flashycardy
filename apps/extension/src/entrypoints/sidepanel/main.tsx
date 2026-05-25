import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ExtensionApp } from "@/app/extension-app";
import "@/styles/app.css";

document.documentElement.classList.add("dark");

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <ExtensionApp />
  </StrictMode>,
);
