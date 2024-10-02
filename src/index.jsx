import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./services/redux/store";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import LoginMember from "./pages/login/LoginMember";
import LoginPSS from "./pages/login/LoginPSS";
import MainMenu from "./pages/mainMenu/MainMenu";
import InfoPromoMenu from "./pages/mainMenu/informasiPromo/InformasiPromoMenu";
import InfoPoinIGRMenu from "./pages/mainMenu/infoPoinIGR/InfoPoinIGRMenu";
import CekSaldoPoinIGR from "./pages/mainMenu/infoPoinIGR/cekSaldoPoinIGR/CekSaldoPoinIGR";
import PenukaranPoinIGR from "./pages/mainMenu/infoPoinIGR/penukaranPoinIGR/PenukaranPoinIGR";
import PestaPoinIGR from "./pages/mainMenu/infoPoinIGR/pestaPoinIGR/PestaPoinIGR";
import ProgramSkorIGR from "./pages/mainMenu/infoPoinIGR/programSkorIGR/ProgramSkorIGR";
import TopSpender from "./pages/mainMenu/informasiPromo/topSpender/TopSpender";
import TableTopSpender from "./pages/mainMenu/informasiPromo/topSpender/TableTopSpender";
import SuperPromo from "./pages/mainMenu/informasiPromo/superPromo/SuperPromo";
import HargaHemat from "./pages/mainMenu/informasiPromo/hargaHemat/HargaHemat";
import ProdukBaru from "./pages/mainMenu/informasiPromo/produkBaru/ProdukBaru";
import GetPromo from "./pages/mainMenu/informasiPromo/uniqueCode/GetPromo";
import HadiahUntukAnda from "./pages/mainMenu/informasiPromo/hadiahUntukAnda/HadiahUntukAnda";
import PembelianPembayaranMenu from "./pages/mainMenu/pembelianPembayaran/PembelianPembayaranMenu";
import PulsaPaketData from "./pages/mainMenu/pembelianPembayaran/pulsaPaketData/PulsaPaketData";
import PilihPaket from "./pages/mainMenu/pembelianPembayaran/pulsaPaketData/PilihPaket";
import Pembayaran from "./pages/mainMenu/pembelianPembayaran/pulsaPaketData/Pembayaran";
import DiscountMerchant from "./pages/mainMenu/informasiPromoLain/discountMerchant/DiscountMerchant";
import LoyaltyPemenang from "./pages/mainMenu/andakahPemenangnya/loyaltyPemenang/LoyaltyPemenang";
import MemberInfo from "./pages/mainMenu/memberInfo/MemberInfo";
import PromoKhusus from "./pages/mainMenu/informasiPromo/promoKhusus/PromoKhusus";
import HadiahSkor from "./pages/mainMenu/infoPoinIGR/programSkorIGR/HadiahSkor";
import GetGift from "./pages/mainMenu/informasiPromo/uniqueCode/getGift/GetGift";
import GetCashBack from "./pages/mainMenu/informasiPromo/uniqueCode/getCashBack/GetCashBack";
import KasirSelfService from "./pages/mainMenu/pembelianPembayaran/belanja/KasirSelfService";
import InputJumlahPage from "./pages/mainMenu/pembelianPembayaran/belanja/InputJumlahPage";
import KasirPembayaran from "./pages/mainMenu/pembelianPembayaran/belanja/KasirPembayaran";
import PwpGabungan from "./pages/mainMenu/pembelianPembayaran/belanja/PwpGabungan";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  // <React.StrictMode>
  <Provider store={store}>
    <HashRouter>
      <Routes>
        <Route exact path="/" Component={LoginMember} />
        <Route path="/loginPSS" Component={LoginPSS} />
        <Route path="/mainMenu" Component={MainMenu} />
        <Route path="/infoPromoMenu" Component={InfoPromoMenu} />
        <Route path="/infoPoinIGRMenu" Component={InfoPoinIGRMenu} />
        <Route
          path="/pembelianPembayaranMenu"
          Component={PembelianPembayaranMenu}
        />
        <Route path="/cekSaldoPoinIGR" Component={CekSaldoPoinIGR} />
        <Route path="/penukaranPoinIGR" Component={PenukaranPoinIGR} />
        <Route path="/pestaPoinIGR" Component={PestaPoinIGR} />
        <Route path="/programSkorIGR" Component={ProgramSkorIGR} />
        <Route path="/topSpender" Component={TopSpender} />
        <Route path="/tableTopSpender" Component={TableTopSpender} />
        <Route path="/superPromo" Component={SuperPromo} />
        <Route path="/hargaHemat" Component={HargaHemat} />
        <Route path="/produkBaru" Component={ProdukBaru} />
        <Route path="/getPromo" Component={GetPromo} />
        <Route path="/hadiahUntukAnda" Component={HadiahUntukAnda} />
        <Route path="/pulsaPaketData" Component={PulsaPaketData} />
        <Route path="/pilihPaket" Component={PilihPaket} />
        <Route path="/pembayaran" Component={Pembayaran} />
        <Route path="/discountMerchant" Component={DiscountMerchant} />
        <Route path="/loyaltyPemenang" Component={LoyaltyPemenang} />
        <Route path="/memberInfo" Component={MemberInfo} />
        <Route path="/promoKhusus" Component={PromoKhusus} />
        <Route path="/hadiahSkor" Component={HadiahSkor} />
        <Route path="/getGift" Component={GetGift} />
        <Route path="/getCashBack" Component={GetCashBack} />
        <Route path="/kasirSelfService" Component={KasirSelfService} />
        <Route path="/inputJumlah" Component={InputJumlahPage} />
        <Route path="/kasirPembayaran" Component={KasirPembayaran} />
        <Route path="/pwpGabungan" Component={PwpGabungan} />
      </Routes>
    </HashRouter>
  </Provider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
