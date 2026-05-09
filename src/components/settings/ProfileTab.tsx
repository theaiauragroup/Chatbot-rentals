"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { useSettingsStore } from "./SettingsStore";
import { useToast } from "@/components/ui/Toaster";
import { toasts } from "@/lib/toasts";
import { cn } from "@/lib/utils";

export function ProfileTab() {
  const store = useSettingsStore();
  const toast = useToast();
  const m = store.draftManager;

  return (
    <div className="flex flex-col gap-4">
      {/* Personal info */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-fg">Personal info</h3>
        <div className="mt-4 flex items-center gap-4">
          <Avatar name={m.name} size="lg" src={m.avatarUrl} />
          <div className="flex flex-col gap-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                toast.info(toasts.notImplemented("Avatar upload"))
              }
            >
              Change avatar
            </Button>
            <p className="text-[11px] text-fg-subtle">
              JPG/PNG, square, ≥ 256×256
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full name">
            <Input
              value={m.name}
              onChange={(e) => store.patchManager({ name: e.target.value })}
            />
          </Field>
          <Field label="Role" hint="Read-only this pass">
            <select
              disabled
              value={m.role}
              className={cn(
                "h-9 px-3 rounded-sm border border-border bg-surface-2 text-base text-fg-muted",
                "outline-none cursor-not-allowed"
              )}
            >
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
            </select>
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={m.email}
              onChange={(e) => store.patchManager({ email: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={m.phone}
              onChange={(e) => store.patchManager({ phone: e.target.value })}
              placeholder="+1 (555) 555-0173"
            />
          </Field>
        </div>
      </Card>

      {/* Password */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-fg">Password</h3>
        <p className="text-xs text-fg-muted mt-1">
          Update your dashboard login password.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Current password">
            <Input type="password" placeholder="••••••••" />
          </Field>
          <Field label="New password">
            <Input type="password" placeholder="••••••••" />
          </Field>
          <Field label="Confirm new">
            <Input type="password" placeholder="••••••••" />
          </Field>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              toast.success(`Reset link sent to ${m.email}.`)
            }
            className="text-xs text-fg-muted hover:text-accent transition-colors duration-100"
          >
            Forgot your current password?{" "}
            <span className="text-accent underline-offset-2 hover:underline">
              Send reset link
            </span>
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => toast.success("Password updated.")}
          >
            Update password
          </Button>
        </div>
      </Card>

      {/* Sessions */}
      <Card className="p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold text-fg">Sessions</h3>
          <p className="text-xs text-fg-muted mt-1">
            You&apos;re signed in on 1 device.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toast.info(toasts.notImplemented("Auth"))}
        >
          Sign out everywhere
        </Button>
      </Card>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-fg">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-fg-subtle">{hint}</span>}
    </label>
  );
}
