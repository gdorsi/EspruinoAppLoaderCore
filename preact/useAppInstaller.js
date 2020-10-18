import { useToast } from "./Toast.js";
import { useProgressBar } from "./ProgressBar.js";
import { useComms } from "./useComms.js";
import { useInstalledApps } from "./useInstalledApps.js";
import { useAppList } from "./useAppList.js";
import { useIsConnected } from "./useIsConnected.js";

export function useAppInstaller() {
  const { data: appList } = useAppList();
  const installed = useInstalledApps();
  const isConnected = useIsConnected();
  const toast = useToast();
  const progressBar = useProgressBar();
  const Comms = useComms();

  /// check for dependencies the app needs and install them if required
  async function installDependencies(app) {
    if (!app.dependencies)
      return;

    const dependenciesToInstall = new Set();

    for (let dependency in app.dependencies) {
      const kind = app.dependencies[dependency];

      if (kind !== "type")
        throw new Error("Only supporting dependencies on app types right now");

      console.log(`Searching for dependency on app type '${dependency}'`);

      let found = installed.list.find((app) => app.type == dependency);

      if (found) {
        console.log(`Found dependency in installed app '${found.id}'`);
        continue;
      }

      let foundApps = appList.filter((app) => app.type == dependency);

      if (!foundApps.length)
        throw new Error(
          `Dependency of '${dependency}' listed, but nothing satisfies it!`
        );

      console.log(
        `Apps ${foundApps
          .map((f) => `'${f.id}'`)
          .join("/")} implement '${dependency}'`
      );

      found = foundApps[0]; // choose first app in list

      dependenciesToInstall.add(found);

      console.log(
        `Dependency "${dependency}" not installed. Installing app id '${found.id}'`
      );
    }

    for (let dependencyToInstall of dependenciesToInstall) {
      const uploadedApp = await Comms.uploadApp(dependencyToInstall);

      if (uploadedApp)
        installed.set((list) => list.concat(uploadedApp));
    }
  }

  async function install(app) {
    let list = installed.list;

    //TODO Move the connection check outside
    if (!isConnected) {
      try {
        list = await installed.loadFromTheDevice();
      } catch (err) {
        toast.show("Device connection failed, " + err, "error");
        return;
      }
    }

    if (list.some((i) => i.id === app.id)) {
      return update(app);
    }

    await installDependencies(app);

    try {
      const installedApp = await Comms.uploadApp(app);


      if (installedApp) {
        installed.set((list) => list.concat(installedApp));
      }

      toast.show(installedApp.name + " Uploaded!", "success");
    } catch (err) {
      toast.show("Upload failed, " + err, "error");
    }

    progressBar.hide();
  }

  function update(app) {
    //TODO Move the connection check outside
    let promise = isConnected
      ? Promise.resolve(installed.list)
      : installed.loadFromTheDevice();

    return promise
      .then((list) => {
        // a = from appid.info, app = from apps.json
        let remove = list.find((a) => a.id === app.id);
        // no need to remove files which will be overwritten anyway
        remove.files = remove.files
          .split(",")
          .filter((f) => f !== app.id + ".info")
          .filter((f) => !app.storage.some((s) => s.name === f))
          .join(",");

        let data = AppInfo.parseDataString(remove.data);

        if ("data" in app) {
          // only remove data files which are no longer declared in new app version
          const removeData = (f) => !app.data.some((d) => (d.name || d.wildcard) === f);

          data.dataFiles = data.dataFiles.filter(removeData);
          data.storageFiles = data.storageFiles.filter(removeData);
        }

        remove.data = AppInfo.makeDataString(data);

        return Comms.removeApp(remove);
      })
      .then(() => {
        toast.show(`Updating ${app.name}...`);

        installed.set((list) => list.filter((a) => a.id != app.id));

        return installDependencies(app);
      })
      .then(() => Comms.uploadApp(app))
      .then(
        (app) => {
          if (app)
            installed.set((list) => list.concat(app));

          toast.show(app.name + " Updated!", "success");
        },
        (err) => {
          toast.show(app.name + " update failed, " + err, "error");
        }
      );
  }

  function remove(app) {
    return Comms.removeApp(installed.list.find((a) => a.id === app.id)).then(
      () => {
        installed.set((list) => list.filter((a) => a.id != app.id));
        toast.show(app.name + " removed successfully", "success");
      },
      (err) => {
        toast.show(app.name + " removal failed, " + err, "error");
      }
    );
  }

  function removeAll() {
    Comms.removeAllApps()
      .then(() => {
        progressBar.hide();
        toast.show("All apps removed", "success");
        return installed.loadFromTheDevice();
      })
      .catch((err) => {
        progressBar.hide();
        toast.show("App removal failed, " + err, "error");
      });
  }

  function installMultipleApps(appIds) {
    let apps = appIds.map((appid) => appList.find((app) => app.id == appid));

    if (apps.some((x) => x === undefined))
      return Promise.reject("Not all apps found");

    let appCount = apps.length;

    toast.show(`Installing  ${appCount} apps...`);

    return new Promise((resolve, reject) => {
      function uploadNextApp() {
        let app = apps.shift();

        if (app === undefined)
          return resolve();

        progressBar.show(`${app.name} (${appCount - apps.length}/${appCount})`);

        installDependencies(app, "skip_reset")
          .then(() => Comms.uploadApp(app, "skip_reset"))
          .then((appJSON) => {
            progressBar.hide();

            if (appJSON)
              installed.set((list) => list.concat(app));

            toast.show(
              `(${appCount - apps.length}/${appCount}) ${app.name} Uploaded`
            );

            uploadNextApp();
          })
          .catch(function () {
            progressBar.hide();
            reject();
          });
      }

      uploadNextApp();
    }).then(() => {
      toast.show("Apps successfully installed!", "success");
      return installed.loadFromTheDevice();
    });
  }

  function resetToDefaultApps() {
    fetch("defaultapps.json")
      .then((res) => res.ok ? res.json() : Promise.reject(`Could not fetch the default apps`)
      )
      .then((json) => {
        return Comms.removeAllApps().then(() => {
          progressBar.hide();
          toast.show(`Existing apps removed.`);

          return installMultipleApps(JSON.parse(json));
        });
      })
      .then(() => {
        return Comms.setTime();
      })
      .catch((err) => {
        progressBar.hide();
        toast.show("App Install failed, " + err, "error");
      });
  }

  return {
    install,
    update,
    remove,
    removeAll,
    installMultipleApps,
    resetToDefaultApps,
  };
}
