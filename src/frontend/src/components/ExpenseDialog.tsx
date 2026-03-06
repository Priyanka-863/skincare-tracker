import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProductCategory } from "../backend";
import type { Expense } from "../backend.d.ts";
import {
  type ExpenseWithId,
  msToNano,
  nanoToMs,
  useAddExpense,
  useUpdateExpense,
} from "../hooks/useQueries";

interface ExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  editItem?: ExpenseWithId;
}

const emptyForm = {
  productName: "",
  amount: "",
  category: ProductCategory.moisturizer as string,
  date: new Date().toISOString().slice(0, 10),
  notes: "",
};

export default function ExpenseDialog({
  open,
  onClose,
  editItem,
}: ExpenseDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const addMutation = useAddExpense();
  const updateMutation = useUpdateExpense();
  const isPending = addMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (editItem) {
      const e = editItem.expense;
      setForm({
        productName: e.productName,
        amount: e.amount.toString(),
        category: e.category,
        date: new Date(nanoToMs(e.date)).toISOString().slice(0, 10),
        notes: e.notes,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editItem]);

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    if (!form.productName.trim()) {
      toast.error("Product name is required");
      return;
    }

    const expense: Expense = {
      productName: form.productName.trim(),
      amount: Number.parseFloat(form.amount) || 0,
      category: form.category as ProductCategory,
      date: msToNano(new Date(form.date).getTime()),
      notes: form.notes.trim(),
    };

    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, expense });
        toast.success("Expense updated!");
      } else {
        await addMutation.mutateAsync(expense);
        toast.success("Expense recorded!");
      }
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="expense.dialog"
        className="max-w-md font-body"
        aria-describedby="expense-dialog-desc"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {editItem ? "Edit Expense" : "Record Expense"}
          </DialogTitle>
          <DialogDescription id="expense-dialog-desc">
            {editItem
              ? "Update this expense entry."
              : "Log a new skincare purchase."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="expense-product">Product Name *</Label>
            <Input
              id="expense-product"
              data-ocid="expense.input"
              placeholder="e.g. La Roche-Posay SPF 50"
              value={form.productName}
              onChange={(e) =>
                setForm((f) => ({ ...f, productName: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="expense-amount">Amount (₹) *</Label>
              <Input
                id="expense-amount"
                data-ocid="expense.amount.input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expense-date">Date</Label>
              <Input
                id="expense-date"
                data-ocid="expense.date.input"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expense-category">Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
            >
              <SelectTrigger id="expense-category" data-ocid="expense.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ProductCategory).map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expense-notes">Notes</Label>
            <Textarea
              id="expense-notes"
              data-ocid="expense.textarea"
              placeholder="Any notes about this purchase…"
              rows={2}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="expense.cancel_button"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="expense.submit_button"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : editItem ? (
                "Update Expense"
              ) : (
                "Record Expense"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
