import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleMemberMerah } from "../../../services/redux/memberReducer";
import {
  LogoIGR,
  BgMM2,
  BgMB2,
  IcSaldoPoinMM,
  IcSaldoPoinMB,
  IcPestaMM,
  IcPenukaranMB,
  IcPenukaranMM,
  IcJumlahSkorMM,
  BgMM2Potrait,
  BgMB2Potrait,
} from "../../../assets";
import SwiperComponent from "../../../components/SwiperComponent";
import StandardBtn from "../../../components/StandardBtn";
import { useNavigate } from "react-router-dom";

const menuBtnMemberMerah = [
  {
    icon: IcSaldoPoinMM,
    title: "Saldo Poin IGR",
    path: "/cekSaldoPoinIGR",
  },
  {
    icon: IcPenukaranMM,
    title: "Penukaran Poin IGR",
    path: "/penukaranPoinIGR",
  },
  {
    icon: IcPestaMM,
    title: "Pesta Poin IGR",
    path: "/pestaPoinIGR",
  },
  {
    icon: IcJumlahSkorMM,
    title: "Jumlah Skor",
    path: "/programSkorIGR",
  },
];

const menuBtnMemberBiru = [
  {
    icon: IcSaldoPoinMB,
    title: "Saldo Poin IGR",
    path: "/cekSaldoPoinIGR",
  },
  {
    icon: IcPenukaranMB,
    title: "Penukaran Star",
    path: "/penukaranPoinIGR",
  },
];

function InformasiPoinIGR() {
  const dispatch = useDispatch();
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const navigate = useNavigate();
  const handleToggleMember = () => {
    dispatch(toggleMemberMerah());
  };

  const [isLandscape, setIsLandscape] = useState(false);

  // useEffect(() => {
  //   handleToggleMember();
  // }, []);

  // const [memberMerah, setMemberMerah] = useState(true);

  useEffect(() => {
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

    const updateOrientation = () => {
      const { innerWidth: width, innerHeight: height } = window;

      setIsLandscape(width === 1920 && height === 1080);
    };

    // Mengatur timeout pada saat komponen di-render
    setNewTimeout();

    updateOrientation();

    window.addEventListener("resize", updateOrientation);
    window.addEventListener("click", handleTouch);

    return () => {
      window.removeEventListener("click", handleTouch);
      clearTimeout(newTimeoutId);
      window.removeEventListener("resize", updateOrientation);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className=" flex flex-col gap-10 h-[100%]">
        <img
          src={LogoIGR}
          alt="LogoIGR"
          className={`drop-shadow-lg rounded w-[544px] h-[186px] self-center ${
            isLandscape ? "" : "mt-40"
          }`}
        />
        <p className="font-bold text-center text-black text-title">
          INFORMASI POIN IGR
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

export default InformasiPoinIGR;
