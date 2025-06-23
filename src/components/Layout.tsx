import * as React from "react";

export const Container = ({children, className = "", ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`max-w-screen-xl mx-auto px-4 ${className}`} {...props}>
    {children}
  </div>
);
