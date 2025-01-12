import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link href="/">
          <Button variant="ghost" className="font-bold">
            AVEC
          </Button>
        </Link>
      </div>
      {children}
    </div>
  )
} 