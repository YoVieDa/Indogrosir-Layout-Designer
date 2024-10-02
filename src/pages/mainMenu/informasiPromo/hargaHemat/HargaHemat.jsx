import React, { useState, useEffect } from "react";
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
import axios from "axios";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Loader from "../../../../components/Loader";
import { INFO_PROMO_KEY, URL_GATEWAY } from "../../../../config";
import { useNavigate } from "react-router-dom";

const dataDummy = [
  {
    img: "/images/product-1.jpg",
  },
  {
    img: "/images/product-1.jpg",
  },
  {
    img: "/images/product-1.jpg",
  },
  {
    img: "/images/product-1.jpg",
  },
];

function HargaHemat() {
  const dispatch = useDispatch();
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const handleToggleMember = () => {
    dispatch(toggleMemberMerah());
  };
  const [dtHargaHemat, setDtHargaHemat] = useState(null);
  const [loading, setLoading] = useState(false);
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const userDt = useSelector((state) => state.glUser.dtUser);
  const [pictureArr, setPictureArr] = useState([]);
  let dtPic = [];
  const [isLandscape, setIsLandscape] = useState(false);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (memberMerah) {
      navigate("/");
    } else {
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
        handleNavigate();
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
        .get(
          `${URL_GATEWAY}/serviceInfoPromo/getInfoHargaHemat?memberId=${userDt["memberID"]}`,
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
          if (response["data"]) {
            // for (
            //   let i = 0;
            //   i < response["data"]["infoHargaHemat"][0].length;
            //   i++
            // ) {
            //   dtPic.push(
            //     response["data"]["infoHargaHemat"][0][i]["GPR_PICTURE"]
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
            setDtHargaHemat(response["data"]["infoHargaHemat"]);
            setLoading(false);
          } else {
            setDtHargaHemat(false);
            setLoading(false);
          }
          setLoading(false);
          console.log("dtHargaHemat: ", dtHargaHemat);
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
          <div className="flex flex-row items-center mb-auto">
            <img
              src={LogoIGR}
              alt="Logo IGR"
              className="drop-shadow-lg rounded w-[387px] h-[132px] mr-auto"
            />

            <p className="absolute mx-auto font-bold text-white transform -translate-x-1/2 left-1/2 text-title">
              Harga Hemat
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
              Harga Hemat
            </p>
          </>
        )}

        {dtHargaHemat ? (
          <>
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
                //className={`max-w-[${pictureArr.length === 2 ? "70%" : "70%"}]`}
              >
                {pictureArr.map((item, itemIndex) => (
                  <SwiperSlide className="max-w-[426.66px]">
                    <div
                      key={itemIndex}
                      className="flex flex-col h-[525px] w-[100%] group relative shadow-lg bg-stroke bg-white text-white rounded-xl overflow-hidden cursor-pointer"
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
                      <p className="text-[24px]  font-semibold text-center">
                        {dtHargaHemat[itemIndex]["hhh_keterangan"]}
                      </p>
                      <p className=" text-[20px] font-semibold text-center">
                        Rp {dtHargaHemat[itemIndex]["hhh_harga"].trim()}
                      </p>
                      <p className="text-[20px] font-semibold text-center">
                        {dtHargaHemat[itemIndex]["hhh_syarat"]
                          ? dtHargaHemat[itemIndex]["hhh_syarat"]
                          : "-"}
                      </p>
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
          </>
        ) : loading ? (
          <div className="mx-auto my-auto">
            <Loader loading={loading} merah={memberMerah} nobg={true} />
          </div>
        ) : (
          <DataEmpty
            width={`${isLandscape ? "50%" : "80%"}`}
            title="Tidak Ada Promosi Harga Hemat Yang Sedang Berlaku"
          />
        )}
        <div
          className={`flex flex-row justify-between mt-auto ${
            dtHargaHemat ? null : "self-end"
          }`}
        >
          {dtHargaHemat ? (
            <div
              className={`${
                memberMerah ? "bg-red" : "bg-blue"
              } rounded-xl w-[100%] self-center mr-5 p-5`}
            >
              <p className="font-semibold text-center text-white text-subText">
                Periode: {dtHargaHemat ? dtHargaHemat[0]["tglberlaku"] : "-"}
              </p>
            </div>
          ) : null}

          <div className="self-end mt-auto">
            <StandardBtn title="Kembali" path="/infoPromoMenu" />
          </div>
        </div>
      </div>
    </>
  );
}

export default HargaHemat;
