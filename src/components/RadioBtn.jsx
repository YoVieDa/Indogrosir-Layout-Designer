import React from "react";
import { Radio } from "@material-tailwind/react";

function RadioBtn({ label, defaultChecked }) {
  return (
    <div className="">
      <Radio
        name="type"
        className="w-10 h-10"
        label={<p className="ml-5 text-subText text-black">{label}</p>}
        defaultChecked={defaultChecked}
      />
    </div>
  );
}

export default RadioBtn;
