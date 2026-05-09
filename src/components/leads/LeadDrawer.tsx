"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Car,
  MessageCircle,
  CalendarPlus,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { OutcomeSelect } from "./OutcomeSelect";
import { useLeadsStore } from "./LeadsStore";
import type { Lead, LeadOutcome, LeadTemperature, Vehicle } from "@/lib/types";
import {
  cn,
  daysBetween,
  formatDate,
  formatDateRange,
  formatPhone,
  formatRelative,
  formatUsd,
} from "@/lib/utils";

interface LeadDrawerProps {
  leadId: string | null;
  onClose: () => void;
}

const TEMPS: LeadTemperature[] = ["hot", "warm", "cold"];

export function LeadDrawer({ leadId, onClose }: LeadDrawerProps) {
  const store = useLeadsStore();
  const lead = leadId ? store.leads.find((l) => l.id === leadId) : undefined;
  const [bookingTarget, setBookingTarget] = React.useState<{
    leadId: string;
    vehicleId: string;
  } | null>(null);

  return (
    <>
      <Drawer
        open={!!lead}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        width="lg"
        title={
          lead ? (
            <span>
              Lead{" "}
              <span className="text-fg-muted font-normal tabular-nums">
                #{lead.id.replace("lead_", "L-")}
              </span>
            </span>
          ) : (
            "Lead"
          )
        }
      >
        {lead ? (
          <LeadDrawerBody
            lead={lead}
            store={store}
            onRequestAddToCalendar={(vehicleId) =>
              setBookingTarget({ leadId: lead.id, vehicleId })
            }
          />
        ) : null}
      </Drawer>

      {/* Booked → Add to vehicle calendar modal */}
      <BookingConfirmModal
        target={bookingTarget}
        onClose={() => setBookingTarget(null)}
      />
    </>
  );
}

function LeadDrawerBody({
  lead,
  store,
  onRequestAddToCalendar,
}: {
  lead: Lead;
  store: ReturnType<typeof useLeadsStore>;
  onRequestAddToCalendar: (vehicleId: string) => void;
}) {
  const interestVehicles = lead.vehicleInterestIds
    .map((vid) => store.vehicles.find((v) => v.id === vid))
    .filter((v): v is Vehicle => !!v);

  const days = daysBetween(lead.trip.pickupDate, lead.trip.returnDate);

  // Notes autosave on blur (debounced lightly)
  const [notes, setNotes] = React.useState(lead.managerNotes ?? "");
  const [saved, setSaved] = React.useState<Date | null>(null);
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotes(lead.managerNotes ?? "");
  }, [lead.managerNotes, lead.id]);

  function commitNotes() {
    if ((lead.managerNotes ?? "") === notes) return;
    store.setNotes(lead.id, notes);
    setSaved(new Date());
  }

  // Outcomes that imply the customer has committed (money on the line) — both
  // prompt the "Add booking to vehicle calendar" modal so the dates get blocked.
  const CALENDAR_TRIGGERS: ReadonlySet<LeadOutcome> = new Set([
    "booked",
    "deposit_paid",
  ]);

  function handleOutcomeChange(next: LeadOutcome) {
    store.setOutcome(lead.id, next);
    if (CALENDAR_TRIGGERS.has(next) && interestVehicles.length > 0) {
      onRequestAddToCalendar(interestVehicles[0].id);
    }
  }

  return (
    <div className="px-5 py-4 flex flex-col gap-4">
      {/* Header — customer + temperature override */}
      <div className="flex items-start gap-3">
        <Avatar name={lead.customerName} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-md font-semibold text-fg truncate leading-tight">
            {lead.customerName}
          </p>
          <p className="text-xs text-fg-subtle mt-0.5">
            {lead.customerPhone && (
              <a
                href={`tel:${lead.customerPhone}`}
                className="hover:text-fg tabular-nums"
              >
                {formatPhone(lead.customerPhone)}
              </a>
            )}
            {lead.customerPhone && lead.customerEmail && (
              <span className="mx-1 text-fg-subtle">·</span>
            )}
            {lead.customerEmail && (
              <a href={`mailto:${lead.customerEmail}`} className="hover:text-fg">
                {lead.customerEmail}
              </a>
            )}
          </p>
        </div>
      </div>

      {/* Temperature override + outcome + value strip */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex flex-col gap-1.5">
          <span className="text-fg-subtle">Temperature</span>
          <div className="flex items-center gap-1.5">
            {TEMPS.map((t) => {
              const active = t === lead.temperature;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => store.setTemperature(lead.id, t)}
                  className={cn(
                    "inline-flex items-center gap-1.5 h-7 px-2 rounded-full text-xs font-medium",
                    "border transition-colors duration-100",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    active
                      ? t === "hot"
                        ? "border-hot bg-hot-soft text-hot"
                        : t === "warm"
                          ? "border-warm bg-warm-soft text-warm"
                          : "border-cold bg-cold-soft text-cold"
                      : "border-border bg-surface text-fg-muted hover:text-fg hover:border-border-strong"
                  )}
                  aria-pressed={active}
                  aria-label={`Set temperature ${t}`}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "size-1.5 rounded-full",
                      t === "hot" && "bg-hot",
                      t === "warm" && "bg-warm",
                      t === "cold" && "bg-cold"
                    )}
                  />
                  {t === "hot" ? "Hot" : t === "warm" ? "Warm" : "Cold"}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-fg-subtle">Outcome</span>
          <OutcomeSelect
            value={lead.outcome}
            onChange={handleOutcomeChange}
            size="sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-fg-muted">
        <span>
          Estimated value{" "}
          <span className="text-fg font-semibold tabular-nums">
            {formatUsd(lead.estimatedValueUsd)}
          </span>
        </span>
        <span>
          Updated{" "}
          <span className="text-fg tabular-nums">
            {formatRelative(lead.updatedAt)}
          </span>
        </span>
      </div>

      {/* Trip card */}
      <Card variant="flat">
        <div className="px-4 pt-3 pb-2 text-sm font-semibold text-fg">Trip</div>
        <dl className="px-4 pb-3 grid grid-cols-[80px_1fr] gap-y-1.5 text-xs">
          <dt className="text-fg-subtle">Pickup</dt>
          <dd className="text-fg">
            {formatDate(lead.trip.pickupDate, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
            {lead.trip.pickupLocation && (
              <span className="text-fg-muted"> · {lead.trip.pickupLocation}</span>
            )}
          </dd>
          <dt className="text-fg-subtle">Return</dt>
          <dd className="text-fg">
            {formatDate(lead.trip.returnDate, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
            {lead.trip.dropoffLocation && (
              <span className="text-fg-muted"> · {lead.trip.dropoffLocation}</span>
            )}
          </dd>
          <dt className="text-fg-subtle">Duration</dt>
          <dd className="text-fg tabular-nums">
            {days} {days === 1 ? "day" : "days"} ·{" "}
            <span className="text-fg-muted">
              {formatDateRange(lead.trip.pickupDate, lead.trip.returnDate)}
            </span>
          </dd>
        </dl>
      </Card>

      {/* Vehicle interest card */}
      <Card variant="flat">
        <div className="px-4 pt-3 pb-2 text-sm font-semibold text-fg">
          Vehicle interest
        </div>
        {interestVehicles.length === 0 ? (
          <p className="px-4 pb-3 text-xs text-fg-subtle italic">
            No specific vehicle was discussed.
          </p>
        ) : (
          <ul className="border-t border-border divide-y divide-border">
            {interestVehicles.map((v) => (
              <li key={v.id}>
                <Link
                  href={`/fleets/${v.id}`}
                  className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-surface-2 transition-colors duration-100"
                >
                  <span
                    aria-hidden
                    className="size-7 rounded-md bg-surface-2 inline-flex items-center justify-center text-fg-subtle"
                  >
                    <Car className="size-3.5" />
                  </span>
                  <div className="flex-1 min-w-0 leading-tight">
                    <p className="text-xs text-fg truncate">
                      {v.make} {v.model} {v.year}
                    </p>
                    <p className="text-[11px] text-fg-subtle truncate tabular-nums">
                      {v.plate} · {formatUsd(v.dailyRateUsd)}/day · {v.status}
                    </p>
                  </div>
                  <ChevronRight className="size-3.5 text-fg-subtle" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Conversation card */}
      <Card variant="flat">
        <div className="px-4 pt-3 pb-2 text-sm font-semibold text-fg">
          Conversation
        </div>
        <Link
          href={`/chats/${lead.chatId}`}
          className="flex items-center gap-2.5 px-4 py-2.5 border-t border-border hover:bg-surface-2 transition-colors duration-100"
        >
          <span
            aria-hidden
            className="size-7 rounded-md bg-surface-2 inline-flex items-center justify-center text-fg-subtle"
          >
            <MessageCircle className="size-3.5" />
          </span>
          <span className="flex-1 text-xs text-fg-muted">
            Chat #{lead.chatId.replace("chat_", "TR-")}
          </span>
          <span className="text-[11px] font-medium text-accent inline-flex items-center gap-1">
            View transcript
            <ArrowRight className="size-3" aria-hidden />
          </span>
        </Link>
      </Card>

      {/* Manager notes */}
      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <label
            htmlFor={`notes-${lead.id}`}
            className="text-sm font-semibold text-fg"
          >
            Manager notes
          </label>
          {saved && (
            <span className="text-[11px] text-fg-subtle tabular-nums">
              Saved · {formatRelative(saved.toISOString())}
            </span>
          )}
        </div>
        <Textarea
          id={`notes-${lead.id}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={commitNotes}
          placeholder="Add internal notes — last contact, hold expiry, anything the next teammate should know."
          className="text-xs"
        />
      </div>
    </div>
  );
}

function BookingConfirmModal({
  target,
  onClose,
}: {
  target: { leadId: string; vehicleId: string } | null;
  onClose: () => void;
}) {
  const store = useLeadsStore();
  const lead = target ? store.leads.find((l) => l.id === target.leadId) : null;
  const vehicle = target
    ? store.vehicles.find((v) => v.id === target.vehicleId)
    : null;

  const [reason, setReason] = React.useState("");
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (target) setReason("");
  }, [target?.leadId, target?.vehicleId, target]);

  if (!target || !lead || !vehicle) {
    return (
      <Modal open={false} onOpenChange={onClose}>
        <></>
      </Modal>
    );
  }

  function commit() {
    store.addBookingRange(vehicle!.id, {
      id: `blk_${Date.now()}`,
      start: lead!.trip.pickupDate,
      end: lead!.trip.returnDate,
      reason: "rented",
      leadId: lead!.id,
    });
    onClose();
  }

  return (
    <Modal
      open={!!target}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Add booking to vehicle calendar"
      description="This will block these dates on the vehicle's availability calendar."
      width="form"
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            Skip
          </Button>
          <Button
            variant="primary"
            size="md"
            leadingIcon={<CalendarPlus className="size-4" />}
            onClick={commit}
          >
            Add booking
          </Button>
        </>
      }
    >
      <dl className="grid grid-cols-[100px_1fr] gap-y-2 text-sm pt-1">
        <dt className="text-fg-subtle">Vehicle</dt>
        <dd className="text-fg">
          {vehicle.make} {vehicle.model} {vehicle.year}{" "}
          <span className="text-fg-subtle">· {vehicle.plate}</span>
        </dd>
        <dt className="text-fg-subtle">Pickup</dt>
        <dd className="text-fg">{formatDate(lead.trip.pickupDate)}</dd>
        <dt className="text-fg-subtle">Return</dt>
        <dd className="text-fg">{formatDate(lead.trip.returnDate)}</dd>
        <dt className="text-fg-subtle">Customer</dt>
        <dd className="text-fg">{lead.customerName}</dd>
      </dl>
      <div className="mt-3">
        <label
          htmlFor="booking-note"
          className="block text-xs text-fg-muted mb-1.5"
        >
          Internal note (optional)
        </label>
        <Textarea
          id="booking-note"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Hand-off scheduled for 14:00 at LAX terminal 4"
          className="text-xs"
        />
      </div>
    </Modal>
  );
}
