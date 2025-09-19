import React, { useState, useEffect } from "react";

interface CooldownLinkProps {
  onClick: (e?: React.FormEvent) => Promise<void> | void;
  children: React.ReactNode;
  cooldownSeconds?: number;
  className?: string;
}

const CooldownLink: React.FC<CooldownLinkProps> = ({
  onClick,
  children,
  cooldownSeconds = 30,
  className = "",
}) => {
  const [cooldown, setCooldown] = useState(0);

  const handleClick = async (e?: React.FormEvent) => {
    if (cooldown > 0) return;
    await onClick(e);
    setCooldown(cooldownSeconds);
  };

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  return (
    <span
      onClick={handleClick}
      className={`${
        cooldown > 0
          ? "text-gray-400 cursor-not-allowed"
          : "text-primary underline hover:text-primary/80 cursor-pointer"
      } ${className}`}
    >
      {cooldown > 0 ? `Resend in ${cooldown}s` : children}
    </span>
  );
};

export default CooldownLink;