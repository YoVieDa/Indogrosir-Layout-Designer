import React, { useEffect, useState } from "react";
import {
  BgMM2,
  LogoIGR,
  KartuMM,
  IcPrint,
  IcErr,
  NoImage,
} from "../../../../assets";
import StandardBtn from "../../../../components/StandardBtn";
import DataEmpty from "../../../../components/DataEmpty";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import SwiperPictureComponent from "../../../../components/SwiperPictureComponent";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Loader from "../../../../components/Loader";
import moment from "moment";
import ModalAlert from "../../../../components/ModalAlert";
import {
  AESEncrypt,
  INFO_PROMO_KEY,
  passToChar,
  URL_GATEWAY,
} from "../../../../config";
import { toggleMemberMerah } from "../../../../services/redux/memberReducer";
import { useNavigate } from "react-router-dom";
import { deleteTempMemberFromAPI } from "../../../../controller/kasirPembayaranController";

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

function PromoKhusus() {
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const userDt = useSelector((state) => state.glUser.dtUser);
  const ipDt = useSelector((state) => state.glDtIp.dtIp);
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const [pictureArr, setPictureArr] = useState([]);
  let dtPic = [];
  const [loading, setLoading] = useState(false);
  const [dtPromoKhusus, setDtPromoKhusus] = useState(null);
  const [dtSegmentasi, setDtSegmentasi] = useState(null);
  const [openModalAlert, setOpenModalAlert] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [isLandscape, setIsLandscape] = useState(false);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const glIpModul = useSelector((state) => state.glDtIp.dtIp);
  const glStationModul = useSelector((state) => state.glUser.stationModul);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { ipcRenderer } = window.require("electron");

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

    const getDtInfoPromoKhusus = async () => {
      setLoading(true);
      await axios
        .get(
          `${URL_GATEWAY}/serviceInfoPromo/getInfoPromoKhusus?memberId=${userDt["memberID"]}`,
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
          if (response["data"]["infoPromoKhusus"]) {
            // for (
            //   let i = 0;
            //   i < response["data"]["infoPromoKhusus"][0].length;
            //   i++
            // ) {
            //   dtPic.push(response["data"]["picArr"][0][i]);
            // }

            // let base64Image = [];

            // for (
            //   let i = 0;
            //   i < response["data"]["infoPromoKhusus"][0].length;
            //   i++
            // ) {
            //   // eslint-disable-next-line react-hooks/exhaustive-deps
            //   base64Image.push(
            //     `data:image/jpeg;base64,${Buffer.from(dtPic[i]).toString(
            //       "base64"
            //     )}`
            //   );
            // }

            setPictureArr(response["data"]["picArr"]); // [[]]
            console.log("base64Image: ", response["data"]["picArr"]);

            setDtPromoKhusus(response["data"]["infoPromoKhusus"]);
            console.log(response["data"]);
            setDtSegmentasi(response["data"]["segmentasi"]);
            setLoading(false);
          } else {
            setPictureArr(response["data"]["picArr"]);
            setDtPromoKhusus(false);
            setLoading(false);
          }
          setLoading(false);
          console.log("dtPromoKhusus: ", dtPromoKhusus);
        })
        .catch(function (error) {
          console.log(error.message);
          setLoading(false);
        });
    };

    getDtInfoPromoKhusus();

    return () => {
      window.removeEventListener("click", handleTouch);
      clearTimeout(newTimeoutId);
      window.removeEventListener("resize", updateOrientation);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fungsi untuk menambahkan padding
  const addAutoPadding = (text, totalLength) => {
    // Jika panjang string sudah lebih besar atau sama dengan totalLength, kembalikan string asli
    if (text.length >= totalLength) {
      return text;
    }

    const paddingLength = totalLength - text.length;
    const leftPadding = Math.floor(paddingLength / 2);
    const rightPadding = paddingLength - leftPadding;

    return " ".repeat(leftPadding) + text + " ".repeat(rightPadding);
  };

  const addRightPadding = (text, totalLength) => {
    // Jika panjang string sudah lebih besar atau sama dengan totalLength, kembalikan string asli
    if (text.length >= totalLength) {
      return text;
    }

    const paddingLength = totalLength - text.length;
    return text + " ".repeat(paddingLength);
  };

  const addLeftPadding = (text, totalLength) => {
    // Jika panjang string sudah lebih besar atau sama dengan totalLength, kembalikan string asli
    if (text.length >= totalLength) {
      return text;
    }

    const paddingLength = totalLength - text.length;
    return " ".repeat(paddingLength) + text;
  };

  const localizeMonth = (tgl) => {
    const tglMurni = tgl;
    const arrTgl = tgl.split("-");
    try {
      if (arrTgl.length > 0) {
        tgl = arrTgl[1];
        tgl = tgl.replace(" ", "");
        tgl = tgl.trim();

        if (tgl === "JANUARY") {
          return arrTgl[0] + " Januari " + arrTgl[2];
        } else if (tgl === "FEBRUARY") {
          return arrTgl[0] + " Pebruari " + arrTgl[2];
        } else if (tgl === "MARCH") {
          return arrTgl[0] + " Maret " + arrTgl[2];
        } else if (tgl === "APRIL") {
          return arrTgl[0] + " April " + arrTgl[2];
        } else if (tgl === "MAY") {
          return arrTgl[0] + " Mei " + arrTgl[2];
        } else if (tgl === "JUNE") {
          return arrTgl[0] + " Juni " + arrTgl[2];
        } else if (tgl === "JULY") {
          return arrTgl[0] + " July " + arrTgl[2];
        } else if (tgl === "AUGUST") {
          return arrTgl[0] + " Agustus " + arrTgl[2];
        } else if (tgl === "SEPTEMBER") {
          return arrTgl[0] + " September " + arrTgl[2];
        } else if (tgl === "OCTOBER") {
          return arrTgl[0] + " Oktober " + arrTgl[2];
        } else if (tgl === "NOVEMBER") {
          return arrTgl[0] + " November " + arrTgl[2];
        } else if (tgl === "DECEMBER") {
          return arrTgl[0] + " Desember " + arrTgl[2];
        } else {
          return tglMurni.replace(" ", "");
        }
      } else {
        return tglMurni;
      }
    } catch (error) {
      return tglMurni;
    }
  };

  const handleCetakSaldoBtn = async () => {
    setLoading(true);
    await axios
      .get(
        `${URL_GATEWAY}/serviceInfoPromo/getInfoPrintPromoKhusus?memberId=${userDt["memberID"]}&segmentasi=${dtSegmentasi}&ipAddress=${ipDt}`,
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
        if (response["data"]["tgl"]) {
          let tgl = localizeMonth(response["data"]["tgl"]);
          const currentTime = new Date();
          let strukData = "";
          let strukData2, strukData3;
          strukData += "==============================================\n";
          strukData += addAutoPadding(
            "INFO PROMOSI KHUSUS MEMBER " + dtSegmentasi + "\n",
            48
          );
          strukData += "==============================================\n";
          strukData +=
            addRightPadding(userDt["memberName"].toString(), 20) +
            addLeftPadding("ID:", userDt["memberID"], 11) +
            "\n";
          strukData +=
            "Per tanggal : " +
            addRightPadding(tgl, 20) +
            addLeftPadding(currentTime.toString(), 12) +
            "\n";

          if (dtPromoKhusus.length > 0) {
            strukData += "----------------------------------------------\n";
            strukData += addRightPadding("Keterangan", 48) + "\n";
            strukData += addRightPadding("        Harga", 25);
            strukData += addRightPadding("Syarat", 23) + "\n";

            for (let i = 0; i < dtPromoKhusus.length; i++) {
              strukData3 = strukData;

              try {
                strukData +=
                  addRightPadding(
                    dtPromoKhusus[i]["pkh_keterangan"].toString(),
                    48
                  ) + "\n";
                strukData +=
                  "  " +
                  addRightPadding(dtPromoKhusus[i]["pkh_harga"].toString(), 24);
                strukData +=
                  addRightPadding(
                    dtPromoKhusus[i]["pkh_syarat"].toString(),
                    23
                  ) + "\n";
              } catch (error) {
                strukData += strukData3;
              }
            }
          }

          strukData += "----------------------------------------------\n";
          strukData += addAutoPadding("Terima Kasih Telah", 48) + "\n";
          strukData +=
            addAutoPadding("Menggunakan eKiosk Indogrosir", 48) + "\n";
          strukData +=
            addAutoPadding("Struk ini tidak untuk diperjualbelikan", 48) + "\n";
          strukData +=
            addAutoPadding("Mohon Simpan Struk Ini Dengan Baik", 48) + "\n";
          strukData +=
            addAutoPadding("Struk Ini Hanya Dapat Dicetak 2x Sehari", 48) +
            "\n";
          strukData += "----------------------------------------------\n";
          strukData += "==============================================\n";

          strukData2 = strukData;

          const dtToSaveReceipt = {
            memberID: userDt["memberID"],
            receiptDt: strukData2,
            path: `\\PromoKhusus-${moment().format("YYYYMMDD")}.TXT`,
          };

          ipcRenderer.send("save_receipt", dtToSaveReceipt);

          const data = [
            {
              type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
              value: strukData,
              style: {
                fontFamily: "Courier, monospace", // Mengatur font ke Courier atau monospace lain
                whiteSpace: "pre", // Menjaga spasi dan baris baru
                fontSize: "12px",
              },
            },
          ];

          const dtSendToSaveReceipt = {
            dataReceipt: JSON.stringify(data),
            printerName:
              glRegistryDt["glRegistryDt"]["registryPrnName"] !== null &&
              glRegistryDt["glRegistryDt"]["registryPrnName"] !== undefined
                ? passToChar(
                    glRegistryDt["glRegistryDt"]["registryPrnName"]
                  ).trim()
                : "eKioskPrinter",
          };

          ipcRenderer.send("print_receipt", dtSendToSaveReceipt);

          setLoading(false);
        } else {
          setLoading(false);
          setOpenModalAlert(true);
        }
      })
      .catch(function (error) {
        console.log(error.response["data"]["status"]);
        setLoading(false);
        setErrMsg(
          error.response["data"]["status"]
            ? error.response["data"]["status"]
            : error.message
        );
        setOpenModalAlert(true);
      });
  };

  return (
    <>
      <Loader loading={loading} merah={memberMerah} />
      <ModalAlert
        open={openModalAlert}
        onClose={() => setOpenModalAlert(false)}
        landscape={isLandscape}
      >
        <div className="py-10 text-center">
          <img src={IcErr} alt="Warn" className="mx-auto" />
          <div className="mx-auto my-4">
            <p
              className="mt-5 text-lg text-gray-500"
              style={{ wordWrap: "break-word" }}
            >
              {errMsg}
            </p>
          </div>
        </div>
      </ModalAlert>
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
              Promosi Khusus
            </p>

            <img
              src={KartuMM}
              alt="Kartu Member"
              className="drop-shadow-lg w-[238px] h-[158px] ml-auto"
            />
          </div>
        ) : (
          <>
            <img
              src={KartuMM}
              alt="Kartu Member"
              className="drop-shadow-lg w-[140px] h-[90px] ml-auto"
            />
            <img
              src={LogoIGR}
              alt="Logo IGR"
              className="drop-shadow-lg rounded w-[544px] h-[186px] self-center"
            />

            <p className="mt-5 mb-32 font-bold text-center text-white text-title">
              Promosi Khusus
            </p>
          </>
        )}
        {dtPromoKhusus ? (
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
                        {dtPromoKhusus[itemIndex]["pkh_keterangan"]}
                      </p>
                      <p className=" text-[20px] font-semibold text-center">
                        Rp {dtPromoKhusus[itemIndex]["pkh_harga"].trim()}
                      </p>
                      <p className="text-[20px] font-semibold text-center">
                        {dtPromoKhusus[itemIndex]["pkh_syarat"]
                          ? dtPromoKhusus[itemIndex]["pkh_syarat"]
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
        ) : (
          <DataEmpty
            width={`${isLandscape ? "50%" : "80%"}`}
            title="Tidak Ada Promosi Khusus Yang Sedang Berlaku"
          />
        )}
        <div className="flex flex-row justify-between gap-5 mt-auto">
          {dtPromoKhusus ? (
            <>
              <div
                className={`${
                  memberMerah ? "bg-red" : "bg-blue"
                } rounded-xl  self-center p-2 px-5`}
              >
                <p className="font-semibold text-center text-white text-subText">
                  <b className="text-yellow">*Khusus Member Platinum</b>
                  <br></br> Periode:{" "}
                  {dtPromoKhusus?.[0]["tglberlaku"] ||
                  dtPromoKhusus?.[0]["tglberlaku"] !== undefined
                    ? dtPromoKhusus[0]["tglberlaku"]
                    : "-"}
                </p>
              </div>
              {!dtSegmentasi || dtSegmentasi !== "PLATINUM" ? (
                <div className="flex flex-row self-end gap-5 mt-auto">
                  <StandardBtn title="Kembali" path="/infoPromoMenu" />
                </div>
              ) : null}
            </>
          ) : null}

          {dtSegmentasi === "PLATINUM" ? (
            <>
              <div className={`flex flex-row self-end gap-5 mt-auto`}>
                <button
                  onClick={handleCetakSaldoBtn}
                  className={`w-[299px] h-[96px] text-subText rounded-xl bg-stroke-white flex flex-row items-center justify-center gap-4 ${
                    memberMerah
                      ? "transform transition duration-200 active:scale-90 bg-gradient-to-t from-red to-red3"
                      : "transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3"
                  } p-3 text-subText font-bold text-white`}
                >
                  <img src={IcPrint} alt="Button" className="w-[50px]" />
                  Cetak
                </button>
                <StandardBtn title="Kembali" path="/infoPromoMenu" />
              </div>
            </>
          ) : null}
        </div>
        {!dtSegmentasi ? (
          <div className="flex flex-row self-end gap-5 mt-auto">
            <StandardBtn title="Kembali" path="/infoPromoMenu" />
          </div>
        ) : null}
      </div>
    </>
  );
}

export default PromoKhusus;
