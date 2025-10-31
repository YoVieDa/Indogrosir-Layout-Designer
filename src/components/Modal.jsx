import React from "react";
import { X } from "react-feather";

function Modal({ open, onClose, children, customWidth, customHeight, landscape }) {
  return (
    <div
      className={`
      fixed inset-0 flex justify-center items-center transition-colors
      ${open ? "visible bg-black/20" : "invisible"} z-20
    `}
    >
      {/* modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
        bg-white rounded-xl shadow transition-all
        ${open ? "scale-100 opacity-100" : "scale-125 opacity-0"} relative 
        w-[${customWidth ? `${customWidth}%` : "30%"}]
        h-[${customHeight ? `${customHeight}%` : "30%"}]
      `}
      >
        <button
          onClick={onClose}
          className="absolute p-1 text-white rounded-lg top-2 right-2 hover:bg-gray-50 hover:text-gray-600"
        >
          <X size="20px" />
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
