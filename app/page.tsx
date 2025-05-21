import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Layers, CheckSquare, Clock } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-sage-600" />
            <span className="text-xl font-semibold">
              Personal Management Board
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main>
        <section className="container px-4 py-12 md:px-6 md:py-24 lg:py-32">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Streamlined , Personalized Knowledge Management
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Optimize and personalize information suited to your needs.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/sign-up">
                  <Button size="lg" className="bg-sage-600 hover:bg-sage-700">
                    Get Started
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button size="lg" variant="outline">
                    Log in
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[350px] w-full rounded-lg border bg-background p-4 shadow-lg">
                <div className="flex h-full gap-4 overflow-x-auto pb-4">
                  <div className="flex w-72 flex-col rounded-md border bg-slate-50 p-2">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-medium">Knowledge Base</h3>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sage-100 text-xs text-sage-600">
                        3
                      </span>
                    </div>
                    {/* <div className="space-y-2">
                      <div className="rounded-md border bg-white p-3 shadow-sm">
                        <h4 className="font-medium">
                          Social Media Trends 2025
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                            Research
                          </span>
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800">
                            Social Media
                          </span>
                        </div>
                      </div>
                      <div className="rounded-md border bg-white p-3 shadow-sm">
                        <h4 className="font-medium">AI Ethics Series</h4>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                            Educational
                          </span>
                        </div>
                      </div>
                    </div>
                  */}{" "}
                  </div>
                  {/* <div className="flex w-72 flex-col rounded-md border bg-slate-50 p-2">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-medium">Research</h3>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sage-100 text-xs text-sage-600">
                        2
                      </span>
                    </div>
                    <div className="rounded-md border bg-white p-3 shadow-sm">
                      <h4 className="font-medium">
                        Climate Change Documentary
                      </h4>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                          Environment
                        </span>
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                          Educational
                        </span>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="container space-y-12 px-4 py-8 md:px-6 md:py-12 lg:py-16">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 text-center shadow-sm">
              <FileText className="h-10 w-10 text-sage-600" />
              <h3 className="text-xl font-bold">Streamlined Workflow</h3>
              <p className="text-muted-foreground">
                Visualize your content pipeline with our intuitive Kanban board
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 text-center shadow-sm">
              <Clock className="h-10 w-10 text-sage-600" />
              <h3 className="text-xl font-bold">Save Time</h3>
              <p className="text-muted-foreground">
                Keep all your research, scripts, and files organized in one
                place
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 text-center shadow-sm">
              <CheckSquare className="h-10 w-10 text-sage-600" />
              <h3 className="text-xl font-bold">Fact-Check Hub</h3>
              <p className="text-muted-foreground">
                Verify sources and maintain accuracy with integrated
                fact-checking tools
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted/40">
        <div className="container flex flex-col gap-4 py-10 md:px-6 md:py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-sage-600" />
              <span className="text-lg font-semibold">ContentBoard</span>
            </div>
            <nav className="hidden gap-4 sm:flex">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:underline"
              >
                Features
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:underline"
              >
                Pricing
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:underline"
              >
                About
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:underline"
              >
                Contact
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              © 2025 ContentBoard. All rights reserved.
            </p>
            <nav className="flex gap-4">
              <Link
                href="#"
                className="text-xs text-muted-foreground hover:underline"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-xs text-muted-foreground hover:underline"
              >
                Privacy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
