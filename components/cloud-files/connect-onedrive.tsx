"use client";
import { useClerk } from "@clerk/nextjs";

export default function ConnectOneDrive() {
  const { openSignIn } = useClerk();

  const connect = () => {
    // Redirect user to the Microsoft OAuth flow via Clerk
    window.location.href = `/sign-in?strategy=oauth_microsoft&redirect_url=/dashboard/files&additional_scopes=Files.Read,Files.ReadWrite`;
  };

  return (
    <button
      onClick={connect}
      className="bg-[#0078D4] text-white px-4 py-2 rounded-md flex items-center"
    >
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6.2 7L3 17.8c0 .1 0 .2.1.2h7c.1 0 .2 0 .2-.1L13 7H6.2zm7.4 0l-2.8 7.5 2.2 5.7c0 .1.2.1.2 0l3.5-8.9c.1-.1 0-.2-.1-.2h-2.9zm6.1-4.6c-.1-.1-.2-.1-.3 0l-4.5 4.1h4.8c.1 0 .2 0 .2-.1l.1-.4-4.3-3.6zM3.2 2l9.5 7.9c.1.1.2.1.3 0l9.1-7.9c.1-.1 0-.2-.1-.2H3.3c-.1 0-.2.1-.1.2z" />
      </svg>
      Connect OneDrive
    </button>
  );
}
