import React, { useEffect, useState, useRef } from "react";
import { Rnd } from "react-rnd";
import "./style/SettingLokasiRak.css";
import { useSelector } from "react-redux";
import Dropdown from "../../components/Dropdown";
import ModalAlert from "../../components/ModalAlert";
import ModalSettingRak from "./SettingRak";
import { 
  IcSucc, IcErr,
  RakBeamImgR0, RakBeamImgR90, RakBeamImgR180, RakBeamImgR270,
  RakInnerImgR0, RakInnerImgR90, RakInnerImgR180, RakInnerImgR270,
  KasirImgR0, KasirImgR90, KasirImgR180, KasirImgR270,
  IkiosImg,
 } from "../../assets";

import { LAYOUT_IGR_KEY } from "../../config";
import Sidebar from "../../components/Sidebar";

import axios from "axios";

const GRID_SIZE = 15;
// Variabel untuk menyimpan dimensi dari rak
const WidthBeam = 5;
const HeightBeam = 2;
const WidthInner = 5;
const HeightInner = 2;
const WidthKasir = 2;
const HeightKasir = 1;
const WidthIkios = 1;
const HeightIkios = 1;

const snapToGrid = (value) => Math.round(value / GRID_SIZE) * GRID_SIZE;

const SettingLokasiRak = () => {
  const glRegistryDt = useSelector((state) => state.glRegistry.dtDecryptedRegistry);
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const kodeIGR = glRegistryDt.glRegistryDt["registryOraIGR"];
  const commonHeaders = {
          server: glRegistryDt["glRegistryDt"]["server"],
          registryOraIGR: glRegistryDt["glRegistryDt"]["registryOraIGR"],
          registryIp: glRegistryDt["glRegistryDt"]["registryOraIP"],
          registryPort: glRegistryDt["glRegistryDt"]["registryPort"],
          registryServiceName: glRegistryDt["glRegistryDt"]["registryServiceName"],
          registryUser: glRegistryDt["glRegistryDt"]["registryUser"],
          registryPwd: glRegistryDt["glRegistryDt"]["registryPwd"],
          "Cache-Control": "no-cache",
          "x-api-key": LAYOUT_IGR_KEY,
      };

  // Variabel khusus untuk membuat modal sukses atau gagal
  const [openModalAlert, setOpenModalAlert] = useState(false);
  const [msgTitle, setMsgTitle] = useState("");
  const [msg, setMsg] = useState("");
  
  const [openModalSettingRak, setOpenModalSettingRak] = useState(false);
  const [selectShelfCodeToSetting, setSelectShelfCodeToSetting] = useState("");
  const [selectShelfTypeToSetting, setSelectShelfTypeToSetting] = useState("");
  const [selectSubRakToSetting, setSelectSubRakToSetting] = useState("");
  const [detailSelectShelf, setDetailSelectShelf] = useState("");

  const [shelves, setShelves] = useState([]);    // rak
  const [frozenSelections, setFrozenSelections] = useState([]);
  const [gridWidth, setGridWidth] = useState(0);
  const [gridHeight, setGridHeight] = useState(0);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isEditMode, setEditMode] = useState(false);
  const [isChooseShelve, setIsChooseShelve] = useState(false);
  const [chooseJenisItem, setChooseJenisItem] = useState("");

  const gridContainerRef = useRef(null);
  const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });

  const listJenisItem = ["Meja Kasir", "Ikios", "Rak"];
  const placeholderListJenisItem = "Pilih Jenis Item yang akan ditambahkan";

  const [selectedShelfCode, setSelectedShelfCode] = useState("");
  const [listShelfCode, setListShelfCode] = useState([]);
  const placeholderShelfCode = "Pilih Kode Rak";

  const [selectedShelfType, setSelectedShelfType] = useState("");
  const [listShelfType, setListShelfType] = useState([]);
  const placeholderShelfType = "Pilih Tipe Rak";

  const [selectedSubRak, setSelectedSubRak] = useState("");
  const [listSubRak, setListSubRak] = useState([]);
  const placeholderSubRak = "Pilih Sub Rak";

  useEffect(() => {
    // Fungsi ambil data grid di awal
    const fetchData = async () => {
      try {
        await axios
          .get(`${URL_GATEWAY}/layoutIgr/getListCodeRak?kodeIGR=${kodeIGR}`, {
            headers: commonHeaders,
          })
          .then((response) => {
            setListShelfCode(response.data.data.map(item => item.lks_koderak));
          })
          .catch(function (error) {
            if (error.message === "Network Error") {
              setMsg("Gagal Terhubung Dengan Gateway");
            } else {
              setMsg(error["response"]?.["data"]?.["status"]);
            }
          });
      } catch (error) {
        console.error("Gagal ambil data:", error);
        setOpenModalAlert(true);
        setMsgTitle("Error");
        setMsg("Layout Gagal Ambil Data\n", toString(error.message));
        throw new Error(error.message);
      }

      try {
        await axios
          .get(`${URL_GATEWAY}/layoutIgr/getLayoutGrid?kodeIGR=${kodeIGR}`, {
            headers: commonHeaders,
          })
          .then((response) => {
            setFrozenSelections(response.data.data);
          })
          .catch(function (error) {
            if (error.message === "Network Error") {
              setMsg("Gagal Terhubung Dengan Gateway");
            } else {
              setMsg(error["response"]?.["data"]?.["status"]);
            }
          });
      } catch (error) {
        console.error("Gagal ambil data:", error);
        setOpenModalAlert(true);
        setMsgTitle("Error");
        setMsg("Layout Gagal Ambil Data\n", toString(error.message));
        throw new Error(error.message);
      }

      try {
        await axios
          .get(`${URL_GATEWAY}/layoutIgr/getLokasiRak?kodeIGR=${kodeIGR}`, {
            headers: commonHeaders,
          })
          .then((response) => {
            const renamedData = response.data.data.map((item) => ({
              idTemp: item.lksr_koderak + "_" + item.lksr_tiperak + "_" + item.lksr_kodesubrak,
              id: item.lksr_koderak,
              tipe: item.lksr_tiperak,
              subRak: item.lksr_kodesubrak,
              x: item.lksr_koordinat_x,
              y: item.lksr_koordinat_y,
              width: item.lksr_panjang,
              height: item.lksr_lebar,
              rotate: item.lksr_rotasi,
            }));
                
            setShelves(renamedData);
          })
          .catch(function (error) {
            if (error.message === "Network Error") {
              setMsg("Gagal Terhubung Dengan Gateway");
            } else {
              setMsg(error["response"]?.["data"]?.["status"]);
            }
          });
      } catch (error) {
        console.error("Gagal ambil data:", error);
        setOpenModalAlert(true);
        setMsgTitle("Error");
        setMsg("Layout Gagal Ambil Data\n", toString(error.message));
        throw new Error(error.message);
      }
    };
    fetchData(); // panggil saat komponen pertama kali dirender
  }, []); // dependency kosong => hanya sekali jalan

  useEffect(() => {
    // Menangani perubahan isi dari frozenSelection di awal saat membuka menu Setting Lokasi Rak
    // Sehingga jika memang ada data yang disimpan, maka ukuran grid bisa diatur di sini
    if (frozenSelections.length > 0) {
      const maxX = Math.max(...frozenSelections.map(item => item.lti_koordinat_x));
      const maxY = Math.max(...frozenSelections.map(item => item.lti_koordinat_y));
      setGridWidth(maxX + 2);
      setGridHeight(maxY + 1);
    }
  }, [frozenSelections]);

  const handleDropdownSelectedJenisItem = (option) => {
    setIsChooseShelve(option === "Rak" ? true : false);
    setChooseJenisItem(option);
  }

  const handleDropdownSelectedShelfCode = async (option) => {
    setSelectedShelfCode(option);
    setSelectedShelfType("");
    setSelectedSubRak("");

    try {
      await axios
        .get(`${URL_GATEWAY}/layoutIgr/getListTipeRak?kodeIGR=${kodeIGR}&kodeRak=${option}`, {
          headers: commonHeaders,
        })
        .then((response) => {

          setListShelfType(response.data.data.map(item => item.lks_tiperak));
        })
        .catch(function (error) {
          if (error.message === "Network Error") {
            setMsg("Gagal Terhubung Dengan Gateway");
          } else {
            setMsg(error["response"]?.["data"]?.["status"]);
          }
        });
    } catch (error) {
      console.error("Gagal ambil data:", error);
      setOpenModalAlert(true);
      setMsgTitle("Error");
      setMsg("Layout Gagal Ambil Data\n", toString(error.message));
      throw new Error(error.message);
    }
  };
  
  const handleDropdownSelectedShelfType = async (option) => {
    if (selectedShelfCode === "") {
      setOpenModalAlert(true);
      setMsgTitle("Error");
      setMsg("Kode Rak Tidak Boleh Kosong");
      return;
    }

    setSelectedSubRak("");
    setSelectedShelfType(option);

    try {
      await axios
        .get(`${URL_GATEWAY}/layoutIgr/getListSubRak?kodeIGR=${kodeIGR}&kodeRak=${selectedShelfCode}&tipeRak=${option}`, {
          headers: commonHeaders,
        })
        .then((response) => {
          let result = response.data.data.map(item => item.lks_kodesubrak);
          let filteredArr = result.filter(item => {
            // cek apakah sub ini sudah ada di shelves dengan kode dan tipe yang sama
            let exists = shelves.some(itemShelves =>
              itemShelves.id === selectedShelfCode &&
              itemShelves.tipe === option &&
              itemShelves.subRak === item
            );
            // hanya ambil yang belum ada
            return !exists;
          });
          setListSubRak(filteredArr);
        })
        .catch(function (error) {
          if (error.message === "Network Error") {
            setMsg("Gagal Terhubung Dengan Gateway");
          } else {
            setMsg(error["response"]?.["data"]?.["status"]);
          }
        });
    } catch (error) {
      console.error("Gagal ambil data:", error);
      setOpenModalAlert(true);
      setMsgTitle("Error");
      setMsg("Layout Gagal Ambil Data\n", toString(error.message));
      throw new Error(error.message);
    }
  };
  
  const handleDropdownSelectedSubRak = (option) => {
    if (selectedShelfType === "") {
      setOpenModalAlert(true);
      setMsgTitle("Error");
      setMsg("Tipe Rak Tidak Boleh Kosong");
      return;
    }

    setSelectedSubRak(option);
  };

  const addItem = () => {
    if (chooseJenisItem === "Rak") {
      // Cek dulu id nya baru posisinya
      if (selectedShelfCode === "") {
        setOpenModalAlert(true);
        setMsgTitle("Error");
        setMsg("Kode Rak Tidak Boleh Kosong");
        return;
      }
  
      if (shelves.some(item => item.id === selectedShelfCode && item.tipe === selectedShelfType && item.subRak === selectedSubRak)) {
        setOpenModalAlert(true);
        setMsgTitle("Error");
        setMsg("Kode Rak Sudah Didaftarkan");
        return;
      }
  
      if (selectedShelfType === "") {
        setOpenModalAlert(true);
        setMsgTitle("Error");
        setMsg("Tipe Rak Tidak Boleh Kosong");
        return;
      }
  
      if (selectedSubRak === "") {
        setOpenModalAlert(true);
        setMsgTitle("Error");
        setMsg("Sub Rak Tidak Boleh Kosong");
        return;
      }
  
      // Cek posisi
      let position = generatePosition(
        selectedShelfType === "B" ? WidthBeam : WidthInner,
        selectedShelfType === "B" ? HeightBeam : HeightInner);

      if (position.lti_koordinat_x > -1) {
        setShelves([...shelves,
          {
            idTemp: selectedShelfCode + "_" + selectedShelfType + "_" + selectedSubRak,
            id: selectedShelfCode,
            tipe: selectedShelfType,
            subRak: selectedSubRak,
            x: position.lti_koordinat_x,
            y: position.lti_koordinat_y,
            width: selectedShelfType === "B" ? WidthBeam : WidthInner,
            height: selectedShelfType === "B" ? HeightBeam : HeightInner,
            rotate: 0
          },
        ]);
        changeStatusGrid(1, position.lti_koordinat_x, position.lti_koordinat_y, 
          selectedShelfType === "B" ? position.lti_koordinat_x + WidthBeam - 1: position.lti_koordinat_x + WidthInner - 1, 
          selectedShelfType === "B" ? position.lti_koordinat_y + HeightBeam - 1: position.lti_koordinat_y + HeightInner - 1); 
        setSelectedShelfCode("");
        setSelectedShelfType("");
        setListShelfType([]);
        setSelectedSubRak("");
        setListSubRak([]);
      }
      else {
        setOpenModalAlert(true);
        setMsgTitle("Error");
        setMsg("Layout Penuh");
      }
    }
    else {
      if (chooseJenisItem === "Meja Kasir") {
        // Cek posisi
        let position = generatePosition(WidthKasir, HeightKasir);
        if (position.lti_koordinat_x > -1) {
          setShelves([...shelves,
            {
              idTemp: generateCode("KSR") + "_KSR",
              id: generateCode("KSR"),
              subRak: "",
              tipe: "KSR",
              x: position.lti_koordinat_x,
              y: position.lti_koordinat_y,
              width: WidthKasir,
              height: HeightKasir,
              rotate: 0
            },
          ]);
          changeStatusGrid(1, position.lti_koordinat_x, position.lti_koordinat_y, 
            position.lti_koordinat_x + WidthKasir - 1, 
            position.lti_koordinat_y + HeightKasir - 1);
        }
        else {
          setOpenModalAlert(true);
          setMsgTitle("Error");
          setMsg("Layout Penuh");
        }
      }
      else if (chooseJenisItem === "Ikios") {
        // Cek posisi
        let position = generatePosition(WidthIkios, HeightIkios);
        if (position.lti_koordinat_x > -1) {
          setShelves([...shelves,
            {
              idTemp: generateCode("IKS") + "_IKS",
              id: generateCode("IKS"),
              subRak: "",
              tipe: "IKS",
              x: position.lti_koordinat_x,
              y: position.lti_koordinat_y,
              width: WidthIkios,
              height: HeightIkios,
              rotate: 0
            },
          ]);
          changeStatusGrid(1, position.lti_koordinat_x, position.lti_koordinat_y, 
            position.lti_koordinat_x + WidthIkios - 1, 
            position.lti_koordinat_y + HeightIkios - 1);
        }
        else {
          setOpenModalAlert(true);
          setMsgTitle("Error");
          setMsg("Layout Penuh");
        }
      }
    }
  };

  /**
   * Mengubah kondisi grid berdasarkan titik awal dan titik akhir item yang mengalami perubahan (rotasi atao move)
   * Note : fungsi langsung dan hanya mengganti variabel grid nya
   * @param {integer} status = berisi 0 (nonaktif) atau 1 (aktif / ada isinya) untuk menandai grid
   * @param {integer} xStart = koordinat grid paling ujung kiri atas
   * @param {integer} yStart = koordinat grid paling ujung kiri atas
   * @param {integer} xEnd = koordinat grid paling ujung kanan bawah
   * @param {integer} yEnd = koordinat grid paling ujung kanan bawah
   */
  const changeStatusGrid = (status, xStart, yStart, xEnd = null, yEnd = null) => {
    setFrozenSelections((prev) =>           
      prev.map(item => {
        const x = item.lti_koordinat_x;
        const y = item.lti_koordinat_y;

        // Jika xEnd atau yEnd null, gunakan titik awal sebagai akhir (single cell update)
        const xAkhir = xEnd !== null ? xEnd : xStart;
        const yAkhir = yEnd !== null ? yEnd : yStart;

        // Cek apakah koordinat berada dalam rentang dari xStart..xAkhir dan yStart..yAkhir
        const isInRange =
          x >= Math.min(xStart, xAkhir) &&
          x <= Math.max(xStart, xAkhir) &&
          y >= Math.min(yStart, yAkhir) &&
          y <= Math.max(yStart, yAkhir);

        if (isInRange) {
          return { ...item, lti_grid_dipakai: status };
        }
    
        return item;
      })
    );
  };

  /**
   * Melakukan generate primary code (hanya) untuk Kasir dan Ikios
   * @param {string(3)} jenisItem = cuma ada 2 sejauh ini (KSR, dan IKS)
   * @returns {string} kode jadi
   */
  const generateCode = (jenisItem) => {
    if (jenisItem === "KSR") {
      const shelvesK = shelves.filter(item => item.tipe === "KSR");     // Buat var untuk list item hanya yang Kasir
      let count = 0;

      while (shelvesK.some(item => item.id === "KSR" + String(count).padStart(2, "0"))) {
        count++;
      }
      return "KSR" + String(count).padStart(2, "0");
    }
    else if (jenisItem === "IKS") {
      const shelvesI = shelves.filter(item => item.tipe === "IKS");     // Buat var untuk list item hanya yang Ikios
      let count = 0;

      while (shelvesI.some(item => item.id === "IKS" + String(count).padStart(2, "0"))) {
        count++;
      }
      return "IKS" + String(count).padStart(2, "0");
    }
  }

  /**
   * Untuk mengenerate posisi item yang baru ditambahkan
   * @param {*} width = lebar (x) dari item
   * @param {*} height = tinggi (y) dari item
   * @returns posisi x dan y
   */
  const generatePosition = (width, height) => {
    let tempFrozenSelections = frozenSelections;        // dipake supaya ga asyncronous

    // membuat tempt grid
    const sortedSelections = frozenSelections
      .slice() // biar tidak mengubah aslinya
      .sort((a, b) => (a.lti_koordinat_y - b.lti_koordinat_y) || (a.lti_koordinat_x - b.lti_koordinat_x)); // ini diurutkan berdasarkan sumbu y dulu baru sumbu x

    for (const element of sortedSelections) {
      let check = checkValid(tempFrozenSelections, element.lti_koordinat_x, element.lti_koordinat_y, width, height);
      
      if (check.code === 1) {
        return { lti_koordinat_x: element.lti_koordinat_x, lti_koordinat_y: element.lti_koordinat_y };
      }
    }

    return { lti_koordinat_x: -1, lti_koordinat_y: -1 };
  };
  
  /**
   * 
   * @param {*} gridArea = gridArea yang akan dijadikan acuan
   * @param {*} x = xStart (kiri atas)
   * @param {*} y = yStart (kiri atas)
   * @param {*} width = lebar (x) dari item
   * @param {*} height = tinggi (y) dari item
   * @returns code dan message
   */
  const checkValid = (gridArea, x, y, width, height) => {
    let endX = x + width - 1;
    let endY = y + height - 1;

    let counterX = x;
    let counterY = y;

    // ---- ini intinya kita loop aja dari awal sampe akhir grid buat item apa ada yang diluar area atau ada yang tumpang tindih

    while (counterX <= endX) {
      counterY = y;
      while (counterY <= endY) {
        let gridNowOnCheck = gridArea.find(grid => grid.lti_koordinat_x === counterX && grid.lti_koordinat_y === counterY);   // Cek grid yang di cocokkan dengan item
    
        if (counterX > gridWidth - 1 && counterY > gridHeight - 1) {
          // Cegat saat titik item saat ini berada di luar ukuran grid
          return { code: 0, message: "Koordinat awal berada di luar grid" };
        }
        if (!gridNowOnCheck) {
          // Grid tidak ditemukan. Maka, cegat saat titik item saat ini berada di dalam ukuran grid, tapi bukan jadi lokasi bangunan
          return { code: -3, message: "Ada grid yang berada di luar batas" };
        }
        if (gridNowOnCheck.lti_grid_dipakai === 1) {
          // Cegat saat titik awal item sudah dipakai
          return { code: -4, message: "Ada grid yang sudah digunakan" };
        }

        counterY += 1;
      }
      counterX += 1;
    }

    return { code: 1, message: "Success" };
  };

  const removeShelf = (idTemp) => {
    const [id, tipe, subRak = ""] = idTemp.split("_");
    let itemChange = shelves.find(item => item.id === id && item.tipe === tipe && item.subRak === subRak);
    setShelves(shelves.filter((item) => item !== itemChange));
    if (itemChange.rotate === 0 || itemChange.rotate === 180) {
      changeStatusGrid(0, itemChange.x, itemChange.y, itemChange.x + itemChange.width - 1, itemChange.y + itemChange.height - 1);
    } else {
      changeStatusGrid(0, itemChange.x, itemChange.y, itemChange.x + itemChange.height - 1, itemChange.y + itemChange.width -1);
    }
  };

  const rotateShelf = (idTemp) => {
    let tempFrozenSelections = frozenSelections;        // dipake supaya ga asyncronous
    const [id, tipe, subRak = ""] = idTemp.split("_");
    let itemChange = shelves.find(item => item.id === id && item.tipe === tipe && item.subRak === subRak);    // variabel untuk penanda item mana yang dirotasi
    let itemRad = (itemChange.rotate + 90) % 360;
    let height = itemChange.height - 1
    let width = itemChange.width - 1

    // Setting grid agar dianggap posisi tersebut belum digunakan (benda diangkat)
    // Dilakukan untuk grid asli dan grid temp
    if (itemChange.rotate === 0 || itemChange.rotate === 180) {
      
      changeStatusGrid(0, itemChange.x, itemChange.y, itemChange.x + width, itemChange.y + height);
      
      tempFrozenSelections = gantiTempFrozenSelections(tempFrozenSelections, 0, itemChange.x, itemChange.y, itemChange.x + width, itemChange.y + height);
      
    } else if (itemChange.rotate === 90 || itemChange.rotate === 270) {
      changeStatusGrid(0, itemChange.x, itemChange.y, itemChange.x + height, itemChange.y + width);
      tempFrozenSelections = gantiTempFrozenSelections(tempFrozenSelections, 0, itemChange.x, itemChange.y, itemChange.x + height, itemChange.y + width);
    }

    // Ubah posisi rotasi
    let check;
    if (itemRad === 0 || itemRad === 180) {
      check = checkValid(tempFrozenSelections, itemChange.x, itemChange.y, itemChange.width, itemChange.height, itemRad);
    } else if (itemRad === 90 || itemRad === 270) {
      check = checkValid(tempFrozenSelections, itemChange.x, itemChange.y, itemChange.height, itemChange.width, itemRad);
    }
    if (check.code === 1){
      setShelves(
        shelves.map((item) =>
          item.id === id && item.tipe === tipe && item.subRak === subRak
            ? { ...item, rotate: itemRad } : item
        )
      );
      if (itemRad === 0 || itemRad === 180) {
        changeStatusGrid(1, itemChange.x, itemChange.y, itemChange.x + width, itemChange.y + height);
        tempFrozenSelections = gantiTempFrozenSelections(tempFrozenSelections, 1, itemChange.x, itemChange.y, itemChange.x + width, itemChange.y + height);
      } else if (itemRad === 90 || itemRad === 270) {
        changeStatusGrid(1, itemChange.x, itemChange.y, itemChange.x + height, itemChange.y + width);
        tempFrozenSelections = gantiTempFrozenSelections(tempFrozenSelections, 1, itemChange.x, itemChange.y, itemChange.x + height, itemChange.y + width);
      }
    }
    else {
      // Reset kondisi semula
      if (itemChange.rotate === 0 || itemChange.rotate === 180) {
        changeStatusGrid(1, itemChange.x, itemChange.y, itemChange.x + width, itemChange.y + height);
        tempFrozenSelections = gantiTempFrozenSelections(tempFrozenSelections, 0, itemChange.x, itemChange.y, itemChange.x + width, itemChange.y + height);
      } else if (itemChange.rotate === 90 || itemChange.rotate === 270) {
        changeStatusGrid(1, itemChange.x, itemChange.y, itemChange.x + height, itemChange.y + width);
        tempFrozenSelections = gantiTempFrozenSelections(tempFrozenSelections, 1, itemChange.x, itemChange.y, itemChange.x + height, itemChange.y + width);
      }
      setOpenModalAlert(true);
      setMsgTitle("Error");
      setMsg("Gagal Rotasi Item\n" + check.message);
    }
  };

  const updatePosition = (idTemp, x, y) => {
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);
    let tempFrozenSelections = frozenSelections;        // dipake supaya ga asyncronous
    const [id, tipe, subRak = ""] = idTemp.split("_");
    let itemChange = shelves.find(item => item.id === id && item.tipe === tipe && item.subRak === subRak);    // variabel untuk penanda item mana yang dipindah

    if (itemChange.rotate === 0 || itemChange.rotate === 180) {   // Digunakan untuk seting layout agar dianggap posisi tersebut belum digunakan (benda diangkat)
      changeStatusGrid(0, itemChange.x, itemChange.y, itemChange.x + itemChange.width - 1, itemChange.y + itemChange.height - 1);
      tempFrozenSelections = gantiTempFrozenSelections(tempFrozenSelections, 0, itemChange.x, itemChange.y, itemChange.x + itemChange.width - 1, itemChange.y + itemChange.height - 1);
    } else if (itemChange.rotate === 90 || itemChange.rotate === 270) {
      changeStatusGrid(0, itemChange.x, itemChange.y, itemChange.x, itemChange.y + 1);
      tempFrozenSelections = gantiTempFrozenSelections(tempFrozenSelections, 0, itemChange.x, itemChange.y, itemChange.x, itemChange.y + 1);
    }

    // ini baru bagian yang pindah item
    let check = checkValid(tempFrozenSelections, snappedX/GRID_SIZE, snappedY/GRID_SIZE, itemChange.width, itemChange.height, itemChange.rotate);
    if ( check.code === 1){
      setShelves(
        shelves.map((item) =>
          item.id === id && item.tipe === tipe && item.subRak === subRak
            ? { ...item, x: snappedX/GRID_SIZE, y: snappedY/GRID_SIZE } : item
        )
      );
      if (itemChange.rotate === 0 || itemChange.rotate === 180) {
        changeStatusGrid(1, snappedX/GRID_SIZE, snappedY/GRID_SIZE, snappedX/GRID_SIZE + itemChange.width - 1, snappedY/GRID_SIZE + itemChange.height - 1);
      } else if (itemChange.rotate === 90 || itemChange.rotate === 270) {
        changeStatusGrid(1, snappedX/GRID_SIZE, snappedY/GRID_SIZE, snappedX/GRID_SIZE + itemChange.height - 1, snappedY/GRID_SIZE + itemChange.width - 1);
      }
    }
    else {
      // Digunakan untuk reset jika gagal
      if (itemChange.rotate === 0 || itemChange.rotate === 180) {
        changeStatusGrid(1, itemChange.x, itemChange.y, itemChange.x + itemChange.width - 1, itemChange.y + itemChange.height - 1);
        tempFrozenSelections = gantiTempFrozenSelections(tempFrozenSelections, 1, itemChange.x, itemChange.y, itemChange.x + itemChange.width - 1, itemChange.y + itemChange.height - 1);
      } else if (itemChange.rotate === 90 || itemChange.rotate === 270) {
        changeStatusGrid(1, itemChange.x, itemChange.y, itemChange.x, itemChange.y + 1);
        tempFrozenSelections = gantiTempFrozenSelections(tempFrozenSelections, 1, itemChange.x, itemChange.y, itemChange.x, itemChange.y + 1);
      }
      setOpenModalAlert(true);
      setMsgTitle("Error");
      setMsg("Gagal Pindah Item\n" + check.message);
    }
  };

  /**
   * Mirip ChangeStatusGrid : Mengubah kondisi grid berdasarkan titik awal dan titik akhir tapi untuk array tertentu (temp)
   * @param {Array} arr = array grid temp yang akan diubah
   * @param {integer} status = berisi 0 (nonaktif) atau 1 (aktif / ada isinya) untuk menandai grid
   * @param {integer} xStart = koordinat grid paling ujung kiri atas
   * @param {integer} yStart = koordinat grid paling ujung kiri atas
   * @param {integer} xEnd = koordinat grid paling ujung kanan bawah
   * @param {integer} yEnd = koordinat grid paling ujung kanan bawah
   * @returns array grid baru yang sudah diganti statusnya
   */
  function gantiTempFrozenSelections(arr, status, xStart, yStart, xEnd = null, yEnd = null) {
    const xAkhir = xEnd !== null ? xEnd : xStart;
    const yAkhir = yEnd !== null ? yEnd : yStart;

    const updatedArr = arr.map(item => {
      const x = item.lti_koordinat_x;
      const y = item.lti_koordinat_y;

      const isInRange =
        x >= Math.min(xStart, xAkhir) &&
        x <= Math.max(xStart, xAkhir) &&
        y >= Math.min(yStart, yAkhir) &&
        y <= Math.max(yStart, yAkhir);

      return isInRange
        ? { ...item, lti_grid_dipakai: status }
        : item;
    });

    return updatedArr;
  }

  const editShelf = async (id, tipe, subRak) => {
    setOpenModalSettingRak(true);
    setSelectShelfCodeToSetting(id);
    setSelectShelfTypeToSetting(tipe);
    setSelectSubRakToSetting(subRak);

    try {
      await axios
        .get(`${URL_GATEWAY}/layoutIgr/getDetailRak?kodeIGR=${kodeIGR}&kodeRak=${id}&tipeRak=${tipe}&subRak=${subRak}`, {
          headers: commonHeaders,
        })
        .then((response) => {
          setDetailSelectShelf(response.data.data);
        })
        .catch(function (error) {
          if (error.message === "Network Error") {
            setMsg("Gagal Terhubung Dengan Gateway");
          } else {
            setMsg(error["response"]?.["data"]?.["status"]);
          }
        });
    } catch (error) {
      console.error("Gagal ambil data:", error);
      setOpenModalAlert(true);
      setMsgTitle("Error");
      setMsg("Layout Gagal Ambil Data\n", toString(error.message));
      throw new Error(error.message);
    }
  };

  const saveLokasiRak = async () => {
    try {
      await axios
        .post(
            `${URL_GATEWAY}/layoutIgr/updateLayoutGrid`,
            {
              kodeIGR: glRegistryDt["glRegistryDt"]["registryOraIGR"],
              data: frozenSelections,
            },
            {
              headers: commonHeaders,
              timeout: 20000,
            }
        )
        .then(async (response) => {
            setOpenModalAlert(true);
            setMsgTitle("Success");
            setMsg("Layout Berhasil Disimpan");
            return true;
        })
        .catch((error) => {
          setOpenModalAlert(true);
          setMsgTitle("Error");
          if (error?.code === "ECONNABORTED") {
              setMsg("Layout Gagal Disimpan\nMaaf, sistem kami sedang lambat saat ini. Silahkan coba lagi");
          } else if (error?.["response"]?.["data"]?.["status"]) {
              setMsg("Layout Gagal Disimpan\n", toString(error["response"]?.["data"]?.["status"]));
          } else {
              setMsg("Layout Gagal Disimpan\n", toString(error.message));
          }
        });

      await axios
        .post(
            `${URL_GATEWAY}/layoutIgr/saveLokasiRak`,
            {
              kodeIGR: glRegistryDt["glRegistryDt"]["registryOraIGR"],
              data: shelves,
            },
            {
              headers: commonHeaders,
              timeout: 20000,
            }
        )
        .then(async (response) => {
            setOpenModalAlert(true);
            setMsgTitle("Success");
            setMsg("Layout Berhasil Disimpan");
            return true;
        })
        .catch((error) => {
            setOpenModalAlert(true);
            setMsgTitle("Error");
            if (error?.code === "ECONNABORTED") {
                setMsg("Layout Gagal Disimpan\nMaaf, sistem kami sedang lambat saat ini. Silahkan coba lagi");
            } else if (error?.["response"]?.["data"]?.["status"]) {
                setMsg("Layout Gagal Disimpan\n", toString(error["response"]?.["data"]?.["status"]));
            } else {
                setMsg("Layout Gagal Disimpan\n", toString(error.message));
            }
        });
    } catch (error) {
      setOpenModalAlert(true);
      setMsgTitle("Error");
      setMsg("Layout Gagal Disimpan\n", toString(error.message));
    }
  }

  return (
    <>
      <ModalAlert
        open={openModalAlert}
        onClose={() => {
          setOpenModalAlert(false);
        }}
      >
        <div className="text-center">
            <img
                src={msgTitle === "Error" ? IcErr : IcSucc}
                alt="Warn"
                className="mx-auto"
            />
            <div className="mx-auto my-4">
                <h3 className="font-black text-gray-800 text-text">{msgTitle}</h3>
                <p
                className="mt-5 text-lg text-gray-500"
                style={{ wordWrap: "break-word" }}
                >
                {msg}
                </p>
            </div>
        </div>
      </ModalAlert>
      
      {/* Modal Setting Rak */}
      <ModalSettingRak
        open={openModalSettingRak}
        onClose={() => setOpenModalSettingRak(false)}
        kodeRak={selectShelfCodeToSetting}
        tipeRak={selectShelfTypeToSetting}
        subRak={selectSubRakToSetting}
        dataDetailRak={detailSelectShelf}
      />

      <div className="flex h-screen">
        <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="container">
          <div className="flex items-center space-x-4 p-1 pb-2">
            <div className="block text-base font-medium w-80">
              <Dropdown
                placeholder={placeholderListJenisItem}
                data={listJenisItem}
                onSelect={handleDropdownSelectedJenisItem}
                selectedOptionParam={chooseJenisItem}
                width="w-80"
              />
            </div>

            <button 
              className={`w-full text-base rounded-md px-3 py-2 font-bold shadow-sm
                                ${isEditMode ? 'bg-gray-400 text-white cursor-not-allowed hover:bg-gray-400' : 
                                    'bg-blue text-white hover:bg-gray-500'}`}
              onClick={addItem}
            >
              Tambah Objek
            </button>
          </div>
          <div className={`flex items-center space-x-4 p-1 pb-2 ${isChooseShelve ? '' : 'hidden'}`}>
            <div className="block text-base font-medium w-40">
              <Dropdown
                placeholder={placeholderShelfCode}
                data={listShelfCode}
                onSelect={handleDropdownSelectedShelfCode}
                selectedOptionParam={selectedShelfCode}
                width="w-80"
              />
            </div>

            <div className="block text-base font-medium w-40">
              <Dropdown
                placeholder={placeholderShelfType}
                data={listShelfType}
                onSelect={handleDropdownSelectedShelfType}
                selectedOptionParam={selectedShelfType}
                width={'w-80'}
              />
            </div>

            <div className="block text-base font-medium w-40">
              <Dropdown
                placeholder={placeholderSubRak}
                data={listSubRak}
                onSelect={handleDropdownSelectedSubRak}
                selectedOptionParam={selectedSubRak}
                width={'w-80'}
              />
            </div>
          </div>
          {/* Grid Container */}
          <p className="text-xs ml-5 p-2"> 1 : 500 (1 grid mewakili 0,5 meter) </p>
          
          <div
              className="relative overflow-auto border border-gray-300 p-2"
              style={{ maxWidth: "100%", maxHeight: "57vh" }}
              ref={gridContainerRef} // <— tambahkan ref ini
              onScroll={(e) => {
                  const scrollLeft = e.target.scrollLeft;
                  const scrollTop = e.target.scrollTop;
                  setScrollPos({ left: scrollLeft, top: scrollTop });
              }}
          >
          {/* Penanda Angka - Horizontal (atas) */}
          <div
              className="absolute top-0 left-[40px] flex bg-gray-200 text-xs font-semibold"
              style={{
              transform: `translateY(${scrollPos.top}px)`,
              zIndex: 8,
              }}
          >
              {Array.from({ length: gridWidth }).map((_, i) => (
              <div
                  key={i}
                  className="flex items-center justify-center border-r border-gray-300"
                  style={{ width: GRID_SIZE, height: 20 }}
              >
                  {i}
              </div>
              ))}
          </div>

          {/* Penanda Angka - Vertikal (kiri) */}
          <div
              className="absolute top-[20px] left-0 flex flex-col bg-gray-200 text-xs font-semibold"
              style={{
              transform: `translateX(${scrollPos.left}px)`,
              zIndex: 8,
              }}
          >
              {Array.from({ length: gridHeight }).map((_, i) => (
              <div
                  key={i}
                  className="flex items-center justify-center border-b border-gray-300"
                  style={{ height: GRID_SIZE, width: 40 }}
              >
                  {i}
              </div>
              ))}
          </div>
            {/* Grid Area */}
            <div
                className="grid-area border border-dashed border-gray-400 bg-gray-100"
                style={{ 
                  width: `${gridWidth * GRID_SIZE}px`, 
                  height: `${gridHeight * GRID_SIZE}px`,
                  marginLeft: 32, // memberi ruang untuk label kiri
                  marginTop: 12, // memberi ruang untuk label atas
                }}
            >
              {frozenSelections.map((box) => (
                  <div
                      key={box.lti_kode_layout_toko}
                      className="selection-frozen"
                      style={{
                          left: box.lti_koordinat_x * GRID_SIZE,
                          top: box.lti_koordinat_y * GRID_SIZE,
                          width: GRID_SIZE,
                          height: GRID_SIZE,
                      }}
                  />
              ))}

              {shelves.map((item) => (
                <Rnd
                  key={item.idTemp}
                  size={{ 
                    width: item.rotate === 0 || item.rotate === 180 ? item.width * GRID_SIZE : item.height * GRID_SIZE, 
                    height: item.rotate === 0 || item.rotate === 180 ? item.height * GRID_SIZE : item.width * GRID_SIZE, 
                  }}
                  position={{ x: item.x * GRID_SIZE, y: item.y * GRID_SIZE}}
                  onDragStop={(e, d) => updatePosition(item.idTemp, d.x, d.y)}
                  grid={[GRID_SIZE, GRID_SIZE]}
                  bounds="parent"
                  enableResizing={false}
                >
                  <div style={{ width: "100%", height: "100%" }} >
                    <img
                    style={{
                      transformOrigin: "center",
                      width: "100%",
                      height: "100%",
                      display: "block",
                      userSelect: "none",          // Biar tidak terseret seleksi
                      pointerEvents: "none"        // Penting: biar drag tidak ditahan oleh img
                    }}
                    src = {item.tipe === "IKS" ? IkiosImg :
                      item.tipe === "KSR" ? 
                      (item.rotate === 0 ? KasirImgR0 :
                        item.rotate === 90 ? KasirImgR90 :
                        item.rotate === 180 ? KasirImgR180 :
                        KasirImgR270) :
                      item.tipe === 'B' ? 
                      (item.rotate === 0 ? RakBeamImgR0 :
                        item.rotate === 90 ? RakBeamImgR90 :
                        item.rotate === 180 ? RakBeamImgR180 :
                        RakBeamImgR270)
                      : 
                      (item.rotate === 0 ? RakInnerImgR0 :
                        item.rotate === 90 ? RakInnerImgR90 :
                        item.rotate === 180 ? RakInnerImgR180:
                        RakInnerImgR270)
                    }
                    alt = {item.tipe === 'B' ? "Rak Beam" : "Rak Inner"}
                    />
                  </div>
                  
                </Rnd>
              ))}
            </div>
            {/* Grid Area - End */}
          </div>
          {/* Grid Container - End */}
          {/* Container List Item */}
          <div
              className="overflow-auto border border-gray-300 m-2 text-sm scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
              style={{ 
                maxWidth: "100%", 
                maxHeight: "12vh"
              }}
          >
            {shelves.map((item) => (
              <div>
                <p className="text-xs">
                {/* <div className="actions"> */}
                  <button 
                    className={`text-[0.5rem] m-0.5 px-2 rounded-md p-0.5 shadow-sm bg-blue hover:bg-gray-500 
                    ${item.tipe === "IKS" ? 'hidden' : 'unhidden'}`}
                    onClick={() => rotateShelf(item.idTemp)}>
                      🔄
                  </button>
                  <button 
                    className="text-[0.5rem] m-0.5 px-2 rounded-md p-0.5 shadow-sm bg-blue hover:bg-gray-500" 
                    onClick={() => removeShelf(item.idTemp)}>
                      🗑️
                  </button>
                  <button 
                    className={`text-[0.5rem] m-0.5 px-2 rounded-md p-0.5 shadow-sm bg-blue hover:bg-gray-500 
                    ${item.tipe === "IKS" || item.tipe === "KSR" ? 'hidden' : 'unhidden'}`}
                    onClick={() => editShelf(item.id, item.tipe, item.subRak)}>
                      ✏️
                  </button>
                {/* </div> */}
                ({item.tipe === "KSR" || item.tipe === "IKS" ? 
                  item.id + ", " + item.tipe 
                  : 
                  item.id + ", " + item.tipe + ", " + item.subRak})
                ({item.x}, {item.y})
                </p>
              </div>
            ))}
          </div>

          {/* Grid Container - End */}
          <div className="toolbar">
            <button 
              className={`w-full text-base rounded-md px-3 py-2 font-bold shadow-sm
                                ${isEditMode ? 'bg-gray-400 text-white cursor-not-allowed hover:bg-gray-400' : 
                                    'bg-blue text-white hover:bg-gray-500'}`}
              onClick={saveLokasiRak}
              // onClick={saveP}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingLokasiRak;