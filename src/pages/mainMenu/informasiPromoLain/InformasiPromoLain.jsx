import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleMemberMerah } from "../../../../services/redux/reducer";
import { BgMB2, BgMM2, KartuMB, KartuMM, LogoIGR } from "../../../assets";
import DataEmpty from "../../../components/DataEmpty";
import StandardBtn from "../../../components/StandardBtn";
import SwiperPictureComponent from "../../../components/SwiperPictureComponent";
import { useNavigate } from "react-router-dom";

const dataDummy = [
  {
    title: "Informasi Saldo Poin IGR",
  },
  {
    title: "Promo Penukaran Poin IGR",
  },
  {
    title: "Info Pesta Poin IGR",
  },
  {
    title: "Informasi Jumlah Skor",
  },
];

function InformasiPromoLain() {
  const dispatch = useDispatch();
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
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

    return () => {
      window.removeEventListener("resize", updateOrientation);
    };
  }, []);

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
        navigate("/");
      }, glLougoutApp["lcLogOutLimitApp"] * 1000);
    };

    // Mengatur timeout pada saat komponen di-render
    setNewTimeout();

    window.addEventListener("click", handleTouch);

    return () => {
      window.removeEventListener("click", handleTouch);
      clearTimeout(newTimeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bgImage = memberMerah ? BgMM2 : BgMB2;
  return (
    <div
      style={{
        backgroundImage: `url(${bgImage})`,
        width: "1920px",
        height: "1080px",
      }}
      className="flex flex-col p-5"
    >
      <div className="flex flex-row items-center mb-auto">
        <img
          src={LogoIGR}
          alt="Logo IGR"
          className="drop-shadow-lg rounded w-[387px] h-[132px] mr-auto"
        />

        <p className="font-bold text-title">Harga Hemat</p>

        <img
          src={memberMerah ? KartuMM : KartuMB}
          alt="Kartu Member"
          className="drop-shadow-lg w-[238px] h-[158px] ml-auto"
        />
      </div>

      {dataDummy ? (
        <SwiperPictureComponent data={dataDummy} slidesPerView={3} />
      ) : (
        <div className="self-center">
          <DataEmpty title="Tidak Ada Promosi Harga Hemat Yang Sedang Berlaku" />
        </div>
      )}

      <div className="self-end mt-auto">
        <StandardBtn title="Kembali" path="/infoPromoMenu" />
      </div>
    </div>
  );
}

export default InformasiPromoLain;
