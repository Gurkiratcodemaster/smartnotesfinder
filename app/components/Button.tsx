"use client";

import Link from "next/link";
import { type ComponentProps } from "react";

type BaseProps = {
  variant?: "primary" | "outline";
  as?: "button" | "a";
};

// Get the props for the underlying component (button or a)
// and combine them with our custom props.
type ButtonProps = BaseProps & ComponentProps<"button">;
type LinkProps = BaseProps & ComponentProps<typeof Link>;
type Props = ButtonProps | LinkProps;

export function Button(props: Props) {
  const { variant = "primary", className, ...rest } = props;

  // Base styles for all buttons
  const baseClasses = "px-3 py-2 rounded transition font-semibold";

  // Variant-specific styles
  const variantClasses = {
    primary: "bg-white text-black hover:opacity-90",
    outline: "border border-white text-white hover:bg-white hover:text-black",
  };

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Render a Next.js Link if the `href` prop is present
  if ("href" in rest) {
    return <Link className={combinedClasses} {...(rest as LinkProps)} />;
  }

  // Otherwise, render a standard button
  return (
    <button
      className={combinedClasses}
      {...(rest as ButtonProps)}
      type={rest.type || "button"}
    />
  );
}