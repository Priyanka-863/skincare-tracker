import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type JourneyEntryId = bigint;
export type Time = bigint;
export interface JourneyEntry {
    breakoutsCount: bigint;
    hydrationLevel: bigint;
    date: Time;
    overallRating: bigint;
    notes: string;
    skinCondition: string;
}
export type ExpenseId = bigint;
export type ProductId = bigint;
export interface Expense {
    date: Time;
    productName: string;
    notes: string;
    category: ProductCategory;
    amount: number;
}
export interface UserProfile {
    name: string;
}
export interface Product {
    isFinished: boolean;
    purchasePrice: number;
    name: string;
    notes: string;
    category: ProductCategory;
    estimatedDays: bigint;
    startDate: Time;
}
export enum ProductCategory {
    sunscreen = "sunscreen",
    toner = "toner",
    cleanser = "cleanser",
    other = "other",
    serum = "serum",
    moisturizer = "moisturizer"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addExpense(expense: Expense): Promise<ExpenseId>;
    addJourneyEntry(entry: JourneyEntry): Promise<JourneyEntryId>;
    addProduct(product: Product): Promise<ProductId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteExpense(expenseId: ExpenseId): Promise<void>;
    deleteJourneyEntry(entryId: JourneyEntryId): Promise<void>;
    deleteProduct(productId: ProductId): Promise<void>;
    getAllExpenses(): Promise<Array<Expense>>;
    getAllJourneyEntries(): Promise<Array<JourneyEntry>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExpense(expenseId: ExpenseId): Promise<Expense>;
    getJourneyEntry(entryId: JourneyEntryId): Promise<JourneyEntry>;
    getProduct(productId: ProductId): Promise<Product>;
    getTotalExpenses(): Promise<number>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateExpense(expenseId: ExpenseId, expense: Expense): Promise<void>;
    updateJourneyEntry(entryId: JourneyEntryId, entry: JourneyEntry): Promise<void>;
    updateProduct(productId: ProductId, product: Product): Promise<void>;
}
