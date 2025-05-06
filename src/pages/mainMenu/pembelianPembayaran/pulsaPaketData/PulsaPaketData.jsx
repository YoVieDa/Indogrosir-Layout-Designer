import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BgLogin as Bg,
  BgLoginPotrait as BgPotrait,
  LogoIGR,
} from "../../../../assets";
import StandardBtn from "../../../../components/StandardBtn";
import { useSelector, useDispatch } from "react-redux";
import {
  setGlDtData,
  setGlDtPulsa,
  setGlImgProvider,
  setGlProviderName,
} from "../../../../services/redux/pulsaReducer";
import Loader from "../../../../components/Loader";
import axios from "axios";
import { AESEncrypt, PAYMENT_KEY, URL_GATEWAY } from "../../../../config";
import { toggleMemberMerah } from "../../../../services/redux/memberReducer";

function PulsaPaketData() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const [loading, setLoading] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const glIpModul = useSelector((state) => state.glDtIp.dtIp);
  const glStationModul = useSelector((state) => state.glUser.stationModul);
  const userDt = useSelector((state) => state.glUser.dtUser);

  const handleNavigate = async () => {
    setLoading(true);

    if (memberMerah) {
      setLoading(false);
      navigate("/");
    } else {
      setLoading(false);
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

    return () => {
      window.removeEventListener("click", handleTouch);
      clearTimeout(newTimeoutId);
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

  const handleLanjutBtn = async () => {
    // Validasi jika input kosong
    if (input.trim() === "") {
      setError("No Handphone tidak boleh kosong");
    } else if (
      input.trim().length !== 11 &&
      input.trim().length !== 12 &&
      input.trim().length !== 13
    ) {
      setError(
        "No Handphone anda tidak lengkap, Silahkan masukkan kembali No Handphone anda"
      );
    } else {
      setError(""); // Reset pesan kesalahan jika input valid

      setLoading(true);
      try {
        // Get Loyalty Index
        await axios
          .get(
            `${URL_GATEWAY}/servicePayment/getLoadPulsa?kodeIGR=${glRegistryDt["glRegistryDt"]["registryOraIGR"]}&phoneNum=${input}`,
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
            console.log(response["data"]["imgPulsa"]);

            const dtPulsa = response["data"]["pulsaDt"];
            const dtPaketData = response["data"]["paketDt"];
            const imgProvider = response["data"]["imgPulsa"];
            const providerName = response["data"]["providerName"];
            const noHp = input;

            // dispatch(setGlDtPulsa(response["data"]["pulsaDt"]));
            // dispatch(setGlDtData(response["data"]["paketDt"]));
            // dispatch(setGlImgProvider(response["data"]["imgPulsa"]));
            // dispatch(setGlProviderName(response["data"]["providerName"]));

            setLoading(false);
            navigate("/pilihPaket", {
              state: { dtPulsa, dtPaketData, imgProvider, providerName, noHp },
            });
          })
          .catch(function (error) {
            console.log(error["response"]["data"]["status"]);
            setLoading(false);
          });
      } catch (error) {
        console.log(error.message);
        setLoading(false);
      }
    }
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
                }  rounded border bg-stroke  shadow-lg transform transition duration-200 active:scale-90 bg-gradient-to-t from-gray-200 to-white`}
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

  return (
    <>
      <Loader loading={loading} merah={memberMerah} />
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
          className={`drop-shadow-lg rounded w-[544px] h-[186px] self-center mb-5 ${
            isLandscape ? "" : "mt-40"
          }`}
        />
        <p className="font-bold text-center text-black text-subTitle">
          Masukkan Nomor Handphone Anda
        </p>

        <div className="flex flex-col h-[100%] items-center justify-center ">
          <input
            value={input}
            type="number"
            placeholder="No Handphone"
            onChange={handleChange}
            className={`border bg-stroke p-5 rounded-xl ${
              isLandscape ? "w-[50%]" : "w-[70%]"
            }  self-center text-subText`}
          />
          {error && <p className="text-red text-left w-[50%]">{error}</p>}

          <div className="mt-10">
            <NumericKeyboard />
          </div>
        </div>

        <div
          className={`flex flex-row self-center items-center gap-5 ${
            isLandscape ? "w-[50%]" : "w-[80%]"
          } h-[50%]`}
        >
          <button
            onClick={handleLanjutBtn}
            className={`w-[50%] h-[96px] rounded-xl bg-stroke-white bg-blue p-3 text-subText font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3`}
          >
            Lanjut
          </button>

          <StandardBtn
            title="Kembali"
            path="/pembelianPembayaranMenu"
            width="50%"
          />
        </div>
      </div>
    </>
  );
}

export default PulsaPaketData;
