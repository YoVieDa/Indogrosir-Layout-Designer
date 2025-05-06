import { format } from "date-fns";
import { AESEncrypt, LOGIN_KEY, PAYMENT_KEY } from "../config";
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

export const deleteTempMemberFromAPI = async (
  urlGW,
  kodeMember,
  ipModul,
  stationModul,
  glRegistryDt
) => {
  try {
    return axios
      .post(
        `${urlGW}/login/logoutUser`,
        {
          kodeMember: kodeMember,
          dtIpModul: ipModul,
          dtStationModul: stationModul,
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
            "x-api-key": LOGIN_KEY,
          },
        }
      )
      .then(async (response) => {
        return { status: true, message: "Berhasil delete temp member" };
      })
      .catch((error) => {
        if (error.message === "Network doDeleteTempMemberFromAPI") {
          return { status: false, message: error.message };
        } else {
          return {
            status: false,
            message: error["response"]?.["data"]?.["status"],
          };
        }
      });
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const checkDoubleStationFromAPI = async (
  urlGW,
  kodeMember,
  glRegistryDt
) => {
  try {
    return axios
      .post(
        `${urlGW}/login/checkDoubleStation`,
        {
          memberId: kodeMember,
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
            "x-api-key": LOGIN_KEY,
          },
        }
      )
      .then(async (response) => {
        return true;
      })
      .catch((error) => {
        if (error.message === "Network doCheckDoubleStationFromAPI") {
          throw new Error(error.message);
        } else {
          throw new Error(error["response"]?.["data"]?.["status"]);
        }
      });
  } catch (error) {
    throw new Error(error.message);
  }
};

export const insertTempMemberFromAPI = async (
  urlGW,
  kodeMember,
  ipModul,
  stationModul,
  glRegistryDt
) => {
  try {
    return axios
      .post(
        `${urlGW}/login/insertTempMemberKasir`,
        {
          memberId: kodeMember,
          dtStationModul: stationModul,
          dtIpModul: ipModul,
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
            "x-api-key": LOGIN_KEY,
          },
        }
      )
      .then(async (response) => {
        return { status: true, message: "Berhasil insert temp member" };
      })
      .catch((error) => {
        if (error.message === "Network doInsertTempMemberFromAPI") {
          throw new Error(error.message);
        } else {
          throw new Error(error["response"]?.["data"]?.["status"]);
        }
      });
  } catch (error) {
    throw new Error(error.message);
  }
};
