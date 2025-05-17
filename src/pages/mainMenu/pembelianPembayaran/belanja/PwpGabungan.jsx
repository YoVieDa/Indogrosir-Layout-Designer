import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { LogoIGR, IcWarn } from "../../../../assets";
import StandardBtn from "../../../../components/StandardBtn";
import axios from "axios";

import { FaMinus, FaPlus } from "react-icons/fa";

import { PAYMENT_KEY, URL_GATEWAY } from "../../../../config";
import Loader from "../../../../components/Loader";
import ModalAlert from "../../../../components/ModalAlert";
import { addItemHitungTotal } from "../../../../services/redux/dtAllInputtedItemReducer";
import { addItemDtPwp } from "../../../../services/redux/dtForPwpReducer";

function PwpGabungan() {
  const location = useLocation();
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const glDtPwp = useSelector((state) => state.glDtForPwp.glDtForPwp);
  const glPembulatan = useSelector((state) => state.glDtForPwp.glPembulatan);
  const dtAllItem = useSelector(
    (state) => state.glDtAllInputtedItem.glDtAllInputtedItem
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );

  const [isLandscape, setIsLandscape] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [openModalAlert, setOpenModalAlert] = useState(false);

  const [maxKelipatan, setMaxKelipatan] = useState(0);

  const glUserModul = useSelector((state) => state.glUser.userModul);
  const glStationModul = useSelector((state) => state.glUser.stationModul);
  const [dtTablePLUPWPUpdate, setDtTablePLUPWPUpdate] = useState([]);
  let backupDtTablePluPwpUpdate = useRef([]);

  const countTotal = () => {
    let totalTemp = 0;

    for (let i = 0; i < dtAllItem.length; i++) {
      totalTemp = totalTemp + dtAllItem[i]["jumlahRp"];
    }
  };

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

  useEffect(() => {
    // Isi dtTablePLUPWPUpdate
    for (let i = 0; i < glDtPwp["dtTablePLUPWP"].length; i++) {
      dtTablePLUPWPUpdate.push({
        PRDCD: glDtPwp["dtTablePLUPWP"][i]["PRDCD"],
        DESKRIPSI: glDtPwp["dtTablePLUPWP"][i]["DESKRIPSI"],
        CASHBACK: glDtPwp["dtTablePLUPWP"][i]["CASHBACK"],
        KELIPATAN: glDtPwp["dtTablePLUPWP"][i]["KELIPATAN"],
        KELIPATAN_FROM_INPUT_CUS: 0,
        TOTAL_CASHBACK: 0,
        MAX_KELIPATAN: glDtPwp["dtTablePLUPWP"][i]["MAX_KELIPATAN"],
      });
    }

    console.log(dtTablePLUPWPUpdate);
    setMaxKelipatan(dtTablePLUPWPUpdate[0]["MAX_KELIPATAN"]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glDtPwp]);

  const handleKurangKelipatanBtn = (idx) => {
    const dtUpdate = [...dtTablePLUPWPUpdate];

    // Membuat salinan dari objek yang ingin diubah
    const itemToUpdate = { ...dtUpdate[idx] };

    if (itemToUpdate["KELIPATAN_FROM_INPUT_CUS"] - 1 >= 0) {
      itemToUpdate["KELIPATAN_FROM_INPUT_CUS"] =
        itemToUpdate["KELIPATAN_FROM_INPUT_CUS"] - 1;

      itemToUpdate["TOTAL_CASHBACK"] =
        itemToUpdate["CASHBACK"] * itemToUpdate["KELIPATAN_FROM_INPUT_CUS"];

      // Menggantikan objek yang diperbarui dalam salinan array
      dtUpdate[idx] = itemToUpdate;

      setDtTablePLUPWPUpdate(dtUpdate);
    } else {
      itemToUpdate["KELIPATAN_FROM_INPUT_CUS"] = 0;

      itemToUpdate["TOTAL_CASHBACK"] =
        itemToUpdate["CASHBACK"] * itemToUpdate["KELIPATAN_FROM_INPUT_CUS"];

      // Menggantikan objek yang diperbarui dalam salinan array
      dtUpdate[idx] = itemToUpdate;

      setDtTablePLUPWPUpdate(dtUpdate);
    }
  };

  const handleTambahKelipatanBtn = (idx) => {
    const dtUpdate = [...dtTablePLUPWPUpdate];

    // Membuat salinan dari objek yang ingin diubah
    const itemToUpdate = { ...dtUpdate[idx] };

    itemToUpdate["KELIPATAN_FROM_INPUT_CUS"] =
      itemToUpdate["KELIPATAN_FROM_INPUT_CUS"] + 1;

    if (itemToUpdate["KELIPATAN_FROM_INPUT_CUS"] > itemToUpdate["KELIPATAN"]) {
      itemToUpdate["KELIPATAN_FROM_INPUT_CUS"] = 0;
    }

    itemToUpdate["TOTAL_CASHBACK"] =
      itemToUpdate["CASHBACK"] * itemToUpdate["KELIPATAN_FROM_INPUT_CUS"];

    // Menggantikan objek yang diperbarui dalam salinan array
    dtUpdate[idx] = itemToUpdate;

    setDtTablePLUPWPUpdate(dtUpdate);
  };

  const handleKonfirmasiBtn = async () => {
    setLoading(true);
    let sendToApi = false;
    let totalKelipatan = 0;
    let cashbackFromPWP = 0;
    for (let i = 0; i < dtTablePLUPWPUpdate.length; i++) {
      totalKelipatan += dtTablePLUPWPUpdate[i]["KELIPATAN_FROM_INPUT_CUS"];
    }
    console.log("maxKelipatan", totalKelipatan, maxKelipatan);
    if (totalKelipatan > maxKelipatan) {
      setOpenModalAlert(true);
      setMsg("Jumlah barang yang dapat dipilih hanya " + maxKelipatan);
      sendToApi = false;
    } else if (totalKelipatan <= 0) {
      setOpenModalAlert(true);
      setMsg("Total Kelipatan tidak boleh 0");
      sendToApi = false;
    } else {
      for (let i = 0; i < dtTablePLUPWPUpdate.length; i++) {
        cashbackFromPWP += dtTablePLUPWPUpdate[i]["TOTAL_CASHBACK"];
      }

      if (
        glDtPwp["maxCashback"] > 0 &&
        cashbackFromPWP > glDtPwp["maxCashback"]
      ) {
        setOpenModalAlert(true);
        setMsg("Max Total Cashback " + formattedNumber(glDtPwp["maxCashback"]));
        sendToApi = false;
      } else {
        sendToApi = true;
        backupDtTablePluPwpUpdate.current = dtTablePLUPWPUpdate;
        setDtTablePLUPWPUpdate([]);
      }
    }

    if (sendToApi) {
      await axios
        .post(
          `${URL_GATEWAY}/servicePayment/hitungTotal`,
          {
            retTimeEnd: glDtPwp["retTimeEnd"],
            dtTablePLUPWP: glDtPwp["dtTablePLUPWP"],
            maxCashback: glDtPwp["maxCashback"],
            kodeIGR: glDtPwp["kodeIGR"],
            dbStatus: glDtPwp["dbStatus"],
            dtDtlBrng: glDtPwp["dtDtlBrng"],
            dtMember: glDtPwp["dtMember"],
            noTransaksi: glDtPwp["noTransaksi"],
            total: glDtPwp["total"],
            timeStart: glDtPwp["timeStart"],
            flagPwp: glDtPwp["flagPwp"],
            currentIdx: glDtPwp["currentIdx"],
            dtDtlBrngUpdate: glDtPwp["dtDtlBrngUpdate"],
            dtCashbackDTL: glDtPwp["dtCashbackDTL"],
            totDisc: glDtPwp["totDisc"],
            totalNilai: glDtPwp["totalNilai"],
            flag_sukses: glDtPwp["flag_sukses"],
            dtCashback: glDtPwp["dtCashback"],
            dtCashbackDT: glDtPwp["dtCashbackDT"],
            dtGift: glDtPwp["dtGift"],
            potBank: glDtPwp["potBank"],
            flagFasilitasBank: glDtPwp["flagFasilitasBank"],
            flagHapusPromosi: glDtPwp["flagHapusPromosi"],
            dtPromosiRaw: glDtPwp["dtPromosiRaw"],
            dtPromosiDtlRaw: glDtPwp["dtPromosiDtlRaw"],
            cashbackFromPWP: cashbackFromPWP,
            flagLanjutinPWP: true,
            dtTablePLUPWPUpdate: dtTablePLUPWPUpdate,
            userModul: glUserModul,
            stationModul: glStationModul,
            selectedPayment: "",
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
          if (response["data"]["flagPwp"]) {
            dispatch(addItemDtPwp(response["data"]));

            navigate("/pwpGabungan");
          } else {
            dispatch(addItemHitungTotal(response["data"]));
            console.log("glPembulatan:", glPembulatan);
            navigate("/kasirPembayaran", {
              state: {
                total: response["data"]["totalNilai"],
                pembulatan: glPembulatan,
                totCashback: response["data"]["totCashback"],
                totDisc: response["data"]["totDisc"],
                totPembayaran: response["data"]["jumlahPenjualan"],
              },
            });
          }

          // }
        })
        .catch(function (error) {
          console.log(error);
          setDtTablePLUPWPUpdate(backupDtTablePluPwpUpdate.current);
          if (error?.code === "ECONNABORTED") {
            setMsg(
              "Maaf, sistem kami sedang lambat saat ini. Silahkan coba lagi"
            );
            setLoading(false);
            setOpenModalAlert(true);
          } else if (error?.["response"]?.["data"]?.["status"]) {
            setMsg(error["response"]["data"]["status"]);

            setLoading(false);
            setOpenModalAlert(true);
          } else {
            setMsg(error?.message);
            setLoading(false);
            setOpenModalAlert(true);
          }
        });
    } else {
      setLoading(false);
    }
    setLoading(false);
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
        }}
      >
        <div className="text-center">
          <img src={IcWarn} alt="Warn" className="mx-auto" />
          <div className="mx-auto my-4">
            <h3 className="font-black text-gray-800 text-text">Warning</h3>

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
        style={{
          height: `${isLandscape ? "1080px" : "1920px"}`,
          width: `${isLandscape ? "1920px" : "1080px"}`,
        }}
        className={`flex flex-col p-10 ${memberMerah ? "bg-red" : "bg-blue"}`}
      >
        {isLandscape ? (
          <div className="flex flex-row items-center gap-5 mb-auto">
            <img
              src={LogoIGR}
              alt="Logo IGR"
              className="drop-shadow-lg rounded mb-10 w-[544px] h-[186px]"
            />
            <p className="font-bold text-white text-subTitle ">
              Silahkan memilih barang yang ingin mendapat potongan maksimal{" "}
              {maxKelipatan} Barang
            </p>
          </div>
        ) : (
          <>
            <img
              src={LogoIGR}
              alt="Logo IGR"
              className="drop-shadow-lg rounded w-[544px] h-[186px] self-center"
            />

            <p className="mt-10 mb-10 font-bold text-center text-white text-text">
              Silahkan memilih barang yang ingin mendapat potongan maksimal{" "}
              {maxKelipatan} barang
            </p>
          </>
        )}

        <div className="w-[100%] h-[100%] flex flex-col bg-gray-100 rounded-[20px] mb-10 p-10">
          <>
            <div
              className={`${
                isLandscape
                  ? "overflow-x-auto max-w-[100%] max-h-[450px]"
                  : "overflow-y-auto max-h-[1150px]"
              }`}
            >
              {Array.isArray(dtTablePLUPWPUpdate) &&
                dtTablePLUPWPUpdate.map((item, itemIndex) => (
                  <div
                    key={item.PRDCD}
                    className=" w-[100%] shadow-lg p-5 rounded-xl bg-white mb-10 "
                  >
                    <div className="flex flex-row justify-between">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-5">
                          <p className="font-bold text-subText">{item.PRDCD}</p>
                          <p className="max-w-md font-bold truncate text-subText">
                            {item.DESKRIPSI}
                          </p>
                        </div>
                      </div>
                      {/* <div className="flex flex-col gap-2">
                        <p className="font-bold text-subText">
                          Max: {item.MAX_KELIPATAN}
                        </p>
                      </div> */}
                    </div>
                    <div className="flex flex-row justify-between p-3 mt-5 bg-yellow rounded-xl">
                      <p className="font-bold text-[30px]">
                        Cashback: {formattedNumber(item.CASHBACK)}
                      </p>
                      <p className="font-bold text-[30px]">
                        Total Cashback: {formattedNumber(item.TOTAL_CASHBACK)}
                      </p>
                    </div>
                    <div className="flex flex-row justify-center gap-5 mt-5">
                      <button
                        onClick={() => handleKurangKelipatanBtn(itemIndex)}
                        className={`flex justify-center items-center w-24 rounded-xl bg-stroke p-5 text-subText gap-5 font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-gray-200 to-white`}
                      >
                        <FaMinus className="w-10 text-black" />
                      </button>

                      <div className="flex items-center justify-center w-32 p-3 border bg-stroke rounded-xl">
                        <p className="max-w-full overflow-x-auto font-bold text-center text-text whitespace-nowrap">
                          {item.KELIPATAN_FROM_INPUT_CUS}
                        </p>
                      </div>

                      <button
                        onClick={() => handleTambahKelipatanBtn(itemIndex)}
                        className={`flex justify-center items-center w-24 rounded-xl bg-stroke p-5 text-subText gap-5 font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-gray-200 to-white`}
                      >
                        <FaPlus className="w-10 text-black" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </>
        </div>

        <div
          className={`flex flex-row self-center items-center gap-5 ${
            isLandscape ? "w-[50%]" : "w-[100%]"
          }`}
        >
          <StandardBtn
            title="Kembali"
            path="/kasirSelfService"
            width="50%"
            pembayaran={true}
          />

          <button
            onClick={() => handleKonfirmasiBtn()}
            className={`w-[50%] h-[96px] rounded-xl bg-stroke-white bg-blue p-3 text-subText font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3`}
          >
            Konfirmasi
          </button>
        </div>
      </div>
    </>
  );
}

export default PwpGabungan;
