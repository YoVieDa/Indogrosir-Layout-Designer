import React, { useEffect, useState } from "react";
import {
  LogoIGR,
  BgLogin as Bg,
  NoImage,
  NoImageLandscape,
} from "../../../../assets";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import StandardBtn from "../../../../components/StandardBtn";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import Loader from "../../../../components/Loader";
import DataEmpty from "../../../../components/DataEmpty";
import { useNavigate } from "react-router-dom";
import { setGlDtTopSpender } from "../../../../services/redux/topSpenderReducer";
import { AESEncrypt, INFO_PROMO_KEY, URL_GATEWAY } from "../../../../config";
import { toggleMemberMerah } from "../../../../services/redux/memberReducer";
import { deleteTempMemberFromAPI } from "../../../../controller/kasirPembayaranController";

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
  // {
  //   title: "Informasi Jumlah Skor",
  // },
];

function TopSpender() {
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const glDtTopSpender = useSelector(
    (state) => state.glTopSpender.dtTopSpender
  );
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const [dtTopSpender, setDtTopSpender] = useState(null);
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const userDt = useSelector((state) => state.glUser.dtUser);
  const [loading, setLoading] = useState(false);
  const [pictureArr, setPictureArr] = useState([]);
  let dtPic = [];
  let dtTopSpenderForGl;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLandscape, setIsLandscape] = useState(false);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const glIpModul = useSelector((state) => state.glDtIp.dtIp);
  const glStationModul = useSelector((state) => state.glUser.stationModul);
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
      // if (
      //   doDeleteTempMemberFromAPI.message ===
      //   "Network doDeleteTempMemberFromAPI"
      // ) {
      //   setAlertMsg("Gagal Terhubung Dengan Gateway");
      // } else {
      //   setAlertMsg(doDeleteTempMemberFromAPI.message);
      // }

      setLoading(false);
      // setOpenModalAlert(true);
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

    const getLoadTopSpender = async () => {
      setLoading(true);
      await axios
        .get(
          `${URL_GATEWAY}/serviceInfoPromo/getLoadTopSpender?memberId=${userDt["memberID"]}&memberFlag=${userDt["memberFlag"]}&kodeIGR=${userDt["kodeIGR"]}`,
          {
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
          }
        )
        .then((response) => {
          console.log("dtTopSpender: ", response);
          if (response["data"]["dtTopSpender"]) {
            // for (
            //   let i = 0;
            //   i < response["data"]["dtTopSpender"][0].length;
            //   i++
            // ) {
            //   dtPic.push(
            //     response["data"]["dtTopSpender"][0][i]["TSH_GAMBARPROMO"]
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
            // console.log("base64Image: ", base64Image);

            setPictureArr(response["data"]["picArr"]);

            setDtTopSpender(response["data"]["dtTopSpender"]);
            console.log("dtTopSpender: ", dtTopSpender);
          } else {
            setDtTopSpender(false);
            console.log("dtTopSpender: ", dtTopSpender);
          }

          setLoading(false);
        })
        .catch(function (error) {
          setLoading(false);
          console.log(error.message);
        });
    };

    getLoadTopSpender();

    return () => {
      window.removeEventListener("click", handleTouch);
      clearTimeout(newTimeoutId);
      window.removeEventListener("resize", updateOrientation);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBtn = async (idx) => {
    try {
      setLoading(true);
      console.log("dtTopSpender[idx]", dtTopSpender[idx]);
      // Menghapus kunci 'TSH_GAMBARPROMO' jika ada
      // if ("TSH_GAMBARPROMO" in dtTopSpender[idx]) {
      //   delete dtTopSpender[idx]["TSH_GAMBARPROMO"];
      // }

      dtTopSpenderForGl = dtTopSpender[idx];

      dispatch(
        setGlDtTopSpender({
          dtTopSpenderForGl,
        })
      );

      setLoading(false);
      navigate("/tableTopSpender");
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    }
  };

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
          <div className="flex flex-row items-center gap-5 mb-auto">
            <img
              src={LogoIGR}
              alt="Logo IGR"
              className="drop-shadow-lg rounded mb-10 w-[544px] h-[186px]"
            />
            <p className="font-bold text-white text-title ">
              Promo Top Spender Indogrosir
            </p>
          </div>
        ) : (
          <>
            <img
              src={LogoIGR}
              alt="Logo IGR"
              className="drop-shadow-lg rounded w-[544px] h-[186px] self-center mt-20 "
            />

            <p className="mt-5 mb-32 font-bold text-center text-white text-title">
              Promo Top Spender Indogrosir
            </p>
          </>
        )}

        {/* Card */}

        {dtTopSpender ? (
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
                  : 1.6
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
            >
              {pictureArr.map((item, itemIndex) => (
                <SwiperSlide className="max-w-[648.5px]">
                  <div
                    key={itemIndex}
                    className="flex flex-col h-[400px] w-[100%] mb-5 group relative bg-stroke-white bg-white text-white rounded-xl overflow-hidden cursor-pointer"
                  >
                    <img
                      src={item !== "" ? item : NoImageLandscape}
                      alt="Gambar Loyalty IGR"
                      className="object-fill w-full h-full"
                    />
                  </div>
                  <button
                    onClick={() => handleBtn(itemIndex)}
                    className={`w-[100%] h-[96px] max-w-[648.5px] rounded-xl mb-14 ${
                      memberMerah
                        ? "transform transition duration-200 active:scale-90 bg-gradient-to-t from-red to-red3 flex flex-row items-center justify-center gap-4"
                        : "transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3 flex flex-row items-center justify-center gap-4"
                    } p-3 text-subText font-bold text-white bg-stroke-white active:bg-gray-100`}
                  >
                    Cek Pencapaian
                  </button>
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
            title={"Tidak Ada Promosi Top Spender"}
          />
        )}

        <div className="self-end mt-auto">
          <StandardBtn title="Kembali" path="/infoPromoMenu" />
        </div>
      </div>
    </>
  );
}

export default TopSpender;
