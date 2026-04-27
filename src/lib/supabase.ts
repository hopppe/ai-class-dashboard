import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment.",
  );
}

export type Sale = {
  id: number;
  sale_date: string | null;
  customer_name: string | null;
  product: string | null;
  category: string | null;
  amount_sar: number | null;
  status: string | null;
  payment_method: string | null;
  notes: string | null;
};

export type Expense = {
  id: number;
  expense_date: string | null;
  category: string | null;
  description: string | null;
  amount_sar: number | null;
  payment_method: string | null;
  recurring: boolean | null;
};

export type Customer = {
  customer_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  join_date: string | null;
  loyalty_tier: string | null;
  total_spent_sar: number | null;
};

export type Product = {
  product_id: string;
  name: string;
  category: string | null;
  price_sar: number | null;
  cost_sar: number | null;
  stock_quantity: number | null;
  supplier: string | null;
  status: string | null;
};

export type Inventory = {
  product_id: string;
  product_name: string | null;
  category: string | null;
  in_stock: number | null;
  reorder_level: number | null;
  last_restocked: string | null;
  warehouse_location: string | null;
  unit_cost_sar: number | null;
};

export type Feedback = {
  id: number;
  feedback_date: string | null;
  customer_name: string | null;
  product: string | null;
  rating: number | null;
  comment: string | null;
  response_status: string | null;
};

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});
