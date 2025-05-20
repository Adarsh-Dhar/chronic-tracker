"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Activity, BarChart2, FileText, Home, Menu, Settings, X, Lightbulb } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMobile } from "@/hooks/use-mobile"

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Track Symptoms", href: "/track", icon: Activity },
  { name: "Insights", href: "/insights", icon: BarChart2 },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Recommendations", href: "/recommendations", icon: Lightbulb },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Close sidebar when route changes on mobile
    if (isMobile) {
      setIsOpen(false)
    }
  }, [pathname, isMobile])

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">HealthTrack</span>
          {isMobile && (
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", isActive ? "bg-secondary" : "hover:bg-secondary/50")}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.name}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                      layoutId="sidebar-highlight"
                    />
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 mt-auto border-t">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">Jane Doe</p>
            <p className="text-sm text-muted-foreground truncate">jane@example.com</p>
          </div>
          <ModeToggle />
        </div>
      </div>
    </div>
  )

  return (
    <>
      {isMobile && (
        <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50" onClick={() => setIsOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {isMobile ? (
        <motion.div
          className="fixed inset-y-0 left-0 z-40 w-64 bg-background border-r shadow-lg"
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          variants={sidebarVariants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {sidebarContent}
        </motion.div>
      ) : (
        <div className="w-64 border-r h-screen sticky top-0">{sidebarContent}</div>
      )}

      {isMobile && isOpen && <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setIsOpen(false)} />}
    </>
  )
}
