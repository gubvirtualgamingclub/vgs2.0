'use client';

import Image from 'next/image';
import { useState } from 'react';

interface AdminImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
}

export default function AdminImage({ src, alt, width, height, className }: AdminImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => {
        setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=374151&color=9CA3AF&size=${width}`);
      }}
    />
  );
}
