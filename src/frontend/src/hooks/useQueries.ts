import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Expense, JourneyEntry, Product } from "../backend.d.ts";
import { useActor } from "./useActor";

// ── Time Conversion Helpers ─────────────────────────────────
export const msToNano = (ms: number): bigint =>
  BigInt(Math.floor(ms)) * 1_000_000n;
export const nanoToMs = (nano: bigint): number => Number(nano / 1_000_000n);
export const nowNano = (): bigint => msToNano(Date.now());

// ── Products ────────────────────────────────────────────────
export type ProductWithId = { id: bigint; product: Product };

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<ProductWithId[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllProducts();
      return result.map((p: Product, i: number) => ({
        id: BigInt(i),
        product: p,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("Not connected");
      return actor.addProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, product }: { id: bigint; product: Product }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProduct(id, product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ── Expenses ────────────────────────────────────────────────
export type ExpenseWithId = { id: bigint; expense: Expense };

export function useGetAllExpenses() {
  const { actor, isFetching } = useActor();
  return useQuery<ExpenseWithId[]>({
    queryKey: ["expenses"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllExpenses();
      return result.map((e: Expense, i: number) => ({
        id: BigInt(i),
        expense: e,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTotalExpenses() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["expenses", "total"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getTotalExpenses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expense: Expense) => {
      if (!actor) throw new Error("Not connected");
      return actor.addExpense(expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useUpdateExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, expense }: { id: bigint; expense: Expense }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateExpense(id, expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useDeleteExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteExpense(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

// ── Journey ─────────────────────────────────────────────────
export type JourneyEntryWithId = { id: bigint; entry: JourneyEntry };

export function useGetAllJourneyEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<JourneyEntryWithId[]>({
    queryKey: ["journey"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllJourneyEntries();
      return result.map((e: JourneyEntry, i: number) => ({
        id: BigInt(i),
        entry: e,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddJourneyEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: JourneyEntry) => {
      if (!actor) throw new Error("Not connected");
      return actor.addJourneyEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journey"] });
    },
  });
}

export function useUpdateJourneyEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, entry }: { id: bigint; entry: JourneyEntry }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateJourneyEntry(id, entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journey"] });
    },
  });
}

export function useDeleteJourneyEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteJourneyEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journey"] });
    },
  });
}

// ── Utility ─────────────────────────────────────────────────
export const categoryColors: Record<string, string> = {
  cleanser: "bg-blue-100 text-blue-700",
  toner: "bg-green-100 text-green-700",
  serum: "bg-purple-100 text-purple-700",
  moisturizer: "bg-amber-100 text-amber-700",
  sunscreen: "bg-orange-100 text-orange-700",
  other: "bg-gray-100 text-gray-700",
};

export function calcProductProgress(product: Product): {
  daysElapsed: number;
  daysRemaining: number;
  totalDays: number;
  percentUsed: number;
  percentRemaining: number;
} {
  const totalDays = Number(product.estimatedDays);
  const startMs = nanoToMs(product.startDate);
  const daysElapsed = Math.max(0, (Date.now() - startMs) / 86_400_000);
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const percentUsed = Math.min(100, (daysElapsed / totalDays) * 100);
  const percentRemaining = Math.max(0, 100 - percentUsed);
  return {
    daysElapsed,
    daysRemaining,
    totalDays,
    percentUsed,
    percentRemaining,
  };
}
