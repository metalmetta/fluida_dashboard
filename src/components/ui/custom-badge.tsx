
import { Badge } from "./badge"
import { cn } from "@/lib/utils"

export function CustomBadge({
  variant = "default",
  className,
  ...props
}: React.ComponentProps<typeof Badge>) {
  return (
    <Badge
      variant={variant}
      className={cn(
        {
          "bg-success/10 text-success hover:bg-success/20": variant === "success",
        },
        className
      )}
      {...props}
    />
  )
}
