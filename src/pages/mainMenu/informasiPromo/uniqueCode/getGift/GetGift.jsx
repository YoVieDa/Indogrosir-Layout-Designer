import React, { useEffect, useState } from "react";
import {
  LogoIGR,
  BgMB2,
  BgMM2,
  KartuMB,
  KartuMM,
  IcPrint,
  IcWarn,
  NoImage,
  NoImageLandscape,
} from "../../../../../assets";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import StandardBtn from "../../../../../components/StandardBtn";
import axios from "axios";
import DataEmpty from "../../../../../components/DataEmpty";
import Loader from "../../../../../components/Loader";
import { useSelector } from "react-redux";
import { DataTable } from "primereact/datatable";
import ModalAlert from "../../../../../components/ModalAlert";
import { INFO_PROMO_KEY, passToChar, URL_GATEWAY } from "../../../../../config";

const { ipcRenderer } = window.require("electron");

function GetGift() {
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const userDt = useSelector((state) => state.glUser.dtUser);
  const giftDt = useSelector((state) => state.glDtGift.dtGift);
  const [openModalAlert, setOpenModalAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const [loading, setLoading] = useState(false);
  const [pictureArr, setPictureArr] = useState([]);
  const [dtInfoGift, setDtInfoGift] = useState(null);
  const [dtKpr, setDtKpr] = useState(null);
  let dtPic = [];

  const dataDummy = [
    {
      img: "/images/product-1.jpg",
    },
    {
      img: "/images/product-1.jpg",
    },
    {
      img: "/images/product-1.jpg",
    },
    {
      img: "/images/product-1.jpg",
    },
    {
      img: "/images/product-1.jpg",
    },
    {
      img: "/images/product-1.jpg",
    },
  ];

  const handleBtnLoadGambar = async (KPR) => {
    setLoading(true);
    await axios
      .get(`${URL_GATEWAY}/serviceInfoPromo/getPicGift?KPR=${KPR}`, {
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
          "X-api-key": INFO_PROMO_KEY,
        },
      })
      .then((response) => {
        if (response["data"]["dtCheck"][0].length > 0) {
          // dtPic.push(response["data"]["dtCheck"][0][0]["GPO_PICTURE"]);

          // let base64Image = [];

          // for (let i = 0; i < dtPic.length; i++) {
          //   // eslint-disable-next-line react-hooks/exhaustive-deps
          //   base64Image.push(
          //     `data:image/jpeg;base64,${Buffer.from(dtPic[i]).toString(
          //       "base64"
          //     )}`
          //   );
          // }

          // setBase64ImageArr(base64Image);
          // console.log("base64Image: ", base64Image);

          setPictureArr(response["data"]["picArr"]);
          setDtKpr(KPR);

          setDtInfoGift(response["data"]["dtCheck"][0][0]);
          console.log("dtLoyaltyInfo: ", dtInfoGift);
          setLoading(false);
        }
      })
      .catch(function (error) {
        console.log(error.message);
        setLoading(false);
      });
  };

  const handleCetakGift = async () => {
    setLoading(true);
    await axios
      .get(
        `${URL_GATEWAY}/serviceInfoPromo/getPrintGift?memberId=${userDt["memberID"]}&textBarcode=${dtKpr}`,
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
            "X-api-key": INFO_PROMO_KEY,
          },
        }
      )
      .then((response) => {
        console.log(response);

        let tempBranch = response["data"]["tempBranch"];
        let rCS = response["data"]["rCS"];

        const data = [
          {
            type: "text",
            value: tempBranch,
            style: {
              textAlign: "center",
              fontFamily: "Arial",
              fontSize: "10pt",
              color: "black",
            },
          },
          {
            type: "text",
            value: `No Member : ${userDt["memberID"]}`,
            style: {
              textAlign: "center",
              fontFamily: "Arial",
              fontSize: "10pt",
              color: "black",
            },
          },
          {
            type: "text",
            value: `Tanggal Cetak : ${new Date().toLocaleDateString("id-ID")}`,
            style: {
              textAlign: "center",
              fontFamily: "Arial",
              fontSize: "10pt",
              color: "black",
            },
          },
          {
            type: "barCode",
            value: rCS,
            width: 3,
            height: 50,
            displayValue: true,
          },
          {
            type: "text",
            value: rCS,
            style: {
              textAlign: "center",
              fontFamily: "Arial",
              fontSize: "10pt",
              color: "black",
            },
          },
          {
            type: "text",
            value: "",
            style: {
              fontFamily: "Arial",
              fontSize: "10pt",
              color: "black",
            },
          },
          {
            type: "text",
            value: "Voucher Hanya Bisa Dipakai",
            style: {
              textAlign: "center",
              fontFamily: "Arial",
              fontSize: "10pt",
              color: "black",
            },
          },
          {
            type: "text",
            value: "Sesuai Tanggal Cetak",
            style: {
              textAlign: "center",
              fontFamily: "Arial",
              fontSize: "10pt",
              color: "black",
            },
          },
        ];

        const dtToPrint = {
          dataReceipt: JSON.stringify(data),
          printerName:
            glRegistryDt["glRegistryDt"]["registryPrnName"] !== null &&
            glRegistryDt["glRegistryDt"]["registryPrnName"] !== undefined
              ? passToChar(glRegistryDt["glRegistryDt"]["registry"]).trim()
              : "eKioskPrinter",
        };

        ipcRenderer.send("print_receipt", dtToPrint);
        setLoading(false);
      })
      .catch(function (error) {
        console.log(error.message);
        setOpenModalAlert(true);
        setAlertMsg(error.response["data"]["status"]);
        setLoading(false);
      });
  };

  const bgImage = memberMerah ? BgMM2 : BgMB2;
  return (
    <>
      <ModalAlert
        open={openModalAlert}
        onClose={() => setOpenModalAlert(false)}
      >
        <div className="text-center">
          <img src={IcWarn} alt="Warn" className="mx-auto" />
          <div className="mx-auto my-4">
            <h3 className="font-black text-gray-800 text-text">Warning</h3>
            <p className="text-lg text-gray-500">{alertMsg}</p>
          </div>

          {/* <div className="flex gap-4">
            <button className="w-full btn btn-light" onClick={refreshApp}>
              Refresh
            </button>
          </div> */}
        </div>
      </ModalAlert>
      <div
        style={{
          width: "1920px",
          height: "1080px",
        }}
        className={`flex flex-col p-5 ${memberMerah ? "bg-red5" : "bg-blue4"}`}
      >
        <div className="flex flex-row items-center mb-10">
          <img
            src={LogoIGR}
            alt="Logo IGR"
            className="drop-shadow-lg rounded w-[387px] h-[132px] mr-auto"
          />

          <p className="absolute mx-auto font-bold text-white transform -translate-x-1/2 left-1/2 text-title">
            Hadiah Langsung
          </p>

          <img
            src={memberMerah ? KartuMM : KartuMB}
            alt="Kartu Member"
            className="drop-shadow-lg w-[238px] h-[158px] ml-auto"
          />
        </div>
        {loading ? (
          <div className="mx-auto my-auto">
            <Loader loading={loading} merah={memberMerah} nobg={true} />
          </div>
        ) : (
          <>
            <div className="flex flex-col h-[500px] w-[50%] mb-1 self-center group relative shadow-lg bg-stroke-white bg-white text-white rounded-xl overflow-hidden cursor-pointer">
              <img
                src={pictureArr[0] !== "" ? pictureArr[0] : NoImageLandscape}
                alt="Gambar Gift"
                className="object-fill w-full h-full"
              />
            </div>
            <div
              className={`${
                memberMerah ? "bg-red" : "bg-blue"
              } rounded-xl w-[50%] mx-5 p-2 mb-10 self-center bg-stroke-white`}
            >
              <p className="text-[24px] text-center text-white font-semibold">
                {dtKpr ? dtKpr : "-"}
              </p>
              <p className="text-[24px] text-center  text-white font-semibold">
                {dtInfoGift ? dtInfoGift["mekanisme"] : "-"}
              </p>
            </div>
          </>
        )}

        {/* Button */}
        {dtInfoGift ? (
          <div className="max-w-[75%] mx-auto">
            <Swiper
              slidesPerView={
                dtInfoGift.length === 2 ? 2 : dtInfoGift.length === 1 ? 1 : 4
              }
              spaceBetween={15}
              centerInsufficientSlides={true}
              pagination={{
                clickable: true,
                renderBullet: (index, className) => {
                  return `<span class="${className} inline-block w-6 h-6 leading-6 text-center bg-gray-200 rounded-full font-semibold text-black mx-1 hover:bg-gray-400 cursor-pointer">${
                    index + 1
                  }</span>`;
                },
              }}
              modules={[Pagination]}
              // className={`max-w-[${dtInfoGift.length === 2 ? "70%" : "70%"}]`}
            >
              {dtInfoGift.map((item, itemIndex) => (
                <SwiperSlide className="max-w-[648.5px]">
                  <button
                    onClick={() =>
                      handleBtnLoadGambar(
                        giftDt[itemIndex]["gfh_kodepromosi"].slice(0, 5)
                      )
                    }
                    className={`w-[100%] h-[96px] rounded-xl bg-stroke-white mb-14 ${
                      memberMerah
                        ? "transform transition duration-200 active:scale-90 bg-gradient-to-t from-red to-red3"
                        : "transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3"
                    } p-3 text-subText font-bold text-white active:bg-gray-100`}
                  >
                    <p className="text-[24px] font-semibold text-center">
                      {giftDt[itemIndex]["gfh_kodepromosi"]}
                    </p>
                    <p className=" text-[20px] font-semibold text-center">
                      {giftDt[itemIndex]["gfh_namapromosi"]}
                    </p>
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : null}

        <div className="flex flex-row self-end gap-5 mt-auto">
          <button
            onClick={() => handleCetakGift()}
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
          <div className="self-end ml-auto">
            <StandardBtn title="Kembali" path="/getPromo" />
          </div>
        </div>
      </div>
    </>
  );
}

export default GetGift;
