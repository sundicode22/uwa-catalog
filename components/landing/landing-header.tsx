"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { MenuIcon } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { AppLogo } from "@/components/brand/app-logo"
import { LocaleSwitcher } from "@/components/locale-switcher"
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
  const t = useTranslations("nav")
  const tLanding = useTranslations("landing")
  const [scrolled, setScrolled] = useState(false)

  const features = [
    {
      title: tLanding("navStorefronts"),
      href: "#features",
      description: tLanding("navStorefrontsDesc"),
    },
    {
      title: tLanding("navInventory"),
      href: "#features",
      description: tLanding("navInventoryDesc"),
    },
    {
      title: tLanding("navOptions"),
      href: "#features",
      description: tLanding("navOptionsDesc"),
    },
    {
      title: tLanding("navWhatsapp"),
      href: "#features",
      description: tLanding("navWhatsappDesc"),
    },
  ]

  const productLinks = [
    { label: t("features"), href: "#features" },
    { label: t("howItWorks"), href: "#how-it-works" },
    { label: t("pricing"), href: "#pricing" },
    { label: t("testimonials"), href: "#testimonials" },
    { label: t("faq"), href: "#faq" },
  ]

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
        <AppLogo size="md" className="justify-self-start" />

        <NavigationMenu
          className="hidden max-w-none flex-none justify-self-center lg:flex"
          viewport={false}
        >
          <NavigationMenuList className="gap-1">
            <NavigationMenuItem>
              <NavigationMenuTrigger>{t("features")}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[420px] gap-1 p-2 md:grid-cols-2">
                  {features.map((item) => (
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
                <a href="#how-it-works">{t("howItWorks")}</a>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <a href="#pricing">{t("pricing")}</a>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <a href="#testimonials">{t("testimonials")}</a>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <a href="#faq">{t("faq")}</a>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex shrink-0 items-center justify-end gap-2 justify-self-end">
          <LocaleSwitcher className="hidden h-9 w-[7.5rem] sm:flex" />
          {isLoggedIn && user ? (
            <>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/dashboard">{t("dashboard")}</Link>
              </Button>
              <LandingUserMenu user={user} />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">{t("signup")}</Link>
              </Button>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <MenuIcon className="size-4" />
                <span className="sr-only">{t("openMenu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
                <AppLogo size="md" />
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {productLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="my-3 border-t border-border" />
                <LocaleSwitcher className="mb-2 w-full" />
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  >
                    {t("dashboard")}
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                    >
                      {t("login")}
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-medium text-primary-foreground"
                    >
                      {t("signup")}
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
