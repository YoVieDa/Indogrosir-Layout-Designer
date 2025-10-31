import React from "react";
import { useState, useRef, useEffect, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, Transition } from "@headlessui/react";
import Dropdown from "./Dropdown";
import ModalAlert from "./ModalAlert";
import axios from "axios";
import { IcSucc, IcErr } from "../assets";
import { setGlDtEncryptedRegistry } from "../services/redux/registryReducer";
import { SET_SERVER_KEY, URL_GATEWAY } from "../config";

const { ipcRenderer } = window.require("electron");

const server = ["Production", "Simulasi"];

const placeholderCabang = "Pilih Cabang";
const placeholderServer = "Pilih Server";

function SetServer({ show }) {
  const [open, setOpen] = useState(show);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedServer, setSelectedServer] = useState("");
  const [branchList, setBranchList] = useState([]);
  const [openModalAlert, setOpenModalAlert] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgTitle, setMsgTitle] = useState("");
  const [validation, setValidation] = useState(null);
  const [dtRegistry, setDtRegistry] = useState({
    kodeIGR: "",
    oraServer: "",
    encryptedOraIP: "",
    encryptedOraPort: "",
    encryptedOraSN: "",
    encryptedOraUser: "",
    encryptedOraPwd: "",
    userModul: "",
    stationModul: "",
    namaModul: "",
  });
  const dispatch = useDispatch();
  const [installedPrn, setInstalledPrn] = useState([]);
  const cancelButtonRef = useRef(null);
  const handleDropdownSelectedCabang = (option) => {
    setSelectedCabang(option);
  };
  const handleDropdownSelectedServer = (option) => {
    setSelectedServer(option);
  };
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const [isLandscape, setIsLandscape] = useState(false);
  const glUserModul = useSelector((state) => state.glUser.userModul);
  const glStationModul = useSelector((state) => state.glUser.stationModul);
  const glNamaModul = useSelector((state) => state.glUser.namaModul);

  // Untuk get nama printer yang terinstall
  const getPrnName = async () => {
    ipcRenderer.send("get_data_prn");

    ipcRenderer.on("get_data_prn", (event, arg) => {
      console.log(arg);
      const arrInstalledPrn = [];
      for (let i = 0; i < arg.length; i++) {
        if (arg[i].name) {
          arrInstalledPrn.push(arg[i].name);
        } else {
          arrInstalledPrn.push(arg[i]);
        }
      }
      setInstalledPrn(arrInstalledPrn);
    });

    // Clean the listener after the component is dismounted
    return () => {
      ipcRenderer.removeAllListeners();
    };
  };

  useEffect(() => {
    setOpen(show);
  }, [show]);

  // Untuk Get Branch List
  useEffect(() => {
    const updateOrientation = () => {
      const { innerWidth: width, innerHeight: height } = window;

      setIsLandscape(width === 1920 && height === 1080);
    };

    updateOrientation();

    window.addEventListener("resize", updateOrientation);

    axios
      .get(`${URL_GATEWAY}/setServer/getBranchList`, {
        headers: {
          "Cache-Control": "no-cache",
          "x-api-key": SET_SERVER_KEY,
        },
      })
      .then(function (response) {
        // Tanggapan berhasil
        const dtBranchlist = [];
        for (let i = 0; i < response.data["data"].length - 1; i++) {
          dtBranchlist.push(
            `${response.data["data"][i]["CAB_KODECABANG"]} - ${response.data["data"][i]["CAB_NAMACABANG"]}`
          );
        }
        setBranchList(dtBranchlist);
        // Get installed printer
        getPrnName();
      })
      .catch(function (error) {
        // Tanggapan gagal
        console.error("msg: ", error["response"]?.["data"]?.["status"]);
        if (error.message === "Network Error") {
          setMsg("Gagal Terhubung Dengan Gateway");
        } else {
          setMsg(error["response"]?.["data"]?.["status"]);
        }

        setMsgTitle("Error");
        setOpenModalAlert(true);
        setOpen(false);
        refreshApp();
      });

    return () => {
      window.removeEventListener("resize", updateOrientation);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSimpan = async () => {
    let data = {
      kodeIGR: selectedCabang.slice(0, 2),
      server: selectedServer,
    };

    console.log('Dani');
    console.log(data);

    if (data.kodeIGR && data.server) {
    await axios
        .get(
          `${URL_GATEWAY}/setServer/getConnDetail?kodeIGR=${data.kodeIGR}&server=${data.server}`,
          {
            headers: {
              "Cache-Control": "no-cache",
              "x-api-key": SET_SERVER_KEY,
            },
          }
        )
        .then((response) => {
          // Tanggapan berhasil

          console.log(response);

          setDtRegistry(
            (dtRegistry.kodeIGR = response.data.data["kodeIGR"]),
            (dtRegistry.oraServer = response.data.data["oraServer"]),
            (dtRegistry.encryptedOraIP = response.data.data["encryptedOraIP"]),
            (dtRegistry.encryptedOraPort =
              response.data.data["encryptedOraPort"]),
            (dtRegistry.encryptedOraSN = response.data.data["encryptedOraSN"]),
            (dtRegistry.encryptedOraUser =
              response.data.data["encryptedOraUser"]),
            (dtRegistry.encryptedOraPwd =
              response.data.data["encryptedOraPwd"]),
            (dtRegistry.userModul = glUserModul),
            (dtRegistry.stationModul = glStationModul),
            (dtRegistry.namaModul = glNamaModul)
          );

          console.log(" dtRegistry.kodeIGR", dtRegistry.kodeIGR);

          dispatch(
            setGlDtEncryptedRegistry({
              kodeIGR: dtRegistry.kodeIGR,
              oraServer: dtRegistry.oraServer,
              encryptedOraIP: dtRegistry.encryptedOraIP,
              encryptedOraPort: dtRegistry.encryptedOraPort,
              encryptedOraSN: dtRegistry.encryptedOraSN,
              encryptedOraUser: dtRegistry.encryptedOraUser,
              encryptedOraPwd: dtRegistry.encryptedOraPwd,
            })
          );

          ipcRenderer.send("create_registry", dtRegistry);

          ipcRenderer.on("create_registry", (event, arg) => {
            if (arg === "Gagal membuat registry") {
              setMsgTitle("Error");
              setMsg("Gagal Setting Server");
              setOpenModalAlert(true);
              setOpen(false);
              refreshApp();
            } else {
              setMsgTitle("Success");
              setMsg("Berhasil Setting Server");
              setOpenModalAlert(true);
              setOpen(false);
              refreshApp();
            }
          });

          // Clean the listener after the component is dismounted

          return () => {
            ipcRenderer.removeAllListeners();
          };
        })

        .catch(function (error) {
          // Tanggapan gagal
          console.error(error);
          setMsgTitle("Error");
          setMsg(error["response"]["data"]["status"]);
          setOpenModalAlert(true);
          setOpen(false);
          refreshApp();
        });
    } else {
      setValidation("Mohon isi dengan lengkap seluruh input!");
    }
  };

  const refreshApp = () => {
    ipcRenderer.send("refresh-window");
  };

  return (
    <>
      <ModalAlert
        open={openModalAlert}
        onClose={() => setOpenModalAlert(false)}
        landscape={isLandscape}
      >
        <div className="text-center">
          <img
            src={msgTitle === "Error" ? IcErr : IcSucc}
            alt="Warn"
            className="mx-auto"
          />
          <div className="mx-auto my-4">
            <h3 className="font-black text-gray-800 text-text">{msgTitle}</h3>
            <p
              className="mt-5 text-lg text-gray-500"
              style={{ wordWrap: "break-word" }}
            >
              {msg}
            </p>
          </div>
        </div>
      </ModalAlert>

      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" initialFocus={cancelButtonRef} onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 transition-opacity bg-black bg-opacity-60" />
          </Transition.Child>

          <div className="fixed inset-0 w-screen overflow-y-auto">
            <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 translate-y-0 scale-95"
                enterTo="opacity-100 translate-y-0 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 scale-100"
                leaveTo="opacity-0 translate-y-4 translate-y-0 scale-95"
              >
                <Dialog.Panel
                  className={`relative w-[70%] transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all`}
                >
                  <div className="text-center ">
                    <Dialog.Title className="py-5 font-bold text-center text-white bg-gray-400 text-xl">
                      Set Server
                    </Dialog.Title>
                  </div>
                  <div className="p-10 pt-5 bg-white">
                    <div className="mt-2">
                      {validation && (
                        <p className="text-red text-left w-[50%]">
                          {validation}
                        </p>
                      )}
                      <p className="mb-5 font-bold text-lg">
                        Server Settings
                      </p>
                      <div
                        className={`flex flex-col gap-5 align-middle`}
                      >
                        <p className="text-lg">Cabang</p>
                        <Dropdown
                          data={branchList}
                          placeholder={placeholderCabang}
                          onSelect={handleDropdownSelectedCabang}
                          landscape={isLandscape}
                        />
                      </div>
                      <div
                        className={`flex flex-col gap-5 mt-6 align-middle`}
                      >
                        <p className="text-lg">Server</p>
                        <Dropdown
                          placeholder={placeholderServer}
                          data={server}
                          onSelect={handleDropdownSelectedServer}
                          landscape={isLandscape}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-5 px-4 py-3 bg-gray-50">
                    <button
                      type="button"
                      className="w-[50%] rounded-md bg-blue px-3 py-2 text-subText font-bold text-white shadow-sm hover:bg-gray-500"
                      onClick={handleSimpan}
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      className="i w-[50%] rounded-md bg-red px-3 py-2 text-subText font-bold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-500"
                      onClick={() => {
                        setOpen(false);
                        refreshApp();
                      }}
                      ref={cancelButtonRef}
                    >
                      Batal
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}

export default SetServer;
