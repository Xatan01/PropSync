import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface CooldownButtonProps {
  onClick: (e?: React.FormEvent) => Promise<void> | void;
  children: React.ReactNode;
  cooldownSeconds?: number;
  className?: string;
  type?: "button" | "submit";
}

const CooldownButton: React.FC<CooldownButtonProps> = ({
  onClick,
  children,
  cooldownSeconds = 30,
  className,
  type = "button",
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
    <Button onClick={handleClick} type={type} className={className} disabled={cooldown > 0}>
      {cooldown > 0 ? `Wait ${cooldown}s` : children}
    </Button>
  );
};

export default CooldownButton;