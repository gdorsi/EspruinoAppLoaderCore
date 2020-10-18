import {
  useStateAtom,
  useAtomValue,
  createStateAtom,
  createDataAtom,
} from "./atoms.js";
import { toastAtom } from "./Toast.js";

const url = new URL(location.href);

function getFromQS(key) {
  return url.searchParams.get(key) || "";
}

const filtersInitialState = {
  category: getFromQS("category"),
  sort: getFromQS("sort"),
  search: getFromQS("search"),
  section: getFromQS("section"),
};

const filtersAtom = createStateAtom(
  filtersInitialState,
  (filters) => {
    const url = new URL(location.href);

    Object.keys(filtersInitialState).forEach((key) => {
      if (filters[key]) {
        url.searchParams.set(key, filters[key]);
      } else {
        url.searchParams.delete(key);
      }
    });

    history.replaceState({}, document.title, url);
  }
);

export const sortInfoAtom = createDataAtom(
  () =>
    fetch("appdates.csv")
      .then((res) => (res.ok ? res.text() : Promise.reject(res)))
      .then((csv) => {
        const appSortInfo = {};

        csv.split("\n").forEach((line) => {
          let l = line.split(",");
          appSortInfo[l[0]] = {
            created: Date.parse(l[1]),
            modified: Date.parse(l[2]),
          };
        });

        return appSortInfo;
      }),
  ({ error, init, fetchData }, use) => {
    const toast = use(toastAtom);

    if (init) {
      fetchData();
    }

    if (error) {
      toast.setState({
        msg: "No recent.csv - app sort disabled",
      });
    }
  }
);

export const useFilters = () => {
  const [filters, setFilters] = useStateAtom(filtersAtom);
  const { data: sortInfo } = useAtomValue(sortInfoAtom);

  const setter = (key) => (value) => {
    setFilters((state) => ({
      ...state,
      [key]: value,
    }));
  };

  return {
    active: filters.category,
    setActive: setter("category"),
    sort: filters.sort,
    setSort: setter("sort"),
    sortInfo,
    search: filters.search,
    setSearch: setter("search"),
    section: filters.section,
    setSection: setter("section"),
  };
};
