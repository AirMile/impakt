import { Platform, useWindowDimensions } from "react-native";

// Breedte van de mobiel-brede "app-kolom" op desktop/tablet (web).
export const APP_FRAME_W = 420;

// Verticale crème-marge boven/onder het frame op web.
const FRAME_MARGIN_Y = 20;

/**
 * Single source of truth voor de effectieve "scherm"-afmetingen.
 *
 * Op web met een viewport breder dan het frame tonen we de app als een
 * gecentreerde mobiel-brede kolom; dimensies worden dan geclampt op de
 * frame-grootte. Op native (en op smalle web-viewports) valt alles terug op
 * de volledige viewport — gedrag identiek aan voorheen.
 *
 * Reactief via useWindowDimensions: volgt resize, anders dan de statische
 * Dimensions.get-snapshots die voorheen op module-niveau werden gelezen.
 *
 * @returns {{ framed: boolean, width: number, height: number }}
 */
export function useAppFrame() {
  const { width, height } = useWindowDimensions();
  const framed = Platform.OS === "web" && width > APP_FRAME_W;
  return {
    framed,
    width: framed ? APP_FRAME_W : width,
    height: framed ? height - FRAME_MARGIN_Y * 2 : height,
  };
}
