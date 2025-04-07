const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  dialog,
} = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
// const { list, createKey, putValue, RegSzValue } = require("regedit-rs");
const ptp = require("pdf-to-printer");
const { PosPrinter } = require("electron-pos-printer");
var os = require("os");
const fs = require("fs");
const fsPromise = fs.promises;
const AdmZip = require("adm-zip");
let regedits = require("regedit");
const regedit = regedits.promisified;
// Mendapatkan path direktori exe aplikasi
const exePath = path.dirname(app.getPath("exe"));

// Mengatur lokasi eksternal untuk file VBS
regedits.setExternalVBSLocation("resources/regedit/vbs");

function createWindow() {
  const mainWindow = new BrowserWindow({
    fullscreen: true,
    frame: false,
    kiosk: true, // Aktifkan mode kiosk
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      // webSecurity: false,
    },
  });

  // Nonaktifkan context menu untuk semua area
  mainWindow.webContents.on("context-menu", (e) => {
    e.preventDefault();
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:7000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // // Menonaktifkan DevTools
  // mainWindow.webContents.on("devtools-opened", () => {
  //   mainWindow.webContents.closeDevTools();
  // });

  // // Menonaktifkan shortcut untuk membuka DevTools
  // app.whenReady().then(() => {
  //   globalShortcut.register("Control+Shift+I", () => {
  //     // menonaktifkan aksi dari shortcut
  //   });
  // });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("quit_app", () => {
  app.quit();
});

// Get data registry
ipcMain.on("get_data_registry", async (event, arg) => {
  // // const { product } = arg;
  // console.log(product);

  const res = await regedit.list(
    "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
  );

  if (
    res[
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
    ].exists === false ||
    res[
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
    ].values["IGR"]?.["value"] === undefined ||
    res[
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
    ].values["IGR"]?.["value"] === ""
  ) {
    event.sender.send("get_data_registry", false);
  } else {
    const dt = {
      kodeIGR:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
        ].values["IGR"]["value"],
      oraServer:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
        ].values["Server"]["value"],
      encryptedOraIP:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
        ].values["IP"]["value"],
      encryptedOraPort:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
        ].values["Port"]["value"],
      encryptedOraSN:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
        ].values["SN"]["value"],
      encryptedOraUser:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
        ].values["UserID"]["value"],
      encryptedOraPwd:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
        ].values["Password"]["value"],
      encryptedPrnName:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
        ].values["prnName"]["value"],
      encryptedPrnBrand:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
        ].values["prnBrand"]["value"],
      gatewayUrl:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
        ].values["GatewayURL"]["value"],
      userModul:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
        ].values["UserModul"]["value"],
      stationModul:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
        ].values["StationModul"]["value"],
      namaModul:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
        ].values["NamaModul"]["value"],
    };
    event.sender.send("get_data_registry", dt);
  }
});

// Get ip address
ipcMain.on("get_ip_address", (event, arg) => {
  var networkInterfaces = os.networkInterfaces();
  var address;

  // console.log(networkInterfaces);
  if (networkInterfaces["Wi-Fi"]) {
    for (let i = 0; i < networkInterfaces["Wi-Fi"].length; i++) {
      if (networkInterfaces["Wi-Fi"][i]["family"] === "IPv4") {
        address = networkInterfaces["Wi-Fi"][i]["address"];
      }
    }
  } else if (networkInterfaces["Ethernet"]) {
    for (let i = 0; i < networkInterfaces["Ethernet"].length; i++) {
      if (networkInterfaces["Ethernet"][i]["family"] === "IPv4") {
        address = networkInterfaces["Ethernet"][i]["address"];
      }
    }
  } else if (networkInterfaces["Ethernet 2"]) {
    for (let i = 0; i < networkInterfaces["Ethernet 2"].length; i++) {
      if (networkInterfaces["Ethernet 2"][i]["family"] === "IPv4") {
        address = networkInterfaces["Ethernet 2"][i]["address"];
      }
    }
  } else if (networkInterfaces["WiFi"]) {
    for (let i = 0; i < networkInterfaces["WiFi"].length; i++) {
      if (networkInterfaces["WiFi"][i]["family"] === "IPv4") {
        address = networkInterfaces["WiFi"][i]["address"];
      }
    }
  } else if (networkInterfaces["Local Area Connection"]) {
    for (
      let i = 0;
      i < networkInterfaces["Local Area Connection"].length;
      i++
    ) {
      if (networkInterfaces["Local Area Connection"][i]["family"] === "IPv4") {
        address = networkInterfaces["Local Area Connection"][i]["address"];
      }
    }
  } else if (networkInterfaces["Local Area Connection 2"]) {
    for (
      let i = 0;
      i < networkInterfaces["Local Area Connection 2"].length;
      i++
    ) {
      if (
        networkInterfaces["Local Area Connection 2"][i]["family"] === "IPv4"
      ) {
        address = networkInterfaces["Local Area Connection 2"][i]["address"];
      }
    }
  } else if (networkInterfaces["Local Area Connection 3"]) {
    for (
      let i = 0;
      i < networkInterfaces["Local Area Connection 3"].length;
      i++
    ) {
      if (
        networkInterfaces["Local Area Connection 3"][i]["family"] === "IPv4"
      ) {
        address = networkInterfaces["Local Area Connection 3"][i]["address"];
      }
    }
  } else if (networkInterfaces["Wireless Network Connection"]) {
    for (
      let i = 0;
      i < networkInterfaces["Wireless Network Connection"].length;
      i++
    ) {
      if (
        networkInterfaces["Wireless Network Connection"][i]["family"] === "IPv4"
      ) {
        address =
          networkInterfaces["Wireless Network Connection"][i]["address"];
      }
    }
  } else {
    for (let i = 0; i < networkInterfaces["Wi-Fi"].length; i++) {
      if (networkInterfaces["Wi-Fi"][i]["family"] === "IPv4") {
        address = networkInterfaces["Wi-Fi"][i]["address"];
      }
    }
  }

  event.sender.send("get_ip_address", address);
});

// Create key registry
ipcMain.on("create_registry", async (event, arg) => {
  // await console.log("Registry Arg: ", arg.encryptedOraIP);
  try {
    await regedit.createKey(
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
    );
    await regedit.putValue({
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre":
        {
          IGR: {
            value: arg.kodeIGR,
            type: "REG_SZ",
          },
          IP: {
            value: arg.encryptedOraIP,
            type: "REG_SZ",
          },
          Password: {
            value: arg.encryptedOraPwd,
            type: "REG_SZ",
          },
          Port: {
            value: arg.encryptedOraPort,
            type: "REG_SZ",
          },
          prnBrand: {
            value: arg.encryptedPrnBrand,
            type: "REG_SZ",
          },
          prnName: {
            value: arg.encryptedPrnName,
            type: "REG_SZ",
          },
          Server: {
            value: arg.oraServer,
            type: "REG_SZ",
          },
          SN: {
            value: arg.encryptedOraSN,
            type: "REG_SZ",
          },
          UserID: {
            value: arg.encryptedOraUser,
            type: "REG_SZ",
          },
          UserModul: {
            value: arg.userModul,
            type: "REG_SZ",
          },
          StationModul: {
            value: arg.stationModul,
            type: "REG_SZ",
          },
          NamaModul: {
            value: arg.namaModul,
            type: "REG_SZ",
          },
        },
    });
    event.sender.send("create_registry", "Berhasil membuat registry");
  } catch {
    event.sender.send("create_registry", "Gagal membuat registry");
  }
});

// Create key registry
ipcMain.on("create_registry_gwurl", async (event, arg) => {
  // await console.log("Registry Arg: ", arg.encryptedOraIP);
  try {
    await regedit.createKey(
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
    );
    await regedit.putValue({
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre":
        {
          GatewayURL: {
            value: arg,
            type: "REG_SZ",
          },
        },
    });
    event.sender.send(
      "create_registry_gwurl",
      "Berhasil membuat registry gateway url"
    );
  } catch {
    event.sender.send(
      "create_registry_gwurl",
      "Gagal membuat registry gateway url"
    );
  }
});

// Create key registry
ipcMain.handle("create_registry_userstation", async (event, arg) => {
  // await console.log("Registry Arg: ", arg.encryptedOraIP);
  try {
    await regedit.createKey(
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
    );
    await regedit.putValue({
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre":
        {
          UserModul: {
            value: arg.userModul,
            type: "REG_SZ",
          },
          StationModul: {
            value: arg.stationModul,
            type: "REG_SZ",
          },
          NamaModul: {
            value: arg.namaModul,
            type: "REG_SZ",
          },
        },
    });
    return {
      success: true,
      message: "Registry user station created successfully",
    };
  } catch (error) {
    throw new Error(
      `Gagal membuat registry user station \r\nError Message: ${error.message}\r\nError Stack: ${error.stack}`
    );
  }
});

// Delete key registry
ipcMain.handle("delete_registry_userstation", async (event, arg) => {
  // await console.log("Registry Arg: ", arg.encryptedOraIP);
  try {
    await regedit.createKey(
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre"
    );
    await regedit.putValue({
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\CRM\\EkioskHD Electron Postgre":
        {
          UserModul: {
            value: "",
            type: "REG_SZ",
          },
          StationModul: {
            value: "",
            type: "REG_SZ",
          },
          NamaModul: {
            value: "",
            type: "REG_SZ",
          },
        },
    });

    return {
      success: true,
      message: "Registry user station deleted successfully",
    };
  } catch (error) {
    throw new Error(
      `Gagal menghapus registry user station \r\nError Message: ${error.message}\r\nError Stack: ${error.stack}`
    );
  }
});

// Get data installed printer
ipcMain.on("get_data_prn", async (event, arg) => {
  // const printers = await ptp.getPrinters();
  const res = await regedit.list(
    "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Print\\Printers"
  );

  const result =
    res["HKLM\\SYSTEM\\CurrentControlSet\\Control\\Print\\Printers"].keys;
  // if (printers.length === 0) {
  //   const res = await regedit.list(
  //     "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Print\\Printers"
  //   );

  //   event.sender.send("get_data_prn", printers);
  // } else {
  event.sender.send("get_data_prn", result);
});

// Save Struk file into directory in .txt
ipcMain.handle("save_receipt", async (event, receipt) => {
  try {
    let saveDirectory;
    saveDirectory = `C:\\CRM\\eKioskElectronPostgre\\${receipt.memberID}`;

    let savePath = path.join(saveDirectory, receipt.path);

    // Periksa apakah direktori sudah ada
    if (!fs.existsSync(saveDirectory)) {
      // Buat direktori jika belum ada
      fs.mkdirSync(saveDirectory, { recursive: true });
      console.log("Direktori berhasil dibuat:", saveDirectory);
    }

    // Simpan file ke direktori yang sudah ditentukan

    if (fs.existsSync(savePath)) {
      // Tambahkan ke file yang sudah ada jika 'pos' true dan file sudah ada
      fs.appendFileSync(savePath, receipt.receiptDt);
      console.log("Data berhasil ditambahkan ke file:", savePath);
    } else {
      // Simpan file baru jika 'pos' false atau file belum ada
      fs.writeFileSync(savePath, receipt.receiptDt);
      console.log("File baru berhasil disimpan:", savePath);
    }
    return { success: true, message: "File saved successfully" };
  } catch (error) {
    throw new Error(
      `Gagal menyimpan struk belanja: \r\nError Message: ${error.message}\r\nError Stack: ${error.stack}`
    );
  }
});

// Save Struk file into directory in .txt
ipcMain.handle("save_receiptpos", async (event, receipt) => {
  try {
    let saveDirectory;

    saveDirectory = `C:\\POSSelfService\\STRUK`;

    let savePath = path.join(saveDirectory, receipt.path);

    // Periksa apakah direktori sudah ada
    if (!fs.existsSync(saveDirectory)) {
      // Buat direktori jika belum ada
      fs.mkdirSync(saveDirectory, { recursive: true });
      console.log("Direktori berhasil dibuat:", saveDirectory);
    }

    // Simpan file ke direktori yang sudah ditentukan

    if (fs.existsSync(savePath)) {
      // Tambahkan ke file yang sudah ada jika 'pos' true dan file sudah ada
      fs.appendFileSync(savePath, receipt.receiptDt);
      console.log("Data berhasil ditambahkan ke file:", savePath);
    } else {
      // Simpan file baru jika 'pos' false atau file belum ada
      fs.writeFileSync(savePath, receipt.receiptDt);
      console.log("File baru berhasil disimpan:", savePath);
    }

    return { success: true, message: "File saved successfully" };
  } catch (error) {
    throw new Error(
      `Gagal menyimpan struk belanja: \r\nError Message: ${error.message}\r\nError Stack: ${error.stack}`
    );
  }
});

// Save Struk file into directory in .txt
ipcMain.handle("save_errorlog", async (event, errorDt) => {
  try {
    let saveDirectory;

    saveDirectory = `C:\\POSSelfService\\ERROR`;

    let savePath = path.join(saveDirectory, errorDt.path);

    // Periksa apakah direktori sudah ada
    if (!fs.existsSync(saveDirectory)) {
      // Buat direktori jika belum ada
      fs.mkdirSync(saveDirectory, { recursive: true });
      console.log("Direktori berhasil dibuat:", saveDirectory);
    }

    // Simpan file ke direktori yang sudah ditentukan

    if (fs.existsSync(savePath)) {
      // Tambahkan ke file yang sudah ada jika 'pos' true dan file sudah ada
      fs.appendFileSync(savePath, errorDt.errorMsg);
      console.log("Data berhasil ditambahkan ke file:", savePath);
    } else {
      // Simpan file baru jika 'pos' false atau file belum ada
      fs.writeFileSync(savePath, errorDt.errorMsg);
      console.log("File baru berhasil disimpan:", savePath);
      // Jika semua berhasil, kembalikan pesan sukses
      return { success: true, message: "File saved successfully" };
    }
  } catch (error) {
    throw new Error(
      `Gagal menyimpan error log: \r\nError Message: ${error.message}\r\nError Stack: ${error.stack}`
    );
  }
});

ipcMain.handle("save_receiptpos_sharing", async (event, receipt) => {
  try {
    let saveDirectory = `S:\\GROSIR\\STRUK\\IKIOSK`;

    // Gabungkan saveDirectory dengan folder tanggal
    const subFolderPath = path.join(saveDirectory, receipt.pathSharing);

    // Periksa apakah direktori backup utama sudah ada
    if (!fs.existsSync(saveDirectory)) {
      // Buat direktori backup utama jika belum ada
      fs.mkdirSync(saveDirectory, { recursive: true });
      console.log("Direktori backup utama berhasil dibuat:", saveDirectory);
    }

    // Periksa apakah sub folder sudah ada
    if (!fs.existsSync(subFolderPath)) {
      // Buat folder tanggal jika belum ada
      fs.mkdirSync(subFolderPath, { recursive: true });
      console.log("Direktori tanggal berhasil dibuat:", subFolderPath);
    }

    // Gabungkan direktori tanggal dengan nama file dari receipt.path
    const savePath = path.join(subFolderPath, receipt.pathFile);

    // Simpan file ke folder tanggal yang sudah ditentukan
    // Simpan file ke direktori yang sudah ditentukan

    if (fs.existsSync(savePath)) {
      // Tambahkan ke file yang sudah ada jika 'pos' true dan file sudah ada
      fs.appendFile(savePath, receipt.receiptDt);
      console.log("Data berhasil ditambahkan ke file:", savePath);
    } else {
      // Simpan file baru jika 'pos' false atau file belum ada
      fs.writeFileSync(savePath, receipt.receiptDt);
      console.log("File baru berhasil disimpan:", savePath);
    }

    return { success: true, message: "File saved successfully" };
  } catch (error) {
    throw new Error(
      `Gagal menyimpan struk belanja sharing: \r\nError Message: ${error.message}\r\nError Stack: ${error.stack}`
    );
  }
});

// ipcMain.on("save_receiptpos_sharing", async (event, receipt) => {
//   const saveDirectory = `\\\\S\\GROSIR\\IKIOSK\\STRUK`;
//   const subFolderPath = path.join(saveDirectory, receipt.pathSharing);
//   const savePath = path.join(subFolderPath, receipt.pathFile);

//   console.log(savePath);

//   try {
//     // Pastikan direktori ada
//     await fsPromise.mkdir(subFolderPath, { recursive: true });

//     let fileExists = true;
//     try {
//       await fsPromise.access(savePath);
//     } catch {
//       fileExists = false;
//     }

//     if (fileExists) {
//       // File sudah ada, tambahkan konten baru
//       await fsPromise.appendFile(savePath, "\n" + receipt.receiptDt);
//       console.log("Konten ditambahkan ke file yang sudah ada:", savePath);
//     } else {
//       // File belum ada, buat file baru
//       await fsPromise.writeFile(savePath, receipt.receiptDt);
//       console.log("File baru dibuat:", savePath);
//     }

//     console.log("Operasi penyimpanan berhasil:", savePath);
//     event.sender.send("save_receiptpos_sharing", "success");
//   } catch (err) {
//     console.error("Error:", err);
//     let errorMessage = `Gagal menyimpan file. . Error: ${err.message}`;
//     event.sender.send("save_receiptpos_sharing", errorMessage);
//   }
// });

// Save backup file into directory in .txt
ipcMain.handle("save_backuppos", async (event, receipt) => {
  try {
    console.log(receipt);
    let saveDirectory = `C:\\POSSelfService\\BACKUP`;

    // Gabungkan saveDirectory dengan folder tanggal
    const subFolderPath = path.join(saveDirectory, receipt.subFolder);

    // Periksa apakah direktori backup utama sudah ada
    if (!fs.existsSync(saveDirectory)) {
      // Buat direktori backup utama jika belum ada
      fs.mkdirSync(saveDirectory, { recursive: true });
      console.log("Direktori backup utama berhasil dibuat:", saveDirectory);
    }

    // Periksa apakah sub folder sudah ada
    if (!fs.existsSync(subFolderPath)) {
      // Buat folder tanggal jika belum ada
      fs.mkdirSync(subFolderPath, { recursive: true });
      console.log("Direktori tanggal berhasil dibuat:", subFolderPath);
    }

    // Gabungkan direktori tanggal dengan nama file dari receipt.path
    const savePath = path.join(subFolderPath, receipt.path);

    // Simpan file ke folder tanggal yang sudah ditentukan

    fs.writeFileSync(savePath, receipt.receiptDt);
    console.log("File baru berhasil disimpan:", savePath);
    return { success: true, message: "File saved successfully" };
  } catch (error) {
    throw new Error(
      `Gagal menyimpan backup: \r\nError Message: ${error.message}\r\nError Stack: ${error.stack}`
    );
  }
});

// Print Receipt
ipcMain.handle("print_receipt", async (event, arg) => {
  const data = JSON.parse(arg.dataReceipt);

  const options = {
    printerName: arg.printerName,
    timeOutPerLine: 5000,
    silent: true,
    pageSize: "80mm",
    margin: "0 0 0 2mm",
    copies: 1,
    preview: false,
  };

  // Printer
  try {
    await PosPrinter.print(data, options).catch((error) => {
      console.error("Detail Error:", error); // Log lebih jelas
      throw new Error(`Gagal Print Struk: ${error}`);
    });

    return { status: true, message: "File printed successfully" };
  } catch (error) {
    return {
      status: false,
      message: `Gagal Print Struk: \r\nError Message: ${error.message}\r\nError Stack: ${error.stack}`,
    };
  }
});

// Print Receipt Belanja
ipcMain.handle("print_receipt_belanja", async (event, arg) => {
  const options = {
    printerName: arg.printerName,
    timeOutPerLine: 5000,
    silent: true,
    pageSize: "80mm",
    margin: "0 0 0 2mm",
    copies: 1,
    preview: false,
  };

  const data = [
    {
      type: "image", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      path: path.join(
        __dirname,
        "..",
        "..",
        "public",
        "images",
        "Header IGR",
        `${arg.kodeIGR}.jpg`
      ),
      position: "left",
      width: "250px",
      height: "100px",
    },
    {
      type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      value: arg.strukData,
      style: {
        fontFamily: "Courier, monospace", // Mengatur font ke Courier atau monospace lain
        whiteSpace: "pre", // Menjaga spasi dan baris baru
        fontSize: "10px",
        fontWeight: "700",
      },
    },
    {
      type: "qrCode",
      value: arg.numberOfQrStruk,
      height: 150,
      width: 150,
      position: "center",
    },
    {
      type: "text",
      value: "\n\n", // Tambahkan spasi atau baris kosong sebelum pemotongan
      style: {
        fontFamily: "Courier, monospace", // Mengatur font ke Courier atau monospace lain
        whiteSpace: "pre", // Menjaga spasi dan baris baru
        fontSize: "10px",
      },
    },
    {
      type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      value: arg.strukDataFooter,
      style: {
        fontFamily: "Courier, monospace", // Mengatur font ke Courier atau monospace lain
        whiteSpace: "pre", // Menjaga spasi dan baris baru
        fontSize: "10px",
        fontWeight: "700",
      },
    },
    {
      type: "text",
      value: "\n", // Tambahkan spasi atau baris kosong sebelum pemotongan
      style: {
        fontFamily: "Courier, monospace", // Mengatur font ke Courier atau monospace lain
        whiteSpace: "pre", // Menjaga spasi dan baris baru
        fontSize: "10px",
      },
    },
  ];

  try {
    // Tunggu proses printing selesai
    await PosPrinter.print(data, options).catch((error) => {
      console.error("Detail Error:", error); // Log lebih jelas
      throw new Error(`Gagal Print Struk: ${error}`);
    });

    return { status: true, message: "File printed successfully" };
  } catch (error) {
    return {
      status: false,
      message: `Gagal Print Struk: \r\nError Message: ${error.message}\r\nError Stack: ${error.stack}`,
    };
  }
});

// Print Receipt Belanja
ipcMain.handle("print_closing", async (event, arg) => {
  const options = {
    printerName: arg.printerName,
    timeOutPerLine: 5000,
    silent: true,
    pageSize: "80mm",
    margin: "0 0 0 2mm",
    copies: 1,
    preview: false,
  };

  const data = [
    {
      type: "image", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      path: path.join(
        __dirname,
        "..",
        "..",
        "public",
        "images",
        "Header IGR",
        `${arg.kodeIGR}.jpg`
      ),
      position: "left",
      width: "250px",
      height: "100px",
    },
    {
      type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      value: arg.strukData,
      style: {
        fontFamily: "Courier, monospace", // Mengatur font ke Courier atau monospace lain
        whiteSpace: "pre", // Menjaga spasi dan baris baru
        fontSize: "10px",
        fontWeight: "700",
      },
    },
  ];
  try {
    await PosPrinter.print(data, options).catch((error) => {
      console.error("Detail Error:", error); // Log lebih jelas
      throw new Error(`Gagal Print Struk: ${error}`);
    });

    return { status: true, message: "File printed successfully" };
  } catch (error) {
    return {
      status: false,
      message: `Gagal Print Struk Closing: \r\nError Message: ${error.message}\r\nError Stack: ${error.stack}`,
    };
  }
});

// Backup To Zip
ipcMain.handle("backup_zip", (event, folderPath, outputPath) => {
  try {
    // Cek apakah folderPath ada
    if (!fs.existsSync(folderPath)) {
      return {
        success: true,
        message:
          "Folder tidak ditemukan, dianggap sukses karena tidak ada transaksi yang perlu di zip.",
      };
    }

    // Membuat instance AdmZip
    const zip = new AdmZip();

    // Menambahkan folder ke dalam ZIP
    zip.addLocalFolder(folderPath);

    // Menyimpan file ZIP ke path yang diinginkan
    zip.writeZip(outputPath);

    console.log(
      `Folder ${folderPath} berhasil dikompres menjadi ${outputPath}`
    );

    // Menghapus folder setelah berhasil dikompres
    fs.rmSync(folderPath, { recursive: true, force: true });
    console.log(`Folder ${folderPath} telah dihapus.`);
    return { success: true, message: "File zip successfully" };
  } catch (error) {
    throw new Error(
      `Gagal Zip Backup: \r\nError Message: ${error.message}\r\nError Stack: ${error.stack}`
    );
  }
});

// Refresh App
ipcMain.on("refresh-window", (event) => {
  let window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.reload();
  }
});
