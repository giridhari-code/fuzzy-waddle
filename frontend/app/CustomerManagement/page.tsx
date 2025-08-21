"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Mail, Phone, Search, ArrowUpDown } from "lucide-react";

interface Customer {
  _id: string;
  name: string;
  companyName: string;
  email: string;
  phone?: string;
  address?: string;
}

const CustomerManagement = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Customer | null>(null);

  // New state for the search query
  const [searchQuery, setSearchQuery] = useState("");

  const [formState, setFormState] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
  });

  // NEW: State for delete confirmation dialog
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [customerToDeleteId, setCustomerToDeleteId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  // NEW: State for sorting and pagination
  const [sortKey, setSortKey] = useState<keyof Customer | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // As requested by the user

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchCustomers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/sales/customers", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch customers.");
        }

        const data = await res.json();
        setCustomers(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching customers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [router, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleAddOrUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formState.name || !formState.companyName || !formState.email) {
      toast.error("Validation Error", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsFormSubmitting(true);

    const url = isEditMode
      ? `http://localhost:5000/api/sales/customers/${currentItem?._id}` // PUT route
      : "http://localhost:5000/api/sales/customers"; // POST route
    const method = isEditMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
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
          throw new Error(errorData.message || "Failed to save customer.");
        }
        setIsFormSubmitting(false);
        return;
      }

      const updatedCustomer = await res.json();

      if (isEditMode) {
        setCustomers(customers.map((customer) =>
          customer._id === updatedCustomer._id ? updatedCustomer : customer
        ));
        toast.success("Success", {
          description: "Customer updated successfully.",
        });
      } else {
        setCustomers([...customers, updatedCustomer]);
        toast.success("Success", {
          description: "New customer added successfully.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
      toast.error("Error", {
        description: err.message,
      });
      console.error("Error saving customer:", err);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomerToDeleteId(id);
    setIsConfirmDialogOpen(true);
  };

  const confirmDeleteCustomer = async () => {
    if (!token || !customerToDeleteId) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/sales/customers/${customerToDeleteId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete customer.");
      }

      setCustomers(customers.filter((customer) => customer._id !== customerToDeleteId));
      toast.success("Success", {
        description: "Customer deleted successfully.",
      });
    } catch (err: any) {
      setError(err.message);
      toast.error("Error", {
        description: err.message,
      });
      console.error("Error deleting customer:", err);
    } finally {
      setIsConfirmDialogOpen(false);
      setCustomerToDeleteId(null);
    }
  };

  const openAddDialog = () => {
    setIsEditMode(false);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setIsEditMode(true);
    setCurrentItem(customer);
    setFormState({
      name: customer.name,
      companyName: customer.companyName,
      email: customer.email,
      phone: customer.phone || "",
      address: customer.address || "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormState({
      name: "",
      companyName: "",
      email: "",
      phone: "",
      address: "",
    });
    setCurrentItem(null);
  };

  // NEW: Handler for sorting
  const handleSort = (key: keyof Customer) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // NEW: Memoized data with search, sort, and pagination
  const { paginatedCustomers, totalPages } = useMemo(() => {
    let filtered = customers;

    // 1. Filter based on search query
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(lowerCaseQuery) ||
          customer.companyName.toLowerCase().includes(lowerCaseQuery)
      );
    }

    // 2. Sort the filtered customers
    if (sortKey) {
      filtered.sort((a, b) => {
        const aValue = a[sortKey] || "";
        const bValue = b[sortKey] || "";
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    // 3. Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    return { paginatedCustomers: paginated, totalPages };
  }, [customers, searchQuery, sortKey, sortDirection, currentPage]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-lg font-semibold">Loading customers...</p>
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
            <h1 className="text-3xl font-bold">Customer Management</h1>
            <Button onClick={openAddDialog}>Add New Customer</Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Customers</CardTitle>
              <CardDescription>
                A list of all your B2B customers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search by name or company..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to page 1 on search
                  }}
                  className="max-w-sm"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    {/* NEW: Sortable headers */}
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("companyName")}
                    >
                      <div className="flex items-center">
                        Company Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Contact Person
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.length > 0 ? (
                    paginatedCustomers.map((customer) => (
                      <TableRow key={customer._id}>
                        <TableCell className="font-medium">{customer.companyName}</TableCell>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>
                          <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {customer.email}
                          </a>
                        </TableCell>
                        <TableCell>
                          {customer.phone ? (
                            <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {customer.phone}
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{customer.address || "-"}</TableCell>
                        <TableCell className="text-right flex items-center space-x-2 justify-end">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => router.push(`/CustomerManagement/customers/${customer._id}`)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(customer)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer._id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500">
                        {searchQuery ? `No customers found for "${searchQuery}".` : "No customers found."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* NEW: Pagination controls */}
              <div className="flex justify-between items-center mt-4">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Customer" : "Add New Customer"}</DialogTitle>
              <DialogDescription>
                Fill in the details to {isEditMode ? "update" : "add"} a customer.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddOrUpdateCustomer}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="companyName" className="text-right">
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formState.companyName}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Contact Person
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formState.phone}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Address
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formState.address}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isFormSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isFormSubmitting}>
                  {isFormSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Add Customer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog for Deletion */}
        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this customer? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsConfirmDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteCustomer}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </Layout>
      <Toaster />
    </ProtectedRoute>
  );
};

export default CustomerManagement;
