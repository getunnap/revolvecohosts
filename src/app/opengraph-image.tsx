import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site-brand";

export const alt = `${SITE_NAME} — Airbnb co-host matching and host tools`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(135deg, #047857 0%, #10B981 42%, #0f766e 100%)",
          padding: 72,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 58,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            maxWidth: 920,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            fontWeight: 500,
            color: "rgba(255,255,255,0.92)",
            maxWidth: 820,
            lineHeight: 1.35,
          }}
        >
          Curated co-host matching · free Airbnb tools · intro-ready handoffs
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 18,
            color: "rgba(255,255,255,0.75)",
            fontWeight: 500,
          }}
        >
          revolvecohosts.com
        </div>
      </div>
    ),
    { ...size },
  );
}
