import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleMemberMerah } from "../../../../services/redux/memberReducer";
import {
  KartuMB,
  KartuMM,
  LogoIGR,
  BgMM2,
  BgMB2,
  NoImage,
} from "../../../../assets";
import StandardBtn from "../../../../components/StandardBtn";
import SwiperPictureComponent from "../../../../components/SwiperPictureComponent";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import axios from "axios";
import DataEmpty from "../../../../components/DataEmpty";
import Loader from "../../../../components/Loader";
import { AESEncrypt, POIN_KEY, URL_GATEWAY } from "../../../../config";
import { useNavigate } from "react-router-dom";
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
  {
    title: "Informasi Jumlah Skor",
  },
];

function PenukaranPoinIGR() {
  const dispatch = useDispatch();
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const userDt = useSelector((state) => state.glUser.dtUser);
  const [notFoundMsg, setNotFoundMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  let dtPic = [];
  const [pictureArr, setPictureArr] = useState([]);
  const [dtPenukaranPoinIGR, setDtPenukaranPoinIGR] = useState(null);
  const [dtPenukaranStarIGR, setDtPenukaranStarIGR] = useState(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const glIpModul = useSelector((state) => state.glDtIp.dtIp);
  const glStationModul = useSelector((state) => state.glUser.stationModul);
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

    if (userDt["flagUpdateBiru"] === "Y") {
      const getPicPromoPenukaranPoin = async () => {
        setLoading(true);
        await axios
          .get(
            `${URL_GATEWAY}/servicePoin/getInfoPromoPenukaranPoin?memberFlag=${userDt["flagUpdateBiru"]}`,
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
                "x-api-key": POIN_KEY,
              },
            }
          )
          .then((response) => {
            // console.log(
            //   "Get Response Pic Promo Penukaran Poin: ",
            //   response["data"]["status"]
            // );

            // if (response["data"]["picPromoPenukaranPoinDt"]) {
            //   for (
            //     let i = 0;
            //     i < response["data"]["picPromoPenukaranPoinDt"][0].length;
            //     i++
            //   ) {
            //     dtPic.push(
            //       response["data"]["picPromoPenukaranPoinDt"][0][i][
            //         "GPO_PICTURE"
            //       ]
            //     );
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

            setPictureArr(response["data"]["picArr"]);

            setDtPenukaranPoinIGR(response["data"]["picPromoPenukaranPoinDt"]);

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

      getPicPromoPenukaranPoin();
    } else {
      const getPicPromoPenukaranStar = async () => {
        setLoading(true);
        await axios
          .get(
            `${URL_GATEWAY}/servicePoin/getInfoPromoPenukaranPoin?memberFlag=${userDt["flagUpdateBiru"]}`,
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
                "x-api-key": POIN_KEY,
              },
            }
          )
          .then((response) => {
            // console.log(
            //   "Get Response Pic Promo Penukaran Poin: ",
            //   response["data"]["status"]
            // );

            // if (response["data"]["picPromoPenukaranStarDt"]) {
            //   for (
            //     let i = 0;
            //     i < response["data"]["picPromoPenukaranStarDt"][0].length;
            //     i++
            //   ) {
            //     dtPic.push(
            //       response["data"]["picPromoPenukaranStarDt"][0][i][
            //         "GPO_PICTURE"
            //       ]
            //     );
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

            setDtPenukaranStarIGR(
              response["data"]["picPromoPenukaranStarDt"][0]
            );

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

      getPicPromoPenukaranStar();
    }

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
          <div className="flex flex-row items-center mb-12">
            <img
              src={LogoIGR}
              alt="Logo IGR"
              className="drop-shadow-lg rounded w-[387px] h-[132px] mr-auto"
            />

            <p className="absolute font-bold text-white transform -translate-x-1/2 left-1/2 text-title">
              {memberMerah
                ? "Promo Penukaran Poin IGR"
                : "Promo Penukaran Star IGR"}
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
              className="drop-shadow-lg w-[140px] h-[90px] ml-auto mb-10"
            />
            <img
              src={LogoIGR}
              alt="Logo IGR"
              className={`drop-shadow-lg rounded w-[544px] h-[186px] self-center
              }`}
            />
            <p className="mt-5 mb-32 font-bold text-center text-white text-title">
              {memberMerah
                ? "Promo Penukaran Poin IGR"
                : "Promo Penukaran Star IGR"}
            </p>
          </>
        )}

        {dtPenukaranPoinIGR || dtPenukaranStarIGR ? (
          <>
            {!isLandscape ? (
              <div
                className={`${
                  memberMerah ? "bg-red" : "bg-blue"
                } w-[80%] bg-stroke-white rounded-[10px] h-[96px] text-center flex flex-col self-center justify-center items-center m-5 p-5`}
              >
                {memberMerah ? (
                  <p className="text-[24px] text-white">
                    <b className="text-yellow">*Khusus Member Merah</b> Tukarkan
                    poin anda dengan produk di atas atau dapat juga untuk
                    seluruh produk di Indogrosir
                  </p>
                ) : (
                  <p className="text-[24px] text-white">
                    Periode Penukaran Poin <br></br> s/d{" "}
                    {dtPenukaranStarIGR[0]["pps_periodeakhir"]}
                  </p>
                )}
              </div>
            ) : null}
            <div
              className={` ${
                isLandscape ? "max-w-[80%]" : "max-w-[90%]"
              } mx-auto`}
            >
              {/* <div
                className={`${
                  memberMerah ? "bg-red" : "bg-blue"
                } w-[80%] rounded-[10px] text-center self-center p-5`}
              >
                <p className="font-bold text-text text-yellow">
                  KHUSUS MEMBER {memberMerah ? "MERAH" : "BIRU"}
                </p>
                <p className="text-white text-subText">
                  Tukarkan Segera Poin IGR Anda Dengan Produk Pilihan Ini
                </p>
              </div> */}
              <Swiper
                slidesPerView={
                  pictureArr.length === 2
                    ? 2
                    : pictureArr.length === 1
                    ? 1
                    : pictureArr.length > 2 && isLandscape
                    ? 3
                    : 2
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
                  <SwiperSlide className="max-w-[450px]">
                    <div
                      key={itemIndex}
                      className="flex flex-col h-[550px] w-[100%] mb-5 group relative shadow-lg bg-stroke bg-white text-white rounded-xl overflow-hidden"
                    >
                      <img
                        src={item !== "" ? item : NoImage}
                        alt="Gambar Poin IGR"
                        className={`w-full h-[550px] object-fill`}
                      />
                    </div>
                    {memberMerah ? (
                      <div
                        className={`${
                          memberMerah ? "bg-red" : "bg-blue"
                        } p-2 mt-2 rounded-xl text-white mb-12`}
                      >
                        <p className="text-[24px] font-semibold text-center">
                          Periode Penukaran Poin <br></br> s/d{" "}
                          {dtPenukaranPoinIGR[itemIndex]["ppp_periodeakhir"]}
                        </p>
                      </div>
                    ) : null}

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
            {isLandscape ? (
              <div className="flex flex-row items-center justify-around mt-auto">
                <div
                  className={`${
                    memberMerah ? "bg-red" : "bg-blue"
                  } w-[80%] bg-stroke-white rounded-[10px] h-[96px] text-center flex flex-col justify-center items-center  p-5`}
                >
                  {memberMerah ? (
                    <p className="text-[24px] text-white">
                      <b className="text-yellow">*Khusus Member Merah</b>{" "}
                      Tukarkan poin anda dengan produk di atas atau dapat juga
                      untuk seluruh produk di Indogrosir
                    </p>
                  ) : (
                    <p className="text-[24px] text-white">
                      Periode Penukaran Poin s/d{" "}
                      {dtPenukaranStarIGR
                        ? dtPenukaranStarIGR[0]["pps_periodeakhir"]
                        : "-"}
                    </p>
                  )}
                </div>

                <StandardBtn
                  btnSize="20%"
                  title="Kembali"
                  path="/infoPoinIGRMenu"
                />
              </div>
            ) : (
              <div className="self-end mt-auto">
                <StandardBtn
                  btnSize="20%"
                  title="Kembali"
                  path="/infoPoinIGRMenu"
                />
              </div>
            )}
          </>
        ) : loading ? (
          <>
            <div className="mx-auto my-auto">
              <Loader loading={loading} merah={memberMerah} nobg={true} />
            </div>
            <div className="self-end mt-auto">
              <StandardBtn
                btnSize="20%"
                title="Kembali"
                path="/infoPoinIGRMenu"
              />
            </div>
          </>
        ) : (
          <>
            <DataEmpty
              width={`${isLandscape ? "50%" : "80%"}`}
              title={`${
                userDt["flagUpdateBiru"] === "Y"
                  ? "Tidak Ada Promo Penukaran Poin IGR"
                  : "Tidak Ada Promo Penukaran Star IGR"
              }`}
            />
            <div className="self-end mt-auto">
              <StandardBtn
                btnSize="20%"
                title="Kembali"
                path="/infoPoinIGRMenu"
              />
            </div>

            {/* ) : (
          <>
            <div className="flex flex-col justify-center gap-10 mt-24 align-middle">
              <NotFound memberMerah={memberMerah} msg={notFoundMsg} />
              <div className="self-end mt-auto">
                <StandardBtn
                  btnSize="20%"
                  title="Kembali"
                  path="/infoPoinIGRMenu"
                />
              </div>
            </div>
          </>
        )} */}
          </>
        )}
      </div>
    </>
  );
}

export default PenukaranPoinIGR;
