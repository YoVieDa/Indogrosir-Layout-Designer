import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  KartuMM,
  KartuMB,
  LogoIGR,
  BgMM2,
  BgMB2,
  NoImageLandscape,
} from "../../../../assets";
import StandardBtn from "../../../../components/StandardBtn";
import DataEmpty from "../../../../components/DataEmpty";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import axios from "axios";
import Loader from "../../../../components/Loader";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { POIN_KEY, URL_GATEWAY } from "../../../../config";
import { useNavigate } from "react-router-dom";
import { toggleMemberMerah } from "../../../../services/redux/memberReducer";

const dataDummy = [
  {
    title: "Informasi Saldo Poin IGR",
  },
  {
    title: "Promo Penukaran Poin IGR",
  },
];

const dataTable = [{ Tanggal: "-" }, { Tanggal: "-" }, { Tanggal: "-" }];

function ProgramSkorIGR() {
  const dispatch = useDispatch();
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const [loading, setLoading] = useState(false);
  const [pictureArr, setPictureArr] = useState([]);
  let dtPic = [];
  const [dtScore, setDtScore] = useState(null);
  const [dtHistory, setDtHistory] = useState(null);
  const userDt = useSelector((state) => state.glUser.dtUser);
  const dtGlInfoSkor = useSelector((state) => state.glInfoSkor.dtInfoSkor);
  const [isLandscape, setIsLandscape] = useState(false);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const navigate = useNavigate();

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

    const getLoadHadiahSkor = async () => {
      setLoading(true);
      await axios
        .get(
          `${URL_GATEWAY}/servicePoin/getHadiahSkor?memberId=${userDt["memberID"]}&kodeScore=${dtGlInfoSkor["dtInfoSkorForGl"]["sk_kodescore"]}`,
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
          console.log("dtHadiahSkor: ", response);
          if (response["data"]["dtCheck"]) {
            // for (let i = 0; i < response["data"]["dtCheck"][0].length; i++) {
            //   dtPic.push(response["data"]["dtCheck"][0][i]["SH_IMAGE"]);
            // }

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

            setDtHistory(response["data"]["dtHistory"]);
            setDtScore(response["data"]["dtScore"][0]["totalscore"]);
            console.log(response["data"]["dtScore"][0]["totalscore"]);

            setLoading(false);
          } else {
            setLoading(false);
          }
        })
        .catch(function (error) {
          setLoading(false);
          console.log(error.message);
        });
    };

    getLoadHadiahSkor();

    return () => {
      window.removeEventListener("click", handleTouch);
      clearTimeout(newTimeoutId);
      window.removeEventListener("resize", updateOrientation);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bgImage = memberMerah ? BgMM2 : BgMB2;
  return (
    <>
      <div
        style={{
          // backgroundImage: `url(${bgImage})`,
          height: `${isLandscape ? "1080px" : "1920px"}`,
          width: `${isLandscape ? "1920px" : "1080px"}`,
        }}
        className={`flex flex-col p-5 ${memberMerah ? "bg-red5" : "bg-blue4"}`}
      >
        {isLandscape ? (
          <div className="flex flex-row items-center">
            <img
              src={LogoIGR}
              alt="Logo IGR"
              className="drop-shadow-lg rounded w-[387px] h-[132px] mr-auto"
            />

            <p className="absolute mx-auto font-bold text-white transform -translate-x-1/2 left-1/2 text-title">
              Saldo Perolehan Skor
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
              className="drop-shadow-lg w-[140px] h-[90px] ml-auto"
            />
            <img
              src={LogoIGR}
              alt="Logo IGR"
              className="drop-shadow-lg rounded w-[544px] h-[186px] self-center"
            />

            <p className="mt-5 mb-32 font-bold text-center text-white text-title">
              Saldo Perolehan Skor
            </p>
          </>
        )}

        {isLandscape ? (
          <div className="flex flex-row justify-center gap-1 mt-5 mb-10">
            <div className="flex flex-row gap-1 p-5 bg-red rounded-xl ">
              <p className="font-bold text-black text-white text-subText">
                Event:{" "}
              </p>
              <p className="text-black text-white text-subText">
                {dtGlInfoSkor["dtInfoSkorForGl"]["sk_namascore"]}
              </p>
            </div>

            <div className="flex flex-row gap-1 p-5 bg-red rounded-xl">
              <p className="font-bold text-black text-white text-subText">
                Member:{" "}
              </p>
              <p className="text-black text-white text-subText">
                {userDt["memberID"]}
              </p>
            </div>
            <div className="flex flex-row gap-1 p-5 bg-red rounded-xl">
              <p className="font-bold text-black text-white text-subText">
                Periode:{" "}
              </p>
              <p className="text-black text-white text-subText">
                {dtGlInfoSkor["dtInfoSkorForGl"]["gfh_tglawal"]} s/d{" "}
                {dtGlInfoSkor["dtInfoSkorForGl"]["gfh_tglakhir"]}
              </p>
            </div>
            <div className="flex flex-row gap-1 p-5 bg-red rounded-xl">
              <p className="font-bold text-black text-white text-subText">
                Skor:{" "}
              </p>
              <p className="text-black text-white text-subText">
                {dtScore ? dtScore : "-"}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-row justify-center gap-1 mb-5">
              <div className="flex flex-row gap-1 p-5 bg-red rounded-xl ">
                <p className="font-bold text-black text-white text-subText">
                  Event:{" "}
                </p>
                <p className="text-black text-white text-subText">
                  {dtGlInfoSkor["dtInfoSkorForGl"]["sk_namascore"]}
                </p>
              </div>

              <div className="flex flex-row gap-1 p-5 bg-red rounded-xl">
                <p className="font-bold text-black text-white text-subText">
                  Member:{" "}
                </p>
                <p className="text-black text-white text-subText">
                  {userDt["memberID"]}
                </p>
              </div>
              <div className="flex flex-row gap-1 p-5 bg-red rounded-xl">
                <p className="font-bold text-black text-white text-subText">
                  Skor:{" "}
                </p>
                <p className="text-black text-white text-subText">
                  {dtScore ? dtScore : "-"}
                </p>
              </div>
            </div>
            <div className="flex flex-row justify-center gap-1 mb-10">
              <div className="flex flex-row gap-1 p-5 bg-red rounded-xl">
                <p className="font-bold text-black text-white text-subText">
                  Periode:{" "}
                </p>
                <p className="text-black text-white text-subText">
                  {dtGlInfoSkor["dtInfoSkorForGl"]["gfh_tglawal"]} s/d{" "}
                  {dtGlInfoSkor["dtInfoSkorForGl"]["gfh_tglakhir"]}
                </p>
              </div>
            </div>
          </>
        )}

        {pictureArr.length > 0 ? (
          <div
            className={` ${
              isLandscape ? "max-w-[75%]" : "max-w-[98%]"
            } mx-auto`}
          >
            <Swiper
              slidesPerView={
                pictureArr.length === 2 && isLandscape
                  ? 2
                  : pictureArr.length === 2 && !isLandscape
                  ? 1.5
                  : pictureArr.length === 1
                  ? 1
                  : pictureArr.length > 2 && isLandscape
                  ? 2
                  : 1.5
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
              //className={`max-w-[${pictureArr.length === 2 ? "75%" : "70%"}]`}
            >
              {pictureArr.map((item, itemIndex) => (
                <SwiperSlide className="max-w-[661.56px]">
                  <div
                    key={itemIndex}
                    className={`flex flex-col h-[300px] justify-center mb-10 group relative shadow-lg bg-stroke bg-red text-white rounded-xl overflow-hidden cursor-pointer`}
                  >
                    <img
                      src={item !== "" ? item : NoImageLandscape}
                      alt="Gambar Loyalty IGR"
                      className="object-fill w-full h-full"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : loading ? (
          <div className="mx-auto my-auto">
            <Loader loading={loading} merah={memberMerah} nobg={true} />
          </div>
        ) : (
          <DataEmpty title={"Tidak Ada Hadiah Skor"} width={"30%"} />
        )}

        <DataTable
          value={dtHistory?.length > 0 ? dtHistory : dataTable}
          tableStyle={{
            width: `${isLandscape ? "40%" : "70%"}`,
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: `${isLandscape ? "20px" : "50px"}`,
          }}
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
        >
          <Column
            header="Periode"
            // headerClassName="custom-header"
            headerClassName={`${
              memberMerah ? "bg-red" : "bg-blue"
            } text-white text-[30px] text-center px-5`}
            alignHeader="center"
            bodyStyle={{
              color: "#fff",
              fontSize: "24px",
              borderBottom: "2px solid #fff",
              paddingLeft: "5px",
              padding: "5px",
              textAlign: "center",
            }}
            body={(rowData) => (
              <span>
                {rowData.periode !== undefined ? rowData.periode : "-"}
              </span>
            )}
          ></Column>
          <Column
            header="Jumlah Skor Anda"
            headerClassName={`${
              memberMerah ? "bg-red" : "bg-blue"
            } text-white text-[30px] text-center px-5`}
            alignHeader="center"
            bodyStyle={{
              color: "#fff",
              fontSize: "24px",
              borderBottom: "2px solid #fff",
              paddingLeft: "5px",
              padding: "5px",
              textAlign: "center",
            }}
            body={(rowData) => (
              <span>
                {rowData.jmlh_hadiah !== undefined ? rowData.jmlh_hadiah : "-"}
              </span>
            )}
          ></Column>
        </DataTable>
        <div className="self-end mt-auto">
          <StandardBtn title="Kembali" path="/programSkorIGR" />
        </div>
      </div>
    </>
  );
}

export default ProgramSkorIGR;
