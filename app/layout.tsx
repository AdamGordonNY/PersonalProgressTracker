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
import { FloatingDock } from "@/components/ui/floating-dock";
import { getUserWithData } from "@/actions/user";
import { auth } from "@clerk/nextjs/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { appRoutes } from "@/lib/utils";
import { DockProvider } from "@/context/dock-context";
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
  // Convert icon from component type to ReactNode (element)

  const { userId } = await auth();
  const routes = appRoutes.map((route) => ({
    ...route,
    icon: route.icon ? <route.icon /> : null,
  }));
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
            <DockProvider items={routes}>
              {" "}
              <div className="flex min-h-screen bg-muted/20">
                {/* Only show sidebar when user is authenticated */}
                {userId && <Sidebar />}
                <div className="flex flex-1 flex-col">{children} </div>
              </div>
              {/* <div className="flex items-center justify-center h-[35rem] w-full"></div> */}
              <Footer />
              <Toaster />
              <FloatingWidgets />
            </DockProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
