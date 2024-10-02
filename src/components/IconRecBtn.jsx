import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "./Loader";
import ModalAlert from "./ModalAlert";
import { IcErr } from "../assets";
import { setGlGift } from "../services/redux/giftReducer";
import { setGlCashBack } from "../services/redux/cashbackReducer";
import { URL_GATEWAY, INFO_PROMO_KEY } from "../config.js";

function IconRecBtn({ label, icon, memberMerah, landscape }) {
  const userDt = useSelector((state) => state.glUser.dtUser);
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [openModalAlert, setOpenModalAlert] = useState(false);
  const dispatch = useDispatch();

  const handleNavigateHadiahLangsung = async () => {
    setLoading(true);
    await axios
      .get(
        `${URL_GATEWAY}/serviceInfoPromo/getLoadGift?memberId=${userDt["memberID"]}&memberFlag=${userDt["memberFlag"]}`,
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
        if (response["data"]["dtCountAll"][0].length > 0) {
          let dtGift = response["data"]["dtCountAll"][0];
          dispatch(
            setGlGift({
              dtGift,
            })
          );
          navigate("/getGift");
          setLoading(false);
        } else {
          setOpenModalAlert(true);

          setLoading(false);
        }
      })
      .catch(function (error) {
        console.log(error.message);
        setOpenModalAlert(true);
        setLoading(false);
      });
  };

  const handleNavigatePotonganHarga = async () => {
    setLoading(true);
    await axios
      .get(
        `${URL_GATEWAY}/serviceInfoPromo/getLoadCashBack?memberId=${userDt["memberID"]}&memberFlag=${userDt["memberFlag"]}`,
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
        if (response["data"]["dtCountAll"][0].length > 0) {
          let dtCashBack = response["data"]["dtCountAll"][0];
          dispatch(
            setGlCashBack({
              dtCashBack,
            })
          );
          navigate("/getCashBack");
          setLoading(false);
        } else {
          setOpenModalAlert(true);

          setLoading(false);
        }
      })
      .catch(function (error) {
        console.log(error.message);
        setOpenModalAlert(true);
        setLoading(false);
      });
  };

  if (label === "Hadiah Langsung") {
    return (
      <>
        <Loader loading={loading} merah={memberMerah} />
        <ModalAlert
          open={openModalAlert}
          onClose={() => setOpenModalAlert(false)}
        >
          <div className="py-10 text-center">
            <img src={IcErr} alt="Warn" className="mx-auto" />
            <h3 className="mt-5 font-black text-gray-800 text-text">Maaf</h3>
            <div className="mx-auto my-4">
              <p
                className={`${
                  landscape ? "text-lg" : "text-2xl"
                } text-gray-500`}
                style={{ wordWrap: "break-word" }}
              >
                Tidak ada promosi yang sedang berlaku
              </p>
            </div>
          </div>
        </ModalAlert>
        <button
          onClick={handleNavigateHadiahLangsung}
          className={`flex flex-col ${
            memberMerah
              ? "bg-stroke-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-red to-red3 flex flex-row items-center justify-center gap-4"
              : "bg-stroke-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3 flex flex-row items-center justify-center gap-4"
          } w-[500px] rounded-xl p-16 items-center gap-5 text-black transition duration-200 active:bg-gray-100`}
        >
          <img src={icon} alt="icon" className="w-[150px] h-[150px]" />
          <p className="font-bold text-white text-text">{label}</p>
        </button>
      </>
    );
  }

  if (label === "Potongan Harga") {
    return (
      <>
        <Loader loading={loading} merah={memberMerah} />
        <ModalAlert
          open={openModalAlert}
          onClose={() => setOpenModalAlert(false)}
          landscape={landscape}
        >
          <div className="py-10 text-center">
            <img src={IcErr} alt="Warn" className="mx-auto" />
            <h3 className="mt-5 font-black text-gray-800 text-text">Maaf</h3>
            <div className="mx-auto my-4">
              <p
                className={`${
                  landscape ? "text-lg" : "text-2xl"
                } text-gray-500`}
                style={{ wordWrap: "break-word" }}
              >
                Tidak ada promosi yang sedang berlaku
              </p>
            </div>
          </div>
        </ModalAlert>
        <button
          onClick={handleNavigatePotonganHarga}
          className={`flex flex-col ${
            memberMerah
              ? "bg-stroke-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-red to-red3 flex flex-row items-center justify-center gap-4"
              : "bg-stroke-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3 flex flex-row items-center justify-center gap-4"
          } w-[500px] rounded-xl p-5 items-center gap-5 text-black transition duration-200 active:bg-gray-100`}
        >
          <img src={icon} alt="icon" className="w-[150px] h-[150px]" />
          <p className="font-bold text-white text-text">{label}</p>
        </button>
      </>
    );
  }
}

export default IconRecBtn;
