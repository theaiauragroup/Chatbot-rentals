"use client";

import * as React from "react";
import { CircleCheck, CircleAlert, Eye, EyeOff, Send, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useSettingsStore } from "./SettingsStore";
import { useToast } from "@/components/ui/Toaster";
import { toasts } from "@/lib/toasts";
import { formatPhone, cn } from "@/lib/utils";

export function TwilioTab() {
  const store = useSettingsStore();
  const toast = useToast();
  const t = store.draftTenant.twilio;
  const [showToken, setShowToken] = React.useState(false);
  const [testOpen, setTestOpen] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  function sendTest() {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setTestOpen(false);
      toast.success(toasts.testSmsSent);
    }, 1200);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Status banner */}
      <Card
        className={cn(
          "p-4 flex items-center justify-between gap-3",
          t.isVerified
            ? "border-success/30 bg-success-soft/50"
            : "border-warning/30 bg-warning-soft/50"
        )}
      >
        <div className="flex items-center gap-2.5 text-sm">
          {t.isVerified ? (
            <CircleCheck className="size-4 text-success" aria-hidden />
          ) : (
            <CircleAlert className="size-4 text-warning" aria-hidden />
          )}
          <span className={t.isVerified ? "text-success" : "text-warning"}>
            {t.isVerified
              ? "Verified · ready to send"
              : "Unverified — verify your sender number to start sending"}
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leadingIcon={<Send className="size-3.5" />}
          onClick={() => setTestOpen(true)}
          disabled={!t.isVerified}
        >
          Send test SMS
        </Button>
      </Card>

      {/* Credentials */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-fg">Credentials</h3>
        <p className="text-xs text-fg-muted mt-1">
          Stored encrypted server-side. The auth token is never exposed to the dashboard or browser.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Account SID">
            <Input
              value={t.accountSid}
              onChange={(e) => store.patchTwilio({ accountSid: e.target.value })}
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="font-mono text-xs"
            />
          </Field>
          <Field label="Auth token">
            <Input
              value={
                showToken
                  ? t.authTokenMasked.replace(/•/g, "0")
                  : t.authTokenMasked
              }
              onChange={(e) =>
                store.patchTwilio({ authTokenMasked: e.target.value })
              }
              className="font-mono text-xs"
              trailingIcon={
                <button
                  type="button"
                  onClick={() => setShowToken((v) => !v)}
                  aria-label={showToken ? "Hide token" : "Show token"}
                  className="text-fg-subtle hover:text-fg transition-colors duration-100"
                >
                  {showToken ? (
                    <EyeOff className="size-3.5" />
                  ) : (
                    <Eye className="size-3.5" />
                  )}
                </button>
              }
            />
          </Field>
          <Field label="Sender number">
            <Input
              value={t.senderNumber}
              onChange={(e) => store.patchTwilio({ senderNumber: e.target.value })}
              className="font-mono text-xs"
              placeholder="+15555550173"
            />
          </Field>
        </div>
        <div className="mt-3 text-xs text-fg-muted">
          Where do I find these?{" "}
          <button
            type="button"
            onClick={() =>
              toast.info(toasts.notImplemented("External link"))
            }
            className="inline-flex items-center gap-1 text-accent hover:underline underline-offset-2"
          >
            Open Twilio console <ExternalLink className="size-3" aria-hidden />
          </button>
        </div>
      </Card>

      {/* Sending log */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-fg">Sending log · last 7 days</h3>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <Stat label="Sent" value="37" />
          <Stat label="Failed" value="1" valueClassName="text-danger" />
          <Stat label="Cost (est)" value="$0.74" />
        </div>
        <button
          type="button"
          onClick={() => toast.info(toasts.notImplemented("Full SMS log"))}
          className="mt-3 text-[11px] font-medium text-accent hover:underline underline-offset-2"
        >
          View full log →
        </button>
      </Card>

      {/* Test modal */}
      <Modal
        open={testOpen}
        onOpenChange={setTestOpen}
        title={`Send test SMS to ${formatPhone(store.draftTenant.notifications.managerPhone)}?`}
        description="This will send a sample notification using your current Twilio configuration."
        footer={
          <>
            <Button variant="ghost" onClick={() => setTestOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={sending} onClick={sendTest}>
              Send test
            </Button>
          </>
        }
      >
        <></>
      </Modal>
    </div>
  );
}

function Stat({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-fg-subtle">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-xl font-semibold tabular-nums text-fg",
          valueClassName
        )}
        style={{ letterSpacing: "var(--tracking-tight)" }}
      >
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-fg">{label}</span>
      {children}
    </label>
  );
}
