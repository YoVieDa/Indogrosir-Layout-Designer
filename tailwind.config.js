/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        yellow: "#faff00",
        red: "#e51a23",
        red2: "#ff433b",
        red3: "#ff6453",
        red4: "#ff826c",
        red5: "#ffa087",
        white: "#ffff",
        blue: "#0079C2",
        blue2: "#3e93df",
        blue3: "#61aefc",
        blue4: "#81caff",
        blue5: "#a0e6ff",
        green: "#003800",
        green2: "#006000",
        green3: "#008A00",
        green4: "#00B725",
        green5: "#1AE553",
      },
      fontSize: {
        title: "64px",
        subTitle: "48px",
        text: "36px",
        subText: "32px",
      },
      borderRadius: {
        DEFAULT: "15px",
      },
      height: {
        full: "85vh",
      },
      listStyleType: {
        decimal: "decimal",
      },
    },
  },
  plugins: [],
};
