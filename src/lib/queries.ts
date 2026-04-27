import { supabase, type Sale, type Expense, type Inventory, type Feedback, type Customer } from "./supabase";

export type MonthlyPoint = {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
};

export type CategoryShare = {
  category: string;
  revenue: number;
  orders: number;
};

export type TopProduct = {
  product: string;
  revenue: number;
  units: number;
};

export type LowStockItem = {
  product_id: string;
  product_name: string;
  category: string;
  in_stock: number;
  reorder_level: number;
  warehouse_location: string;
};

export type FeedbackSummary = {
  total: number;
  averageRating: number;
  pending: number;
  ratingDistribution: { rating: number; count: number }[];
};

export type DashboardData = {
  totals: {
    revenue: number;
    expenses: number;
    profit: number;
    grossMargin: number;
    completedOrders: number;
    totalOrders: number;
    averageOrder: number;
    customers: number;
    products: number;
    activeProducts: number;
    pendingFeedback: number;
    lowStockCount: number;
    averageRating: number;
    feedbackCount: number;
  };
  trends: {
    revenueChangePct: number;
    expenseChangePct: number;
    profitChangePct: number;
    averageOrderChangePct: number;
  };
  monthly: MonthlyPoint[];
  categories: CategoryShare[];
  topProducts: TopProduct[];
  lowStock: LowStockItem[];
  feedback: FeedbackSummary;
  recentSales: Sale[];
};

const fmtMonth = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

const monthLabel = (key: string): string => {
  const [y, m] = key.split("-").map(Number);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[m - 1]} ${y}`;
};

const pctChange = (latest: number, previous: number): number => {
  if (previous === 0) return latest === 0 ? 0 : 100;
  return ((latest - previous) / previous) * 100;
};

async function fetchAll<T>(table: string): Promise<T[]> {
  const rows: T[] = [];
  const pageSize = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    rows.push(...(data as T[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

export async function getDashboardData(): Promise<DashboardData> {
  const [sales, expenses, inventory, feedback, customers, products] =
    await Promise.all([
      fetchAll<Sale>("sales"),
      fetchAll<Expense>("expenses"),
      fetchAll<Inventory>("inventory"),
      fetchAll<Feedback>("feedback"),
      fetchAll<Customer>("customers"),
      fetchAll<{ status: string | null }>("products"),
    ]);

  const completed = sales.filter((s) => s.status === "Completed");
  const revenue = completed.reduce((acc, s) => acc + Number(s.amount_sar ?? 0), 0);
  const expenseTotal = expenses.reduce(
    (acc, e) => acc + Number(e.amount_sar ?? 0),
    0,
  );
  const profit = revenue - expenseTotal;
  const grossMargin = revenue === 0 ? 0 : (profit / revenue) * 100;
  const averageOrder = completed.length === 0 ? 0 : revenue / completed.length;

  const monthlyMap = new Map<string, { revenue: number; expenses: number }>();
  for (const s of completed) {
    if (!s.sale_date) continue;
    const key = fmtMonth(s.sale_date);
    const prev = monthlyMap.get(key) ?? { revenue: 0, expenses: 0 };
    monthlyMap.set(key, {
      ...prev,
      revenue: prev.revenue + Number(s.amount_sar ?? 0),
    });
  }
  for (const e of expenses) {
    if (!e.expense_date) continue;
    const key = fmtMonth(e.expense_date);
    const prev = monthlyMap.get(key) ?? { revenue: 0, expenses: 0 };
    monthlyMap.set(key, {
      ...prev,
      expenses: prev.expenses + Number(e.amount_sar ?? 0),
    });
  }
  const monthly: MonthlyPoint[] = [...monthlyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => ({
      month: monthLabel(key),
      revenue: Math.round(v.revenue),
      expenses: Math.round(v.expenses),
      profit: Math.round(v.revenue - v.expenses),
    }));

  const last = monthly.at(-1);
  const prev = monthly.at(-2);
  const trends = {
    revenueChangePct: last && prev ? pctChange(last.revenue, prev.revenue) : 0,
    expenseChangePct: last && prev ? pctChange(last.expenses, prev.expenses) : 0,
    profitChangePct: last && prev ? pctChange(last.profit, prev.profit) : 0,
    averageOrderChangePct: 0,
  };

  const lastMonthOrders = completed.filter(
    (s) => s.sale_date && fmtMonth(s.sale_date) === monthly.at(-1)?.month && false,
  );
  const lastKey = monthly.at(-1)
    ? `${monthly.at(-1)!.month}`
    : null;
  if (lastKey) {
    const monthsKeys = [...monthlyMap.keys()].sort();
    const lk = monthsKeys.at(-1);
    const pk = monthsKeys.at(-2);
    const aov = (key?: string) => {
      if (!key) return 0;
      const ordersInMonth = completed.filter(
        (s) => s.sale_date && fmtMonth(s.sale_date) === key,
      );
      const sum = ordersInMonth.reduce(
        (acc, s) => acc + Number(s.amount_sar ?? 0),
        0,
      );
      return ordersInMonth.length === 0 ? 0 : sum / ordersInMonth.length;
    };
    trends.averageOrderChangePct = pctChange(aov(lk), aov(pk));
  }
  void lastMonthOrders;

  const catMap = new Map<string, { revenue: number; orders: number }>();
  for (const s of completed) {
    const cat = s.category ?? "Uncategorized";
    const cur = catMap.get(cat) ?? { revenue: 0, orders: 0 };
    catMap.set(cat, {
      revenue: cur.revenue + Number(s.amount_sar ?? 0),
      orders: cur.orders + 1,
    });
  }
  const categories: CategoryShare[] = [...catMap.entries()]
    .map(([category, v]) => ({
      category,
      revenue: Math.round(v.revenue),
      orders: v.orders,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const productMap = new Map<string, { revenue: number; units: number }>();
  for (const s of completed) {
    const name = s.product ?? "Unknown";
    const cur = productMap.get(name) ?? { revenue: 0, units: 0 };
    productMap.set(name, {
      revenue: cur.revenue + Number(s.amount_sar ?? 0),
      units: cur.units + 1,
    });
  }
  const topProducts: TopProduct[] = [...productMap.entries()]
    .map(([product, v]) => ({
      product,
      revenue: Math.round(v.revenue),
      units: v.units,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const lowStock: LowStockItem[] = inventory
    .filter(
      (i) =>
        i.in_stock !== null &&
        i.reorder_level !== null &&
        i.in_stock <= i.reorder_level,
    )
    .map((i) => ({
      product_id: i.product_id,
      product_name: i.product_name ?? "—",
      category: i.category ?? "—",
      in_stock: i.in_stock ?? 0,
      reorder_level: i.reorder_level ?? 0,
      warehouse_location: i.warehouse_location ?? "—",
    }))
    .sort((a, b) => a.in_stock - b.in_stock);

  const feedbackTotal = feedback.length;
  const ratings = feedback
    .map((f) => Number(f.rating ?? 0))
    .filter((n) => n > 0);
  const avgRating =
    ratings.length === 0
      ? 0
      : ratings.reduce((acc, n) => acc + n, 0) / ratings.length;
  const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
    rating,
    count: feedback.filter((f) => Number(f.rating) === rating).length,
  }));
  const pendingFeedback = feedback.filter(
    (f) => (f.response_status ?? "").toLowerCase() === "pending",
  ).length;

  const recentSales = [...sales]
    .sort((a, b) => (b.sale_date ?? "").localeCompare(a.sale_date ?? ""))
    .slice(0, 8);

  const activeProducts = (products as { status: string | null }[]).filter(
    (p) => p.status === "Active",
  ).length;

  return {
    totals: {
      revenue: Math.round(revenue),
      expenses: Math.round(expenseTotal),
      profit: Math.round(profit),
      grossMargin: Number(grossMargin.toFixed(1)),
      completedOrders: completed.length,
      totalOrders: sales.length,
      averageOrder: Math.round(averageOrder),
      customers: customers.length,
      products: products.length,
      activeProducts,
      pendingFeedback,
      lowStockCount: lowStock.length,
      averageRating: Number(avgRating.toFixed(2)),
      feedbackCount: feedbackTotal,
    },
    trends,
    monthly,
    categories,
    topProducts,
    lowStock,
    feedback: {
      total: feedbackTotal,
      averageRating: Number(avgRating.toFixed(2)),
      pending: pendingFeedback,
      ratingDistribution,
    },
    recentSales,
  };
}

export type ReportsData = {
  topCustomers: { name: string; tier: string; spent: number; city: string }[];
  cityBreakdown: { city: string; customers: number; revenue: number }[];
  paymentMix: { method: string; orders: number; revenue: number }[];
  expenseByCategory: { category: string; amount: number; share: number }[];
  feedbackByProduct: {
    product: string;
    averageRating: number;
    count: number;
    pending: number;
  }[];
  returnsAndPending: {
    returned: number;
    processing: number;
    completed: number;
    shipped: number;
  };
  monthly: MonthlyPoint[];
  totals: {
    revenue: number;
    expenses: number;
    profit: number;
    grossMargin: number;
  };
};

export async function getReportsData(): Promise<ReportsData> {
  const [sales, expenses, customers, feedback] = await Promise.all([
    fetchAll<Sale>("sales"),
    fetchAll<Expense>("expenses"),
    fetchAll<Customer>("customers"),
    fetchAll<Feedback>("feedback"),
  ]);

  const completed = sales.filter((s) => s.status === "Completed");
  const revenue = completed.reduce((acc, s) => acc + Number(s.amount_sar ?? 0), 0);
  const expenseTotal = expenses.reduce(
    (acc, e) => acc + Number(e.amount_sar ?? 0),
    0,
  );
  const profit = revenue - expenseTotal;
  const grossMargin = revenue === 0 ? 0 : (profit / revenue) * 100;

  const topCustomers = [...customers]
    .sort(
      (a, b) => Number(b.total_spent_sar ?? 0) - Number(a.total_spent_sar ?? 0),
    )
    .slice(0, 8)
    .map((c) => ({
      name: c.name,
      tier: c.loyalty_tier ?? "—",
      spent: Math.round(Number(c.total_spent_sar ?? 0)),
      city: c.city ?? "—",
    }));

  const cityMap = new Map<string, { customers: number; revenue: number }>();
  for (const c of customers) {
    const city = c.city ?? "Unknown";
    const cur = cityMap.get(city) ?? { customers: 0, revenue: 0 };
    cityMap.set(city, {
      customers: cur.customers + 1,
      revenue: cur.revenue + Number(c.total_spent_sar ?? 0),
    });
  }
  const cityBreakdown = [...cityMap.entries()]
    .map(([city, v]) => ({
      city,
      customers: v.customers,
      revenue: Math.round(v.revenue),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const paymentMap = new Map<string, { orders: number; revenue: number }>();
  for (const s of completed) {
    const m = s.payment_method ?? "Unspecified";
    const cur = paymentMap.get(m) ?? { orders: 0, revenue: 0 };
    paymentMap.set(m, {
      orders: cur.orders + 1,
      revenue: cur.revenue + Number(s.amount_sar ?? 0),
    });
  }
  const paymentMix = [...paymentMap.entries()]
    .map(([method, v]) => ({
      method,
      orders: v.orders,
      revenue: Math.round(v.revenue),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const expenseMap = new Map<string, number>();
  for (const e of expenses) {
    const cat = e.category ?? "Uncategorized";
    expenseMap.set(cat, (expenseMap.get(cat) ?? 0) + Number(e.amount_sar ?? 0));
  }
  const totalExp = [...expenseMap.values()].reduce((a, b) => a + b, 0);
  const expenseByCategory = [...expenseMap.entries()]
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount),
      share: totalExp === 0 ? 0 : Number(((amount / totalExp) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.amount - a.amount);

  const fbProductMap = new Map<
    string,
    { sum: number; count: number; pending: number }
  >();
  for (const f of feedback) {
    const p = f.product ?? "Unknown";
    const cur = fbProductMap.get(p) ?? { sum: 0, count: 0, pending: 0 };
    fbProductMap.set(p, {
      sum: cur.sum + Number(f.rating ?? 0),
      count: cur.count + 1,
      pending:
        cur.pending +
        ((f.response_status ?? "").toLowerCase() === "pending" ? 1 : 0),
    });
  }
  const feedbackByProduct = [...fbProductMap.entries()]
    .map(([product, v]) => ({
      product,
      averageRating: v.count === 0 ? 0 : Number((v.sum / v.count).toFixed(2)),
      count: v.count,
      pending: v.pending,
    }))
    .sort((a, b) => a.averageRating - b.averageRating)
    .slice(0, 8);

  const returnsAndPending = {
    returned: sales.filter((s) => s.status === "Returned").length,
    processing: sales.filter((s) => s.status === "Processing").length,
    completed: sales.filter((s) => s.status === "Completed").length,
    shipped: sales.filter((s) => s.status === "Shipped").length,
  };

  const monthlyMap = new Map<string, { revenue: number; expenses: number }>();
  for (const s of completed) {
    if (!s.sale_date) continue;
    const key = fmtMonth(s.sale_date);
    const prev = monthlyMap.get(key) ?? { revenue: 0, expenses: 0 };
    monthlyMap.set(key, {
      ...prev,
      revenue: prev.revenue + Number(s.amount_sar ?? 0),
    });
  }
  for (const e of expenses) {
    if (!e.expense_date) continue;
    const key = fmtMonth(e.expense_date);
    const prev = monthlyMap.get(key) ?? { revenue: 0, expenses: 0 };
    monthlyMap.set(key, {
      ...prev,
      expenses: prev.expenses + Number(e.amount_sar ?? 0),
    });
  }
  const monthly: MonthlyPoint[] = [...monthlyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => ({
      month: monthLabel(key),
      revenue: Math.round(v.revenue),
      expenses: Math.round(v.expenses),
      profit: Math.round(v.revenue - v.expenses),
    }));

  return {
    topCustomers,
    cityBreakdown,
    paymentMix,
    expenseByCategory,
    feedbackByProduct,
    returnsAndPending,
    monthly,
    totals: {
      revenue: Math.round(revenue),
      expenses: Math.round(expenseTotal),
      profit: Math.round(profit),
      grossMargin: Number(grossMargin.toFixed(1)),
    },
  };
}

export async function getProductOptions(): Promise<
  { id: string; name: string; category: string; price: number }[]
> {
  const { data, error } = await supabase
    .from("products")
    .select("product_id, name, category, price_sar, status")
    .eq("status", "Active")
    .order("name");
  if (error) throw new Error(`Failed to fetch products: ${error.message}`);
  return (data ?? []).map((p) => ({
    id: p.product_id as string,
    name: p.name as string,
    category: (p.category as string) ?? "—",
    price: Number(p.price_sar ?? 0),
  }));
}

export async function getCustomerOptions(): Promise<
  { id: string; name: string }[]
> {
  const { data, error } = await supabase
    .from("customers")
    .select("customer_id, name")
    .order("name");
  if (error) throw new Error(`Failed to fetch customers: ${error.message}`);
  return (data ?? []).map((c) => ({
    id: c.customer_id as string,
    name: c.name as string,
  }));
}
