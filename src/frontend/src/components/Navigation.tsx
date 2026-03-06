import { Button } from "@/components/ui/button";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Package,
  Receipt,
  Sparkles,
} from "lucide-react";
import type { TabId } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface NavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "journey", label: "Journey", icon: BookOpen },
];

export default function Navigation({
  activeTab,
  onTabChange,
}: NavigationProps) {
  const { clear, identity } = useInternetIdentity();

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}…${principal.slice(-3)}`
    : "";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur-md">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground text-base hidden sm:block">
              Glōw
            </span>
          </div>

          {/* Desktop nav tabs */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  data-ocid={`nav.${tab.id}.link`}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-body font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* User + Logout */}
          <div className="flex items-center gap-2">
            {shortPrincipal && (
              <span className="hidden sm:block text-xs font-body text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {shortPrincipal}
              </span>
            )}
            <Button
              data-ocid="nav.logout.button"
              variant="ghost"
              size="icon"
              onClick={() => clear()}
              className="w-8 h-8 text-muted-foreground hover:text-destructive"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile tab bar */}
        <div className="flex md:hidden border-t border-border -mx-4 px-2 pb-1 pt-1 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                data-ocid={`mobile.nav.${tab.id}.link`}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-xs font-body font-medium transition-all ${
                  isActive
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
