import React from "react";
import { useNavigate } from "react-router-dom";

function Package({ label, activePeriod, path }) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/pembayaran");
  };

  return (
    <button
      onClick={handleNavigate}
      className="items-center bg-white w-[210px] active:bg-gray-100 bg-stroke rounded-xl p-5 shadow-lg"
    >
      <p className="font-bold">{label}</p>
      <p>{activePeriod}</p>
    </button>
  );
}

export default Package;
