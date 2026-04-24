import { ImageResponse } from "next/og";

export const alt = "SIGMA landing page preview";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#071014",
          color: "#edf8f5",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#071014",
            backgroundImage:
              "radial-gradient(circle at top left, rgba(84,240,178,0.16), transparent 34%), radial-gradient(circle at top right, rgba(91,200,255,0.12), transparent 36%)"
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 54,
            left: 64,
            right: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 54,
              fontWeight: 700,
              letterSpacing: 0
            }}
          >
            Sigma
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "rgba(255,255,255,0.03)",
              padding: "14px 20px",
              fontSize: 20,
              color: "#cbd5e1"
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                backgroundColor: "#54f0b2"
              }}
            />
            Live token intelligence
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "100%",
            padding: "120px 64px 64px"
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              borderRadius: 999,
              border: "1px solid rgba(84,240,178,0.3)",
              backgroundColor: "rgba(84,240,178,0.1)",
              padding: "12px 22px",
              fontSize: 22,
              fontWeight: 500,
              color: "#54f0b2"
            }}
          >
            Crypto risk analysis for everyday investors
          </div>

          <div
            style={{
              display: "flex",
              maxWidth: 860,
              marginTop: 28,
              fontSize: 88,
              lineHeight: 1.02,
              fontWeight: 700
            }}
          >
            AI-Powered Token Risk Analysis
          </div>

          <div
            style={{
              display: "flex",
              maxWidth: 820,
              marginTop: 26,
              fontSize: 31,
              lineHeight: 1.4,
              color: "#cbd5e1"
            }}
          >
            Instantly analyze token risk, liquidity, and trading activity with
            AI-powered insights.
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 34
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 68,
                borderRadius: 22,
                backgroundColor: "#54f0b2",
                color: "#071014",
                padding: "0 30px",
                fontSize: 28,
                fontWeight: 800
              }}
            >
              Launch App
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
