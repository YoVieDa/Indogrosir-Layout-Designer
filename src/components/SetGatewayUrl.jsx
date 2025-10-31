import React from "react";
import { useState, useRef, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, Transition } from "@headlessui/react";
import ModalAlert from "./ModalAlert";
import { IcSucc, IcErr } from "../assets";
import { setGlDtGatewayURL } from "../services/redux/registryReducer";
import Loader from "./Loader";
import { charToPass } from "../config";

const { ipcRenderer } = window.require("electron");

function SetGatewayUrl({ show, showSetServer, f8Key = false }) {
  const [open, setOpen] = useState(show);

  const [openModalAlert, setOpenModalAlert] = useState(false);
  const [msg, setMsg] = useState(null);
  const [msgTitle, setMsgTitle] = useState("");
  const [inputUser, setInputUser] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [currentInput, setCurrentInput] = useState(null);
  const dispatch = useDispatch();
  const cancelButtonRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const [isLandscape, setIsLandscape] = useState(false);
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );

  const handleFocus = (inputType) => {
    setCurrentInput(inputType);
    // keyboard.current.setInput(
    //   inputType === "user"
    //     ? inputUser
    //     : inputType === "password"
    //     ? inputPassword
    //     : inputUser
    // );
  };

  const onChangeInput = (event, inputType) => {
    const input = event.target.value;
    if (inputType === "user") {
      setInputUser(input);
    } else if (inputType === "password") {
      setInputPassword(input);
    }
    // keyboard.current.setInput(input);
  };

  const onChangeAll = (input) => {
    if (currentInput === "user") {
      setInputUser(input);
    } else if (currentInput === "password") {
      setInputPassword(input);
    }
  };

  const handleSimpan = async () => {
    if (!inputPassword) {
      setMsg("Maaf, IP Gateway Harus Diisi");
      return;
    }

    let urlGateway = "http://" + inputPassword.toString() + ":3025";

    dispatch(setGlDtGatewayURL(urlGateway.toLowerCase()));

    ipcRenderer.send(
      "create_registry_gwurl",
      charToPass(urlGateway.toLowerCase())
    );

    ipcRenderer.on("create_registry_gwurl", (event, arg) => {
      if (arg === "Gagal membuat registry gateway url") {
        setMsgTitle("Error");
        setMsg("Gagal Setting Server Url Gateway");
        setOpenModalAlert(true);
        setOpen(false);
        refreshApp();
      } else {
        setMsgTitle("Success");
        setMsg("Berhasil Setting Url Gateway");
        setOpenModalAlert(true);
        if (Object.keys(glRegistryDt).length === 0) {
          showSetServer();
        }
        setOpenModalAlert(false);
        setOpen(false);
        if (f8Key) {
          refreshApp();
        }
      }
    });

    return () => {
      ipcRenderer.removeAllListeners();
    };
  };

  const refreshApp = () => {
    ipcRenderer.send("refresh-window");
  };

  return (
    <>
      <Loader loading={loading} />

      <ModalAlert
        open={openModalAlert}
        onClose={() => {
          setOpenModalAlert(false);
        }}
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
                      Set URL Gateway
                    </Dialog.Title>
                  </div>
                  <div className="p-10 bg-white">
                    <div className="mt-2">
                      <div
                        className={`flex flex-col  ${
                          isLandscape ? "w-[50%]" : "w-[100%]"
                        }`}
                      >
                        <label className="block text-lg font-medium text-gray-700 mb-1">IP Gateway</label>
                        <input
                          id="password"
                          type="password"
                          value={inputPassword}
                          onFocus={() => handleFocus("password")}
                          placeholder={"Masukkan Password"}
                          onChange={(e) => onChangeInput(e, "password")}
                          className="drop-shadow-lg w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                        />
                        {msg && (
                          <p className="text-red text-left text-subText w-[100%]">
                            {msg}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-5 px-4 py-3 mt-5 bg-gray-50">
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
                        // handleBatalBtn(false);
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

export default SetGatewayUrl;
