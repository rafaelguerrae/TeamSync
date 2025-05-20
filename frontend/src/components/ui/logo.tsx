import React from "react";

interface LogoTextProps {
  size?: "small" | "medium" | "large";
}

export const LogoText: React.FC<LogoTextProps> = ({ size = "medium" }) => {
  const sizeClasses = {
    small: "text-xl",
    medium: "text-2xl",
    large: "text-3xl"
  };

  return (
    <div className={`select-none flex items-center font-bold ${sizeClasses[size]}`}>
      <span className="font-poppins">Team</span>
      <span className="font-poppins text-primary">Sync</span>
    </div>
  );
}; 