import React from "react";
import { useNavigate } from "react-router-dom";
import { TiArrowBack } from "react-icons/ti";
import { useDispatch } from "react-redux";
import {
  removeItem,
  removeAllItems,
  removeAllItemsHitungTotal,
} from "../services/redux/dtAllInputtedItemReducer";
import {
  addDtTimeStart,
  removeDtTimeStart,
} from "../services/redux/documentInfoReducer";

function StandardBtn({ title, path, color, width, pos, pembayaran }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleNavigate = () => {
    if (pos) {
      dispatch(addDtTimeStart(""));
      dispatch(removeAllItems());
      navigate(path);
    } else if (pembayaran) {
      navigate(path);
      dispatch(removeAllItemsHitungTotal());
    } else {
      navigate(path);
    }
  };

  return (
    <button
      onClick={handleNavigate}
      className={`w-[${
        width !== undefined ? width : "299px"
      }] h-[96px] rounded-xl bg-stroke-white ${
        color === "blue" ? " bg-blue" : "bg-red"
      } p-3 text-subText font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-red to-red3 flex flex-row items-center justify-center gap-4`}
    >
      <TiArrowBack size={70} />
      {title}
    </button>
  );
}

export default StandardBtn;
