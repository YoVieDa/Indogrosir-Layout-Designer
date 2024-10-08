import React from "react";
import { useSelector } from "react-redux";
import ClipLoader from "react-spinners/ClipLoader";

function Loader({ merah, loading, nobg }) {
  const memberMerah = useSelector((state) => state.memberState.memberMerah);
  return (
    <>
      {!nobg ? (
        <div
          className={` fixed inset-0 flex justify-center items-center ${
            loading ? "visible bg-black/20" : "invisible"
          } transition-colors  z-50`}
        >
          <ClipLoader
            color={memberMerah ? "#0079C2" : "#e51a23"}
            loading={loading}
            size={150}
            aria-label="Loading Spinner"
            data-testid="loader"
            borderWidth={10}
          />
        </div>
      ) : (
        <ClipLoader
          color={memberMerah ? "#0079C2" : "#e51a23"}
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
