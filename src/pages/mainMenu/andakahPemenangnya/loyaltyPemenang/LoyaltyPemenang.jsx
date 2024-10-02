import React, { useEffect, useState } from "react";
import {
  BgLogin as Bg,
  LogoIGR,
  IcArrowRight,
  IcArrowLeft,
  IcInfo,
} from "../../../../assets";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import StandardBtn from "../../../../components/StandardBtn";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Loader from "../../../../components/Loader";
import Modal from "../../../../components/Modal";
import { STAR_KEY, URL_GATEWAY } from "../../../../config";
import { useNavigate } from "react-router-dom";
import { toggleMemberMerah } from "../../../../services/redux/memberReducer";
// import "./tableTopSpender.css";

const dataTable = [
  { no: "1", hadiah: "1", program: "IDM", periodeProgram: "-" },
  { no: "2", hadiah: "2", program: "IDM", periodeProgram: "-" },
  { no: "3", hadiah: "3", program: "IDM", periodeProgram: "-" },
  { no: "4", hadiah: "4", program: "IDM", periodeProgram: "-" },
  { no: "5", hadiah: "5", program: "IDM", periodeProgram: "-" },
  { no: "6", hadiah: "6", program: "IDM", periodeProgram: "-" },
  { no: "7", hadiah: "7", program: "IDM", periodeProgram: "-" },
  { no: "8", hadiah: "Indonesia", program: "IDM", periodeProgram: "-" },
  { no: "9", hadiah: "Indonesia", program: "IDM", periodeProgram: "-" },
  {
    no: "10",
    hadiah: "Indonesia",
    program: "IDM",
    periodeProgram: "-",
  },
];

function LoyaltyPemenang() {
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const [first, setFirst] = useState(0); // State untuk mengatur indeks awal data yang ditampilkan
  const [openModal, setOpenModal] = useState(false);
  const rowsPerPage = 10;
  const onPageChange = (event) => {
    setFirst(event.first); // Mengatur indeks awal data yang ditampilkan saat halaman berubah
  };

  const handleNext = () => {
    setFirst((prevFirst) => prevFirst + rowsPerPage);
  };

  const handlePrev = () => {
    setFirst((prevFirst) => Math.max(prevFirst - rowsPerPage, 0));
  };

  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const userDt = useSelector((state) => state.glUser.dtUser);
  const [dtLoyaltyPemenang, setDtLoyaltyPemenang] = useState(null);
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const [loading, setLoading] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleNavigate = () => {
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

    const getLoyaltyInfo = async () => {
      setLoading(true);
      await axios
        .get(
          `${URL_GATEWAY}/serviceStar/getInfoLoyaltyPemenang?memberId=${userDt["memberID"]}`,
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
              "x-api-key": STAR_KEY,
            },
          }
        )
        .then((response) => {
          console.log("Data Get Loyalty Info: ", response);
          if (response["data"]["dtLoyaltyPemenang"]) {
            setDtLoyaltyPemenang(response["data"]["dtLoyaltyPemenang"]);
            setLoading(false);
          } else {
            setDtLoyaltyPemenang(false);
            setLoading(false);
          }
        })
        .catch(function (error) {
          console.log(error.message);
          setLoading(false);
        });
    };

    getLoyaltyInfo();

    return () => {
      window.removeEventListener("click", handleTouch);
      window.removeEventListener("resize", updateOrientation);
      clearTimeout(newTimeoutId);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capitalizeFirstWord = (text) => {
    const words = text.split(" "); // Pisahkan kata-kata dengan spasi
    const firstWord = words[0]; // Ambil kata pertama
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  };

  return (
    <>
      <Loader loading={loading} merah={memberMerah} />
      <Modal
        open={openModal}
        customWidth={isLandscape ? 75 : 80}
        onClose={() => setOpenModal(false)}
        landscape={isLandscape}
      >
        <div
          className={`flex flex-col ${
            isLandscape ? "p-16" : "p-10"
          }  bg-red rounded-xl`}
        >
          <ul className="text-white text-text">
            <li>1. Hubungi member service untuk pengambilan hadiah di atas</li>
            <li>2. Pengambilan hadiah harus melampirkan KTP pemenang</li>
            <li>3. Warna hadiah sesuai dengan persediaan yang ada</li>
          </ul>
        </div>
      </Modal>
      <div
        style={{
          // backgroundImage: `url(${Bg})`,
          height: `${isLandscape ? "1080px" : "1920px"}`,
          width: `${isLandscape ? "1920px" : "1080px"}`,
        }}
        className={`flex flex-col p-5 ${memberMerah ? "bg-red5" : "bg-blue4"}`}
      >
        {isLandscape ? (
          <div className="flex flex-row items-center gap-5 mb-auto">
            <img
              src={LogoIGR}
              alt="Logo IGR"
              className="drop-shadow-lg rounded mb-10 w-[544px] h-[186px]"
            />
            <p className="font-bold text-white text-title ">
              Informasi Perolehan Hadiah
            </p>
          </div>
        ) : (
          <>
            <img
              src={LogoIGR}
              alt="Logo IGR"
              className="drop-shadow-lg rounded w-[544px] h-[186px] self-center mt-20 "
            />

            <p className="mt-5 mb-32 font-bold text-center text-white text-title">
              Informasi Perolehan Hadiah
            </p>
          </>
        )}
        <div
          className={`flex flex-col justify-center p-5 pb-0 ${
            isLandscape ? "mt-auto" : ""
          } bg-white shadow-xl rounded-xl`}
        >
          {/* <p className="mb-5 font-bold text-black text-subText">
            {userDt["memberGender"] === "1"
              ? "Bapak"
              : userDt["memberGender"] === "2"
              ? "Ibu"
              : userDt["memberGender"] === "0"
              ? "Bapak/Ibu"
              : "Bapak/Ibu"}{" "}
            {capitalizeFirstWord(userDt["memberName"])}
          </p> */}
          <p className="mb-5 font-bold text-center text-black text-title">
            Tabel Perolehan Hadiah
          </p>
          <DataTable
            value={
              dtLoyaltyPemenang?.length > 0 ? dtLoyaltyPemenang : dataTable
            }
            paginator
            paginatorClassName="custom-paginator"
            rows={rowsPerPage}
            first={first}
            onPage={onPageChange}
            tableStyle={{ width: `${isLandscape ? "100%" : "190%"}` }}
            paginatorTemplate="RowsPerPageDropdown CurrentPageReport"
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
            paginatorRight={
              <button
                className="custom-paginator-button"
                onClick={handleNext}
                disabled={
                  dtLoyaltyPemenang?.length > 0
                    ? first + rowsPerPage >= dtLoyaltyPemenang?.length
                    : first + rowsPerPage >= dataTable?.length
                }
              >
                <img
                  src={IcArrowRight}
                  alt="Arrow Right"
                  className="w-[30px]  m-5"
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
              field="no"
              header="No"
              headerClassName={`${
                memberMerah ? "bg-red" : "bg-blue"
              } text-white text-[30px] text-center px-5`}
              alignHeader="center"
              bodyStyle={{
                fontSize: "24px",
                borderBottom: "2px solid #000",
                paddingLeft: "5px",
                padding: `${isLandscape ? "" : "15px 0px 15px 0px"}`,
                textAlign: "center",
              }}
              body={(rowData) => (
                <span>{rowData.NO !== undefined ? rowData.NO : "-"}</span>
              )}
            ></Column>
            <Column
              field="hadiah"
              header="Hadiah"
              headerClassName={`${
                memberMerah ? "bg-red" : "bg-blue"
              } text-white text-[30px] text-center px-5`}
              alignHeader="center"
              bodyStyle={{
                fontSize: "24px",
                borderBottom: "2px solid #000",
                paddingLeft: "5px",
                padding: "2px",
                textAlign: "center",
              }}
              body={(rowData) => (
                <span>
                  {rowData.LYT_NAMAHADIAH !== undefined
                    ? rowData.LYT_NAMAHADIAH
                    : "-"}
                </span>
              )}
            ></Column>
            <Column
              field="program"
              header="Program"
              headerClassName={`${
                memberMerah ? "bg-red" : "bg-blue"
              } text-white text-[30px] text-center px-5`}
              alignHeader="center"
              bodyStyle={{
                fontSize: "24px",
                borderBottom: "2px solid #000",
                paddingLeft: "5px",
                padding: "2px",
                textAlign: "center",
              }}
              body={(rowData) => (
                <span>
                  {rowData.LYT_NAMAPROMO !== undefined
                    ? rowData.LYT_NAMAPROMO
                    : "-"}
                </span>
              )}
            ></Column>
            <Column
              field="periodeProgram"
              header="Periode Program"
              headerClassName={`${
                memberMerah ? "bg-red" : "bg-blue"
              } text-white text-[30px] text-center px-5`}
              alignHeader="center"
              bodyStyle={{
                fontSize: "24px",
                borderBottom: "2px solid #000",
                paddingLeft: "5px",
                padding: "2px",
                textAlign: "center",
              }}
              body={(rowData) => (
                <span>
                  {rowData.PERIODE !== undefined ? rowData.PERIODE : "-"}
                </span>
              )}
            ></Column>
          </DataTable>
        </div>

        <div className="flex flex-row self-end gap-5 mt-auto">
          <button
            onClick={() => setOpenModal(true)}
            className={` w-[299px] h-[96px] text-subText rounded-xl bg-stroke-white flex flex-row items-center justify-center gap-4 ${
              memberMerah
                ? "transform transition duration-200 active:scale-90 bg-gradient-to-t from-red to-red3"
                : "transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3"
            }
          p-3 font-bold text-white active:bg-gray-100 `}
          >
            <img src={IcInfo} alt="Button" className="w-[50px]" />
            Info
          </button>
          <StandardBtn title="Kembali" path="/mainMenu" />
        </div>
      </div>
    </>
  );
}

export default LoyaltyPemenang;
