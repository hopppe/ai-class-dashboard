"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

const saleSchema = z.object({
  sale_date: z
    .string()
    .min(1, "Date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
  customer_name: z
    .string()
    .max(120, "Customer name is too long")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  product: z.string().min(1, "Product is required").max(160),
  category: z.string().min(1, "Category is required").max(80),
  amount_sar: z.coerce
    .number({ error: "Amount must be a number" })
    .positive("Amount must be greater than zero")
    .max(1_000_000, "Amount looks too high"),
  status: z.enum(["Completed", "Processing", "Shipped", "Returned"]),
  payment_method: z
    .string()
    .max(80)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  notes: z
    .string()
    .max(500, "Notes are too long")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export type SaleActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<keyof z.infer<typeof saleSchema>, string[]>>;
};

export async function createSaleAction(
  _prev: SaleActionState,
  formData: FormData,
): Promise<SaleActionState> {
  const raw = {
    sale_date: formData.get("sale_date"),
    customer_name: formData.get("customer_name"),
    product: formData.get("product"),
    category: formData.get("category"),
    amount_sar: formData.get("amount_sar"),
    status: formData.get("status"),
    payment_method: formData.get("payment_method"),
    notes: formData.get("notes"),
  };

  const parsed = saleSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { error } = await supabase.from("sales").insert(parsed.data);
  if (error) {
    return {
      status: "error",
      message: `Could not save: ${error.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/reports");
  revalidatePath("/entry");

  return {
    status: "success",
    message: `Sale recorded — SAR ${parsed.data.amount_sar.toLocaleString()} for ${parsed.data.product}.`,
  };
}
