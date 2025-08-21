"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../dashboard/components/layout/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Toaster, toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PackageCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface Customer {
  _id: string;
  name: string;
  companyName?: string;
}

interface ProductInOrder {
  product: {
    name: string;
  };
  quantity: number;
}

interface Order {
  _id: string;
  customer: Customer;
  products: ProductInOrder[];
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderDate: string;
}

const statusColors = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Processing': 'bg-blue-100 text-blue-800',
  'Shipped': 'bg-purple-100 text-purple-800',
  'Delivered': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800',
};

const SalesOrdersPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/sales/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch orders.");
        }

        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
        toast.error("Error", { description: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router, token]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredOrders = orders.filter((order) =>
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    if (!token) {
      toast.error("Authentication failed. Please log in again.");
      return;
    }

    try {
      // Optimistic update
      const prevOrders = [...orders];
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));

      const res = await fetch(`http://localhost:5000/api/sales/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update order status.");
      }

      toast.success("Order status updated successfully.");
    } catch (err: any) {
      setError(err.message);
      toast.error("Error", { description: err.message });
      // Revert optimistic update on error
      setOrders(prevOrders);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-lg font-semibold">Loading orders...</p>
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
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Sales & Orders</h1>
            <Button onClick={() => toast.info("Add New Order function not implemented yet")}>
              <Plus className="mr-2 h-4 w-4" /> Add New Order
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-gray-500" />
            <Input
              placeholder="Search by order ID or customer name..."
              value={searchTerm}
              onChange={handleSearch}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">{order._id.substring(0, 8)}...</TableCell>
                      <TableCell>{order.customer.name}</TableCell>
                      <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(order.orderDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[order.status]} hover:bg-transparent`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Update Status
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                              <DropdownMenuItem
                                key={status}
                                onClick={() => handleStatusUpdate(order._id, status as Order['status'])}
                                className={order.status === status ? 'bg-gray-100 font-semibold' : ''}
                              >
                                {status}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Layout>
      <Toaster />
    </ProtectedRoute>
  );
};

export default SalesOrdersPage;
