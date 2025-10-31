import React, { useEffect, useState, useRef } from "react";
import "./style/SettingRuangan.css";
import ModalAlert from "../../components/ModalAlert";
import { AESEncrypt, LOGIN_KEY, LAYOUT_IGR_KEY } from "../../config";
import Sidebar from "../../components/Sidebar";
import { IcSucc, IcErr } from "../../assets";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

const GRID_SIZE = 20;       // Skala grid

const snapToGridStart = (value) => Math.floor(value / GRID_SIZE) * GRID_SIZE; // Fungsi Pembulatan Grid untuk pilih grid awal
const snapToGridEnd = (value) => Math.ceil(value / GRID_SIZE) * GRID_SIZE; // Fungsi Pembulatan Grid untuk pilih grid akhir


const SettingRuangan = () => {
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


    const [frozenSelections, setFrozenSelections] = useState([]);
    const [tempFrozenSelections, setTempFrozenSelections] = useState([]); //Simpan sementara data grid dari api, nanti kalo emang ada baru dijadiin asli yang di atas
    const [selecting, setSelecting] = useState(false);
    const [selectionBox, setSelectionBox] = useState(null);

    // Variabel khusus untuk membuat modal sukses atau gagal
    const [openModalAlert, setOpenModalAlert] = useState(false);
    const [msgTitle, setMsgTitle] = useState("");
    const [msg, setMsg] = useState("");


    const [inputWidth, setInputWidth] = useState("");
    const [inputHeight, setInputHeight] = useState("");
    const [gridWidth, setGridWidth] = useState(0);
    const [gridHeight, setGridHeight] = useState(0);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isEditMode, setEditMode] = useState(false);
    const [isShowGridStartEnd, setIsShowGridStartEnd] = useState(false);

    // Variabel untuk add grid by form
    const [inputXAwal, setInputXAwal] = useState("");
    const [inputYAwal, setInputYAwal] = useState("");
    const [inputXAkhir, setInputXAkhir] = useState("");
    const [inputYAkhir, setInputYAkhir] = useState("");

    const gridContainerRef = useRef(null);
    const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });


    useEffect(() => {
        // Fungsi ambil data grid di awal
        const fetchData = async () => {
        try {
            await axios
            .get(`${URL_GATEWAY}/layoutIgr/getLayoutGrid?kodeIGR=${kodeIGR}`, {
                headers: commonHeaders,
            })
            .then((response) => {
                const renamedData = response.data.data.map(({ lti_koordinat_x, lti_koordinat_y, ...rest }) => ({
                    ...rest,
                    x: lti_koordinat_x,
                    y: lti_koordinat_y,
                }));

                setTempFrozenSelections(renamedData);
            })
            .catch(function (error) {
                console.log(error.message);
                if (error.message === "Network Error") {
                    setMsg("Gagal Terhubung Dengan Gateway");
                } else {
                // setMsg(error["response"]?.["data"]?.["status"]);
                    setMsg(error["response"]?.["status"]);
                }
            });
        } catch (error) {
            console.error("Gagal ambil data:", error);
            setOpenModalAlert(true);
            setMsgTitle("Error");
            setMsg("Layout Gagal Disimpan\n", toString(error.message));
            throw new Error(error.message);
        }
        };

        fetchData(); // panggil saat komponen pertama kali dirender
    }, []); // dependency kosong => hanya sekali jalan

    useEffect(() => {
        if (tempFrozenSelections.length > 0) {
            const maxX = Math.max(...tempFrozenSelections.map(item => item.x));
            const maxY = Math.max(...tempFrozenSelections.map(item => item.y));
            setGridWidth(maxX + 2);
            setGridHeight(maxY + 1);
            setEditMode(true);
            // Simpan temp frozen ke frozen asli dan ga perlu refresh temp
            setFrozenSelections(tempFrozenSelections);
        }
    }, [tempFrozenSelections]);


    const setGrid = () => {
        // Fungsi yang akan dijalankan saat inputan sudah diisi dan ditekan tombol Set Grid
        setGridWidth(parseInt(inputWidth));
        setGridHeight(parseInt(inputHeight));

        setFrozenSelections(tempFrozenSelections.length === 0 ? [] : tempFrozenSelections);
        setIsShowGridStartEnd(true);
    }

    const addGrid = () => {
        // Masih agak error, harus klik 2x dulu baru update UI
        if (inputXAwal === "" || inputXAkhir === "" || inputYAwal === "" || inputYAkhir === "") {
            setOpenModalAlert(true);
            setMsgTitle("Error");
            setMsg("Ada input yang belum diisi!");
            return;
        }

        let xAwal = parseInt(inputXAwal);
        let yAwal = parseInt(inputYAwal);
        let xAkhir = parseInt(inputXAkhir);
        let yAkhir = parseInt(inputYAkhir);

        if (xAwal < 0 || xAwal > gridWidth - 1 || xAkhir < 0 || xAkhir > gridWidth - 1 ||
            yAwal < 0 || yAwal > gridHeight - 1 || yAkhir < 0 || yAkhir > gridHeight - 1) {
                setOpenModalAlert(true);
                setMsgTitle("Error");
                setMsg("Input melebihi grid yang ada!");
                return;
        }

        if (xAkhir < xAwal || yAkhir <  yAwal) {
            setOpenModalAlert(true);
            setMsgTitle("Error");
            setMsg("Titik akhir harus lebih besar dari titik awal!");
            return;
        }

        // Fungsi yang akan dijalankan saat inputan sudah diisi dan ditekan tombol Add Grid
        for (let i = xAwal; i <= xAkhir; i++) {
            for (let j = yAwal; j <= yAkhir; j++) {
                let isDuplicate = false;
                // Cek apakah area yang dipilih ada di dalam area yang lain, jika iya hapus aja, jika tidak bisa ditambahkan
                frozenSelections.forEach(element => {
                    if ((i === element.x) && (j === element.y)) {
                        isDuplicate = true;
                    }
                });
                if (isDuplicate === false) {
                    setFrozenSelections((prev) => [...prev, {x : i, y : j, used: 0}])
                }
            }
        }

        setInputXAwal("");
        setInputYAwal("");
        setInputXAkhir("");
        setInputYAkhir("");
    }

    const buttonEditClick = () => {
        setEditMode(!isEditMode);
        setIsShowGridStartEnd(isEditMode);
    }

    const finalizeSelection = () => {
        // coba fungsi baru untuk menyimpan area yang sudah dipilih
        if (!selectionBox) return;      // Cegat kalau tidak ada yang diseleksi

        const { startX, startY, endX, endY } = selectionBox;
        if (startX === endX && startY === endY) return;     // Cegat kalau hanya diklik

        const box = {
            startX: Math.min(startX, endX)/GRID_SIZE,
            endX: Math.max(startX, endX)/GRID_SIZE,
            startY: Math.min(startY, endY)/GRID_SIZE,
            endY: Math.max(startY, endY)/GRID_SIZE,
        };
        // setFrozenSelections((prev) => [...prev, box]);

        for (let i = box.startX; i < box.endX; i++) {
            for (let j = box.startY; j < box.endY; j++) {
                let isDuplicate = false;
                // Cek apakah area yang dipilih ada di dalam area yang lain, jika iya hapus aja, jika tidak bisa ditambahkan
                frozenSelections.forEach(element => {
                    if ((i === element.x) && (j === element.y)) {
                        isDuplicate = true;
                    }
                });
                if (isDuplicate === false) {
                    setFrozenSelections((prev) => [...prev, {x : i, y : j, used: 0}])
                }
            }
        }

        // if (isDuplicate === false) setFrozenSelections((prev) => [...prev, box]);
        setSelectionBox(null);      // Hapus template select box
    };

    const saveLayoutGrid = async () => {
        try {
            await axios
            .post(
                `${URL_GATEWAY}/layoutIgr/saveLayoutGrid`,
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
        } catch (error) {
            setOpenModalAlert(true);
            setMsgTitle("Error");
            setMsg("Layout Gagal Disimpan\n", toString(error.message));
        }
    }

    useEffect(() => {               // ini fungsi jika mouse dilepas di luar grid, maka dia akan mengambil grid maksimal
        const handleMouseUp = () => {
            if (selecting) {
                setSelecting(false);
                finalizeSelection();
            }
        };

        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [selecting, selectionBox]); // dependency array


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

        <div className="flex h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="container">
                <div className="flex items-center space-x-4 p-4">
                    <label className="block text-base font-medium text-gray-700">Tinggi</label>
                    <input
                        type="text"
                        placeholder={"Panjang"}
                        value={isEditMode ? gridHeight : (inputHeight === "" ? "" : inputHeight)}
                        onChange={(e) => setInputHeight(e.target.value)}
                        className="drop-shadow-lg w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                        disabled={isEditMode}
                    />
                    <label className="block text-base font-medium text-gray-700">Lebar</label>
                    <input
                        type="text"
                        placeholder={"Lebar"}
                        value={isEditMode ? gridWidth : (inputWidth === "" ? "" : inputWidth)}
                        onChange={(e) => setInputWidth(e.target.value)}
                        className="drop-shadow-lg w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                        disabled={isEditMode}
                    />
                    <button 
                        className={`w-full text-base rounded-md px-3 py-2 font-bold shadow-sm
                                ${isEditMode ? 'bg-gray-400 text-white cursor-not-allowed hover:bg-gray-400' : 
                                    'bg-blue text-white hover:bg-gray-500'}`}
                        disabled={isEditMode}
                        onClick={setGrid}
                    >
                        Set Area
                    </button>
                    <button 
                        className={`w-full text-base rounded-md px-3 py-2 font-bold shadow-sm
                                ${isEditMode ? 'bg-blue text-white hover:bg-gray-500' : 
                                    'bg-gray-400 text-white cursor-not-allowed hover:bg-gray-400'}`}
                        disabled={!isEditMode}
                        onClick={buttonEditClick}
                    >
                        Edit
                    </button>
                </div>
                <p className="text-xs ml-5"> 1 : 500 (1 grid mewakili 0,5 meter) </p>
                <p className="text-xs ml-5"> Drag and drop sesuai pada garis atau isi berdasarkan input di bawah </p>
                <p className={`text-xs ml-5 ${isShowGridStartEnd ? "unhidden" : "hidden"}`}> Titik minimal (0, 0) dan titik maksimal adalah ({gridWidth-1}, {gridHeight-1}) </p>

                <div 
                    className={`
                    flex items-center space-x-4 p-4
                    ${isShowGridStartEnd ? "unhidden" : "hidden"}`}
                >
                    <input
                        type="text"
                        placeholder={"X Awal"}
                        value={inputXAwal === "" ? "" : inputXAwal}
                        onChange={(e) => setInputXAwal(e.target.value)}
                        className="drop-shadow-lg w-20 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                        disabled={isEditMode}
                    />
                    <input
                        type="text"
                        placeholder={"Y Awal"}
                        value={inputYAwal === "" ? "" : inputYAwal}
                        onChange={(e) => setInputYAwal(e.target.value)}
                        className="drop-shadow-lg w-20 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                        disabled={isEditMode}
                    />
                    <input
                        type="text"
                        placeholder={"X Akhir"}
                        value={inputXAkhir === "" ? "" : inputXAkhir}
                        onChange={(e) => setInputXAkhir(e.target.value)}
                        className="drop-shadow-lg w-20 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                        disabled={isEditMode}
                    />
                    <input
                        type="text"
                        placeholder={"Y Akhir"}
                        value={inputYAkhir === "" ? "" : inputYAkhir}
                        onChange={(e) => setInputYAkhir(e.target.value)}
                        className="drop-shadow-lg w-20 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                        disabled={isEditMode}
                    />
                    <button 
                        className={`w-full text-base rounded-md px-3 py-2 font-bold shadow-sm
                                ${isEditMode ? 'bg-gray-400 text-white cursor-not-allowed hover:bg-gray-400' : 
                                    'bg-blue text-white hover:bg-gray-500'}`}
                        disabled={isEditMode}
                        onClick={addGrid}
                    >
                        Add Grid
                    </button>
                </div>

                {/* Grid Container */}
                <div
                    className="relative overflow-auto border border-gray-300 p-2"
                    style={{ maxWidth: "100%", maxHeight: "60vh" }}
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
                    zIndex: 20,
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
                    zIndex: 20,
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
                    className="grid-area-set-room border border-dashed border-gray-400 bg-gray-100 relative"
                    style={{
                    width: `${gridWidth * GRID_SIZE}px`,
                    height: `${gridHeight * GRID_SIZE}px`,
                    marginLeft: 32, // memberi ruang untuk label kiri
                    marginTop: 12, // memberi ruang untuk label atas
                    }}
                    {...(!isEditMode && {
                    onMouseDown: (e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = snapToGridStart(e.clientX - rect.left);
                        const y = snapToGridStart(e.clientY - rect.top);
                        setSelectionBox({ startX: x, startY: y, endX: x, endY: y });
                        setSelecting(true);
                    },
                    onMouseMove: (e) => {
                        if (!selecting) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = snapToGridEnd(e.clientX - rect.left);
                        const y = snapToGridEnd(e.clientY - rect.top);
                        setSelectionBox((prev) => ({ ...prev, endX: x, endY: y }));
                    },
                    })}
                >
                    {selectionBox && (
                    <div
                        className="selection-box absolute border-2 border-blue-400 bg-blue-200/20"
                        style={{
                        left: Math.min(selectionBox.startX, selectionBox.endX),
                        top: Math.min(selectionBox.startY, selectionBox.endY),
                        width: Math.abs(selectionBox.endX - selectionBox.startX),
                        height: Math.abs(selectionBox.endY - selectionBox.startY),
                        }}
                    />
                    )}
                    {frozenSelections.map((box, idx) => (
                    <div
                        key={idx}
                        className="selection-frozen absolute bg-green-300/50 border border-green-600"
                        style={{
                        left: box.x * GRID_SIZE,
                        top: box.y * GRID_SIZE,
                        width: GRID_SIZE,
                        height: GRID_SIZE,
                        }}
                    />
                    ))}
                </div>
                </div>
                {/* Grid Container - End */}

                <div className="flex items-center space-x-4 pt-4">    
                    <button 
                        className={`w-full text-base rounded-md px-3 py-2 font-bold shadow-sm
                                ${isEditMode ? 'bg-gray-400 text-white cursor-not-allowed hover:bg-gray-400' : 
                                    'bg-blue text-white hover:bg-gray-500'}`}
                        onClick={saveLayoutGrid}
                        disabled={isEditMode}
                    >
                        Simpan Layout
                    </button>
                </div>
            </div>
        </div>
        </>
    );
};

export default SettingRuangan;