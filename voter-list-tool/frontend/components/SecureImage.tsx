"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/api";

const imageBlobCache = new Map<string, string>();

export function SecureImage({ path, token, alt }: { path: string; token: string; alt: string }) {
  const cacheKey = `${token}:${path}`;
  const [src, setSrc] = useState(() => imageBlobCache.get(cacheKey) || "");
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!path) return;
    const cached = imageBlobCache.get(cacheKey);
    if (cached) { setSrc(cached); return; }

    const el = placeholderRef.current;
    if (!el) return;

    let alive = true;

    function startFetch() {
      fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => { if (!res.ok) throw new Error("img"); return res.blob(); })
        .then((blob) => {
          if (!alive) return;
          const url = URL.createObjectURL(blob);
          imageBlobCache.set(cacheKey, url);
          setSrc(url);
        })
        .catch(() => {});
    }

    // Only fetch when the placeholder enters (or is near) the viewport.
    // rootMargin: "400px" starts fetching 400px before the card is visible.
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) { observer.disconnect(); startFetch(); } },
      { rootMargin: "400px" }
    );
    observer.observe(el);

    return () => { alive = false; observer.disconnect(); };
  }, [cacheKey, path, token]);

  if (!src) return <div className="imagePlaceholder" ref={placeholderRef} aria-hidden="true" />;
  return <img src={src} alt={alt} loading="lazy" decoding="async" />;
}
