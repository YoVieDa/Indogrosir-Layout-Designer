import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const ModalPilihProduk = ({ listProduk, onSelectProduct}) => {
  const glRegistryDt = useSelector((state) => state.glRegistry.dtDecryptedRegistry);
  const URL_GATEWAY = useSelector((state) => state.glRegistry.dtGatewayURL);
  const kodeIGR = glRegistryDt.glRegistryDt["registryOraIGR"];

  const [selectPLU, setSelectPLU] = useState("");
  const [selectProduct, setSelectProduct] = useState("");
  const [specificProduct, setSpecificProduct] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);

  const scrollContainerRef = useRef(null);

  // Genereate awal
  useEffect(() => {
    // Fungsi ambil data grid di awal
    const fetchData = async () => {
      setSpecificProduct("");
    };
    fetchData(); // panggil saat komponen pertama kali dirender
  }, []); // dependency kosong => hanya sekali jalan

  // Fungsi pencarian fleksibel: cocokkan semua kata
  const filteredList = listProduk.filter((produk) => {
    if (!specificProduct.trim()) return true;

    const searchWords = specificProduct.toLowerCase().split(" ").filter(Boolean);
    const deskripsi = produk.prd_deskripsipanjang.toLowerCase();
    const kode = produk.prd_prdcd.toLowerCase();

    // semua kata harus ada dalam deskripsi atau kode
    return searchWords.every((word) => deskripsi.includes(word) || kode.includes(word));
  });

  const visibleData = filteredList.slice(0, visibleCount);

  const searchPLU = () => {
    if (selectPLU && onSelectProduct) {
      onSelectProduct(selectPLU); // panggil callback
    }
  };

  const handleLoadMore = () => {
    if (visibleCount < filteredList.length) {
      setVisibleCount((prev) => prev + 20);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          handleLoadMore();
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [visibleCount, filteredList.length]);

  useEffect(() => {
    setVisibleCount(20);
  }, [specificProduct]);

  return (
    <>
      <div>
        <div className="m-3">
          <div className="flex items-center space-x-4 p-4">
            <input
              type="text"
              placeholder={"Masukkan Produk yang Dicari"}
              value={specificProduct}
              onChange={(e) => setSpecificProduct(e.target.value)}
              className="drop-shadow-lg w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>
          <p className="w-full flex text-gray-400 text-xs">
            * Jika produk yang kamu cari tidak muncul, berikan nama yang lebih spesifik
          </p>
        </div>

        {/* Container scrollable */}
        <div
          ref={scrollContainerRef}
          className="flex items-start container overflow-y-auto"
          style={{ maxWidth: "100%", maxHeight: "500px" }}
        >
          <div className="w-[100%] min-h-[800px] flex items-start px-4 py-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {visibleData.map((data, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectPLU(data.prd_prdcd);
                    setSelectProduct(data.prd_deskripsipanjang);
                  }}
                  className="bg-white shadow-md border border-gray-200 rounded-md p-2 cursor-pointer hover:shadow-lg transition"
                >
                  {/* Gambar Placeholder */}
                  <div className="w-full h-28 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                    Gambar
                  </div>

                  {/* Deskripsi */}
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {data.prd_deskripsipanjang}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{data.prd_prdcd}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="toolbar mt-4">
          <p className="w-full flex items-center justify-center text-gray-400 text-xs m-2">
            {selectProduct}
          </p>
          <button
            className={`w-full text-base rounded-md px-3 py-2 font-bold shadow-sm bg-orange-500 text-white hover:bg-orange-600 transition`}
            onClick={searchPLU}
          >
            Cari
          </button>
        </div>
      </div>
    </>
  );
};

export default ModalPilihProduk;
