const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  dialog,
} = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const ptp = require("pdf-to-printer");
var os = require("os");
const fs = require("fs");
const fsPromise = fs.promises;
let regedits = require("regedit");
const regedit = regedits.promisified;
// Mendapatkan path direktori exe aplikasi
const exePath = path.dirname(app.getPath("exe"));

// Mengatur lokasi eksternal untuk file VBS
regedits.setExternalVBSLocation("resources/regedit/vbs");

function createWindow() {
  const mainWindow = new BrowserWindow({
    title: "Indogrosir Layout Designer",
    // App Icon
    width: 800,
    height: 600,
    icon: __dirname + '/assets/igr_logo_large.png',

    fullscreen: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });

  // Nonaktifkan context menu untuk semua area
  mainWindow.webContents.on("context-menu", (e) => {
    e.preventDefault();
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:7200"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Menonaktifkan DevTools
  // mainWindow.webContents.on("devtools-opened", () => {
  //   mainWindow.webContents.closeDevTools();
  // });

  // Menonaktifkan shortcut untuk membuka DevTools
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
    "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner"
  );

  if (
    res[
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner"
    ].exists === false ||
    res[
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner"
    ].values["IGR"]?.["value"] === undefined ||
    res[
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner"
    ].values["IGR"]?.["value"] === ""
  ) {
    event.sender.send("get_data_registry", false);
  } else {
    const dt = {
      kodeIGR:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner"
        ].values["IGR"]["value"],
      oraServer:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner"
        ].values["Server"]["value"],
      encryptedOraIP:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner"
        ].values["IP"]["value"],
      encryptedOraPort:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner"
        ].values["Port"]["value"],
      encryptedOraSN:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner"
        ].values["SN"]["value"],
      encryptedOraUser:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner"
        ].values["UserID"]["value"],
      encryptedOraPwd:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner"
        ].values["Password"]["value"],
      gatewayUrl:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner"
        ].values["GatewayURL"]["value"],
      userModul:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner"
        ].values["UserModul"]["value"],
      stationModul:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner"
        ].values["StationModul"]["value"],
      namaModul:
        res[
          "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner"
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
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner"
    );
    await regedit.putValue({
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner":
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
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner"
    );
    await regedit.putValue({
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner":
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
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner"
    );
    await regedit.putValue({
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner":
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
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner"
    );
    await regedit.putValue({
      "HKCU\\SOFTWARE\\VB and VBA Program Settings\\INDOGROSIR\\IGRLayoutDesigner":
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

// Refresh App
ipcMain.on("refresh-window", (event) => {
  let window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.reload();
  }
});
