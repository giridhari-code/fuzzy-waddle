"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export function Topbar() {
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();

  return (
    <header className="flex items-center justify-between bg-white px-6 py-3 shadow-sm sticky top-0 z-50">
      {/* Search Input (Desktop) */}
      <div className="hidden md:block">
        <Input
          placeholder="Search..."
          className="max-w-xs transition-all duration-300 focus:max-w-md"
        />
      </div>

      {/* Mobile Search Icon */}
      <div className="md:hidden">
        {showSearch ? (
          <Input
            autoFocus
            placeholder="Search..."
            className="max-w-[180px] transition-all duration-300"
            onBlur={() => setShowSearch(false)}
          />
        ) : (
          <Search
            className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => setShowSearch(true)}
          />
        )}
      </div>

      {/* Avatar with Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="cursor-pointer">
            <AvatarImage src="/gk-icon.png" alt="GK" />
            <AvatarFallback>GK</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
