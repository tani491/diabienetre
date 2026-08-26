"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface StoreSettings {
  announcementText: string;
  announcementEnabled: boolean;
}

export default function AnnouncementBar() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setSettings({
          announcementText: typeof data.announcementText === "string" ? data.announcementText : "",
          announcementEnabled: data.announcementEnabled !== false,
        });
      })
      .catch(() => setSettings(null));
  }, []);

  if (pathname.startsWith("/admin") || !settings?.announcementEnabled || !settings.announcementText.trim()) {
    return null;
  }

  const message = settings.announcementText.trim();

  return (
    <div className="relative z-[60] overflow-hidden bg-sage-900 text-white">
      <div className="announcement-marquee flex w-max whitespace-nowrap py-2 text-sm font-medium">
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index} className="mx-6 flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {message}
          </span>
        ))}
      </div>
    </div>
  );
}
