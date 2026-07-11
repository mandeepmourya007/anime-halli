import Link from "next/link";
import { cn } from "@/lib/utils/format";
import { HOME_TABS } from "@/lib/media/tabs";

export default function CategoryTabs({ activeTab }: { activeTab: string }) {
  return (
    <div className="glass inline-flex items-center gap-1 rounded-squircle p-1.5">
      {HOME_TABS.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <Link
            key={tab.value}
            href={`/?tab=${tab.value}`}
            className={cn(
              "rounded-squircle-sm px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-gradient-to-r from-neon-magenta to-neon-violet text-white shadow-glow-magenta"
                : "text-white/60 hover:text-white",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
