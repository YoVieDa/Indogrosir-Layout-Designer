import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { IcErr, LogoIGR } from "../../../../assets";
import StandardBtn from "../../../../components/StandardBtn";
import axios from "axios";
import ItemPerPLUCard from "../../../../components/ItemPerPLUCard";
import {
  addItem,
  removeAllItems,
  removeAllItemsHitungTotal,
  removeItem,
  replaceArray,
} from "../../../../services/redux/dtAllInputtedItemReducer";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaMinus, FaPlus } from "react-icons/fa";
import { PiStarFourBold } from "react-icons/pi";
import Modal from "../../../../components/Modal";
import HiddenInputForPOS from "../../../../components/HiddenInputForPOS";
import DataEmpty from "../../../../components/DataEmpty";
import { PAYMENT_KEY, URL_GATEWAY } from "../../../../config";
import Loader from "../../../../components/Loader";
import ModalAlert from "../../../../components/ModalAlert";
import {
  addDtInfo,
  addDtTimeStart,
} from "../../../../services/redux/documentInfoReducer";
import { addItemHitungTotal } from "../../../../services/redux/dtAllInputtedItemReducer";
import { toggleMemberMerah } from "../../../../services/redux/memberReducer";
import {
  addItemDtPwp,
  setGlPembulatan,
} from "../../../../services/redux/dtForPwpReducer";

function KasirSelfService() {
  const dispatch = useDispatch();
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const navigate = useNavigate();
  const dtAllItem = useSelector(
    (state) => state.glDtAllInputtedItem.glDtAllInputtedItem
  );
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const userDt = useSelector((state) => state.glUser.dtUser);
  const [isLandscape, setIsLandscape] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [openModalAlert, setOpenModalAlert] = useState(false);
  const [openModalCheckpromo, setOpenModalCheckpromo] = useState(false);
  const [total, setTotal] = useState(0);
  const [pembulatan, setPembulatan] = useState(0);
  const [promoMdIdx, setPromoMdIdx] = useState(0);
  const glDtDocInfo = useSelector((state) => state.glDocInfo.info);
  const glDtTimeStart = useSelector((state) => state.glDocInfo.timeStart);
  const glUserModul = useSelector((state) => state.glUser.userModul);
  const glStationModul = useSelector((state) => state.glUser.stationModul);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);

  const countTotal = () => {
    let totalTemp = 0;
    let pembulatanTemp;

    for (let i = 0; i < dtAllItem.length; i++) {
      totalTemp = totalTemp + dtAllItem[i]["jumlahRp"];
    }

    totalTemp = Math.round(totalTemp);

    if (totalTemp % 10 > 5) {
      pembulatanTemp = 10 - (totalTemp % 10);
      totalTemp = totalTemp + pembulatanTemp;
    } else if (totalTemp % 10 < 5) {
      pembulatanTemp = 0 - (totalTemp % 10);
      totalTemp = totalTemp + pembulatanTemp;
    } else {
      pembulatanTemp = 0;
    }

    setTotal(totalTemp);
    setPembulatan(pembulatanTemp);
    console.log("pembulatan", pembulatanTemp);
  };

  useEffect(() => {
    const updateOrientation = () => {
      const { innerWidth: width, innerHeight: height } = window;

      setIsLandscape(width === 1920 && height === 1080);
    };

    const getTimeStart = async () => {
      setLoading(true);
      await axios
        .post(
          `${URL_GATEWAY}/servicePayment/getCurrentTime`,
          {
            userModul: glUserModul,
            stationModul: glStationModul,
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
        .then((response) => {
          console.log(response);
          dispatch(addDtTimeStart(response["data"]["timeStart"]));
          dispatch(addDtInfo(response["data"]["noTrans"]));
          setLoading(false);
        })
        .catch(function (error) {
          console.log(error);

          setLoading(false);
          setOpenModalAlert(true);
        });
    };

    // Hapus item yg punya qty 0
    for (let i = 0; i < dtAllItem.length; i++) {
      if (dtAllItem[i]["qty"] === 0) {
        dispatch(removeItem({ plu: dtAllItem[i].plu }));
      }
    }

    updateOrientation();

    window.addEventListener("resize", updateOrientation);

    countTotal();
    if (glDtTimeStart === "") {
      getTimeStart();
    }
    dispatch(removeAllItemsHitungTotal());

    return () => {
      window.removeEventListener("resize", updateOrientation);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    countTotal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dtAllItem]);

  // useEffect(() => {
  //   countTotal();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [dtAllItem]);

  const inputJumlahFunc = (idx) => {
    let idxFromStateForSelectedSimilarPLU;

    for (let i = 0; i < dtAllItem[idx]["dtSimilarPLU"].length; i++) {
      if (dtAllItem[idx]["dtSimilarPLU"][i]["plu"] === dtAllItem[idx]["plu"]) {
        idxFromStateForSelectedSimilarPLU = i;
        break;
      }
    }

    navigate("/inputJumlah", {
      state: {
        inputPlu: dtAllItem[idx]["plu"],
        idx: dtAllItem[idx]["plu"].slice(-1),
        idxSelectedItem: idx,
        inputTambah: true,
        showInputJumlah2: true,
        idxFromStateForSelectedSimilarPLU: idxFromStateForSelectedSimilarPLU,
      },
    });
  };

  const inputKurangJumlahFunc = (idx) => {
    let idxFromStateForSelectedSimilarPLU;
    for (let i = 0; i < dtAllItem[idx]["dtSimilarPLU"].length; i++) {
      if (dtAllItem[idx]["dtSimilarPLU"][i]["plu"] === dtAllItem[idx]["plu"]) {
        idxFromStateForSelectedSimilarPLU = i;
        break;
      }
    }
    navigate("/inputJumlah", {
      state: {
        inputPlu: dtAllItem[idx]["plu"],
        idx: dtAllItem[idx]["plu"].slice(-1),
        idxSelectedItem: idx,
        inputTambah: false,
        showInputJumlah2: true,
        idxFromStateForSelectedSimilarPLU: idxFromStateForSelectedSimilarPLU,
      },
    });
  };

  const handlePromomdBtn = (idx) => {
    setOpenModalCheckpromo(true);
    setPromoMdIdx(idx);
  };

  const hapusBtn = async (idx) => {
    setLoading(true);
    let finalInputJumlah = -dtAllItem[idx]["qty"];

    let idxFromStateForSelectedSimilarPLU;

    for (let i = 0; i < dtAllItem[idx]["dtSimilarPLU"].length; i++) {
      if (dtAllItem[idx]["dtSimilarPLU"][i]["plu"] === dtAllItem[idx]["plu"]) {
        idxFromStateForSelectedSimilarPLU = i;
        break;
      }
    }

    await axios
      .post(
        `${URL_GATEWAY}/servicePayment/inputJumlah`,
        {
          plu: dtAllItem[idx]["plu"],
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
            dtAllItem[idx]["dtSimilarPLU"][idxFromStateForSelectedSimilarPLU],
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
      .then((response) => {
        console.log(response["data"]);
        dispatch(replaceArray(response["data"]["dtInputtedItem"]));

        // Hitung total
        let totalTemp = 0;

        for (let i = 0; i < response["data"]["dtInputtedItem"].length; i++) {
          totalTemp =
            totalTemp + response["data"]["dtInputtedItem"][i]["jumlahRp"];
        }

        setTotal(totalTemp);

        navigate("/kasirSelfService");
        setLoading(false);
      })
      .catch(function (error) {
        console.log(error);

        setMsg(error["response"]["data"]["status"]);
        setLoading(false);
        setOpenModalAlert(true);
      });
  };

  const removeQtyNol = () => {
    let dtQtyNolTemp = [];

    for (let i = 0; i < dtAllItem.length; i++) {
      if (dtAllItem[i]["qty"] === 0 || dtAllItem[i]["harga"] === 0) {
        dtQtyNolTemp.push(dtAllItem[i]);
      }
    }

    const dtAllItemUpdated = dtAllItem.filter(
      (item) => !dtQtyNolTemp.includes(item)
    );

    dispatch(replaceArray(dtAllItemUpdated));
  };

  const handleBayarBtn = async () => {
    if (dtAllItem.length === 0 || total <= 0) {
      setMsg("Silahkan masukkan barang terlebih dahulu");
      setOpenModalAlert(true);
    } else {
      setLoading(true);
      removeQtyNol();
      countTotal();

      await axios
        .post(
          `${URL_GATEWAY}/servicePayment/hitungTotal`,
          {
            kodeIGR: glRegistryDt["glRegistryDt"]["registryOraIGR"],
            dbStatus: glRegistryDt["glRegistryDt"]["server"],
            dtMember: {
              memberID: userDt["memberID"],
              memberFlag: userDt["memberFlag"],
              cus_idsegment: userDt["cus_idsegment"],
              cus_jenismember: userDt["cus_jenismember"],
            },
            noTransaksi: glDtDocInfo,
            total: total,
            dtDtlBrng: dtAllItem,
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
          }
        )
        .then((response) => {
          if (response["data"]["flagPwp"]) {
            console.log("dtPWP:", response["data"]);
            dispatch(addItemDtPwp(response["data"]));
            dispatch(setGlPembulatan(pembulatan));
            navigate("/pwpGabungan");
          } else {
            dispatch(addItemHitungTotal(response["data"]));

            navigate("/kasirPembayaran", {
              state: {
                total: response["data"]["totalNilai"],
                pembulatan: pembulatan,
                totCashback: response["data"]["totCashback"],
                totDisc: response["data"]["totDisc"],
                totPembayaran: response["data"]["jumlahPenjualan"],
              },
            });
          }

          setLoading(false);
        })
        .catch(function (error) {
          console.log(error);

          setMsg(error["response"]["data"]["status"]);
          setLoading(false);
          setOpenModalAlert(true);
        });
    }
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

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dtAllItem]);

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
        open={openModalCheckpromo}
        customWidth={80}
        onClose={() => setOpenModalCheckpromo(false)}
        landscape={isLandscape}
      >
        <div
          className={`${memberMerah ? "bg-red" : "bg-blue"} rounded-t-xl p-5`}
        >
          <p className="font-semibold text-center text-white text-subTitle">
            {"Cek Potongan"}
          </p>
        </div>
        <div
          className={`flex flex-col ${
            isLandscape ? "p-16" : "p-10"
          }  bg-white rounded-xl`}
        >
          <div className="flex flex-row gap-5 py-2 align-middle">
            <p className="font-semibold text-subText">Harga Normal: </p>
            <p className="self-start text-subText">
              {dtAllItem[promoMdIdx]?.promoMD?.hargaNormal === ""
                ? "-"
                : dtAllItem[promoMdIdx]?.promoMD?.hargaNormal}
            </p>
          </div>
          <div className="flex flex-row gap-5 py-2 align-middle border-t border-b border-black border-solid">
            <p className="font-semibold text-subText ">Harga Promosi:</p>
            <p className="self-start text-subText">
              {dtAllItem[promoMdIdx]?.promoMD?.hargaPromosi === ""
                ? "-"
                : dtAllItem[promoMdIdx]?.promoMD?.hargaPromosi}
            </p>
          </div>
          {/* <div className="flex flex-row gap-5 py-2 align-middle">
            <p className="font-semibold text-subText ">Alokasi:</p>
            <p className="self-start text-subText">
              {dtAllItem[promoMdIdx]?.promoMD?.alokasi === ""
                ? "-"
                : dtAllItem[promoMdIdx]?.promoMD?.alokasi}
            </p>
          </div>
          <div className="flex flex-row gap-5 py-2 align-middle border-t border-b border-black border-solid">
            <p className="font-semibold text-subText ">Sisa:</p>
            <p className="self-start text-subText">
              {dtAllItem[promoMdIdx]?.promoMD?.sisa === ""
                ? "-"
                : dtAllItem[promoMdIdx]?.promoMD?.sisa}
            </p>
          </div> */}
        </div>
      </Modal>
      {loading ? null : <HiddenInputForPOS />}

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
              className="drop-shadow-lg rounded mb-10 w-[444px] h-[156px]"
            />
            <p className="font-bold text-white text-title ">
              Silahkan Scan Barang Yang Ingin Dibeli
            </p>
          </div>
        ) : (
          <>
            <img
              src={LogoIGR}
              alt="Logo IGR"
              className="drop-shadow-lg rounded w-[544px] h-[186px] self-center"
            />

            <p className="mt-10 mb-10 font-bold text-center text-white text-subTitle">
              Silahkan Scan Barang Yang Ingin Dibeli
            </p>
          </>
        )}
        <div className="w-[100%] h-[100%] flex flex-col bg-gray-100 rounded-[20px] mb-10 p-10">
          {dtAllItem.length > 0 ? (
            <>
              <div
                ref={scrollRef} // Assign ref to this div
                className={`${
                  isLandscape
                    ? "overflow-x-auto max-w-[100%] max-h-[450px]"
                    : "overflow-y-auto max-h-[1150px]"
                }`}
              >
                {dtAllItem.map((item, itemIndex) => (
                  <>
                    <div
                      key={item.plu}
                      className=" w-[100%] shadow-lg p-5 rounded-xl bg-white mb-10 "
                    >
                      <div className="flex flex-row justify-between">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-row gap-5">
                            <p className="font-bold text-subText">{item.plu}</p>
                            <p className="max-w-[25rem] font-bold truncate text-subText">
                              {item.namaBarang}
                            </p>
                            <p className="font-bold text-subText">
                              (
                              {item.dtSimilarPLU.find(
                                (itemUnit) => itemUnit.plu === item.plu
                              )?.unit || "Unit not found"}
                              )
                            </p>
                          </div>
                          {/* <div className="flex flex-row justify-between w-full bg-yellow">
                        <p className="font-bold text-[30px]">
                          Disc {item.disc}
                        </p>
                        <p className="font-bold text-[30px]">
                          Jumlah Rp {item.disc}
                        </p>
                      </div> */}
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="font-bold text-subText">
                            {item.dtSimilarPLU.find(
                              (itemUnit) => itemUnit.plu === item.plu
                            )?.unit === "KG"
                              ? formattedNumber(item.jumlahRp)
                              : formattedNumber(item.harga)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row justify-between p-3 mt-5 bg-yellow rounded-xl">
                        <p className="font-bold text-[30px]">
                          Pot. Member: {formattedNumber(item.disc)}
                        </p>
                        <p className="font-bold text-[30px]">
                          Total: {formattedNumber(item.jumlahRp)}
                        </p>
                      </div>
                      <div className="flex flex-row justify-between gap-5 mt-5">
                        <button
                          onClick={() => hapusBtn(itemIndex)}
                          className={`flex flex-row rounded-xl bg-stroke-white p-5 text-subText items-center gap-5 font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-red to-red3`}
                        >
                          <RiDeleteBinLine />
                          Hapus
                        </button>
                        {item.dtSimilarPLU.find(
                          (itemUnit) => itemUnit.plu === item.plu
                        )?.unit === "KG" ? null : (
                          <button
                            onClick={() => inputKurangJumlahFunc(itemIndex)}
                            className={`flex justify-center items-center w-24 rounded-xl bg-stroke p-5 text-subText gap-5 font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-gray-200 to-white`}
                          >
                            <FaMinus className="w-10 text-black" />
                          </button>
                        )}

                        <div className="flex items-center justify-center w-32 p-3 border bg-stroke rounded-xl">
                          <p className="max-w-full overflow-x-auto font-bold text-center text-text whitespace-nowrap">
                            {item.qty}
                          </p>
                        </div>
                        {item.dtSimilarPLU.find(
                          (itemUnit) => itemUnit.plu === item.plu
                        )?.unit === "KG" ? null : (
                          <button
                            onClick={() => inputJumlahFunc(itemIndex)}
                            className={`flex justify-center items-center w-24 rounded-xl bg-stroke p-5 text-subText gap-5 font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-gray-200 to-white`}
                          >
                            <FaPlus className="w-10 text-black" />
                          </button>
                        )}

                        {Object.keys(dtAllItem[itemIndex]["promoMD"]).length !==
                        0 ? (
                          <button
                            onClick={() => handlePromomdBtn(itemIndex)}
                            className={`flex flex-row rounded-xl bg-stroke-white p-5 text-[26px] items-center gap-5 font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-green4 to-green5`}
                          >
                            <PiStarFourBold />
                            Cek Potongan
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-auto ">
              <DataEmpty
                width={isLandscape ? "30%" : "75%"}
                title={"Belum ada barang yang dimasukkan"}
                pos={true}
              />
            </div>
          )}
          <div className="z-10 pt-5 mt-auto">
            <div className="w-full mb-5 border-t-4 border-black border-dashed"></div>
            <div className="flex flex-row justify-between">
              <p className="font-bold text-subTitle">TOTAL</p>
              <p className="font-bold text-subTitle">
                {formattedNumber(total)}
              </p>
            </div>
          </div>
        </div>
        <div
          className={`flex flex-row self-center items-center gap-5 ${
            isLandscape ? "w-[50%]" : "w-[100%]"
          }`}
        >
          <StandardBtn
            title="Kembali"
            path="/pembelianPembayaranMenu"
            width="50%"
            pos={true}
          />

          {/* <StandardBtn
            title="Cek Promo MKT"
            path="/pembelianPembayaranMenu"
            width="50%"
            pos={true}
          /> */}

          <button
            onClick={handleBayarBtn}
            className={`w-[50%] h-[96px] rounded-xl bg-stroke-white bg-blue p-3 text-subText font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3`}
          >
            Bayar
          </button>
        </div>
      </div>
    </>
  );
}

export default KasirSelfService;
