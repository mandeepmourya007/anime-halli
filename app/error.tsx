"use client";

import { useEffect } from "react";
import Container from "@/components/layout/Container";
import GlassCard from "@/components/ui/GlassCard";

export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-8">
      <GlassCard className="space-y-4 px-6 py-16 text-center">
        <h1 className="font-display text-xl font-bold text-white">Something went wrong</h1>
        <p className="text-sm text-white/60">
          The data provider may be rate-limited or temporarily unavailable. Please try again.
        </p>
        <button
          onClick={reset}
          className="rounded-squircle-sm bg-gradient-to-r from-neon-magenta to-neon-violet px-4 py-2 text-sm font-medium text-white shadow-glow-magenta transition-transform hover:scale-105"
        >
          Try again
        </button>
      </GlassCard>
    </Container>
  );
}
