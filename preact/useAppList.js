import { createDataAtom, useAtomValue } from "./atoms.js";
import { marked } from "./marked.js";
import { toastAtom } from "./Toast.js";
import { useFilters } from "./useFilters.js";
import { useInstalledApps } from "./useInstalledApps.js";
import { chips } from "./AppFilters.js";

function getAppGithubURL(app) {
  let username = "espruino";
  let githubMatch = window.location.href.match(/\/(\w+)\.github\.io/);

  if (githubMatch) username = githubMatch[1];

  return `https://github.com/${username}/BangleApps/tree/master/apps/${app.id}`;
}

/* Given 2 JSON structures (1st from apps.json, 2nd from an installed app)
  work out what to display re: versions and if we can update */
function getCanUpdate(app, appInstalled) {
  //TODO Implement semver compare
  if (appInstalled && app.version != appInstalled.version) {
    return true;
  }

  return false;
}

function formatApps(apps) {
  return apps.map((app) => {
    const categories = app.tags.split(",");
    const [mainCategory] =
      chips.tags.find(([tag]) => categories.includes(tag)) || [categories[0]];

    return {
      ...app,
      categories,
      mainCategory: mainCategory || "app",
      description: marked(app.description, {
        baseUrl: `apps/${app.id}/`,
      }),
      avatar: `apps/${app.icon ? `${app.id}/${app.icon}` : "unknown.png"}`,
      github: getAppGithubURL(app),
    };
  });
}

const appListAtom = createDataAtom(
  () =>
    fetch("apps.json")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(formatApps),
  ({ error, init, fetchData }, use) => {
    const toast = use(toastAtom);

    if (init) {
      fetchData();
    }

    if (error) {
      if (error.message) {
        toast.setState({
          msg: `${error.toString()} on apps.json`,
          type: "error",
        });
      } else {
        toast.setState({
          msg: "Error during the fetch of apps.json",
          type: "error",
        });
      }
    }
  }
);

export const useAppList = () => {
  let { data: visibleApps } = useAtomValue(appListAtom);

  const installedApps = useInstalledApps();
  const filters = useFilters();

  if (!visibleApps) return [];

  if (filters.active) {
    visibleApps = visibleApps.filter((app) =>
      app.categories.includes(filters.active)
    );
  }

  if (filters.search) {
    visibleApps = visibleApps.filter(
      (app) =>
        app.name.toLowerCase().includes(filters.search) ||
        app.categories.some((category) => category.includes(filters.search))
    );
  }

  visibleApps = visibleApps.slice().sort((a, b) => {
    if (a.unknown) return 1;
    if (b.unknown) return -1;

    const sa = 0 | a.sortorder;
    const sb = 0 | b.sortorder;

    if (sa !== sb) return sa - sb;

    return a.name == b.name ? 0 : a.name < b.name ? -1 : 1;
  });

  if (filters.sort && filters.sortInfo) {
    if (filters.sort == "created" || filters.sort == "modified") {
      visibleApps = visibleApps
        .slice()
        .sort(
          (a, b) =>
            filters.sortInfo[b.id][filters.sort] -
            filters.sortInfo[a.id][filters.sort]
        );
    } else throw new Error("Unknown sort type " + filters.sort);
  }

  if (installedApps.list) {
    visibleApps = visibleApps.map((app) => {
      const appInstalled = installedApps.list.find(({ id }) => id == app.id);

      if (appInstalled) {
        return {
          ...app,
          appInstalled,
          canUpdate: getCanUpdate(app, appInstalled),
        };
      }

      return app;
    });
  }

  if (filters.section === "myapps") {
    visibleApps = visibleApps.filter((app) => app.appInstalled);
  }

  return visibleApps;
};
