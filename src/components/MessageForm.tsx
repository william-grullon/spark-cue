"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

interface MessageFormProps {
  profileId: number;
  onNewMessage?: () => void;
}

type FormData = { persona: string };

const personas = [
  "Classy",
  "Playful",
  "Flirty",
  "Adventurous",
  "Intellectual",
  "Sweet",
  "Bold",
  "Mysterious",
  "Funny",
  "Romantic",
];

export default function MessageForm({
  profileId,
  onNewMessage,
}: MessageFormProps) {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const genRes = await fetch("/api/messages/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: profileId, persona: data.persona }),
      });
      const { message, source, persona } = await genRes.json();
      const addRes = await fetch("/api/messages/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: profileId,
          source,
          persona,
          message,
        }),
      });
      if (!addRes.ok) throw new Error("Failed to save message");
      reset();
      onNewMessage?.();
    } catch (err: any) {
      setError(err.message || "Error generating message");
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-2 p-4 bg-gray-50 dark:bg-gray-700 rounded"
    >
      <div>
        <label className="block mb-1">Persona</label>
        <select
          {...register("persona", { required: true })}
          className="w-full border rounded p-2"
        >
          <option value="">Select persona</option>
          {personas.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {loading ? "Generating..." : "Generate Message"}
      </button>
      {error && <div className="text-red-500 mt-1">{error}</div>}
    </form>
  );
}
