"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

interface CtaButtonProps extends React.ComponentProps<typeof Button> {
  href: string
  label: string
  icon?: React.ReactNode
}

export function CtaButton({ href, label, icon, className, ...props }: CtaButtonProps) {
  return (
    <Button asChild className={className} {...props}>
      <Link href={href} aria-label={label} prefetch={false}>
        <span>{label}</span>
        {icon ? <span className="size-4">{icon}</span> : null}
      </Link>
    </Button>
  )
}
