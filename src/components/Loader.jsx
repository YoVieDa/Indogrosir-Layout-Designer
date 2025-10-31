import React from "react";
import { useSelector } from "react-redux";
import ClipLoader from "react-spinners/ClipLoader";

function Loader({ loading }) {
  return (
    <>
      <div
        className={` fixed inset-0 flex justify-center items-center ${
          loading ? "visible bg-black/20" : "invisible"
        } transition-colors  z-50`}
      >
        <ClipLoader
          color="#0079C2"
          loading={loading}
          size={150}
          aria-label="Loading Spinner"
          data-testid="loader"
          borderWidth={10}
        />
      </div>
    </>
  );
}

export default Loader;
