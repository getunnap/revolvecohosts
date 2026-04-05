"use client";

import CohostProfileDetail from "@/components/find-cohost/cohost-profile-detail";
import { getActiveMatchResultsPath } from "@/lib/client-storage";
import { findMatchInSessionResults, type MatchCard } from "@/lib/match-funnel";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CohostProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [profile, setProfile] = useState<MatchCard | null | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      router.replace(getActiveMatchResultsPath() ?? "/find-cohost/results");
      return;
    }
    const m = findMatchInSessionResults(id);
    if (!m) {
      router.replace(getActiveMatchResultsPath() ?? "/find-cohost/results");
      return;
    }
    setProfile(m);
  }, [id, router]);

  if (profile === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white text-zinc-500">
        Loading profile…
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return <CohostProfileDetail profile={profile} />;
}
