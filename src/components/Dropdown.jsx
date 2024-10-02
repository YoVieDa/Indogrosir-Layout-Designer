import { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useSelector } from "react-redux";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Dropdown({
  data,
  placeholder,
  onSelect,
  size,
  selectedOptionParam,
  landscape,
}) {
  const [selectedOption, setSelectedOption] = useState(selectedOptionParam);

  useEffect(() => {
    setSelectedOption(selectedOptionParam);
  }, [selectedOptionParam]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    onSelect(option);
  };

  return (
    <Menu as="div" className="relative inline-block text-left ">
      {size === "sm" ? (
        <>
          <div>
            <Menu.Button
              className={`inline-flex ${
                landscape ? "w-[42vh] h-[6vh]" : "w-[25vh] h-[4vh]"
              }  z-10 justify-between gap-x-1.5 rounded-md bg-white px-3 py-2 text-subText text-left shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50`}
            >
              {selectedOption ? selectedOption : placeholder}
              <ChevronDownIcon
                className="w-10 h-10 ml-auto -mr-1 text-black"
                aria-hidden="true"
              />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              className={`absolute ${
                landscape ? "w-[42vh]" : "w-[25vh]"
              } z-10 mt-2 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-44 overflow-y-auto`}
            >
              {data !== null
                ? data.map((i, index) => {
                    return (
                      <div className="py-1" key={index}>
                        <Menu.Item>
                          {({ active }) => (
                            <p
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-black"
                                  : "text-gray-700",
                                "block px-4 py-2 text-[24px]"
                              )}
                              onClick={() => handleOptionSelect(i)}
                            >
                              {i}
                            </p>
                          )}
                        </Menu.Item>
                      </div>
                    );
                  })
                : "Tidak ada data"}
            </Menu.Items>
          </Transition>
        </>
      ) : size === "namaPrn" ? (
        <>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              className={`absolute ${
                landscape ? "w-[94vh]" : "w-[100%]"
              } z-10 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-y-auto max-h-60 bottom-12`}
            >
              {data !== null
                ? data.map((i) => {
                    return (
                      <div className="py-1" key={i}>
                        <Menu.Item>
                          {({ active }) => (
                            <p
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-black"
                                  : "text-gray-700",
                                "block px-4 py-2 text-[24px]"
                              )}
                              onClick={() => handleOptionSelect(i)}
                            >
                              {i}
                            </p>
                          )}
                        </Menu.Item>
                      </div>
                    );
                  })
                : "Tidak ada data"}
            </Menu.Items>
          </Transition>
          <div>
            <Menu.Button
              className={`inline-flex ${
                landscape ? "w-[94vh] h-[6vh]" : "w-[100%]"
              }  justify-between gap-x-1.5 rounded-md bg-white px-3 py-2 text-subText text-left shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50`}
            >
              {selectedOption ? selectedOption : placeholder}
              <ChevronDownIcon
                className="w-10 h-10 -mr-1 text-black"
                aria-hidden="true"
              />
            </Menu.Button>
          </div>
        </>
      ) : (
        <>
          <div>
            <Menu.Button
              className={`inline-flex ${
                landscape ? "w-[94vh] h-[6vh]" : "w-[100%]"
              }  justify-between gap-x-1.5 rounded-md bg-white px-3 py-2 text-subText text-left shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50`}
            >
              {selectedOption ? selectedOption : placeholder}
              <ChevronDownIcon
                className="w-10 h-10 -mr-1 text-black"
                aria-hidden="true"
              />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              className={`absolute ${
                landscape ? "w-[94vh]" : "w-[100%]"
              } mt-2 z-10 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-y-auto max-h-60`}
            >
              {data !== null
                ? data.map((i) => {
                    return (
                      <div className="py-1" key={i}>
                        <Menu.Item>
                          {({ active }) => (
                            <p
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-black"
                                  : "text-gray-700",
                                "block px-4 py-2 text-[24px]"
                              )}
                              onClick={() => handleOptionSelect(i)}
                            >
                              {i}
                            </p>
                          )}
                        </Menu.Item>
                      </div>
                    );
                  })
                : "Tidak ada data"}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}
