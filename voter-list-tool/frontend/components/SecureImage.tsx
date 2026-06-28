"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

const imageBlobCache = new Map<string, string>();

export function SecureImage({ path, token, alt }: { path: string; token: string; alt: string }) {
  const cacheKey = `${token}:${path}`;
  const [src, setSrc] = useState(() => imageBlobCache.get(cacheKey) || "");

  useEffect(() => {
    let alive = true;
    if (!path) return;
    const cached = imageBlobCache.get(cacheKey);
    if (cached) {
      setSrc(cached);
      return;
    }
    fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error("image");
        return res.blob();
      })
      .then((blob) => {
        if (!alive) return;
        const objectUrl = URL.createObjectURL(blob);
        imageBlobCache.set(cacheKey, objectUrl);
        setSrc(objectUrl);
      })
      .catch(() => setSrc(""));
    return () => {
      alive = false;
    };
  }, [cacheKey, path, token]);

  if (!src) return <div className="imagePlaceholder">{alt}</div>;
  return <img src={src} alt={alt} loading="lazy" decoding="async" />;
}
