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
  const isVisible = Boolean(
    !pathname.startsWith("/admin") &&
      settings?.announcementEnabled &&
      settings?.announcementText.trim()
  );

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

  useEffect(() => {
    document.documentElement.style.setProperty("--announcement-bar-height", isVisible ? "40px" : "0px");

    return () => {
      document.documentElement.style.setProperty("--announcement-bar-height", "0px");
    };
  }, [isVisible]);

  if (!isVisible || !settings) {
    return null;
  }

  const message = settings.announcementText.trim();

  return (
    <div className="sticky top-0 z-[70] h-10 overflow-hidden bg-sage-900 text-white">
      <div className="announcement-marquee flex h-10 w-max items-center whitespace-nowrap text-sm font-medium">
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
