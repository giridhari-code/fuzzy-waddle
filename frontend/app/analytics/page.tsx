"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../dashboard/components/layout/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster, toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IndianRupee, Boxes, Warehouse, Award, TrendingUp, Users } from "lucide-react";

interface SalesTrend {
  month: string;
  revenue: number;
}

interface TopProduct {
  name: string;
  salesVolume: number;
  revenue: number;
}

interface StockMovement {
  month: string;
  stockIn: number;
  stockOut: number;
}

interface TopCustomer {
  customerName: string;
  companyName: string;
  totalRevenue: number;
}

interface AnalyticsData {
  totalProducts: number;
  totalWarehouses: number;
  totalInventoryValue: number;
  monthlySalesTrends: SalesTrend[];
  topSellingProducts: TopProduct[];
  monthlyStockMovement: StockMovement[]; // New data
  topCustomers: TopCustomer[];         // New data
}

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`${color} p-2 rounded-md text-white`}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const AnalyticsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchAnalyticsData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/analytics/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch analytics data.");
        }

        const data: AnalyticsData = await res.json();
        setAnalyticsData(data);
      } catch (err: any) {
        setError(err.message);
        toast.error("Error", { description: err.message });
        console.error("Error fetching analytics data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [router, token]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-lg font-semibold">Loading analytics...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center mt-20 text-red-500">
          <p>Error: {error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8">
          <h1 className="text-3xl font-bold">Dashboard Analytics</h1>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Products"
              value={analyticsData?.totalProducts ?? 0}
              icon={<Boxes className="h-4 w-4" />}
              color="bg-blue-500"
            />
            <StatCard
              title="Total Warehouses"
              value={analyticsData?.totalWarehouses ?? 0}
              icon={<Warehouse className="h-4 w-4" />}
              color="bg-purple-500"
            />
            <StatCard
              title="Total Inventory Value"
              value={`₹${analyticsData?.totalInventoryValue.toFixed(2) ?? "0.00"}`}
              icon={<IndianRupee className="h-4 w-4" />}
              color="bg-green-500"
            />
             <StatCard
              title="Total Customers"
              value={analyticsData?.totalCustomers ?? 0}
              icon={<Users className="h-4 w-4" />}
              color="bg-pink-500"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Sales Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData?.monthlySalesTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Stock Movement</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData?.monthlyStockMovement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="stockIn" fill="#82ca9d" name="Stock In" />
                    <Bar dataKey="stockOut" fill="#ef4444" name="Stock Out" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 5 Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Sales Volume</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData?.topSellingProducts && analyticsData.topSellingProducts.length > 0 ? (
                      analyticsData.topSellingProducts.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.salesVolume}</TableCell>
                          <TableCell>₹{product.revenue.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-gray-500">
                          No top selling products found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 5 Customers by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead className="text-right">Total Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData?.topCustomers && analyticsData.topCustomers.length > 0 ? (
                      analyticsData.topCustomers.map((customer, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{customer.customerName}</TableCell>
                          <TableCell>{customer.companyName}</TableCell>
                          <TableCell className="text-right">₹{customer.totalRevenue.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-gray-500">
                          No top customers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
      <Toaster />
    </ProtectedRoute>
  );
};

export default AnalyticsPage;
