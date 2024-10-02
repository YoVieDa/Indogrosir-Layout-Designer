import React from "react";
import { useNavigate } from "react-router-dom";

function MenuBtn({
  icon,
  title,
  longest,
  path,
  rounded,
  roundedBot,
  disabled,
}) {
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate(path);
  };
  return (
    <button
      className={`flex flex-col w-[350px] h-[250px] justify-center items-center bg-gradient-to-t  ${
        rounded ? rounded : null
      } p-5 gap-4 text-subText font-bold text-black border bg-stroke transform transition duration-200 active:scale-90 active:shadow-inner ${
        disabled
          ? " from-gray-300 to-gray-300 cursor-not-allowed"
          : "from-gray-200 to-white"
      }`}
      // style={{ height: `${longest * 7}px` }}
      onClick={handleNavigate}
      disabled={disabled}
    >
      <img src={icon} alt="Button" className="self-center" />
      <span className="text-[30px]">{title}</span>
    </button>

    /* <button
      className="flex flex-row w-[40vh] items-center rounded-xl bg-stroke bg-white p-5 gap-4 text-subText font-bold text-black transition duration-200 active:bg-gray-100"
      style={{ height: `${longest * 7}px` }}
      onClick={handleNavigate}
    >
      <img src={icon} alt="Button" />
      <span className="flex-1">{title}</span>
    </button> */
  );
}

export default MenuBtn;
