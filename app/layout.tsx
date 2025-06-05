import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/footer";
import { PostureReminderUI } from "@/components/posture-reminder/posture-reminder-ui";
import { PostureNotification } from "@/components/posture-reminder/posture-notification";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Content Dashboard",
  description: "Kanban-style dashboard for content creators",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Footer />
            <Toaster />
            <PostureReminderUI />
            <PostureNotification />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
