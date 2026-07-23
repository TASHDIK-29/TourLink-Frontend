"use client";

import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { store } from "@/redux/store";
import { AuthBootstrap } from "./AuthBootstrap";
import { SmoothScroll } from "./SmoothScroll";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthBootstrap />
        <SmoothScroll>{children}</SmoothScroll>
        <Toaster richColors position="top-center" closeButton />
      </ThemeProvider>
    </Provider>
  );
}
