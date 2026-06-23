import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Card className="w-full max-w-md border border-border/60 shadow-[0_1px_2px_0_rgb(0_0_0/0.03),0_2px_8px_-2px_rgb(0_0_0/0.04)] ring-0">
      <CardHeader className="items-center text-center">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
