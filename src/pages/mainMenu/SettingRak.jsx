import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { X } from "react-feather";

const SettingRak = ({open, onClose, landscape, kodeRak, tipeRak, subRak, dataDetailRak, pluSearch}) => {
  const glRegistryDt = useSelector((state) => state.glRegistry.dtDecryptedRegistry);
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const kodeIGR = glRegistryDt.glRegistryDt["registryOraIGR"];
  // const kodeRak = {kodeRak};

  // Variabel khusus untuk membuat modal sukses atau gagal
  const [openModalAlert, setOpenModalAlert] = useState(false);
  const [msgTitle, setMsgTitle] = useState("");
  const [msg, setMsg] = useState("");

  const [showTooltip, setShowTooltip] = useState(false);
  const [msgToolTip, setMsgToolTip] = useState("");

  // Variabel Detail Rak
  const dataDetailShelving = dataDetailRak.data;
  const shelving = dataDetailRak.shelving;

  const displayRak = [];

  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: "",
  });

  const handleOnClickItem = (e, textData) => {
    if (tooltip.text === textData && tooltip.visible === true) {
      setTooltip({
        visible: false
      });
    }
    else {
      setTooltip({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        text: textData,
      });
    }
  };

  const removeToolTipItem = () => {
    setTooltip({
      visible: false
    });
  }

  // Ini buat bagian item yang di show dalam rak
  if (dataDetailShelving != null && shelving != null) {
    let displayRow = [];
    shelving.forEach((shelf) => {
      dataDetailShelving.forEach((data) => {
        
        if (data.lks_shelvingrak == shelf.lks_shelvingrak) {    // buat per item
          displayRow.push(
            <div className={"flex w-[100%] h-[50px]"} >
              <div 
                className={`flex-1 w-[10px] h-[100px] border items-center justify-center flex 
                            ${data.lks_prdcd === pluSearch ? "bg-[#D1FAE5]" : "bg-white"}`}
                style={{
                  border: "2px solid rgba(14, 165, 233, 0.2)",
                }}
                onClick={(e) => handleOnClickItem(e, data.prd_deskripsipanjang)}
              >
                <p className="text-xs text-center truncate">{data.lks_prdcd}</p>
              </div>
            </div>
          )
        }
      });
      displayRak.push(        // Satu shelving jadi
        <div className={"flex w-[100%] h-[100px]"}>
          {displayRow}
        </div>
      )
      displayRow = [];
      displayRak.push(
        <div className={"w-[100%] h-[20px] bg-[#CBD5E1] show-rak"}></div>
      )
    });
  }

  const thisOnClose = () => {
    if (onClose) onClose();
  };

  

  return (
    <div
      className={`
      fixed inset-0 flex justify-center items-center transition-colors
      ${open ? "visible bg-black/20" : "invisible"} z-20
    `}
    >
      {/* modal */}
      
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute px-3 py-1 bg-black text-white text-sm rounded shadow-lg pointer-events-none transition-all duration-75"
          style={{
            left: tooltip.x + 15 + "px", // muncul di samping kanan kursor
            top: tooltip.y + 15 + "px",  // sedikit di bawah kursor
            position: "fixed", // supaya ikut kursor di seluruh layar
            zIndex: 1000,
          }}
        >
          {tooltip.text}
        </div>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className={`
        bg-white rounded-xl shadow transition-all
        ${open ? "scale-100 opacity-100" : "scale-125 opacity-0"} relative w-[90%] h-[650px]
      `}
      >
        <button
          onClick={thisOnClose}
          className="absolute p-1 text-gray-800 rounded-lg top-2 right-2 hover:text-gray-200"
        >
          <X size="24px" />
        </button>
        
        <div className="m-10 mb-5">
          <div className="flex items-center space-x-4 p-1">
            <label className="block text-base font-medium text-gray-700 w-[50%]">Kode Rak</label>
            <input
                type="text"
                value={kodeRak}
                className="drop-shadow-lg w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                disabled="true"
            />
          </div>
          <div className="flex items-center space-x-4 p-1">
            <label className="block text-base font-medium text-gray-700 w-[50%]">Sub Rak</label>
            <input
                type="text"
                value={subRak}
                className="drop-shadow-lg w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                disabled="true"
            />
          </div>
          <div className="flex items-center space-x-4 p-1">
            <label className="block text-base font-medium text-gray-700 w-[50%]">Tipe Rak</label>
            <input
                type="text"
                value={tipeRak}
                className="drop-shadow-lg w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                disabled="true"
            />
          </div>
        </div>

        {/* //cildren */}
        <div className="m-5">
          {/* Detail Rak */}
          <div 
            className="flex items-start container overflow-y-auto"
            style={{ maxWidth: "100%", maxHeight: "1000px" }}            // Batas untuk kontainer supaya bisa di scroll
            onScroll={removeToolTipItem}
          >
            <div className="w-[100%] h-[400px] flex items-start">     {/* Container untuk Scrolling !! JANGAN DIUBAH !!! */}
              <div className="w-[40px] h-[1000px] bg-[#1E293B] show-rak"></div>

              <div className={
                tipeRak === "B"
                  ? "w-[750px] h-[1000px] bg-[#E2E8F0] show-rak"    //( skala 1 kotak = 150 px = +- 0.5 meter) (ini satu sub rak beam)
                  : "w-[750px] h-[1000px] bg-[#E2E8F0] show-rak"
              }>
                {displayRak}
              </div>

              <div className="w-[40px] h-[1000px] bg-[#1E293B] show-rak"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingRak;