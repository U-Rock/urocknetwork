// COPY-READY
import * as React from "react";

type Props = {
  /** UUID of the active station */
  stationId?: string;
  /** Base URL of your Cloudflare Worker, e.g., https://realtime.urock.network */
  workerUrl?: string;
  /** Auto-connect on mount */
  autoStart?: boolean;
  /** Optional className passthrough from WeWeb */
  className?: string;
};

type MetricsPayload = {
  stationId?: string;
  listeners?: number;
  viewers?: number;
  streamStatus?: "offline" | "live" | "scheduled";
  artist?: string;
  title?: string;
  startedAt?: string;
};

export default function AffiliatePanel({
  stationId,
  workerUrl,
  autoStart = true,
  className = "",
}: Props) {
  const [connected, setConnected] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [listeners, setListeners] = React.useState(0);
  const [viewers, setViewers] = React.useState(0);
  const [status, setStatus] = React.useState<"offline" | "live" | "scheduled">(
    "offline"
  );
  const [artist, setArtist] = React.useState("");
  const [title, setTitle] = React.useState("");

  const esRef = React.useRef<EventSource | null>(null);

  const canConnect = Boolean(stationId && workerUrl);

  const connect = React.useCallback(() => {
    if (!canConnect || esRef.current) return;

    const url = `${workerUrl!.replace(/\/$/, "")}/v1/metrics/stream?stationId=${encodeURIComponent(
      stationId!
    )}`;

    try {
      const es = new EventSource(url, { withCredentials: false });
      esRef.current = es;
      setError(null);

      es.onopen = () => setConnected(true);

      es.onmessage = (evt) => {
        try {
          const data: MetricsPayload = JSON.parse(evt.data || "{}");
          setListeners(Number(data.listeners ?? 0));
          setViewers(Number(data.viewers ?? 0));
          setStatus((data.streamStatus as any) ?? "offline");
          if (data.artist) setArtist(String(data.artist));
          if (data.title) setTitle(String(data.title));
        } catch (e: any) {
          console.warn("SSE parse error:", e?.message || e);
        }
      };

      es.onerror = () => {
        setConnected(false);
        setError("Connection error or CORS blocked");
      };
    } catch (e: any) {
      setError(e?.message || "Failed to start SSE");
    }
  }, [canConnect, stationId, workerUrl]);

  const disconnect = React.useCallback(() => {
    try {
      esRef.current?.close();
    } catch {}
    esRef.current = null;
    setConnected(false);
  }, []);

  React.useEffect(() => {
    if (autoStart && canConnect) connect();
    return () => disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, canConnect, stationId, workerUrl]);

  const badgeColor =
    status === "live" ? "#10b981" : status === "scheduled" ? "#f59e0b" : "#6b7280";

  return (
    <div className={`urx-affiliate-panel ${className}`} style={styles.panel}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Affiliate Panel</div>
          <div style={styles.subtitle}>
            {stationId ? `Station: ${stationId}` : "No station selected"}
          </div>
        </div>
        <div style={{ ...styles.badge, background: badgeColor }}>{status}</div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Listeners</div>
          <div style={styles.cardValue}>{listeners}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Viewers</div>
          <div style={styles.cardValue}>{viewers}</div>
        </div>
        <div style={styles.cardWide}>
          <div style={styles.cardLabel}>Now Playing</div>
          <div style={styles.nowPlaying}>
            {artist || title ? (
              <>
                <span style={styles.npArtist}>{artist}</span>
                {artist && title ? " — " : ""}
                <span style={styles.npTitle}>{title}</span>
              </>
            ) : (
              <span style={{ opacity: 0.7 }}>No data yet</span>
            )}
          </div>
        </div>
      </div>

      <div style={styles.controls}>
        <button
          style={{ ...styles.btn, ...(connected ? styles.btnDisabled : {}) }}
          onClick={connect}
          disabled={!canConnect || connected}
          title={!canConnect ? "Set stationId and workerUrl" : ""}
        >
          Start
        </button>
        <button
          style={{ ...styles.btn, ...(connected ? {} : styles.btnDisabled) }}
          onClick={disconnect}
          disabled={!connected}
        >
          Stop
        </button>
        <div style={styles.connHint}>
          {connected ? "Connected" : "Disconnected"}
          {error ? ` • ${error}` : ""}
        </div>
      </div>

      {!canConnect && (
        <div style={styles.help}>
          Provide <code>stationId</code> and <code>workerUrl</code> props in WeWeb to enable
          realtime.
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    fontFamily:
      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,'Helvetica Neue',Arial,'Noto Sans',sans-serif",
    background: "#0b1220",
    color: "#e5e7eb",
    padding: 16,
    borderRadius: 12,
    border: "1px solid #1f2937",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: 700 },
  subtitle: { fontSize: 12, opacity: 0.8, marginTop: 2 },
  badge: {
    textTransform: "uppercase",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    color: "#0b1220",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
  card: {
    background: "#0f172a",
    border: "1px solid #1f2937",
    borderRadius: 10,
    padding: 12,
  },
  cardWide: {
    gridColumn: "span 3",
    background: "#0f172a",
    border: "1px solid #1f2937",
    borderRadius: 10,
    padding: 12,
  },
  cardLabel: { fontSize: 12, opacity: 0.75, marginBottom: 4 },
  cardValue: { fontSize: 28, fontWeight: 800 },
  nowPlaying: { fontSize: 14 },
  npArtist: { fontWeight: 700 },
  npTitle: { fontStyle: "italic" },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  btn: {
    background: "#111827",
    color: "#e5e7eb",
    border: "1px solid #374151",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  connHint: { fontSize: 12, opacity: 0.8, marginLeft: 8 },
  help: {
    marginTop: 10,
    fontSize: 12,
    opacity: 0.8,
    background: "#0f172a",
    border: "1px dashed #374151",
    padding: 8,
    borderRadius: 8,
  },
};
