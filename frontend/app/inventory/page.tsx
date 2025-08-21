// app/inventory/page.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Box, DollarSign, Plus } from "lucide-react";
import Layout from "../dashboard/components/layout/Layout";

export default function InventoryDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/inventoryAnalyticsRoutes/dashboard-data",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDashboardData(response.data);
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      }
      // 500 Internal Server Error को भी एक अलग एरर मैसेज में हैंडल करें
      if (err.response && err.response.status === 500) {
        setError("Server error. Please check your backend code.");
      } else {
        setError("Failed to load inventory dashboard.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading inventory dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (


      <div className="flex flex-col items-center justify-center h-screen text-red-500">
        <p>{error}</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No data available.</p>
      </div>
    );
  }

  return (
          <>
       <Layout>
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Inventory Dashboard</h1>

      {/* Top Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalProducts}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardData?.totalRevenue?.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">+18.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Products (Last 30 days)</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.newProducts}</div>
            <p className="text-xs text-muted-foreground">Newly added to inventory</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <div className="grid gap-4 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Warehouse</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dashboardData?.inventoryByWarehouse}>
                <XAxis dataKey="warehouseName" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="totalQuantity" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pending Orders Section */}
      <div className="grid gap-4 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Pending Orders (to be fulfilled)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This section will show a list of pending orders that need to be fulfilled from your inventory.</p>
          </CardContent>
        </Card>
      </div>
    </div>

        </Layout>
      </>
  );
}
