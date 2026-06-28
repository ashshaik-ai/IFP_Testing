"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

export function SecureImage({ path, token, alt }: { path: string; token: string; alt: string }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let alive = true;
    let objectUrl = "";
    if (!path) return;
    fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error("image");
        return res.blob();
      })
      .then((blob) => {
        if (!alive) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => setSrc(""));
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path, token]);

  if (!src) return <div className="imagePlaceholder">{alt}</div>;
  return <img src={src} alt={alt} loading="lazy" />;
}
