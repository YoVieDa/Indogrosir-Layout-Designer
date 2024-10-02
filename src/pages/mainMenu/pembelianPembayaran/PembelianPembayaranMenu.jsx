import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BgMB2,
  BgMB2Potrait,
  BgMM2,
  BgMM2Potrait,
  IcPulsaMB,
  IcPulsaMM,
  IcShoppingMB,
  IcShoppingMM,
  LogoIGR,
} from "../../../assets";
import StandardBtn from "../../../components/StandardBtn";
import SwiperComponent from "../../../components/SwiperComponent";
import { toggleMemberMerah } from "../../../services/redux/memberReducer";
import { useNavigate } from "react-router-dom";

const menuBtnMemberMerah = [
  // {
  //   icon: IcPulsaMM,
  //   title: "Pulsa dan Data",
  //   path: "/pulsaPaketData",
  // },
  {
    icon: IcShoppingMM,
    title: "Belanja",
    path: "/kasirSelfService",
  },
];

const menuBtnMemberBiru = [
  // {
  //   icon: IcPulsaMB,
  //   title: "Pulsa dan Data",
  //   path: "/pulsaPaketData",
  // },
  {
    icon: IcShoppingMB,
    title: "Belanja",
    path: "/kasirSelfService",
  },
];
function PembelianPembayaranMenu() {
  const dispatch = useDispatch();
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const navigate = useNavigate();
  const handleToggleMember = () => {
    dispatch(toggleMemberMerah());
  };
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const updateOrientation = () => {
      const { innerWidth: width, innerHeight: height } = window;

      setIsLandscape(width === 1920 && height === 1080);
    };

    updateOrientation();

    window.addEventListener("resize", updateOrientation);

    let newTimeoutId;

    const handleTouch = () => {
      clearTimeout(newTimeoutId);
      console.log(
        "delayInMilliseconds",
        glLougoutApp["lcLogOutLimitApp"] * 1000
      );
      setNewTimeout();
    };

    const setNewTimeout = () => {
      newTimeoutId = setTimeout(async () => {
        if (memberMerah) {
          navigate("/");
        } else {
          navigate("/");
          dispatch(toggleMemberMerah());
        }
      }, glLougoutApp["lcLogOutLimitApp"] * 1000);
    };

    // Mengatur timeout pada saat komponen di-render
    setNewTimeout();

    window.addEventListener("click", handleTouch);

    return () => {
      window.removeEventListener("click", handleTouch);
      clearTimeout(newTimeoutId);
      window.removeEventListener("resize", updateOrientation);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // useEffect(() => {
  //   handleToggleMember();
  // }, []);

  const bgImage =
    memberMerah && isLandscape
      ? BgMM2
      : !memberMerah && isLandscape
      ? BgMB2
      : memberMerah && !isLandscape
      ? BgMM2Potrait
      : BgMB2Potrait;
  return (
    <div
      className="p-5"
      style={{
        backgroundImage: `url(${bgImage})`,
        height: `${isLandscape ? "1080px" : "1920px"}`,
        width: `${isLandscape ? "1920px" : "1080px"}`,
      }}
    >
      <div className=" flex flex-col gap-10 justify-around h-[100%]">
        <img
          src={LogoIGR}
          alt="LogoIGR"
          className={`drop-shadow-lg rounded w-[544px] h-[186px] self-center ${
            isLandscape ? "" : "mt-40"
          }`}
        />
        <p className="font-bold text-center text-black text-title">
          PEMBELIAN DAN PEMBAYARAN
        </p>

        <SwiperComponent
          data={memberMerah ? menuBtnMemberMerah : menuBtnMemberBiru}
          isLandscape={isLandscape}
        />

        <div className="self-end mt-auto">
          <StandardBtn title="Kembali" path="/mainMenu" btnSize="266px" />
        </div>
      </div>
    </div>
  );
}

export default PembelianPembayaranMenu;
