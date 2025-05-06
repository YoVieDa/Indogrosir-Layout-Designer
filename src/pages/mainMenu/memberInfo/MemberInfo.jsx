import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import "./index.css";
import { BgMB2, IcErr, IcSucc } from "../../../assets";
import Dropdown from "../../../components/Dropdown";
import StandardBtn from "../../../components/StandardBtn";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../../components/Loader";
import ModalAlert from "../../../components/ModalAlert";
import { AESEncrypt, MEMBER_INFO_KEY, URL_GATEWAY } from "../../../config";
import { toggleMemberMerah } from "../../../services/redux/memberReducer";

const cabang = [
  "10 - Indogrosir Cabang Medan",
  "10 - Indogrosir Cabang Medan",
  "10 - Indogrosir Cabang Medan",
  "10 - Indogrosir Cabang Medan",
  "10 - Indogrosir Cabang Medan",
  "10 - Indogrosir Cabang Medan",
  "10 - Indogrosir Cabang Medan",
  "10 - Indogrosir Cabang Medan",
];

function MemberInfo() {
  const [openModalAlert, setOpenModalAlert] = useState(false);
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const [alertIc, setAlertIc] = useState("Error");
  const [alertTitle, setAlertTitle] = useState("");
  const [msg, setMsg] = useState("");
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const [isLandscape, setIsLandscape] = useState(false);
  const glLougoutApp = useSelector((state) => state.glCounter.glLogOutLimitApp);
  const glIpModul = useSelector((state) => state.glDtIp.dtIp);
  const glStationModul = useSelector((state) => state.glUser.stationModul);
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  const dispatch = useDispatch();

  const [selectedPrv, setSelectedPrv] = useState(null);
  const [selectedKab, setSelectedKab] = useState(null);
  const [selectedKec, setSelectedKec] = useState(null);
  const [selectedKel, setSelectedKel] = useState(null);

  const glRegistryDt = useSelector(
    (state) => state.glRegistry.dtDecryptedRegistry
  );

  const userDt = useSelector((state) => state.glUser.dtUser);
  const [dtPrv, setDtPrv] = useState(null);
  const [dtKab, setDtKab] = useState(null);
  const [dtKec, setDtKec] = useState(null);
  const [dtKel, setDtKel] = useState(null);
  const [loading, setLoading] = useState(false);

  // -------------- Handle Input with React-Simple-Keyboard--------------
  const [inputAlamat, setInputAlamat] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputNoHp, setInputNoHp] = useState("");
  const [currentInput, setCurrentInput] = useState(null);
  const keyboard = useRef();

  const navigate = useNavigate();

  const validateEmail = (email) => {
    // Regular expression untuk validasi email
    const emailRegex = /([\w-+]+(?:\.[\w-+]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7})/;

    // Memeriksa apakah email sesuai dengan regular expression
    return emailRegex.test(email);
  };

  const handlePrvDropdownSelect = (option) => {
    setSelectedPrv(option);
    setSelectedKab(null);
    setSelectedKec(null);
    setSelectedKel(null);
  };

  const handleKabDropdownSelect = (option) => {
    setSelectedKab(option);
    setSelectedKec(null);
    setSelectedKel(null);
  };

  const handleKecDropdownSelect = (option) => {
    setSelectedKec(option);
    setSelectedKel(null);
  };

  const handleKelDropdownSelect = (option) => {
    setSelectedKel(option);
  };

  // useEffect(() => {
  //   if (inputAlamat.trim() !== "") {
  //     setError("");
  //   }
  // }, [inputAlamat]);

  // const handleFocus = () => {
  //   // Menampilkan virtual keyboard pada saat input field mendapatkan fokus
  //   document.execCommand('insertText', false, '');
  // }

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

    const loadCusData = async () => {
      setLoading(true);
      await axios
        .get(
          `${URL_GATEWAY}/memberInfo/getCusData?memberId=${userDt["memberID"]}&kodeIGR=${userDt["kodeIGR"]}`,
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
              "x-api-key": MEMBER_INFO_KEY,
            },
          }
        )
        .then((response) => {
          console.log(response);
          if (response["data"]) {
            setInputAlamat(response["data"]["cusAlamat"]);
            setInputEmail(response["data"]["cusEmail"]);
            setInputNoHp(response["data"]["cusNoHp"]);
            setLoading(false);
          } else {
            // setAlamatLoaded("Alamat");
            // setEmailLoaded("Email");
            // setNoHpLoaded("No Handphone");
            setLoading(false);
          }
        })
        .catch(function (error) {
          console.log(error.message);
          setLoading(false);
        });
    };

    // Load dropdown Provinsi
    const loadProvince = async () => {
      setLoading(true);
      await axios
        .get(
          `${URL_GATEWAY}/memberInfo/getProvince?memberId=${userDt["memberID"]}&flagUpdateBiru=${userDt["flagUpdateBiru"]}`,
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
              "x-api-key": MEMBER_INFO_KEY,
            },
          }
        )
        .then((response) => {
          console.log(response);
          if (response["data"]) {
            setSelectedPrv(response["data"]["cusProv"]);
            setSelectedKab(response["data"]["cusKab"]);
            setSelectedKec(response["data"]["cusKec"]);
            setSelectedKel(response["data"]["cusKel"]);

            if (response["data"]["provinceDt"]) {
              let dtPrvArr = [];
              for (let i = 0; i < response["data"]["provinceDt"].length; i++) {
                dtPrvArr.push(
                  response["data"]["provinceDt"][i]["pos_propinsi"]
                );
              }
              setDtPrv(dtPrvArr);
            } else {
              setDtPrv(null);
            }

            setLoading(false);
          } else {
            setLoading(false);
          }
        })
        .catch(function (error) {
          console.log(error.message);
          setLoading(false);
        });
    };

    loadCusData();
    loadProvince();

    return () => {
      window.removeEventListener("click", handleTouch);
      clearTimeout(newTimeoutId);
      window.removeEventListener("resize", updateOrientation);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load dropdown Kab
  useEffect(() => {
    const loadKab = async () => {
      setLoading(true);
      await axios
        .get(
          `${URL_GATEWAY}/memberInfo/getProvIndexChanged?provSelected=${selectedPrv}`,
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
              "x-api-key": MEMBER_INFO_KEY,
            },
          }
        )
        .then((response) => {
          if (response["data"]["kabDt"]) {
            let dtKabArr = [];
            for (let i = 0; i < response["data"]["kabDt"].length; i++) {
              dtKabArr.push(response["data"]["kabDt"][i]["pos_kabupaten"]);
            }
            setDtKab(dtKabArr);
            setLoading(false);
          } else {
            setDtKab(null);
            setLoading(false);
          }
        })
        .catch(function (error) {
          console.log(error.message);
          setLoading(false);
        });
    };

    if (selectedPrv) {
      loadKab();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPrv]);

  // Load dropdown Kec
  useEffect(() => {
    const loadKec = async () => {
      setLoading(true);
      await axios
        .get(
          `${URL_GATEWAY}/memberInfo/getKabIndexChanged?provSelected=${selectedPrv}&kabSelected=${selectedKab}`,
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
              "x-api-key": MEMBER_INFO_KEY,
            },
          }
        )
        .then((response) => {
          if (response["data"]["kecDt"]) {
            let dtKecArr = [];
            for (let i = 0; i < response["data"]["kecDt"].length; i++) {
              dtKecArr.push(response["data"]["kecDt"][i]["pos_kecamatan"]);
            }
            setDtKec(dtKecArr);
            setLoading(false);
          } else {
            setDtKec(null);
            setLoading(false);
          }
        })
        .catch(function (error) {
          console.log(error.message);
          setLoading(false);
        });
    };

    if (selectedKab) {
      loadKec();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKab]);

  // Load dropdown Kec
  useEffect(() => {
    const loadKel = async () => {
      setLoading(true);
      await axios
        .get(
          `${URL_GATEWAY}/memberInfo/getKecIndexChanged?provSelected=${selectedPrv}&kabSelected=${selectedKab}&kecSelected=${selectedKec}`,
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
              "x-api-key": MEMBER_INFO_KEY,
            },
          }
        )
        .then((response) => {
          if (response["data"]["kelDt"]) {
            let dtKelArr = [];
            for (let i = 0; i < response["data"]["kelDt"].length; i++) {
              dtKelArr.push(response["data"]["kelDt"][i]["pos_kelurahan"]);
            }
            setDtKel(dtKelArr);
            setLoading(false);
          } else {
            setDtKel(null);
            setLoading(false);
          }
        })
        .catch(function (error) {
          console.log(error.message);
          setLoading(false);
        });
    };

    if (selectedKec) {
      loadKel();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKec]);

  // -------------- Handle Input with React-Simple-Keyboard--------------
  const onChangeAll = (input) => {
    if (currentInput === "alamat") {
      setInputAlamat(input);
    } else if (currentInput === "email") {
      setInputEmail(input);
    } else {
      setInputNoHp(input);
    }
  };

  const onChangeInput = (event, inputType) => {
    const input = event.target.value;
    if (inputType === "alamat") {
      setInputAlamat(input);
    } else if (inputType === "email") {
      setInputEmail(input);
    } else {
      setInputNoHp(input);
    }
    keyboard.current.setInput(input);
  };

  const handleFocus = (inputType) => {
    setCurrentInput(inputType);
    keyboard.current.setInput(
      inputType === "alamat"
        ? inputAlamat
        : inputType === "email"
        ? inputEmail
        : inputNoHp
    );
  };

  const capitalizeEveryFirstLetter = (text) => {
    return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // -------------- Handle Submit Btn --------------
  const handleSubmitBtn = async () => {
    if (!inputAlamat) {
      console.log("masuk validasi input alamat", inputAlamat);
      setMsg("Maaf, Alamat Harus Diisi");
      setOpenModalAlert(true);
      setAlertIc("Error");
      setAlertTitle("Error");
      return;
    } else if (selectedPrv === null) {
      setMsg("Maaf, Provinsi Harus Dipilih");
      setOpenModalAlert(true);
      setAlertIc("Error");
      setAlertTitle("Error");
      return;
    } else if (selectedKab === null) {
      setMsg("Maaf, Kota/Kabupaten Harus Dipilih");
      setOpenModalAlert(true);
      setAlertIc("Error");
      setAlertTitle("Error");
      return;
    } else if (selectedKec === null) {
      setMsg("Maaf, Kecamatan Harus Dipilih");
      setOpenModalAlert(true);
      setAlertIc("Error");
      setAlertTitle("Error");
      return;
    } else if (selectedKel === null) {
      setMsg("Maaf, Kelurahan Harus Dipilih");
      setOpenModalAlert(true);
      setAlertIc("Error");
      setAlertTitle("Error");
      return;
    } else if (inputEmail && validateEmail(inputEmail.trim()) === false) {
      // console.log(validateEmail(inputs["email"].trim()));
      // if (validateEmail(inputs["email"].trim()) === false) {
      setMsg("Email Tidak Valid. Contoh Format : contoh@contoh.com");
      setOpenModalAlert(true);
      setAlertIc("Error");
      setAlertTitle("Error");
      return;
      // }
    } else if (!inputNoHp) {
      setMsg("Maaf, Nomor HP Harus Diisi");
      setOpenModalAlert(true);
      setAlertIc("Error");
      setAlertTitle("Error");
      return;
    } else if (inputNoHp && isNaN(inputNoHp)) {
      setMsg("Maaf, Nomor HP Harus Angka");
      setOpenModalAlert(true);
      setAlertIc("Error");
      setAlertTitle("Error");
      return;
    } else if (
      inputNoHp &&
      inputNoHp.length !== 13 &&
      inputNoHp.length !== 12
    ) {
      setMsg("Maaf, Nomor HP Harus 12 atau 13 angka");
      setOpenModalAlert(true);
      setAlertIc("Error");
      setAlertTitle("Error");
      return;
    }

    try {
      console.log(openModalAlert);
      setLoading(true);
      const getAllDataKodePos = await axios.get(
        `${URL_GATEWAY}/memberInfo/getAllDataKdPos?provSelected=${selectedPrv}&kabSelected=${selectedKab}&kecSelected=${selectedKec}&kelSelected=${selectedKel}`,
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
            "x-api-key": MEMBER_INFO_KEY,
          },
        }
      );

      console.log(getAllDataKodePos);

      let kabKot, kodePos, kelurahan, email, alamat, telp;

      if (getAllDataKodePos["data"]["allDtKodePos"].length > 0) {
        kabKot = getAllDataKodePos["data"]["allDtKodePos"][0]["pos_kabupaten"]
          .toString()
          .replace("Kota ", "")
          .replace("Kab. ", "")
          .toUpperCase();

        kelurahan = getAllDataKodePos["data"]["allDtKodePos"][0][
          "pos_kelurahan"
        ]
          .toString()
          .toUpperCase();

        if (inputEmail) {
          email = inputEmail
            .trim()
            .replace("'", "")
            .replace(";", null)
            .toUpperCase();
        } else {
          email = null;
        }

        if (inputAlamat) {
          alamat = inputAlamat
            .trim()
            .replace("'", "")
            .replace(";", null)
            .toUpperCase();
        }

        if (inputNoHp) {
          telp = inputNoHp
            .trim()
            .replace("'", "")
            .replace(";", null)
            .toUpperCase();
        }

        kodePos =
          getAllDataKodePos["data"]["allDtKodePos"][0]["pos_kode"].toString();
        console.log(kodePos);
        await axios
          .put(
            `${URL_GATEWAY}/memberInfo/updateMemberInfo`,
            {
              alamat: alamat,
              kabKot: kabKot,
              kodePos: kodePos,
              kelurahan: kelurahan,
              telp: telp,
              email: email,
              memberId: userDt["memberID"],
              kodeIGR: userDt["kodeIGR"],
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
                "x-api-key": MEMBER_INFO_KEY,
              },
            }
          )
          .then((response) => {
            console.log(response);

            setLoading(false);
            setMsg("Berhasil Update Data");
            setOpenModalAlert(true);
            setAlertIc("Success");
            setAlertTitle("Success");
          })
          .catch(function (error) {
            console.log(error.message);
            setLoading(false);
            setMsg("Gagal Update Data");
            setOpenModalAlert(true);
            setAlertIc("Error");
            setAlertTitle("Error");
          });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      {loading ? (
        <div className="mx-auto my-auto">
          <Loader loading={loading} />
        </div>
      ) : null}
      <ModalAlert
        open={openModalAlert}
        onClose={() => setOpenModalAlert(false)}
        landscape={isLandscape}
      >
        <div className="text-center">
          <img
            src={alertIc === "Error" ? IcErr : IcSucc}
            alt="Warn"
            className="mx-auto"
          />
          <div className="mx-auto my-4">
            <h3 className="font-black text-gray-800 text-text">{alertTitle}</h3>
            <p
              className="mt-5 text-lg text-gray-500"
              style={{ wordWrap: "break-word" }}
            >
              {msg}
            </p>
          </div>
        </div>
      </ModalAlert>
      <div
        style={{
          height: `${isLandscape ? "1080px" : "1920px"}`,
          width: `${isLandscape ? "1920px" : "1080px"}`,
        }}
        className="flex flex-col p-5"
      >
        <div className="flex flex-col gap-2 ">
          <div className="p-5 py-1 rounded-xl bg-blue bg-stroke-white">
            <p className="font-bold text-center text-white text-text">
              Selamat Datang{" "}
              {userDt["memberGender"] === "1"
                ? "Bapak"
                : userDt["memberGender"] === "2"
                ? "Ibu"
                : userDt["memberGender"] === "0"
                ? "Bapak/Ibu"
                : "Bapak/Ibu"}{" "}
              {capitalizeEveryFirstLetter(userDt["memberName"])}
            </p>
            <p className="font-bold text-center text-white text-text">
              Mohon Lengkapi Data Anda
            </p>
          </div>

          <div className="flex flex-col gap-5 p-5 bg-white bg-stroke rounded-xl">
            <div className="flex flex-col">
              <label className="text-subText">Alamat Sekarang*</label>
              <input
                id="alamat"
                value={inputAlamat}
                onFocus={() => handleFocus("alamat")}
                placeholder={"Masukkan Alamat"}
                onChange={(e) => onChangeInput(e, "alamat")}
                className="border bg-stroke p-5 rounded-xl w-[100%] text-subText"
              />
            </div>

            <div
              className={`${
                isLandscape ? "grid grid-cols-4" : "grid grid-cols-2"
              } gap-5`}
            >
              <div>
                <p className="text-subText">Provinsi*</p>
                <Dropdown
                  size="sm"
                  data={dtPrv}
                  onSelect={handlePrvDropdownSelect}
                  selectedOptionParam={selectedPrv}
                  landscape={isLandscape}
                />
              </div>

              <div>
                <p className="text-subText">Kabupaten*</p>
                <Dropdown
                  size="sm"
                  data={dtKab}
                  onSelect={handleKabDropdownSelect}
                  selectedOptionParam={selectedKab}
                  landscape={isLandscape}
                />
              </div>
              <div>
                <p className="text-subText">Kecamatan*</p>
                <Dropdown
                  size="sm"
                  data={dtKec}
                  onSelect={handleKecDropdownSelect}
                  selectedOptionParam={selectedKec}
                  landscape={isLandscape}
                />
              </div>
              <div>
                <p className="text-subText">Kelurahan*</p>
                <Dropdown
                  size="sm"
                  data={dtKel}
                  onSelect={handleKelDropdownSelect}
                  selectedOptionParam={selectedKel}
                  landscape={isLandscape}
                />
              </div>
            </div>

            <div className="flex flex-row gap-5">
              <div className="flex flex-col w-[50%]">
                <label className="text-subText">Email</label>
                <input
                  id="email"
                  type="text"
                  placeholder={"Masukkan Email"}
                  value={inputEmail}
                  onFocus={() => handleFocus("email")}
                  onChange={(e) => onChangeInput(e, "email")}
                  className="border bg-stroke p-5 rounded-xl w-[100%] text-subText"
                />
              </div>

              <div className="flex flex-col w-[50%]">
                <label className="text-subText">No Handphone</label>
                <input
                  id="nohp"
                  type="text"
                  placeholder={"Masukkan No Handphone"}
                  value={inputNoHp}
                  onFocus={() => handleFocus("noHp")}
                  onChange={(e) => onChangeInput(e, "noHp")}
                  className="border bg-stroke p-5 rounded-xl w-[100%] text-subText"
                />
              </div>
            </div>

            <div className="flex flex-row justify-between">
              <p className="text-red text-[24px] self-start">*) Wajib Diisi</p>
              <div
                className={`flex flex-row gap-5 ${isLandscape ? "" : "mt-20"}`}
              >
                <button
                  onClick={handleSubmitBtn}
                  className={`w-[299px] h-[96px] rounded-xl bg-stroke-white p-3 text-subText font-bold text-white transform transition duration-200 active:scale-90 bg-gradient-to-t from-blue to-blue3 flex flex-row items-center justify-center gap-4  `}
                >
                  Selesai
                </button>
                <StandardBtn title="Kembali" path="/mainMenu" btnSize="266px" />
              </div>
            </div>
          </div>
          <div
            className={`${isLandscape ? "w-[80%]" : " w-[100%]"} self-center`}
          >
            <Keyboard
              layout={{
                default: [
                  "1 2 3 4 5 6 7 8 9 0 _ {bksp}",
                  "Q W E R T Y U I O P",
                  "A S D F G H J K L",
                  "Z X C V B N M , . @",
                  "{space}",
                ],
              }}
              display={{
                "{bksp}": "⌫",
                "{space}": "Space",
              }}
              theme="hg-theme-default hg-layout-default myTheme"
              keyboardRef={(r) => (keyboard.current = r)}
              //inputName={inputName}
              onChange={onChangeAll}
              buttonTheme={[
                {
                  class: "custom-btn",
                  buttons: "1 2 3 4 5 6 7 8 9 0 _ {bksp}",
                },
                {
                  class: "custom-btn",
                  buttons: "Q W E R T Y U I O P",
                },
                {
                  class: "custom-btn",
                  buttons: "A S D F G H J K L",
                },
                {
                  class: "custom-btn",
                  buttons: "Z X C V B N M , . @",
                },
                {
                  class: "custom-btn",
                  buttons: "{space}",
                },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default MemberInfo;
