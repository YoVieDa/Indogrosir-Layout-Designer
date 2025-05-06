import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  KartuMM,
  KartuMB,
  LogoIGR,
  BgMM2,
  BgMB2,
  NoImage,
} from "../../../../assets";
import StandardBtn from "../../../../components/StandardBtn";
import DataEmpty from "../../../../components/DataEmpty";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import axios from "axios";
import Loader from "../../../../components/Loader";
import { setGlDtInfoSkor } from "../../../../services/redux/skorReducer";
import { useNavigate } from "react-router-dom";
import { AESEncrypt, POIN_KEY, URL_GATEWAY } from "../../../../config";
import { toggleMemberMerah } from "../../../../services/redux/memberReducer";

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
];

function ProgramSkorIGR() {
  const dispatch = useDispatch();
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const [loading, setLoading] = useState(false);
  const [loadingBg, setLoadingBg] = useState(false);
  const [pictureArr, setPictureArr] = useState([]);
  let dtPic = [];
  let dtInfoSkorForGl;
  const [dtInfoSkor, setDtInfoSkor] = useState(null);
  const navigate = useNavigate();
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const glIpModul = useSelector((state) => state.glDtIp.dtIp);
  const glStationModul = useSelector((state) => state.glUser.stationModul);
  const userDt = useSelector((state) => state.glUser.dtUser);
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

    const getLoadInfoSkor = async () => {
      setLoading(true);
      await axios
        .get(`${URL_GATEWAY}/servicePoin/getInfoSkor`, {
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
            "x-api-key": POIN_KEY,
          },
        })
        .then((response) => {
          console.log("dtInfoSkor: ", response);
          if (response["data"]["skorDt"]) {
            // for (let i = 0; i < response["data"]["skorDt"][0].length; i++) {
            //   dtPic.push(response["data"]["skorDt"][0][i]["SK_IMAGE"]);
            // }

            // let base64Image = [];

            // for (let i = 0; i < dtPic.length; i++) {
            //   // eslint-disable-next-line react-hooks/exhaustive-deps
            //   if (dtPic[i] === null) {
            //     base64Image.push(dtPic[i]);
            //   } else {
            //     base64Image.push(
            //       `data:image/jpeg;base64,${Buffer.from(dtPic[i]).toString(
            //         "base64"
            //       )}`
            //     );
            //   }
            // }

            // setBase64ImageArr(base64Image);

            // console.log("base64Image: ", base64Image);
            setPictureArr(response["data"]["picArr"]);
            setDtInfoSkor(response["data"]["skorDt"]);
            console.log("dtInfoSkor: ", dtInfoSkor);

            setLoading(false);
          } else {
            setDtInfoSkor(false);
            setLoading(false);
            console.log("dtInfoSkor: ", dtInfoSkor);
          }
        })
        .catch(function (error) {
          setLoading(false);
          console.log(error.message);
        });
    };

    getLoadInfoSkor();

    return () => {
      window.removeEventListener("click", handleTouch);
      clearTimeout(newTimeoutId);
      window.removeEventListener("resize", updateOrientation);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBtn = async (idx) => {
    try {
      setLoadingBg(true);
      console.log("dtTopSpender[idx]", dtInfoSkor[idx]);
      // // Menghapus kunci 'SK_IMAGE' jika ada
      // if ("SK_IMAGE" in dtInfoSkor[idx]) {
      //   delete dtInfoSkor[idx]["SK_IMAGE"];
      // }
      dtInfoSkorForGl = dtInfoSkor[idx];
      dispatch(
        setGlDtInfoSkor({
          dtInfoSkorForGl,
        })
      );
      navigate("/hadiahSkor");
    } catch (error) {
      console.log(error.message);
      setLoadingBg(false);
    }
  };

  // useEffect(() => {
  //   handleToggleMember();
  // }, []);

  const bgImage = memberMerah ? BgMM2 : BgMB2;
  return (
    <>
      <Loader loading={loadingBg} merah={memberMerah} nobg={false} />
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
              Program Skor Indogrosir
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
              Program Skor Indogrosir
            </p>
          </>
        )}

        {dtInfoSkor ? (
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
                  ? 3
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
              // className={`max-w-[${pictureArr.length === 2 ? "70%" : "70%"}]`}
            >
              {pictureArr.map((item, itemIndex) => (
                <SwiperSlide className="max-w-[426.66px]">
                  <div
                    key={itemIndex}
                    className={`flex flex-col h-[525px] w-[100%] mb-5 group relative shadow-lg bg-stroke bg-red text-white rounded-xl overflow-hidden cursor-pointer`}
                  >
                    {item !== null ? (
                      <img
                        src={item !== "" ? item : NoImage}
                        alt="Gambar Loyalty IGR"
                        className="object-fill w-full h-full"
                      />
                    ) : null}
                  </div>
                  <button
                    onClick={() => handleBtn(itemIndex)}
                    className={`w-[100%] h-[96px] max-w-[426.66px] rounded-xl mb-14 ${
                      memberMerah
                        ? "transform transition duration-200 active:scale-90 bg-gradient-to-t from-red to-red3 flex flex-row items-center justify-center gap-4"
                        : "transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3 flex flex-row items-center justify-center gap-4"
                    } p-3 text-subText font-bold text-white active:bg-gray-100`}
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
            title={"Tidak Ada Program Skor IGR"}
          />
        )}
        <div className="self-end mt-auto">
          <StandardBtn title="Kembali" path="/infoPoinIGRMenu" />
        </div>
      </div>
    </>
  );
}

export default ProgramSkorIGR;
