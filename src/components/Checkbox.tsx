import React from "react";

const Checkbox: React.FC<{
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}> = ({id, onChange, checked, children}) => {
  return (
    <div className="relative flex items-center">
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
          className="h-6 w-6 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
        />
      </div>
      <label htmlFor={id} className="ml-3 cursor-pointer select-none">
        {children}
      </label>
    </div>
  );
};

export default Checkbox;
