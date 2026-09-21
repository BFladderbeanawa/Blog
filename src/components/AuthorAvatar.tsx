import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"

interface AuthorAvatarProps {
  src: string
  alt?: string
  fallback?: string
  className?: string
}

export function AuthorAvatar({ src, alt = "BF", fallback = "BF", className }: AuthorAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={src} alt={alt} className="object-cover" />
      <AvatarFallback className="rounded-none">{fallback}</AvatarFallback>
    </Avatar>
  )
}
