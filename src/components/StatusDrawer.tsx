import * as React from "react"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"

interface TelemetryData {
  app: string
  battery: string
  wifi: string
  city: string
  model: string
}

export function StatusDrawer() {
  const [telemetry, setTelemetry] = React.useState<TelemetryData>({
    app: "Loading...",
    battery: "--",
    wifi: "--",
    city: "--",
    model: "--",
  })

  React.useEffect(() => {
    fetch("https://status-api.fannbryan.workers.dev/")
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed: ${response.status}`)
        return response.json()
      })
      .then((data) => {
        const batteryVal = data["battery "] || data.battery || "--"
        const isConnected = data.wifi && data.wifi !== "Not Connected"
        setTelemetry({
          app: data.app || "Online",
          battery: String(batteryVal).trim() + "%",
          wifi: isConnected ? "Connected" : "Offline",
          city: data.city || "--",
          model: data.model || "--",
        })
      })
      .catch(() => {
        setTelemetry((prev) => ({
          ...prev,
          app: "Offline",
        }))
      })
  }, [])

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="status-trigger rounded-none border border-[var(--border)] bg-transparent hover:bg-[var(--text-primary)] hover:text-[var(--canvas)] text-[var(--text-primary)] font-mono text-[0.7rem] uppercase tracking-[0.12em] gap-[0.65rem] px-4 py-[0.72rem] h-auto cursor-pointer"
          aria-label="Show status"
        >
          <span className="pulse-dot size-[0.55rem] bg-[var(--accent-green)] inline-block" />
          <span>Live Status</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(30rem,100vw)] p-[var(--space-lg)] border-l-[length:var(--frame)] border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] flex flex-col gap-0 rounded-none shadow-none"
      >
        <SheetHeader className="drawer-header border-b border-[var(--border)] pb-[var(--space-md)] text-left">
          <span className="axis-label text-[var(--text-tertiary)] font-mono text-[0.68rem] tracking-[0.16em] uppercase">
            Current Signal
          </span>
          <SheetTitle className="sr-only">Current Signal</SheetTitle>
          <SheetDescription className="sr-only">Device and presence telemetry</SheetDescription>
        </SheetHeader>
        <div className="status-card-inner py-4">
          <h3 className="status-app font-display font-black uppercase text-[clamp(2.5rem,8vw,5rem)] leading-none tracking-tight mt-[var(--space-xl)]">
            {telemetry.app}
          </h3>
          <p className="status-subtitle text-[var(--text-secondary)] my-2 mb-[var(--space-lg)]">
            Device and presence telemetry
          </p>
          <Separator className="bg-[var(--border)]" />
          <div className="status-items flex flex-col">
            <div className="status-item flex justify-between gap-4 py-[0.9rem] border-b border-[var(--border)] font-mono text-[0.78rem] uppercase">
              <span className="text-[var(--text-tertiary)]">Battery</span>
              <strong>{telemetry.battery}</strong>
            </div>
            <div className="status-item flex justify-between gap-4 py-[0.9rem] border-b border-[var(--border)] font-mono text-[0.78rem] uppercase">
              <span className="text-[var(--text-tertiary)]">Network</span>
              <strong>{telemetry.wifi}</strong>
            </div>
            <div className="status-item flex justify-between gap-4 py-[0.9rem] border-b border-[var(--border)] font-mono text-[0.78rem] uppercase">
              <span className="text-[var(--text-tertiary)]">City</span>
              <strong>{telemetry.city}</strong>
            </div>
            <div className="status-item flex justify-between gap-4 py-[0.9rem] border-b border-[var(--border)] font-mono text-[0.78rem] uppercase">
              <span className="text-[var(--text-tertiary)]">Model</span>
              <strong>{telemetry.model}</strong>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
