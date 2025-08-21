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
  monthlyTrends: {
    name: string;
    stockIn: number;
    stockOut: number;
  }[];
  notifications: {
    id: number;
    message: string;
    type: "success" | "warning" | "info";
  }[];
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
}

// --- Reusable Components ---
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
  <Card className="flex flex-col">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`${color} p-2 rounded-md text-white`}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </CardContent>
  </Card>
);

const NotificationItem = ({
  message,
  type,
}: {
  message: string;
  type: "success" | "warning" | "info";
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
    <div className="flex items-start gap-3">
      {icon}
      <p className="text-sm leading-snug">{message}</p>
    </div>
  );
};

// --- Main Dashboard Component ---
export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // --- Data Fetching Logic (Unified) ---
  const fetchData = useCallback(async () => {
    try {
      const [mainRes, salesRes] = await Promise.all([
        fetch("http://localhost:5000/api/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/sales/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (mainRes.status === 401 || salesRes.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!mainRes.ok) throw new Error("Failed to fetch main dashboard data.");

      const mainData = await mainRes.json();
      const salesData = salesRes.ok ? await salesRes.json() : { recentOrders: [] };

      setDashboardData({ ...mainData, ...salesData });
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
    if (window.confirm("Are you sure you want to delete this order?")) {
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
        <div className="flex justify-center items-center h-screen">
          <p className="text-lg font-semibold">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (error || !dashboardData) {
    return (
      <Layout>
        <div className="text-center mt-20 text-red-500 p-4 border rounded-md bg-red-50">
          <p className="font-bold">Error:</p>
          <p>{error || "No data available. Please check the backend connection."}</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Go to Login
          </button>
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
  } = dashboardData;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={`₹${totalRevenue?.toFixed(2) ?? "0.00"}`}
              subtitle="Total revenue generated"
              icon={<IndianRupee className="h-4 w-4" />}
              color="bg-green-500"
            />
            <StatCard
              title="Total Customers"
              value={totalCustomers ?? 0}
              subtitle="Total B2B customers"
              icon={<Users className="h-4 w-4" />}
              color="bg-purple-500"
            />
            <StatCard
              title="Total Inventory"
              value={inventoryStatus.totalItems}
              subtitle={`${inventoryStatus.lowStockItems} Low Stock`}
              icon={<Boxes className="h-4 w-4" />}
              color="bg-blue-500"
            />
            <StatCard
              title="Delivered Orders"
              value={ordersInProgress.delivered}
              subtitle="Orders successfully completed"
              icon={<Package className="h-4 w-4" />}
              color="bg-green-500"
            />
          </div>

          {/* Charts + Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Stock Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="stockIn" fill="#8884d8" name="Stock In" stackId="a" />
                    <Bar dataKey="stockOut" fill="#82ca9d" name="Stock Out" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent className="h-72 overflow-y-auto">
                <div className="space-y-4">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <NotificationItem key={notification.id} message={notification.message} type={notification.type} />
                    ))
                  ) : (
                    <p className="text-center text-gray-500">No new notifications.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock + Suppliers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Low Stock Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Reorder</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory && inventory.length > 0 ? (
                      inventory.map((item) => (
                        <TableRow key={item.sku}>
                          <TableCell className="font-medium">{item.sku}</TableCell>
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell>{item.currentStock}</TableCell>
                          <TableCell>{item.reorder}</TableCell>
                          <TableCell>
                            <Badge variant={item.status === "Low" ? "destructive" : "secondary"}>
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          All items are in good stock.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Suppliers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier Name</TableHead>
                      <TableHead>Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers && suppliers.length > 0 ? (
                      suppliers.map((supplier, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{supplier.supplierName}</TableCell>
                          <TableCell>{supplier.contact}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center">
                          No suppliers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="space-y-1">
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>The most recent orders placed by your B2B customers.</CardDescription>
              </div>
              <Button size="sm" onClick={() => router.push("/sales")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TooltipProvider>
                    {recentOrders && recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell className="font-medium">
                            <TooltipUI>
                              <TooltipTrigger>{order._id.substring(0, 8)}...</TooltipTrigger>
                              <TooltipContent>
                                <p>{order._id}</p>
                              </TooltipContent>
                            </TooltipUI>
                          </TableCell>
                          <TableCell>{order.customer.name}</TableCell>
                          <TableCell>{order.customer.companyName}</TableCell>
                          <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
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
                                  }`}
                                >
                                  {order.status}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
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
                          <TableCell>{format(new Date(order.orderDate), "PPP")}</TableCell>
                          <TableCell className="text-right">
                            <button
                              onClick={() => handleDeleteOrder(order._id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500">
                          No recent orders found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TooltipProvider>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </Layout>
      <Toaster />
    </ProtectedRoute>
  );
}
