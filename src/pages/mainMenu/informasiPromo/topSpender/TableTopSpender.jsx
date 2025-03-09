import React, { useEffect, useState } from "react";
import {
  BgLogin as Bg,
  LogoIGR,
  IcArrowLeft,
  IcArrowRight,
} from "../../../../assets";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import StandardBtn from "../../../../components/StandardBtn";
import "./tableTopSpender.css";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Loader from "../../../../components/Loader";
import { AESEncrypt, INFO_PROMO_KEY, URL_GATEWAY } from "../../../../config";
import { toggleMemberMerah } from "../../../../services/redux/memberReducer";
import { useNavigate } from "react-router-dom";
import { deleteTempMemberFromAPI } from "../../../../controller/kasirPembayaranController";

const dataTable = [
  { peringkat: "1", country: "1", company: "IDM", representative: "-" },
  { peringkat: "2", country: "2", company: "IDM", representative: "-" },
  { peringkat: "3", country: "3", company: "IDM", representative: "-" },
  { peringkat: "4", country: "4", company: "IDM", representative: "-" },
  { peringkat: "5", country: "5", company: "IDM", representative: "-" },
  { peringkat: "6", country: "6", company: "IDM", representative: "-" },
  { peringkat: "7", country: "7", company: "IDM", representative: "-" },
  { peringkat: "8", country: "Indonesia", company: "IDM", representative: "-" },
  { peringkat: "9", country: "Indonesia", company: "IDM", representative: "-" },
  {
    peringkat: "10",
    country: "Indonesia",
    company: "IDM",
    representative: "-",
  },
];

function TableTopSpender() {
  const [first, setFirst] = useState(0); // State untuk mengatur indeks awal data yang ditampilkan
  const rowsPerPage = 10;
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const userDt = useSelector((state) => state.glUser.dtUser);
  const dtTopSpender = useSelector((state) => state.glTopSpender.dtTopSpender);
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const [dtSpender, setDtSpender] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [pencapaian, setPencapaian] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const glIpModul = useSelector((state) => state.glDtIp.dtIp);
  const glStationModul = useSelector((state) => state.glUser.stationModul);
  const navigate = useNavigate();
  const dispatch = useDispatch();
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

    const getDtTopSpender = async () => {
      setLoading(true);
      await axios
        .post(
          `${URL_GATEWAY}/serviceInfoPromo/getDtTopSpender?kodeIGR=${userDt["kodeIGR"]}&memberId=${userDt["memberID"]}`,
          { dtTopSpender: dtTopSpender["dtTopSpenderForGl"] },
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
              "x-api-key": INFO_PROMO_KEY,
            },
          }
        )
        .then((response) => {
          console.log(response);
          setDtSpender(response["data"]["dtSpender"]);
          setUserRank(response["data"]["userRank"]);
          setPencapaian(response["data"]["rpPencapaian"]);

          console.log(response["data"]);
          console.log("dtTopspender", dtTopSpender["dtTopSpenderForGl"]);

          setLoading(false);
        })
        .catch(function (error) {
          console.log(error.message);
          setLoading(false);
        });
    };

    getDtTopSpender();

    return () => {
      window.removeEventListener("click", handleTouch);
      clearTimeout(newTimeoutId);
      window.removeEventListener("resize", updateOrientation);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPageChange = (event) => {
    setFirst(event.first); // Mengatur indeks awal data yang ditampilkan saat halaman berubah
  };

  const handleNext = () => {
    setFirst((prevFirst) => prevFirst + rowsPerPage);
  };

  const handlePrev = () => {
    setFirst((prevFirst) => Math.max(prevFirst - rowsPerPage, 0));
  };

  const getFormattedDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
    const year = today.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const formattedNumber = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    })
      .format(number)
      .replace(/\./g, ",");
  };

  const capitalizeEveryFirstLetter = (text) => {
    return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const ambilLimaKataPertama = (nama) => {
    // Pisahkan string menjadi array kata-kata
    const kata = nama.split(" ");

    // Jika panjang array kata-kata lebih dari 2, ambil hanya dua kata pertama
    if (kata.length > 2) {
      return kata.slice(0, 4).join(" ");
    } else {
      // Jika panjang array kata-kata tidak lebih dari 2, kembalikan string aslinya
      return nama;
    }
  };

  return (
    <>
      <Loader loading={loading} merah={memberMerah} />
      <div
        style={{
          height: `${isLandscape ? "1080px" : "1920px"}`,
          width: `${isLandscape ? "1920px" : "1080px"}`,
        }}
        className={`flex flex-col p-5 ${memberMerah ? "bg-red5" : "bg-blue4"}`}
      >
        <div
          className={`flex ${isLandscape ? "flex-row" : "flex-col"} gap-5 pb-2`}
        >
          <img
            src={LogoIGR}
            alt="Logo IGR"
            className={`drop-shadow-lg rounded w-[544px] h-[186px] ${
              isLandscape ? "" : " self-center mt-20"
            }`}
          />
          <div
            className={`${
              memberMerah ? "bg-red" : "bg-blue"
            } flex flex-col justify-center bg-stroke-white rounded-xl p-5 h-[100%] w-[100%]`}
          >
            {new Date(dtTopSpender["dtTopSpenderForGl"]["tsh_tglakhir_beli"]) >=
            new Date() ? (
              <p className="font-bold text-white text-text">
                Total Pencapaian Anda Sampai Dengan {getFormattedDate()} :{" "}
                {pencapaian !== "-" ? formattedNumber(pencapaian) : "-"}
              </p>
            ) : (
              <p className="font-bold text-white text-text">
                FINAL PENCAPAIAN ANDA :{" "}
                {pencapaian !== "-" ? formattedNumber(pencapaian) : "-"}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-center p-5 pb-0 bg-white shadow-xl rounded-xl">
          <div className="flex flex-row gap-1">
            <p className="font-bold text-black text-subText">Event : </p>
            <p className="text-black text-subText">
              {dtTopSpender["dtTopSpenderForGl"]["tsh_namapromosi"]}
            </p>
          </div>
          <div className="flex flex-row gap-1">
            <p className="font-bold text-black text-subText">Member : </p>
            <p className="text-black text-subText">
              {userDt["memberID"]} (
              {capitalizeEveryFirstLetter(userDt["memberName"])})
            </p>
          </div>
          <div className="flex flex-row gap-1">
            <p className="font-bold text-black text-subText">Periode : </p>
            <p className="text-black text-subText">
              {dtTopSpender["dtTopSpenderForGl"]["tsh_tglawal_beli"]} s/d{" "}
              {dtTopSpender["dtTopSpenderForGl"]["tsh_tglakhir_beli"]}
            </p>
          </div>
          <div className={`mb-5`}>
            <p
              className={`${
                memberMerah ? "bg-red" : "bg-blue"
              } text-white text-subText font-bold px-5 rounded-md inline-block`}
            >
              Anda Berada Di Peringkat: {userRank}
            </p>
          </div>

          <DataTable
            value={dtSpender?.length > 0 ? dtSpender : dataTable}
            paginator
            paginatorClassName="custom-paginator"
            rows={rowsPerPage}
            first={first}
            onPage={onPageChange}
            tableStyle={{ width: `${isLandscape ? "100%" : "200%"}` }}
            paginatorTemplate="RowsPerPageDropdown CurrentPageReport"
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
            paginatorRight={
              <button
                className="custom-paginator-button"
                onClick={handleNext}
                disabled={first + rowsPerPage >= dtSpender?.length}
              >
                <img
                  src={IcArrowRight}
                  alt="Arrow Right"
                  className="w-[30px] m-5"
                />
              </button>
            }
            paginatorLeft={
              <button className="custom-paginator-button" onClick={handlePrev}>
                <img
                  src={IcArrowLeft}
                  alt="Arrow Right"
                  className="w-[30px] m-5"
                />
              </button>
            }
          >
            <Column
              field="peringkat"
              header="Peringkat"
              alignHeader="center"
              headerClassName={`${
                memberMerah ? "bg-red" : "bg-blue"
              } text-white text-[30px] px-5 ${isLandscape ? "" : "py-5"}`}
              bodyStyle={{
                fontSize: "24px",
                borderBottom: "1px solid #000",
                textAlign: "center",
                width: "120px",
                padding: `${isLandscape ? "" : "15px 0px 15px 0px"}`,
              }}
              bodyClassName={(rowData) =>
                rowData.TSD_RANK === userRank ? "bg-yellow" : null
              }
              body={(rowData) => (
                <span>
                  {rowData.TSD_RANK !== undefined ? rowData.TSD_RANK : "-"}
                </span>
              )}
            ></Column>
            <Column
              field="cabang"
              header="Cabang"
              alignHeader="center"
              headerClassName={`${
                memberMerah ? "bg-red" : "bg-blue"
              } text-white text-[30px] px-5`}
              bodyClassName={(rowData) =>
                rowData.TSD_RANK === userRank ? "bg-yellow" : null
              }
              bodyStyle={{
                fontSize: "24px",
                borderBottom: "1px solid #000",
                textAlign: "left",
                width: "120px",
              }}
              body={(rowData) => (
                <span>
                  {rowData.TSD_CABANG !== undefined ? rowData.TSD_CABANG : "-"}
                </span>
              )}
            ></Column>
            <Column
              field="kodeMember"
              header="Kode Member"
              alignHeader="center"
              headerClassName={`${
                memberMerah ? "bg-red" : "bg-blue"
              } text-white text-[30px] px-5 `}
              bodyClassName={(rowData) =>
                rowData.TSD_RANK === userRank ? "bg-yellow" : null
              }
              bodyStyle={{
                fontSize: "24px",
                borderBottom: "1px solid #000",
                textAlign: "left",
                width: "260px",
              }}
              body={(rowData) => (
                <span>
                  {rowData.TSD_KODEMEMBER !== undefined
                    ? rowData.TSD_KODEMEMBER
                    : "-"}
                </span>
              )}
            ></Column>
            <Column
              field="namaMember"
              header="Nama Member"
              alignHeader="center"
              headerClassName={`${
                memberMerah ? "bg-red" : "bg-blue"
              } text-white text-[30px] px-5 `}
              bodyClassName={(rowData) =>
                rowData.TSD_RANK === userRank ? "bg-yellow" : null
              }
              bodyStyle={{
                fontSize: "24px",
                borderBottom: "1px solid #000",
                textAlign: "left",
                width: "600px",
              }}
              body={(rowData) => (
                <span>
                  {rowData.TSD_NAMAMEMBER !== undefined
                    ? ambilLimaKataPertama(rowData.TSD_NAMAMEMBER)
                    : "-"}
                </span>
              )}
            ></Column>
            <Column
              field="pencapaian"
              header="Pencapaian(Rp)"
              alignHeader="center"
              headerClassName={`${
                memberMerah ? "bg-red" : "bg-blue"
              } text-white text-[30px] px-5 w-[300px]`}
              bodyClassName={(rowData) =>
                rowData.TSD_RANK === userRank ? "bg-yellow" : null
              }
              bodyStyle={{
                fontSize: "24px",
                borderBottom: "1px solid #000",
                textAlign: "right",
                width: "300px",
                padding: "0px 0px 0px 0px",
              }}
              body={(rowData) => (
                <span>
                  {rowData.TSD_TOTALAMT !== undefined
                    ? formattedNumber(rowData.TSD_TOTALAMT)
                    : "-"}
                </span>
              )}
            ></Column>
            <Column
              field="hadiah"
              header="Hadiah"
              alignHeader="center"
              headerClassName={`${
                memberMerah ? "bg-red" : "bg-blue"
              } text-white text-[30px]`}
              bodyClassName={(rowData) =>
                rowData.TSD_RANK === userRank ? "bg-yellow" : null
              }
              bodyStyle={{
                fontSize: "24px",
                borderBottom: "1px solid #000",
                textAlign: "left",
                paddingLeft: "20px",
              }}
              body={(rowData) => (
                <span>
                  {rowData.TSD_TOTALAMT !== undefined ? rowData.TSHD_GIFT : "-"}
                </span>
              )}
            ></Column>
          </DataTable>
        </div>

        {isLandscape ? (
          <div className="flex flex-row justify-between gap-5 mt-auto">
            <div
              className={`flex flex-col w-[100%] ${
                memberMerah ? "bg-red" : "bg-blue"
              } bg-stroke-white rounded-xl p-3 justify-center`}
            >
              <p className="text-center text-white text-subText">
                * Peringkat Yang Ditampilkan Adalah Sementara Hingga Periode
                Promosi Berakhir
              </p>
            </div>

            <div className="self-end">
              <StandardBtn title="Kembali" path="/topSpender" />
            </div>
          </div>
        ) : (
          <>
            <div
              className={`flex flex-col w-[100%] ${
                memberMerah ? "bg-red" : "bg-blue"
              } bg-stroke-white rounded-xl p-3 justify-center mt-5`}
            >
              <p className="text-center text-white text-subText">
                * Peringkat Yang Ditampilkan Adalah Sementara Hingga Periode
                Promosi Berakhir
              </p>
            </div>

            <div className="self-end mt-auto">
              <StandardBtn title="Kembali" path="/topSpender" />
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default TableTopSpender;
