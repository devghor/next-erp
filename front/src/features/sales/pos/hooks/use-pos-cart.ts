'use client';

import { useReducer, useMemo, useCallback } from 'react';
import type { Sale } from '@/features/sales/sales/api/types';

/**
 * One product line in the POS cart. Mirrors `SaleItemFormValues`
 * (`features/sales/sales/schemas/sale.ts`) plus the variant/batch/unit
 * identity needed to tell two otherwise-identical products apart and a
 * stable `key` for React lists and dedupe-on-add.
 */
export type PosCartLine = {
  key: string;
  product_id: number;
  product_name: string;
  product_code?: string;
  variant_id?: number | null;
  variant_name?: string | null;
  batch_id?: number | null;
  batch_no?: string | null;
  sale_unit_id?: number | null;
  qty: number;
  net_unit_price: number;
  discount: number;
  tax_rate: number;
  /** Stock available at the active warehouse, for a soft over-sell warning. */
  stock?: number;
};

export type PosOrderDiscountType = 'fixed' | 'percentage';

export type PosOrderDiscount = {
  type: PosOrderDiscountType;
  value: number;
};

export type PosCoupon = {
  id: number;
  code: string;
  type: 'fixed' | 'percentage';
  amount: number;
};

export type PosCartState = {
  lines: PosCartLine[];
  customer_id: number | null;
  order_discount: PosOrderDiscount;
  coupon: PosCoupon | null;
  order_tax_rate: number;
  shipping_cost: number;
  sale_note: string;
  /** Set when the cart was resumed from a held (draft) sale — finalizing calls updateSaleMutation instead of createSaleMutation. */
  draft_sale_id: number | null;
  draft_reference_no: string | null;
};

export type AddCartLineInput = {
  product_id: number;
  product_name: string;
  product_code?: string;
  variant_id?: number | null;
  variant_name?: string | null;
  batch_id?: number | null;
  batch_no?: string | null;
  sale_unit_id?: number | null;
  net_unit_price: number;
  qty?: number;
  discount?: number;
  tax_rate?: number;
  stock?: number;
};

type PosCartAction =
  | { type: 'ADD_LINE'; payload: AddCartLineInput }
  | { type: 'UPDATE_LINE'; key: string; patch: Partial<PosCartLine> }
  | { type: 'REMOVE_LINE'; key: string }
  | { type: 'SET_CUSTOMER'; customerId: number | null }
  | { type: 'SET_ORDER_DISCOUNT'; discount: PosOrderDiscount }
  | { type: 'SET_COUPON'; coupon: PosCoupon | null }
  | { type: 'SET_ORDER_TAX_RATE'; rate: number }
  | { type: 'SET_SHIPPING_COST'; cost: number }
  | { type: 'SET_SALE_NOTE'; note: string }
  | { type: 'LOAD_DRAFT'; sale: Sale }
  | { type: 'CLEAR' };

export function lineKey(input: {
  product_id: number;
  variant_id?: number | null;
  batch_id?: number | null;
}): string {
  return `${input.product_id}:${input.variant_id ?? 0}:${input.batch_id ?? 0}`;
}

/** Per-line total: qty * price, minus the line discount, plus line tax — same math as `rowTotal` in sale-items-editor.tsx. */
export function rowTotal(row: Pick<PosCartLine, 'qty' | 'net_unit_price' | 'discount' | 'tax_rate'>): number {
  const subTotal = row.qty * row.net_unit_price - (row.discount ?? 0);
  const tax = subTotal * ((row.tax_rate ?? 0) / 100);
  return Math.max(0, subTotal + tax);
}

export function emptyPosCartState(): PosCartState {
  return {
    lines: [],
    customer_id: null,
    order_discount: { type: 'fixed', value: 0 },
    coupon: null,
    order_tax_rate: 0,
    shipping_cost: 0,
    sale_note: '',
    draft_sale_id: null,
    draft_reference_no: null
  };
}

function posCartReducer(state: PosCartState, action: PosCartAction): PosCartState {
  switch (action.type) {
    case 'ADD_LINE': {
      const key = lineKey(action.payload);
      const existing = state.lines.find((line) => line.key === key);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((line) =>
            line.key === key ? { ...line, qty: line.qty + (action.payload.qty ?? 1) } : line
          )
        };
      }
      const newLine: PosCartLine = {
        key,
        product_id: action.payload.product_id,
        product_name: action.payload.product_name,
        product_code: action.payload.product_code,
        variant_id: action.payload.variant_id ?? null,
        variant_name: action.payload.variant_name ?? null,
        batch_id: action.payload.batch_id ?? null,
        batch_no: action.payload.batch_no ?? null,
        sale_unit_id: action.payload.sale_unit_id ?? null,
        qty: action.payload.qty ?? 1,
        net_unit_price: action.payload.net_unit_price,
        discount: action.payload.discount ?? 0,
        tax_rate: action.payload.tax_rate ?? 0,
        stock: action.payload.stock
      };
      return { ...state, lines: [...state.lines, newLine] };
    }
    case 'UPDATE_LINE':
      return {
        ...state,
        lines: state.lines.map((line) => (line.key === action.key ? { ...line, ...action.patch } : line))
      };
    case 'REMOVE_LINE':
      return { ...state, lines: state.lines.filter((line) => line.key !== action.key) };
    case 'SET_CUSTOMER':
      return { ...state, customer_id: action.customerId };
    case 'SET_ORDER_DISCOUNT':
      return { ...state, order_discount: action.discount };
    case 'SET_COUPON':
      return { ...state, coupon: action.coupon };
    case 'SET_ORDER_TAX_RATE':
      return { ...state, order_tax_rate: action.rate };
    case 'SET_SHIPPING_COST':
      return { ...state, shipping_cost: action.cost };
    case 'SET_SALE_NOTE':
      return { ...state, sale_note: action.note };
    case 'LOAD_DRAFT': {
      const sale = action.sale;
      return {
        ...emptyPosCartState(),
        customer_id: sale.customer_id,
        order_discount: { type: sale.order_discount_type, value: sale.order_discount_value },
        coupon: sale.coupon_id
          ? { id: sale.coupon_id, code: '', type: 'fixed', amount: sale.coupon_discount }
          : null,
        order_tax_rate: sale.order_tax_rate ?? 0,
        shipping_cost: sale.shipping_cost ?? 0,
        sale_note: sale.sale_note ?? '',
        draft_sale_id: sale.id,
        draft_reference_no: sale.reference_no,
        lines: (sale.items ?? []).map((item) => ({
          key: lineKey(item),
          product_id: item.product_id,
          product_name: item.product_name ?? `#${item.product_id}`,
          variant_id: item.variant_id ?? null,
          batch_id: item.batch_id ?? null,
          sale_unit_id: item.sale_unit_id ?? null,
          qty: item.qty,
          net_unit_price: item.net_unit_price,
          discount: item.discount ?? 0,
          tax_rate: item.tax_rate ?? 0
        }))
      };
    }
    case 'CLEAR':
      return emptyPosCartState();
    default:
      return state;
  }
}

export type PosCartTotals = {
  itemCount: number;
  lineCount: number;
  itemsSubtotal: number;
  lineDiscountTotal: number;
  lineTaxTotal: number;
  /** Sum of every line's `rowTotal` — the base the order-level discount/coupon/tax apply to. */
  itemsTotal: number;
  orderDiscountAmount: number;
  couponDiscountAmount: number;
  orderTaxAmount: number;
  grandTotal: number;
};

export function computePosCartTotals(state: PosCartState): PosCartTotals {
  const itemsSubtotal = state.lines.reduce((sum, line) => sum + line.qty * line.net_unit_price, 0);
  const lineDiscountTotal = state.lines.reduce((sum, line) => sum + (line.discount ?? 0), 0);
  const itemsTotal = state.lines.reduce((sum, line) => sum + rowTotal(line), 0);
  const lineTaxTotal = state.lines.reduce((sum, line) => {
    const subTotal = line.qty * line.net_unit_price - (line.discount ?? 0);
    return sum + Math.max(0, subTotal) * ((line.tax_rate ?? 0) / 100);
  }, 0);

  const orderDiscountAmount =
    state.order_discount.type === 'percentage'
      ? (itemsTotal * state.order_discount.value) / 100
      : state.order_discount.value;

  const couponDiscountAmount = state.coupon
    ? state.coupon.type === 'percentage'
      ? (itemsTotal * state.coupon.amount) / 100
      : state.coupon.amount
    : 0;

  const afterDiscount = Math.max(0, itemsTotal - orderDiscountAmount - couponDiscountAmount);
  const orderTaxAmount = afterDiscount * (state.order_tax_rate / 100);
  const grandTotal = Math.max(0, afterDiscount + orderTaxAmount + state.shipping_cost);

  return {
    itemCount: state.lines.reduce((sum, line) => sum + line.qty, 0),
    lineCount: state.lines.length,
    itemsSubtotal,
    lineDiscountTotal,
    lineTaxTotal,
    itemsTotal,
    orderDiscountAmount,
    couponDiscountAmount,
    orderTaxAmount,
    grandTotal
  };
}

export function usePosCart(initial?: PosCartState) {
  const [state, dispatch] = useReducer(posCartReducer, initial ?? emptyPosCartState());

  const addLine = useCallback((payload: AddCartLineInput) => dispatch({ type: 'ADD_LINE', payload }), []);
  const updateLine = useCallback(
    (key: string, patch: Partial<PosCartLine>) => dispatch({ type: 'UPDATE_LINE', key, patch }),
    []
  );
  const removeLine = useCallback((key: string) => dispatch({ type: 'REMOVE_LINE', key }), []);
  const setCustomer = useCallback(
    (customerId: number | null) => dispatch({ type: 'SET_CUSTOMER', customerId }),
    []
  );
  const setOrderDiscount = useCallback(
    (discount: PosOrderDiscount) => dispatch({ type: 'SET_ORDER_DISCOUNT', discount }),
    []
  );
  const setCoupon = useCallback((coupon: PosCoupon | null) => dispatch({ type: 'SET_COUPON', coupon }), []);
  const setOrderTaxRate = useCallback((rate: number) => dispatch({ type: 'SET_ORDER_TAX_RATE', rate }), []);
  const setShippingCost = useCallback((cost: number) => dispatch({ type: 'SET_SHIPPING_COST', cost }), []);
  const setSaleNote = useCallback((note: string) => dispatch({ type: 'SET_SALE_NOTE', note }), []);
  const loadDraft = useCallback((sale: Sale) => dispatch({ type: 'LOAD_DRAFT', sale }), []);
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const totals = useMemo(() => computePosCartTotals(state), [state]);

  return {
    state,
    totals,
    addLine,
    updateLine,
    removeLine,
    setCustomer,
    setOrderDiscount,
    setCoupon,
    setOrderTaxRate,
    setShippingCost,
    setSaleNote,
    loadDraft,
    clear
  };
}

export type UsePosCartReturn = ReturnType<typeof usePosCart>;
