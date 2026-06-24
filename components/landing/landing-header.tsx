"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { getSiteName } from "@/lib/seo/site"
import { LANDING_NAV } from "@/lib/landing/content"
import { cn } from "@/lib/utils"
import { LandingUserMenu } from "./landing-user-menu"

interface LandingHeaderProps {
  isLoggedIn: boolean
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}

export function LandingHeader({ isLoggedIn, user }: LandingHeaderProps) {
  const siteName = getSiteName()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-border bg-background shadow-sm"
          : "border-b border-transparent bg-transparent shadow-none"
      )}
    >
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            {siteName.slice(0, 1)}
          </span>
          <span className="hidden sm:inline">{siteName}</span>
        </Link>

        <NavigationMenu
          className="hidden max-w-none flex-none justify-self-center lg:flex"
          viewport={false}
        >
          <NavigationMenuList className="gap-1">
            <NavigationMenuItem>
              <NavigationMenuTrigger>Features</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[420px] gap-1 p-2 md:grid-cols-2">
                  {LANDING_NAV.features.map((item) => (
                    <li key={item.title}>
                      <NavigationMenuLink asChild>
                        <a
                          href={item.href}
                          className="block rounded-lg p-3 no-underline transition-colors hover:bg-muted"
                        >
                          <div className="text-sm font-medium">{item.title}</div>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {item.description}
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <a href="#how-it-works">How it works</a>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <a href="#pricing">Pricing</a>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <a href="#testimonials">Testimonials</a>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <a href="#faq">FAQ</a>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex shrink-0 items-center justify-end gap-2 justify-self-end">
          {isLoggedIn && user ? (
            <>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <LandingUserMenu user={user} />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <MenuIcon className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>{siteName}</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {LANDING_NAV.product.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="my-3 border-t border-border" />
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-medium text-primary-foreground"
                    >
                      Get started
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
