import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
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
              "radial-gradient(circle at top left, rgba(84,240,178,0.18), transparent 34%), radial-gradient(circle at top right, rgba(91,200,255,0.14), transparent 36%)"
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 28,
            borderRadius: 36,
            border: "1px solid rgba(255,255,255,0.06)"
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
              letterSpacing: 1
            }}
          >
            SIGMA
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
            width: "100%",
            height: "100%",
            padding: "124px 64px 64px",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              width: 700
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
              Where traders get their edge.
            </div>

            <div
              style={{
                display: "flex",
                maxWidth: 680,
                marginTop: 28,
                fontSize: 78,
                lineHeight: 1.03,
                fontWeight: 700
              }}
            >
              AI-Powered Token Risk Analysis
            </div>

            <div
              style={{
                display: "flex",
                maxWidth: 640,
                marginTop: 24,
                fontSize: 28,
                lineHeight: 1.4,
                color: "#cbd5e1"
              }}
            >
              AI-powered token risk analysis for traders who want better market
              insight.
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

          <div
            style={{
              display: "flex",
              width: 360,
              height: 360,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              background:
                "radial-gradient(circle at 32% 30%, rgba(91,200,255,0.95), rgba(91,200,255,0.14) 34%, rgba(7,16,20,0) 35%), radial-gradient(circle at 69% 68%, rgba(84,240,178,0.92), rgba(84,240,178,0.14) 32%, rgba(7,16,20,0) 33%), rgba(255,255,255,0.02)",
              boxShadow:
                "0 0 60px rgba(91,200,255,0.18), 0 0 90px rgba(84,240,178,0.16)"
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 250,
                height: 250,
                borderRadius: 999,
                border: "2px solid rgba(255,255,255,0.08)"
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 170,
                height: 170,
                borderRadius: 999,
                border: "2px solid rgba(255,255,255,0.1)"
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
