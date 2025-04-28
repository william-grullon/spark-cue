"use client";
import React from "react";
import useSWR from "swr";
import fetcher from "@/utils/fetcher";
import ProfilesList from "@/components/ProfilesList";
import Link from "next/link";

export default function ProfilesPage() {
  const { data: profiles, error } = useSWR("/api/profiles", fetcher);
  if (error) return <div>Error loading profiles</div>;
  if (!profiles) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Profiles</h1>
      <Link 
        href="/profiles/new"
        className="inline-block mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        New Profile
      </Link>
      <ProfilesList profiles={profiles} />
    </div>
  );
}
