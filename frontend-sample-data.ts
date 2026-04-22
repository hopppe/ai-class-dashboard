// =============================================================
// SAMPLE DATA — AI for Business Leaders (Week 2: Frontend)
// =============================================================
// Paste this into your Next.js project (e.g., src/lib/data.ts)
// and import from your dashboard components.
// Business: Riyadh Roast — a specialty coffee shop in Riyadh
// =============================================================

// --- Metric Cards ---
export const metrics = [
  {
    title: "Total Revenue",
    value: "SAR 934,500",
    change: "+11.3%",
    trend: "up",
    period: "6-month total",
  },
  {
    title: "Drinks Sold",
    value: "38,420",
    change: "+8.7%",
    trend: "up",
    period: "vs last month",
  },
  {
    title: "Avg Ticket",
    value: "SAR 28",
    change: "+2.1%",
    trend: "up",
    period: "vs last month",
  },
  {
    title: "Customer Visits",
    value: "30,150",
    change: "+9.4%",
    trend: "up",
    period: "vs last month",
  },
];

// --- Monthly Revenue (Line/Bar Chart — past 6 months) ---
export const monthlyRevenue = [
  { month: "Sep 2025", revenue: 118000, expenses: 84500 },
  { month: "Oct 2025", revenue: 127500, expenses: 87200 },
  { month: "Nov 2025", revenue: 135800, expenses: 95800 },
  { month: "Dec 2025", revenue: 149200, expenses: 98500 },
  { month: "Jan 2026", revenue: 155500, expenses: 97800 },
  { month: "Feb 2026", revenue: 161200, expenses: 99500 },
];

// --- Weekly Customers (Area Chart) ---
export const weeklyCustomers = [
  { week: "Week 1", customers: 3210 },
  { week: "Week 2", customers: 3340 },
  { week: "Week 3", customers: 3280 },
  { week: "Week 4", customers: 3460 },
  { week: "Week 5", customers: 3520 },
  { week: "Week 6", customers: 3610 },
  { week: "Week 7", customers: 3750 },
  { week: "Week 8", customers: 3690 },
  { week: "Week 9", customers: 3840 },
  { week: "Week 10", customers: 3920 },
  { week: "Week 11", customers: 4010 },
  { week: "Week 12", customers: 4100 },
];

// --- Sales by Category (Pie/Donut Chart) ---
export const salesByCategory = [
  { category: "Hot Drinks", value: 385000, color: "#10b981" },
  { category: "Cold Drinks", value: 198000, color: "#6366f1" },
  { category: "Pastries & Food", value: 152000, color: "#f59e0b" },
  { category: "Bottled/Packaged", value: 72000, color: "#ef4444" },
  { category: "Merchandise", value: 40200, color: "#8b5cf6" },
];

// --- Recent Orders (Table) ---
export const recentOrders = [
  {
    id: "ORD-1847",
    customer: "Faisal Al-Mutairi",
    product: "2x Spanish Latte, 1x Croissant",
    amount: "SAR 52",
    status: "Completed",
    date: "2026-02-28",
  },
  {
    id: "ORD-1846",
    customer: "Reem Al-Otaibi",
    product: "V60 Pour Over, Chocolate Cake",
    amount: "SAR 68",
    status: "Completed",
    date: "2026-02-28",
  },
  {
    id: "ORD-1845",
    customer: "Mansour Al-Fahad",
    product: "3x Iced Matcha, 2x Pistachio Croissant",
    amount: "SAR 85",
    status: "In Progress",
    date: "2026-02-27",
  },
  {
    id: "ORD-1844",
    customer: "Hana Al-Shammari",
    product: "Flat White, Banana Bread",
    amount: "SAR 34",
    status: "Completed",
    date: "2026-02-27",
  },
  {
    id: "ORD-1843",
    customer: "Yousef Badr",
    product: "Cappuccino, Almond Croissant",
    amount: "SAR 38",
    status: "Ready for Pickup",
    date: "2026-02-26",
  },
  {
    id: "ORD-1842",
    customer: "Dalal Ibrahim",
    product: "2x Cold Brew, Cheesecake Slice",
    amount: "SAR 56",
    status: "Completed",
    date: "2026-02-26",
  },
  {
    id: "ORD-1841",
    customer: "Tariq Al-Ghamdi",
    product: "Espresso, Saffron Cake",
    amount: "SAR 29",
    status: "In Progress",
    date: "2026-02-25",
  },
  {
    id: "ORD-1840",
    customer: "Amal Al-Harbi",
    product: "4x Spanish Latte (office order)",
    amount: "SAR 76",
    status: "Ready for Pickup",
    date: "2026-02-25",
  },
];

// --- Reports (for Reports page) ---
export const reports = [
  {
    id: 1,
    title: "February Sales Analysis",
    category: "Finance",
    date: "2026-02-28",
    summary:
      "Revenue up 11.3% over 6 months. Spanish Latte remains the top seller at 22% of all drink orders.",
  },
  {
    id: 2,
    title: "Spanish Latte Growth Report",
    category: "Products",
    date: "2026-02-25",
    summary:
      "Spanish Latte sales grew 34% since launch. Now accounts for 1 in 5 drinks sold. Recommend seasonal variations.",
  },
  {
    id: 3,
    title: "Staff Schedule Optimization",
    category: "Operations",
    date: "2026-02-22",
    summary:
      "Morning rush (7-9 AM) needs 4 baristas minimum. Current 3-person shifts causing 8-min average wait times.",
  },
  {
    id: 4,
    title: "Weekend vs Weekday Traffic",
    category: "Analytics",
    date: "2026-02-18",
    summary:
      "Weekend traffic 40% higher than weekdays. Thursday evenings trending up — consider extended hours.",
  },
  {
    id: 5,
    title: "Bean Supplier Cost Review",
    category: "Procurement",
    date: "2026-02-15",
    summary:
      "Ethiopian Yirgacheffe costs up 12%. Colombian Supremo stable. Recommend locking in 6-month contract.",
  },
  {
    id: 6,
    title: "Customer Satisfaction Pulse",
    category: "Customer Service",
    date: "2026-02-10",
    summary:
      "Google rating steady at 4.7 stars. Top praise: drink quality and ambiance. Top complaint: parking availability.",
  },
];

// --- Team Members (for Team page) ---
export const teamMembers = [
  {
    name: "Khalid Al-Rashid",
    role: "Owner & Manager",
    department: "Management",
    avatar: "KR",
  },
  {
    name: "Noura Hassan",
    role: "Head Barista",
    department: "Coffee Bar",
    avatar: "NH",
  },
  {
    name: "Ahmed Tariq",
    role: "Barista",
    department: "Coffee Bar",
    avatar: "AT",
  },
  {
    name: "Sara Al-Dosari",
    role: "Pastry Chef",
    department: "Kitchen",
    avatar: "SD",
  },
  {
    name: "Omar Ibrahim",
    role: "Evening Shift Lead",
    department: "Coffee Bar",
    avatar: "OI",
  },
  {
    name: "Lina Al-Qahtani",
    role: "Social Media & Marketing",
    department: "Marketing",
    avatar: "LQ",
  },
];

// --- Notifications / Activity Feed ---
export const recentActivity = [
  {
    action: "Large order completed",
    detail: "12x Spanish Latte for office delivery",
    time: "5 minutes ago",
  },
  {
    action: "Low stock alert",
    detail: "Ethiopian Yirgacheffe beans — 2 bags remaining",
    time: "2 hours ago",
  },
  {
    action: "New 5-star review",
    detail: "\"Best Spanish Latte in Riyadh!\" — Google Reviews",
    time: "4 hours ago",
  },
  {
    action: "Equipment maintenance",
    detail: "La Marzocca espresso machine — monthly cleaning completed",
    time: "6 hours ago",
  },
  {
    action: "Catering inquiry",
    detail: "Request for 50 drinks — corporate event on March 8",
    time: "Yesterday",
  },
];
