"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import Layout from "@/app/dashboard/components/layout/Layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Mail, Phone, Eye } from "lucide-react";

// Define the data structures for a Customer and an Order
interface Customer {
  _id: string;
  name: string;
  companyName: string;
  email: string;
  phone?: string;
  address?: string;
}

interface Order {
  _id: string;
  orderDate: string;
  totalAmount: number;
  status: string; // This field should come from the backend. Currently, it is mocked.
}

const CustomerDetailsPage = () => {
  const router = useRouter();
  const { customerId } = useParams() as { customerId: string };

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!customerId || !token) {
      router.push("/login");
      return;
    }

    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        // Updated the API call to explicitly request all orders.
        // The `?limit=-1` query parameter is a common way to do this.
        // If your backend API uses a different parameter (e.g., `all=true`), please update this line.
        const response = await fetch(
          `http://localhost:5000/api/sales/customers/${customerId}/details?limit=-1`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Customer not found with ID: ${customerId}. Please check the customer ID in the URL.`);
          }
          throw new Error(`Failed to fetch customer data. Server responded with status: ${response.status}. Please check if your backend server is running.`);
        }

        const data = await response.json();

        if (!data.customer) {
          throw new Error("Customer data is missing from the API response.");
        }

        // IMPORTANT: The 'status' field is currently being mocked here.
        // For a real-world application, this data should be sent by your backend.
        // Once your backend sends this data, you can remove the next four lines.
        const updatedOrders = data.orders.map((order: Order) => ({
          ...order,
          status: Math.random() > 0.5 ? "Completed" : "Pending",
        }));

        setCustomer(data.customer);
        setOrders(updatedOrders);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching customer data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId, token, router]);

  const calculateTotalSales = () => {
    return orders.reduce((sum, order) => sum + order.totalAmount, 0);
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8 space-y-6">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center mt-20 p-8 bg-red-100 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h2>
          <p className="text-red-600">{error}</p>
          <Button className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout>
        <div className="text-center mt-20 text-gray-500">
          <p>Customer not found.</p>
          <Button className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8 p-6 md:p-8">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
              <CardDescription>
                Detailed information for {customer.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Company Name</h3>
                  <p className="text-gray-600">{customer.companyName}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Contact Person</h3>
                  <p className="text-gray-600">{customer.name}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Total Sales</h3>
                  <p className="text-green-600 font-bold text-xl">
                    ₹{calculateTotalSales().toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Email</h3>
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Mail className="h-4 w-4" />
                    {customer.email}
                  </a>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Phone</h3>
                  {customer.phone ? (
                    <a
                      href={`tel:${customer.phone}`}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Phone className="h-4 w-4" />
                      {customer.phone}
                    </a>
                  ) : (
                    <p className="text-gray-600">-</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {orders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  Recent orders for this customer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {customer.companyName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.orderDate).toLocaleDateString(
                              "en-IN"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{order.totalAmount.toLocaleString("en-IN")}
                          </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                ${order.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/dashboard/sales/orders/${order._id}`)
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default CustomerDetailsPage;
