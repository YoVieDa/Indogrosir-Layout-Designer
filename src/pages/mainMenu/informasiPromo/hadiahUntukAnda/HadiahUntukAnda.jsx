import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BgMB2,
  BgMM2,
  LogoIGR,
  KartuMB,
  KartuMM,
  NoImage,
} from "../../../../assets";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import StandardBtn from "../../../../components/StandardBtn";
import DataEmpty from "../../../../components/DataEmpty";
import axios from "axios";
import Modal from "../../../../components/Modal";
import Loader from "../../../../components/Loader";
import { INFO_PROMO_KEY, URL_GATEWAY } from "../../../../config";
import { useNavigate } from "react-router-dom";
import { toggleMemberMerah } from "../../../../services/redux/memberReducer";

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

function HadiahUntukAnda() {
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const [openModal, setOpenModal] = useState(false);
  const [dtLoyaltyInfo, setDtLoyaltyInfo] = useState(null);
  const [detailInfoLoyalty, setDetailInfoLoyalty] = useState({
    idx: 0,
    namaPromo: "",
    totalBelanja: 0,
    totalBelanjaIsaku: 0,
    totalKunjungan: 0,
    hadiah: "",
    syaratB: 0,
    syaratBIsaku: 0,
    syaratK: "",
    kB: 0,
    kK: 0,
    kIsaku: 0,
  });
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const userDt = useSelector((state) => state.glUser.dtUser);
  const [loading, setLoading] = useState(false);
  const [loadingBg, setLoadingBg] = useState(false);
  const [pictureArr, setPictureArr] = useState([]);
  let dtPic = [];
  const [isLandscape, setIsLandscape] = useState(false);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

    const getLoyaltyInfo = async () => {
      setLoading(true);
      await axios
        .get(
          `${URL_GATEWAY}/serviceInfoPromo/getLoyaltyInfo?memberId=${userDt["memberID"]}&memberFlag=${userDt["memberFlag"]}&kodeIGR=${userDt["kodeIGR"]}`,
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
          if (response["data"]["dtLoyalty"]) {
            // for (let i = 0; i < response["data"]["dtLoyalty"][0].length; i++) {
            //   dtPic.push(
            //     response["data"]["dtLoyalty"][0][i]["LYH_GAMBARLOYALTY"]
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

            setPictureArr(response["data"]["picArr"]);
            console.log("base64Image: ", response["data"]["picArr"]);

            setDtLoyaltyInfo(response["data"]["dtLoyalty"]);
            console.log("dtLoyaltyInfo: ", dtLoyaltyInfo);
            setLoading(false);
          } else {
            setDtLoyaltyInfo(false);
            setLoading(false);
            console.log("dtLoyaltyInfo: ", dtLoyaltyInfo);
          }
        })
        .catch(function (error) {
          console.log(error.message);
          setLoading(false);
        });
    };

    getLoyaltyInfo();

    return () => {
      window.removeEventListener("click", handleTouch);
      clearTimeout(newTimeoutId);
      window.removeEventListener("resize", updateOrientation);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBtn = async (idx) => {
    setLoadingBg(true);
    try {
      // // Menghapus kunci 'LYH_GAMBARLOYALTY' jika ada
      // if ("LYH_GAMBARLOYALTY" in dtLoyaltyInfo[idx]) {
      //   delete dtLoyaltyInfo[idx]["LYH_GAMBARLOYALTY"];
      // }

      console.log(dtLoyaltyInfo[idx]);

      // Get Loyalty Index
      const responseDtLoyaltyIndex = await axios.post(
        `${URL_GATEWAY}/serviceInfoPromo/getLoyaltyIndex?memberId=${userDt["memberID"]}`,
        { dtLoyalty: dtLoyaltyInfo[idx] },
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
      );

      console.log("responseDtLoyaltyIndex: ", responseDtLoyaltyIndex);

      // Get Dt Kunjungan
      const responseDtKunjungan = await axios.post(
        `${URL_GATEWAY}/serviceInfoPromo/getDtKunjungan?memberId=${userDt["memberID"]}`,
        {
          dtLoyalty: dtLoyaltyInfo[idx],
          dtSalesLoyalty: responseDtLoyaltyIndex["data"]["dtSalesLoyalty"][0],
          dtSalesIsaku: responseDtLoyaltyIndex["data"]["dtSalesIsaku"][0],
        },
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
      );

      const totalBelanja = responseDtKunjungan["data"]["tmpSl"];
      const totalBelanjaIsaku = responseDtKunjungan["data"]["tmpSlIsaku"];
      const totalKunjungan = responseDtKunjungan["data"]["tmpkj"];

      console.log("responseDtKunjungan: ", responseDtKunjungan);

      // Get Dt Hadiah On Label
      const responseDtHadiahOnLabel = await axios.post(
        `${URL_GATEWAY}/serviceInfoPromo/getListHadiahOnLabel?tmpSl=${responseDtKunjungan["data"]["tmpSl"]}&tmpkj=${responseDtKunjungan["data"]["tmpkj"]}&tmpSlIsaku=${responseDtKunjungan["data"]["tmpSlIsaku"]}`,
        {
          dtLoyalty: dtLoyaltyInfo[idx],
        },
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
      );

      console.log("responseDtHadiahOnLabel: ", responseDtHadiahOnLabel);

      setDetailInfoLoyalty({
        idx: idx,
        namaPromo:
          responseDtLoyaltyIndex["data"]["dtLoyalty"][
            "lyh_namapromo"
          ].toString(),
        totalBelanja: totalBelanja,
        totalBelanjaIsaku: totalBelanjaIsaku,
        totalKunjungan: totalKunjungan,
        hadiah: responseDtHadiahOnLabel["data"]["hadiah"],
        syaratB: responseDtHadiahOnLabel["data"]["syaratB"],
        syaratBIsaku: responseDtHadiahOnLabel["data"]["syaratBIsaku"],
        syaratK: responseDtHadiahOnLabel["data"]["syaratK"],
        kB: responseDtHadiahOnLabel["data"]["kB"],
        kK: responseDtHadiahOnLabel["data"]["kK"],
        kIsaku: responseDtHadiahOnLabel["data"]["kBIsaku"],
      });

      console.log(detailInfoLoyalty);

      setOpenModal(true);
      setLoadingBg(false);
    } catch (error) {
      console.log(error.message);
      setLoadingBg(false);
    }
  };

  const getFormattedDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
    const year = today.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const formattedNumber = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    })
      .format(number)
      .replace(/\./g, ",");
  };

  return (
    <>
      <Loader loading={loadingBg} merah={memberMerah} nobg={false} />

      <Modal
        open={openModal}
        customWidth={75}
        onClose={() => setOpenModal(false)}
        landscape={isLandscape}
      >
        <div
          className={`${memberMerah ? "bg-red" : "bg-blue"} rounded-t-xl p-5`}
        >
          <p className="font-semibold text-center text-white text-subTitle">
            {detailInfoLoyalty.namaPromo}
          </p>
        </div>
        <div className="flex flex-col py-2 mx-10 align-middle border-b border-black border-solid">
          {isLandscape ? (
            <div className="flex flex-row gap-5 align-middle">
              <p className="font-semibold text-subText">
                Total Belanja Anda di tanggal {getFormattedDate()}:
              </p>
              <p className="self-center font-semibold text-subText">
                {formattedNumber(detailInfoLoyalty.totalBelanja)}
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-row gap-5 align-middle">
                <p className="font-semibold text-subText">
                  Total Belanja Anda di tanggal {getFormattedDate()}:
                </p>
              </div>
              <p className="font-semibold self-left text-subText">
                {formattedNumber(detailInfoLoyalty.totalBelanja)}
              </p>
            </>
          )}

          {detailInfoLoyalty.syaratBIsaku === 0 ? (
            <p className="text-subText">
              <b>Kunjungan:</b> {detailInfoLoyalty.totalKunjungan} Kali
            </p>
          ) : (
            <>
              <div className="flex flex-row gap-5 align-middle">
                <p className="font-semibold text-subText">
                  Belanja dengan ISAKU:
                </p>
                <p className="self-center font-semibold text-subText">
                  {formattedNumber(detailInfoLoyalty.totalBelanjaIsaku)}
                </p>
              </div>
              <p className="text-subText">
                <b>Kunjungan:</b> {detailInfoLoyalty.totalKunjungan} Kali
              </p>
            </>
          )}

          <p className="text-subText">
            Berikut Hadiah yang bisa anda dapatkan:{" "}
          </p>
        </div>
        <div className="flex flex-row gap-10 w-[100%] p-10">
          <div className="flex flex-col h-[310px] w-[250px] mb-5 group relative shadow-lg bg-stroke bg-white text-white rounded-xl overflow-hidden cursor-pointer">
            <img
              src={pictureArr[detailInfoLoyalty.idx]}
              alt="Gambar Loyalty IGR"
              className="w-full h-full object-contains"
            />
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-row gap-5 align-middle ">
              <p className="font-semibold text-subText">Hadiah: </p>
              <p className="self-center text-subText">
                {detailInfoLoyalty.hadiah}
              </p>
            </div>
            <div className="flex flex-col gap-5 py-2 align-middle border-t border-b border-black border-solid">
              <p className="font-semibold text-subText ">Syarat Belanja:</p>
              <p className="self-start text-subText">
                Total Belanja Senilai{" "}
                {formattedNumber(detailInfoLoyalty.syaratB)} <br></br> ISAKU
                senilai{" "}
                {detailInfoLoyalty.syaratBIsaku
                  ? formattedNumber(detailInfoLoyalty.syaratBIsaku)
                  : "Rp 0,00"}
              </p>
            </div>
            <div className="flex flex-row gap-5 align-middle">
              <p className="font-semibold text-subText">Syarat Kunjungan: </p>
              <p className="self-center text-subText ">
                {detailInfoLoyalty.syaratK ? detailInfoLoyalty.syaratK : "-"}
              </p>
            </div>
            <div className="flex flex-col gap-2 py-2 align-middle border-t border-b border-black border-solid">
              <p className="font-semibold text-subText">Kekurangan Belanja: </p>
              <p className="self-start text-subText ">
                {detailInfoLoyalty.kB
                  ? formattedNumber(detailInfoLoyalty.kB)
                  : "-"}
              </p>
            </div>
            <div className="flex flex-col gap-2 py-2 align-middle border-b border-black border-solid">
              <p className="font-semibold text-subText">
                Kekurangan Belanja ISAKU:{" "}
              </p>
              <p className="self-start text-subText ">
                {detailInfoLoyalty.kIsaku
                  ? formattedNumber(detailInfoLoyalty.kIsaku)
                  : "-"}
              </p>
            </div>
            <div className="flex flex-row gap-5 align-middle">
              <p className="font-semibold text-subText">
                Kekurangan Kunjungan:
              </p>
              <p className="self-center text-subText ">
                {detailInfoLoyalty.kK ? detailInfoLoyalty.kK : "-"}
              </p>
            </div>
          </div>
        </div>
      </Modal>

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
              Program Loyalty Indogrosir
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
              Program Loyalty Indogrosir
            </p>
          </>
        )}
        {/* Card */}
        {dtLoyaltyInfo ? (
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
                    className="flex flex-col h-[525px] w-[100%] mb-5 group relative shadow-lg bg-stroke-white bg-white text-white rounded-xl overflow-hidden cursor-pointer"
                  >
                    <img
                      src={item !== "" ? item : NoImage}
                      alt="Gambar Loyalty IGR"
                      className="object-fill w-full h-full "
                    />
                  </div>
                  <button
                    onClick={() => handleBtn(itemIndex)}
                    className={`w-[100%] h-[96px] max-w-[426.66px] rounded-xl mb-14 bg-stroke-white ${
                      memberMerah
                        ? "transform transition duration-200 active:scale-90 bg-gradient-to-t from-red to-red3"
                        : "transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3"
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
            title={"Tidak Ada Promosi loyalty IGR"}
          />
        )}
        <div className="self-end mt-auto">
          <StandardBtn title="Kembali" path="/infoPromoMenu" />
        </div>
      </div>
    </>
  );
}

export default HadiahUntukAnda;
