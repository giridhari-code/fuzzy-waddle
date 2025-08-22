"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  AlertCircle,
  CheckCircle,
  Package,
  Boxes,
  Users,
  Bell,
  IndianRupee,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Toaster, toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { TooltipProvider, Tooltip as TooltipUI, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// --- Interfaces (Data Structures) ---
interface Customer {
  _id: string;
  name: string;
  companyName: string;
}

interface ProductInOrder {
  product: {
    _id: string;
    name: string;
    sku: string;
    price: number;
  };
  quantity: number;
}

interface Order {
  _id: string;
  customer: Customer;
  products: ProductInOrder[];
  totalAmount: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  orderDate: string;
}

interface Notification {
  _id: string;
  message: string;
  type: "success" | "warning" | "info" | "error";
  read: boolean;
  createdAt: string;
}

interface MonthlyTrend {
    name: string;
    stockIn: number;
    stockOut: number;
}

interface TopSellingProduct {
  _id: string;
  name: string;
  sku: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface DashboardData {
  inventoryStatus: {
    totalItems: number;
    lowStockItems: number;
  };
  ordersInProgress: {
    pending: number;
    shipped: number;
    delivered: number;
  };
  monthlyTrends: MonthlyTrend[];
  notifications: Notification[];
  inventory: {
    sku: string;
    itemName: string;
    currentStock: number;
    reorder: number;
    status: "OK" | "Low";
  }[];
  suppliers: {
    supplierName: string;
    contact: string;
  }[];
  recentOrders: Order[];
  totalRevenue?: number;
  totalCustomers?: number;
  topSellingProducts?: TopSellingProduct[];
}

// --- Reusable Components with Improved Design ---
const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}) => (
  <Card className="flex flex-col border-none shadow-md rounded-xl bg-white transition-transform hover:scale-[1.02] hover:shadow-lg">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
      <div className={`p-2 rounded-full ${color} text-white shadow-sm`}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </CardContent>
  </Card>
);

const NotificationItem = ({
  message,
  type,
}: {
  message: string;
  type: "success" | "warning" | "info" | "error";
}) => {
  const icon =
    type === "success" ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : type === "warning" ? (
      <AlertCircle className="h-4 w-4 text-yellow-500" />
    ) : (
      <Bell className="h-4 w-4 text-blue-500" />
    );

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
      {icon}
      <p className="text-sm leading-snug text-gray-800">{message}</p>
    </div>
  );
};

// --- Skeleton Components for Loading State ---
const SkeletonLoader = () => (
  <div className="space-y-8 p-4 md:p-8 animate-pulse bg-gray-50">
    {/* Page Title */}
    <div className="h-10 bg-gray-200 rounded-md w-64 mb-6"></div>

    {/* Stat Cards Skeleton */}
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="h-32 bg-gray-100 rounded-xl border-none shadow-sm"></Card>
      ))}
    </div>

    {/* Charts + Notifications Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 shadow-sm border-none rounded-xl bg-gray-100">
        <CardHeader>
          <div className="h-6 bg-gray-200 w-48 rounded-md mb-2"></div>
          <div className="h-4 bg-gray-200 w-64 rounded-md"></div>
        </CardHeader>
        <CardContent className="h-72 bg-gray-200 rounded-b-xl"></CardContent>
      </Card>
      <Card className="shadow-sm border-none rounded-xl bg-gray-100">
        <CardHeader>
          <div className="h-6 bg-gray-200 w-48 rounded-md mb-2"></div>
          <div className="h-4 bg-gray-200 w-64 rounded-md"></div>
        </CardHeader>
        <CardContent className="h-72 overflow-y-hidden space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg">
              <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 w-full rounded-md"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>

    {/* Tables Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 shadow-sm border-none rounded-xl bg-gray-100">
        <CardHeader>
          <div className="h-6 bg-gray-200 w-48 rounded-md mb-2"></div>
          <div className="h-4 bg-gray-200 w-64 rounded-md"></div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(5)].map((_, i) => (
                    <TableHead key={i}>
                      <div className="h-4 bg-gray-200 w-20 rounded-md"></div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(5)].map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-none rounded-xl bg-gray-100">
        <CardHeader>
          <div className="h-6 bg-gray-200 w-48 rounded-md mb-2"></div>
          <div className="h-4 bg-gray-200 w-64 rounded-md"></div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(2)].map((_, i) => (
                  <TableHead key={i}>
                    <div className="h-4 bg-gray-200 w-24 rounded-md"></div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(4)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(2)].map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>

    {/* Recent Orders Table Skeleton */}
    <Card className="shadow-sm border-none rounded-xl bg-gray-100">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <div className="h-6 bg-gray-200 w-48 rounded-md mb-2"></div>
          <div className="h-4 bg-gray-200 w-64 rounded-md"></div>
        </div>
        <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(6)].map((_, i) => (
                  <TableHead key={i}>
                    <div className="h-4 bg-gray-200 w-20 rounded-md"></div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(6)].map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
);

// --- Main Dashboard Component ---
export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchData = useCallback(async () => {
    setLoading(true); // Start loading state
    try {
      const [mainRes, salesRes, notificationsRes, trendsRes, topSellingRes] = await Promise.all([
        fetch("http://localhost:5000/api/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/sales/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/notifications", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/inventory/trends", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/sales/top-selling", { headers: { Authorization: `Bearer ${token}` } }), // New API call
      ]);

      if (mainRes.status === 401 || salesRes.status === 401 || notificationsRes.status === 401 || trendsRes.status === 401 || topSellingRes.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!mainRes.ok) throw new Error("Failed to fetch main dashboard data.");

      const mainData = await mainRes.json();
      const salesData = salesRes.ok ? await salesRes.json() : { recentOrders: [], totalRevenue: 0, totalCustomers: 0 };
      const notificationsData = notificationsRes.ok ? await notificationsRes.json() : [];
      const trendsData = trendsRes.ok ? await trendsRes.json() : [];
      const topSellingData = topSellingRes.ok ? await topSellingRes.json() : [];

      const ordersData = mainData.ordersInProgress || {
        pending: 0,
        shipped: 0,
        delivered: 0,
      };

      setDashboardData({
        ...mainData,
        ...salesData,
        ordersInProgress: ordersData,
        notifications: notificationsData,
        monthlyTrends: trendsData,
        topSellingProducts: topSellingData, // Set the new data
      });

    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [router, token]);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [router, token, fetchData]);

  // --- Order Management Functions ---
  const handleStatusUpdate = async (orderId: string, newStatus: Order["status"]) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/sales/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update order status.");
      await fetchData();
      toast.success("Success", { description: `Order status updated to ${newStatus}.` });
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!token) return;
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/sales/orders/${orderId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to delete order.");
        await fetchData();
        toast.success("Success", { description: `Order has been deleted.` });
      } catch (err: any) {
        toast.error("Error", { description: err.message });
      }
    }
  };

  // --- UI Rendering ---
  if (loading) {
    return (
      <Layout>
        <SkeletonLoader />
      </Layout>
    );
  }

  if (error || !dashboardData) {
    return (
      <Layout>
        <div className="text-center mt-20 text-red-500 p-6 border-l-4 border-red-500 rounded-md bg-red-50 shadow-sm mx-auto max-w-lg">
          <p className="font-bold text-lg mb-2">Error:</p>
          <p className="text-sm">{error || "No data available. Please check the backend connection."}</p>
          <Button
            onClick={() => router.push("/login")}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Button>
        </div>
      </Layout>
    );
  }

  const {
    inventoryStatus,
    ordersInProgress,
    monthlyTrends,
    notifications,
    inventory,
    suppliers,
    recentOrders,
    totalRevenue,
    totalCustomers,
    topSellingProducts,
  } = dashboardData;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8 p-4 md:p-8 bg-gray-50 min-h-screen">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={`₹${totalRevenue?.toFixed(2) ?? "0.00"}`}
              subtitle="Total revenue generated"
              icon={<IndianRupee className="h-5 w-5" />}
              color="bg-green-500"
            />
            <StatCard
              title="Total Customers"
              value={totalCustomers ?? 0}
              subtitle="Total B2B customers"
              icon={<Users className="h-5 w-5" />}
              color="bg-purple-500"
            />
            <StatCard
              title="Total Inventory"
              value={inventoryStatus.totalItems}
              subtitle={`${inventoryStatus.lowStockItems} Low Stock`}
              icon={<Boxes className="h-5 w-5" />}
              color="bg-blue-500"
            />
            <StatCard
              title="Orders in Progress"
              value={ordersInProgress.pending + ordersInProgress.shipped}
              subtitle={`${ordersInProgress.pending} Pending, ${ordersInProgress.shipped} Shipped`}
              icon={<Package className="h-5 w-5" />}
              color="bg-indigo-500"
            />
          </div>

          {/* Charts + Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-md border-none rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">Monthly Stock Trends</CardTitle>
                <CardDescription className="text-gray-500">Track stock movements over the last 12 months.</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(200, 200, 200, 0.2)' }}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="stockIn" fill="#4ade80" name="Stock In" stackId="a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="stockOut" fill="#f87171" name="Stock Out" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-md border-none rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">Recent Notifications</CardTitle>
                <CardDescription className="text-gray-500">Important alerts and updates.</CardDescription>
              </CardHeader>
              <CardContent className="h-72 overflow-y-auto space-y-2">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <NotificationItem key={notification._id} message={notification.message} type={notification.type} />
                  ))
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-center text-gray-500">No new notifications.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Low Stock + Suppliers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-md border-none rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">Low Stock Inventory</CardTitle>
                <CardDescription className="text-gray-500">Items that need to be reordered soon.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-600">SKU</TableHead>
                      <TableHead className="text-gray-600">Item Name</TableHead>
                      <TableHead className="text-gray-600">Current Stock</TableHead>
                      <TableHead className="text-gray-600">Reorder</TableHead>
                      <TableHead className="text-gray-600">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory && inventory.length > 0 ? (
                      inventory.map((item) => (
                        <TableRow key={item.sku} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-800">{item.sku}</TableCell>
                          <TableCell className="text-gray-700">{item.itemName}</TableCell>
                          <TableCell className="text-gray-700">{item.currentStock}</TableCell>
                          <TableCell className="text-gray-700">{item.reorder}</TableCell>
                          <TableCell>
                            <Badge variant={item.status === "Low" ? "destructive" : "default"} className="capitalize">
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-6">
                          All items are in good stock.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-none rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">Top Suppliers</CardTitle>
                <CardDescription className="text-gray-500">Your most frequent suppliers.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-600">Supplier Name</TableHead>
                      <TableHead className="text-gray-600">Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers && suppliers.length > 0 ? (
                      suppliers.map((supplier, index) => (
                        <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-800">{supplier.supplierName}</TableCell>
                          <TableCell className="text-gray-700">{supplier.contact}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-gray-500 py-6">
                          No suppliers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* New Section: Top-Selling Products */}
          <Card className="shadow-md border-none rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Top-Selling Products</CardTitle>
              <CardDescription className="text-gray-500">Products with the highest sales volume.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-600">Product Name</TableHead>
                      <TableHead className="text-gray-600">SKU</TableHead>
                      <TableHead className="text-right text-gray-600">Total Quantity Sold</TableHead>
                      <TableHead className="text-right text-gray-600">Total Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topSellingProducts && topSellingProducts.length > 0 ? (
                      topSellingProducts.map((product) => (
                        <TableRow key={product._id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-800">{product.name}</TableCell>
                          <TableCell className="text-gray-700">{product.sku}</TableCell>
                          <TableCell className="text-right text-gray-700">{product.totalQuantity}</TableCell>
                          <TableCell className="text-right text-gray-700">₹{product.totalRevenue.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-6">
                          No top-selling products data available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="shadow-md border-none rounded-xl">
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-semibold text-gray-800">Recent Orders</CardTitle>
                <CardDescription className="text-gray-500">The most recent orders placed by your B2B customers.</CardDescription>
              </div>
              <Button size="sm" onClick={() => router.push("/sales")} className="bg-gray-800 text-white hover:bg-gray-900 transition-colors">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-600">Order ID</TableHead>
                      <TableHead className="text-gray-600">Customer</TableHead>
                      <TableHead className="text-gray-600">Company</TableHead>
                      <TableHead className="text-gray-600">Total Amount</TableHead>
                      <TableHead className="text-gray-600">Order Date</TableHead>
                      <TableHead className="text-right text-gray-600">Status & Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TooltipProvider>
                      {recentOrders && recentOrders.length > 0 ? (
                        recentOrders.map((order) => (
                          <TableRow key={order._id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="font-medium text-gray-800">
                              <TooltipUI>
                                <TooltipTrigger>{order._id.substring(0, 8)}...</TooltipTrigger>
                                <TooltipContent>
                                  <p>{order._id}</p>
                                </TooltipContent>
                              </TooltipUI>
                            </TableCell>
                            <TableCell className="text-gray-700">{order.customer.name}</TableCell>
                            <TableCell className="text-gray-700">{order.customer.companyName}</TableCell>
                            <TableCell className="text-gray-700">₹{order.totalAmount.toFixed(2)}</TableCell>
                            <TableCell className="text-gray-700">{format(new Date(order.orderDate), "PPP")}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Badge
                                    className={`capitalize cursor-pointer ${
                                      order.status === "Pending"
                                        ? "bg-yellow-500 hover:bg-yellow-600"
                                        : order.status === "Processing"
                                        ? "bg-blue-500 hover:bg-blue-600"
                                        : order.status === "Shipped"
                                        ? "bg-purple-500 hover:bg-purple-600"
                                        : order.status === "Delivered"
                                        ? "bg-green-500 hover:bg-green-600"
                                        : order.status === "Cancelled"
                                        ? "bg-red-500 hover:bg-red-600"
                                        : ""
                                    } transition-colors`}
                                  >
                                    {order.status}
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
                                    <DropdownMenuItem
                                      key={status}
                                      onSelect={() => handleStatusUpdate(order._id, status as Order["status"])}
                                    >
                                      {status}
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onSelect={() => handleDeleteOrder(order._id)}
                                    className="text-red-500 focus:bg-red-100"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500 py-6">
                            No recent orders found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TooltipProvider>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
      <Toaster />
    </ProtectedRoute>
  );
}
