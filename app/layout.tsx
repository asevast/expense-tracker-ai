import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ExpenseProvider } from "@/app/context/ExpenseContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Expense Tracker AI",
  description: "Track your expenses smartly with AI-powered insights",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ExpenseAI",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ExpenseProvider>{children}</ExpenseProvider>
      </body>
    </html>
  );
}
