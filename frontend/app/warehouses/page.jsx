"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    const res = await api.get("/api/warehouses");
    setWarehouses(res.data);
  };

  const addWarehouse = async () => {
    await api.post("/api/warehouses", { name, location });
    setName("");
    setLocation("");
    fetchWarehouses();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Warehouses</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 rounded"
          placeholder="Warehouse Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={addWarehouse}
        >
          Add
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Location</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map((w) => (
            <tr key={w._id}>
              <td className="border p-2">{w.name}</td>
              <td className="border p-2">{w.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
