import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TiArrowBack } from "react-icons/ti";
import { useDispatch, useSelector } from "react-redux";
import {
  removeItem,
  removeAllItems,
  removeAllItemsHitungTotal,
} from "../services/redux/dtAllInputtedItemReducer";
import {
  addDtTimeStart,
  removeDtTimeStart,
} from "../services/redux/documentInfoReducer";
import Loader from "./Loader";
import { deleteTempMemberFromAPI } from "../controller/kasirPembayaranController";
import { AESEncrypt } from "../config";
import { toggleMemberMerah } from "../services/redux/memberReducer";
import ModalAlert from "./ModalAlert";
import { IcErr } from "../assets";

function StandardBtn({
  title,
  path,
  color,
  width,
  pos,
  pembayaran,
  memberUmum = false,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [openModalAlert, setOpenModalAlert] = useState(false);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const glStationModul = useSelector((state) => state.glUser.stationModul);
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const userDt = useSelector((state) => state.glUser.dtUser);
  const glIpModul = useSelector((state) => state.glDtIp.dtIp);
  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const handleNavigate = async () => {
    if (pos) {
      setLoading(true);
      const doDeleteTempMemberFromAPI = await deleteTempMemberFromAPI(
        URL_GATEWAY,
        userDt["memberID"],
        glIpModul,
        glStationModul,
        glRegistryDt
      );

      if (doDeleteTempMemberFromAPI.status === true) {
        if (memberUmum) {
          if (memberMerah) {
            setLoading(false);
            dispatch(addDtTimeStart(""));
            dispatch(removeAllItems());
            navigate("/");
          } else {
            setLoading(false);
            dispatch(addDtTimeStart(""));
            dispatch(removeAllItems());
            navigate("/");
            dispatch(toggleMemberMerah());
          }
        } else {
          dispatch(addDtTimeStart(""));
          dispatch(removeAllItems());
          navigate(path);
        }
      } else {
        if (
          doDeleteTempMemberFromAPI.message ===
          "Network doDeleteTempMemberFromAPI"
        ) {
          setMsg("Gagal Terhubung Dengan Gateway");
        } else {
          setMsg(doDeleteTempMemberFromAPI.message);
        }

        setLoading(false);
        setOpenModalAlert(true);
      }
    } else if (pembayaran) {
      navigate(path);
      dispatch(removeAllItemsHitungTotal());
    } else {
      navigate(path);
    }
  };

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
      <button
        onClick={handleNavigate}
        className={`w-[${
          width !== undefined ? width : "299px"
        }] h-[96px] rounded-xl bg-stroke-white ${
          color === "blue" ? " bg-blue" : "bg-red"
        } p-3 text-subText font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-red to-red3 flex flex-row items-center justify-center gap-4`}
      >
        <TiArrowBack size={70} />
        {title}
      </button>
    </>
  );
}

export default StandardBtn;
