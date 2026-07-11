"use client";

import { usePathname } from "next/navigation";
import { memo } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
}

function PageTransitionBase({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-page-enter">
      {children}
    </div>
  );
}

export const PageTransition = memo(PageTransitionBase);
export default PageTransition;
