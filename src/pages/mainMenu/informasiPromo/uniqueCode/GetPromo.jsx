import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleMemberMerah } from "../../../../services/redux/memberReducer";
import { KartuMB, KartuMM, BgMM2, BgMB2, LogoIGR } from "../../../../assets";
import StandardBtn from "../../../../components/StandardBtn";
import IcPotonganHarga from "../../../../assets/icons/ic-potongan-harga.png";
import IcHadiahLangsung from "../../../../assets/icons/ic-hadiah-langsung.png";
import IconRecBtn from "../../../../components/IconRecBtn";

function GetPromo() {
  const dispatch = useDispatch();
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
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

  const bgImage = memberMerah ? BgMM2 : BgMB2;
  return (
    <div
      style={{
        height: `${isLandscape ? "1080px" : "1920px"}`,
        width: `${isLandscape ? "1920px" : "1080px"}`,
      }}
      className={`flex flex-col p-5 ${memberMerah ? "bg-red5" : "bg-blue4"}`}
    >
      {isLandscape ? (
        <div className="flex flex-row items-center mb-auto">
          <img
            src={LogoIGR}
            alt="Logo IGR"
            className="drop-shadow-lg rounded w-[387px] h-[132px] mr-auto"
          />

          <p className="absolute mx-auto font-bold text-white transform -translate-x-1/2 left-1/2 text-title">
            Get Promo
          </p>

          <img
            src={memberMerah ? KartuMM : KartuMB}
            alt="Kartu Member"
            className="drop-shadow-lg w-[238px] h-[158px] ml-auto"
          />
        </div>
      ) : (
        <>
          <img
            src={memberMerah ? KartuMM : KartuMB}
            alt="Kartu Member"
            className="drop-shadow-lg w-[140px] h-[90px] ml-auto"
          />
          <img
            src={LogoIGR}
            alt="Logo IGR"
            className="drop-shadow-lg rounded w-[544px] h-[186px] self-center"
          />

          <p className="mt-5 mb-32 font-bold text-center text-white text-title">
            Get Promo
          </p>
        </>
      )}
      <div className="flex flex-row justify-center gap-5">
        <IconRecBtn
          icon={IcHadiahLangsung}
          label="Hadiah Langsung"
          memberMerah={memberMerah}
          landscape={isLandscape}
        />
        <IconRecBtn
          icon={IcPotonganHarga}
          label="Potongan Harga"
          memberMerah={memberMerah}
          landscape={isLandscape}
        />
      </div>
      <div className="self-end mt-auto">
        <StandardBtn title="Kembali" path="/infoPromoMenu" />
      </div>
    </div>
  );
}

export default GetPromo;
