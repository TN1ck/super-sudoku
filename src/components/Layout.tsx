import * as React from "react";

export const Container = ({children, className = "", ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`mx-auto max-w-screen-xl px-4 print:max-w-none print:px-0 ${className}`} {...props}>
    {children}
  </div>
);
