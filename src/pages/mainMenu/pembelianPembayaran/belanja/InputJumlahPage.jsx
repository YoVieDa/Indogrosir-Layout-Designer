import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import StandardBtn from "../../../../components/StandardBtn";
import { IcErr, IcWarn, LogoIGR } from "../../../../assets";
import Modal from "../../../../components/Modal";
import Loader from "../../../../components/Loader";
import axios from "axios";
import { PAYMENT_KEY, URL_GATEWAY } from "../../../../config";
import ModalAlert from "../../../../components/ModalAlert";
import {
  removeAllItems,
  removeAllItemsHitungTotal,
  replaceArray,
} from "../../../../services/redux/dtAllInputtedItemReducer";
import { IoMdSearch } from "react-icons/io";
import { toggleMemberMerah } from "../../../../services/redux/memberReducer";
import { addDtTimeStart } from "../../../../services/redux/documentInfoReducer";

function InputJumlahPage() {
  const location = useLocation();
  const dispatch = useDispatch();
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const dtAllItem = useSelector(
    (state) => state.glDtAllInputtedItem.glDtAllInputtedItem
  );
  const userDt = useSelector((state) => state.glUser.dtUser);
  const {
    idx,
    idxSelectedItem,
    inputTambah,
    showInputJumlah2 = false,
    idxFromStateForSelectedSimilarPLU,
  } = location.state;
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [showInputJumlah, setShowInputJumlah] = useState(showInputJumlah2);
  const [msg, setMsg] = useState("");
  const [openModalAlert, setOpenModalAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [alertErrTitle, setAlertErrTitle] = useState(true);
  const [alertErrIc, setAlertErrIc] = useState(true);
  const [idxForPLU, setIdxForPLU] = useState(idx);
  const [idxSelectedSimilarPLU, setIdxSelectedSimilarPLU] = useState(
    idxFromStateForSelectedSimilarPLU
  );
  const [overWarn, setOverWarn] = useState(false);
  const [oldInput, setOldInput] = useState("0");
  const [openModalInfoProduk, setOpenModalInfoProduk] = useState(false);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);

  const navigate = useNavigate();

  useEffect(() => {
    const updateOrientation = () => {
      const { innerWidth: width, innerHeight: height } = window;

      setIsLandscape(width === 1920 && height === 1080);
    };

    updateOrientation();

    window.addEventListener("resize", updateOrientation);

    return () => {
      window.removeEventListener("resize", updateOrientation);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (input.trim() !== "") {
      setError("");
    }
  }, [input]);

  // Fungsi untuk menangani perubahan nilai input
  const handleChange = (event) => {
    setInput(event.target.value); // Memperbarui state input dengan nilai dari input event
  };

  const NumericKeyboard = () => {
    // Fungsi untuk menangani ketika tombol ditekan pada keyboard
    const handleKeyPress = (value) => {
      setInput(input + value); // Menambahkan nilai yang diketik ke state input
    };

    // Fungsi untuk menghapus satu karakter dari input
    const handleBackspace = () => {
      setInput(input.slice(0, -1)); // Menghapus karakter terakhir dari state input
    };

    // Array yang berisi nomor dari 1 sampai 9, serta 0
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "←"];
    return (
      <div className="grid grid-cols-3 gap-4">
        {numbers.map((number) => {
          if (number === "") {
            return <button></button>;
          } else {
            return (
              <button
                key={number}
                className={`text-black font-bold py-2 px-4 ${
                  isLandscape
                    ? "w-[90px] h-[90px] text-[26px]"
                    : "w-[120px] h-[120px] text-[32px]"
                }  rounded border bg-stroke-white  shadow-lg transform transition duration-200 active:scale-90 bg-gradient-to-t from-gray-200 to-white`}
                onClick={() => {
                  if (number === "←") {
                    handleBackspace();
                  } else {
                    handleKeyPress(number);
                  }
                }}
              >
                {number}
              </button>
            );
          }
        })}
      </div>
    );
  };

  const handleLanjutBtn = async () => {
    setLoading(true);

    let finalInputJumlah = 0;
    let sendToApi = false;
    if (inputTambah && input.trim() === "") {
      setError("Jumlah tidak boleh kosong");
      setInput("");
    } else if (
      inputTambah &&
      idxForPLU === "2" &&
      input.trim() !== "" &&
      Number(input) + dtAllItem[idxSelectedItem]["qty"] <
        dtAllItem[idxSelectedItem]["dtSimilarPLU"][idxSelectedSimilarPLU][
          "minJual"
        ]
    ) {
      setError(
        "Jumlah tidak lebih kecil dari " +
          dtAllItem[idxSelectedItem]["dtSimilarPLU"][idxSelectedSimilarPLU][
            "minJual"
          ] +
          " " +
          dtAllItem[idxSelectedItem]["dtSimilarPLU"][idxSelectedSimilarPLU][
            "unit"
          ]
      );
      setInput("");
    } else if (inputTambah && input.trim() !== "") {
      if (overWarn && input === "9999") {
        console.log(oldInput);
        finalInputJumlah = Number(oldInput);
        sendToApi = true;
        setOverWarn(false);
        setInput("");
      } else {
        console.log(
          "masuk",
          dtAllItem[idxSelectedItem]["dtSimilarPLU"][
            Number(idxSelectedSimilarPLU)
          ]
        );

        for (let i = 0; i < dtAllItem.length; i++) {
          if (
            dtAllItem[i]["plu"] ===
            dtAllItem[idxSelectedItem]["dtSimilarPLU"][
              Number(idxSelectedSimilarPLU)
            ]["plu"]
          ) {
            finalInputJumlah = Number(input) + dtAllItem[i]["qty"];
          }
        }

        console.log("sendToApi", Number(input), dtAllItem[idxSelectedItem]);
        let hrg =
          dtAllItem[idxSelectedItem]["dtSimilarPLU"][idxSelectedSimilarPLU][
            "hrgJual"
          ];

        // Hitung Quantity
        if (
          dtAllItem[idxSelectedItem]["dtSimilarPLU"][idxSelectedSimilarPLU][
            "unit"
          ].includes("KG") === true
        ) {
          if (finalInputJumlah > 99000) {
            setError(
              "JUMLAH QUANTITY ANDA MELEBIHI 99 KILO\nKETIK '9999' UNTUK MENERIMA TRANSAKSI ATAU GANTI JUMLAH QUANTITY"
            );
            setOverWarn(true);
            setOldInput(Number(input));
            setInput("");
          } else {
            if ((finalInputJumlah / 1000) * hrg > 2500000) {
              setError(
                "TRANSAKSI ANDA MELEBIHI Rp. 2.500.000,-\nKETIK '9999' UNTUK MENERIMA TRANSAKSI ATAU GANTI JUMLAH QUANTITY"
              );
              setOverWarn(true);
              setOldInput(Number(input));
              setInput("");
            } else {
              finalInputJumlah = Number(input);
              sendToApi = true;
              setOverWarn(false);
              setInput("");
            }
          }
        } else {
          if (finalInputJumlah > 200) {
            setError(
              "JUMLAH QUANTITY ANDA MELEBIHI 200 UNIT\nKETIK '9999' UNTUK MENERIMA TRANSAKSI ATAU GANTI JUMLAH QUANTITY"
            );
            setOverWarn(true);
            setOldInput(Number(input));
            setInput("");
          } else {
            if (finalInputJumlah * hrg > 2500000) {
              console.log(finalInputJumlah, hrg);
              setError(
                "TRANSAKSI ANDA MELEBIHI Rp. 2.500.000,-\nKETIK '9999' UNTUK MENERIMA TRANSAKSI ATAU GANTI JUMLAH QUANTITY"
              );
              setOverWarn(true);
              setOldInput(Number(input));
              setInput("");
              console.log("sendToApi", sendToApi);
            } else {
              finalInputJumlah = Number(input);
              sendToApi = true;
              setOverWarn(false);
              setInput("");
              console.log("sendToApi", sendToApi);
            }
          }
        }
      }
    } else if (!inputTambah && input.trim() === "") {
      setError("Jumlah tidak boleh kosong");
      setInput("");
    } else if (
      !inputTambah &&
      dtAllItem[idxSelectedItem]["qty"] - Number(input) < 0
    ) {
      setError("Pengurangan barang yang anda input melebihi kuantitas barang");
      setInput("");
    } else if (
      !inputTambah &&
      dtAllItem[idxSelectedItem]["qty"] - Number(input) >= 0
    ) {
      console.log(dtAllItem[idxSelectedItem]["qty"]);
      finalInputJumlah = -Number(input);
      sendToApi = true;
      setInput("");
    }

    console.log(
      dtAllItem[idxSelectedItem]["dtSimilarPLU"][Number(idxSelectedSimilarPLU)],
      finalInputJumlah,
      dtAllItem
    );

    if (sendToApi) {
      await axios
        .post(
          `${URL_GATEWAY}/servicePayment/inputJumlah`,
          {
            plu: dtAllItem[idxSelectedItem]["plu"],
            kodeIGR: glRegistryDt["glRegistryDt"]["registryOraIGR"],
            dbStatus: glRegistryDt["glRegistryDt"]["server"],
            inputtedQty: finalInputJumlah,
            dtMember: {
              memberID: userDt["memberID"],
              memberFlag: userDt["memberFlag"],
              cus_idsegment: userDt["cus_idsegment"],
              cus_jenismember: userDt["cus_jenismember"],
            },
            dtPluSelected:
              dtAllItem[idxSelectedItem]["dtSimilarPLU"][
                Number(idxSelectedSimilarPLU)
              ],
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
            timeout: 60000,
          }
        )
        .then((response) => {
          console.log(response["data"]);
          dispatch(replaceArray(response["data"]["dtInputtedItem"]));
          if (response["data"]["promoMStatusBerlakuHrgNormalMsg"] !== "") {
            setOpenModalAlert(true);
            setAlertErrTitle(false);
            setAlertErrIc(false);
            setMsg(response["data"]["promoMStatusBerlakuHrgNormalMsg"]);
            setLoading(false);
          } else {
            navigate("/kasirSelfService");
            setLoading(false);
          }
        })
        .catch(function (error) {
          console.log(error);

          if (error?.code === "ECONNABORTED") {
            setMsg(
              "Maaf, sistem kami sedang lambat saat ini. Silahkan coba lagi"
            );
            setLoading(false);
            setOpenModalAlert(true);
          } else if (error?.["response"]?.["data"]?.["status"]) {
            const statusCode = error?.response?.status;
            if (statusCode === 500) {
              setMsg(error["response"]["data"]["status"]);

              setLoading(false);
              setOpenModalAlert(true);
            } else {
              setMsg(error["response"]["data"]["status"]);

              setLoading(false);
              setOpenModalAlert(true);
            }
          } else {
            setMsg(error?.message);
            setLoading(false);
            setOpenModalAlert(true);
          }
        });
    } else {
      setLoading(false);
    }
  };

  const handleBtnSelectedIDX = async (idxPLU, idxForSimilarPLU) => {
    setShowInputJumlah(true);
    setIdxForPLU(idxPLU);
    setIdxSelectedSimilarPLU(idxForSimilarPLU);
  };

  const formattedNumber = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(number)
      .replace(/\./g, ",");
  };

  return (
    <>
      <Loader loading={loading} />
      <ModalAlert
        open={openModalAlert}
        onClose={() => {
          setOpenModalAlert(false);
          navigate("/kasirSelfService");
        }}
      >
        <div className="text-center">
          <img
            src={alertErrIc ? IcErr : IcWarn}
            alt="Warn"
            className="mx-auto"
          />
          <div className="mx-auto my-4">
            <h3 className="font-black text-gray-800 text-text">
              {alertErrTitle ? "Error" : "Warning"}
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
        open={openModalInfoProduk}
        customWidth={80}
        onClose={() => setOpenModalInfoProduk(false)}
        landscape={isLandscape}
      >
        <div
          className={`${memberMerah ? "bg-red" : "bg-blue"} rounded-t-xl p-5`}
        >
          <p className="font-semibold text-center text-white text-subTitle">
            {"Informasi Produk"}
          </p>
        </div>
        <div className="w-[100%] flex flex-col bg-gray-100 mb-auto p-16 rounded-xl">
          <div className="flex flex-row gap-5 py-2 align-middle">
            <p className="font-semibold text-text">Nama Produk: </p>
            <p className="self-start text-text">
              {dtAllItem[idxSelectedItem]?.["namaBarang"] === undefined
                ? "-"
                : dtAllItem[idxSelectedItem]?.["namaBarang"]}
            </p>
          </div>
          <div className="flex flex-row gap-5 py-2 align-middle border-t border-black border-solid">
            <p className="font-semibold text-text ">Harga Normal:</p>
            <p className="self-start text-text">
              {dtAllItem[idxSelectedItem]?.["dtSimilarPLU"]?.[
                idxSelectedSimilarPLU
              ]?.["hrgJual"] === undefined
                ? "-"
                : formattedNumber(
                    dtAllItem[idxSelectedItem]["dtSimilarPLU"][
                      idxSelectedSimilarPLU
                    ]["hrgJual"]
                  )}
            </p>
          </div>
          <div className="flex flex-row gap-5 py-2 align-middle border-t border-black border-solid">
            <p className="font-semibold text-text ">Harga Promosi:</p>
            <p className="self-start text-text">
              {dtAllItem[idxSelectedItem]?.["promoMD"]?.["hargaPromosi"] ===
                undefined ||
              dtAllItem[idxSelectedItem]?.["promoMD"]?.["hargaPromosi"] === ""
                ? "-"
                : dtAllItem[idxSelectedItem]["promoMD"]["hargaPromosi"]}
            </p>
          </div>
        </div>
      </Modal>
      <div
        style={{
          height: `${isLandscape ? "1080px" : "1920px"}`,
          width: `${isLandscape ? "1920px" : "1080px"}`,
        }}
        className={`flex flex-col p-10 ${memberMerah ? "bg-red" : "bg-blue"}`}
      >
        <img
          src={LogoIGR}
          alt="Logo IGR"
          className={`drop-shadow-lg rounded ${
            isLandscape ? "w-[450px] h-[186px]" : "w-[544px] h-[186px]"
          } self-center mb-5 ${isLandscape ? "" : "mt-28"}`}
        />

        {showInputJumlah ? (
          <>
            <p
              className={`font-bold text-center text-white text-subTitle ${
                isLandscape ? "mb-5" : "mb-5"
              }`}
            >
              {inputTambah
                ? "Silakan masukkan jumlah barang yang ingin ditambahkan"
                : "Silahkan masukkan jumlah barang yang ingin dikurangi"}
            </p>
            <div className="flex flex-col h-[100%] items-center justify-center gap-5">
              {isLandscape ? null : (
                <>
                  <div className="w-[100%] flex flex-col bg-gray-100 rounded-[20px] mb-auto p-10">
                    <div className="flex flex-row gap-5 py-2 align-middle">
                      <p className="font-semibold text-text">Nama Produk: </p>
                      <p className="self-start text-text">
                        {dtAllItem[idxSelectedItem]?.["namaBarang"]}
                      </p>
                    </div>
                    <div className="flex flex-row gap-5 py-2 align-middle border-t border-black border-solid">
                      <p className="font-semibold text-text ">Harga Normal:</p>
                      <p className="self-start text-text">
                        {dtAllItem[idxSelectedItem]?.["dtSimilarPLU"]?.[
                          idxSelectedSimilarPLU
                        ]?.["hrgJual"] === undefined
                          ? "-"
                          : formattedNumber(
                              dtAllItem[idxSelectedItem]["dtSimilarPLU"][
                                idxSelectedSimilarPLU
                              ]["hrgJual"]
                            )}
                      </p>
                    </div>
                    <div className="flex flex-row gap-5 py-2 align-middle border-t border-black border-solid">
                      <p className="font-semibold text-text ">Harga Promosi:</p>
                      <p className="self-start text-text">
                        {dtAllItem[idxSelectedItem]?.["promoMD"]?.[
                          "hargaPromosi"
                        ] === undefined ||
                        dtAllItem[idxSelectedItem]?.["promoMD"]?.[
                          "hargaPromosi"
                        ] === ""
                          ? "-"
                          : dtAllItem[idxSelectedItem]["promoMD"][
                              "hargaPromosi"
                            ]}
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex flex-row justify-center w-full gap-5">
                <input
                  value={input}
                  type="number"
                  placeholder="Masukkan Jumlah Barang"
                  onChange={handleChange}
                  className={`border bg-stroke-white p-5 rounded-xl ${
                    isLandscape ? "w-[40%]" : "w-[70%]"
                  }  self-center text-subText`}
                />
                {isLandscape ? (
                  <button
                    onClick={() => setOpenModalInfoProduk(true)}
                    className={`flex flex-row w-[17%] rounded-xl bg-stroke-white p-5 text-[26px] items-center gap-5 font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-green4 to-green5`}
                  >
                    <IoMdSearch className="w-10 h-10" />
                    Cek Info Produk
                  </button>
                ) : null}
              </div>

              {error && (
                <p
                  className={`text-yellow font-bold text-[24px] text-left ${
                    isLandscape ? "w-[58%]" : "w-[70%]"
                  }`}
                >
                  {error}
                </p>
              )}

              <div className={`${isLandscape ? "" : "mt-10"}`}>
                <NumericKeyboard />
              </div>
            </div>

            <div
              className={`flex flex-row self-center items-end gap-5  ${
                isLandscape ? "w-[50%]" : "w-[100%]"
              } h-[50%]`}
            >
              <StandardBtn
                title="Kembali"
                path="/kasirSelfService"
                width="50%"
              />

              <button
                onClick={handleLanjutBtn}
                className={`w-[50%] h-[96px] rounded-xl bg-stroke-white bg-blue p-3 text-subText font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3`}
              >
                Lanjut
              </button>
            </div>
          </>
        ) : (
          <>
            <p
              className={`font-bold text-center text-white text-subTitle ${
                isLandscape ? "mb-14" : null
              }`}
            >
              Silahkan pilih jenis pembelian yang diinginkan
            </p>

            <div
              className={`${
                isLandscape ? "w-[50%]" : "w-[100%] my-10"
              } items-center  flex flex-col bg-gray-100 rounded-[20px] mb-5 p-5 mx-auto`}
            >
              <div className="flex flex-row gap-5 py-2 align-middle">
                <p className="font-semibold text-text">Nama Produk: </p>
                <p className="self-start text-text">
                  {dtAllItem[idxSelectedItem]?.["namaBarang"]}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-5 my-auto h-[100%] overflow-y-auto">
              {dtAllItem[idxSelectedItem]["dtSimilarPLU"].map(
                (item, itemIndex) => (
                  <button
                    onClick={() =>
                      handleBtnSelectedIDX(
                        item.plu.slice(-1),
                        itemIndex.toString()
                      )
                    }
                    className={`w-[50%] h-[96px] rounded-xl bg-stroke-white bg-blue p-3 text-subText font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-green4 to-green5`}
                  >
                    {item.minJual > 1
                      ? "Min " +
                        item.minJual +
                        " " +
                        item.unit +
                        " = " +
                        formattedNumber(item.hrgJual) +
                        "/" +
                        item.unit
                      : formattedNumber(item.hrgJual) + "/" + item.unit}
                  </button>
                )
              )}
            </div>
            <div
              className={`flex flex-row self-center items-end gap-5  ${
                isLandscape ? "w-[50%]" : "w-[100%]"
              } h-[50%]`}
            >
              <StandardBtn
                title="Kembali"
                path="/kasirSelfService"
                width="100%"
              />

              {/* <button
                onClick={handleLanjutBtn}
                className={`w-[50%] h-[96px] rounded-xl bg-stroke-white bg-blue p-3 text-subText font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3`}
              >
                Lanjut
              </button> */}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default InputJumlahPage;
