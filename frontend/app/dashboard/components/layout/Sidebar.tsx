// components/AppSidebar.jsx

"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"

import { Home, Package, Warehouse, Users, BarChart3, Settings, LogOut, User } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const items = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Products", url: "/ProductManagement", icon: Package },
  { title: "Warehouses", url: "/WarehouseManagement", icon: Warehouse },
  { title: "Customers", url: "/CustomerManagement", icon: Users },
  { title: "B2B Sales", url: "/sales", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  // प्रोफाइल डेटा के लिए स्टेट
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // पेज लोड होने पर प्रोफाइल डेटा लाने के लिए useEffect हुक
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("No token found. Please log in.")
        setLoading(false)
        router.push("/login") // टोकन नहीं है तो लॉगिन पेज पर भेजें
        return
      }

      try {
        const response = await axios.get("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setUserData(response.data)
      } catch (err) {
        console.error("Failed to fetch profile:", err)
        setError("Failed to load user data.")
        // टोकन एक्सपायर होने पर लॉगआउट करें
        if (err.response && err.response.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, []) // खाली निर्भरता ऐरे का मतलब है कि यह सिर्फ एक बार चलेगा

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="flex flex-col h-full m-3 rounded-2xl border bg-card shadow-lg"
    >
      {/* ===== SIDEBAR CONTENT ===== */}
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="rounded-xl px-3 py-2 transition-all data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-muted"
                  >
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-5 w-5" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ===== SIDEBAR FOOTER (USER PROFILE) ===== */}
      <SidebarFooter className="mt-auto -ml-[15px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center w-full gap-2 rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 ">
              <Avatar className="h-9 w-9 border">
                {/* लोडिंग या डेटा के आधार पर AvatarFallback */}
                <AvatarFallback>
                  {loading ? "..." : (userData?.name ? userData.name.charAt(0).toUpperCase() : "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                {/* लोडिंग या डेटा के आधार पर नाम दिखाएं */}
                <p className="text-sm font-medium truncate">
                  {loading ? "Loading..." : userData?.name || "User"}
                </p>
                {/* लोडिंग या डेटा के आधार पर ईमेल दिखाएं */}
                <p className="text-xs text-muted-foreground truncate">
                  {loading ? "..." : userData?.email || "user@example.com"}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="top" align="end" className="w-48 rounded-xl shadow-lg p-1">
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/profile")}
              className="flex items-start gap-2 px-3 py-2 text-sm"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 dark:hover:bg-red-950 dark:focus:bg-red-950"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
