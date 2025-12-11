"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FeatureTooltipProps {
  title: string;
  description: string;
  icon: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
  showOnMount?: boolean;
}

export function FeatureTooltip({
  title,
  description,
  icon,
  position = "top",
  children,
  showOnMount = false,
}: FeatureTooltipProps) {
  const [show, setShow] = useState(showOnMount);
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-terracotta-500",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-terracotta-500",
    left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-terracotta-500",
    right: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-terracotta-500",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => !dismissed && setShow(true)}
      onMouseLeave={() => !showOnMount && setShow(false)}
    >
      {children}
      {show && !dismissed && (
        <div
          className={cn(
            "absolute z-50 w-64 p-3 bg-terracotta-500 text-white rounded-lg shadow-lg animate-in fade-in zoom-in-95 duration-200",
            positionClasses[position]
          )}
        >
          <div
            className={cn(
              "absolute w-0 h-0 border-[6px]",
              arrowClasses[position]
            )}
          />
          <div className="flex items-start gap-2">
            <span className="text-lg">{icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-terracotta-100 mt-1">{description}</p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-terracotta-200 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
