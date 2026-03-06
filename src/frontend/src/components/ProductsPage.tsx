import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Circle,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type ProductWithId,
  calcProductProgress,
  nanoToMs,
  useDeleteProduct,
  useGetAllProducts,
  useUpdateProduct,
} from "../hooks/useQueries";
import CategoryBadge from "./CategoryBadge";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import ProductDialog from "./ProductDialog";

export default function ProductsPage() {
  const { data: products, isLoading } = useGetAllProducts();
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ProductWithId | undefined>();
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "finished">("all");

  const filtered =
    products?.filter((p) => {
      if (filter === "active") return !p.product.isFinished;
      if (filter === "finished") return p.product.isFinished;
      return true;
    }) ?? [];

  const handleEdit = (item: ProductWithId) => {
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
      await deleteProduct.mutateAsync(deleteId);
      toast.success("Product deleted.");
    } catch {
      toast.error("Failed to delete product.");
    }
    setDeleteId(null);
  };

  const handleToggleFinished = async (item: ProductWithId) => {
    try {
      await updateProduct.mutateAsync({
        id: item.id,
        product: { ...item.product, isFinished: !item.product.isFinished },
      });
      toast.success(
        item.product.isFinished
          ? "Product reactivated!"
          : "Product marked as finished!",
      );
    } catch {
      toast.error("Failed to update product.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Products
          </h1>
          <p className="text-muted-foreground font-body text-sm mt-1">
            Track how long each product lasts
          </p>
        </div>
        <Button
          data-ocid="products.add.primary_button"
          onClick={handleAdd}
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2" role="tablist" aria-label="Product filter">
        {(["all", "active", "finished"] as const).map((f) => (
          <button
            type="button"
            key={f}
            data-ocid={`products.${f}.tab`}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-body font-medium transition-all ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground bg-muted hover:text-foreground"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && products && (
              <span className="ml-1.5 text-xs opacity-70">
                (
                {
                  products.filter((p) =>
                    f === "active"
                      ? !p.product.isFinished
                      : p.product.isFinished,
                  ).length
                }
                )
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Products list */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="products.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="products.empty_state"
          className="py-16 flex flex-col items-center text-center text-muted-foreground font-body"
        >
          <Package className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-semibold text-base text-foreground mb-1">
            No products here
          </p>
          <p className="text-sm mb-4">
            {filter === "finished"
              ? "No finished products yet."
              : "Add your first skincare product to start tracking."}
          </p>
          {filter !== "finished" && (
            <Button
              data-ocid="products.empty.add_button"
              onClick={handleAdd}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((item, i) => {
              const {
                percentRemaining,
                daysRemaining,
                totalDays,
                daysElapsed,
              } = calcProductProgress(item.product);
              const isLow = percentRemaining < 10 && !item.product.isFinished;
              const isNearing =
                percentRemaining < 20 && !item.product.isFinished;

              return (
                <motion.div
                  key={item.id.toString()}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04 }}
                  data-ocid={`products.item.${i + 1}`}
                >
                  <Card
                    className={`shadow-card transition-all ${
                      isLow
                        ? "border-red-200"
                        : isNearing
                          ? "border-amber-200"
                          : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Finished toggle */}
                        <button
                          type="button"
                          data-ocid={`products.finished.toggle.${i + 1}`}
                          onClick={() => handleToggleFinished(item)}
                          className="mt-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                          aria-label={
                            item.product.isFinished
                              ? "Mark as active"
                              : "Mark as finished"
                          }
                        >
                          {item.product.isFinished ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`font-body font-bold text-base ${
                                item.product.isFinished
                                  ? "text-muted-foreground line-through"
                                  : "text-foreground"
                              }`}
                            >
                              {item.product.name}
                            </span>
                            <CategoryBadge category={item.product.category} />
                            {item.product.isFinished && (
                              <Badge variant="secondary" className="text-xs">
                                Finished
                              </Badge>
                            )}
                            {isLow && (
                              <span className="text-xs font-body font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                Running Low!
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-body mb-3">
                            <span>
                              Started:{" "}
                              {new Date(
                                nanoToMs(item.product.startDate),
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span>
                              Cost: ₹{item.product.purchasePrice.toFixed(2)}
                            </span>
                            {!item.product.isFinished && (
                              <span>
                                {Math.round(daysRemaining)} of {totalDays} days
                                remaining
                              </span>
                            )}
                          </div>

                          {!item.product.isFinished && (
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
                                <Progress
                                  value={percentRemaining}
                                  className="h-2"
                                />
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground font-body">
                                <span>{Math.round(daysElapsed)} days used</span>
                                <span>
                                  {Math.round(percentRemaining)}% remaining
                                </span>
                              </div>
                            </div>
                          )}

                          {item.product.notes && (
                            <p className="text-xs text-muted-foreground font-body mt-2 italic line-clamp-1">
                              {item.product.notes}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            data-ocid={`products.edit_button.${i + 1}`}
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleEdit(item)}
                            aria-label="Edit product"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            data-ocid={`products.delete_button.${i + 1}`}
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteId(item.id)}
                            aria-label="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <ProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editItem={editItem}
      />
      <ConfirmDeleteDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isPending={deleteProduct.isPending}
        title="Delete product?"
        description="This will permanently remove the product and all its tracking data."
      />
    </div>
  );
}
