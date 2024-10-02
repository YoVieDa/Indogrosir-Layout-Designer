import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BgMB2,
  BgMB2Potrait,
  BgMM2,
  BgMM2Potrait,
  IcGetPromoMB,
  IcHadiahMB,
  IcHadiahMM,
  IcHargaHematMM,
  IcPlatinumCardMM,
  IcProdukBaruMB,
  IcProdukBaruMM,
  IcSuperPromoMB,
  IcSuperPromoMM,
  IcTopSpenderMB,
  IcTopSpenderMM,
  IcUniqueCodeMM,
  LogoIGR,
} from "../../../assets";
import StandardBtn from "../../../components/StandardBtn";
import SwiperComponent from "../../../components/SwiperComponent";
import { toggleMemberMerah } from "../../../services/redux/memberReducer";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const menuBtnMemberMerah = [
  {
    icon: IcSuperPromoMM,
    title: "Super Promo",
    path: "/superPromo",
  },
  {
    icon: IcHargaHematMM,
    title: "Harga Hemat",
    path: "/hargaHemat",
  },
  {
    icon: IcPlatinumCardMM,
    title: "Promo Platinum",
    path: "/promoKhusus",
  },
  {
    icon: IcProdukBaruMM,
    title: "Produk Baru",
    path: "/produkBaru",
  },
  {
    icon: IcUniqueCodeMM,
    title: "Unique Code",
    path: "/getPromo",
  },
  {
    icon: IcHadiahMM,
    title: "Info Loyalty IGR",
    path: "/hadiahUntukAnda",
  },
];

const menuBtnMemberMerah2 = [
  {
    icon: IcTopSpenderMM,
    title: "Top Spender",
    path: "/topSpender",
  },
];

const menuBtnMemberBiru = [
  {
    icon: IcSuperPromoMB,
    title: "Super Promo",
    path: "/superPromo",
  },
  {
    icon: IcProdukBaruMB,
    title: "Produk Baru",
    path: "/produkBaru",
  },
  {
    icon: IcGetPromoMB,
    title: "Get Promo",
    path: "/getPromo",
  },
  {
    icon: IcHadiahMB,
    title: "Info Loyalty IGR",
    path: "/hadiahUntukAnda",
  },

  {
    icon: IcTopSpenderMB,
    title: "Top Spender",
    path: "/topSpender",
  },
];

function InformasiPromo() {
  const dispatch = useDispatch();
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const navigate = useNavigate();
  const [isLandscape, setIsLandscape] = useState(false);

  const handleToggleMember = () => {
    dispatch(toggleMemberMerah());
  };

  // useEffect(() => {
  //   handleToggleMember();
  // }, []);

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
      window.removeEventListener("resize", updateOrientation);
      clearTimeout(newTimeoutId);
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
      <div className=" flex flex-col gap-5 justify-around h-[100%]">
        <img
          src={LogoIGR}
          alt="LogoIGR"
          className={`drop-shadow-lg rounded w-[544px] h-[186px] self-center ${
            isLandscape ? "" : "mt-40"
          }`}
        />
        <p className="font-bold text-center text-black text-title">
          INFORMASI PROMOSI IGR
        </p>

        <div className="flex flex-row items-center justify-center gap-3 mt-2 -mb-4">
          <FaArrowLeft />
          <p className="text-[20px] font-bold">GESER</p>
          <FaArrowRight />
        </div>
        <SwiperComponent
          data={memberMerah ? menuBtnMemberMerah : menuBtnMemberBiru}
          data2={memberMerah ? menuBtnMemberMerah2 : null}
          isLandscape={isLandscape}
        />

        <div className="self-end mt-auto">
          <StandardBtn title="Kembali" path="/mainMenu" btnSize="266px" />
        </div>
      </div>
    </div>
  );
}

export default InformasiPromo;
