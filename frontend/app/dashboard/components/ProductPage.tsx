"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Layout from "@/app/dashboard/components/layout/Layout";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token");
      if (t) setToken(t);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!name || !sku || !unit || !price) {
      setError("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/products",
        { name, sku, unit, price: parseFloat(price) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      setSku("");
      setUnit("");
      setPrice("");
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchProducts();
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete product");
      }
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setName(product.name);
    setSku(product.sku);
    setUnit(product.unit);
    setPrice(product.price.toString());
  };

  const handleUpdate = async () => {
    if (!name || !sku || !unit || !price) {
      setError("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:5000/api/products/${editingId}`,
        { name, sku, unit, price: parseFloat(price) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      setName("");
      setSku("");
      setUnit("");
      setPrice("");
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Product Management</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Product" : "Add New Product"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <Input
                placeholder="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="SKU"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
              <Input
                placeholder="Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <Button onClick={editingId ? handleUpdate : handleAddProduct} disabled={loading}>
              {loading ? "Saving..." : (editingId ? "Update Product" : "Add Product")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p>Loading products...</p>}
            {!loading && products.length === 0 && <p>No products found.</p>}
            {!loading && products.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>

                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(product._id)}>

                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
