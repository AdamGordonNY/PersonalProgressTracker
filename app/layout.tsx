import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/footer";
import { PostureReminderUI } from "@/components/posture-reminder/posture-reminder-ui";
import { PostureNotification } from "@/components/posture-reminder/posture-notification";
import { FloatingWidgets } from "@/components/floating-widgets/floating-widgets";

import { getUserWithData } from "@/actions/user";
import { auth } from "@clerk/nextjs/server";
import { Sidebar } from "@/components/dashboard/sidebar";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Personal Metric Tracker",
  description: "A Multi-Purpose Personal Metric Tracker",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  const { userId } = await auth();
  if (!userId) {
    user = null;
  } else {
    user = await getUserWithData({ userId: userId! });
  }
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
            {" "}
            <div className="flex min-h-screen bg-muted/20">
              {/* Only show sidebar when user is authenticated */}
              {userId && <Sidebar />}
              <div className="flex flex-1 flex-col">{children}</div>
            </div>
            <Footer />
            <Toaster />
            <FloatingWidgets />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
