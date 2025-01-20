import { format } from "date-fns";
import { PAYMENT_KEY } from "../config";
import axios from "axios";
const { ipcRenderer } = window.require("electron");

export const generateTXTError = (errorMsg) => {
  let str = "";
  let nowTime = new Date();
  str =
    "\r\n------------- " +
    format(nowTime, "yyyy-MM-dd HH:mm:ss") +
    " ----------------";
  str += "\r\n" + errorMsg + "\r\n";

  return str;
};

export const errorLog = async (errorMsg) => {
  const doGenerateTXTError = generateTXTError(errorMsg);

  const timeNow = format(new Date(), "yyyyMMdd");
  const dtSaveErrorLog = {
    errorMsg: doGenerateTXTError,
    path: `\\ERRORLOG-${timeNow}.TXT`,
  };

  ipcRenderer.invoke("save_errorlog", dtSaveErrorLog);
};

export const sendErrorLogWithAPI = async (
  errorMsg,
  glRegistryDt,
  URL_GATEWAY,
  glStationModul,
  appVersion
) => {
  try {
    await axios.post(
      `${URL_GATEWAY}/servicePayment/postSendErrorLog`,
      {
        kodeIGR: glRegistryDt["glRegistryDt"]["registryOraIGR"],
        stationModul: glStationModul,
        errMsg: errorMsg,
        appVersion: appVersion,
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
    );

    return;
  } catch (error) {
    if (error.response?.data?.status) {
      await errorLog(error.response?.data?.status);
      return;
    } else {
      await errorLog("Error send error log with api\r\n" + error.message);
      return;
    }
  }
};

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
