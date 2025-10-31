import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IcErr, IcSucc } from "../../assets";
import Loader from "../../components/Loader";
import ModalAlert from "../../components/ModalAlert";
import { AESEncrypt, LOGIN_KEY, URL_GATEWAY } from "../../config";
import { setGlDtIp } from "../../services/redux/ipReducer";
import {
  setGlDataNamaModul,
  setGlDataStationModul,
  setGlDataUserModul,
} from "../../services/redux/userReducer";
import { useNavigate } from "react-router-dom";
import packageJson from "../../../package.json";
var md5 = require("md5");

const { ipcRenderer } = window.require("electron");

function LoginUser() {
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
  const glStationModul = useSelector((state) => state.glUser.stationModul);

  const [inputUser, setInputUser] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [currentInput, setCurrentInput] = useState(null);
  const [dtModul, setDtModul] = useState({
    userModul: "",
    stationModul: "",
    namaModul: "",
  });
  let stateIpAdd = "";
  const navigate = useNavigate();
  const appVersion = packageJson.version;

  const getIpAddress = () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send("get_ip_address");

      // Listen for the event
      ipcRenderer.once("get_ip_address", (event, arg) => {
        stateIpAdd = arg;
        stateIpAdd = AESEncrypt(stateIpAdd);
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
  };

  const onChangeInput = (event, inputType) => {
    const input = event.target.value;
    if (inputType === "user") {
      setInputUser(input.toString().toUpperCase());
    } else if (inputType === "password") {
      setInputPassword(input.toString().toUpperCase());
    }
  };

  const handleBtnLogin = async () => {
    setLoading(true);
    if (!inputUser) {
      setMsg("Maaf, UserId Harus Diisi");
      setOpenModalAlert(true);
      setLoading(false);
      return;
    } else if (!inputPassword) {
      setMsg("Maaf, Password Harus Diisi");
      setOpenModalAlert(true);
      setLoading(false);
      return;
    }

    console.log(inputPassword);
    let hashPassword = md5(inputPassword);
    console.log(hashPassword);
    await getIpAddress();
    await axios
      .post(
        // `${URL_GATEWAY}/login/loadLoginUser`,
        `${URL_GATEWAY}/login/loginUser`,
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

        ipcRenderer
          .invoke("create_registry_userstation", dtModul)
          .then((result) => {
            setResSuccess(true);
            setMsg("Berhasil Setting Modul");
            setOpenModalAlert(true);
            setLoading(false);
            navigate("/");
          })
          .catch(async (error) => {
            setMsg("Gagal Setting Modul");
            setOpenModalAlert(true);
          });
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
        className={`overflow-hidden h-screen bg-login flex flex-col p-5 justify-center items-center`}
      >
        <div
          className={`flex flex-col gap-5 p-5 drop-shadow-lg bg-white  rounded-xl w-[50%]`}
        >
          <p className="my-1 font-bold text-center text-black text-xl">
            Login User
          </p>

          <div
            className={`flex flex-col gap-2`}
          >
            <div
              className={`flex flex-col gap-3 mt-6 align-middle`}
            >
              <label className="font-bold font-medium text-subText">User</label>
              <input
                id="userid"
                value={inputUser}
                onFocus={() => handleFocus("user")}
                placeholder={"Masukkan User"}
                onChange={(e) => onChangeInput(e, "user")}
                className="border drop-shadow-lg px-4 py-2 rounded-xl w-[100%] text-subText"
              />
            </div>
            <div
              className={`flex flex-col gap-3 mt-6 align-middle`}
            >
              <label className="font-bold font-medium text-subText">Password</label>
              <input
                id="password"
                type="password"
                value={inputPassword}
                onFocus={() => handleFocus("password")}
                placeholder={"Masukkan Password"}
                onChange={(e) => onChangeInput(e, "password")}
                className="border drop-shadow-lg px-4 py-2 rounded-xl w-[100%] text-subText"
              />
            </div>
          </div>

          <div
            className={`flex flex-row gap-2 mt-1 mx-auto w-full items-center justify-center`}
          >
            <button
              onClick={handleBtnLogin}
              className={`w-[40%] rounded-xl bg-stroke-white p-3 text-subText font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3 flex flex-row items-center justify-center gap-4  `}
            >
              Login
            </button>
            <button
              onClick={handleBtnKeluar}
              className={`w-[40%] rounded-xl bg-stroke-white p-3 text-subText font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-red to-red3 flex flex-row items-center justify-center gap-4  `}
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginUser;