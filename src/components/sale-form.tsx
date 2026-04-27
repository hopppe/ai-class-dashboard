"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createSaleAction, type SaleActionState } from "@/app/actions";

type Option = { id: string; name: string; category?: string; price?: number };

type Props = {
  customers: Option[];
  products: Option[];
};

const initialState: SaleActionState = { status: "idle" };

const statusOptions = ["Completed", "Processing", "Shipped", "Returned"];
const paymentOptions = [
  "Credit Card",
  "Bank Transfer",
  "Cash",
  "Apple Pay",
  "Mada",
];

export function SaleForm({ customers, products }: Props) {
  const [state, formAction, isPending] = useActionState(
    createSaleAction,
    initialState,
  );
  const [productId, setProductId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  const selectedProduct = products.find((p) => p.id === productId);
  const inferredCategory = selectedProduct?.category ?? "";

  useEffect(() => {
    if (selectedProduct?.price !== undefined && !amount) {
      setAmount(String(selectedProduct.price));
    }
  }, [selectedProduct, amount]);

  useEffect(() => {
    if (state.status === "success" && formRef.current) {
      formRef.current.reset();
      setProductId("");
      setAmount("");
    }
  }, [state.status]);

  const fieldError = (key: keyof NonNullable<SaleActionState["errors"]>) =>
    state.errors?.[key]?.[0];

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-5 sm:grid-cols-2"
    >
      <Field
        label="Date"
        name="sale_date"
        type="date"
        defaultValue={new Date().toISOString().slice(0, 10)}
        error={fieldError("sale_date")}
        required
      />

      <SelectField
        label="Customer"
        name="customer_name"
        error={fieldError("customer_name")}
        options={[
          { value: "", label: "Walk-in / Unknown" },
          ...customers.map((c) => ({ value: c.name, label: c.name })),
        ]}
      />

      <SelectField
        label="Product"
        name="product"
        value={productId}
        onChange={setProductId}
        valueAttribute="name"
        error={fieldError("product")}
        required
        options={[
          { value: "", label: "Select a product…" },
          ...products.map((p) => ({
            value: p.id,
            label: p.name,
            data: { name: p.name },
          })),
        ]}
      />

      <Field
        label="Category"
        name="category"
        value={inferredCategory}
        readOnly
        placeholder="Select product to autofill"
        error={fieldError("category")}
        required
      />

      <Field
        label="Amount (SAR)"
        name="amount_sar"
        type="number"
        min="0"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={fieldError("amount_sar")}
        required
      />

      <SelectField
        label="Status"
        name="status"
        defaultValue="Completed"
        error={fieldError("status")}
        required
        options={statusOptions.map((s) => ({ value: s, label: s }))}
      />

      <SelectField
        label="Payment Method"
        name="payment_method"
        defaultValue="Credit Card"
        error={fieldError("payment_method")}
        options={[
          { value: "", label: "Not specified" },
          ...paymentOptions.map((m) => ({ value: m, label: m })),
        ]}
      />

      <Field
        label="Notes"
        name="notes"
        placeholder="Optional"
        error={fieldError("notes")}
      />

      <div className="sm:col-span-2 flex items-center justify-between border-t border-rule pt-5">
        <div className="text-xs text-muted">
          {state.status === "success" ? (
            <span className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-800">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-3.5 w-3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {state.message}
            </span>
          ) : state.status === "error" ? (
            <span className="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-800">
              {state.message}
            </span>
          ) : (
            <span className="font-serif italic">
              All fields validated server-side before save.
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md border border-ink bg-ink px-5 py-2.5 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Record sale"}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className="h-4 w-4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h14" />
            <path d="M13 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  readOnly?: boolean;
  min?: string;
  step?: string;
  error?: string;
};

function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  value,
  onChange,
  required,
  readOnly,
  min,
  step,
  error,
}: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        required={required}
        placeholder={placeholder}
        min={min}
        step={step}
        className={`rounded-md border bg-background px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink ${
          error ? "border-rose-400" : "border-rule"
        } ${readOnly ? "bg-foreground/[0.04] text-muted" : ""}`}
      />
      {error ? <span className="text-xs text-rose-700">{error}</span> : null}
    </label>
  );
}

type SelectFieldOption = {
  value: string;
  label: string;
  data?: { name?: string };
};

type SelectFieldProps = {
  label: string;
  name: string;
  options: SelectFieldOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (val: string) => void;
  valueAttribute?: "name";
  required?: boolean;
  error?: string;
};

function SelectField({
  label,
  name,
  options,
  defaultValue,
  value,
  onChange,
  valueAttribute,
  required,
  error,
}: SelectFieldProps) {
  const isControlled = value !== undefined;

  if (valueAttribute === "name" && isControlled) {
    const selected = options.find((o) => o.value === value);
    return (
      <label className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          {label}
          {required ? " *" : ""}
        </span>
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`rounded-md border bg-background px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink ${
            error ? "border-rose-400" : "border-rule"
          }`}
          required={required}
        >
          {options.map((o) => (
            <option key={o.value || o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          type="hidden"
          name={name}
          value={selected?.data?.name ?? ""}
        />
        {error ? <span className="text-xs text-rose-700">{error}</span> : null}
      </label>
    );
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
        {required ? " *" : ""}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className={`rounded-md border bg-background px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink ${
          error ? "border-rose-400" : "border-rule"
        }`}
        required={required}
      >
        {options.map((o) => (
          <option key={o.value || o.label} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-rose-700">{error}</span> : null}
    </label>
  );
}
