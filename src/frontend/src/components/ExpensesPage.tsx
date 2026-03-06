import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Plus, Receipt, Trash2, TrendingDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ProductCategory } from "../backend";
import {
  type ExpenseWithId,
  nanoToMs,
  useDeleteExpense,
  useGetAllExpenses,
} from "../hooks/useQueries";
import CategoryBadge from "./CategoryBadge";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import ExpenseDialog from "./ExpenseDialog";

export default function ExpensesPage() {
  const { data: expenses, isLoading } = useGetAllExpenses();
  const deleteExpense = useDeleteExpense();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ExpenseWithId | undefined>();
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const totalSpent =
    expenses?.reduce((sum, e) => sum + e.expense.amount, 0) ?? 0;

  // Spending by category
  const byCategory =
    expenses?.reduce<Record<string, number>>((acc, e) => {
      const cat = e.expense.category;
      acc[cat] = (acc[cat] ?? 0) + e.expense.amount;
      return acc;
    }, {}) ?? {};

  const filtered = expenses
    ? [...expenses]
        .filter(
          (e) =>
            categoryFilter === "all" || e.expense.category === categoryFilter,
        )
        .sort((a, b) => nanoToMs(b.expense.date) - nanoToMs(a.expense.date))
    : [];

  const handleEdit = (item: ExpenseWithId) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditItem(undefined);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteExpense.mutateAsync(deleteId);
      toast.success("Expense deleted.");
    } catch {
      toast.error("Failed to delete expense.");
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Expenses
          </h1>
          <p className="text-muted-foreground font-body text-sm mt-1">
            Monitor your skincare spending
          </p>
        </div>
        <Button
          data-ocid="expenses.add.primary_button"
          onClick={handleAdd}
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Total + breakdown */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="shadow-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-body text-muted-foreground mb-1">
                  Total Spent
                </p>
                {isLoading ? (
                  <Skeleton className="h-10 w-32" />
                ) : (
                  <p className="text-4xl font-display font-bold text-foreground">
                    ₹{totalSpent.toFixed(2)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground font-body mt-1">
                  Across {expenses?.length ?? 0} purchases
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Receipt className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm font-semibold flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-primary" />
              By Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-6" />
                ))}
              </div>
            ) : Object.keys(byCategory).length === 0 ? (
              <p className="text-xs text-muted-foreground font-body">
                No data yet.
              </p>
            ) : (
              Object.entries(byCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amount]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <CategoryBadge category={cat} />
                    <span className="font-display font-semibold text-sm text-foreground">
                      ₹{amount.toFixed(2)}
                    </span>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category filter */}
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Category filter"
      >
        <button
          type="button"
          key="all"
          data-ocid="expenses.all.tab"
          role="tab"
          aria-selected={categoryFilter === "all"}
          onClick={() => setCategoryFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-sm font-body font-medium transition-all ${
            categoryFilter === "all"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground bg-muted hover:text-foreground"
          }`}
        >
          All
        </button>
        {Object.values(ProductCategory).map((cat) => (
          <button
            type="button"
            key={cat}
            data-ocid={`expenses.${cat}.tab`}
            role="tab"
            aria-selected={categoryFilter === cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-body font-medium transition-all capitalize ${
              categoryFilter === cat
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground bg-muted hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expense list */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="expenses.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="expenses.empty_state"
          className="py-16 flex flex-col items-center text-center text-muted-foreground font-body"
        >
          <Receipt className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-semibold text-base text-foreground mb-1">
            No expenses found
          </p>
          <p className="text-sm mb-4">
            {categoryFilter === "all"
              ? "Start logging your skincare purchases."
              : `No expenses in the "${categoryFilter}" category.`}
          </p>
          {categoryFilter === "all" && (
            <Button
              data-ocid="expenses.empty.add_button"
              onClick={handleAdd}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.div
                key={item.id.toString()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                data-ocid={`expenses.item.${i + 1}`}
              >
                <Card className="shadow-card hover:shadow-soft transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-body font-bold text-sm text-foreground">
                            {item.expense.productName}
                          </span>
                          <CategoryBadge category={item.expense.category} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
                          <span>
                            {new Date(
                              nanoToMs(item.expense.date),
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          {item.expense.notes && (
                            <span className="italic truncate max-w-[200px]">
                              {item.expense.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-display font-bold text-lg text-foreground">
                          ₹{item.expense.amount.toFixed(2)}
                        </span>
                        <Button
                          data-ocid={`expenses.edit_button.${i + 1}`}
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleEdit(item)}
                          aria-label="Edit expense"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          data-ocid={`expenses.delete_button.${i + 1}`}
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteId(item.id)}
                          aria-label="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ExpenseDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editItem={editItem}
      />
      <ConfirmDeleteDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isPending={deleteExpense.isPending}
        title="Delete expense?"
        description="This will permanently remove this expense record."
      />
    </div>
  );
}
