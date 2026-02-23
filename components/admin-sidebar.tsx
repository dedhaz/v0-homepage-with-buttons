"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Users, Handshake, Truck, Package, Wallet, Settings, LogOut, Factory } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navItems = [
  { title: "Клиенты", href: "/admin/clients", icon: Users },
  { title: "Поставщики", href: "/admin/suppliers", icon: Factory },
  { title: "Сделки", href: "/admin/deals", icon: Handshake },
  { title: "Доставки", href: "/admin/deliveries", icon: Truck },
  { title: "Товары", href: "/admin/products", icon: Package },
  { title: "Финансы", href: "/admin/finances", icon: Wallet },
  { title: "Настройки", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  const [role, setRole] = useState<"admin" | "manager" | "user">("user")

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((result) => {
        if (result?.ok && result.user?.role) {
          setRole(result.user.role)
        }
      })
      .catch(() => {})
  }, [])

  const visibleItems = navItems.filter((item) => {
    if (role === "admin") return true
    if (role === "manager") return true
    return item.href === "/admin/settings"
  })

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/admin/clients" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <span className="text-sm font-bold text-sidebar-primary-foreground">13</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-foreground">Склад 13</span>
            <span className="text-xs text-sidebar-foreground/60">Панель управления</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Меню</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Выйти</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
