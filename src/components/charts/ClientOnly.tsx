"use client";

import * as React from "react";

/**
 * Defer rendering until after first client paint. Used to wrap recharts
 * components which need a measured container — they log "width(-1)" warnings
 * during SSR/prerender and produce empty SVGs in the static HTML.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);
  // Detecting client mount is the one place setState in an effect is correct.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  return <>{mounted ? children : fallback}</>;
}
