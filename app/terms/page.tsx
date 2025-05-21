import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | ContentBoard",
  description:
    "Terms of Service for ContentBoard - Understanding our terms of use",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-3xl font-bold">Terms of Service</h1>
          <div className="prose prose-neutral dark:prose-invert">
            {/* Add your terms of service content here */}
            <p>Last updated: 5/21/2025</p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By using Progress-Tracker, you agree to these Terms of Service.
              This app is intended strictly for personal, non-commercial use.
            </p>

            <h2>2. Eligibility</h2>
            <p>You must be at least 13 years old to use this app.</p>

            <h2>3. License</h2>
            <p>
              We grant you a limited, non-exclusive license to use the app for
              personal purposes.
            </p>

            <h2>4. Prohibited Uses</h2>
            <p>
              You agree not to: Use the app for commercial purposes.
              Reverse-engineer, modify, or exploit the app. Violate laws or
              infringe others’ rights.
            </p>

            <h2>5. Limitation of Liability</h2>
            <p>
              No Warranty: The app is provided “as is” without guarantees of
              reliability. Limitation of Liability: We are not liable for
              damages arising from app use.
            </p>

            <h2>6. Changes to Terms</h2>
            <p>Terms modification policy goes here...</p>
            <h2>Termination</h2>
            <p>
              We reserve the right to suspend or terminate access for violations
              of these terms.
            </p>
            <h2>8. Contact Information</h2>
            <p>Adam Gordon adamgordon119@gmail.com</p>
          </div>
        </div>
      </main>
    </div>
  );
}
