"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import fetcher from "@/utils/fetcher";
import MessageForm from "@/components/MessageForm";
import AnalyticsChart from "@/components/AnalyticsChart";
import Image from "next/image";
import React from "react";

// Define a proper type for messages
interface Message {
  id: number;
  message: string;
  persona: string;
  created_at: string;
  sent_at: string | null;
  responded_at: string | null;
  response_latency: number | null;
  profile_id: number;
}

// Use any type for params to satisfy Next.js 15.x type constraints
export default function ProfileDetail({ params }: any) {
  // Unwrap params using React.use() to access the ID
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;
  
  const router = useRouter();
  const { data: profile, error: profileError } = useSWR(
    `/api/profiles/${id}`,
    fetcher
  );
  const {
    data: messages,
    error: msgError,
    mutate: reloadMessages,
  } = useSWR(`/api/messages/index?profile_id=${id}`, fetcher);
  const { data: analytics } = useSWR(
    `/api/analytics/time-of-day?profile_id=${id}`,
    fetcher
  );

  // Debug the errors
  console.log("Profile Error:", profileError);
  console.log("Messages Error:", msgError);

  const [actionLoading, setActionLoading] = useState<number | null>(null);

  if (profileError || msgError) return <div>Error loading data.</div>;
  if (!profile || !messages) return <div>Loading...</div>;

  const handleDelete = async () => {
    if (confirm("Delete this profile?")) {
      await fetch(`/api/profiles/${id}`, { method: "DELETE" });
      router.push("/profiles");
    }
  };

  const handleMessageAction = async (
    msgId: number,
    action: "sent" | "responded"
  ) => {
    setActionLoading(msgId);
    await fetch("/api/messages/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: msgId, action }),
    });
    await reloadMessages();
    setActionLoading(null);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <Image
          src={profile.avatar_url || "/file.svg"}
          alt={profile.name}
          width={64}
          height={64}
          className="rounded-full"
        />
        <div>
          <h1 className="text-3xl font-bold">{profile.name}</h1>
          {profile.bio && <p className="text-gray-600">{profile.bio}</p>}
          {profile.location && (
            <p className="text-gray-500">{profile.location}</p>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="ml-auto px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete Profile
        </button>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Generate Message</h2>
        <MessageForm profileId={profile.id} onNewMessage={reloadMessages} />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Messages</h2>
        <ul className="space-y-4">
          {messages.map((msg: Message) => (
            <li
              key={msg.id}
              className="p-4 bg-white dark:bg-gray-800 rounded shadow"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {new Date(msg.created_at).toLocaleString()} &ndash;{" "}
                  <strong>{msg.persona}</strong>
                </div>
                <div className="space-x-2">
                  {!msg.sent_at && (
                    <button
                      onClick={() => handleMessageAction(msg.id, "sent")}
                      disabled={actionLoading === msg.id}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                    >
                      {actionLoading === msg.id ? "..." : "Mark Sent"}
                    </button>
                  )}
                  {msg.sent_at && !msg.responded_at && (
                    <button
                      onClick={() => handleMessageAction(msg.id, "responded")}
                      disabled={actionLoading === msg.id}
                      className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                    >
                      {actionLoading === msg.id ? "..." : "Mark Responded"}
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-1">{msg.message}</p>
              {msg.responded_at && (
                <div className="mt-2 text-xs text-gray-500">
                  Responded at {new Date(msg.responded_at).toLocaleString()},
                  latency: {msg.response_latency}s
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {analytics && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Engagement Analytics</h2>
          <AnalyticsChart data={analytics} />
        </section>
      )}
    </div>
  );
}
