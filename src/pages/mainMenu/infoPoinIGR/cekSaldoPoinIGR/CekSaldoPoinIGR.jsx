import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { format, parse } from "date-fns";
import {
  KartuMB,
  KartuMM,
  BgMM2,
  BgMB2,
  LogoIGR,
  IcWarn,
  IcSucc,
  IcPrint,
} from "../../../../assets";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import StandardBtn from "../../../../components/StandardBtn";
import ModalAlert from "../../../../components/ModalAlert";
import axios from "axios";
import Loader from "../../../../components/Loader";
import moment from "moment";
import { GoHistory } from "react-icons/go";
import Modal from "../../../../components/Modal";
import { Divide } from "react-feather";
import {
  passToChar,
  POIN_KEY,
  URL_SERVICE_PIC,
  PIC_API_KEY,
} from "../../../../config";
import { toggleMemberMerah } from "../../../../services/redux/memberReducer";

const { ipcRenderer } = window.require("electron");

const dataTable = [{ Tanggal: "-" }, { Tanggal: "-" }, { Tanggal: "-" }];

function CekSaldoPoinIGR() {
  const dispatch = useDispatch();
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const ipDt = useSelector((state) => state.glDtIp.dtIp);
  const userDt = useSelector((state) => state.glUser.dtUser);
  const [isLandscape, setIsLandscape] = useState(false);

  // useEffect(() => {
  //   handleToggleMember();
  // }, []);

  const [openModalAlert, setOpenModalAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [printSuccess, setPrintSuccess] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/infoPoinIGRMenu");
  };
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const bgImage = memberMerah ? BgMM2 : BgMB2;
  const [dtBalance, setDtBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const formattedNumber = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    })
      .format(number)
      .replace(/\./g, ",");
  };

  const handleNavigateLogout = () => {
    if (memberMerah) {
      navigate("/");
    } else {
      navigate("/");
      dispatch(toggleMemberMerah());
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
        handleNavigateLogout();
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

    const getBalanceMember = async () => {
      setLoading(true);
      await axios
        .get(
          `${URL_GATEWAY}/servicePoin/getBalanceMember?memberId=${userDt["memberID"]}`,
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
              "x-api-key": POIN_KEY,
            },
          }
        )
        .then((response) => {
          console.log(response);
          if (response["data"]["balanceJsonPoinIGR"]) {
            setDtBalance(response["data"]);
          } else {
            setDtBalance(["data"]["status"]);
          }
          setLoading(false);
          console.log("balance member: ", dtBalance);
        })
        .catch(function (error) {
          console.log(error.message);
          setLoading(false);
        });
    };

    getBalanceMember();

    return () => {
      window.removeEventListener("click", handleTouch);
      clearTimeout(newTimeoutId);
      window.removeEventListener("resize", updateOrientation);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fungsi untuk menambahkan padding
  const addAutoPadding = (text, totalLength) => {
    // Jika panjang string sudah lebih besar atau sama dengan totalLength, kembalikan string asli
    if (text.length >= totalLength) {
      return text;
    }

    const paddingLength = totalLength - text.length;
    const leftPadding = Math.floor(paddingLength / 2);
    const rightPadding = paddingLength - leftPadding;

    return " ".repeat(leftPadding) + text + " ".repeat(rightPadding);
  };

  const addRightPadding = (text, totalLength) => {
    // Jika panjang string sudah lebih besar atau sama dengan totalLength, kembalikan string asli
    if (text.length >= totalLength) {
      return text;
    }

    const paddingLength = totalLength - text.length;
    return text + " ".repeat(paddingLength);
  };
  const addLeftPadding = (text, totalLength) => {
    // Jika panjang string sudah lebih besar atau sama dengan totalLength, kembalikan string asli
    if (text.length >= totalLength) {
      return text;
    }

    const paddingLength = totalLength - text.length;
    return " ".repeat(paddingLength) + text;
  };

  const getFormattedDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
    const year = today.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const localizeMonth = (tgl) => {
    const tglMurni = tgl;
    const arrTgl = tgl.split("-");
    try {
      if (arrTgl.length > 0) {
        tgl = arrTgl[1];
        tgl = tgl.replace(" ", "");
        tgl = tgl.trim();

        if (tgl === "JANUARY") {
          return arrTgl[0] + " Januari " + arrTgl[2];
        } else if (tgl === "FEBRUARY") {
          return arrTgl[0] + " Pebruari " + arrTgl[2];
        } else if (tgl === "MARCH") {
          return arrTgl[0] + " Maret " + arrTgl[2];
        } else if (tgl === "APRIL") {
          return arrTgl[0] + " April " + arrTgl[2];
        } else if (tgl === "MAY") {
          return arrTgl[0] + " Mei " + arrTgl[2];
        } else if (tgl === "JUNE") {
          return arrTgl[0] + " Juni " + arrTgl[2];
        } else if (tgl === "JULY") {
          return arrTgl[0] + " July " + arrTgl[2];
        } else if (tgl === "AUGUST") {
          return arrTgl[0] + " Agustus " + arrTgl[2];
        } else if (tgl === "SEPTEMBER") {
          return arrTgl[0] + " September " + arrTgl[2];
        } else if (tgl === "OCTOBER") {
          return arrTgl[0] + " Oktober " + arrTgl[2];
        } else if (tgl === "NOVEMBER") {
          return arrTgl[0] + " November " + arrTgl[2];
        } else if (tgl === "DECEMBER") {
          return arrTgl[0] + " Desember " + arrTgl[2];
        } else {
          return tglMurni.replace(" ", "");
        }
      } else {
        return tglMurni;
      }
    } catch (error) {
      return tglMurni;
    }
  };

  const capitalizeFirstWord = (text) => {
    const words = text.split(" "); // Pisahkan kata-kata dengan spasi
    const firstWord = words[0]; // Ambil kata pertama
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  };

  const handleCetakSaldoBtn = async () => {
    setLoading(true);
    await axios
      .get(
        `${URL_GATEWAY}/servicePoin/getPrintPoin?memberId=${userDt["memberID"]}&ipAddress=${ipDt}`,
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
            "x-api-key": POIN_KEY,
          },
        }
      )
      .then(async (response) => {
        console.log(response);
        // Mengubah string menjadi objek Date
        const parsedDate = parse(
          response["data"]["data"],
          "dd-MMMM-yyyy",
          new Date()
        );

        // Memformat tanggal ke dalam format dd/MM/yyyy
        const formattedDate = format(parsedDate, "dd/MM/yyyy");

        let strukData = "";
        let tglTemp = "Tgl " + formattedDate;

        let saldoTemp = dtBalance["balanceJsonPoinIGR"].toString();

        strukData = addAutoPadding("INFO POIN IGR", 48) + "\n\n";
        strukData += userDt["memberName"] + " - " + userDt["memberID"] + "\n";
        strukData +=
          addRightPadding("Saldo: " + saldoTemp + " POIN IGR", 23) +
          addLeftPadding(tglTemp, 23) +
          "\n";

        if (
          dtBalance["dtPerolehanMyPoin"].length > 0 &&
          dtBalance["dtPerolehanMyPoin"][0]["alert"] === undefined
        ) {
          strukData += "3 Transaksi Terakhir Poin IGR\n";
          strukData += "----------------------------------------------\n";
          strukData += addRightPadding("Tanggal", 17);
          strukData += addLeftPadding("Jumlah", 8);
          strukData += addLeftPadding("Keterangan", 21);

          strukData += "\n";
          strukData += "----------------------------------------------\n";

          for (let i = 0; i < dtBalance["dtPerolehanMyPoin"].length; i++) {
            strukData += addRightPadding(
              localizeMonth(
                dtBalance["dtPerolehanMyPoin"][i]["tanggal"]
                  .toString()
                  .slice(0, 10)
              ),
              17
            );
            strukData += addLeftPadding(
              dtBalance["dtPerolehanMyPoin"][i]["perolehan"].toString(),
              8
            );
            if (
              capitalizeFirstWord(
                dtBalance["dtPerolehanMyPoin"][i]["keterangan"].toString()
              ) === "Perolehan"
            ) {
              strukData += addLeftPadding(
                capitalizeFirstWord(
                  dtBalance["dtPerolehanMyPoin"][i]["keterangan"].toString()
                ),
                21
              );
            } else {
              strukData += addLeftPadding(
                dtBalance["dtPerolehanMyPoin"][i]["keterangan"].toString(),
                20
              );
            }
            strukData += "\n";
          }
        } else {
          strukData += "----------------------------------------------\n";
          strukData += addAutoPadding("Tidak ada Mutasi Poin", 48) + "\n";
        }
        strukData += "----------------------------------------------\n";
        strukData +=
          addAutoPadding("Terima Kasih Telah Menggunakan", 48) + "\n";
        strukData += addAutoPadding("i-Kiosk Indogrosir", 48) + "\n";

        const data = [
          // {
          //   type: "raw", // Menggunakan tipe 'text' untuk mengirimkan perintah ESC/POS
          //   value: String.fromCharCode(27) + "@",
          //   style: "", // Style tambahan jika diperlukan
          // },

          {
            type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
            value: strukData,
            style: {
              fontFamily: "Courier New, Courier, monospace", // Mengatur font ke Courier atau monospace lain
              whiteSpace: "pre", // Menjaga spasi dan baris baru
              fontSize: "9.5px",
              fontWeight: "700",
            },
          },
        ];

        const dtToSaveReceipt = {
          memberID: userDt["memberID"],
          receiptDt: strukData,
          path: `\\CetakPoin-${moment().format("YYYYMMDD")}.TXT`,
        };

        ipcRenderer.send("save_receipt", dtToSaveReceipt);

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

        setLoading(false);
        setPrintSuccess(true);
        setAlertMsg("Berhasil Cetak Poin");
        setOpenModalAlert(true);
      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
        setPrintSuccess(false);
        setAlertMsg(error["response"]["data"]["status"]);
        setOpenModalAlert(true);
      });
  };

  const formatDateTime = (dateTimeString) => {
    // Extract the date part (first 10 characters) and time part (characters from index 10 onwards)
    const date = dateTimeString.slice(0, 10);
    const time = dateTimeString.slice(10);

    // Combine with a space in between
    return `${date} ${time}`;
  };

  const formattedNumberWithoutCurrency = (number) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(number)
      .replace(/\./g, ",");
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
          <img
            src={printSuccess ? IcSucc : IcWarn}
            alt="Warn"
            className="mx-auto"
          />
          <div className="mx-auto my-4">
            <h3 className="font-black text-gray-800 text-text">
              {printSuccess ? "Success" : "Warning!"}
            </h3>
            <p className="text-lg text-gray-500">{alertMsg}</p>
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
      <Modal
        open={openModal}
        customWidth={75}
        onClose={() => setOpenModal(false)}
      >
        <div className={`rounded-t-xl ${memberMerah ? "bg-red3" : "bg-blue3"}`}>
          <p className="p-5 font-bold text-center text-white text-subTitle">
            3 Transaksi Terakhir Anda
          </p>
        </div>
        <div className="p-10 bg-white rounded-xl">
          <DataTable
            value={
              dtBalance["dtPerolehanMyPoin"] === undefined
                ? dataTable
                : dtBalance["dtPerolehanMyPoin"]
            }
            tableStyle={{ width: "100%" }}
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
          >
            <Column
              header="Tanggal"
              // headerClassName="custom-header"
              headerClassName={`${
                memberMerah ? "bg-red" : "bg-blue"
              } text-white text-[30px] text-center px-5`}
              alignHeader="center"
              bodyStyle={{
                fontSize: "24px",
                borderBottom: "2px solid #000",
                paddingLeft: "5px",
                padding: "10px",
                textAlign: "center",
              }}
              body={(rowData) => (
                <span>
                  {rowData.tanggal !== undefined
                    ? formatDateTime(rowData.tanggal)
                    : "-"}
                </span>
              )}
            ></Column>
            <Column
              header="Keterangan"
              headerClassName={`${
                memberMerah ? "bg-red" : "bg-blue"
              } text-white text-[30px] text-center px-5`}
              alignHeader="center"
              bodyStyle={{
                fontSize: "24px",
                borderBottom: "2px solid #000",
                paddingLeft: "5px",
                padding: "10px",
                textAlign: "center",
              }}
              body={(rowData) => (
                <span>
                  {rowData.keterangan !== undefined ? rowData.keterangan : "-"}
                </span>
              )}
            ></Column>
            <Column
              header="Perolehan"
              headerClassName={`${
                memberMerah ? "bg-red" : "bg-blue"
              } text-white text-[30px] text-center px-5`}
              alignHeader="center"
              bodyStyle={{
                fontSize: "24px",
                borderBottom: "2px solid #000",
                paddingLeft: "5px",
                padding: "10px",
                textAlign: "center",
              }}
              body={(rowData) => (
                <span>
                  {rowData.perolehan !== undefined ? rowData.perolehan : "-"}
                </span>
              )}
            ></Column>
            <Column
              header="Pengeluaran"
              headerClassName={`${
                memberMerah ? "bg-red" : "bg-blue"
              } text-white text-[30px] text-center px-5`}
              alignHeader="center"
              bodyStyle={{
                fontSize: "24px",
                borderBottom: "2px solid #000",
                paddingLeft: "5px",
                padding: "10px",
                textAlign: "center",
              }}
              body={(rowData) => (
                <span>
                  {rowData.pengeluaran !== undefined
                    ? rowData.pengeluaran
                    : "-"}
                </span>
              )}
            ></Column>
          </DataTable>
        </div>
      </Modal>
      <div
        style={{
          height: `${isLandscape ? "1080px" : "1920px"}`,
          width: `${isLandscape ? "1920px" : "1080px"}`,
        }}
        className={`flex flex-col p-5 ${memberMerah ? "bg-red5" : "bg-blue4"}`}
      >
        {isLandscape ? (
          <div className="flex flex-row items-center mb-auto">
            <img
              src={LogoIGR}
              alt="Logo IGR"
              className="drop-shadow-lg rounded w-[387px] h-[132px] mr-auto"
            />

            <p className="absolute mx-auto font-bold text-white transform -translate-x-1/2 left-1/2 text-title ">
              Cek Saldo Poin IGR
            </p>

            <img
              src={memberMerah ? KartuMM : KartuMB}
              alt="Kartu Member"
              className="drop-shadow-lg w-[238px] h-[158px] ml-auto"
            />
          </div>
        ) : (
          <>
            <img
              src={memberMerah ? KartuMM : KartuMB}
              alt="Kartu Member"
              className="drop-shadow-lg w-[140px] h-[90px] ml-auto mb-10"
            />
            <img
              src={LogoIGR}
              alt="Logo IGR"
              className={`drop-shadow-lg rounded w-[544px] h-[186px] self-center
              }`}
            />
            <p className="mt-5 mb-40 font-bold text-center text-white text-title">
              Cek Saldo Poin IGR
            </p>
          </>
        )}

        <div className="flex flex-col">
          <div
            className={`${
              memberMerah
                ? "bg-gradient-to-t from-red2 to-red3"
                : "bg-gradient-to-t from-blue2 to-blue3"
            } ${
              isLandscape ? "w-[40%]" : "w-[70%]"
            } h-[400px] rounded-[10px] text-left self-center p-10 my-auto`}
          >
            <div className="flex flex-row justify-between py-5">
              <div>
                <p className="font-bold text-white text-text">Saldo Poin IGR</p>
                <p className="font-bold text-subTitle text-yellow">
                  {dtBalance["balanceJsonPoinIGR"] === undefined
                    ? 0
                    : formattedNumberWithoutCurrency(
                        dtBalance["balanceJsonPoinIGR"]
                      )}
                </p>
              </div>
              <GoHistory
                className="text-white"
                size={70}
                onClick={() => setOpenModal(true)}
              />
            </div>

            <p className="mt-5 font-bold text-white text-text">
              {userDt["memberName"]}
            </p>
            {/* {dtBalance["lbExp"] !== undefined ? ( */}
            <p className="mt-auto font-bold text-white text-subText">
              Expired:{" "}
              {dtBalance["lbExp"] !== undefined ? dtBalance["lbExp"] : "-"}
            </p>
            {/* ) : null} */}

            {/* <img
              src={memberMerah ? KartuMM : KartuMB}
              alt="Kartu Member"
              className="drop-shadow-lg w-[90px] h-[70px] ml-auto"
            /> */}
          </div>
        </div>
        <div className="flex flex-row self-end gap-5 mt-auto">
          <button
            onClick={handleCetakSaldoBtn}
            className={` w-[299px] h-[96px] text-subText rounded-xl bg-stroke-white flex flex-row items-center justify-center gap-4 ${
              memberMerah
                ? "transform transition duration-200 active:scale-90 bg-gradient-to-t from-red to-red3"
                : "transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3"
            }
          p-3 font-bold text-white active:bg-gray-100 `}
          >
            <img src={IcPrint} alt="Button" className="w-[50px]" />
            Cetak
          </button>
          <StandardBtn title="Kembali" path="/infoPoinIGRMenu" />
        </div>
      </div>
    </>
  );
}

export default CekSaldoPoinIGR;
