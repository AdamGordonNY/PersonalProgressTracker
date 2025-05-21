import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ContentBoard",
  description:
    "Privacy Policy for ContentBoard - Learn how we protect your data",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-3xl font-bold">Privacy Policy</h1>
          <div className="prose prose-neutral dark:prose-invert">
            {/* Add your privacy policy content here */}
            <p>Last updated: 5/21/2025</p>
            <h2>1. Introduction</h2>
            <p>
              Progress-Tracker created by Adam Gordon (adamgordon119@gmail.com),
              is a personal-use application designed for customizing and
              organizing information in order to achieve personal goals,
              strategize, and organize your life. This Privacy Policy explains
              how we handle your information. By using our app, you agree to
              this policy.
            </p>
            <h2>2. Information We Collect</h2>
            <p>
              <ul>
                <li>
                  Account Information:If you sign in via Google OAuth, we
                  collect your email address and basic profile data (name,
                  profile picture) to authenticate your account via Clerk. Oauth
                  Tokens are saved to the database to allow for easy access to
                  your Google Drive and MS OneDrive accounts.
                </li>
                <li>
                  {" "}
                  Usage Data: No data is collected by Adam Gordon, Clerk may
                  collect data for the purpose of authentication and account
                  management.
                </li>
                <li>
                  {" "}
                  User Content: Any information you input into the app, is
                  visible to you only. Access tokens are stored in order to
                  facilitate Google Drive and MS OneDrive access.
                </li>
              </ul>{" "}
            </p>
            <h2>3. How We Use Your Information</h2>
            <p>
              <ul>
                <li>To authenticate and personalize your experience.</li>
                <li>To provide and maintain app functionality.</li>
                <li>To respond to support requests.</li>
              </ul>
            </p>
            <h2>4. Data Protection</h2>
            <p>
              <ul>
                <li>
                  No Third-Party Sharing: We do not sell, rent, or share your
                  personal data with third parties for commercial purposes.
                </li>
                <li>
                  Service Providers: We use trusted third-party services (e.g.,
                  Google OAuth, hosting providers) solely to operate the app.
                  These providers are bound by confidentiality agreements.
                </li>
                <li>
                  Legal Compliance: We may disclose data if required by law.
                </li>
              </ul>
            </p>
            <h2>5. Data Security</h2>
            <p>
              We implement industry-standard measures (e.g., encryption, access
              controls) to protect your data.
            </p>
            <h2>6. Your Rights</h2>
            <p>
              <ul>
                <li>
                  {" "}
                  Access/Delete Data: You can request access to or deletion of
                  your data by contacting us at adamgordon119@gmail.com
                </li>
                <li>
                  Opt-Out: Delete your account through the Clerk portal to stop
                  data collection and remove your information from the database
                </li>
              </ul>
            </p>
            <h2>7. Children’s Privacy</h2>
            <p>
              Our app is not intended for users under 13. We do not knowingly
              collect data from children.
            </p>
            <h2>Changes to This Policy</h2>{" "}
            <p>
              {" "}
              We may update this policy. Continued use of the app constitutes
              acceptance of changes.
            </p>
            <h2>Contact Us</h2>
            <p>
              adamgordon119@gmail.com : Adam Gordon - Sole App Developer, meant
              for personal use.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
