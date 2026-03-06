import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { Product } from "../backend.d.ts";
import {
  type ProductWithId,
  msToNano,
  nanoToMs,
  useAddProduct,
  useUpdateProduct,
} from "../hooks/useQueries";

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  editItem?: ProductWithId;
}

const emptyForm = {
  name: "",
  category: ProductCategory.moisturizer as string,
  startDate: new Date().toISOString().slice(0, 10),
  estimatedDays: "30",
  purchasePrice: "",
  notes: "",
  isFinished: false,
};

export default function ProductDialog({
  open,
  onClose,
  editItem,
}: ProductDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const addMutation = useAddProduct();
  const updateMutation = useUpdateProduct();
  const isPending = addMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (editItem) {
      const p = editItem.product;
      setForm({
        name: p.name,
        category: p.category,
        startDate: new Date(nanoToMs(p.startDate)).toISOString().slice(0, 10),
        estimatedDays: p.estimatedDays.toString(),
        purchasePrice: p.purchasePrice.toString(),
        notes: p.notes,
        isFinished: p.isFinished,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    const product: Product = {
      name: form.name.trim(),
      category: form.category as ProductCategory,
      startDate: msToNano(new Date(form.startDate).getTime()),
      estimatedDays: BigInt(Number.parseInt(form.estimatedDays) || 30),
      purchasePrice: Number.parseFloat(form.purchasePrice) || 0,
      notes: form.notes.trim(),
      isFinished: form.isFinished,
    };

    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, product });
        toast.success("Product updated!");
      } else {
        await addMutation.mutateAsync(product);
        toast.success("Product added!");
      }
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="product.dialog"
        className="max-w-md font-body"
        aria-describedby="product-dialog-desc"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {editItem ? "Edit Product" : "Add Product"}
          </DialogTitle>
          <DialogDescription id="product-dialog-desc">
            {editItem
              ? "Update your product details."
              : "Add a new skincare product to track."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="product-name">Product Name *</Label>
            <Input
              id="product-name"
              data-ocid="product.input"
              placeholder="e.g. CeraVe Moisturising Cream"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="product-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger id="product-category" data-ocid="product.select">
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
              <Label htmlFor="product-start">Start Date</Label>
              <Input
                id="product-start"
                data-ocid="product.start.input"
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="product-days">Est. Days</Label>
              <Input
                id="product-days"
                data-ocid="product.days.input"
                type="number"
                min="1"
                placeholder="30"
                value={form.estimatedDays}
                onChange={(e) =>
                  setForm((f) => ({ ...f, estimatedDays: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-price">Purchase Price (₹)</Label>
              <Input
                id="product-price"
                data-ocid="product.price.input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.purchasePrice}
                onChange={(e) =>
                  setForm((f) => ({ ...f, purchasePrice: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-notes">Notes</Label>
            <Textarea
              id="product-notes"
              data-ocid="product.textarea"
              placeholder="Any notes about this product…"
              rows={2}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="product-finished"
              data-ocid="product.finished.checkbox"
              checked={form.isFinished}
              onCheckedChange={(v) =>
                setForm((f) => ({ ...f, isFinished: !!v }))
              }
            />
            <Label
              htmlFor="product-finished"
              className="font-normal cursor-pointer"
            >
              Mark as finished
            </Label>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="product.cancel_button"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="product.submit_button"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : editItem ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
