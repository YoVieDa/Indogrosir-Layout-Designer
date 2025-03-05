import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  BgMB,
  BgMBPotrait,
  BgMM,
  BgMM2Potrait,
  BgMMPotrait,
  IcErr,
  IcInfoPoinMB,
  IcInfoPoinMM,
  IcInfoPromoLainMM,
  IcInfoPromoMB,
  IcInfoPromoMM,
  IcLogout,
  IcPaymentMB,
  IcPaymentMM,
  IcPemenangMM,
  IcProfileMB,
  LogoIGR,
} from "../../assets";
import SwiperComponent from "../../components/SwiperComponent";
import { toggleMemberMerah } from "../../services/redux/memberReducer";
import axios from "axios";
import { AESEncrypt, LOGIN_KEY, PAYMENT_KEY } from "../../config";
import Loader from "../../components/Loader";
import ModalAlert from "../../components/ModalAlert";
import { deleteTempMemberFromAPI } from "../../controller/kasirPembayaranController";
const mainMenuBtnMerah = [
  {
    icon: IcInfoPoinMM,
    title: "Poin IGR",
    path: "/infoPoinIGRMenu",
  },
  {
    icon: IcInfoPromoMM,
    title: "Informasi Promo",
    path: "/infoPromoMenu",
  },
  {
    icon: IcInfoPromoLainMM,
    title: "Promo Lainnya",
    path: "/discountMerchant",
  },
  {
    icon: IcPemenangMM,
    title: "Info Hadiah",
    path: "/loyaltyPemenang",
  },
  {
    icon: IcPaymentMM,
    title: "Transaksi Mandiri",
    path: "/pembelianPembayaranMenu",
  },
];

const mainMenuBtnBiru = [
  {
    icon: IcInfoPoinMB,
    title: "Poin IGR",
    path: "/infoPoinIGRMenu",
  },
  {
    icon: IcInfoPromoMB,
    title: "Informasi Promo",
    path: "/infoPromoMenu",
  },
  {
    icon: IcProfileMB,
    title: "Informasi Data",
    path: "/memberInfo",
  },
  {
    icon: IcPaymentMB,
    title: "Transaksi Mandiri",
    path: "/pembelianPembayaranMenu",
  },
];

function MainMenu() {
  const dispatch = useDispatch();
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const glStationModul = useSelector((state) => state.glUser.stationModul);
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const glIpModul = useSelector((state) => state.glDtIp.dtIp);
  const userDt = useSelector((state) => state.glUser.dtUser);
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [openModalAlert, setOpenModalAlert] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = async () => {
    setLoading(true);
    const doDeleteTempMemberFromAPI = await deleteTempMemberFromAPI(
      URL_GATEWAY,
      userDt["memberID"],
      glIpModul,
      glStationModul,
      glRegistryDt
    );

    if (doDeleteTempMemberFromAPI.status === true) {
      if (memberMerah) {
        setLoading(false);
        navigate("/");
      } else {
        setLoading(false);
        navigate("/");
        dispatch(toggleMemberMerah());
      }
    } else {
      if (
        doDeleteTempMemberFromAPI.message ===
        "Network doDeleteTempMemberFromAPI"
      ) {
        setMsg("Gagal Terhubung Dengan Gateway");
      } else {
        setMsg(doDeleteTempMemberFromAPI.message);
      }

      setLoading(false);
      setOpenModalAlert(true);
    }
  };

  const capitalizeFirstWord = (text) => {
    const words = text.split(" "); // Pisahkan kata-kata dengan spasi
    const firstWord = words[0]; // Ambil kata pertama
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  };

  const [isLandscape, setIsLandscape] = useState(false);

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
        await handleNavigate();
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

  const ambilDuaKataPertama = (nama) => {
    // Fungsi untuk mengubah kata menjadi kapital di huruf awal dan kecil di huruf lainnya
    const formatKata = (kata) => {
      return kata.charAt(0).toUpperCase() + kata.slice(1).toLowerCase();
    };

    // Pisahkan string menjadi array kata-kata
    const kata = nama.split(" ");

    // Format setiap kata
    const kataTerformat = kata.map(formatKata);

    // Ambil dua kata pertama atau kembalikan kata yang ada
    if (kata.length > 2) {
      return kataTerformat.slice(0, 2).join(" ");
    } else {
      return kataTerformat.join(" ");
    }
  };

  const bgImage =
    memberMerah && isLandscape
      ? BgMM
      : !memberMerah && isLandscape
      ? BgMB
      : memberMerah && !isLandscape
      ? BgMMPotrait
      : BgMBPotrait;

  return (
    <>
      <Loader loading={loading} />
      <ModalAlert
        open={openModalAlert}
        onClose={() => setOpenModalAlert(false)}
      >
        <div className="text-center">
          <img src={IcErr} alt="Warn" className="mx-auto" />
          <div className="mx-auto my-4">
            <h3 className="font-black text-gray-800 text-text">Error</h3>

            <p
              className="mt-5 text-lg text-gray-500"
              style={{ wordWrap: "break-word" }}
            >
              {msg}
            </p>
          </div>
        </div>
      </ModalAlert>
      <div
        className="p-5"
        style={{
          backgroundImage: `url(${bgImage})`,
          height: `${isLandscape ? "1080px" : "1920px"}`,
          width: `${isLandscape ? "1920px" : "1080px"}`,
        }}
      >
        <div className={`flex flex-col gap-10 justify-around h-[100%]`}>
          <div
            className={`flex ${
              isLandscape ? "flex-row" : "flex-col items-center"
            } gap-10 mt-5`}
          >
            <img
              src={LogoIGR}
              alt="LogoIGR"
              className="drop-shadow-lg rounded w-[544px] h-[186px]"
            />
            <div
              className={`flex flex-col justify-center ${
                isLandscape ? "" : "mt-10"
              }`}
            >
              {isLandscape ? (
                <p className="font-bold text-white text-title">
                  Selamat Datang{" "}
                  {userDt["memberGender"] === "1"
                    ? "Bapak"
                    : userDt["memberGender"] === "2"
                    ? "Ibu"
                    : userDt["memberGender"] === "0"
                    ? "Bapak/Ibu"
                    : "Bapak/Ibu"}{" "}
                  {capitalizeFirstWord(userDt["memberName"])}👋
                </p>
              ) : (
                <>
                  <p className="font-bold text-center text-white text-title">
                    Selamat Datang{" "}
                    {userDt["memberGender"] === "1"
                      ? "Bapak"
                      : userDt["memberGender"] === "2"
                      ? "Ibu"
                      : userDt["memberGender"] === "0"
                      ? "Bapak/Ibu"
                      : "Bapak/Ibu"}{" "}
                  </p>
                  <p className="font-bold text-center text-white text-title">
                    {ambilDuaKataPertama(userDt["memberName"])}
                    👋
                  </p>
                </>
              )}

              <p
                className={`font-bold text-white text-subText ${
                  isLandscape ? "" : "text-center"
                }`}
              >
                Silahkan pilih menu informasi yang anda butuhkan
              </p>
            </div>
          </div>
          <div
            className={`flex flex-col w-[100%] ${isLandscape ? "" : "mt-16"}`}
          >
            <p className="mb-5 font-bold text-center text-white text-title">
              MAIN MENU
            </p>

            <SwiperComponent
              data={memberMerah ? mainMenuBtnMerah : mainMenuBtnBiru}
              type="btn"
              isLandscape={isLandscape}
            />
          </div>
          <div
            className={`${isLandscape ? "self-end mb-5" : "self-end mt-auto"}`}
          >
            <button
              onClick={handleNavigate}
              className={`w-[299px] h-[96px] rounded-xl bg-stroke-white bg-red p-3 text-subText font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-red to-red3  flex flex-row items-center justify-center gap-4`}
            >
              <img src={IcLogout} alt="Button" className="w-[50px]" />
              Keluar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default MainMenu;
