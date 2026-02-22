import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}) => {
  const baseClasses = "bg-gray-200 dark:bg-gray-700";
  
  const variantClasses = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-[wave_1.6s_ease-in-out_infinite]",
    none: "",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-label="Loading..."
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f1f3a]">
      <Skeleton variant="circular" width={48} height={48} className="mb-4" />
      <Skeleton variant="text" width="60%" height={24} className="mb-2" />
      <Skeleton variant="text" width="100%" height={16} className="mb-2" />
      <Skeleton variant="text" width="80%" height={16} />
    </div>
  );
};

export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? "60%" : "100%"}
          height={16}
        />
      ))}
    </div>
  );
};

// Export default for convenience
export default Skeleton;
