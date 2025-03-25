
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    // Create a stable ref to avoid unnecessary re-renders
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    
    // Store focus state
    const [hasFocus, setHasFocus] = React.useState(false);
    
    // When the external ref changes, update our local ref
    React.useEffect(() => {
      if (typeof ref === 'function') {
        ref(inputRef.current);
      } else if (ref) {
        ref.current = inputRef.current;
      }
    }, [ref]);

    // Store cursor position to restore it when component re-renders
    const cursorPositionRef = React.useRef<number | null>(null);

    // Handle focus event
    const handleFocus = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setHasFocus(true);
      if (props.onFocus) {
        props.onFocus(e);
      }
    }, [props.onFocus]);

    // Handle blur event
    const handleBlur = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setHasFocus(false);
      if (props.onBlur) {
        props.onBlur(e);
      }
    }, [props.onBlur]);

    // Save cursor position before re-render
    React.useEffect(() => {
      if (hasFocus && inputRef.current) {
        cursorPositionRef.current = inputRef.current.selectionStart;
      }
    });

    // Restore cursor position after re-render
    React.useEffect(() => {
      if (hasFocus && inputRef.current && cursorPositionRef.current !== null) {
        inputRef.current.selectionStart = cursorPositionRef.current;
        inputRef.current.selectionEnd = cursorPositionRef.current;
      }
    });

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={inputRef}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
