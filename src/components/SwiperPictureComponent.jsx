import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/free-mode";

import { Pagination } from "swiper/modules";

function SwiperPictureComponent({ data, slidesPerView, type }) {
  return (
    <Swiper
      slidesPerView={slidesPerView}
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
      {data.map((item, itemIndex) => (
        <SwiperSlide>
          {type === "1 Pic" ? (
            <div
              key={itemIndex}
              className="flex flex-col mb-14 group relative shadow-lg bg-white  bg-stroke text-white rounded-xl py-8 h-[599px] overflow-hidden cursor-pointer"
            ></div>
          ) : (
            <div
              key={itemIndex}
              className="flex flex-col mb-14 group relative shadow-lg bg-white bg-stroke text-white rounded-xl h-[461px] w-[100%] overflow-hidden cursor-pointer"
            ></div>
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default SwiperPictureComponent;
