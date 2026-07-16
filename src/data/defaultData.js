export const defaultCategories = [
  { id: "cat-electronics", name: "Electronics", description: "Smart devices, audio and computer accessories", color: "#6366f1", status: "Active", createdAt: "2026-06-02" },
  { id: "cat-accessories", name: "Accessories", description: "Everyday add-ons and device essentials", color: "#0ea5e9", status: "Active", createdAt: "2026-06-05" },
  { id: "cat-lifestyle", name: "Lifestyle", description: "Daily carry and personal utility products", color: "#f59e0b", status: "Active", createdAt: "2026-06-10" },
  { id: "cat-office", name: "Office", description: "Workspace, stationery and productivity products", color: "#10b981", status: "Active", createdAt: "2026-06-14" },
  { id: "cat-home", name: "Home & Living", description: "Home organization and living essentials", color: "#ec4899", status: "Inactive", createdAt: "2026-06-18" },
];

export const defaultSuppliers = [
  { id: "sup-1", name: "Nexa Distribution", contact: "Rayan Ali", email: "sales@nexa.example", phone: "+91 98765 11001", category: "Electronics", rating: 4.8, status: "Active", leadTime: 3, balance: 18400, lastOrder: "2026-07-12" },
  { id: "sup-2", name: "Orbit Accessories", contact: "Diya Menon", email: "hello@orbit.example", phone: "+91 98765 11002", category: "Accessories", rating: 4.6, status: "Active", leadTime: 5, balance: 9200, lastOrder: "2026-07-09" },
  { id: "sup-3", name: "UrbanCraft Supply", contact: "Adil Khan", email: "orders@urbancraft.example", phone: "+91 98765 11003", category: "Lifestyle", rating: 4.3, status: "Active", leadTime: 7, balance: 6700, lastOrder: "2026-07-05" },
  { id: "sup-4", name: "PaperGrid Wholesale", contact: "Meera S", email: "trade@papergrid.example", phone: "+91 98765 11004", category: "Office", rating: 4.1, status: "Paused", leadTime: 6, balance: 3100, lastOrder: "2026-06-28" },
];

export const defaultProducts = [
  { id: "prd-1001", name: "Aero Wireless Headphones", sku: "ELE-AWH-1001", category: "Electronics", supplierId: "sup-1", price: 5999, cost: 3900, stock: 18, reorderLevel: 8, location: "A-01-03", barcode: "89010001001", status: "Active", featured: true, createdAt: "2026-06-20", updatedAt: "2026-07-14" },
  { id: "prd-1002", name: "Nova Mechanical Keyboard", sku: "ELE-NMK-1002", category: "Electronics", supplierId: "sup-1", price: 4499, cost: 2950, stock: 5, reorderLevel: 10, location: "A-02-01", barcode: "89010001002", status: "Active", featured: true, createdAt: "2026-06-21", updatedAt: "2026-07-15" },
  { id: "prd-1003", name: "Flex USB-C Hub 8-in-1", sku: "ACC-FUH-1003", category: "Accessories", supplierId: "sup-2", price: 2799, cost: 1700, stock: 0, reorderLevel: 6, location: "B-01-02", barcode: "89010001003", status: "Active", featured: false, createdAt: "2026-06-23", updatedAt: "2026-07-13" },
  { id: "prd-1004", name: "Pulse Smart Watch", sku: "ELE-PSW-1004", category: "Electronics", supplierId: "sup-1", price: 7499, cost: 5100, stock: 12, reorderLevel: 5, location: "A-03-04", barcode: "89010001004", status: "Active", featured: true, createdAt: "2026-06-24", updatedAt: "2026-07-12" },
  { id: "prd-1005", name: "Slim Leather Wallet", sku: "LIF-SLW-1005", category: "Lifestyle", supplierId: "sup-3", price: 1499, cost: 720, stock: 36, reorderLevel: 10, location: "C-02-01", barcode: "89010001005", status: "Active", featured: false, createdAt: "2026-06-26", updatedAt: "2026-07-10" },
  { id: "prd-1006", name: "Magnetic Phone Stand", sku: "ACC-MPS-1006", category: "Accessories", supplierId: "sup-2", price: 999, cost: 410, stock: 9, reorderLevel: 12, location: "B-03-02", barcode: "89010001006", status: "Active", featured: false, createdAt: "2026-06-27", updatedAt: "2026-07-15" },
  { id: "prd-1007", name: "Focus Desk Organizer", sku: "OFF-FDO-1007", category: "Office", supplierId: "sup-4", price: 1299, cost: 600, stock: 24, reorderLevel: 8, location: "D-01-05", barcode: "89010001007", status: "Active", featured: false, createdAt: "2026-06-29", updatedAt: "2026-07-11" },
  { id: "prd-1008", name: "Eco Notebook Set", sku: "OFF-ENS-1008", category: "Office", supplierId: "sup-4", price: 699, cost: 280, stock: 42, reorderLevel: 15, location: "D-02-02", barcode: "89010001008", status: "Active", featured: false, createdAt: "2026-07-01", updatedAt: "2026-07-09" },
  { id: "prd-1009", name: "Travel Tech Pouch", sku: "LIF-TTP-1009", category: "Lifestyle", supplierId: "sup-3", price: 1899, cost: 920, stock: 7, reorderLevel: 9, location: "C-03-03", barcode: "89010001009", status: "Active", featured: true, createdAt: "2026-07-03", updatedAt: "2026-07-16" },
  { id: "prd-1010", name: "Ambient LED Lamp", sku: "HOM-ALL-1010", category: "Home & Living", supplierId: "sup-3", price: 2299, cost: 1200, stock: 15, reorderLevel: 6, location: "E-01-01", barcode: "89010001010", status: "Draft", featured: false, createdAt: "2026-07-05", updatedAt: "2026-07-08" },
];

export const defaultCustomers = [
  { id: "cus-1", name: "Aisha Rahman", email: "aisha@example.com", phone: "+91 90000 22001", tier: "Gold", orders: 8, spent: 48250, status: "Active", lastOrder: "2026-07-16" },
  { id: "cus-2", name: "Arjun Nair", email: "arjun@example.com", phone: "+91 90000 22002", tier: "Silver", orders: 5, spent: 21940, status: "Active", lastOrder: "2026-07-14" },
  { id: "cus-3", name: "Fathima Noor", email: "fathima@example.com", phone: "+91 90000 22003", tier: "Platinum", orders: 12, spent: 73680, status: "Active", lastOrder: "2026-07-13" },
  { id: "cus-4", name: "Nikhil Joseph", email: "nikhil@example.com", phone: "+91 90000 22004", tier: "Bronze", orders: 2, spent: 5298, status: "Inactive", lastOrder: "2026-06-22" },
  { id: "cus-5", name: "Sana Mariam", email: "sana@example.com", phone: "+91 90000 22005", tier: "Silver", orders: 4, spent: 18760, status: "Active", lastOrder: "2026-07-11" },
];

export const defaultOrders = [
  { id: "ORD-1048", customerId: "cus-1", items: [{ productId: "prd-1001", quantity: 1, price: 5999 }, { productId: "prd-1006", quantity: 2, price: 999 }], status: "Processing", payment: "Paid", channel: "Website", createdAt: "2026-07-16T10:30:00", notes: "Priority delivery" },
  { id: "ORD-1047", customerId: "cus-3", items: [{ productId: "prd-1004", quantity: 1, price: 7499 }], status: "Shipped", payment: "Paid", channel: "Mobile App", createdAt: "2026-07-15T14:15:00", notes: "" },
  { id: "ORD-1046", customerId: "cus-2", items: [{ productId: "prd-1002", quantity: 1, price: 4499 }, { productId: "prd-1008", quantity: 3, price: 699 }], status: "Delivered", payment: "Paid", channel: "Marketplace", createdAt: "2026-07-14T09:45:00", notes: "" },
  { id: "ORD-1045", customerId: "cus-5", items: [{ productId: "prd-1005", quantity: 2, price: 1499 }], status: "Pending", payment: "Pending", channel: "Store", createdAt: "2026-07-13T17:20:00", notes: "Customer will collect" },
  { id: "ORD-1044", customerId: "cus-4", items: [{ productId: "prd-1003", quantity: 1, price: 2799 }], status: "Cancelled", payment: "Refunded", channel: "Website", createdAt: "2026-07-12T12:10:00", notes: "Cancelled by customer" },
  { id: "ORD-1043", customerId: "cus-1", items: [{ productId: "prd-1009", quantity: 1, price: 1899 }], status: "Delivered", payment: "Paid", channel: "Mobile App", createdAt: "2026-07-10T11:00:00", notes: "" },
];

export const defaultMovements = [
  { id: "mov-1", productId: "prd-1002", type: "Stock Out", quantity: 2, note: "Order fulfillment", date: "2026-07-16T11:25:00", user: "Admin" },
  { id: "mov-2", productId: "prd-1009", type: "Stock In", quantity: 12, note: "Supplier delivery", date: "2026-07-16T09:10:00", user: "Admin" },
  { id: "mov-3", productId: "prd-1003", type: "Adjustment", quantity: -1, note: "Damaged item", date: "2026-07-15T16:40:00", user: "Admin" },
  { id: "mov-4", productId: "prd-1006", type: "Stock Out", quantity: 3, note: "Store sale", date: "2026-07-15T13:35:00", user: "Admin" },
  { id: "mov-5", productId: "prd-1001", type: "Return", quantity: 1, note: "Customer return inspected", date: "2026-07-14T15:05:00", user: "Admin" },
];

export const defaultActivities = [
  { id: "act-1", type: "order", title: "Order ORD-1048 created", detail: "Aisha Rahman • 3 items", time: "2026-07-16T10:30:00" },
  { id: "act-2", type: "stock", title: "Stock received", detail: "Travel Tech Pouch • +12 units", time: "2026-07-16T09:10:00" },
  { id: "act-3", type: "product", title: "Product updated", detail: "Nova Mechanical Keyboard", time: "2026-07-15T18:20:00" },
  { id: "act-4", type: "alert", title: "Out of stock alert", detail: "Flex USB-C Hub 8-in-1", time: "2026-07-15T16:45:00" },
  { id: "act-5", type: "supplier", title: "Supplier record updated", detail: "Nexa Distribution", time: "2026-07-14T12:00:00" },
];

export const defaultSettings = {
  companyName: "InventoryPro Labs",
  companyEmail: "admin@inventorypro.example",
  phone: "+91 98765 43210",
  currency: "INR",
  lowStockThreshold: 10,
  taxRate: 18,
  notifications: true,
  emailAlerts: false,
  compactMode: false,
  accent: "indigo",
  profileName: "Muhammed Ashik",
  profileRole: "Administrator",
};
