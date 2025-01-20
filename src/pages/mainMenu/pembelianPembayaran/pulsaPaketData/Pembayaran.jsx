import React, { useEffect, useState } from "react";
import {
  LogoIGR,
  BgLogin as Bg,
  BgLoginPotrait as BgPotrait,
  IcPrint,
  IcSucc,
  IcErr,
} from "../../../../assets";
import StandardBtn from "../../../../components/StandardBtn";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../../../../components/Loader";
import ModalAlert from "../../../../components/ModalAlert";
import { passToChar, PAYMENT_KEY, URL_GATEWAY } from "../../../../config";
import { toggleMemberMerah } from "../../../../services/redux/memberReducer";
import {
  removeAllItems,
  removeAllItemsHitungTotal,
} from "../../../../services/redux/dtAllInputtedItemReducer";
import { addDtTimeStart } from "../../../../services/redux/documentInfoReducer";

// const struk = {
//   provider: "TELKOMSEL",
//   noHp: "082351121869",
//   nominal: "TLKMSL V-ELCT 5.000",
//   harga: "Rp 7.000,00",
// };

const { ipcRenderer } = window.require("electron");

function Pembayaran() {
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const userDt = useSelector((state) => state.glUser.dtUser);
  const [printSuccess, setPrintSuccess] = useState(false);
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [openModalAlert, setOpenModalAlert] = useState(false);
  const [openModalAlertErr, setOpenModalAlertErr] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const { type, providerName, plu, noHp } = location.state;
  const [struk, setStruk] = useState({
    provider: "",
    nominal: "",
    harga: 0,
    noHpUser: "",
    deskripsiPendek: "",
    hargaJual: 0,
  });
  const [isLandscape, setIsLandscape] = useState(false);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  console.log("struk", struk);

  const formattedNumber = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    })
      .format(number)
      .replace(/\./g, ",");
  };

  const handleNavigate = () => {
    if (memberMerah) {
      navigate("/");
      dispatch(addDtTimeStart(""));
      dispatch(removeAllItems());
      dispatch(removeAllItemsHitungTotal());
    } else {
      navigate("/");
      dispatch(addDtTimeStart(""));
      dispatch(removeAllItems());
      dispatch(toggleMemberMerah());
      dispatch(removeAllItemsHitungTotal());
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
        handleNavigate();
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

    const loadDetailPulsa = async () => {
      setLoading(true);
      await axios
        .get(`${URL_GATEWAY}/servicePayment/getLoadDetailPulsa?plu=${plu}`, {
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
        })
        .then((response) => {
          console.log(response);
          console.log(
            response["data"]["dtDetailPulsa"][0]["prd_deskripsipendek"]
          );
          if (response["data"]["dtDetailPulsa"]) {
            setStruk({
              provider: providerName,
              nominal:
                response["data"]["dtDetailPulsa"][0]["prd_deskripsipendek"],
              harga: formattedNumber(
                response["data"]["dtDetailPulsa"][0]["prd_hrgjual"].toString()
              ),
              noHpUser: noHp,
              deskripsiPendek:
                response["data"]["dtDetailPulsa"][0]["prd_deskripsipendek"],
              hargaJual: response["data"]["dtDetailPulsa"][0]["prd_hrgjual"],
            });
            console.log(noHp);

            console.log("struk", struk);

            setLoading(false);
          } else {
            setStruk(false);
            setLoading(false);
          }
        })
        .catch(function (error) {
          console.log(error.message);
          setLoading(false);
        });
    };

    loadDetailPulsa();

    return () => {
      window.removeEventListener("click", handleTouch);
      clearTimeout(newTimeoutId);
      window.removeEventListener("resize", updateOrientation);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPrintPaymentPrintPage = async (paymentCode) => {
    await axios
      .get(`${URL_GATEWAY}/servicePayment/getPdPrintPagePayment`, {
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
      })
      .then((response) => {
        console.log(response);
        let tempBranch = response["data"]["tempBranch"];

        const data = [
          {
            type: "text",
            value: tempBranch,
            style: {
              textAlign: "center",
              fontFamily: "Courier, monospace",
              fontSize: "16px",
              fontWeight: "300",
              color: "black",
              marginTop: "10px",
            },
          },
          {
            type: "text",
            value: `No Member : ${userDt["memberID"]}`,
            style: {
              textAlign: "center",
              fontFamily: "Courier, monospace",
              fontSize: "16px",
              fontWeight: "300",
              color: "black",
              marginTop: "10px",
            },
          },
          {
            type: "text",
            value: `No Hp : ${noHp}`,
            style: {
              textAlign: "center",
              fontFamily: "Courier, monospace",
              fontSize: "16px",
              fontWeight: "300",
              color: "black",
              marginTop: "10px",
            },
          },
          {
            type: "text",
            value: `Tanggal Cetak : ${new Date().toLocaleDateString("id-ID")}`,
            style: {
              textAlign: "center",
              fontFamily: "Courier, monospace",
              whiteSpace: "pre",
              fontSize: "16px",
              fontWeight: "300",
              color: "black",
              marginTop: "10px",
              marginBottom: "10px",
            },
          },
          {
            type: "barCode",
            value: paymentCode,
            width: 2,
            height: 55,
            position: "center",
            displayValue: false,
          },
          {
            type: "text",
            value: paymentCode,
            style: {
              textAlign: "center",
              fontFamily: "Courier, monospace",
              fontSize: "16px",
              fontWeight: "300",
              color: "black",
              marginTop: "10px",
            },
          },
          {
            type: "text",
            value: " ", // Teks kosong untuk memberikan jarak dari kiri
            style: {
              textAlign: "center",
              fontFamily: "Courier, monospace",
              fontSize: "16px",
              fontWeight: "300",
              color: "black",
              marginTop: "10px",
            }, // Mengatur perataan secara manual
          },
          {
            type: "text",
            value: " ", // Teks kosong untuk memberikan jarak dari kiri
            style: {
              textAlign: "center",
              fontFamily: "Courier, monospace",
              fontSize: "16px",
              fontWeight: "300",
              color: "black",
              marginTop: "10px",
            }, // Mengatur perataan secara manual
          },
          {
            type: "text",
            value: "",
            style: {
              fontFamily: "Courier, monospace",
              fontSize: "16px",
              fontWeight: "300",
              color: "black",
              marginTop: "10px",
            },
          },
          {
            type: "text",
            value: "Voucher Hanya Bisa Dipakai",
            style: {
              textAlign: "center",
              fontFamily: "Courier, monospace",
              fontSize: "16px",
              fontWeight: "300",
              color: "black",
              marginTop: "10px",
            },
          },
          {
            type: "text",
            value: "Sesuai Tanggal Cetak",
            style: {
              textAlign: "center",
              fontFamily: "Courier, monospace",
              fontSize: "16px",
              fontWeight: "300",
              color: "black",
              marginTop: "10px",
              marginBottom: "10px",
            },
          },
        ];

        const dtToPrint = {
          dataReceipt: JSON.stringify(data),
          printerName:
            glRegistryDt["glRegistryDt"]["registryPrnName"] !== null &&
            glRegistryDt["glRegistryDt"]["registryPrnName"] !== undefined
              ? passToChar(
                  glRegistryDt["glRegistryDt"]["registryPrnName"]
                ).trim()
              : "eKioskPrinter",
        };

        ipcRenderer.send("print_receipt", dtToPrint);
        setOpenModalAlertErr(true);
        setPrintSuccess(true);
        setErrMsg("Berhasil Cetak Struk");
        setLoading(false);
      })
      .catch(function (error) {
        console.log(error.message);

        setOpenModalAlertErr(true);
        setPrintSuccess(false);
        setErrMsg(error["response"]["data"]["status"]);
        setLoading(false);
      });
  };

  const handleCetakStrukPulsa = async () => {
    setLoading(true);
    await axios
      .post(
        `${URL_GATEWAY}/servicePayment/getPrintDetailPulsa`,
        {
          memberId: userDt["memberID"],
          plu: plu,
          kodeIGR: glRegistryDt["glRegistryDt"]["registryOraIGR"],
          phoneNum: noHp,
          hargaJual: struk.hargaJual,
          total: struk.harga
            .replace(/Rp\s?/, "")
            .replace(/,00$/, "")
            .replace(/,/g, "")
            .replace(/\./g, ""),
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
        getPrintPaymentPrintPage(response["data"]["paymentCode"]);
      })
      .catch(function (error) {
        console.log(error.message);
        setOpenModalAlertErr(true);
        setPrintSuccess(false);
        setErrMsg(error["response"]["data"]["status"]);
        setLoading(false);
      });
  };

  return (
    <>
      <Loader loading={loading} merah={memberMerah} />
      <ModalAlert
        open={openModalAlert}
        onClose={() => setOpenModalAlert(false)}
        landscape={isLandscape}
      >
        <div className="text-center">
          <img src={IcSucc} alt="Warn" className="mx-auto" />
          <div className="mx-auto my-4">
            <h3 className="font-black text-gray-800 text-text">Success</h3>
            <p className="text-lg text-gray-500">
              Transaksi Berhasil, silahkan ambil struk dan membayar di kasir
            </p>
          </div>
          {/* <div className="flex gap-4">
            <button
              className="w-full btn btn-light"
              onClick={() => setOpenModalAlert(false)}
            >
              Tutup
            </button>
          </div> */}
        </div>
      </ModalAlert>
      <ModalAlert
        open={openModalAlertErr}
        onClose={() => setOpenModalAlertErr(false)}
        landscape={isLandscape}
      >
        <div className="text-center">
          <img
            src={printSuccess ? IcSucc : IcErr}
            alt="Warn"
            className="mx-auto"
          />
          <div className="mx-auto my-4">
            <h3 className="font-black text-gray-800 text-text">
              {" "}
              {printSuccess ? "Success" : "Error!"}
            </h3>
            <p className="text-lg text-gray-500">{errMsg}</p>
          </div>
          {/* <div className="flex gap-4">
            <button
              className="w-full btn btn-light"
              onClick={() => setOpenModalAlert(false)}
            >
              Tutup
            </button>
          </div> */}
        </div>
      </ModalAlert>
      <div
        style={{
          backgroundImage: `url(${isLandscape ? Bg : BgPotrait})`,
          height: `${isLandscape ? "1080px" : "1920px"}`,
          width: `${isLandscape ? "1920px" : "1080px"}`,
        }}
        className="flex flex-col gap-10 p-5"
      >
        <img
          src={LogoIGR}
          alt="Logo IGR"
          className={`drop-shadow-lg rounded w-[544px] h-[186px] self-center ${
            isLandscape ? "" : "mt-auto"
          }`}
        />
        <p className="text-center text-black text-subText">
          Sebelum <b>Cetak</b>, pastikan kembali
        </p>
        <p className="-mt-5 text-center text-black text-subText">
          <b>Nomor Handphone</b> & <b>Nominal</b> sudah benar.
        </p>

        <table
          className={`bg-white ${
            isLandscape ? "w-[40%]" : "w-[70%]"
          } self-center`}
        >
          <thead>
            <tr>
              <th
                colSpan="2"
                className="text-center text-white bg-stroke bg-blue text-subText"
              >
                Informasi Transaksi
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-stroke">
              <td className="p-1 text-subText bg-stroke w-[30%]">Provider</td>
              <td className="p-1 text-subText">
                {struk.provider ? struk.provider : "-"}
              </td>
            </tr>
            <tr className="bg-stroke ">
              <td className="p-1 text-subText bg-stroke">No. HP</td>
              <td className="p-1 text-subText">
                {struk.noHpUser ? struk.noHpUser : "-"}
              </td>
            </tr>
            <tr className="bg-stroke">
              <td className="p-1 text-subText bg-stroke">Nominal</td>
              <td className="p-1 text-subText">
                {struk.nominal ? struk.nominal : "-"}
              </td>
            </tr>
            <tr className="bg-stroke">
              <td className="p-1 text-subText bg-stroke">Harga</td>
              <td className="p-1 text-subText">
                {struk.harga ? struk.harga : "-"}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex flex-row self-end gap-5 mt-auto">
          <button
            onClick={handleCetakStrukPulsa}
            className={` w-[299px] h-[96px] text-subText rounded-xl bg-stroke-white 
          p-3 font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3 flex flex-row items-center justify-center gap-4 `}
          >
            <img src={IcPrint} alt="Button" className="w-[50px]" />
            Cetak
          </button>
          <StandardBtn title="Kembali" path="/pulsaPaketData" />
        </div>
      </div>
    </>
  );
}

export default Pembayaran;
