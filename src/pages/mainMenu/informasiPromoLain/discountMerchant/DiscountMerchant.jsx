import React, { useEffect, useState } from "react";
import {
  BgMB2,
  BgMM2,
  KartuMB,
  KartuMM,
  LogoIGR,
  NoImage,
  NoImageLandscape,
} from "../../../../assets";
import { useDispatch, useSelector } from "react-redux";
import DataEmpty from "../../../../components/DataEmpty";
import StandardBtn from "../../../../components/StandardBtn";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import Loader from "../../../../components/Loader";
import axios from "axios";
import { AESEncrypt, PROMO_LAIN_KEY, URL_GATEWAY } from "../../../../config";
import { toggleMemberMerah } from "../../../../services/redux/memberReducer";
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

function DiscountMerchant() {
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const bgImage = memberMerah ? BgMM2 : BgMB2;
  let dtPic = [];
  const [pictureArr, setPictureArr] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const glIpModul = useSelector((state) => state.glDtIp.dtIp);
  const glStationModul = useSelector((state) => state.glUser.stationModul);
  const userDt = useSelector((state) => state.glUser.dtUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

    const getLoadDiscMerchant = async () => {
      setLoading(true);
      await axios
        .get(`${URL_GATEWAY}/serviceInfoPromoLain/getInfoDiscountMerchant`, {
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
            "x-api-key": PROMO_LAIN_KEY,
          },
        })
        .then((response) => {
          // console.log(
          //   "Get Response Pic Promo Penukaran Poin: ",
          //   response["data"]["status"]
          // );

          // if (response["data"]["dtDcMerchant"]) {
          //   for (
          //     let i = 0;
          //     i < response["data"]["dtDcMerchant"][0].length;
          //     i++
          //   ) {
          //     dtPic.push(response["data"]["dtDcMerchant"][0][i]["GPO_PICTURE"]);
          //   }
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

          // else {
          //   setNotFoundMsg(response["data"]["status"].toString());
          // }
          setLoading(false);
        })
        .catch(function (error) {
          console.log(error.message);
          setLoading(false);
        });
    };

    getLoadDiscMerchant();

    return () => {
      window.removeEventListener("click", handleTouch);
      clearTimeout(newTimeoutId);
      window.removeEventListener("resize", updateOrientation);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              Discount Merchant
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
              Discount Merchant
            </p>
          </>
        )}

        {pictureArr.length > 0 ? (
          <div
            className={` ${
              isLandscape ? "max-w-[78%]" : "max-w-[98%]"
            } mx-auto`}
          >
            <Swiper
              slidesPerView={pictureArr.length === 1 ? 1 : 1.1}
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
                <SwiperSlide>
                  <div
                    key={itemIndex}
                    className={`flex flex-col ${
                      isLandscape ? "h-[650px]" : "h-[550px]"
                    }  w-[100%] mb-12 group relative shadow-lg bg-stroke bg-white text-white rounded-xl overflow-hidden`}
                  >
                    <img
                      src={item !== "" ? item : NoImageLandscape}
                      alt="Gambar Poin IGR"
                      className={`w-full ${
                        isLandscape ? "h-[650px]" : "h-[550px]"
                      } object-fill`}
                    />
                  </div>

                  {/* <button
                  onClick={() => handleBtn(itemIndex)}
                  className={`w-[100%] h-[96px] max-w-[426.66px] rounded-xl mb-14 ${
                    memberMerah ? "bg-red" : "bg-blue"
                  } p-3 text-subText font-bold text-white active:bg-gray-100`}
                >
                  Cek Pencapaian
                </button> */}
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
            title="Tidak Ada Promosi Discount Merchant Yang Sedang Berlaku"
          />
        )}

        <div className="self-end mt-auto">
          <StandardBtn title="Kembali" path="/mainMenu" />
        </div>
      </div>
    </>
  );
}

export default DiscountMerchant;
