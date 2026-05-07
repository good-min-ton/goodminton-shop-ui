import L from "leaflet";

/**
 * Brand-colored DivIcon — avoids the well-known leaflet bundler issue with
 * default marker images and gives us styling control.
 */
export function createStoreMarkerIcon(active = false): L.DivIcon {
  const fill = active ? "#377aa4" : "#1c1917";
  return L.divIcon({
    className: "gm-store-marker",
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 40px;
      ">
        <svg viewBox="0 0 32 40" width="32" height="40" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 0C7.16 0 0 7.16 0 16c0 11 16 24 16 24s16-13 16-24C32 7.16 24.84 0 16 0z"
            fill="${fill}"
            stroke="white"
            stroke-width="2"
          />
          <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -36],
  });
}
