import React from "react";

const Checkbox: React.StatelessComponent<{
  id: string;
  checked: boolean;
  onChange: () => any;
}> = ({id, onChange, checked, children}) => {
  return (
    <div className="relative flex items-center">
      <div className="flex h-5 items-center">
        <input
          checked={checked}
          onChange={onChange}
          id="comments"
          aria-describedby="comments-description"
          name="comments"
          type="checkbox"
          className="h-6 w-6 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </div>
      <div className="ml-3">{children}</div>
    </div>
  );
};

export default Checkbox;
