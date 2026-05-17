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
      <VerticalTimeline currentIdx={currentIdx} className={className} theme={theme} />
    );
  }

  return (
    <HorizontalTimeline
      currentIdx={currentIdx}
      className={className}
      theme={theme}
    />
  );
}

type StepState = "done" | "active" | "pending";

function stepState(idx: number, currentIdx: number): StepState {
  if (idx < currentIdx) return "done";
  if (idx === currentIdx) return "active";
  return "pending";
}

interface InnerProps {
  currentIdx: number;
  className?: string;
  theme: "light" | "dark";
}

function HorizontalTimeline({
  currentIdx,
  className,
  theme,
}: Readonly<InnerProps>) {
  return (
    <div className={className}>
      {/* Mobile: vertical list — horizontal would cramp 6 steps on small screens */}
      <ol className="space-y-4 sm:hidden">
        {STEPS.map((step, idx) => {
          const state = stepState(idx, currentIdx);
          const isLast = idx === STEPS.length - 1;
          return (
            <li key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <CircleIcon Icon={step.icon} state={state} theme={theme} />
                {!isLast && (
                  <div
                    className={cn(
                      "mt-1 w-0.5 flex-1 rounded",
                      connectorClass(state, theme),
                    )}
                  />
                )}
              </div>
              <div className="flex-1 pt-1.5 pb-3">
                <p className={cn("text-sm", labelClass(state, theme))}>
                  {step.label}
                </p>
                {state === "active" && (
                  <p
                    className={cn(
                      "mt-0.5 text-xs",
                      theme === "dark"
                        ? "text-amber-400/80"
                        : "text-primary-700/80",
                    )}
                  >
                    Đang xử lý
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Desktop: horizontal stepper with connectors between */}
      <ol className="hidden sm:flex sm:items-start">
        {STEPS.map((step, idx) => {
          const state = stepState(idx, currentIdx);
          const isLast = idx === STEPS.length - 1;
          return (
            <li
              key={step.key}
              className={cn(
                "flex items-start",
                isLast ? "flex-shrink-0" : "flex-1",
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <CircleIcon Icon={step.icon} state={state} theme={theme} />
                <span
                  className={cn(
                    "max-w-[100px] text-center text-xs leading-tight",
                    labelClass(state, theme),
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  aria-hidden
                  className={cn(
                    "mt-[15px] h-0.5 flex-1 rounded transition-colors",
                    connectorClass(state, theme),
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function VerticalTimeline({
  currentIdx,
  className,
  theme,
}: Readonly<InnerProps>) {
  return (
    <ol className={cn("space-y-3", className)}>
      {STEPS.map((step, idx) => {
        const state = stepState(idx, currentIdx);
        const isLast = idx === STEPS.length - 1;
        return (
          <li key={step.key} className="flex gap-3 text-sm">
            <div className="flex flex-col items-center">
              <CircleIcon Icon={step.icon} state={state} theme={theme} />
              {!isLast && (
                <div
                  className={cn(
                    "mt-1 w-0.5 flex-1 rounded",
                    connectorClass(state, theme),
                  )}
                />
              )}
            </div>
            <span className={cn("pt-1.5", labelClass(state, theme))}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
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
        "relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors",
        circleClass(state, theme),
      )}
    >
      {state === "active" && (
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 animate-ping rounded-full opacity-40",
            theme === "dark" ? "bg-amber-400" : "bg-primary-500",
          )}
        />
      )}
      <Icon size={14} className="relative" />
    </span>
  );
}

function circleClass(state: StepState, theme: "light" | "dark") {
  if (state === "done") {
    return theme === "dark"
      ? "bg-emerald-500 text-stone-900 shadow-sm"
      : "bg-primary-700 text-white shadow-sm";
  }
  if (state === "active") {
    return theme === "dark"
      ? "bg-amber-400 text-stone-900 ring-4 ring-amber-400/20"
      : "bg-primary-700 text-white ring-4 ring-primary-200";
  }
  return theme === "dark"
    ? "bg-admin-surface-2 text-admin-text-muted ring-1 ring-admin-border"
    : "bg-stone-100 text-stone-400 ring-1 ring-stone-200";
}

function labelClass(state: StepState, theme: "light" | "dark") {
  if (state === "active") {
    return theme === "dark"
      ? "text-admin-text font-semibold"
      : "text-stone-900 font-semibold";
  }
  if (state === "done") {
    return theme === "dark" ? "text-emerald-400" : "text-primary-700";
  }
  return theme === "dark" ? "text-admin-text-muted/70" : "text-stone-400";
}

function connectorClass(state: StepState, theme: "light" | "dark") {
  if (state === "done") {
    return theme === "dark" ? "bg-emerald-500" : "bg-primary-500";
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
        "flex items-center gap-3 rounded-xl p-4 text-sm",
        theme === "dark"
          ? "bg-red-500/10 text-red-400"
          : "bg-red-50 text-red-700",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full",
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
