import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ModalAlert from "./ModalAlert";
import { IcErr, IcRefresh } from "../assets";
import { channels } from "../shared/constants";
import { toggleMemberMerah } from "../services/redux/memberReducer";
import { setGlDataUser } from "../services/redux/userReducer";
import Loader from "./Loader";
import { setGlDtIp } from "../services/redux/ipReducer";
import { AESEncrypt, charToPass, LOGIN_KEY, URL_GATEWAY } from "../config.js";
const { ipcRenderer } = window.require("electron");

function HiddenInput({ closingState, logoutState }) {
  const [inputValue, setInputValue] = useState("");
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const inputRef = useRef(null);
  const [openModalAlert, setOpenModalAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  let stateIpAdd = "";
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const glUserModul = useSelector((state) => state.glUser.userModul);
  const glStationModul = useSelector((state) => state.glUser.stationModul);
  const glIpModul = useSelector((state) => state.glDtIp.dtIp);
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/mainmenu");
  };
  const dispatch = useDispatch();
  let ipModulRef = useRef("");
  let scanStartTime = useRef(null);

  const handleToggleMember = () => {
    dispatch(toggleMemberMerah());
  };

  const handleInputChange = (e) => {
    // Mengupdate nilai state saat input berubah

    // Set start time user mulai mengetik
    if (!scanStartTime.current) {
      scanStartTime.current = performance.now();
    }

    setInputValue(e.target.value);
  };

  const getIpAddress = async () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send("get_ip_address");

      // Listen for the event
      ipcRenderer.once("get_ip_address", (event, arg) => {
        stateIpAdd = arg;
        stateIpAdd = AESEncrypt(stateIpAdd);
        console.log("stateIpAdd di get", stateIpAdd);
        dispatch(setGlDtIp(stateIpAdd));
        ipModulRef.current = stateIpAdd;
        resolve();
      });

      // Handle error if needed
      ipcRenderer.once("get_ip_address", (event, error) => {
        reject(error);
      });
    });
  };

  const handleEnterPress = async (e) => {
    if (e.key === "Enter") {
      setLoading(true);
      //Menghitung durasi pengetikan untuk membedakan scanner dan keyboard
      const scanEndTime = performance.now();
      const scanDuration = scanEndTime - scanStartTime.current;
      let memberId = inputValue;
      memberId = memberId.split("#").join("").toUpperCase();

      if (scanDuration > 100 && !memberId.startsWith("MANUAL")) {
        if (memberId === "LOGOUT" || memberId === "logout") {
          setInputValue("");
          logoutState();
          setLoading(false);
        } else if (memberId === "CLOSING" || memberId === "closing") {
          setInputValue("");
          closingState();
          setLoading(false);
        } else {
          setMsg("Maaf, Login wajib menggunakan kartu member");
          setInputValue("");
          scanStartTime.current = null;
          setOpenModalAlert(true);
          setLoading(false);
        }
      } else {
        scanStartTime.current = null;
        memberId = memberId.replace(/^MANUAL/, "");
        console.log(memberId);
        await getIpAddress();
        console.log("Gl Registry di Hidden Input: ", glRegistryDt);
        if (memberId === "LOGOUT" || memberId === "logout") {
          setInputValue("");
          logoutState();
          setLoading(false);
        } else if (memberId === "CLOSING" || memberId === "closing") {
          setInputValue("");
          closingState();
          setLoading(false);
        } else {
          console.log(ipModulRef.current);
          await axios
            .post(
              `${URL_GATEWAY}/login/loadLoginUser`,
              {
                memberId: memberId,
                ipAddress: stateIpAdd,
                kodeIGR: glRegistryDt["glRegistryDt"]["registryOraIGR"],
                dtUserModul: glUserModul,
                dtStationModul: glStationModul,
                dtIpModul: ipModulRef.current,
                dbStatus: glRegistryDt["glRegistryDt"]["server"],
              },
              {
                headers: {
                  server: glRegistryDt["glRegistryDt"]["server"],
                  registryOraIGR:
                    glRegistryDt["glRegistryDt"]["registryOraIGR"],
                  registryIp: glRegistryDt["glRegistryDt"]["registryOraIP"],
                  registryPort: glRegistryDt["glRegistryDt"]["registryPort"],
                  registryServiceName:
                    glRegistryDt["glRegistryDt"]["registryServiceName"],
                  registryUser: glRegistryDt["glRegistryDt"]["registryUser"],
                  registryPwd: glRegistryDt["glRegistryDt"]["registryPwd"],
                  "Cache-Control": "no-cache",
                  "x-api-key": LOGIN_KEY,
                },
              }
            )
            .then((response) => {
              console.log(
                "response get user login: ",
                response["data"]["data"]["memberFlag"]
              );
              if (response["data"]["data"]["memberFlag"] === "Y") {
                setInputValue("");
                dispatch(setGlDataUser(response["data"]["data"]));
                handleNavigate();
              } else {
                handleToggleMember();
                setInputValue("");
                dispatch(setGlDataUser(response["data"]["data"]));
                handleNavigate();
              }
              setLoading(false);
            })
            .catch(function (error) {
              console.log(error);

              if (error.message === "Network Error") {
                setMsg("Gagal Terhubung Dengan Gateway");
              } else {
                setMsg(error["response"]?.["data"]?.["status"]);
              }

              setInputValue("");
              setLoading(false);
              setOpenModalAlert(true);
            });
        }
      }
    }
  };

  const refreshApp = () => {
    ipcRenderer.send("refresh-window");
  };

  // const handleKeyUp = (event) => {
  //   const scanEndTime = performance.now();
  //   const scanDuration = scanEndTime - scanStartTime.current;

  //   // Jika scan kurang dari 100ms, kita anggap dari scanner
  //   if (scanDuration < 100) {
  //     console.log("Input dari scanner:", barcode);
  //   } else {
  //     console.log("Input manual (DIBLOKIR)");
  //     setInputValue(""); // Reset input jika dari keyboard
  //   }

  //   scanStartTime.current = null; // Reset waktu scan
  // };

  return (
    <>
      <Loader loading={loading} />
      <ModalAlert
        open={openModalAlert}
        onClose={() => setOpenModalAlert(false)}
      >
        <div className="text-center">
          <img src={IcErr} alt="Warn" className="mx-auto" />
          <div className="mx-auto my-4">
            <h3 className="font-black text-gray-800 text-text">Error</h3>
            {msg === "Maaf, Sepertinya Terjadi Kesalahan" ? (
              <>
                <p
                  className="mt-5 text-lg text-gray-500"
                  style={{ wordWrap: "break-word" }}
                >
                  {msg}
                </p>
                <p
                  className="mt-1 text-lg text-gray-500"
                  style={{ wordWrap: "break-word" }}
                >
                  Silahkan Tekan Tombol Refresh Lalu Scan Ulang
                </p>

                <div className="flex gap-4 mt-2">
                  <button
                    className="mx-auto btn btn-light"
                    onClick={refreshApp}
                  >
                    <img src={IcRefresh} alt="refresh" className="w-[60px]" />
                  </button>
                </div>
              </>
            ) : (
              <p
                className="mt-5 text-lg text-gray-500"
                style={{ wordWrap: "break-word" }}
              >
                {msg}
              </p>
            )}
          </div>
        </div>
      </ModalAlert>
      <input
        type="text"
        value={inputValue}
        className="absolute -z-10"
        onKeyDown={handleEnterPress}
        autoFocus
        onBlur={(e) => e.target.focus()}
        onChange={handleInputChange}
      />
    </>
  );
}

export default HiddenInput;
