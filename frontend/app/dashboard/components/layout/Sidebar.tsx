import { Home, Settings, Package, Warehouse, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Product Management", icon: Package, href: "/ProductManagement" },
  { name: "Warehouse Management", icon: Warehouse, href: "/WarehouseManagement" },
    { name: "Customer Management", icon: Warehouse, href: "/CustomerManagement" },

  { name: "B2B Sales", icon: BarChart3, href: "/sales" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-gray-900 text-white w-64 h-screen p-4 hidden md:flex flex-col">
      <div className="text-2xl font-bold mb-8">KaloOne</div>
      <nav className="flex-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-800 transition-colors",
              { "bg-gray-800": pathname === item.href }
            )}
          >
            <item.icon size={20} />
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
