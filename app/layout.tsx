import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { ToastProvider } from "./components/Toast";

export const metadata: Metadata = {
  title: "API Flow",
  description: "High-performance visual API orchestration and automation canvas inspired by GolfSpace.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
