import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-body font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Skincare Tracker
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight mb-3">
            Your skin, your <span className="italic text-primary">journey</span>
          </h1>
          <p className="text-muted-foreground font-body text-base leading-relaxed max-w-sm mx-auto">
            Track your products, monitor expenses, and document your skincare
            routine all in one place.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            {
              label: "Track Products",
              desc: "Monitor how long each product lasts",
            },
            {
              label: "Log Expenses",
              desc: "Keep your skincare budget in check",
            },
            {
              label: "Record Journey",
              desc: "Document skin changes over time",
            },
          ].map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
              className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-3 text-center shadow-xs"
            >
              <p className="font-body font-semibold text-foreground text-xs mb-1">
                {f.label}
              </p>
              <p className="text-muted-foreground text-xs leading-snug">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="bg-card border border-border rounded-2xl p-8 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wide">
              Secure Login
            </span>
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">
            Sign in to continue
          </h2>
          <p className="text-sm text-muted-foreground font-body mb-6">
            Your data is stored securely on the Internet Computer blockchain.
          </p>

          <Button
            data-ocid="login.primary_button"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full h-11 font-body font-semibold text-sm"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <p className="mt-4 text-xs text-muted-foreground text-center font-body">
            No account needed. Your identity is tied to your device.
          </p>
        </motion.div>

        {/* Hero image decorative */}
        <div className="mt-8 rounded-2xl overflow-hidden opacity-60 shadow-xs">
          <img
            src="/assets/generated/skincare-hero.dim_1200x400.png"
            alt="Skincare botanical illustration"
            className="w-full h-24 object-cover object-center"
          />
        </div>
      </motion.div>
    </div>
  );
}
