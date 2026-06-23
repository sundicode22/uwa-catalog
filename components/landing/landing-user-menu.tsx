"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
  StoreIcon,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface LandingUserMenuProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

function initials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }
  return email?.slice(0, 2).toUpperCase() ?? "U"
}

export function LandingUserMenu({ user }: LandingUserMenuProps) {
  const displayName = user.name?.trim() || "Account"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 pl-1.5 pr-2.5 transition-all hover:border-primary/30 hover:bg-primary/5"
        >
          <Avatar className="size-7">
            <AvatarImage src={user.image ?? undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-xs text-primary">
              {initials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-28 truncate sm:inline">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">{displayName}</span>
            {user.email ? (
              <span className="text-xs text-muted-foreground">{user.email}</span>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboardIcon />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/stores">
              <StoreIcon />
              My stores
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <SettingsIcon />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
