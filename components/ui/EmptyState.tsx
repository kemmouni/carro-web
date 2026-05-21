import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export default function EmptyState({ icon: Icon, title, description, action, secondaryAction }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-dark-secondary flex items-center justify-center mb-5 border border-dark-border">
        <Icon size={32} className="text-gray-600" />
      </div>
      <h3 className="text-[18px] font-black text-white mb-2">{title}</h3>
      {description && (
        <p className="text-[14px] text-gray-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {action && (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <Link href={action.href as any} className="btn-primary">
              {action.label}
            </Link>
          )}
          {secondaryAction && (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <Link href={secondaryAction.href as any} className="btn-secondary">
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
