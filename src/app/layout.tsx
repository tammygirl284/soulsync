// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "SoulSync",
  description: "The control room for Anne, running on Pinocchio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar />
        <main style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px 36px 48px",
          background: "#fafafa",
        }}>
          {children}
        </main>
      </body>
    </html>
  );
}
