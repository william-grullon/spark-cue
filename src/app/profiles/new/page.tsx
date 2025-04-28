"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

type FormData = {
  name: string;
  bio?: string;
  location?: string;
  pictures: string;
  avatar_url?: string;
};

export default function NewProfilePage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<FormData>();
  const onSubmit = async (data: FormData) => {
    const pics = data.pictures
      .split(",")
      .map((s) => ({ description: s.trim() }))
      .filter((p) => p.description);
    const res = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, pictures: pics }),
    });
    const profile = await res.json();
    router.push(`/profiles/${profile.id}`);
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">New Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block">Name *</label>
          <input
            {...register("name", { required: true })}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block">Bio</label>
          <textarea
            {...register("bio")}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block">Location</label>
          <input
            {...register("location")}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block">
            Picture Descriptions (comma-separated) *
          </label>
          <input
            {...register("pictures", { required: true })}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block">Avatar URL</label>
          <input
            {...register("avatar_url")}
            className="w-full border rounded p-2"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Create Profile
        </button>
      </form>
    </div>
  );
}
