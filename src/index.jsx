import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./services/redux/store";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import LoginUser from "./pages/login/LoginUser";
import MainMenu from "./pages/mainMenu/MainMenu";
import SettingRuangan from "./pages/mainMenu/SettingRuangan";
import SettingLokasiRak from "./pages/mainMenu/SettingLokasiRak";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  // <React.StrictMode>
  <Provider store={store}>
    <HashRouter>
      <Routes>
        <Route exact path ="/" Component={MainMenu} />
        <Route path="/loginUser" Component={LoginUser} />
        <Route path="/settingRuangan" Component={SettingRuangan} />
        <Route path="/settingLokasiRak" Component={SettingLokasiRak} />
      </Routes>
    </HashRouter>
  </Provider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
