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

// वेयरहाउस के लिए इंटरफ़ेस
interface Warehouse {
  _id: string;
  name: string;
  code: string;
  location: string;
}

const WarehouseManagement = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Warehouse | null>(null);

  const [formState, setFormState] = useState({
    name: "",
    code: "",
    location: "",
  });

  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchWarehouses = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/warehouse", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch warehouses.");
        }

        const data = await res.json();
        setWarehouses(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching warehouses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, [router, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleAddOrUpdateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsFormSubmitting(true);

    const url = isEditMode
      ? `http://localhost:5000/api/warehouse/${currentItem?._id}`
      : "http://localhost:5000/api/warehouse";
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
          throw new Error(errorData.message || "Failed to save warehouse.");
        }
        setIsFormSubmitting(false);
        return;
      }

      const updatedWarehouse = await res.json();

      if (isEditMode) {
        setWarehouses(warehouses.map((warehouse) =>
          warehouse._id === updatedWarehouse._id ? updatedWarehouse : warehouse
        ));
        toast.success("Success", {
          description: "Warehouse updated successfully.",
        });
      } else {
        setWarehouses([...warehouses, updatedWarehouse]);
        toast.success("Success", {
          description: "New warehouse added successfully.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
      toast.error("Error", {
        description: err.message,
      });
      console.error("Error saving warehouse:", err);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDeleteWarehouse = async (id: string) => {
    if (!token) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/warehouse/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete warehouse.");
      }

      setWarehouses(warehouses.filter((warehouse) => warehouse._id !== id));
      toast.success("Success", {
        description: "Warehouse deleted successfully.",
      });
    } catch (err: any) {
      setError(err.message);
      toast.error("Error", {
        description: err.message,
      });
      console.error("Error deleting warehouse:", err);
    }
  };

  const openAddDialog = () => {
    setIsEditMode(false);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (warehouse: Warehouse) => {
    setIsEditMode(true);
    setCurrentItem(warehouse);
    setFormState({
      name: warehouse.name,
      code: warehouse.code,
      location: warehouse.location,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormState({
      name: "",
      code: "",
      location: "",
    });
    setCurrentItem(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-lg font-semibold">Loading warehouses...</p>
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
            <h1 className="text-3xl font-bold">Warehouse Management</h1>
            <Button onClick={openAddDialog}>Add New Warehouse</Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Warehouses</CardTitle>
              <CardDescription>
                A list of all warehouses in your inventory.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouses.length > 0 ? (
                    warehouses.map((warehouse) => (
                      <TableRow key={warehouse._id}>
                        <TableCell className="font-medium">{warehouse.code}</TableCell>
                        <TableCell>{warehouse.name}</TableCell>
                        <TableCell>{warehouse.location}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            onClick={() => openEditDialog(warehouse)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteWarehouse(warehouse._id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500">
                        No warehouses found.
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Warehouse" : "Add New Warehouse"}</DialogTitle>
              <DialogDescription>
                Fill in the details to {isEditMode ? "update" : "add"} a warehouse.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddOrUpdateWarehouse}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
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
                  <Label htmlFor="code" className="text-right">
                    Code
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    value={formState.code}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                    disabled={isEditMode}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formState.location}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isFormSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isFormSubmitting}>
                  {isFormSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Add Warehouse"}
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

export default WarehouseManagement;
