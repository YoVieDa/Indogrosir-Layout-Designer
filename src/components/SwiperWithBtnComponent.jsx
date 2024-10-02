import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { useNavigate } from "react-router-dom";
import StandardBtn from "./StandardBtn";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/free-mode";

import { Pagination } from "swiper/modules";

function SwiperWithBtnComponent({ data, path }) {
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/tableTopSpender");
  };
  return (
    <Swiper
      slidesPerView={1}
      spaceBetween={15}
      pagination={{
        clickable: true,
        renderBullet: (index, className) => {
          return `<span class="${className} inline-block w-6 h-6 leading-6 text-center bg-gray-200 rounded-full font-semibold text-black mx-1 hover:bg-gray-400 cursor-pointer">${
            index + 1
          }</span>`;
        },
      }}
      modules={[Pagination]}
      className="max-w-[70%]"
    >
      <Swiper
        slidesPerView={1}
        spaceBetween={15}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        className="max-w-[70%]"
      >
        {data.map((item, itemIndex) => (
          <SwiperSlide>
            <div
              key={itemIndex}
              className="flex flex-col mb-5 group relative shadow-lg bg-stroke bg-white text-white rounded-xl h-[461px] w-[40%] overflow-hidden cursor-pointer"
            >
              <img src={item} alt="Gambar Loyalty IGR" />
            </div>
            <button
              onClick={handleNavigate}
              className={`w-[40%] h-[96px] rounded-xl mb-14 bg-blue p-3 text-subText font-bold text-white active:bg-gray-100`}
            >
              Cek Pencapaian
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </Swiper>
  );
}

export default SwiperWithBtnComponent;
