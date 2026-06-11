"use client";

import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

/**
 * Profile photo with a graceful monogram fallback.
 * Drop your photo at /public/profile.jpg to replace the placeholder.
 */
export default function ProfileImage({ src, alt, className = "" }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`bg-brand flex items-center justify-center font-bold text-white ${className}`}
        aria-label={alt}
        role="img"
      >
        <span className="text-6xl tracking-tight">SA</span>
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading="eager"
    />
  );
}
