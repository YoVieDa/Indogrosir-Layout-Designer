import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleMemberMerah } from "../../../../services/redux/memberReducer";
import {
  BgMB2,
  BgMM2,
  LogoIGR,
  KartuMB,
  KartuMM,
  NoImage,
} from "../../../../assets";
import StandardBtn from "../../../../components/StandardBtn";
import DataEmpty from "../../../../components/DataEmpty";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import axios from "axios";
import Loader from "../../../../components/Loader";
import { AESEncrypt, INFO_PROMO_KEY, URL_GATEWAY } from "../../../../config";
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

function ProdukBaru() {
  const dispatch = useDispatch();
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const userDt = useSelector((state) => state.glUser.dtUser);
  const glIpModul = useSelector((state) => state.glDtIp.dtIp);
  const glStationModul = useSelector((state) => state.glUser.stationModul);
  const [dtProdukBaru, setDtProdukBaru] = useState(null);
  const [loading, setLoading] = useState(false);
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const [pictureArr, setPictureArr] = useState([]);
  let dtPic = [];
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const navigate = useNavigate();

  const handleToggleMember = () => {
    dispatch(toggleMemberMerah());
  };

  const [isLandscape, setIsLandscape] = useState(false);

  const handleNavigate = async () => {
    setLoading(true);

    if (memberMerah) {
      setLoading(false);
      navigate("/");
    } else {
      setLoading(false);
      navigate("/");
      dispatch(toggleMemberMerah());
    }
  };

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

    updateOrientation();
    setNewTimeout();
    window.addEventListener("click", handleTouch);
    window.addEventListener("resize", updateOrientation);

    const getLoadSuperPromo = async () => {
      setLoading(true);
      await axios
        .get(`${URL_GATEWAY}/serviceInfoPromo/getInfoProdukBaru`, {
          headers: {
            server: glRegistryDt["glRegistryDt"]["server"],
            registryOraIGR: glRegistryDt["glRegistryDt"]["registryOraIGR"],
            registryIp: glRegistryDt["glRegistryDt"]["registryOraIP"],
            registryPort: glRegistryDt["glRegistryDt"]["registryPort"],
            registryServiceName:
              glRegistryDt["glRegistryDt"]["registryServiceName"],
            registryUser: glRegistryDt["glRegistryDt"]["registryUser"],
            registryPwd: glRegistryDt["glRegistryDt"]["registryPwd"],
            "Cache-Control": "no-cache",
            "x-api-key": INFO_PROMO_KEY,
          },
        })
        .then((response) => {
          if (response["data"]["infoProdukBaru"]) {
            // for (
            //   let i = 0;
            //   i < response["data"]["infoProdukBaru"][0].length;
            //   i++
            // ) {
            //   dtPic.push(
            //     response["data"]["infoProdukBaru"][0][i]["GPR_PICTURE"]
            //   );
            // }

            // let base64Image = [];

            // for (let i = 0; i < dtPic.length; i++) {
            //   // eslint-disable-next-line react-hooks/exhaustive-deps
            //   base64Image.push(
            //     `data:image/jpeg;base64,${Buffer.from(dtPic[i]).toString(
            //       "base64"
            //     )}`
            //   );
            // }

            // setBase64ImageArr(base64Image);
            setPictureArr(response["data"]["picArr"]);
            setDtProdukBaru(response["data"]["infoProdukBaru"]);
            setLoading(false);
          } else {
            setDtProdukBaru(false);
            setLoading(false);
          }
          setLoading(false);
          console.log("dtSuperPromo: ", dtProdukBaru);
        })
        .catch(function (error) {
          console.log(error.message);
          setLoading(false);
        });
    };

    getLoadSuperPromo();

    return () => {
      window.removeEventListener("click", handleTouch);
      clearTimeout(newTimeoutId);
      window.removeEventListener("resize", updateOrientation);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bgImage = memberMerah ? BgMM2 : BgMB2;
  return (
    <>
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
              Produk Baru
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
              Produk Baru
            </p>
          </>
        )}

        {dtProdukBaru ? (
          <div
            className={` ${
              isLandscape ? "max-w-[75%]" : "max-w-[98%]"
            } mx-auto`}
          >
            <Swiper
              slidesPerView={
                pictureArr.length === 2
                  ? 2
                  : pictureArr.length === 1
                  ? 1
                  : pictureArr.length > 2 && isLandscape
                  ? 2
                  : 2.5
              }
              spaceBetween={15}
              centerInsufficientSlides={true}
              pagination={{
                clickable: true,
                renderBullet: (index, className) => {
                  return `<span class="${className} inline-block w-6 h-6 leading-6 text-center bg-gray-200 rounded-full font-semibold text-black mx-1 hover:bg-gray-400 cursor-pointer">${
                    index + 1
                  }</span>`;
                },
              }}
              modules={[Pagination]}
              //className={`max-w-[${pictureArr.length === 2 ? "70%" : "70%"}]`}
            >
              {pictureArr.map((item, itemIndex) => (
                <SwiperSlide className="max-w-[426.66px]">
                  <div
                    key={itemIndex}
                    className="flex flex-col h-[461px] w-[100%]  group relative shadow-lg bg-stroke bg-white text-white rounded-xl overflow-hidden cursor-pointer"
                  >
                    <img
                      src={item !== "" ? item : NoImage}
                      alt="Gambar Loyalty IGR"
                      className="object-fill w-full h-full"
                    />
                  </div>
                  <div
                    className={`${
                      memberMerah ? "bg-red" : "bg-blue"
                    } p-2 mb-10 mt-2 rounded-xl text-white`}
                  >
                    <p className="text-[24px] font-semibold text-center">
                      {dtProdukBaru[itemIndex]["bbh_keterangan"]}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : loading ? (
          <div className="mx-auto my-auto">
            <Loader loading={loading} merah={memberMerah} nobg={true} />
          </div>
        ) : (
          <DataEmpty
            width={`${isLandscape ? "50%" : "80%"}`}
            title="Tidak Ada Produk Baru Yang Sedang Berlaku"
          />
        )}

        <div className="self-end mt-auto">
          <StandardBtn title="Kembali" path="/infoPromoMenu" />
        </div>
      </div>
    </>
  );
}

export default ProdukBaru;
