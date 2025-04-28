import Link from "next/link";
import Image from "next/image";
import React from "react";

interface Profile {
  id: number;
  name: string;
  avatar_url?: string | null;
}

interface Props {
  profiles: Profile[];
}

export default function ProfilesList({ profiles }: Props) {
  if (!profiles || profiles.length === 0) {
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded shadow text-center">
        <p className="text-gray-700 dark:text-gray-300 mb-2">No profiles found</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Create a new profile to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {profiles.map((profile) => (
        <Link
          key={profile.id}
          href={`/profiles/${profile.id}`}
          className="flex items-center p-4 bg-white dark:bg-gray-800 rounded shadow hover:shadow-md transition"
        >
          <Image
            src={profile.avatar_url || "/file.svg"}
            alt={profile.name}
            width={48}
            height={48}
            className="rounded-full"
          />
          <span className="ml-4 font-medium text-lg text-gray-900 dark:text-gray-100">
            {profile.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
