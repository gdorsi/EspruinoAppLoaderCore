import { useInstalledApps } from "./useInstalledApps.js";
import { useIsConnected } from "./useIsConnected.js";
import { html } from "./preact.js";
import { useFilters } from "./useFilters.js";
import { useDebouncedInput } from "./useDebouncedInput.js";
import { Button } from "./Button.js";

export function Header() {
  const installedApps = useInstalledApps();
  const isConnected = useIsConnected();

  const filters = useFilters();

  /**
   * The app list update is an operation that sometimes
   * runs over the 60FPS time budget
   *
   * That's why we reduce the list update operations by
   * debouncing the searchInput handler
   */
  const searchInput = useDebouncedInput((value) => {
    filters.setSearch(value.toLowerCase()); //TODO move the normalization inside the useFilters hook
  }, filters.search);

  return html`<header class="Header">
    <a class="Header__logo" href="https://banglejs.com" target="_blank"
      ><img src="core/img/banglejs-logo-sml.png" alt="Bangle.js" />app loader</a
    >
    <div class="Header__actions">
      <${Button}
        light=${!filters.section}
        onClick=${() => filters.setSection("")}
      >
        <svg class="Icon" width="17" height="14" viewBox="0 0 17 14">
          <path
            d="M5.95215 0C5.68693 0 5.43258 0.105357 5.24504 0.292893C5.05751 0.48043 4.95215 0.734784 4.95215 1C4.95215 1.26522 5.05751 1.51957 5.24504 1.70711C5.43258 1.89464 5.68693 2 5.95215 2H11.9521C12.2174 2 12.4717 1.89464 12.6593 1.70711C12.8468 1.51957 12.9521 1.26522 12.9521 1C12.9521 0.734784 12.8468 0.48043 12.6593 0.292893C12.4717 0.105357 12.2174 0 11.9521 0H5.95215ZM2.95215 4C2.95215 3.73478 3.05751 3.48043 3.24504 3.29289C3.43258 3.10536 3.68693 3 3.95215 3H13.9521C14.2174 3 14.4717 3.10536 14.6593 3.29289C14.8468 3.48043 14.9521 3.73478 14.9521 4C14.9521 4.26522 14.8468 4.51957 14.6593 4.70711C14.4717 4.89464 14.2174 5 13.9521 5H3.95215C3.68693 5 3.43258 4.89464 3.24504 4.70711C3.05751 4.51957 2.95215 4.26522 2.95215 4ZM0.952148 8C0.952148 7.46957 1.16286 6.96086 1.53793 6.58579C1.91301 6.21071 2.42172 6 2.95215 6H14.9521C15.4826 6 15.9913 6.21071 16.3664 6.58579C16.7414 6.96086 16.9521 7.46957 16.9521 8V12C16.9521 12.5304 16.7414 13.0391 16.3664 13.4142C15.9913 13.7893 15.4826 14 14.9521 14H2.95215C2.42172 14 1.91301 13.7893 1.53793 13.4142C1.16286 13.0391 0.952148 12.5304 0.952148 12V8Z"
          />
        </svg>
        Explore
      <//>
    </div>
    <div class="Header__search">
      <svg class="Icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          opacity="0.6"
          d="M15 15L10.3333 10.3333L15 15ZM11.8889 6.44444C11.8889 7.15942 11.7481 7.86739 11.4745 8.52794C11.2008 9.18849 10.7998 9.78868 10.2942 10.2942C9.78868 10.7998 9.18849 11.2008 8.52794 11.4745C7.86739 11.7481 7.15942 11.8889 6.44444 11.8889C5.72947 11.8889 5.0215 11.7481 4.36095 11.4745C3.7004 11.2008 3.1002 10.7998 2.59464 10.2942C2.08908 9.78868 1.68804 9.18849 1.41443 8.52794C1.14082 7.86739 1 7.15942 1 6.44444C1 5.00049 1.57361 3.61567 2.59464 2.59464C3.61567 1.57361 5.00049 1 6.44444 1C7.8884 1 9.27322 1.57361 10.2942 2.59464C11.3153 3.61567 11.8889 5.00049 11.8889 6.44444Z"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <input placeholder="Search by keyword" ...${searchInput} />
    </div>
    <div class="Header__actions">
      <${Button}
        light=${filters.section === "myapps"}
        onClick=${() => filters.setSection("myapps")}
      >
        <svg class="Icon" width="17" height="16" viewBox="0 0 17 16">
          <path
            d="M3.23786 0C2.63165 0 2.05027 0.240816 1.62162 0.66947C1.19296 1.09812 0.952148 1.67951 0.952148 2.28571V4.57143C0.952148 5.17764 1.19296 5.75902 1.62162 6.18767C2.05027 6.61633 2.63165 6.85714 3.23786 6.85714H5.52358C6.12979 6.85714 6.71117 6.61633 7.13982 6.18767C7.56848 5.75902 7.80929 5.17764 7.80929 4.57143V2.28571C7.80929 1.67951 7.56848 1.09812 7.13982 0.66947C6.71117 0.240816 6.12979 0 5.52358 0H3.23786ZM3.23786 9.14286C2.63165 9.14286 2.05027 9.38367 1.62162 9.81233C1.19296 10.241 0.952148 10.8224 0.952148 11.4286V13.7143C0.952148 14.3205 1.19296 14.9019 1.62162 15.3305C2.05027 15.7592 2.63165 16 3.23786 16H5.52358C6.12979 16 6.71117 15.7592 7.13982 15.3305C7.56848 14.9019 7.80929 14.3205 7.80929 13.7143V11.4286C7.80929 10.8224 7.56848 10.241 7.13982 9.81233C6.71117 9.38367 6.12979 9.14286 5.52358 9.14286H3.23786ZM10.095 2.28571C10.095 1.67951 10.3358 1.09812 10.7645 0.66947C11.1931 0.240816 11.7745 0 12.3807 0H14.6664C15.2726 0 15.854 0.240816 16.2827 0.66947C16.7113 1.09812 16.9521 1.67951 16.9521 2.28571V4.57143C16.9521 5.17764 16.7113 5.75902 16.2827 6.18767C15.854 6.61633 15.2726 6.85714 14.6664 6.85714H12.3807C11.7745 6.85714 11.1931 6.61633 10.7645 6.18767C10.3358 5.75902 10.095 5.17764 10.095 4.57143V2.28571ZM10.095 11.4286C10.095 10.8224 10.3358 10.241 10.7645 9.81233C11.1931 9.38367 11.7745 9.14286 12.3807 9.14286H14.6664C15.2726 9.14286 15.854 9.38367 16.2827 9.81233C16.7113 10.241 16.9521 10.8224 16.9521 11.4286V13.7143C16.9521 14.3205 16.7113 14.9019 16.2827 15.3305C15.854 15.7592 15.2726 16 14.6664 16H12.3807C11.7745 16 11.1931 15.7592 10.7645 15.3305C10.3358 14.9019 10.095 14.3205 10.095 13.7143V11.4286Z"
            fill="white"
          />
        </svg>
        My App
      <//>
      <${Button}>
        <svg class="Icon" width="17" height="14" viewBox="0 0 17 14">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M2.12329 1.36813C2.8734 0.618241 3.89064 0.196979 4.95129 0.196979C6.01195 0.196979 7.02918 0.618241 7.77929 1.36813L8.95129 2.53913L10.1233 1.36813C10.4923 0.986085 10.9337 0.681356 11.4217 0.47172C11.9097 0.262084 12.4346 0.151739 12.9657 0.147124C13.4968 0.142508 14.0235 0.243715 14.5151 0.444839C15.0067 0.645962 15.4533 0.942974 15.8289 1.31855C16.2044 1.69412 16.5015 2.14072 16.7026 2.63231C16.9037 3.12389 17.0049 3.65061 17.0003 4.18173C16.9957 4.71285 16.8853 5.23773 16.6757 5.72574C16.4661 6.21376 16.1613 6.65514 15.7793 7.02413L8.95129 13.8531L2.12329 7.02413C1.37341 6.27401 0.952148 5.25678 0.952148 4.19613C0.952148 3.13547 1.37341 2.11824 2.12329 1.36813Z"
          />
        </svg>
        Favourites
      <//>
      <${Button}>
        <svg class="Icon" width="16" height="16" viewBox="0 0 16 16">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M9.49024 1.17C9.11024 -0.39 6.89024 -0.39 6.51024 1.17C6.45351 1.40442 6.34223 1.62213 6.18546 1.80541C6.02869 1.9887 5.83087 2.13238 5.60808 2.22477C5.3853 2.31716 5.14384 2.35564 4.90338 2.33709C4.66291 2.31854 4.43022 2.24347 4.22424 2.118C2.85224 1.282 1.28224 2.852 2.11824 4.224C2.65824 5.11 2.17924 6.266 1.17124 6.511C-0.389762 6.89 -0.389762 9.111 1.17124 9.489C1.40572 9.54581 1.62346 9.65719 1.80675 9.81407C1.99004 9.97096 2.13368 10.1689 2.22598 10.3918C2.31828 10.6147 2.35663 10.8563 2.33791 11.0968C2.31919 11.3373 2.24392 11.5701 2.11824 11.776C1.28224 13.148 2.85224 14.718 4.22424 13.882C4.43018 13.7563 4.66289 13.6811 4.90342 13.6623C5.14396 13.6436 5.38551 13.682 5.60842 13.7743C5.83132 13.8666 6.02928 14.0102 6.18617 14.1935C6.34305 14.3768 6.45443 14.5945 6.51124 14.829C6.89024 16.39 9.11124 16.39 9.48924 14.829C9.54624 14.5946 9.65773 14.377 9.81464 14.1939C9.97156 14.0107 10.1695 13.8672 10.3923 13.7749C10.6152 13.6826 10.8566 13.6442 11.0971 13.6628C11.3376 13.6815 11.5702 13.7565 11.7762 13.882C13.1482 14.718 14.7182 13.148 13.8822 11.776C13.7568 11.57 13.6817 11.3373 13.6631 11.0969C13.6445 10.8564 13.6829 10.6149 13.7751 10.3921C13.8674 10.1692 14.011 9.97133 14.1941 9.81441C14.3773 9.65749 14.5949 9.546 14.8292 9.489C16.3902 9.11 16.3902 6.889 14.8292 6.511C14.5948 6.45419 14.377 6.34281 14.1937 6.18593C14.0104 6.02904 13.8668 5.83109 13.7745 5.60818C13.6822 5.38527 13.6438 5.14372 13.6626 4.90318C13.6813 4.66265 13.7566 4.42994 13.8822 4.224C14.7182 2.852 13.1482 1.282 11.7762 2.118C11.5703 2.24368 11.3376 2.31895 11.0971 2.33767C10.8565 2.35639 10.615 2.31804 10.3921 2.22574C10.1692 2.13344 9.9712 1.9898 9.81431 1.80651C9.65742 1.62323 9.54604 1.40548 9.48924 1.171L9.49024 1.17ZM8.00024 11C8.79589 11 9.55895 10.6839 10.1216 10.1213C10.6842 9.55871 11.0002 8.79565 11.0002 8C11.0002 7.20435 10.6842 6.44129 10.1216 5.87868C9.55895 5.31607 8.79589 5 8.00024 5C7.20459 5 6.44153 5.31607 5.87892 5.87868C5.31631 6.44129 5.00024 7.20435 5.00024 8C5.00024 8.79565 5.31631 9.55871 5.87892 10.1213C6.44153 10.6839 7.20459 11 8.00024 11Z"
          />
        </svg>
        Settings
      <//>
      <${Button}
        active
        onClick=${isConnected
          ? installedApps.disconnect
          : installedApps.loadFromTheDevice}
      >
        ${isConnected ? "Disconnect" : "Connect"}
      <//>
    </div>
  </header>`;
}
