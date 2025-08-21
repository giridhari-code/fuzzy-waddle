"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../dashboard/components/layout/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import { Toaster, toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { X } from "lucide-react";

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
  status: string;
  orderDate: string;
}

const OrderManagement = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  const [formState, setFormState] = useState({
    customer: "",
    products: [{ product: "", quantity: 1 }],
  });

  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [ordersRes, customersRes, productsRes] = await Promise.all([
          fetch("http://localhost:5000/api/sales/orders", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/sales/customers", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/product-management", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (ordersRes.status === 401 || customersRes.status === 401 || productsRes.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!ordersRes.ok || !customersRes.ok || !productsRes.ok) {
          throw new Error("Failed to fetch data.");
        }

        const ordersData = await ordersRes.json();
        const customersData = await customersRes.json();
        const productsResponseData = await productsRes.json();
        const productsData = await productsResponseData.products.json();

        setOrders(ordersData);
        setCustomers(customersData);
        setProducts(productsData.products || productsData);

        console.log('Fetched products:', productsData); // Yeh line add karen
  console.log('Fetched customers:', customersData); // Yeh line add karen

      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, token]);

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

      const newOrder = await res.json();
      setOrders([...orders, newOrder]);
      toast.success("Success", {
        description: "New order created successfully.",
      });

      setIsDialogOpen(false);
      resetForm();
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

  const resetForm = () => {
    setFormState({
      customer: "",
      products: [{ product: "", quantity: 1 }],
    });
    setCurrentItem(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
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
            <h1 className="text-3xl font-bold">Order Management</h1>
            <Button onClick={openAddDialog}>Create New Order</Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>
                A list of all B2B orders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">{order._id}</TableCell>
                        <TableCell>{order.customer.name}</TableCell>
                        <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>{order.status}</TableCell>
                        <TableCell>{format(new Date(order.orderDate), "PPP")}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Dialog */}
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
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product._id} value={product._id}>
                              {product.name} ({product.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
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
      </Layout>
      <Toaster />
    </ProtectedRoute>
  );
};

export default OrderManagement;
