import React from "react";
import Svg, { Path, Circle, Rect } from "react-native-svg";

export function IIcon({
  name,
  size = 22,
  color = "currentColor",
  strokeWidth = 2,
  fill = "none",
}) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill,
    stroke: color,
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (name) {
    case "menu":
      return (
        <Svg {...p}>
          <Path d="M3 6h18M3 12h18M3 18h18" />
        </Svg>
      );
    case "search":
      return (
        <Svg {...p}>
          <Circle cx="11" cy="11" r="7" />
          <Path d="m20 20-3.5-3.5" />
        </Svg>
      );
    case "arrow":
      return (
        <Svg {...p}>
          <Path d="M5 12h14m-6-6 6 6-6 6" />
        </Svg>
      );
    case "arrowL":
      return (
        <Svg {...p}>
          <Path d="M19 12H5m6-6-6 6 6 6" />
        </Svg>
      );
    case "chev":
      return (
        <Svg {...p}>
          <Path d="m9 6 6 6-6 6" />
        </Svg>
      );
    case "chevDown":
      return (
        <Svg {...p}>
          <Path d="m6 9 6 6 6-6" />
        </Svg>
      );
    case "close":
      return (
        <Svg {...p}>
          <Path d="m6 6 12 12M18 6 6 18" />
        </Svg>
      );
    case "check":
      return (
        <Svg {...p}>
          <Path d="M4 12l5 5L20 6" />
        </Svg>
      );
    case "edit":
      return (
        <Svg {...p}>
          <Path d="M14 4l6 6-9 9H5v-6l9-9z" />
          <Path d="M13 5l6 6" />
        </Svg>
      );
    case "plus":
      return (
        <Svg {...p}>
          <Path d="M12 5v14M5 12h14" />
        </Svg>
      );
    case "eye":
      return (
        <Svg {...p}>
          <Path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
          <Circle cx="12" cy="12" r="3" />
        </Svg>
      );
    case "eyeOff":
      return (
        <Svg {...p}>
          <Path d="M9.9 4.2A10 10 0 0 1 12 4c6 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 11s4 7 10 7c1.5 0 2.9-.3 4.2-.8M3 3l18 18" />
          <Path d="M9.9 9.9A3 3 0 0 0 12 15a3 3 0 0 0 2.1-5" />
        </Svg>
      );
    case "share":
      return (
        <Svg {...p}>
          <Circle cx="6" cy="12" r="2.5" />
          <Circle cx="18" cy="6" r="2.5" />
          <Circle cx="18" cy="18" r="2.5" />
          <Path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" />
        </Svg>
      );
    case "bookmark":
      return (
        <Svg {...p}>
          <Path d="M6 3h12v18l-6-4-6 4V3z" />
        </Svg>
      );
    case "smile":
      return (
        <Svg {...p}>
          <Circle cx="12" cy="12" r="9" />
          <Path d="M8 14c1 1.4 2.4 2 4 2s3-.6 4-2" />
          <Path d="M9 10h.01M15 10h.01" strokeWidth={2.6} />
        </Svg>
      );
    case "meh":
      return (
        <Svg {...p}>
          <Circle cx="12" cy="12" r="9" />
          <Path d="M8.5 15h7" />
          <Path d="M9 10h.01M15 10h.01" strokeWidth={2.6} />
        </Svg>
      );
    case "frown":
      return (
        <Svg {...p}>
          <Circle cx="12" cy="12" r="9" />
          <Path d="M8 16c1-1.4 2.4-2 4-2s3 .6 4 2" />
          <Path d="M9 10h.01M15 10h.01" strokeWidth={2.6} />
        </Svg>
      );
    case "trend":
      return (
        <Svg {...p}>
          <Path d="M3 17 9 11l4 4 8-8" />
          <Path d="M14 7h7v7" />
        </Svg>
      );
    case "user":
      return (
        <Svg {...p}>
          <Circle cx="12" cy="8" r="4" />
          <Path d="M4 21a8 8 0 0 1 16 0" />
        </Svg>
      );
    case "home":
      return (
        <Svg {...p}>
          <Path d="M3 11 12 3l9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
        </Svg>
      );
    case "video":
      return (
        <Svg {...p}>
          <Rect x="3" y="4" width="18" height="16" rx="3" />
          <Path d="m10 9 5 3-5 3z" fill={color} stroke="none" />
        </Svg>
      );
    case "calendar":
      return (
        <Svg {...p}>
          <Rect x="3" y="5" width="18" height="16" rx="2" />
          <Path d="M3 9h18M8 3v4M16 3v4" />
        </Svg>
      );
    case "extern":
      return (
        <Svg {...p}>
          <Path d="M14 4h6v6" />
          <Path d="m20 4-9 9" />
          <Path d="M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
        </Svg>
      );
    case "logout":
      return (
        <Svg {...p}>
          <Path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
          <Path d="M16 17l5-5-5-5M21 12H9" />
        </Svg>
      );
    case "trash":
      return (
        <Svg {...p}>
          <Path d="M3 6h18" />
          <Path d="M8 6V4h8v2" />
          <Path d="M6 6l1 15h10l1-15" />
          <Path d="M10 11v6M14 11v6" />
        </Svg>
      );
    case "info":
      return (
        <Svg {...p}>
          <Circle cx="12" cy="12" r="9" />
          <Path d="M12 8h.01M11 12h1v5h1" />
        </Svg>
      );
    case "mail":
      return (
        <Svg {...p}>
          <Rect x="3" y="5" width="18" height="14" rx="2" />
          <Path d="m3 7 9 6 9-6" />
        </Svg>
      );
    case "lock":
      return (
        <Svg {...p}>
          <Rect x="4" y="11" width="16" height="10" rx="2" />
          <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </Svg>
      );
    case "sparkle":
      return (
        <Svg {...p}>
          <Path d="M12 3l1.8 5.4L19 10.2 13.8 12 12 17.4 10.2 12 5 10.2l5.2-1.8L12 3z" />
        </Svg>
      );
    case "tag":
      return (
        <Svg {...p}>
          <Path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
          <Circle cx="7.5" cy="7.5" r="1.5" />
        </Svg>
      );
    case "phone":
      return (
        <Svg {...p}>
          <Path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2z" />
        </Svg>
      );
    case "google":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            fill="#4285F4"
            d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.6z"
          />
          <Path
            fill="#34A853"
            d="M12 22c2.7 0 5-.9 6.7-2.4l-3.4-2.6c-1 .6-2 1-3.3 1-2.6 0-4.7-1.7-5.5-4H3v2.6A10 10 0 0 0 12 22z"
          />
          <Path
            fill="#FBBC05"
            d="M6.5 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3a10 10 0 0 0 0 9.2L6.5 14z"
          />
          <Path
            fill="#EA4335"
            d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 3 14.7 2 12 2A10 10 0 0 0 3 7.4L6.5 10c.8-2.3 2.9-4 5.5-4z"
          />
        </Svg>
      );
    case "apple":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M16.4 12.6c0-2.5 2-3.7 2.1-3.8-1.1-1.7-3-1.9-3.6-1.9-1.5-.2-3 .9-3.8.9-.7 0-2-.9-3.3-.8-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.4 7.7 1.3 10.3.8 1.2 1.8 2.6 3.1 2.6 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.3 3-2.5.9-1.5 1.3-2.9 1.3-3-.1 0-2.5-1-2.5-3.3zM14.2 5c.7-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.2 1.8-1 2.9 1 .1 2-.5 2.7-1.3z" />
        </Svg>
      );
    case "facebook":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            fill="#1877F2"
            d="M22 12a10 10 0 1 0-11.6 9.9V15h-2.5v-3h2.5V9.7c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.2.2 2.2.2V8.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 3h-2.4v6.9A10 10 0 0 0 22 12z"
          />
        </Svg>
      );
    case "play":
      return (
        <Svg {...p}>
          <Path d="M5 4v16l14-8z" fill={color} />
        </Svg>
      );
    case "image":
      return (
        <Svg {...p}>
          <Rect x="3" y="3" width="18" height="18" rx="2" />
          <Circle cx="8.5" cy="8.5" r="1.5" />
          <Path d="m21 15-5-5L5 21" />
        </Svg>
      );
    case "topicPolitics":
      return (
        <Svg {...p}>
          <Path d="M4 20h16" />
          <Path d="M6 10h12" />
          <Path d="M8 10v7M12 10v7M16 10v7" />
          <Path d="M5 7l7-4 7 4H5z" />
        </Svg>
      );

    case "topicWorld":
      return (
        <Svg {...p}>
          <Circle cx="12" cy="12" r="9" />
          <Path d="M3 12h18" />
          <Path d="M12 3c2.4 2.6 3.6 5.6 3.6 9S14.4 18.4 12 21" />
          <Path d="M12 3c-2.4 2.6-3.6 5.6-3.6 9S9.6 18.4 12 21" />
        </Svg>
      );

    case "topicEconomy":
      return (
        <Svg {...p}>
          <Path d="M5 19V11" />
          <Path d="M12 19V6" />
          <Path d="M19 19v-9" />
          <Path d="M3 19h18" />
        </Svg>
      );

    case "topicSport":
      return (
        <Svg {...p}>
          <Circle cx="13" cy="5" r="2" />
          <Path d="M8 21l3-6" />
          <Path d="M16 21l-3-6" />
          <Path d="M7 10l5-3 4 4" />
          <Path d="M12 7l1 8" />
          <Path d="M16 11l4-1" />
        </Svg>
      );

    case "topicNature":
      return (
        <Svg {...p}>
          <Path d="M5 19c8-1 13-6 14-14-8 1-13 6-14 14z" />
          <Path d="M5 19 14 10" />
        </Svg>
      );

    case "topicInnovation":
      return (
        <Svg {...p}>
          <Path d="M12 3c3 1 5 3 6 6l-5 5-5-5 4-6z" />
          <Path d="M8 9l-4 2 3 3" />
          <Path d="M15 16l-2 4-3-3" />
          <Path d="M14 7h.01" strokeWidth={3} />
        </Svg>
      );

    case "topicArt":
      return (
        <Svg {...p}>
          <Path d="M14 4l6 6-9 9H5v-6l9-9z" />
          <Path d="M13 5l6 6" />
          <Path d="M5 19l5-2" />
        </Svg>
      );

    case "topicLocal":
      return (
        <Svg {...p}>
          <Path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11z" />
          <Circle cx="12" cy="10" r="2.5" />
        </Svg>
      );
    default:
      return null;
  }
}
