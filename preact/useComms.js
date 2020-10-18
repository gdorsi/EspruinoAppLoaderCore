import { useProgressBar } from "./ProgressBar.js";
import { useAtom } from "./atoms.js";
import { pretokeniseAtom } from "./useAppsUtils.js";

//Puck.debug=3;
console.log("=============================================");
console.log("Type 'Puck.debug=3' for full BLE debug info");
console.log("=============================================");

// simple glob to regex conversion, only supports "*" and "?" wildcards
function globToRegex(pattern) {
  const ESCAPE = '.*+-?^${}()|[]\\';
  const regex = pattern.replace(/./g, c => {
    switch (c) {
      case '?': return '.';
      case '*': return '.*';
      default: return ESCAPE.includes(c) ? ('\\' + c) : c;
    }
  });
  return new RegExp('^'+regex+'$');
}

function toJS(txt) {
  return JSON.stringify(txt);
}

function timer(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

//TODO make null result error less repetitive
export function useComms() {
  const progressBar = useProgressBar();
  const pretokenise = useAtom(pretokeniseAtom);

  // FIXME: use UART lib so that we handle errors properly
  function write(data, waitForANewLine) {
    return new Promise((resolve, reject) => {
      Puck.write(
        data,
        (result, err) => {
          if (result === null) {
            progressBar.hide();

            if (err) {
              return reject(err.toString());
            }

            return reject("");
          }

          resolve(result);
        },
        waitForANewLine
      );
    });
  }

  async function reset(opt) {
    let tries = 8;
    console.log("<COMMS> reset");

    let result = await write(
      `\x03\x10reset(${opt == "wipe" ? "1" : ""});\n`
    ).catch((err) => {
      return Promise.reject("Connection failed " + err);
    });

    while (result == "" && tries-- > 0) {
      console.log(`<COMMS> reset: no response. waiting ${tries}...`);

      result = await write(`\x03`);
    }

    console.log("<COMMS> reset: got " + JSON.stringify(result));
    console.log(`<COMMS> reset: complete.`);

    await timer(250);
  }

  async function uploadApp(app, skipReset) {
    progressBar.show(`Getting info about ${app.name}`);

    //TODO remove this globals
    const fileContents = await AppInfo.getFiles(app, {
      fileGetter: (url) =>
        fetch(url).then((res) => (res.ok ? res.text() : Promise.reject())),
      settings: {
        pretokenise: pretokenise.state,
      },
    });

    console.log(
      "<COMMS> uploadApp:",
      fileContents.map((f) => f.name).join(", ")
    );

    let maxBytes = fileContents.reduce((b, f) => b + f.cmd.length, 0) || 1;
    let currentBytes = 0;

    let appInfoFileName = app.id + ".info";
    let appInfoFile = fileContents.find((f) => f.name == appInfoFileName);

    if (!appInfoFile) return Promise.reject(`${appInfoFileName} not found`);

    let appInfo = JSON.parse(appInfoFile.content);

    if (!skipReset) {
      // reset to ensure we have enough memory to upload what we need to
      await reset();
    }

    await write(`\x10E.showMessage('Uploading\\n${app.id}...')\n`);

    progressBar.show(`Uploading ${app.name}`);

    // Upload each file one at a time
    while (fileContents.length > 0) {
      let f = fileContents.shift();
      console.log(`<COMMS> Upload ${f.name} => ${JSON.stringify(f.content)}`);
      // Chould check CRC here if needed instead of returning 'OK'...
      // E.CRC32(require("Storage").read(${JSON.stringify(app.name)}))
      let cmds = f.cmd.split("\n");

      while (cmds.length) {
        let cmd = cmds.shift();

        progressBar.setRange(
          currentBytes / maxBytes,
          (currentBytes + cmd.length) / maxBytes
        );
        currentBytes += cmd.length;

        const res = await write(`${cmd};Bluetooth.println("OK")\n`, true);

        if (!res || res.trim() != "OK") {
          progressBar.hide();

          return Promise.reject("Unexpected response " + (res || ""));
        }
      }
    }

    progressBar.hide();

    // No files left - print 'reboot' message
    await write(`\x10E.showMessage('Hold BTN3\\nto reload')\n`);

    return appInfo;
  }

  async function getInstalledApps() {
    progressBar.show(`Getting app list...`);

    //TODO improve support check
    await write(`\x03`);

    let appList = await write(
      `\x10Bluetooth.print("[");require("Storage").list(/\\.info$/).forEach(f=>{var j=require("Storage").readJSON(f,1)||{};j.id=f.slice(0,-5);Bluetooth.print(JSON.stringify(j)+",")});Bluetooth.println("0]")\n`,
      true
    );

    progressBar.hide();

    appList = JSON.parse(appList);
    // remove last element since we added a final '0'
    // to make things easy on the Bangle.js side
    appList = appList.slice(0, -1);

    console.log("<COMMS> getInstalledApps", appList);

    return appList;
  }

  async function removeApp(app) {
    // expects an appid.info structure (i.e. with `files`)
    if (!app.files && !app.data) return; // nothing to erase

    progressBar.show(`Removing ${app.name}`);

    let cmds = '\x10const s=require("Storage");\n';
    // remove App files: regular files, exact names only
    cmds += app.files
      .split(",")
      .map((file) => `\x10s.erase(${toJS(file)});\n`)
      .join("");

    // remove app Data: (dataFiles and storageFiles)
    const data = AppInfo.parseDataString(app.data);
    const isGlob = (f) => /[?*]/.test(f);
    //   regular files, can use wildcards
    cmds += data.dataFiles
      .map((file) => {
        if (!isGlob(file)) return `\x10s.erase(${toJS(file)});\n`;
        const regex = new RegExp(globToRegex(file));
        return `\x10s.list(${regex}).forEach(f=>s.erase(f));\n`;
      })
      .join("");
    //   storageFiles, can use wildcards
    cmds += data.storageFiles
      .map((file) => {
        if (!isGlob(file)) return `\x10s.open(${toJS(file)},'r').erase();\n`;
        // storageFiles have a chunk number appended to their real name
        const regex = globToRegex(file + "\u0001");
        // open() doesn't want the chunk number though
        let cmd = `\x10s.list(${regex}).forEach(f=>s.open(f.substring(0,f.length-1),'r').erase());\n`;
        // using a literal \u0001 char fails (not sure why), so escape it
        return cmd.replace("\u0001", "\\x01");
      })
      .join("");

    console.log("<COMMS> removeApp", cmds);

    await reset();

    await write(
      `\x03\x10E.showMessage('Erasing\\n${app.id}...')${cmds}\x10E.showMessage('Hold BTN3\\nto reload')\n`
    );

    progressBar.hide();
  }

  async function removeAllApps() {
    console.log("<COMMS> removeAllApps start");

    progressBar.show(`Removing all apps`);

    let timeout = 5;

    let result = await write(
      '\x10E.showMessage("Erasing...");require("Storage").eraseAll();Bluetooth.println("OK");reset()\n',
      true
    );

    while (result == "" && timeout--) {
      // send space and delete - so it's something, but it should just cancel out
      result = await write(` \u0008`, true);
    }

    progressBar.hide();

    console.log("<COMMS> removeAllApps: received " + JSON.stringify(result));

    if (!result || result.trim() != "OK") {
      if (!result) result = "No response";
      else result = "Got " + JSON.stringify(result.trim());
      return Promise.reject(result);
    }
  }

  async function setTime() {
    let d = new Date();
    let tz = d.getTimezoneOffset() / -60;
    let cmd = "\x03\x10setTime(" + d.getTime() / 1000 + ");";
    // in 1v93 we have timezones too
    cmd += "E.setTimeZone(" + tz + ");";
    cmd +=
      "(s=>{s&&(s.timezone=" +
      tz +
      ")&&require('Storage').write('setting.json',s);})(require('Storage').readJSON('setting.json',1))\n";

    await write(cmd);
  }

  function disconnectDevice() {
    let connection = Puck.getConnection();

    if (!connection) return;

    connection.close();
  }

  function watchConnectionChange(cb) {
    let connected = Puck.isConnected();

    //TODO Switch to an event listener when Puck will support it
    let interval = setInterval(() => {
      if (connected === Puck.isConnected()) return;

      connected = Puck.isConnected();
      cb(connected);
    }, 1000);

    //stop watching
    return () => {
      clearInterval(interval);
    };
  }

  async function listFiles() {
    await write(`\x03`);

    return new Promise((resolve, reject) => {
      //use encodeURIComponent to serialize octal sequence of append files
      Puck.eval(
        'require("Storage").list().map(encodeURIComponent)',
        (files, err) => {
          if (files === null) return reject(err || "");
          files = files.map(decodeURIComponent);
          console.log("<COMMS> listFiles", files);
          resolve(files);
        }
      );
    });
  }

  async function readFile(file) {
    await write(`\x03`);

    return new Promise((resolve, reject) => {
      //encode name to avoid serialization issue due to octal sequence
      const name = encodeURIComponent(file);

      //TODO: big files will not fit in RAM.
      //we should loop and read chunks one by one.
      //Use btoa for binary content
      Puck.eval(
        `btoa(require("Storage").read(decodeURIComponent("${name}"))))`,
        (content, err) => {
          if (content === null) return reject(err || "");
          resolve(atob(content));
        }
      );
    });
  }

  function readStorageFile(filename) {
    // StorageFiles are different to normal storage entries
    return new Promise((resolve, reject) => {
      // Use "\xFF" to signal end of file (can't occur in files anyway)
      let fileContent = "";
      let fileSize = undefined;
      let connection = Puck.getConnection();

      if (!connection) return reject("");

      connection.received = "";
      connection.cb = function (d) {
        let finished = false;
        let eofIndex = d.indexOf("\xFF");
        if (eofIndex >= 0) {
          finished = true;
          d = d.substr(0, eofIndex);
        }
        fileContent += d;
        if (fileSize === undefined) {
          let newLineIdx = fileContent.indexOf("\n");
          if (newLineIdx >= 0) {
            fileSize = parseInt(fileContent.substr(0, newLineIdx));
            console.log("<COMMS> readStorageFile size is " + fileSize);
            fileContent = fileContent.substr(newLineIdx + 1);
          }
        } else {
          progressBar.setPercent(
            (100 * fileContent.length) / (fileSize || 1000000)
          );
        }
        if (finished) {
          progressBar.hide();
          connection.received = "";
          connection.cb = undefined;
          resolve(fileContent);
        }
      };
      console.log(`<COMMS> readStorageFile ${JSON.stringify(filename)}`);
      connection.write(
        `\x03\x10(function() {
      var f = require("Storage").open(${JSON.stringify(filename)},"r");
      Bluetooth.println(f.getLength());
      var l = f.readLine();
      while (l!==undefined) { Bluetooth.print(l); l = f.readLine(); }
      Bluetooth.print("\xFF");
    })()\n`,
        () => {
          progressBar.show(`Reading ${JSON.stringify(filename)}`);
          console.log(`<COMMS> StorageFile read started...`);
        }
      );
    });
  }

  return {
    reset,
    uploadApp,
    getInstalledApps,
    removeApp,
    removeAllApps,
    setTime,
    disconnectDevice,
    watchConnectionChange,
    listFiles,
    readFile,
    readStorageFile,
  };
}
