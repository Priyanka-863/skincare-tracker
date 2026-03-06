import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Dashboard from "./components/Dashboard";
import ExpensesPage from "./components/ExpensesPage";
import JourneyPage from "./components/JourneyPage";
import LoginPage from "./components/LoginPage";
import Navigation from "./components/Navigation";
import ProductsPage from "./components/ProductsPage";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

export type TabId = "dashboard" | "products" | "expenses" | "journey";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  if (isInitializing) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground font-body text-sm">
            Loading your routine…
          </p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <LoginPage />
        <Toaster position="bottom-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-6 animate-fade-in">
        {activeTab === "dashboard" && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === "products" && <ProductsPage />}
        {activeTab === "expenses" && <ExpensesPage />}
        {activeTab === "journey" && <JourneyPage />}
      </main>
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground font-body">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          Built with ♥ using caffeine.ai
        </a>
      </footer>
      <Toaster position="bottom-right" />
    </div>
  );
}
