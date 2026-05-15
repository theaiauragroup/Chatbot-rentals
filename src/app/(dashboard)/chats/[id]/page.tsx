import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Car,
  CheckCircle2,
  FileDown,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { TemperaturePill } from "@/components/leads/StatusPill";
import { TranscriptView } from "@/components/chat/TranscriptView";
import { chatById, leadById, vehicleById } from "@/lib/mock";
import {
  formatDate,
  formatTime,
  formatDuration,
  formatPhone,
  formatDateRange,
  formatUsd,
  outcomeLabel,
} from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Chat #${id.replace("chat_", "TR-")} · AIAURA FLEETS` };
}

export default async function TranscriptPage({ params }: PageProps) {
  const { id } = await params;
  const chat = chatById(id);
  if (!chat) notFound();

  const lead = chat.leadId ? leadById(chat.leadId) : undefined;
  const vehicleInterest = (lead?.vehicleInterestIds ?? chat.vehicleIdsOfInterest)
    .map((vid) => vehicleById(vid))
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-fg-muted">
        <Link
          href="/chats"
          className="inline-flex items-center gap-1 hover:text-fg transition-colors duration-100"
        >
          <ArrowLeft className="size-3" aria-hidden />
          Chats
        </Link>
        <ChevronRight
          className="inline-block size-3 mx-1.5 text-fg-subtle align-middle"
          aria-hidden
        />
        <span className="text-fg font-medium tabular-nums">
          #{id.replace("chat_", "TR-")}
        </span>
      </nav>

      {/* Header strip */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-fg-muted">
        <span>
          Started{" "}
          <span className="text-fg font-medium">
            {formatDate(chat.startedAt.slice(0, 10))} · {formatTime(chat.startedAt)}
          </span>
        </span>
        <span aria-hidden className="text-fg-subtle">
          ·
        </span>
        <span>
          Duration{" "}
          <span className="text-fg font-medium tabular-nums">
            {formatDuration(chat.durationSec)}
          </span>
        </span>
        <span aria-hidden className="text-fg-subtle">
          ·
        </span>
        <span>
          <span className="text-fg font-medium tabular-nums">
            {chat.messages.length}
          </span>{" "}
          messages
        </span>
        <span aria-hidden className="text-fg-subtle">
          ·
        </span>
        <span className="inline-flex items-center gap-1.5">
          Final
          <TemperaturePill temperature={chat.finalTemperature} />
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Transcript */}
        <Card className="lg:col-span-8 p-5">
          <TranscriptView chat={chat} />
        </Card>

        {/* Right rail */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          {/* Linked lead */}
          <Card>
            <div className="px-4 pt-3 pb-2">
              <h3 className="text-sm font-semibold text-fg">Linked lead</h3>
            </div>
            {lead ? (
              <div className="px-4 pb-4 flex flex-col gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Avatar name={lead.customerName || "Anonymous"} size="md" />
                  <div className="flex flex-col min-w-0 leading-tight">
                    <span className="text-sm font-medium text-fg truncate">
                      {lead.customerName}
                    </span>
                    {lead.customerPhone && (
                      <a
                        href={`tel:${lead.customerPhone}`}
                        className="text-[11px] text-fg-subtle hover:text-fg tabular-nums"
                      >
                        {formatPhone(lead.customerPhone)}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <TemperaturePill temperature={lead.temperature} />
                  <span className="text-fg-muted">·</span>
                  <span className="text-fg-muted">{outcomeLabel(lead.outcome)}</span>
                </div>
                <div className="flex flex-col gap-1 text-fg-muted">
                  <span>
                    Pickup{" "}
                    <span className="text-fg">
                      {formatDateRange(lead.trip.pickupDate, lead.trip.returnDate)}
                    </span>
                  </span>
                  <span>
                    Estimated value{" "}
                    <span className="text-fg font-medium tabular-nums">
                      {formatUsd(lead.estimatedValueUsd)}
                    </span>
                  </span>
                </div>
                <Link
                  href={`/leads?id=${lead.id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline underline-offset-2"
                >
                  View lead
                  <ArrowRight className="size-3" aria-hidden />
                </Link>
              </div>
            ) : (
              <EmptyState
                icon={<CheckCircle2 />}
                title="Conversation didn't generate a lead yet"
                description="Once contact info is captured, a lead will appear here."
              />
            )}
          </Card>

          {/* Vehicles discussed */}
          <Card>
            <div className="px-4 pt-3 pb-2">
              <h3 className="text-sm font-semibold text-fg">Vehicles discussed</h3>
            </div>
            {vehicleInterest.length === 0 ? (
              <EmptyState
                icon={<Car />}
                title="No vehicles referenced"
                description="The bot didn't quote a specific car in this conversation."
              />
            ) : (
              <ul className="border-t border-border divide-y divide-border">
                {vehicleInterest.map((v) => (
                  <li key={v!.id}>
                    <Link
                      href={`/fleets/${v!.id}`}
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
                          {v!.make} {v!.model} {v!.year}
                        </p>
                        <p className="text-[11px] text-fg-subtle truncate tabular-nums">
                          {v!.plate} · {formatUsd(v!.dailyRateUsd)}/day
                        </p>
                      </div>
                      <ChevronRight
                        className="size-3.5 text-fg-subtle"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Quick actions */}
          <Card>
            <div className="px-4 pt-3 pb-2">
              <h3 className="text-sm font-semibold text-fg">Quick actions</h3>
            </div>
            <div className="px-4 pb-4 flex flex-col gap-2">
              <Button variant="secondary" size="sm" className="w-full justify-center">
                <CheckCircle2 className="size-3.5" aria-hidden />
                Mark resolved
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-center">
                <FileDown className="size-3.5" aria-hidden />
                Export PDF
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
