import React from "react";
import DataEmptyPic from "../assets/Empty Data.png";

function DataEmpty({ title, width, pos }) {
  return (
    <div className="flex flex-col">
      <img
        src={DataEmptyPic}
        alt="Gambar Empty Data"
        className={`w-[${width ? width : "50%"}] self-center`}
      />
      <p
        className={`font-bold text-center ${
          pos ? "text-black" : "text-white"
        } text-text`}
      >
        {title ? title : "Tidak Ada Data Yang Ditemukan"}
      </p>
    </div>
  );
}

export default DataEmpty;
