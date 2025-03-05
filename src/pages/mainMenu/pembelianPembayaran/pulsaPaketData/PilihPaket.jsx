import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BgLogin as Bg,
  BgLoginPotrait as BgPotrait,
  LogoIGR,
} from "../../../../assets";
import Loader from "../../../../components/Loader";
import StandardBtn from "../../../../components/StandardBtn";
import { AESEncrypt, PAYMENT_KEY, URL_GATEWAY } from "../../../../config";
import { toggleMemberMerah } from "../../../../services/redux/memberReducer";
import { deleteTempMemberFromAPI } from "../../../../controller/kasirPembayaranController";

const dataDummy = [
  {
    title: "Telkomsel 5.000",
    active: "15 Hari",
  },
  {
    title: "Telkomsel 15.000",
    active: "15 Hari",
  },
  {
    title: "Telkomsel 20.000",
    active: "15 Hari",
  },
  {
    title: "Telkomsel",
    active: "15 Hari",
  },
  {
    title: "Telkomsel",
    active: "15 Hari",
  },
  {
    title: "Telkomsel",
    active: "15 Hari",
  },
  {
    title: "Telkomsel",
    active: "15 Hari",
  },
  {
    title: "Telkomsel",
    active: "15 Hari",
  },
  {
    title: "Telkomsel",
    active: "15 Hari",
  },
  {
    title: "Telkomsel",
    active: "15 Hari",
  },
];

function PilihPaket() {
  const userDt = useSelector((state) => state.glUser.dtUser);
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const memberMerah = useSelector((state) => state.memberState.memberMerah);

  let dtPulsaTemp = [];
  let dtPaketDataTemp = [];
  const [dtPulsaArr, setDtPulsaArr] = useState(null);
  const [dtPaketDataArr, setDtPaketDataArr] = useState(null);

  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { dtPulsa, dtPaketData, imgProvider, providerName, noHp } =
    location.state;

  const navigate = useNavigate();
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const glIpModul = useSelector((state) => state.glDtIp.dtIp);
  const glStationModul = useSelector((state) => state.glUser.stationModul);
  const dispatch = useDispatch();
  const [isLandscape, setIsLandscape] = useState(false);

  const handleNavigatePulsa = (idx) => {
    const type = "PULSA";
    const plu = dtPulsaArr[idx]["igr_plu"];
    console.log(dtPulsaArr[idx]["igr_plu"]);

    navigate("/pembayaran", { state: { type, providerName, plu, noHp } });
  };

  const handleNavigatePaketData = (idx) => {
    const type = "PAKETDATA";
    const plu = dtPaketDataArr[idx]["igr_plu"];

    navigate("/pembayaran", { state: { type, providerName, plu, noHp } });
  };

  const handleNavigate = async () => {
    setLoading(true);

    const doDeleteTempMemberFromAPI = await deleteTempMemberFromAPI(
      URL_GATEWAY,
      userDt["memberID"],
      glIpModul,
      glStationModul,
      glRegistryDt
    );

    if (doDeleteTempMemberFromAPI.status === true) {
      if (memberMerah) {
        setLoading(false);
        navigate("/");
      } else {
        setLoading(false);
        navigate("/");
        dispatch(toggleMemberMerah());
      }
    } else {
      // if (
      //   doDeleteTempMemberFromAPI.message ===
      //   "Network doDeleteTempMemberFromAPI"
      // ) {
      //   setAlertMsg("Gagal Terhubung Dengan Gateway");
      // } else {
      //   setAlertMsg(doDeleteTempMemberFromAPI.message);
      // }

      setLoading(false);
      // setOpenModalAlert(true);
    }
  };

  useEffect(() => {
    let newTimeoutId;

    const handleTouch = () => {
      clearTimeout(newTimeoutId);
      console.log(
        "delayInMilliseconds",
        glLougoutApp["lcLogOutLimitApp"] * 1000
      );
      setNewTimeout();
    };

    const setNewTimeout = () => {
      newTimeoutId = setTimeout(async () => {
        await handleNavigate();
      }, glLougoutApp["lcLogOutLimitApp"] * 1000);
    };

    const updateOrientation = () => {
      const { innerWidth: width, innerHeight: height } = window;

      setIsLandscape(width === 1920 && height === 1080);
    };

    updateOrientation();
    setNewTimeout();
    window.addEventListener("click", handleTouch);
    window.addEventListener("resize", updateOrientation);

    const loadNominal = async () => {
      setLoading(true);

      // Get Loyalty Index
      await axios
        .post(
          `${URL_GATEWAY}/servicePayment/getLoadNominal`,
          { pulsaDt: dtPulsa, paketDt: dtPaketData },
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
          console.log(dtPulsa.length);

          // setDtPulsaProdmast(response["data"]["pulsaProdmast"]);
          console.log(response["data"]["pulsaProdmast"]);
          if (dtPulsa) {
            for (let i = 0; i < dtPulsa.length; i++) {
              for (
                let k = 0;
                k < response["data"]["pulsaProdmast"].length;
                k++
              ) {
                if (
                  response["data"]["pulsaProdmast"][k]["prd_prdcd"] ===
                  dtPulsa[i]["igr_plu"]
                ) {
                  dtPulsaTemp.push(dtPulsa[i]);
                }
              }
            }

            setDtPulsaArr(dtPulsaTemp);

            console.log(dtPulsaTemp);
          } else {
            setDtPulsaArr(false);
          }

          // setDtPaketProdmast(response["data"]["paketProdmast"][0]);
          if (dtPaketData) {
            for (let i = 0; i < dtPaketData.length; i++) {
              for (
                let k = 0;
                k < response["data"]["paketProdmast"].length;
                k++
              ) {
                if (
                  response["data"]["paketProdmast"][k]["prd_prdcd"] ===
                  dtPaketData[i]["igr_plu"]
                ) {
                  dtPaketDataTemp.push(dtPaketData[i]);
                }
              }
            }
            setDtPaketDataArr(dtPaketDataTemp);
          } else {
            setDtPaketDataArr(false);
          }

          setLoading(false);
        })
        .catch(function (error) {
          console.log(error.message);
          setLoading(false);
        });
    };

    loadNominal();

    return () => {
      window.removeEventListener("click", handleTouch);
      clearTimeout(newTimeoutId);
      window.removeEventListener("resize", updateOrientation);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Loader loading={loading} merah={memberMerah} />
      <div
        style={{
          backgroundImage: `url(${isLandscape ? Bg : BgPotrait})`,
          height: `${isLandscape ? "1080px" : "1920px"}`,
          width: `${isLandscape ? "1920px" : "1080px"}`,
        }}
        className="flex flex-col p-5"
      >
        <img
          src={LogoIGR}
          alt="Logo IGR"
          className={`drop-shadow-lg rounded w-[544px] h-[186px] self-center ${
            isLandscape ? "" : "mt-40"
          }`}
        />
        <p className="mt-5 font-bold text-center text-black text-subTitle">
          Pilih Nominal
        </p>

        <div className={`flex ${isLandscape ? "flex-row" : "flex-col"} gap-5`}>
          {/* Pulsa */}
          <div
            className={`${
              isLandscape ? "w-[50%]" : "w-[100%]"
            } h-[600px] overflow-hidden overflow-y-scroll p-5 items-center bg-gray-50 rounded-xl shadow-xl bg-stroke mt-5`}
          >
            <div className="self-center mb-5 ">
              <div className="flex flex-row mb-5">
                <img
                  src={imgProvider}
                  alt="Logo Provider"
                  className="w-[86px]"
                />
                <p className="self-center font-bold text-left text-black text-text">
                  Pulsa
                </p>
              </div>

              {dtPulsaArr?.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {dtPulsaArr?.map((item, itemIndex) => (
                    <button
                      onClick={() => handleNavigatePulsa(itemIndex)}
                      className="items-center bg-white w-[100%] grid grid-cols-2 active:bg-gray-100 rounded-xl p-5 shadow-xl"
                    >
                      <p className="font-bold text-left">
                        {item.description.split("-")[0].trim()}
                      </p>
                      <p className="text-right">
                        {item.description.split("-")[1].trim()}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="font-semibold text-center text-subText">
                  Tidak Ada Paket Pulsa Yang Tersedia
                </p>
              )}
            </div>
          </div>

          {/* Data */}
          <div
            className={`${
              isLandscape ? "w-[50%]" : "w-[100%]"
            } h-[600px] overflow-hidden overflow-y-scroll p-5 items-center bg-gray-50 rounded-xl shadow-xl bg-stroke mt-5`}
          >
            <div className="self-center">
              <div className="flex flex-row mb-5">
                <img
                  src={imgProvider}
                  alt="Logo Operator"
                  className="w-[86px]"
                />
                <p className="self-center font-bold text-left text-black text-text">
                  Data
                </p>
              </div>

              {dtPaketDataArr?.length > 0 ? (
                <div className="grid self-center grid-cols-2 gap-3 gap-x-10">
                  {dtPaketDataArr?.map((item, itemIndex) => (
                    <button
                      onClick={() => handleNavigatePaketData(itemIndex)}
                      className="items-center bg-white w-[100%]  grid grid-rows-2 active:bg-gray-100 rounded-xl p-5 shadow-lg"
                    >
                      <p className="font-bold text-left">
                        {item.description.split("-")[0]}
                      </p>

                      <p className="text-left">
                        {item.description.split("-")[1]}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="font-semibold text-center text-subText">
                  Tidak Ada Paket Data Yang Tersedia
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="self-end mt-auto">
          <StandardBtn title="Kembali" path="/pulsaPaketData" />
        </div>
      </div>
    </>
  );
}

export default PilihPaket;
