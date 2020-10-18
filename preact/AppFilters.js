import { useFilters } from "./useFilters.js";
import { html } from "./preact.js";
import { Chip } from "./Chip.js";

export const chips = {
  tags: [
    ["", "All"],
    ["clock", "Clocks"],
    ["game", "Games"],
    ["tool", "Tools"],
    ["widget", "Widgets"],
    ["bluetooth", "Bluetooth"],
    ["outdoors", "Outdoor"],
  ],
  sort: [
    ["", "None"],
    ["created", "New"],
    ["modified", "Updated"],
  ],
};

export function AppFilters() {
  const filters = useFilters();

  return html`<div class="AppFilters">
    <div class="AppFilters__filters">
      ${chips.tags.map(
        ([value, text]) => html`<${Chip}
          key=${value}
          value=${value}
          onClick=${filters.setActive}
          active=${filters.active === value}
          >${text}<//
        >`
      )}
    </div>
    <div class="AppFilters__sort ${!filters.sortInfo ? "hidden" : ""}">
      <span>Sort by:</span>
      ${chips.sort.map(
        ([value, text]) => html`<${Chip}
          key=${value}
          value=${value}
          text=${text}
          onClick=${filters.setSort}
          active=${filters.sort === value}
        />`
      )}
    </div>
  </div>`;
}
