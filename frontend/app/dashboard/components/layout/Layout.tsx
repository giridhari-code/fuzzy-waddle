import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./Sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 p-6">
        {/* Optional: a trigger button to toggle sidebar */}
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}
