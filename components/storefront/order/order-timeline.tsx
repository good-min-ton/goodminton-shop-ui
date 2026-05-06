"use client";

import { Check, Clock, Package, Truck, CheckCircle2, X } from "lucide-react";
import type { OrderStatus } from "@/types/api";
import { cn } from "@/lib/utils";

interface Step {
  key: OrderStatus;
  label: string;
  icon: typeof Clock;
}

const STEPS: Step[] = [
  { key: "PENDING", label: "Chờ xác nhận", icon: Clock },
  { key: "CONFIRMED", label: "Đã xác nhận", icon: CheckCircle2 },
  { key: "PREPARING", label: "Đang chuẩn bị", icon: Package },
  { key: "SHIPPING", label: "Đang giao", icon: Truck },
  { key: "DELIVERED", label: "Đã giao", icon: CheckCircle2 },
  { key: "COMPLETED", label: "Hoàn thành", icon: Check },
];

interface OrderTimelineProps {
  current: OrderStatus;
  /** When CANCELLED, show all-cancelled state. */
  className?: string;
  theme?: "light" | "dark";
  layout?: "horizontal" | "vertical";
}

export function OrderTimeline({
  current,
  className,
  theme = "light",
  layout = "horizontal",
}: Readonly<OrderTimelineProps>) {
  if (current === "CANCELLED") {
    return <CancelledState className={className} theme={theme} />;
  }

  const currentIdx = STEPS.findIndex((s) => s.key === current);

  if (layout === "vertical") {
    return (
      <ol className={cn("space-y-3", className)}>
        {STEPS.map((step, idx) => {
          const state = stepState(idx, currentIdx);
          return (
            <TimelineRow key={step.key} step={step} state={state} theme={theme} />
          );
        })}
      </ol>
    );
  }

  return (
    <ol
      className={cn(
        "flex items-start gap-1 overflow-x-auto md:gap-0",
        className,
      )}
    >
      {STEPS.map((step, idx) => {
        const state = stepState(idx, currentIdx);
        return (
          <TimelineCol
            key={step.key}
            step={step}
            state={state}
            theme={theme}
            isLast={idx === STEPS.length - 1}
          />
        );
      })}
    </ol>
  );
}

type StepState = "done" | "active" | "pending";

function stepState(idx: number, currentIdx: number): StepState {
  if (idx < currentIdx) return "done";
  if (idx === currentIdx) return "active";
  return "pending";
}

interface RowProps {
  step: Step;
  state: StepState;
  theme: "light" | "dark";
}

function TimelineRow({ step, state, theme }: Readonly<RowProps>) {
  const Icon = step.icon;
  return (
    <li className="flex items-center gap-3 text-sm">
      <CircleIcon Icon={Icon} state={state} theme={theme} />
      <span className={labelClass(state, theme)}>{step.label}</span>
    </li>
  );
}

interface ColProps extends RowProps {
  isLast: boolean;
}

function TimelineCol({ step, state, theme, isLast }: Readonly<ColProps>) {
  const Icon = step.icon;
  return (
    <li className="flex flex-1 flex-col items-center md:flex-row md:items-start">
      <div className="flex w-full flex-col items-center md:flex-row">
        <CircleIcon Icon={Icon} state={state} theme={theme} />
        {!isLast && (
          <div
            className={cn(
              "h-px flex-1",
              connectorClass(state, theme),
              "hidden md:block",
            )}
          />
        )}
      </div>
      <span
        className={cn(
          "mt-2 max-w-[80px] text-center text-[11px] leading-tight md:absolute md:-mt-0",
          labelClass(state, theme),
        )}
      >
        {step.label}
      </span>
    </li>
  );
}

interface CircleProps {
  Icon: typeof Clock;
  state: StepState;
  theme: "light" | "dark";
}

function CircleIcon({ Icon, state, theme }: Readonly<CircleProps>) {
  return (
    <span
      className={cn(
        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-2 transition-colors",
        circleClass(state, theme),
      )}
    >
      <Icon size={14} />
    </span>
  );
}

function circleClass(state: StepState, theme: "light" | "dark") {
  if (state === "done") {
    return theme === "dark"
      ? "bg-emerald-500/20 text-emerald-400 ring-emerald-500/30"
      : "bg-primary-100 text-primary-700 ring-primary-200";
  }
  if (state === "active") {
    return theme === "dark"
      ? "bg-amber-400 text-stone-900 ring-amber-300/40"
      : "bg-primary-700 text-white ring-primary-200";
  }
  return theme === "dark"
    ? "bg-admin-surface-2 text-admin-text-muted ring-admin-border"
    : "bg-stone-100 text-stone-400 ring-stone-200";
}

function labelClass(state: StepState, theme: "light" | "dark") {
  if (state === "active") {
    return theme === "dark"
      ? "text-admin-text font-medium"
      : "text-stone-900 font-medium";
  }
  if (state === "done") {
    return theme === "dark" ? "text-admin-text-muted" : "text-stone-600";
  }
  return theme === "dark" ? "text-admin-text-muted/60" : "text-stone-400";
}

function connectorClass(state: StepState, theme: "light" | "dark") {
  if (state === "done") {
    return theme === "dark" ? "bg-emerald-500/40" : "bg-primary-400";
  }
  return theme === "dark" ? "bg-admin-border" : "bg-stone-200";
}

function CancelledState({
  className,
  theme,
}: Readonly<{ className?: string; theme: "light" | "dark" }>) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg p-4 text-sm",
        theme === "dark"
          ? "bg-red-500/10 text-red-400"
          : "bg-red-50 text-red-700",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
          theme === "dark" ? "bg-red-500/20" : "bg-red-100",
        )}
      >
        <X size={16} />
      </span>
      <div>
        <p className="font-medium">Đơn hàng đã bị huỷ</p>
        <p
          className={cn(
            "mt-0.5 text-xs",
            theme === "dark" ? "text-red-400/70" : "text-red-600/80",
          )}
        >
          Số lượng tồn kho đã được hoàn lại tự động.
        </p>
      </div>
    </div>
  );
}
