import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { IcErr, IcSucc, LogoIGR } from "../../assets";
import Loader from "../../components/Loader";
import ModalAlert from "../../components/ModalAlert";
import { setGlDtOritentation } from "../../services/redux/orientationReducer";
import "./loginMember.css";
import { LOGIN_KEY, URL_GATEWAY } from "../../config";
import { setGlDtIp } from "../../services/redux/ipReducer";
import {
  setGlDataNamaModul,
  setGlDataStationModul,
  setGlDataUserModul,
} from "../../services/redux/userReducer";
import { useNavigate } from "react-router-dom";
var md5 = require("md5");

const { ipcRenderer } = window.require("electron");

function LoginPSS() {
  const [loading, setLoading] = useState(false);
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const [openModalAlert, setOpenModalAlert] = useState(false);
  const [msg, setMsg] = useState("");
  const [resSuccess, setResSuccess] = useState(false);
  const dispatch = useDispatch();
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const glFlagClosing = useSelector((state) => state.glRegistry.flagClosing);

  const [isPortrait, setIsPortrait] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [inputUser, setInputUser] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [currentInput, setCurrentInput] = useState(null);
  const [dtModul, setDtModul] = useState({
    userModul: "",
    stationModul: "",
    namaModul: "",
  });
  const keyboard = useRef();
  let stateIpAdd = "";
  const navigate = useNavigate();

  useEffect(() => {
    const updateOrientation = () => {
      const { innerWidth: width, innerHeight: height } = window;

      setIsPortrait(width === 1080 && height === 1920);
      setIsLandscape(width === 1920 && height === 1080);
      dispatch(setGlDtOritentation(width === 1920 && height === 1080));
    };

    updateOrientation();
    window.addEventListener("resize", updateOrientation);

    // // Declare dan cek doc info
    // if (glDtDocInfo === "") {
    //   dispatch(addDtInfo("0001"));
    // }

    if (glFlagClosing === true) {
      ipcRenderer.send("quit_app");
    }

    // Bersihkan event listener ketika komponen di-unmount
    return () => {
      ipcRenderer.removeAllListeners("get_data_registry");
      window.removeEventListener("resize", updateOrientation);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getIpAddress = () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send("get_ip_address");

      // Listen for the event
      ipcRenderer.once("get_ip_address", (event, arg) => {
        stateIpAdd = arg;
        console.log("stateIpAdd di get", stateIpAdd);
        dispatch(setGlDtIp(stateIpAdd));
        resolve();
      });

      // Handle error if needed
      ipcRenderer.once("get_ip_address", (event, error) => {
        reject(error);
      });
    });
  };

  const handleFocus = (inputType) => {
    setCurrentInput(inputType);
    keyboard.current.setInput(
      inputType === "user"
        ? inputUser
        : inputType === "password"
        ? inputPassword
        : inputUser
    );
  };

  const onChangeInput = (event, inputType) => {
    const input = event.target.value;
    if (inputType === "user") {
      setInputUser(input.toString().toUpperCase());
    } else if (inputType === "password") {
      setInputPassword(input.toString().toUpperCase());
    }
    keyboard.current.setInput(input.toString().toUpperCase());
  };

  const onChangeAll = (input) => {
    if (currentInput === "user") {
      setInputUser(input);
    } else if (currentInput === "password") {
      setInputPassword(input);
    }
  };

  const handleBtnLogin = async () => {
    setLoading(true);
    if (!inputUser) {
      setMsg("Maaf, UserId Harus Diisi");
      setOpenModalAlert(true);
      setLoading(false);
      // setAlertIc("Error");
      // setAlertTitle("Error");
      return;
    } else if (!inputPassword) {
      setMsg("Maaf, Password Harus Diisi");
      setOpenModalAlert(true);
      setLoading(false);
      // setAlertIc("Error");
      // setAlertTitle("Error");
      return;
    }

    console.log(inputPassword);
    let hashPassword = md5(inputPassword);
    console.log(hashPassword);
    await getIpAddress();
    await axios
      .post(
        `${URL_GATEWAY}/login/loadLoginPSS`,
        {
          ipAddress: stateIpAdd,
          userId: inputUser,
          password: hashPassword,
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
            "x-api-key": LOGIN_KEY,
          },
        }
      )
      .then((response) => {
        setDtModul(
          (dtModul.userModul = response["data"]["userModul"]),
          (dtModul.stationModul = response["data"]["stationModul"]),
          (dtModul.namaModul = response["data"]["namaModul"])
        );

        dispatch(setGlDataUserModul(response["data"]["userModul"]));
        dispatch(setGlDataStationModul(response["data"]["stationModul"]));
        dispatch(setGlDataNamaModul(response["data"]["namaModul"]));

        ipcRenderer.send("create_registry_userstation", dtModul);

        ipcRenderer.on("create_registry_userstation", (event, arg) => {
          if (arg === "Gagal membuat registry user station") {
            setMsg("Gagal Setting Modul");
            setOpenModalAlert(true);
          } else {
            setResSuccess(true);
            setMsg("Berhasil Setting Modul");
            setOpenModalAlert(true);
            navigate("/");
            setLoading(false);
          }
        });

        // Clean the listener after the component is dismounted

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

        setInputUser("");
        setInputPassword("");
        setLoading(false);
        setOpenModalAlert(true);
      });
  };

  const handleBtnKeluar = () => {
    ipcRenderer.send("quit_app");
  };

  return (
    <>
      <Loader loading={loading} />

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

      <div
        className={`overflow-hidden ${
          isLandscape ? "bg-login" : "bg-login-potrait"
        } flex flex-col p-5 justify-center items-center`}
      >
        <div
          className={`flex flex-col gap-5 p-5 drop-shadow-lg  bg-white  rounded-xl ${
            isLandscape ? "w-[75%]" : "w-[90%]"
          }`}
        >
          {isLandscape ? (
            <div className="flex flex-col items-center self-center gap-5 mb-auto">
              <img
                src={LogoIGR}
                alt="Logo IGR"
                className="drop-shadow-lg rounded mb-5 w-[450px] h-[140px]"
              />
              <p className="font-bold text-black text-subTitle">
                Login POS Self Service
              </p>
            </div>
          ) : (
            <>
              <img
                src={LogoIGR}
                alt="Logo IGR"
                className="drop-shadow-lg rounded w-[450px] h-[140px] self-center"
              />

              <p className="mt-5 mb-10 font-bold text-center text-black text-subTitle">
                Login POS Self Service
              </p>
            </>
          )}

          <div
            className={`flex ${isLandscape ? "flex-row" : "flex-col"} gap-5`}
          >
            <div
              className={`flex flex-col  ${
                isLandscape ? "w-[50%]" : "w-[100%]"
              }`}
            >
              <label className="font-bold text-subText">User</label>
              <input
                id="userid"
                value={inputUser}
                onFocus={() => handleFocus("user")}
                placeholder={"Masukkan User"}
                onChange={(e) => onChangeInput(e, "user")}
                className="border drop-shadow-lg bg-stroke p-5 rounded-xl w-[100%] text-subText"
              />
            </div>
            <div
              className={`flex flex-col  ${
                isLandscape ? "w-[50%]" : "w-[100%]"
              }`}
            >
              <label className="font-bold text-subText">Password</label>
              <input
                id="password"
                type="password"
                value={inputPassword}
                onFocus={() => handleFocus("password")}
                placeholder={"Masukkan Password"}
                onChange={(e) => onChangeInput(e, "password")}
                className="border drop-shadow-lg bg-stroke p-5 rounded-xl w-[100%] text-subText"
              />
            </div>
          </div>

          <div
            className={`flex flex-row gap-2 mt-10 ${
              isLandscape ? "" : "mt-10"
            } mx-auto w-full items-center justify-center`}
          >
            <button
              onClick={handleBtnLogin}
              className={`w-[30%] h-[96px] rounded-xl bg-stroke-white p-3 text-subText font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3 flex flex-row items-center justify-center gap-4  `}
            >
              Login
            </button>
            <button
              onClick={handleBtnKeluar}
              className={`w-[30%] h-[96px] rounded-xl bg-stroke-white p-3 text-subText font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-red to-red3 flex flex-row items-center justify-center gap-4  `}
            >
              Keluar
            </button>
          </div>
          <div
            className={`${
              isLandscape ? "w-[85%]" : " w-[100%]"
            } self-center mt-5`}
          >
            <Keyboard
              layout={{
                default: [
                  "1 2 3 4 5 6 7 8 9 0 _ {bksp}",
                  "Q W E R T Y U I O P",
                  "A S D F G H J K L",
                  "Z X C V B N M , . @",
                  "{space}",
                ],
              }}
              display={{
                "{bksp}": "⌫",
                "{space}": "Space",
              }}
              theme="hg-theme-default hg-layout-default myTheme"
              keyboardRef={(r) => (keyboard.current = r)}
              //   inputName={inputName}
              onChange={onChangeAll}
              buttonTheme={[
                {
                  class: "custom-btn",
                  buttons: "1 2 3 4 5 6 7 8 9 0 _ {bksp}",
                },
                {
                  class: "custom-btn",
                  buttons: "Q W E R T Y U I O P",
                },
                {
                  class: "custom-btn",
                  buttons: "A S D F G H J K L",
                },
                {
                  class: "custom-btn",
                  buttons: "Z X C V B N M , . @",
                },
                {
                  class: "custom-btn",
                  buttons: "{space}",
                },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPSS;
