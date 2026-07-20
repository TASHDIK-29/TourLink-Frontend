"use client";

import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { store } from "@/redux/store";
import { AuthBootstrap } from "./AuthBootstrap";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthBootstrap />
        {children}
        <Toaster richColors position="top-center" closeButton />
      </ThemeProvider>
    </Provider>
  );
}
