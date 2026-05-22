import React, { useState, useRef, MouseEvent } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // max tilt degrees (default 10)
  perspective?: number; // perspective pixels (default 1000)
}

export function TiltCard({
  children,
  className = '',
  maxTilt = 8,
  perspective = 1000,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
  });
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({
    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)',
  });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to the center of the card
    const x = e.clientX - rect.left - width / 2;
    const y = e.clientY - rect.top - height / 2;

    // Calculate tilt angles based on mouse position
    const rotateY = (x / (width / 2)) * maxTilt;
    const rotateX = -(y / (height / 2)) * maxTilt;

    // Light reflection position
    const relX = ((e.clientX - rect.left) / width) * 100;
    const relY = ((e.clientY - rect.top) / height) * 100;

    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out',
    });

    setHighlightStyle({
      background: `radial-gradient(circle at ${relX}% ${relY}%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%)`,
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
    });
    setHighlightStyle({
      background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className={`relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-md shadow-xl transition-all duration-300 ${className}`}
    >
      {/* Light Reflection Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={highlightStyle}
      />
      {children}
    </div>
  );
}
