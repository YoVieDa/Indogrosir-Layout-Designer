import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IcErr,
  IcSucc,
} from "../../assets";
import Loader from "../../components/Loader";
import ModalAlert from "../../components/ModalAlert";
import SetServer from "../../components/SetServer";
import {
  setGlDtDecryptedRegistry,
  setGlDtGatewayURL,
} from "../../services/redux/registryReducer";
import {
  AESEncrypt,
  LOGIN_KEY,
  passToChar,
  URL_GATEWAY,
} from "../../config";
import {
  setGlDataNamaModul,
  setGlDataStationModul,
  setGlDataUser,
  setGlDataUserModul,
} from "../../services/redux/userReducer";
import { useNavigate } from "react-router-dom";
import SetGatewayUrl from "../../components/SetGatewayUrl";
import packageJson from "../../../package.json";
import Sidebar from "../../components/Sidebar";

const { ipcRenderer } = window.require("electron");

function MainMenu() {
  // Var open modal
  const [showSetServer, setShowSetServer] = useState(false);
  const [showSetGatewayURL, setShowSetGatewayURL] = useState(false);
  const [showLoginUserAlert, setShowLoginUserAlert] = useState(false);
  const [openModalAlert, setOpenModalAlert] = useState(false); // Notif Error atau sukses

  const [f8Key, setF8Key] = useState(false);    // Var untuk flag yang mentrigger refreshApp di dalam Component SetGatewayUrl
  const [dtRegistry, setDtRegistry] = useState(null);   // Var untuk simpan semua data registry dari dekstop
  const [loading, setLoading] = useState(false);
  
  const [URL_GATEWAY, setURL_GATEWAY] = useState(false);
  const [openSS, setOpenSS] = useState(false);
  const [registrySS, setRegistrySS] = useState(null);
  const [msg, setMsg] = useState("");
  const [resSuccess, setResSuccess] = useState(false);
  
  const dispatch = useDispatch();

  const glUserModul = useSelector((state) => state.glUser.userModul);
  const glStationModul = useSelector((state) => state.glUser.stationModul);
  // const glNamaModul = useSelector((state) => state.glUser.namaModul);
  let glRegistryDt;
  const glDtRegistry = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const navigate = useNavigate();
  const appVersion = packageJson.version;

  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Fungsi-fungsi di dalam sini akan dijalankan 

    // Fungsi untuk baca Regedit di komputer
    // Fungsi ini dibuat di dalam useEffect supaya fungsi ini hanya bisa dipanggil di dalam useEffect dan tidak bisa dipanggil di luar useEffect
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

    // Fungsi kalau misal di komputer ini mau ganti gateway atau cabang
    const handleKeyPress = (event) => {
      if (event.key === "F2") {
        console.log("showSetServer", showSetServer);
        setShowSetServer(true);
      } else if (event.key === "F8") {
        console.log("showSetGatewayURL", showSetGatewayURL);
        setShowSetGatewayURL(true);
        setF8Key(true);
      }
    };

    dispatch(setGlDataUser(null));
    getRegistry();

    console.log("1.");

    window.addEventListener("keydown", handleKeyPress);

    // Bersihkan event listener ketika komponen di-unmount
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      ipcRenderer.removeAllListeners("get_data_registry");
    };
  }, []);

  useEffect(() => {
    // Ini fungsi yang ke trigger hanya jika dtRegistry berubah 
    // yang mana triggernya ada di fungsi getRegistry
    if (dtRegistry !== null) {
      if (dtRegistry === false) {
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
              // Bagian ini yang atur kalo misal data di registri yang bagian Station Modul sama user Modul kosongan
              navigate("/loginUser");
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
  }, [dtRegistry]);

  const handleLogoutState = async () => {
    console.log("handlelogout", registrySS);
    await axios
      .post(
        // `${URL_GATEWAY}/login/loadLogoutUser`,
        `${URL_GATEWAY}/login/logoutUser`,
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
      .then(async (response) => {
        await ipcRenderer
          .invoke("delete_registry_userstation")
          .then((result) => {
            dispatch(setGlDataUserModul(""));
            dispatch(setGlDataStationModul(""));
            dispatch(setGlDataNamaModul(""));
            setResSuccess(true);
            setMsg("Logout Berhasil");
            setLoading(false);
            navigate("/loginUser");
          })
          .catch(async (error) => {
            setMsg("Gagal Menghapus Modul");
            setOpenModalAlert(true);
            setLoading(false);
          });
      })
      .catch(async function (error) {
        if (error.message === "Network Error") {
          setMsg("Gagal Terhubung Dengan Gateway");
        } else {
          setMsg(error["response"]?.["data"]?.["status"]);
        }

        const glDtRegistry = { glRegistryDt: registrySS };
        setOpenModalAlert(true);
        setMsg(`Logout Gagal\n` + error.message);
        setLoading(false);
      });
  };

  // Fungsi untuk mengaktifkan alert setting gateway dan cabang
  const handleStateSetServer = () => {
    setShowSetServer(true);
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

      {/* Ini untuk menampilkan pop up setting gateway dan cabang */}
      {showSetServer === true ? <SetServer show={showSetServer} /> : null}
      {showSetGatewayURL === true ? (
        <SetGatewayUrl
          show={showSetGatewayURL}
          showSetServer={handleStateSetServer}
          f8Key={f8Key}
        />
      ) : null}

      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} quitAppFunction={handleLogoutState}/>
    </>
  );
}

export default MainMenu;