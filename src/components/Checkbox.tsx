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
            // So the keyboard works again.
            // TODO: find a better solution for this.
            (document.activeElement as any).blur();
          }}
          id="comments"
          aria-describedby="comments-description"
          name="comments"
          type="checkbox"
          className="h-6 w-6 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
        />
      </div>
      <div className="ml-3">{children}</div>
    </div>
  );
};

export default Checkbox;
