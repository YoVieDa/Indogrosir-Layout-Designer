import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ModalAlert from "./ModalAlert";
import { IcErr, IcInfoBlack, IcRefresh, IcWarn } from "../assets";
import Loader from "./Loader";
import { PAYMENT_KEY, URL_GATEWAY } from "../config.js";
import { replaceArray } from "../services/redux/dtAllInputtedItemReducer";
const { ipcRenderer } = window.require("electron");

function HiddenInputForPOS() {
  const [inputValue, setInputValue] = useState("");
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const [openModalAlert, setOpenModalAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [alertErrTitle, setAlertErrTitle] = useState(true);
  const [alertErrIc, setAlertErrIc] = useState(true);
  const [alertInfo, setAlertInfo] = useState(false);
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const userDt = useSelector((state) => state.glUser.dtUser);
  const dtAllItem = useSelector(
    (state) => state.glDtAllInputtedItem.glDtAllInputtedItem
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    // Mengupdate nilai state saat input berubah
    setInputValue(e.target.value);
  };

  const handleEnterPress = async (e) => {
    if (e.key === "Enter") {
      setLoading(true);
      await axios
        .post(
          `${URL_GATEWAY}/servicePayment/inputItem`,
          {
            plu: inputValue,
            kodeIGR: glRegistryDt["glRegistryDt"]["registryOraIGR"],
            dbStatus: glRegistryDt["glRegistryDt"]["server"],
            dtMember: {
              memberID: userDt["memberID"],
              memberFlag: userDt["memberFlag"],
              cus_idsegment: userDt["cus_idsegment"],
              cus_jenismember: userDt["cus_jenismember"],
            },
            dtInputtedItem: dtAllItem,
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
          setInputValue("");
          dispatch(replaceArray(response["data"]["dtInputtedItemUpdate"]));
          console.log(
            "hiddeninputpos",
            response["data"]["dtInputtedItemUpdate"]
          );

          console.log(
            response["data"]["dtInputtedItemUpdate"][
              response["data"]["dtInputtedItemUpdate"].length - 1
            ]["qty"]
          );
          if (
            response["data"]["dtInputtedItemUpdate"][
              response["data"]["dtInputtedItemUpdate"].length - 1
            ]["dtSimilarPLU"][0]["unit"] === "KG" &&
            response["data"]["dtInputtedItemUpdate"][
              response["data"]["dtInputtedItemUpdate"].length - 1
            ]["qty"] > 0
          ) {
            const handleKGItem = async () => {
              await axios
                .post(
                  `${URL_GATEWAY}/servicePayment/inputJumlah`,
                  {
                    plu: response["data"]["dtInputtedItemUpdate"][
                      response["data"]["dtInputtedItemUpdate"].length - 1
                    ]["plu"],
                    kodeIGR: glRegistryDt["glRegistryDt"]["registryOraIGR"],
                    dbStatus: glRegistryDt["glRegistryDt"]["server"],
                    inputtedQty: 0,
                    dtMember: {
                      memberID: userDt["memberID"],
                      memberFlag: userDt["memberFlag"],
                      cus_idsegment: userDt["cus_idsegment"],
                      cus_jenismember: userDt["cus_jenismember"],
                    },
                    dtPluSelected: response["data"]["dtInputtedItemUpdate"][
                      response["data"]["dtInputtedItemUpdate"].length - 1
                    ]["dtSimilarPLU"].filter(
                      (item) =>
                        item.plu ===
                        response["data"]["dtInputtedItemUpdate"][
                          response["data"]["dtInputtedItemUpdate"].length - 1
                        ]["plu"]
                    )[0],
                    dtInputtedItem: response["data"]["dtInputtedItemUpdate"],
                  },
                  {
                    headers: {
                      server: glRegistryDt["glRegistryDt"]["server"],
                      registryOraIGR:
                        glRegistryDt["glRegistryDt"]["registryOraIGR"],
                      registryIp: glRegistryDt["glRegistryDt"]["registryOraIP"],
                      registryPort:
                        glRegistryDt["glRegistryDt"]["registryPort"],
                      registryServiceName:
                        glRegistryDt["glRegistryDt"]["registryServiceName"],
                      registryUser:
                        glRegistryDt["glRegistryDt"]["registryUser"],
                      registryPwd: glRegistryDt["glRegistryDt"]["registryPwd"],
                      "Cache-Control": "no-cache",
                      "x-api-key": PAYMENT_KEY,
                    },
                  }
                )
                .then((response) => {
                  console.log(response["data"]);
                  dispatch(replaceArray(response["data"]["dtInputtedItem"]));
                  if (
                    response["data"]["promoMStatusBerlakuHrgNormalMsg"] !== ""
                  ) {
                    setAlertErrTitle(false);
                    setAlertErrIc(false);
                    setOpenModalAlert(true);
                    setMsg(response["data"]["promoMStatusBerlakuHrgNormalMsg"]);
                    setLoading(false);
                  } else {
                    navigate("/kasirSelfService");
                    setLoading(false);
                  }
                })
                .catch(function (error) {
                  console.log(error);

                  setMsg(error["response"]["data"]["status"]);
                  setLoading(false);
                  setOpenModalAlert(true);
                });
            };

            await handleKGItem();
          } else {
            navigate("/inputJumlah", {
              state: {
                idx: response["data"]["dtInputtedItemUpdate"][
                  response["data"]["dtInputtedItemUpdate"].length - 1
                ]["plu"].slice(-1),
                idxSelectedItem:
                  response["data"]["dtInputtedItemUpdate"].length - 1,
                inputTambah: true,
              },
            });

            setLoading(false);
          }
        })
        .catch(function (error) {
          console.log(error);
          if (
            error["response"]["data"]["status"].includes("Gagal Ambil Data")
          ) {
            setMsg(error["response"]["data"]["status"]);

            setInputValue("");
            setLoading(false);
            setOpenModalAlert(true);
          } else {
            setMsg(error["response"]["data"]["status"]);

            setInputValue("");
            setLoading(false);
            setOpenModalAlert(true);
            setAlertInfo(true);
          }
        });
    }
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
          setAlertErrTitle(true);
          setAlertErrIc(true);
          setAlertInfo(false);
          navigate("/kasirSelfService");
        }}
      >
        <div className="text-center">
          <img
            src={
              alertErrIc && !alertInfo
                ? IcErr
                : alertErrTitle && alertInfo
                ? IcInfoBlack
                : IcWarn
            }
            alt="Warn"
            className="mx-auto"
          />
          <div className="mx-auto my-4">
            <h3 className="font-black text-gray-800 text-text">
              {" "}
              {alertErrTitle && !alertInfo
                ? "Error"
                : alertErrTitle && alertInfo
                ? "Info"
                : "Warning"}
            </h3>
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

export default HiddenInputForPOS;
