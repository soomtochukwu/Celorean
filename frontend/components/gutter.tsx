import React from "react";

function Gutter({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-9/12 border border-red-500 ml-auto mr-auto">
      {children}
    </div>
  );
}

export default Gutter;
