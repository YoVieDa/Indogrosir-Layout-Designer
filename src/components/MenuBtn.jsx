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
  onMenuClickProp,
}) {
  const navigate = useNavigate();
  const handleNavigate = async () => {
    if (title === "Belanja" && onMenuClickProp) {
      await onMenuClickProp();
    } else {
      navigate(path);
    }
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
  );
}

export default MenuBtn;
