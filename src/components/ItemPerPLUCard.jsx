import React, { useState } from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import { PiStarFourBold } from "react-icons/pi";
import { FaPlus, FaMinus } from "react-icons/fa";

function ItemPerPLUCard({ feedbackQty }) {
  const [qtyValue, setQtyValue] = useState(1);

  const handleQtyValue = () => {
    feedbackQty(qtyValue);
  };

  const tambahQty = () => {
    setQtyValue(qtyValue + 1);
    feedbackQty(qtyValue);
  };

  const kurangQty = () => {
    if (qtyValue < 1) {
      setQtyValue(1);
      feedbackQty(qtyValue);
    } else {
      setQtyValue(qtyValue - 1);
      feedbackQty(qtyValue);
    }
  };

  return (
    <div className=" w-[100%] shadow-2xl p-5 rounded-xl bg-white ">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-5">
            <p className="font-bold text-subText">0060411</p>
            <p className="font-bold text-subText">INDOMIE GORENG SPC 80</p>
          </div>
          <p className="font-bold text-[24px]">Disc 50%</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-bold text-subText">Rp.500.000</p>
          <p className="font-bold text-[24px]">Rp.250.000</p>
        </div>
      </div>
      <div className="flex flex-row justify-between p-3 mt-5 bg-yellow rounded-xl">
        <p className="font-bold text-[24px]">Min Belanja 5/PCS</p>
        <p className="font-bold text-[24px]">Rp. 230.000/PCS</p>
      </div>
      <div className="flex flex-row justify-between gap-5 mt-5">
        <button
          // onClick={handleLanjutBtn}
          className={`flex flex-row rounded-xl bg-stroke-white p-5 text-subText items-center gap-5 font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-red to-red3`}
        >
          <RiDeleteBinLine />
          Hapus
        </button>

        <button
          onClick={kurangQty}
          className={`flex justify-center items-center w-24 rounded-xl bg-stroke p-5 text-subText gap-5 font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-gray-200 to-white`}
        >
          <FaMinus className="w-10 text-black" />
        </button>

        <div className="w-24 p-5 border bg-stroke rounded-xl">
          <p className="font-bold text-center text-text">{qtyValue}</p>
        </div>

        <button
          onClick={tambahQty}
          className={`flex justify-center items-center w-24 rounded-xl bg-stroke p-5 text-subText gap-5 font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-gray-200 to-white`}
        >
          <FaPlus className="w-10 text-black" />
        </button>

        <button
          // onClick={handleLanjutBtn}
          className={`flex flex-row rounded-xl bg-stroke-white p-5 text-subText items-center gap-5 font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-green4 to-green5`}
        >
          <PiStarFourBold />
          Cek Promo
        </button>
      </div>
    </div>
  );
}

export default ItemPerPLUCard;
