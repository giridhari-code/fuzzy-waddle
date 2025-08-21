"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Layout from "../dashboard/components/layout/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster, toast } from "sonner";
import { format } from "date-fns";
import { IndianRupee, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Customer {
  _id: string;
  name: string;
  companyName: string;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
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
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderDate: string;
}

interface DashboardData {
  totalSales: number;
  totalCustomers: number;
  totalRevenue: number;
  latestOrders: Order[];
  totalCount: number; // Added for server-side pagination
}

const SalesDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State for pagination and sorting
  const [sortKey, setSortKey] = useState<keyof Customer | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [totalOrders, setTotalOrders] = useState(0);

  // State for new order dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formState, setFormState] = useState({
    customer: "",
    products: [{ product: "", quantity: 1 }],
  });

  // State for delete confirmation dialog
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);


  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const fetchData = useCallback(async () => {
    // Check if token exists before fetching data
    if (!token) {
      console.log("Error: No authentication token found. Redirecting to login.");
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    try {
      console.log("Fetching dashboard data...");
      console.log(`Fetching from: http://localhost:5000/api/sales/dashboard?page=${currentPage}&limit=${itemsPerPage}`);

      const [dashboardRes, customersRes, productsRes] = await Promise.all([
        // Updated fetch URL to include pagination parameters
        fetch(`http://localhost:5000/api/sales/dashboard?page=${currentPage}&limit=${itemsPerPage}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/sales/customers", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/product-management", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (dashboardRes.status === 401 || customersRes.status === 401 || productsRes.status === 401) {
        console.log("Authentication failed (401). Redirecting to login.");
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!dashboardRes.ok || !customersRes.ok || !productsRes.ok) {
        console.error("Fetch response was not OK.");
        const errorData = await dashboardRes.json();
        throw new Error(errorData.message || "Failed to fetch dashboard data.");
      }

      const dashboardData = await dashboardRes.json();
      const customersData = await customersRes.json();
      const productsData = await productsRes.json();

      console.log("Dashboard data fetched successfully:", dashboardData);
      console.log("Customers data fetched successfully:", customersData);
      console.log("Products data fetched successfully:", productsData);

      setDashboardData(dashboardData);
      setCustomers(customersData);
      setProducts(productsData.products);
      // Set the total order count from the backend response, ensuring it's a number
      setTotalOrders(Number(dashboardData.totalCount) || 0);

    } catch (err: any) {
      setError(err.message);
      toast.error("Error", { description: err.message });
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [router, token, currentPage, itemsPerPage]);

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    if (!token) {
      toast.error("Error", { description: "You are not authenticated. Please log in." });
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/sales/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update order status.");
      }

      await fetchData();

      toast.success("Success", { description: `Order ${orderId.substring(0, 8)}... status updated to ${newStatus}.` });
    } catch (err: any) {
      toast.error("Error", { description: err.message });
      console.error("Error updating status:", err);
    }
  };

  const handleDeleteOrder = async () => {
    if (!token || !orderToDelete) {
      toast.error("Error", { description: "You are not authenticated or no order selected." });
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/sales/orders/${orderToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete order.");
      }

      await fetchData();
      setIsDeleteConfirmOpen(false);
      setOrderToDelete(null);

      toast.success("Success", { description: `Order ${orderToDelete.substring(0, 8)}... has been deleted.` });
    } catch (err: any) {
      toast.error("Error", { description: err.message });
      console.error("Error deleting order:", err);
    }
  };

  const resetForm = () => {
    setFormState({
      customer: "",
      products: [{ product: "", quantity: 1 }],
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openDeleteConfirmDialog = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteConfirmOpen(true);
  };

  const handleProductChange = (index: number, field: string, value: string) => {
    const newProducts = [...formState.products];
    if (field === "product") {
      newProducts[index].product = value;
    } else if (field === "quantity") {
      newProducts[index].quantity = parseInt(value) || 1;
    }
    setFormState({ ...formState, products: newProducts });
  };

  const handleAddProductField = () => {
    setFormState({
      ...formState,
      products: [...formState.products, { product: "", quantity: 1 }],
    });
  };

  const handleRemoveProductField = (index: number) => {
    const newProducts = formState.products.filter((_, i) => i !== index);
    setFormState({ ...formState, products: newProducts });
  };

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formState.customer || formState.products.some(p => !p.product || p.quantity < 1)) {
      toast.error("Validation Error", {
        description: "Please select a customer and at least one product with a valid quantity.",
      });
      return;
    }

    setIsFormSubmitting(true);

    try {
      const res = await fetch("http://localhost:5000/api/sales/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formState),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((err: string) => {
            toast.error("Validation failed", { description: err });
          });
        } else {
          throw new Error(errorData.message || "Failed to create order.");
        }
        setIsFormSubmitting(false);
        return;
      }

      toast.success("Success", {
        description: "New order created successfully.",
      });

      setIsDialogOpen(false);
      resetForm();
      await fetchData();
    } catch (err: any) {
      setError(err.message);
      toast.error("Error", {
        description: err.message,
      });
      console.error("Error creating order:", err);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(totalOrders / itemsPerPage);
  const displayOrders = dashboardData?.latestOrders || [];

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [router, token, fetchData, currentPage]); // Added currentPage here

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-lg font-semibold">Loading dashboard...</p>
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
          <h1 className="text-3xl font-bold">B2B Sales Dashboard</h1>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <IndianRupee size={20} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{dashboardData?.totalRevenue?.toFixed(2) ?? '0.00'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <IndianRupee size={20} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.totalSales ?? 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Customers
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.totalCustomers ?? 0}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="space-y-1">
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Showing orders for page {currentPage} of {Math.max(1, totalPages)}.
                </CardDescription>
              </div>
              <Button onClick={openAddDialog}>
                Create New Order
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
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
                    {displayOrders.length > 0 ? (
                      displayOrders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell>{order?.customer?.name}</TableCell>
                          <TableCell>{order?.customer?.companyName}</TableCell>
                          <TableCell>₹{order?.totalAmount?.toFixed(2) ?? '0.00'}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge
                                  className={`capitalize cursor-pointer ${
                                    order.status === 'Pending' ? 'bg-yellow-500 hover:bg-yellow-600' :
                                    order.status === 'Processing' ? 'bg-blue-500 hover:bg-blue-600' :
                                    order.status === 'Shipped' ? 'bg-purple-500 hover:bg-purple-600' :
                                    order.status === 'Delivered' ? 'bg-green-500 hover:bg-green-600' :
                                    order.status === 'Cancelled' ? 'bg-red-500 hover:bg-red-600' : ''
                                  }`}
                                >
                                  {order.status}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                                  <DropdownMenuItem
                                    key={status}
                                    onSelect={() => handleStatusUpdate(order._id, status as Order['status'])}
                                  >
                                    {status}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onSelect={() => openDeleteConfirmDialog(order._id)}
                                  className="text-red-500 focus:bg-red-100"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell>{order?.orderDate ? format(new Date(order.orderDate), "PPP") : 'N/A'}</TableCell>
                          <TableCell className="text-right">
                             <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteConfirmDialog(order._id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete Order</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500">
                          No recent orders found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TooltipProvider>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage} of {Math.max(1, totalPages)}
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </Layout>
      <Toaster />

      {/* Dialog for creating a new order */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new B2B order.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddOrder}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customer" className="text-right">
                  Customer
                </Label>
                <Select onValueChange={(value) => setFormState({ ...formState, customer: value })} value={formState.customer}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.companyName} ({customer.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-4">
                <Label className="block mb-2">Products</Label>
                {formState.products.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <Select
                      onValueChange={(value) => handleProductChange(index, "product", value)}
                      value={item.product}
                      disabled={products.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={products.length > 0 ? "Select a product" : "Loading products..."} />
                      </SelectTrigger>
                      {Array.isArray(products) && products.length > 0 && (
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product._id} value={product._id}>
                              {product.name} ({product.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      )}
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                      className="w-24"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProductField(index)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddProductField}
                  className="mt-2"
                  disabled={products.length === 0}
                >
                  Add Another Product
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isFormSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isFormSubmitting}>
                {isFormSubmitting ? "Creating..." : "Create Order"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Dialog for delete confirmation, replacing window.confirm */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrder}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </ProtectedRoute>
  );
};

export default SalesDashboard;
