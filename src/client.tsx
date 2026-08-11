import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";

const router = getRouter();

const target = document.getElementById("root") || document.body;

createRoot(target).render(<RouterProvider router={router} />);
