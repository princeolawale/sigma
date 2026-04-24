import { ImageResponse } from "next/og";

export const alt = "SIGMA token risk analysis preview";
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
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#071014",
          color: "#edf8f5",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundColor: "#071014",
            backgroundImage:
              "radial-gradient(circle at 15% 15%, rgba(84,240,178,0.16), transparent 28%), radial-gradient(circle at 85% 10%, rgba(91,200,255,0.14), transparent 30%)"
          }}
        />
        <div
          style={{
            display: "flex",
            width: "100%",
            padding: "56px 64px",
            justifyContent: "space-between",
            alignItems: "stretch",
            gap: 36,
            position: "relative"
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: 660
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 58,
                  fontWeight: 700,
                  letterSpacing: 1
                }}
              >
                Sigma
              </div>
              <div
                style={{
                  display: "flex",
                  maxWidth: 640,
                  fontSize: 72,
                  lineHeight: 1.05,
                  fontWeight: 700
                }}
              >
                AI-Powered Token Risk Analysis
              </div>
              <div
                style={{
                  display: "flex",
                  maxWidth: 620,
                  fontSize: 30,
                  lineHeight: 1.35,
                  color: "#c3d3d0"
                }}
              >
                Analyze token risk, liquidity, volume, and price action with
                AI-powered summaries.
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 24,
                color: "#54f0b2"
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  backgroundColor: "#54f0b2"
                }}
              />
              Live token intelligence
            </div>
          </div>

          <div
            style={{
              width: 376,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
                padding: 28,
                borderRadius: 28,
                border: "1px solid rgba(255,255,255,0.12)",
                backgroundColor: "rgba(16,26,32,0.88)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.24)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: 18,
                      color: "#94a3b8"
                    }}
                  >
                    Risk Score
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#54f0b2"
                    }}
                  >
                    Lower Risk
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 56,
                    fontWeight: 700
                  }}
                >
                  99
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  height: 12,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: "99%",
                    backgroundColor: "#54f0b2"
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginTop: 10
                }}
              >
                {["Liquidity", "24h Volume", "AI Summary"].map((label) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      borderRadius: 18,
                      border: "1px solid rgba(255,255,255,0.08)",
                      backgroundColor: "rgba(255,255,255,0.03)",
                      fontSize: 19
                    }}
                  >
                    <span style={{ display: "flex", color: "#94a3b8" }}>
                      {label}
                    </span>
                    <span style={{ display: "flex", color: "#edf8f5" }}>
                      Ready
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
