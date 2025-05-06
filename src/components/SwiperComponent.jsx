import React, { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/free-mode";
import MenuBtn from "./MenuBtn";

import { Pagination } from "swiper/modules";
import { useSelector } from "react-redux";

function SwiperComponent({ data, data2, isLandscape, onMenuComponentProp }) {
  const longestText = Math.max(...data.map((text) => text.title.length));
  const landscape = useSelector((state) => state.glDtOrientation.dtLandscape);
  const shiftState = useSelector((state) => state.glRegistry.shiftState);
  return (
    <Swiper
      slidesPerView={1}
      spaceBetween={15}
      pagination={{
        clickable: true,
        renderBullet: (index, className) => {
          return `<span class="${className} -mt-5 inline-block w-6 h-6 leading-6 text-center bg-gray-200 rounded-full font-semibold text-black mx-1 hover:bg-gray-400 cursor-pointer">${
            index + 1
          }</span>`;
        },
      }}
      modules={[Pagination]}
      className={`${isLandscape ? "w-[56.5%]" : "w-[68%]"}`}
    >
      <SwiperSlide>
        <div
          className={`${
            isLandscape
              ? "inline-grid justify-center grid-cols-3 gap-1 mb-16 align-middle"
              : "inline-grid justify-center grid-cols-2 gap-1 mb-16 align-middle"
          }`}
        >
          {data.map((item, itemIndex) => (
            <MenuBtn
              key={itemIndex}
              rounded={
                itemIndex === 0 && isLandscape
                  ? "rounded-tl-xl"
                  : itemIndex === 3 && isLandscape
                  ? "rounded-bl-xl"
                  : itemIndex === 2 && isLandscape
                  ? "rounded-tr-xl"
                  : itemIndex === data.length - 1 && isLandscape
                  ? "rounded-br-xl"
                  : itemIndex === 0 && !isLandscape
                  ? "rounded-tl-xl"
                  : itemIndex === 4 && data.length - 1 <= 5 && !isLandscape
                  ? "rounded-bl-xl"
                  : itemIndex === 2 && data.length - 1 < 4 && !isLandscape
                  ? "rounded-bl-xl"
                  : itemIndex === 1 && !isLandscape
                  ? "rounded-tr-xl"
                  : itemIndex === data.length - 1 && !isLandscape
                  ? "rounded-br-xl"
                  : null
              }
              icon={item.icon}
              title={item.title}
              longest={longestText}
              path={item.path}
              disabled={
                shiftState === false && item.title === "Belanja" ? true : false
              }
              className="mb-4"
              onMenuClickProp={onMenuComponentProp}
            />
          ))}
        </div>
      </SwiperSlide>

      {data2 ? (
        <SwiperSlide>
          <div
            className={`${
              isLandscape
                ? "inline-grid justify-center grid-cols-3 gap-1 mb-16 align-middle"
                : "inline-grid justify-center grid-cols-2 gap-1 mb-16 align-middle"
            }`}
          >
            {data2.map((item, itemIndex) => (
              <MenuBtn
                key={itemIndex}
                icon={item.icon}
                rounded={
                  itemIndex === 0 && isLandscape
                    ? "rounded-tl-xl"
                    : itemIndex === 3 && isLandscape
                    ? "rounded-bl-xl"
                    : itemIndex === 2 && isLandscape
                    ? "rounded-tr-xl"
                    : itemIndex === data.length - 1 && isLandscape
                    ? "rounded-br-xl"
                    : itemIndex === 0 && !isLandscape
                    ? "rounded-tl-xl"
                    : itemIndex === 4 && data.length - 1 < 5 && !isLandscape
                    ? "rounded-bl-xl"
                    : itemIndex === 2 && data.length - 1 < 4 && !isLandscape
                    ? "rounded-bl-xl"
                    : itemIndex === 1 && !isLandscape
                    ? "rounded-tr-xl"
                    : itemIndex === data.length - 1 && !isLandscape
                    ? "rounded-br-xl"
                    : null
                }
                title={item.title}
                longest={longestText}
                path={item.path}
                disabled={
                  shiftState === false && item.title === "Belanja"
                    ? true
                    : false
                }
                className="mb-4"
                onMenuClickProp={onMenuComponentProp}
              />
            ))}
          </div>
        </SwiperSlide>
      ) : null}
    </Swiper>
  );
}

export default SwiperComponent;
