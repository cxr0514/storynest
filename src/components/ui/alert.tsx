import * as React from "react"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "warning" | "success"
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      "default": "border-gray-200 bg-gray-50 text-gray-900",
      "destructive": "border-red-200 bg-red-50 text-red-900",
      "warning": "border-yellow-200 bg-yellow-50 text-yellow-900",
      "success": "border-green-200 bg-green-50 text-green-900",
    }
    
    return (
      <div
        ref={ref}
        role="alert"
        className={`relative w-full rounded-lg border p-4 ${variantClasses[variant]} ${className || ''}`}
        {...props}
      />
    )
  }
)

Alert.displayName = "Alert"

type AlertDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`text-sm [&_p]:leading-relaxed ${className || ''}`}
        {...props}
      />
    )
  }
)

AlertDescription.displayName = "AlertDescription"

type AlertTitleProps = React.HTMLAttributes<HTMLHeadingElement>

const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h5
        ref={ref}
        className={`mb-1 font-medium leading-none tracking-tight ${className || ''}`}
        {...props}
      />
    )
  }
)

AlertTitle.displayName = "AlertTitle"

export { Alert, AlertDescription, AlertTitle }
