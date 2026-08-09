"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Store } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { OrderDraft, OrderOption, OrderSelection } from "./types";

/**
 * Lets the customer choose a variant by tapping, instead of typing.
 *
 * The bot used to ask "which size?" in prose and then map the reply back to a
 * variant_id itself — a full LLM generation per question, and the step that
 * produced wrong-variant orders. Everything here is local: picking costs no
 * round trips at all.
 *
 * Options arrive as a flat list because a product's variants are not a
 * size x colour matrix — not every combination exists, and either may be null
 * (rackets have no colour). So the chips are derived from the variants that
 * actually exist, and a combination nobody stocks is simply not offered.
 */

interface VariantPickerCardProps {
  selection: OrderSelection;
  /** Called once the customer commits; the parent stores the draft on the
   *  message so a reload resumes at the confirm step. */
  onPicked: (draft: OrderDraft) => void;
}

const unique = <T,>(values: T[]): T[] => Array.from(new Set(values));

export function VariantPickerCard({
  selection,
  onPicked,
}: Readonly<VariantPickerCardProps>) {
  const { options } = selection;

  const sizes = useMemo(
    () => unique(options.map((o) => o.size).filter((s): s is string => !!s)),
    [options],
  );
  const colors = useMemo(
    () => unique(options.map((o) => o.color).filter((c): c is string => !!c)),
    [options],
  );

  // A single variant needs no chips at all — go straight to quantity.
  const [size, setSize] = useState<string | null>(
    sizes.length === 1 ? sizes[0] : null,
  );
  const [color, setColor] = useState<string | null>(
    colors.length === 1 ? colors[0] : null,
  );
  const [quantity, setQuantity] = useState(1);

  /** Colours that exist for the chosen size (and vice versa), so a chip is only
   *  offered when some real variant backs it. */
  const colorsForSize = useMemo(
    () =>
      new Set(
        options
          .filter((o) => (size == null ? true : o.size === size))
          .map((o) => o.color),
      ),
    [options, size],
  );
  const sizesForColor = useMemo(
    () =>
      new Set(
        options
          .filter((o) => (color == null ? true : o.color === color))
          .map((o) => o.size),
      ),
    [options, color],
  );

  const needsSize = sizes.length > 0;
  const needsColor = colors.length > 0;
  const chosen: OrderOption | undefined = useMemo(() => {
    if (needsSize && size == null) return undefined;
    if (needsColor && color == null) return undefined;
    return options.find(
      (o) => (!needsSize || o.size === size) && (!needsColor || o.color === color),
    );
  }, [options, size, color, needsSize, needsColor]);

  const max = chosen?.orderable ?? 0;
  const capped = Math.min(quantity, Math.max(max, 1));

  function commit() {
    if (!chosen || max <= 0) return;
    const qty = Math.min(capped, max);
    const lineTotal = chosen.unit_price * qty;
    onPicked({
      items: [
        {
          product_id: selection.product_id,
          variant_id: chosen.variant_id,
          product_name: selection.product_name,
          size: chosen.size,
          color: chosen.color,
          quantity: qty,
          unit_price: chosen.unit_price,
          line_total: lineTotal,
          // Quantity is capped at central stock, so this is true by construction.
          // A later race is caught by the atomic deduction at placement.
          in_stock: true,
        },
      ],
      total: lineTotal,
      currency: selection.currency || "VND",
      warnings: [],
    });
  }

  return (
    <div className="w-full max-w-[85%] space-y-3 rounded-2xl rounded-bl-md border border-stone-200 bg-white p-3 shadow-sm">
      <p className="line-clamp-2 text-[13px] font-semibold text-stone-800">
        {selection.product_name}
      </p>

      {needsSize && (
        <ChipRow
          label="Size"
          values={sizes}
          selected={size}
          isAvailable={(v) => sizesForColor.has(v)}
          stockFor={(v) => stockOf(options, v, color, needsColor)}
          onSelect={(v) => {
            setSize(v);
            setQuantity(1);
          }}
        />
      )}

      {needsColor && (
        <ChipRow
          label="Màu"
          values={colors}
          selected={color}
          isAvailable={(v) => colorsForSize.has(v)}
          stockFor={(v) => stockOf(options, size, v, needsSize, true)}
          onSelect={(v) => {
            setColor(v);
            setQuantity(1);
          }}
        />
      )}

      {chosen && max > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium tracking-wide text-stone-500 uppercase">
            Số lượng
          </span>
          <div className="flex items-center gap-2">
            <StepButton
              ariaLabel="Giảm số lượng"
              disabled={capped <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus size={13} />
            </StepButton>
            <span className="w-6 text-center text-sm font-semibold text-stone-800">
              {capped}
            </span>
            <StepButton
              ariaLabel="Tăng số lượng"
              disabled={capped >= max}
              onClick={() => setQuantity((q) => Math.min(max, q + 1))}
            >
              <Plus size={13} />
            </StepButton>
          </div>
        </div>
      )}

      {chosen && max > 0 && (
        <>
          {max <= 3 && (
            <p className="text-[11px] text-amber-700">
              Chỉ còn {max} sản phẩm.
            </p>
          )}
          <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-sm font-bold text-stone-900">
            <span>Tạm tính</span>
            <span className="text-primary-700">
              {formatPrice(chosen.unit_price * capped)}đ
            </span>
          </div>
          <button
            type="button"
            onClick={commit}
            className="bg-primary-700 hover:bg-primary-800 w-full rounded-lg py-2 text-sm font-medium text-white transition-colors"
          >
            Tiếp tục
          </button>
        </>
      )}

      {chosen && max <= 0 && <OutOfStockNotice option={chosen} />}

      {!chosen && (
        <p className="text-center text-[11px] text-stone-500">
          {needsSize && size == null
            ? "Chọn size để tiếp tục"
            : "Chọn màu để tiếp tục"}
        </p>
      )}
    </div>
  );
}

/** Central stock for the variant a chip would resolve to, or null when no
 *  variant backs that combination. Drives the "hết hàng" styling. */
function stockOf(
  options: OrderOption[],
  size: string | null,
  color: string | null,
  otherNeeded: boolean,
  chipIsColor = false,
): number | null {
  const match = options.find((o) =>
    chipIsColor
      ? o.color === color && (!otherNeeded || o.size === size)
      : o.size === size && (!otherNeeded || o.color === color),
  );
  return match ? match.orderable : null;
}

interface ChipRowProps {
  label: string;
  values: string[];
  selected: string | null;
  isAvailable: (value: string) => boolean;
  stockFor: (value: string) => number | null;
  onSelect: (value: string) => void;
}

function ChipRow({
  label,
  values,
  selected,
  isAvailable,
  stockFor,
  onSelect,
}: Readonly<ChipRowProps>) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium tracking-wide text-stone-500 uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((value) => {
          const exists = isAvailable(value);
          const stock = stockFor(value);
          // Out of stock stays selectable: tapping it reveals which branch has
          // one. Hiding it would read as "we do not make that size".
          const soldOut = exists && stock !== null && stock <= 0;
          return (
            <button
              key={value}
              type="button"
              disabled={!exists}
              aria-pressed={selected === value}
              onClick={() => onSelect(value)}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-[13px] transition-colors",
                selected === value
                  ? "border-primary-700 bg-primary-700 text-white"
                  : "border-stone-200 text-stone-700 hover:border-primary-300",
                !exists && "cursor-not-allowed opacity-30",
                soldOut && selected !== value && "text-stone-400 line-through",
              )}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OutOfStockNotice({ option }: Readonly<{ option: OrderOption }>) {
  const stocked = option.branches.filter((b) => b.quantity > 0);
  return (
    <div className="space-y-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
      <p className="font-medium">Lựa chọn này đang hết hàng đặt online.</p>
      {stocked.length > 0 && (
        <div className="space-y-1">
          <p>Hiện còn tại:</p>
          {stocked.map((b) => (
            <p key={b.store_id ?? b.store_name} className="flex items-center gap-1">
              <Store size={11} className="flex-shrink-0" />
              <span>
                {b.store_name} ({b.quantity})
              </span>
            </p>
          ))}
          {/* Branch stock is not reserved - someone can buy it at the counter
              minutes from now, so this must not read as a promise. */}
          <p className="text-amber-700/80">
            Bạn vui lòng liên hệ chi nhánh trước khi tới nhé.
          </p>
        </div>
      )}
      {stocked.length === 0 && <p>Bạn thử chọn size hoặc màu khác nhé.</p>}
    </div>
  );
}

function StepButton({
  ariaLabel,
  disabled,
  onClick,
  children,
}: Readonly<{
  ariaLabel: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}>) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center rounded-md border border-stone-200 text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}
