import React from "react";

const Checkbox: React.FC<{
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}> = ({id, onChange, checked, children}) => {
  return (
    <div className="relative flex items-start">
      <div className="flex h-5 items-center">
        <input
          checked={checked}
          onChange={(e) => {
            onChange(e.target.checked);
            // Blur so keyboard shortcuts keep working immediately after toggling a setting.
            e.currentTarget.blur();
          }}
          id={id}
          name={id}
          type="checkbox"
          className="h-4 w-4 cursor-pointer rounded border-border bg-surface-subtle text-accent focus:ring-accent focus:ring-offset-0"
        />
      </div>
      <label htmlFor={id} className="ml-2.5 cursor-pointer select-none text-sm leading-5 text-ink">
        {children}
      </label>
    </div>
  );
};

export default Checkbox;
