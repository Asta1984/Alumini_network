'use client'

import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion } from 'framer-motion'
import type { Tab } from '@/types/tab-types'
import {
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  UserCog,
  Users,
  FileUp,
  ChevronsUpDown,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { useAdminStore } from '@/store/admin.store'
import { useState } from 'react'

interface AdminSidebarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onCollapse?: (collapsed: boolean) => void // ← new: notifies parent of collapse state
}

const sidebarVariants = {
  open: {
    width: '15rem',
  },
  closed: {
    width: '3.05rem',
  },
}

const contentVariants = {
  open: { display: 'block', opacity: 1 },
  closed: { display: 'block', opacity: 1 },
}

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
}

const transitionProps = {
  type: 'tween' as const,
  ease: 'easeOut' as const,
  duration: 0.2,
  staggerChildren: 0.1,
}

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
}

const menuItems: Array<{ label: string; tab: Tab; icon: React.ReactNode }> = [
  { label: 'Students', tab: 'students', icon: <Users className="h-4 w-4" /> },
  { label: 'Alumni Tags', tab: 'users', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Messages', tab: 'messages', icon: <MessageSquare className="h-4 w-4" /> },
]

export function AdminSidebar({ activeTab, onTabChange, onCollapse }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const { admin, logout } = useAdminStore()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  // ← new: single toggle handler that also notifies parent
  const handleMouseEnter = () => {
    setIsCollapsed(false)
    onCollapse?.(false)
  }

  const handleMouseLeave = () => {
    setIsCollapsed(true)
    onCollapse?.(true)
  }

  return (
    <motion.div
      className={cn('sidebar fixed left-0 z-40 h-full shrink-0 border-r border-zinc-800')}
      initial={isCollapsed ? 'closed' : 'open'}
      animate={isCollapsed ? 'closed' : 'open'}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={handleMouseEnter}  // ← replaced inline setIsCollapsed
      onMouseLeave={handleMouseLeave}  // ← replaced inline setIsCollapsed
    >
      <motion.div
        className="relative z-40 flex h-full shrink-0 flex-col bg-zinc-900 text-zinc-300 transition-all"
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            {/* Logo/Org Section */}
            <div className="flex h-13.5 w-full shrink-0 border-b border-zinc-800 p-2">
              <div className="mt-[1.5px] flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button variant="ghost" size="sm" className="flex w-fit items-center gap-2 px-2">
                      <Avatar className="size-4 rounded">
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                      <motion.li variants={variants} className="flex w-fit items-center gap-2">
                        {!isCollapsed && (
                          <>
                            <p className="text-sm font-medium">Admin</p>
                            <ChevronsUpDown className="h-4 w-4 text-zinc-500" />
                          </>
                        )}
                      </motion.li>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem className="flex items-center gap-2">
                      <UserCog className="h-4 w-4" /><button onClick={() => onTabChange('settings')}> Settings</button>
                    </DropdownMenuItem> 
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {/* Navigation Items */}
            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="grow p-2">
                  <div className="flex w-full flex-col gap-1">
                    {menuItems.map(item => (
                      <button
                        key={item.tab}
                        onClick={() => onTabChange(item.tab)}
                        className={cn(
                          'flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-zinc-800 hover:text-white',
                          activeTab === item.tab && 'bg-accent text-white'
                        )}
                      >
                        {item.icon}
                        <motion.span variants={variants}>
                          {!isCollapsed && (
                            <p className="ml-2 text-sm font-medium">{item.label}</p>
                          )}
                        </motion.span>
                      </button>
                    ))}
                    <Separator className="w-full bg-zinc-800" />
                    <button
                      onClick={() => onTabChange('settings')}
                      className={cn(
                        'flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-zinc-800 hover:text-white',
                        activeTab === 'settings' && 'bg-accent text-white'
                      )}
                    >
                      <Settings className="h-4 w-4 shrink-0" />
                      <motion.span variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Settings</p>
                        )}
                      </motion.span>
                    </button>
                    <button
                      onClick={() => onTabChange('import')}
                      className={cn(
                        'flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-zinc-800 hover:text-white',
                        activeTab === 'import' && 'bg-accent text-white'
                      )}
                    >
                      <FileUp className="h-4 w-4 shrink-0" />
                      <motion.span variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Import CSV</p>
                        )}
                      </motion.span>
                    </button>
                  </div>
                </ScrollArea>
              </div>

              {/* Bottom Section */}
              <div className="flex flex-col border-t border-zinc-800 p-2">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full">
                    <div className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-zinc-800 hover:text-white">
                      <Avatar className="size-4">
                        <AvatarFallback>{admin?.name?.charAt(0) || 'A'}</AvatarFallback>
                      </Avatar>
                      <motion.li variants={variants} className="flex w-full items-center gap-2">
                        {!isCollapsed && (
                          <>
                            <p className="text-sm font-medium">{admin?.name || 'Account'}</p>
                            <ChevronsUpDown className="ml-auto h-4 w-4 text-zinc-500" />
                          </>
                        )}
                      </motion.li>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent sideOffset={5}>
                    <div className="flex flex-row items-center gap-2 p-2">
                      <Avatar className="size-6">
                        <AvatarFallback>{admin?.name?.charAt(0) || 'A'}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-medium">{admin?.name}</span>
                        <span className="line-clamp-1 text-xs text-muted-foreground">{admin?.email}</span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  )
}