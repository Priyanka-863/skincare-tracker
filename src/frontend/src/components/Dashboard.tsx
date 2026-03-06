import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  Package,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import type { TabId } from "../App";
import {
  calcProductProgress,
  nanoToMs,
  useGetAllExpenses,
  useGetAllJourneyEntries,
  useGetAllProducts,
} from "../hooks/useQueries";
import CategoryBadge from "./CategoryBadge";

interface DashboardProps {
  onNavigate: (tab: TabId) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { data: products, isLoading: loadingProducts } = useGetAllProducts();
  const { data: expenses, isLoading: loadingExpenses } = useGetAllExpenses();
  const { data: journeyEntries, isLoading: loadingJourney } =
    useGetAllJourneyEntries();

  const activeProducts = products?.filter((p) => !p.product.isFinished) ?? [];
  const nearingEnd = activeProducts.filter((p) => {
    const { percentRemaining } = calcProductProgress(p.product);
    return percentRemaining < 20;
  });

  const totalSpent =
    expenses?.reduce((sum, e) => sum + e.expense.amount, 0) ?? 0;

  const latestEntry = journeyEntries
    ? [...journeyEntries].sort(
        (a, b) => nanoToMs(b.entry.date) - nanoToMs(a.entry.date),
      )[0]
    : null;

  const recentExpenses = expenses
    ? [...expenses]
        .sort((a, b) => nanoToMs(b.expense.date) - nanoToMs(a.expense.date))
        .slice(0, 5)
    : [];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground font-body text-sm mt-1">
          Your skincare routine at a glance
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            title: "Active Products",
            value: loadingProducts ? null : activeProducts.length,
            icon: Package,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            title: "Running Low",
            value: loadingProducts ? null : nearingEnd.length,
            icon: AlertTriangle,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            title: "Total Spent",
            value: loadingExpenses ? null : `₹${totalSpent.toFixed(2)}`,
            icon: Receipt,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            title: "Last Entry",
            value: loadingJourney
              ? null
              : latestEntry
                ? new Date(nanoToMs(latestEntry.entry.date)).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                    },
                  )
                : "—",
            icon: Calendar,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
            >
              <Card className="shadow-card hover:shadow-soft transition-shadow duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-body font-medium text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      {stat.value === null ? (
                        <Skeleton className="h-7 w-16" />
                      ) : (
                        <p className="text-2xl font-display font-bold text-foreground">
                          {stat.value}
                        </p>
                      )}
                    </div>
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Active products with progress */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-base font-semibold">
                Active Products
              </CardTitle>
              <Button
                data-ocid="dashboard.products.link"
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("products")}
                className="text-xs text-primary hover:text-primary/80 font-body h-7"
              >
                View all →
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingProducts ? (
              <div
                className="space-y-3"
                data-ocid="dashboard.products.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : activeProducts.length === 0 ? (
              <div
                data-ocid="dashboard.products.empty_state"
                className="py-8 text-center text-muted-foreground font-body text-sm"
              >
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No active products yet.
              </div>
            ) : (
              activeProducts.slice(0, 4).map((p, i) => {
                const { percentRemaining, daysRemaining, totalDays } =
                  calcProductProgress(p.product);
                const isLow = percentRemaining < 10;
                const isNearing = percentRemaining < 20;
                return (
                  <motion.div
                    key={p.id.toString()}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    data-ocid={`dashboard.products.item.${i + 1}`}
                    className="p-3 rounded-xl border border-border bg-muted/40"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-body font-semibold text-sm text-foreground truncate max-w-[120px]">
                          {p.product.name}
                        </span>
                        {isLow && (
                          <span className="text-xs font-body font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                            Running Low
                          </span>
                        )}
                      </div>
                      <CategoryBadge category={p.product.category} />
                    </div>
                    <div className="space-y-1">
                      <div
                        className={
                          isLow
                            ? "progress-low"
                            : isNearing
                              ? "progress-medium"
                              : "progress-good"
                        }
                      >
                        <Progress value={percentRemaining} className="h-1.5" />
                      </div>
                      <p className="text-xs text-muted-foreground font-body">
                        {Math.round(daysRemaining)} days remaining of{" "}
                        {totalDays}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-base font-semibold">
                Recent Expenses
              </CardTitle>
              <Button
                data-ocid="dashboard.expenses.link"
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("expenses")}
                className="text-xs text-primary hover:text-primary/80 font-body h-7"
              >
                View all →
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingExpenses ? (
              <div
                className="space-y-2"
                data-ocid="dashboard.expenses.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : recentExpenses.length === 0 ? (
              <div
                data-ocid="dashboard.expenses.empty_state"
                className="py-8 text-center text-muted-foreground font-body text-sm"
              >
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No expenses recorded yet.
              </div>
            ) : (
              recentExpenses.map((e, i) => (
                <motion.div
                  key={e.id.toString()}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  data-ocid={`dashboard.expenses.item.${i + 1}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/40"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-sm text-foreground truncate">
                      {e.expense.productName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <CategoryBadge category={e.expense.category} />
                      <span className="text-xs text-muted-foreground font-body">
                        {new Date(nanoToMs(e.expense.date)).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                  <span className="font-display font-bold text-foreground ml-3">
                    ₹{e.expense.amount.toFixed(2)}
                  </span>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick nav */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                id: "products" as TabId,
                label: "Manage Products",
                icon: Package,
                desc: "Add or track your skincare products",
              },
              {
                id: "expenses" as TabId,
                label: "Log Expense",
                icon: Receipt,
                desc: "Record a new purchase",
              },
              {
                id: "journey" as TabId,
                label: "New Entry",
                icon: BookOpen,
                desc: "Write today's skin check-in",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.id}
                  data-ocid={`dashboard.${item.id}.button`}
                  onClick={() => onNavigate(item.id)}
                  className="group flex flex-col items-center text-center p-4 rounded-xl border border-border bg-muted/30 hover:bg-primary/6 hover:border-primary/30 transition-all duration-150"
                >
                  <div className="p-2.5 rounded-xl bg-card border border-border group-hover:border-primary/30 group-hover:bg-primary/10 transition-all mb-2">
                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="font-body font-semibold text-sm text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground font-body mt-0.5 hidden md:block">
                    {item.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Latest journey entry preview */}
      {!loadingJourney && latestEntry && (
        <Card className="shadow-card border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-base font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Latest Journey Entry
              </CardTitle>
              <Button
                data-ocid="dashboard.journey.link"
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("journey")}
                className="text-xs text-primary hover:text-primary/80 font-body h-7"
              >
                View all →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="shrink-0 text-center">
                <p className="text-2xl font-display font-bold text-primary">
                  {new Date(nanoToMs(latestEntry.entry.date)).getDate()}
                </p>
                <p className="text-xs font-body text-muted-foreground -mt-1">
                  {new Date(
                    nanoToMs(latestEntry.entry.date),
                  ).toLocaleDateString("en-US", {
                    month: "short",
                  })}
                </p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-foreground line-clamp-2">
                  {latestEntry.entry.skinCondition || latestEntry.entry.notes}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground font-body">
                  <span>
                    Hydration: {latestEntry.entry.hydrationLevel.toString()}/5
                  </span>
                  <span>
                    Rating: {latestEntry.entry.overallRating.toString()}/5
                  </span>
                  <span>
                    Breakouts: {latestEntry.entry.breakoutsCount.toString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
