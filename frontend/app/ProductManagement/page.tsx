"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../dashboard/components/layout/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
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
  CardFooter,
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

interface Product {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  unit?: string;
  price: number;
  cost: number;
}

const ProductManagement = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Product | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [totalProducts, setTotalProducts] = useState(0);

  const [formState, setFormState] = useState({
    name: "",
    sku: "",
    description: "",
    unit: "",
    price: 0,
    cost: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Debounce logic for search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Fetch products with search + pagination
  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    const fetchProducts = async () => {
      setLoading(true);
      setError(null); // reset old error
      try {
        const url = `http://localhost:5000/api/product-management?page=${currentPage}&limit=${itemsPerPage}&search=${debouncedSearchTerm}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage =
            errorData.message ||
            "Unable to fetch products at the moment. Please try again later.";
          throw new Error(errorMessage);
        }

        const data = await res.json();
        setProducts(data.products);
        setTotalProducts(data.totalProducts);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message);
        toast.error("Error fetching products", {
          description: err.message,
        });
        setProducts([]); // clear data on error
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [router, token, currentPage, itemsPerPage, debouncedSearchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleAddOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!formState.name || !formState.sku || formState.price <= 0 || formState.cost <= 0) {
      toast.error("Validation Error", {
        description: "Please fill in all required fields and ensure price and cost are valid.",
      });
      return;
    }
    setIsFormSubmitting(true);
    const url = isEditMode
      ? `http://localhost:5000/api/product-management/${currentItem?._id}`
      : "http://localhost:5000/api/product-management";
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
          throw new Error(errorData.message || "Failed to save product.");
        }
        setIsFormSubmitting(false);
        return;
      }
      setCurrentPage(1);
      toast.success("Success", {
        description: isEditMode ? "Product updated successfully." : "New product added successfully.",
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
      toast.error("Error", {
        description: err.message,
      });
      console.error("Error saving product:", err);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/product-management/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete product.");
      }
      setCurrentPage(1);
      toast.success("Success", {
        description: "Product deleted successfully.",
      });
    } catch (err: any) {
      setError(err.message);
      toast.error("Error", {
        description: err.message,
      });
      console.error("Error deleting product:", err);
    }
  };

  const openAddDialog = () => {
    setIsEditMode(false);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setIsEditMode(true);
    setCurrentItem(product);
    setFormState({
      name: product.name,
      sku: product.sku,
      description: product.description || "",
      unit: product.unit || "",
      price: product.price || 0,
      cost: product.cost || 0,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormState({
      name: "",
      sku: "",
      description: "",
      unit: "",
      price: 0,
      cost: 0,
    });
    setCurrentItem(null);
  };

  const displayedProducts = products;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-8 w-24 ml-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Product Management</h1>
            <Button onClick={openAddDialog}>Add New Product</Button>
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <CardTitle>Your Products</CardTitle>
                  <CardDescription>
                    A list of all products in your inventory.
                  </CardDescription>
                </div>
                <div className="relative w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search products by name or SKU..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Gross Profit</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-red-500">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : displayedProducts.length > 0 ? (
                    displayedProducts.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="font-medium">{product.sku}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>₹{(product.price || 0).toFixed(2)}</TableCell>
                        <TableCell>₹{(product.cost || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          ₹{((product.price || 0) - (product.cost || 0)).toFixed(2)}
                        </TableCell>
                        <TableCell>{product.unit}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            onClick={() => openEditDialog(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500">
                        No products found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage} of {totalPages}
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
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Dialog for Add/Edit Product */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>
                Fill in the details to {isEditMode ? "update" : "add"} a product.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddOrUpdateProduct}>
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
                  <Label htmlFor="sku" className="text-right">
                    SKU
                  </Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={formState.sku}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formState.price}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cost" className="text-right">
                    Cost
                  </Label>
                  <Input
                    id="cost"
                    name="cost"
                    type="number"
                    value={formState.cost}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unit" className="text-right">
                    Unit
                  </Label>
                  <Input
                    id="unit"
                    name="unit"
                    value={formState.unit}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    name="description"
                    value={formState.description}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isFormSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isFormSubmitting}>
                  {isFormSubmitting
                    ? "Saving..."
                    : isEditMode
                    ? "Save Changes"
                    : "Add Product"}
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

export default ProductManagement;
