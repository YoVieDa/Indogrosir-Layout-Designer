import React from "react";
import { X } from "react-feather";
import { useSelector } from "react-redux";

function ModalAlert({ open, onClose, children, landscape, successAlert }) {
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
        bg-white rounded-xl shadow p-6 transition-all
        ${open ? "scale-100 opacity-100" : "scale-125 opacity-0"} relative ${
          landscape && successAlert
            ? "w-[50%]"
            : landscape
            ? "w-[30%]"
            : !landscape && successAlert
            ? "w-[80%]"
            : "w-[50%]"
        }
        
      `}
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <button
          onClick={onClose}
          className="absolute p-1 text-gray-400 bg-white rounded-lg top-2 right-2 hover:bg-gray-50 hover:text-gray-600"
        >
          <X size="45px" />
        </button>
        {children}
      </div>
    </div>
  );
}

export default ModalAlert;
