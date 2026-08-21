"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/api";

// Bounded LRU cache: a long session can view thousands of distinct voter
// photos, and blob: URLs are never freed by the browser on their own —
// capping the cache and revoking evicted entries keeps memory bounded
// instead of growing for the life of the tab.
const MAX_CACHED_BLOBS = 300;
const imageBlobCache = new Map<string, string>();

function cacheBlob(key: string, url: string) {
  if (imageBlobCache.size >= MAX_CACHED_BLOBS) {
    const oldestKey = imageBlobCache.keys().next().value;
    if (oldestKey !== undefined) {
      const oldestUrl = imageBlobCache.get(oldestKey);
      if (oldestUrl) URL.revokeObjectURL(oldestUrl);
      imageBlobCache.delete(oldestKey);
    }
  }
  imageBlobCache.set(key, url);
}

export function SecureImage({ path, token, alt }: { path: string; token: string; alt: string }) {
  const cacheKey = `${token}:${path}`;
  const [src, setSrc] = useState(() => imageBlobCache.get(cacheKey) || "");
  const [failed, setFailed] = useState(false);
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
          cacheBlob(cacheKey, url);
          setSrc(url);
        })
        .catch(() => { if (alive) setFailed(true); });
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

  if (failed) return <div className="imagePlaceholder imagePlaceholderFailed" role="img" aria-label={alt} />;
  if (!src) return <div className="imagePlaceholder" ref={placeholderRef} aria-hidden="true" />;
  return <img src={src} alt={alt} loading="lazy" decoding="async" />;
}
