"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  LayoutDashboard,
  Boxes,
  Package,
  Users,
  BarChart3,
  Settings,
  Menu,
} from "lucide-react";
import Link from "next/link";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Inventory", icon: Boxes, href: "/inventory" },
  { name: "Orders", icon: Package, href: "/orders" },
  { name: "Suppliers", icon: Users, href: "/suppliers" },
  { name: "Reports", icon: BarChart3, href: "/reports" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.aside
      animate={{ width: isOpen ? 240 : 80 }}
      className="h-screen bg-[#4B3F72] text-white flex flex-col shadow-lg"
    >
      {/* Top Section */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        {isOpen && <span className="font-bold text-lg">KaloOne</span>}
        <button onClick={() => setIsOpen(!isOpen)}>
          <Menu size={20} />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[#7C4DFF] transition-colors"
          >
            <item.icon size={20} />
            {isOpen && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 text-xs text-white/60">
        {isOpen && "© 2025 KaloOne"}
      </div>
    </motion.aside>
  );
}
