import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

function Loader({ merah, loading, nobg }) {
  return (
    <>
      {!nobg ? (
        <div
          className={` fixed inset-0 flex justify-center items-center ${
            loading ? "visible bg-black/20" : "invisible"
          } transition-colors  z-50`}
        >
          <ClipLoader
            color={!merah ? "#0079C2" : "#e51a23"}
            loading={loading}
            size={150}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      ) : (
        <ClipLoader
          color={!merah ? "#0079C2" : "#e51a23"}
          loading={loading}
          size={150}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      )}
    </>
  );
}

export default Loader;
