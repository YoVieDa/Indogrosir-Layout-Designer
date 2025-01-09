import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IcArrowBot,
  IcErr,
  IcSucc,
  LogoIGR,
  NoImageLandscape,
  NoImagePortrait,
} from "../../assets";
import HiddenInput from "../../components/HiddenInput";
import Loader from "../../components/Loader";
import ModalAlert from "../../components/ModalAlert";
import SetServer from "../../components/SetServer";
import {
  setGlLogOutLimitApp,
  setglLogoutLimit,
} from "../../services/redux/counterReducer";
import {
  setFlagClosing,
  setGlDtDecryptedRegistry,
  setGlDtGatewayURL,
  setGlDtShift,
} from "../../services/redux/registryReducer";
import { setGlDtOritentation } from "../../services/redux/orientationReducer";
import { addDtInfo } from "../../services/redux/documentInfoReducer";
import "./loginMember.css";
import { LOGIN_KEY, passToChar, PAYMENT_KEY, URL_GATEWAY } from "../../config";
import {
  setGlDataNamaModul,
  setGlDataStationModul,
  setGlDataUser,
  setGlDataUserModul,
} from "../../services/redux/userReducer";
import Modal from "../../components/Modal";
import { useNavigate } from "react-router-dom";
import { removeAllItemsHitungTotal } from "../../services/redux/dtAllInputtedItemReducer";
import SetGatewayUrl from "../../components/SetGatewayUrl";
import { toggleMemberMerah } from "../../services/redux/memberReducer";

const { ipcRenderer } = window.require("electron");

function LoginMember() {
  const [showSetServer, setShowSetServer] = useState(false);

  const [showSetGatewayURL, setShowSetGatewayURL] = useState(false);
  const [f8Key, setF8Key] = useState(false);
  const [dtRegistry, setDtRegistry] = useState(null);
  const [loading, setLoading] = useState(false);
  const textDecoder = new TextDecoder("utf-8");
  const [openModalAlert, setOpenModalAlert] = useState(false);
  const [URL_GATEWAY, setURL_GATEWAY] = useState(false);
  const [openSS, setOpenSS] = useState(false);
  const [registrySS, setRegistrySS] = useState(null);
  const [lcLogOutLimit, setLcLogOutLimit] = useState(40);
  const [sseLimit, setSseLimit] = useState(10);
  const [idxSS, setIdxSS] = useState(0);
  const [msg, setMsg] = useState("");
  const [localShiftState, setLocalShiftState] = useState(false);
  const [resSuccess, setResSuccess] = useState(false);
  const [openModalClosing, setOpenModalClosing] = useState(false);
  const [pictureArr, setPictureArr] = useState([]);
  const dispatch = useDispatch();
  const glDtDocInfo = useSelector((state) => state.glDocInfo.info);
  const glUserModul = useSelector((state) => state.glUser.userModul);
  const glStationModul = useSelector((state) => state.glUser.stationModul);
  const glNamaModul = useSelector((state) => state.glUser.namaModul);
  let glRegistryDt;
  let lcLogOutLimitApp = 40;
  const shiftState = useSelector((state) => state.glRegistry.shiftState);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getRegistry = () => {
      ipcRenderer.send("get_data_registry");

      // Listen for the event
      ipcRenderer.on("get_data_registry", async (event, arg) => {
        setDtRegistry(arg);
        setOpenSS(false);
        console.log(arg);
      });

      // Clean the listener after the component is dismounted
      return () => {};
    };

    dispatch(setGlDataUser(null));
    dispatch(removeAllItemsHitungTotal());
    getRegistry();

    console.log("1.");

    const handleKeyPress = (event) => {
      if (event.key === "F2") {
        console.log("showSetServer", showSetServer);
        setShowSetServer(true);
      } else if (event.key === "F6") {
        setOpenModalClosing(true);
      } else if (event.key === "F8") {
        console.log("showSetGatewayURL", showSetGatewayURL);
        setShowSetGatewayURL(true);
        setF8Key(true);
      }
    };

    const updateOrientation = () => {
      const { innerWidth: width, innerHeight: height } = window;

      setIsPortrait(width === 1080 && height === 1920);
      setIsLandscape(width === 1920 && height === 1080);
      dispatch(setGlDtOritentation(width === 1920 && height === 1080));
    };

    window.addEventListener("keydown", handleKeyPress);
    updateOrientation();
    window.addEventListener("resize", updateOrientation);

    // Bersihkan event listener ketika komponen di-unmount
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      ipcRenderer.removeAllListeners("get_data_registry");
      window.removeEventListener("resize", updateOrientation);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (dtRegistry !== null) {
      if (dtRegistry === false) {
        // setShowSetServer(true);
        setShowSetGatewayURL(true);
        console.log("2. dtRegistry Tidak Ada");
      } else {
        console.log("2. dtRegistry Ada", dtRegistry);
        setLoading(true);
        // Get Encrypted Registry
        const setUpLogin = async () => {
          try {
            // Get Encrypted Registry
            console.log("3. Run setUpGlRegistry", dtRegistry);

            const sendDtRegistry = {
              kodeIGR: dtRegistry?.["kodeIGR"],
              server: dtRegistry?.["oraServer"],
              prnName: dtRegistry?.["encryptedPrnName"],
              prnBrand: dtRegistry?.["encryptedPrnBrand"],
              registryIp: dtRegistry?.["encryptedOraIP"],
              registryPort: dtRegistry?.["encryptedOraPort"],
              registryServiceName: dtRegistry?.["encryptedOraSN"],
              registryUser: dtRegistry?.["encryptedOraUser"],
              registryPwd: dtRegistry?.["encryptedOraPwd"],
            };

            setURL_GATEWAY(passToChar(dtRegistry?.["gatewayUrl"]));

            dispatch(setGlDtGatewayURL(passToChar(dtRegistry?.["gatewayUrl"])));

            console.log("4. dtRegistry dari ipc renderer: ", sendDtRegistry);

            // Get Login

            console.log(
              "5. sendDtRegistry dalam axios get login: ",
              sendDtRegistry
            );

            // eslint-disable-next-line react-hooks/exhaustive-deps
            glRegistryDt = {
              server: sendDtRegistry.server,
              registryOraIGR: sendDtRegistry.kodeIGR,
              registryOraIP: sendDtRegistry.registryIp,
              registryPort: sendDtRegistry.registryPort,
              registryServiceName: sendDtRegistry.registryServiceName,
              registryUser: sendDtRegistry.registryUser,
              registryPwd: sendDtRegistry.registryPwd,
              registryPrnName: sendDtRegistry.prnName,
              registryPrnBrand: sendDtRegistry.prnBrand,
              "Cache-Control": "no-cache",
            };
            console.log("glRegistryDt di dalam set gl regis: ", glRegistryDt);

            setRegistrySS(glRegistryDt);

            dispatch(
              setGlDtDecryptedRegistry({
                glRegistryDt,
              })
            );
            console.log(
              "melakukan set glRegistryDt",
              glUserModul,
              glStationModul
            );
            if (
              dtRegistry?.["userModul"] === "" ||
              dtRegistry?.["stationModul"] === ""
            ) {
              navigate("/loginPSS");
            } else {
              dispatch(setGlDataUserModul(dtRegistry?.["userModul"]));
              dispatch(setGlDataStationModul(dtRegistry?.["stationModul"]));
              dispatch(setGlDataNamaModul(dtRegistry?.["namaModul"]));
            }
            setLoading(false);
          } catch (error) {
            setLoading(false);
          }
        };

        setUpLogin(); // setSendDtRegistry(dtRegistry);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dtRegistry]);

  useEffect(() => {
    if (registrySS !== undefined && registrySS !== null) {
      if (registrySS["registryOraIGR"] !== "") {
        console.log("glRegistryDtfffff", registrySS["registryOraIGR"]);
        setUpLogoutCounter(registrySS);
        getCounterRotationSS(registrySS);
        setUpSSCounter(registrySS);
        openShift(registrySS);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrySS]);

  const openShift = async (glRegistryDt1) => {
    // Do And Check Open Shift
    await axios
      .post(
        `${URL_GATEWAY}/servicePayment/openShiftPos`,
        {
          kodeIGR: glRegistryDt1["registryOraIGR"],
          stationModul: glStationModul,
          userModul: glUserModul,
        },
        {
          headers: {
            server: glRegistryDt1["server"],
            registryOraIGR: glRegistryDt1["registryOraIGR"],
            registryIp: glRegistryDt1["registryOraIP"],
            registryPort: glRegistryDt1["registryPort"],
            registryServiceName: glRegistryDt1["registryServiceName"],
            registryUser: glRegistryDt1["registryUser"],
            registryPwd: glRegistryDt1["registryPwd"],
            "Cache-Control": "no-cache",
            "x-api-key": PAYMENT_KEY,
          },
        }
      )
      .then((response) => {
        console.log("response open shift", response["data"]["status"]);
        if (response["data"]["status"] === 0) {
          setOpenModalAlert(true);
          dispatch(setGlDtShift(true));

          setMsg("Berhasil Open Shift");
          setResSuccess(true);
        } else if (response["data"]["status"] === 1) {
          dispatch(setGlDtShift(true));
        }
      })
      .catch(function (error) {
        if (error.message === "Network Error") {
          setOpenModalAlert(true);
          setMsg("Gagal Terhubung Dengan Gateway");
        } else {
          setOpenModalAlert(true);
          dispatch(setGlDtShift(false));

          setMsg(error["response"]["data"]["status"]);
        }
        setLoading(false);
      });
  };

  const setUpSSCounter = async (glRegistryDt1) => {
    await axios
      .get(`${URL_GATEWAY}/login/counter?like=INTERVAL SCREENSAVER`, {
        headers: {
          server: glRegistryDt1["server"],
          registryOraIGR: glRegistryDt1["registryOraIGR"],
          registryIp: glRegistryDt1["registryOraIP"],
          registryPort: glRegistryDt1["registryPort"],
          registryServiceName: glRegistryDt1["registryServiceName"],
          registryUser: glRegistryDt1["registryUser"],
          registryPwd: glRegistryDt1["registryPwd"],
          "Cache-Control": "no-cache",
          "x-api-key": LOGIN_KEY,
        },
      })
      .then((response) => {
        setLcLogOutLimit(response.data["logoutLimit"]);
        dispatch(
          setglLogoutLimit({
            lcLogOutLimit: response.data["logoutLimit"],
          })
        );
      })
      .catch(function (error) {
        console.log(error.message);
        if (error.message === "Network Error") {
          setMsg("Gagal Terhubung Dengan Gateway");
        } else {
          setMsg(error["response"]?.["data"]?.["status"]);
        }
        setLcLogOutLimit(40);
      });
  };

  const setUpLogoutCounter = async (glRegistryDt1) => {
    await axios
      .get(`${URL_GATEWAY}/login/counter?like=INTERVAL LOGOUT`, {
        headers: {
          server: glRegistryDt1["server"],
          registryOraIGR: glRegistryDt1["registryOraIGR"],
          registryIp: glRegistryDt1["registryOraIP"],
          registryPort: glRegistryDt1["registryPort"],
          registryServiceName: glRegistryDt1["registryServiceName"],
          registryUser: glRegistryDt1["registryUser"],
          registryPwd: glRegistryDt1["registryPwd"],
          "Cache-Control": "no-cache",
          "x-api-key": LOGIN_KEY,
        },
      })
      .then((response) => {
        dispatch(
          setGlLogOutLimitApp({
            lcLogOutLimitApp: response.data["logoutLimit"],
          })
        );
      })
      .catch(function (error) {
        console.log(error.message);
        if (error.message === "Network Error") {
          setMsg("Gagal Terhubung Dengan Gateway");
        } else {
          setMsg(error["response"]?.["data"]?.["status"]);
        }
      });
  };

  const getCounterRotationSS = async (glRegistryDt1) => {
    try {
      await axios
        .get(`${URL_GATEWAY}/login/counter?like=INTERVAL ROTATION SS`, {
          headers: {
            server: glRegistryDt1["server"],
            registryOraIGR: glRegistryDt1["registryOraIGR"],
            registryIp: glRegistryDt1["registryOraIP"],
            registryPort: glRegistryDt1["registryPort"],
            registryServiceName: glRegistryDt1["registryServiceName"],
            registryUser: glRegistryDt1["registryUser"],
            registryPwd: glRegistryDt1["registryPwd"],
            "Cache-Control": "no-cache",
            "x-api-key": LOGIN_KEY,
          },
        })
        .then((response) => {
          setSseLimit(response.data["SSELimit"]);
          // setIdxSS(0);
          // eslint-disable-next-line react-hooks/exhaustive-deps
          console.log("sseLimit", sseLimit);
        })
        .catch(function (error) {
          console.log(error.message);
          if (error.message === "Network Error") {
            setMsg("Gagal Terhubung Dengan Gateway");
          } else {
            setMsg(error["response"]?.["data"]?.["status"]);
          }
        });
    } catch (error) {
      console.log(error.message);
    }
  };

  // HandleTouch + ambil gambar
  useEffect(() => {
    if (registrySS !== null && registrySS["registryOraIGR"] !== "") {
      // Mengonversi detik menjadi milidetik
      // const delayInMilliseconds = lcLogOutLimit * 1000;
      let newTimeoutId;

      const handleTouch = () => {
        clearTimeout(newTimeoutId);

        setOpenSS(false);
        console.log("registrySS", registrySS);
        console.log("delayInMilliseconds", lcLogOutLimit * 1000);
        console.log("delayInMillisecond Log out", lcLogOutLimitApp * 1000);

        console.log("sseLimit di handletouch", sseLimit * 1000);
        newTimeoutId = setTimeout(async () => {
          if (pictureArr.length > 0) {
            setIdxSS(0);
            setOpenSS(true);
          } else {
            console.log("masuk handletouch fetchdata");
            console.log("base64ImageArr.length ", pictureArr.length);
            setIdxSS(0);
            await fetchData();
          }
        }, lcLogOutLimit * 1000);
      };

      if (pictureArr.length > 0) {
        console.log("openSS", openSS);
        setIdxSS(0);
        setOpenSS(true);
        console.log("tes");
      } else {
        console.log("masuk handletouch fetchdata initial");
        setIdxSS(0);
        handleTouch();
      }

      const fetchData = async () => {
        try {
          console.log(pictureArr.length);
          const response = await axios.get(
            `${URL_GATEWAY}/login/loadScreenSaver`,
            {
              headers: {
                server: registrySS["server"],
                registryOraIGR: registrySS["registryOraIGR"],
                registryIp: registrySS["registryOraIP"],
                registryPort: registrySS["registryPort"],
                registryServiceName: registrySS["registryServiceName"],
                registryUser: registrySS["registryUser"],
                registryPwd: registrySS["registryPwd"],
                "Cache-Control": "no-cache",
                "x-api-key": LOGIN_KEY,
              },
            }
          );

          // for (
          //   let i = 0;
          //   i < response["data"]["screenSaverPicture"][0].length;
          //   i++
          // ) {
          //   dtPic.push(
          //     response["data"]["screenSaverPicture"][0][i]["SSE_PICTURE"]
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
          console.log("setOpenSS");
          setOpenSS(true);
        } catch (error) {
          console.log(error.message);
          if (error.message === "Network Error") {
            setMsg("Gagal Terhubung Dengan Gateway");
          } else {
            setMsg(error["response"]?.["data"]?.["status"]);
          }
        }
      };

      window.addEventListener("click", handleTouch);

      return () => {
        window.removeEventListener("click", handleTouch);
        clearTimeout(newTimeoutId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lcLogOutLimit, pictureArr]);

  // Handle Rotaion SS
  useEffect(() => {
    let timer;

    console.log("sseLimit di rotation:", sseLimit);
    console.log("base64ImageArr di rotaion", pictureArr.length);
    if (pictureArr.length > 0 && openSS) {
      timer = setTimeout(() => {
        setIdxSS((prevIdx) => (prevIdx + 1) % pictureArr.length);
      }, sseLimit * 1000);
    }

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idxSS, openSS]);

  const handleBtnClosing = async () => {
    setLoading(true);
    await axios
      .post(
        `${URL_GATEWAY}/servicePayment/closingShiftPos`,
        {
          kodeIGR: registrySS["registryOraIGR"],
          stationModul: glStationModul,
          userModul: glUserModul,
          namaModul: glNamaModul,
        },
        {
          headers: {
            server: registrySS["server"],
            registryOraIGR: registrySS["registryOraIGR"],
            registryIp: registrySS["registryOraIP"],
            registryPort: registrySS["registryPort"],
            registryServiceName: registrySS["registryServiceName"],
            registryUser: registrySS["registryUser"],
            registryPwd: registrySS["registryPwd"],
            "Cache-Control": "no-cache",
            "x-api-key": PAYMENT_KEY,
          },
        }
      )
      .then(async (response) => {
        if (response["data"]["status"] === 0) {
          // const data = [
          //   {
          //     type: "image", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
          //     path: `public/images/Header IGR/${glRegistryDt["glRegistryDt"]["registryOraIGR"]}.jpg`,
          //     position: "left",
          //     width: "250px",
          //     height: "100px",
          //   },
          //   {
          //     type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
          //     value: response["data"]["notaClosing"],
          //     style: {
          //       fontFamily: "Courier, monospace", // Mengatur font ke Courier atau monospace lain
          //       whiteSpace: "pre", // Menjaga spasi dan baris baru
          //       fontSize: "10px",
          //       fontWeight: "700",
          //     },
          //   },
          // ];

          const dtToSaveReceipt = {
            receiptDt: response["data"]["notaClosing"],
            path: `\\${response["data"]["stationModul"]}-${response["data"]["tglClosing"]}.TXT`,
            pathSharing: `\\${response["data"]["tglClosing"]}\\${response["data"]["stationModul"]}`,
            pathFile: `\\${response["data"]["tglClosing"]}${response["data"]["userModul"]}C.TXT`,
          };

          ipcRenderer.send("save_receiptpos", dtToSaveReceipt);
          ipcRenderer.send("save_receiptpos_sharing", dtToSaveReceipt);

          const dtToPrint = {
            kodeIGR: registrySS["registryOraIGR"],
            strukData: response["data"]["notaClosing"],
            printerName:
              registrySS["registryPrnName"] !== null &&
              registrySS["registryPrnName"] !== undefined
                ? passToChar(registrySS["registryPrnName"]).trim()
                : "eKioskPrinter",
          };

          ipcRenderer.send("print_closing", dtToPrint);

          const folderPath = `C:\\POSSelfService\\BACKUP\\${response["data"]["tglClosing"]}-${response["data"]["stationModul"]}-${response["data"]["userModul"]}`;
          const outputPath = `C:\\POSSelfService\\BACKUP\\${response["data"]["tglClosing"]}-${response["data"]["stationModul"]}-${response["data"]["userModul"]}.zip`;

          ipcRenderer.send("backup_zip", folderPath, outputPath);

          setOpenModalClosing(false);

          dispatch(setGlDtShift(false));
          dispatch(setFlagClosing(true));
          setLoading(false);
          setOpenModalAlert(true);
          setResSuccess(true);
          setMsg("Berhasil Melakukan Closing");

          setTimeout(async () => {
            await handleLogoutState();
          }, 3500);
        }
      })
      .catch(function (error) {
        setOpenModalClosing(false);
        setLoading(false);
        setOpenModalAlert(true);
        console.log(error);
        setMsg(error["response"]?.["data"]?.["status"]);
      });
  };

  const handleClosingState = () => {
    setOpenModalClosing(true);
  };

  const handleLogoutState = async () => {
    console.log("handlelogout", registrySS);
    await axios
      .post(
        `${URL_GATEWAY}/login/loadLogoutPSS`,
        {
          stationModul: glStationModul,
        },
        {
          headers: {
            server: registrySS["server"],
            registryOraIGR: registrySS["registryOraIGR"],
            registryIp: registrySS["registryOraIP"],
            registryPort: registrySS["registryPort"],
            registryServiceName: registrySS["registryServiceName"],
            registryUser: registrySS["registryUser"],
            registryPwd: registrySS["registryPwd"],
            "Cache-Control": "no-cache",
            "x-api-key": LOGIN_KEY,
          },
        }
      )
      .then((response) => {
        ipcRenderer.send("delete_registry_userstation");
        // Listen for the event
        ipcRenderer.on("delete_registry_userstation", (event, arg) => {
          if (arg === "Gagal menghapus registry user station") {
            setMsg("Gagal Menghapus Modul");
            setOpenModalAlert(true);
          } else {
            // setResSuccess(true);
            // setMsg("Berhasil Menghapus Modul");
            // setOpenModalAlert(true);
            dispatch(setGlDataUserModul(""));
            dispatch(setGlDataStationModul(""));
            dispatch(setGlDataNamaModul(""));
            setResSuccess(true);
            setMsg("Logout Berhasil");
            navigate("/loginPSS");
            setLoading(false);
          }
        });

        return () => {
          ipcRenderer.removeAllListeners();
        };
      })
      .catch(function (error) {
        console.log(error.message);
        if (error.message === "Network Error") {
          setMsg("Gagal Terhubung Dengan Gateway");
        } else {
          setMsg(error["response"]?.["data"]?.["status"]);
        }
        setLoading(false);
        setOpenModalAlert(true);
        setMsg("Logout Gagal\n" + error.message);
      });
  };

  const handleStateSetServer = () => {
    setShowSetServer(true);
  };

  return (
    <>
      <Loader loading={loading} />
      {openSS ? (
        <div className=" w-[1920px] h-[1080px] bg-white fixed z-50 ">
          <img
            src={
              pictureArr[idxSS] !== ""
                ? pictureArr[idxSS]
                : isLandscape
                ? NoImageLandscape
                : NoImagePortrait
            }
            alt="ScreenSaver"
            className={`${
              isLandscape ? "w-[1920px] h-[1080px]" : "w-[1080px] h-[1920px]"
            } z-50 fixed`}
          />
        </div>
      ) : null}

      {showSetServer === true ? <SetServer show={showSetServer} /> : null}
      {showSetGatewayURL === true ? (
        <SetGatewayUrl
          show={showSetGatewayURL}
          showSetServer={handleStateSetServer}
          f8Key={f8Key}
        />
      ) : null}

      <HiddenInput
        closingState={handleClosingState}
        logoutState={handleLogoutState}
      />

      <ModalAlert
        open={openModalAlert}
        onClose={() => {
          setOpenModalAlert(false);
          setResSuccess(false);
        }}
        landscape={isLandscape}
      >
        <div className="text-center">
          <img
            src={resSuccess ? IcSucc : IcErr}
            alt="Warn"
            className="mx-auto"
          />
          <div className="mx-auto my-4">
            <h3 className="font-black text-gray-800 text-text">
              {resSuccess ? "Success" : "Error"}
            </h3>
            <p
              className="mt-5 text-lg text-gray-500"
              style={{ wordWrap: "break-word" }}
            >
              {msg}
            </p>
          </div>
        </div>
      </ModalAlert>

      <Modal
        open={openModalClosing}
        customWidth={80}
        onClose={() => setOpenModalClosing(false)}
        landscape={isLandscape}
      >
        <div className={` bg-gray-400 rounded-t-xl p-5`}>
          <p className="font-semibold text-center text-white text-subTitle">
            {"Closing Shift"}
          </p>
        </div>
        <div
          className={`flex flex-col gap-5 ${
            isLandscape ? "p-16" : "p-10"
          }  bg-white rounded-xl`}
        >
          <p className="font-bold text-center text-text">
            Yakin ingin melakukan Closing Shift Self Service?
          </p>

          <div
            className={`flex flex-row self-center items-center gap-5 ${
              isLandscape ? "w-[50%]" : "w-[80%]"
            } h-[50%]`}
          >
            <button
              onClick={handleBtnClosing}
              className={`w-[50%] h-[96px] rounded-xl bg-stroke-white bg-blue p-3 text-subText font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3`}
            >
              Iya
            </button>

            <button
              onClick={() => setOpenModalClosing(false)}
              className={`w-[50%] h-[96px] rounded-xl bg-stroke-white bg-red p-3 text-subText font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-red to-red3`}
            >
              Tidak
            </button>
          </div>
        </div>
      </Modal>

      <div
        className={`relative overflow-hidden ${
          isLandscape ? "bg-login" : "bg-login-potrait"
        }`}
      >
        <div
          className={`bg-red flex items-center justify-center ${
            isLandscape ? "h-[15vh]" : "h-[10vh]"
          }`}
        >
          <h1 className="font-bold text-center text-yellow text-text">
            Tertarik Memasang Iklan Di Sini? Segera Hubungi Tim Member Service
            Kami!
          </h1>
        </div>

        <div
          className={`flex ${
            isLandscape ? "flex-row gap-x-12" : "flex-col gap-y-12"
          } items-center justify-center h-full `}
        >
          <div className="text-center">
            <img
              src={LogoIGR}
              alt="LogoIGR"
              className="mb-10 rounded drop-shadow-lg"
            />
            <div>
              <h1 className="font-bold text-white text-title text-stroke">
                SARANA INFORMASI
              </h1>
              <h1 className="font-bold text-white text-title text-stroke">
                ANGGOTA INDOGROSIR
              </h1>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <h1 className="font-bold text-white text-title text-stroke">
              Silahkan Scan
            </h1>
            <h1 className="font-bold text-white text-title text-stroke">
              Kartu Anggota anda di sini
            </h1>
            <img
              src={IcArrowBot}
              alt="Arrow Bottom"
              className="mt-20 animate-bounce"
            />
          </div>
        </div>
        <p className="absolute z-10 text-white bottom-4 left-4 text-subText">
          V 1.3.0
        </p>
      </div>
    </>
  );
}

export default LoginMember;
