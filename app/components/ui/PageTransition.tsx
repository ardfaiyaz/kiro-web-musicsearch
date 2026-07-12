"use client";

import { memo } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
}

function PageTransitionBase({ children }: PageTransitionProps) {
  return (
    <div className="animate-page-enter">
      {children}
    </div>
  );
}

export const PageTransition = memo(PageTransitionBase);
export default PageTransition;
