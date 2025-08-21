// components/inventory-table.js

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Radix UI या Shadcn UI के टेबल कंपोनेंट

export default function InventoryTable({ data }) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Warehouse</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item._id}>
              <TableCell className="font-medium">{item.product_id?.name}</TableCell>
              <TableCell>{item.product_id?.sku}</TableCell>
              <TableCell>{item.warehouse_id?.name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell className="text-right">
                {/* यहाँ Edit और Delete बटन जोड़े जाएंगे */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
