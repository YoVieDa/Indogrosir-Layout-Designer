import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  IcErr,
  LogoIGR,
  ICScanToken,
  IcSucc,
  IcShopeepay,
  IcArrowBot,
  IcIsaku,
  IcGopay,
  IcInfoBlack,
  IcBca,
} from "../../../../assets";
import StandardBtn from "../../../../components/StandardBtn";
import axios from "axios";
import {
  removeAllItems,
  removeAllItemsHitungTotal,
} from "../../../../services/redux/dtAllInputtedItemReducer";
import Modal from "../../../../components/Modal";
import {
  passToChar,
  PAYMENT_KEY,
  PIC_API_KEY,
  URL_SERVICE_PIC,
} from "../../../../config";
import Loader from "../../../../components/Loader";
import ModalAlert from "../../../../components/ModalAlert";
import {
  addDtInfo,
  addDtTimeStart,
} from "../../../../services/redux/documentInfoReducer";
import Lottie from "lottie-react";
import { toggleMemberMerah } from "../../../../services/redux/memberReducer";
import {
  errorLog,
  generateTXTError,
  sendErrorLogWithAPI,
} from "../../../../controller/kasirPembayaranController";
import { format } from "date-fns";
import packageJson from "../../../../../package.json";

const { ipcRenderer } = window.require("electron");
const listPaymentMethod = [
  {
    title: "I-SAKU",
    value: "ISAKU",
  },
  {
    title: "GOPAY",
    value: "GOPAY",
  },
  {
    title: "SHOPEEPAY",
    value: "SHOPEEPAY",
  },
  {
    title: "QRIS-BCA",
    value: "QRISBCA",
  },
];

function KasirPembayaran() {
  const dispatch = useDispatch();
  const location = useLocation();
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const navigate = useNavigate();
  const dtAllItem = useSelector(
    (state) => state.glDtAllInputtedItem.glDtAllInputtedItem
  );
  const glDtTimeStart = useSelector((state) => state.glDocInfo.timeStart);
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );

  const glDtHitungTotal = useSelector(
    (state) => state.glDtAllInputtedItem.glDtHitungTotal
  );

  const glDtDocInfo = useSelector((state) => state.glDocInfo.info);

  const { total, pembulatan, totCashback, totDisc, totPembayaran } =
    location.state;
  const userDt = useSelector((state) => state.glUser.dtUser);

  const [isLandscape, setIsLandscape] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [errMsgSave, setErrMsgSave] = useState("");
  const [openModalAlert, setOpenModalAlert] = useState(false);
  const [openModalPayment, setOpenModalPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [alertSucc, setAlertSucc] = useState(false);
  const [alertInfo, setAlertInfo] = useState(false);
  const [getPointGift, setGetPointGift] = useState(false);
  const [getPointMsg, setGetPointMsg] = useState("");
  const [getGiftMsg, setGetGiftMsg] = useState("");
  const glUserModul = useSelector((state) => state.glUser.userModul);
  const glStationModul = useSelector((state) => state.glUser.stationModul);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const appVersion = packageJson.version;

  const generateDocCode = (noTransaksi) => {
    // Mengubah string menjadi angka, menambah 1, dan kemudian mengubah kembali menjadi string
    let num = parseInt(noTransaksi, 10) + 1;

    // Menentukan panjang asli dari string kode
    let length = noTransaksi.length;

    // Mengubah angka kembali menjadi string dengan padding nol di depan
    let newNoTransaksi = num.toString().padStart(length, "0");

    return newNoTransaksi;
  };

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

  const countTotal = () => {
    let totalTemp = 0;

    for (let i = 0; i < dtAllItem.length; i++) {
      totalTemp = totalTemp + dtAllItem[i]["jumlahRp"];
    }
  };

  const handleNavigate = () => {
    console.log("handlenavigate", memberMerah);
    if (memberMerah) {
      navigate("/");
      dispatch(addDtTimeStart(""));
      dispatch(removeAllItems());
      setOpenModalAlert(false);
      setOpenModalPayment(false);
    } else {
      navigate("/");
      dispatch(addDtTimeStart(""));
      dispatch(removeAllItems());
      setOpenModalAlert(false);
      setOpenModalPayment(false);
      dispatch(toggleMemberMerah());
    }
  };

  useEffect(() => {
    if (alertSucc === true) {
      let newTimeoutId;

      const handleTouch = () => {
        clearTimeout(newTimeoutId);
        console.log("delayInMilliseconds", 120 * 1000);
        setNewTimeout();
      };

      const setNewTimeout = () => {
        newTimeoutId = setTimeout(async () => {
          handleNavigate();
        }, 120 * 1000);
      };

      setNewTimeout();

      window.addEventListener("click", handleTouch, { capture: true });

      return () => {
        window.removeEventListener("click", handleTouch, { capture: true });

        clearTimeout(newTimeoutId);
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertSucc]);

  useEffect(() => {
    const updateOrientation = () => {
      const { innerWidth: width, innerHeight: height } = window;

      setIsLandscape(width === 1920 && height === 1080);
    };

    updateOrientation();

    window.addEventListener("resize", updateOrientation);

    countTotal();

    return () => {
      window.removeEventListener("resize", updateOrientation);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   countTotal();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [dtAllItem]);

  const getTimeStart = async () => {
    setLoading(true);
    await axios
      .post(
        `${URL_GATEWAY}/servicePayment/getCurrentTime`,
        {
          userModul: glUserModul,
          stationModul: glStationModul,
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
            "x-api-key": PAYMENT_KEY,
          },
        }
      )
      .then((response) => {
        console.log(response);
        dispatch(addDtInfo(response["data"]["noTrans"]));
        setLoading(false);
      })
      .catch(function (error) {
        console.log(error);

        setLoading(false);
        setOpenModalAlert(true);
      });
  };

  const getPic = async (namaFile) => {
    try {
      const response = await axios.get(
        `${URL_SERVICE_PIC}/servicePic/getPic?kodeFile=` +
          namaFile +
          "&folderName=HEADER_IGR",
        {
          headers: {
            "x-api-key": PIC_API_KEY,
          },
        }
      );
      console.log(response["data"]["imageUrl"]);
      return response["data"]["imageUrl"]; // Mengembalikan hasil dengan benar
    } catch (error) {
      console.log(error.message);
      return null; // Mengembalikan null atau nilai lain untuk menangani kesalahan
    }
  };

  const handleEnterPress = async (e) => {
    if (e.key === "Enter") {
      setLoading(true);
      if (openModalPayment === false) {
        setInputValue("");
        setSelectedPayment("");
        setLoading(false);
      } else {
        setOpenModalPayment(false);
        let totalJualHDR =
          glDtHitungTotal[0]["totalNilai"] - glDtHitungTotal[0]["totDisc"];

        await axios
          .post(
            `${URL_GATEWAY}/servicePayment/doPaymentPos`,
            {
              kodeIGR: glRegistryDt["glRegistryDt"]["registryOraIGR"],
              dbStatus: glRegistryDt["glRegistryDt"]["server"],
              dtMember: {
                memberID: userDt["memberID"],
                memberName: userDt["memberName"],
                memberFlag: userDt["memberFlag"],
                cus_idsegment: userDt["cus_idsegment"],
                cus_jenismember: userDt["cus_jenismember"],
                cus_flag_mypoin: userDt["cus_flag_mypoin"],
                kodeIGR: userDt["kodeIGR"],
                cus_noktp: userDt["cus_noktp"],
                cus_flag_verifikasi: userDt["cus_flag_verifikasi"],
                cus_hpmember: userDt["cus_hpmember"],
              },
              noTransaksi: glDtDocInfo,
              timeStart: glDtTimeStart,
              timeEnd: glDtHitungTotal[0]["retTimeEnd"],
              total: Math.round(Number(glDtHitungTotal[0]["jumlahPenjualan"])),
              totalJualHDR: Math.round(Number(totalJualHDR)),
              dtDtlBrng: glDtHitungTotal[0]["dtDtlBrngUpdate"],
              dtCashback: glDtHitungTotal[0]["dtCashback"],
              dtGift: glDtHitungTotal[0]["dtGift"],
              dtInputtedItem: dtAllItem,
              totDiscount: Math.round(Number(glDtHitungTotal[0]["totDisc"])),
              totCashback: Math.round(
                Number(glDtHitungTotal[0]["totCashback"])
              ),
              totDiscountPercent: 0,
              transPoint: glDtHitungTotal[0]["transPoint"],
              transAkumulasiPoint: glDtHitungTotal[0]["transAkumulasiPoint"],
              perolehanPoint: glDtHitungTotal[0]["perolehanPoint"],
              appVersion: appVersion,
              potBank: glDtHitungTotal[0]["potBank"],
              pembulatan: pembulatan,
              dtPromosiRaw: glDtHitungTotal[0]["dtPromosiRaw"],
              dtPromosiDtlRaw: glDtHitungTotal[0]["dtPromosiDtlRaw"],
              verificationCode: inputValue.split("#").join(""),
              selectedPayment: selectedPayment,
              flagFasilitasBank: glDtHitungTotal[0]["flagFasilitasBank"],
              userModul: glUserModul,
              stationModul: glStationModul,
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
                "x-api-key": PAYMENT_KEY,
              },
            }
          )
          .then(async (response) => {
            console.log(response["data"]);
            // console.log(response["data"]["strukData"]);

            if (response["data"]["pointTxt"] !== "") {
              setGetPointGift(true);
              setGetPointMsg(response["data"]["pointTxt"]);
            }

            if (response["data"]["giftTxt"] !== "") {
              setGetPointGift(true);
              setGetGiftMsg(response["data"]["giftTxt"]);
            }

            // let headerPic = await getPic(
            //   "IGR" + glRegistryDt["glRegistryDt"]["registryOraIGR"]
            // );

            const dtToSaveReceipt = {
              receiptDt:
                response["data"]["strukData2"] +
                response["data"]["strukData"] +
                response["data"]["sFooter"],
              path: `\\${response["data"]["stationModul"]}-${response["data"]["tglCurrentForStruk"]}.TXT`,
              pathSharing: `\\${response["data"]["tglCurrentForStruk"]}\\${response["data"]["stationModul"]}`,
              pathFile: `\\${response["data"]["tglCurrentForStruk"]}${response["data"]["userModul"]}${response["data"]["noTransaksi"]}S.TXT`,
            };

            const dtToSaveBackup = {
              receiptDt: response["data"]["strTextFile"],
              path: `\\${response["data"]["tglCurrentForStruk"]}-${response["data"]["stationModul"]}-${response["data"]["userModul"]}-${response["data"]["noTransaksi"]}.TXT`,
              subFolder: `\\${response["data"]["tglCurrentForStruk"]}-${response["data"]["stationModul"]}-${response["data"]["userModul"]}`,
            };

            console.log("mulai backup");
            //try {
            await ipcRenderer
              .invoke("save_backuppos", dtToSaveBackup)
              .then(async (result) => {})
              .catch(async (error) => {
                await errorLog(error.message);
                await sendErrorLogWithAPI(
                  error.message,
                  glRegistryDt,
                  URL_GATEWAY,
                  glStationModul,
                  appVersion
                );
              });
            // } catch (error) {
            //   await errorLog(error.message);
            //   await sendErrorLogWithAPI(
            //     error.message,
            //     glRegistryDt,
            //     URL_GATEWAY,
            //     glStationModul,
            //     appVersion
            //   );
            // }

            //try {
            await ipcRenderer
              .invoke("save_receiptpos", dtToSaveReceipt)
              .then(async (result) => {})
              .catch(async (error) => {
                await errorLog(error.message);
                await sendErrorLogWithAPI(
                  error.message,
                  glRegistryDt,
                  URL_GATEWAY,
                  glStationModul,
                  appVersion
                );
              });
            // } catch (error) {
            //   await errorLog(error.message);
            //   await sendErrorLogWithAPI(
            //     error.message,
            //     glRegistryDt,
            //     URL_GATEWAY,
            //     glStationModul,
            //     appVersion
            //   );
            // }

            // try {
            await ipcRenderer
              .invoke("save_receiptpos_sharing", dtToSaveReceipt)
              .then(async (result) => {})
              .catch(async (error) => {
                await errorLog(error.message);
                await sendErrorLogWithAPI(
                  error.message,
                  glRegistryDt,
                  URL_GATEWAY,
                  glStationModul,
                  appVersion
                );
              });
            // } catch (error) {
            //   await errorLog(error.message);
            //   await sendErrorLogWithAPI(
            //     error.message,
            //     glRegistryDt,
            //     URL_GATEWAY,
            //     glStationModul,
            //     appVersion
            //   );
            // }

            console.log("selesai sharing");

            const dtToPrint = {
              kodeIGR: glRegistryDt["glRegistryDt"]["registryOraIGR"],
              strukData: response["data"]["strukData"],
              strukDataFooter: response["data"]["sFooter"],
              numberOfQrStruk: response["data"]["numberOfQrStruk"],
              printerName:
                glRegistryDt["glRegistryDt"]["registryPrnName"] !== null &&
                glRegistryDt["glRegistryDt"]["registryPrnName"] !== undefined
                  ? passToChar(
                      glRegistryDt["glRegistryDt"]["registryPrnName"]
                    ).trim()
                  : "eKioskPrinter",
            };

            console.log("mulai print");
            await ipcRenderer
              .invoke("print_receipt_belanja", dtToPrint)
              .then(async (result) => {
                setInputValue("");
                dispatch(removeAllItems());
                await getTimeStart();
                setMsg(
                  "Terima kasih telah berbelanja di Indogrosir\nSilahkan tunjukkan struk ke area checker kami untuk proses verifikasi"
                );

                setAlertSucc(true);
                setOpenModalAlert(true);
                setLoading(false);

                console.log("sudah print");
              })
              .catch(async (error) => {
                await errorLog(error.message);
                await sendErrorLogWithAPI(
                  error.message,
                  glRegistryDt,
                  URL_GATEWAY,
                  glStationModul,
                  appVersion
                );
                setMsg("Gagal Print Struk");
                setInputValue("");
                setOpenModalAlert(true);
                setLoading(false);
              });

            // setTimeout(() => {
            //   setOpenModalAlert(false);
            //   setInputValue("");
            //   setAlertSucc(false);
            //   navigate("/kasirSelfService");
            // }, 10000); // 10000 ms = 10 detik
          })
          .catch(async function (error) {
            console.log(error);
            if (
              error["response"]["data"]["status"].includes("Gagal Ambil Data")
            ) {
              await errorLog(error["response"]["data"]["errMsg"]);
              await sendErrorLogWithAPI(
                error["response"]["data"]["errMsg"],
                glRegistryDt,
                URL_GATEWAY,
                glStationModul,
                appVersion
              );
              setMsg(error["response"]["data"]["status"]);
              setInputValue("");
              setOpenModalAlert(true);
              setLoading(false);
            } else {
              await errorLog(error["response"]["data"]["status"]);
              await sendErrorLogWithAPI(
                error["response"]["data"]["status"],
                glRegistryDt,
                URL_GATEWAY,
                glStationModul,
                appVersion
              );
              setMsg(error["response"]["data"]["status"]);
              setInputValue("");
              setOpenModalAlert(true);
              setAlertInfo(true);
              setLoading(false);
            }
          });
      }
    }
  };

  const handleSelectedPayment = async (selectedPaymentParam) => {
    setSelectedPayment(selectedPaymentParam);
    setOpenModalPayment(true);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value); // Memperbarui state input dengan nilai dari input event
  };

  const formattedNumber = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(Math.round(number)) // Membulatkan angka sebelum diformat
      .replace(/\./g, ",");
  };

  return (
    <>
      <Loader loading={loading} />
      <input
        type="text"
        value={inputValue}
        className="absolute -z-10"
        onKeyDown={handleEnterPress}
        autoFocus
        onBlur={(e) => e.target.focus()}
        onChange={handleInputChange}
      />
      <ModalAlert
        open={openModalAlert}
        successAlert={alertSucc}
        landscape={isLandscape}
        onClose={() => {
          setOpenModalAlert(false);
          setInputValue("");
          setAlertSucc(false);
          setGetPointGift(false);
          setAlertInfo(false);
          alertSucc ? handleNavigate() : navigate("/kasirSelfService");
        }}
      >
        <div className="text-center">
          <img
            src={
              alertSucc && !alertInfo
                ? IcSucc
                : !alertSucc && alertInfo
                ? IcInfoBlack
                : IcErr
            }
            alt="Warn"
            className="mx-auto"
          />
          <div className="mx-auto my-4">
            <h3 className="font-bold text-subTitle">
              {alertSucc && !alertInfo
                ? "Success"
                : !alertSucc && alertInfo
                ? "Info"
                : "Error"}
            </h3>

            <p
              className="mt-5 text-xl whitespace-pre-line"
              style={{ wordWrap: "break-word" }}
            >
              {msg}
            </p>

            {getPointGift ? (
              <>
                {getPointMsg !== "" ? (
                  <>
                    <div className="mt-5">
                      <p className="font-bold text-text">
                        Anda memperoleh Poin:
                      </p>
                      <p className="mt-2 text-xl whitespace-pre-line">
                        {getPointMsg}
                      </p>
                    </div>
                  </>
                ) : null}

                {getGiftMsg !== "" ? (
                  <>
                    <div className="mt-5">
                      <p className="font-bold text-center text-text">
                        Anda memperoleh Gift:
                      </p>
                      <p className="mt-2 text-xl text-center whitespace-pre-line ">
                        {getGiftMsg}
                      </p>
                    </div>
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </ModalAlert>
      <Modal
        open={openModalPayment}
        customWidth={80}
        onClose={() => {
          setOpenModalPayment(false);
          setSelectedPayment("");
        }}
        landscape={isLandscape}
      >
        <div
          className={`${memberMerah ? "bg-red" : "bg-blue"} rounded-t-xl p-5`}
        >
          <p className="font-semibold text-center text-white text-subTitle">
            {selectedPayment === "ISAKU"
              ? "I-SAKU"
              : selectedPayment === "QRISBCA"
              ? "QRIS BCA"
              : selectedPayment}
          </p>
        </div>
        <div
          className={`flex flex-col gap-5 ${
            isLandscape ? "p-16" : "p-10"
          }  bg-white rounded-xl`}
        >
          <div
            className={`flex ${
              isLandscape ? "flex-col" : "flex-row"
            } items-center justify-between gap-5`}
          >
            <label className="font-bold text-text">Nominal</label>
            <input
              value={formattedNumber(glDtHitungTotal[0]["jumlahPenjualan"])}
              type="text"
              disabled
              className={`border bg-stroke p-5 rounded-xl ${
                isLandscape ? "w-[50%]" : "w-[70%]"
              }  self-center text-text`}
            />
          </div>

          <p
            className={`${
              isLandscape ? "mt-10" : "mt-20"
            } font-bold text-center ${
              isLandscape ? "text-subTitle" : "text-title"
            }`}
          >
            {"Silahkan Scan"} {<br />}{" "}
            {` ${
              selectedPayment === "ISAKU"
                ? `Token I-SAKU Anda`
                : selectedPayment === "QRISBCA"
                ? `QR BCA Anda`
                : `QR ${selectedPayment} Anda`
            }`}
          </p>
          <Lottie
            animationData={ICScanToken}
            className={`${isLandscape ? "w-[25%]" : "w-[60%]"} mx-auto`}
          />
        </div>
      </Modal>
      <div
        style={{
          height: `${isLandscape ? "1080px" : "1920px"}`,
          width: `${isLandscape ? "1920px" : "1080px"}`,
        }}
        className={`flex flex-col p-10 ${memberMerah ? "bg-red" : "bg-blue"}`}
      >
        {isLandscape ? (
          <div className="flex flex-row items-center justify-between gap-5 mb-auto">
            <img
              src={LogoIGR}
              alt="Logo IGR"
              className="drop-shadow-lg rounded h-[150px]"
            />
            <p className="font-bold text-white text-title ">Menu Pembayaran</p>

            <StandardBtn
              title="Kembali"
              path="/kasirSelfService"
              width="20%"
              pembayaran={true}
            />
          </div>
        ) : (
          <>
            <img
              src={LogoIGR}
              alt="Logo IGR"
              className="drop-shadow-lg rounded h-[186px] self-center"
            />

            <p className="mt-10 mb-10 font-bold text-center text-white text-subTitle">
              Menu Pembayaran
            </p>
          </>
        )}
        <div className="w-[100%] flex flex-col bg-gray-100 rounded-[20px] mb-5 p-10">
          <div className="flex flex-row justify-between gap-5 align-middle">
            <p className="font-semibold text-text">Total Nilai: </p>
            <p className="text-text">
              {formattedNumber(glDtHitungTotal[0]["totalNilai"])}
            </p>
          </div>
          <div className="flex flex-row justify-between gap-5 py-2 align-middle border-t border-black border-solid">
            <p className="font-semibold text-text ">Potongan Member:</p>
            <p className="text-text">
              {formattedNumber(glDtHitungTotal[0]["totDisc"])}
            </p>
          </div>
          <div className="flex flex-row justify-between gap-5 py-2 align-middle border-t border-black border-solid">
            <p className="font-semibold text-text ">Potongan Pembayaran:</p>
            <p className="text-text">
              {formattedNumber(glDtHitungTotal[0]["totCashback"])}
            </p>
          </div>

          <div className="pt-5 mt-auto">
            <div className="w-full mb-5 border-t-4 border-black border-dashed"></div>
            <div className="flex flex-row justify-between">
              <p className="font-bold text-subTitle">Total Pembayaran</p>
              <p className="font-bold text-subTitle">
                {formattedNumber(glDtHitungTotal[0]["jumlahPenjualan"])}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5 mt-5 mb-auto">
          <p className="font-bold text-center text-white text-subTitle">
            Silahkan pilih metode pembayaran yang diinginkan
          </p>
          <div
            className={`flex ${
              isLandscape ? "flex-row justify-center " : "flex-col "
            } items-center gap-5 mb-10`}
          >
            {listPaymentMethod.map((item, itemIndex) => (
              <button
                onClick={() => handleSelectedPayment(item.value)}
                className={`${
                  isLandscape ? "w-[20%] " : "w-[40%]"
                } h-[180px] flex justify-center items-center flex-row  rounded-xl bg-stroke-white p-3 bg-white transform transition duration-200 active:scale-90`}
              >
                <img
                  src={
                    item.value === "ISAKU"
                      ? IcIsaku
                      : item.value === "SHOPEEPAY"
                      ? IcShopeepay
                      : item.value === "QRISBCA"
                      ? IcBca
                      : IcGopay
                  }
                  alt=""
                  className="  h-[75%] rounded-xl "
                />
                {/* {item.title} */}
              </button>
            ))}
          </div>
        </div>
        <div
          className={`flex flex-row self-center items-center gap-5 ${
            isLandscape ? "w-[50%]" : "w-[100%]"
          }`}
        >
          {!isLandscape && (
            <StandardBtn
              title="Kembali"
              path="/kasirSelfService"
              width="100%"
              pembayaran={true}
            />
          )}
          {/* <StandardBtn
            title="Cek Promo MKT"
            path="/pembelianPembayaranMenu"
            width="50%"
            pos={true}
          /> */}

          {/* <button
            onClick={() => setOpenModalPayment(true)}
            className={`w-[50%] h-[96px] rounded-xl bg-stroke-white bg-blue p-3 text-subText font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3`}
          >
            Lanjutkan Pembayaran
          </button> */}
        </div>
      </div>
    </>
  );
}

export default KasirPembayaran;
