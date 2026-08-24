'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/icons';
import { useCompanyStore } from '@/store/company-store';
import { warehousesQueryOptions } from '@/features/settings/warehouses/api/queries';
import { billersQueryOptions } from '@/features/people/billers/api/queries';
import { customersQueryOptions } from '@/features/people/customers/api/queries';
import { currenciesQueryOptions } from '@/features/settings/currencies/api/queries';
import { getProducts } from '@/features/product/products/api/service';
import type { Product } from '@/features/product/products/api/types';
import { createSaleMutation, updateSaleMutation } from '@/features/sales/sales/api/mutations';
import { saleQueryOptions } from '@/features/sales/sales/api/queries';
import type { Sale } from '@/features/sales/sales/api/types';

import { posSettingsQueryOptions, cashRegisterAvailabilityQueryOptions } from '../api/queries';
import { usePosCart } from '../hooks/use-pos-cart';
import { useBarcodeScanner } from '../hooks/use-barcode-scanner';
import { usePosSound } from '../hooks/use-pos-sound';
import { useOfflineQueue } from '../hooks/use-offline-queue';
import type { ReceiptData } from '../lib/receipt-template';

import { PosTopbar } from './pos-topbar';
import { PosProductSearch } from './pos-product-search';
import { PosCategoryFilter } from './pos-category-filter';
import { PosProductGrid } from './pos-product-grid';
import { PosVariantPickerDialog } from './pos-variant-picker-dialog';
import { PosCart } from './pos-cart';
import { PosTotals } from './pos-totals';
import { PosOrderDiscountDialog } from './pos-order-discount-dialog';
import { PosCouponDialog } from './pos-coupon-dialog';
import { PosOrderTaxDialog } from './pos-order-tax-dialog';
import { PosShippingDialog } from './pos-shipping-dialog';
import { PosCustomerQuickAddDialog } from './pos-customer-quick-add-dialog';
import { PosCheckoutDialog } from './pos-checkout-dialog';
import { PosCashRegisterDialog } from './pos-cash-register-dialog';
import { PosHeldSalesDrawer } from './pos-held-sales-drawer';
import { PosReceipt } from './pos-receipt';
import { PosOnscreenKeyboard } from './pos-onscreen-keyboard';

const ALL = 'all';

function buildReceiptDataFromSale(sale: Sale, companyName: string, cashierName: string | undefined, currencyCode: string | undefined): ReceiptData {
  const paid = sale.paid_amount;
  return {
    companyName,
    warehouseName: sale.warehouse_name,
    billerName: sale.biller_name,
    cashierName,
    referenceNo: sale.reference_no,
    date: new Date(sale.created_at).toLocaleString(),
    customerName: sale.customer_name,
    lines: (sale.items ?? []).map((item) => ({
      name: item.product_name ?? `#${item.product_id}`,
      qty: item.qty,
      unitPrice: item.net_unit_price,
      discount: item.discount ?? 0,
      tax: item.tax ?? 0,
      total: item.total ?? item.qty * item.net_unit_price - (item.discount ?? 0) + (item.tax ?? 0)
    })),
    subtotal: sale.total_price,
    discount: sale.total_discount + sale.order_discount + sale.coupon_discount,
    tax: sale.total_tax + sale.order_tax,
    shipping: sale.shipping_cost,
    grandTotal: sale.grand_total,
    paid,
    change: Math.max(0, paid - sale.grand_total),
    due: sale.due_amount,
    payments: (sale.payments ?? []).map((p) => ({ method: p.paying_method, amount: p.amount })),
    currencyCode
  };
}

/**
 * Orchestrator for the whole POS screen: cart state, filter/selector state,
 * every dialog's open/closed state, and the two-pane layout (product search
 * + grid on the left, cart + totals + checkout on the right).
 */
export function PosShell() {
  const { data: session } = useSession();
  const activeCompanyId = useCompanyStore((s) => s.activeCompanyId);

  const { data: posSettings } = useSuspenseQuery(posSettingsQueryOptions());
  const { data: warehousesData } = useSuspenseQuery(warehousesQueryOptions({ per_page: 100 }));
  const { data: billersData } = useSuspenseQuery(billersQueryOptions({ per_page: 100 }));
  const { data: customersData } = useSuspenseQuery(customersQueryOptions({ per_page: 200 }));
  const { data: currenciesData } = useSuspenseQuery(currenciesQueryOptions({ per_page: 100 }));

  const [warehouseId, setWarehouseId] = useState(() =>
    posSettings.warehouse_id ? String(posSettings.warehouse_id) : String(warehousesData.data[0]?.id ?? '')
  );
  const [billerId, setBillerId] = useState(() =>
    posSettings.biller_id ? String(posSettings.biller_id) : (billersData.data[0] ? String(billersData.data[0].id) : '')
  );
  const [customerId, setCustomerId] = useState(() =>
    posSettings.customer_id ? String(posSettings.customer_id) : (customersData.data[0] ? String(customersData.data[0].id) : '')
  );
  const [currencyId, setCurrencyId] = useState(() => (currenciesData.data[0] ? String(currenciesData.data[0].id) : ''));

  const warehouseIdNum = Number(warehouseId) || 0;
  const currencyCode = currenciesData.data.find((c) => String(c.id) === currencyId)?.code;

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryId, setCategoryId] = useState(ALL);
  const [brandId, setBrandId] = useState(ALL);
  const [variantPickerProduct, setVariantPickerProduct] = useState<Product | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);

  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [taxDialogOpen, setTaxDialogOpen] = useState(false);
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cashRegisterDialogOpen, setCashRegisterDialogOpen] = useState(false);
  const [heldSalesOpen, setHeldSalesOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(false);
  const [reprintSaleId, setReprintSaleId] = useState<number | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const cart = usePosCart();
  const { playScan, playSuccess, playError } = usePosSound(posSettings.play_sound);
  const offlineQueue = useOfflineQueue();

  const selectedCustomer = customersData.data.find((c) => String(c.id) === customerId) ?? null;

  const registerQuery = useQuery(cashRegisterAvailabilityQueryOptions(warehouseIdNum));
  const register = registerQuery.data ?? null;

  const autoOpenedRegisterPrompt = useRef(false);
  useEffect(() => {
    if (
      posSettings.cash_register_active &&
      !registerQuery.isLoading &&
      !register &&
      warehouseIdNum > 0 &&
      !autoOpenedRegisterPrompt.current
    ) {
      autoOpenedRegisterPrompt.current = true;
      setCashRegisterDialogOpen(true);
    }
  }, [posSettings.cash_register_active, registerQuery.isLoading, register, warehouseIdNum]);

  const handleSelectProduct = useCallback(
    (product: Product) => {
      if (product.is_variant || product.is_batch || product.is_imei) {
        setVariantPickerProduct(product);
        return;
      }
      cart.addLine({
        product_id: product.id,
        product_name: product.name,
        product_code: product.code,
        sale_unit_id: product.sale_unit_id,
        net_unit_price: product.price,
        tax_rate: 0,
        stock: product.stock
      });
      playScan();
    },
    [cart, playScan]
  );

  const handleSearchSubmit = useCallback(
    async (rawCode: string) => {
      const code = rawCode.trim();
      if (!code) return;
      try {
        const res = await getProducts({
          name: code,
          warehouse_id: warehouseIdNum > 0 ? String(warehouseIdNum) : undefined,
          per_page: 1
        });
        const product = res.data[0];
        if (!product) {
          playError();
          toast.error(`No product found for "${code}"`);
          return;
        }
        handleSelectProduct(product);
        setSearchTerm('');
      } catch {
        playError();
        toast.error('Product lookup failed');
      }
    },
    [warehouseIdNum, handleSelectProduct, playError]
  );

  useBarcodeScanner({
    onScan: handleSearchSubmit,
    ignoreWhenFocusedRef: searchInputRef
  });

  const holdMutation = useMutation({
    ...createSaleMutation,
    onSuccess: () => {
      toast.success('Sale held as draft');
      cart.clear();
    },
    onError: () => toast.error("Couldn't hold the sale. Try again.")
  });
  const updateHoldMutation = useMutation({
    ...updateSaleMutation,
    onSuccess: () => {
      toast.success('Draft updated');
      cart.clear();
    },
    onError: () => toast.error("Couldn't update the draft. Try again.")
  });

  function handleHoldSale() {
    if (!customerId) {
      toast.error('Select a customer before holding the sale');
      return;
    }
    if (cart.state.lines.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    const combinedDiscount = cart.totals.orderDiscountAmount + cart.totals.couponDiscountAmount;
    const payload = {
      customer_id: Number(customerId),
      warehouse_id: warehouseIdNum,
      biller_id: billerId ? Number(billerId) : null,
      currency_id: currencyId ? Number(currencyId) : null,
      sale_status: 'draft' as const,
      order_tax_rate: cart.state.order_tax_rate,
      order_discount_type: 'fixed' as const,
      order_discount_value: combinedDiscount,
      coupon_id: cart.state.coupon?.id ?? null,
      shipping_cost: cart.state.shipping_cost,
      sale_note: cart.state.sale_note || null,
      is_pos: true,
      cash_register_id: register?.id ?? null,
      items: cart.state.lines.map((line) => ({
        product_id: line.product_id,
        variant_id: line.variant_id,
        batch_id: line.batch_id,
        sale_unit_id: line.sale_unit_id,
        qty: line.qty,
        net_unit_price: line.net_unit_price,
        discount: line.discount,
        tax_rate: line.tax_rate
      }))
    };

    if (cart.state.draft_sale_id) {
      updateHoldMutation.mutate({ id: cart.state.draft_sale_id, values: payload });
    } else {
      holdMutation.mutate(payload);
    }
  }

  const invoiceOption: 'thermal' | 'normal' = posSettings.invoice_option === 'thermal' ? 'thermal' : 'normal';
  const cashierName = session?.user?.name ?? undefined;
  const company = session?.user?.companies?.find((c) => c.id === activeCompanyId);
  const companyName = company?.name ?? 'Company';

  function handleCheckoutSuccess(sale: Sale) {
    setCheckoutOpen(false);
    cart.clear();
    playSuccess();
    if (posSettings.show_print_invoice) {
      setReceiptData(buildReceiptDataFromSale(sale, companyName, cashierName, currencyCode));
      setAutoPrintReceipt(true);
      setReceiptOpen(true);
    }
  }

  /** Sale couldn't reach the backend and was queued offline instead (use-offline-queue.ts) — same cart/dialog cleanup as a normal success, minus the receipt since there's no server-confirmed Sale yet. */
  function handleCheckoutQueuedOffline() {
    setCheckoutOpen(false);
    cart.clear();
  }

  const reprintQuery = useQuery({
    ...saleQueryOptions(reprintSaleId ?? 0),
    enabled: reprintSaleId != null
  });

  useEffect(() => {
    if (reprintQuery.data && reprintSaleId != null) {
      setReceiptData(buildReceiptDataFromSale(reprintQuery.data, companyName, cashierName, currencyCode));
      setAutoPrintReceipt(false);
      setReceiptOpen(true);
      setReprintSaleId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reprintQuery.data]);

  const warehouseOptions = useMemo(
    () => warehousesData.data.map((w) => ({ value: String(w.id), label: w.name })),
    [warehousesData.data]
  );
  const billerOptions = useMemo(() => billersData.data.map((b) => ({ value: String(b.id), label: b.name })), [billersData.data]);
  const customerOptions = useMemo(
    () => customersData.data.map((c) => ({ value: String(c.id), label: c.name })),
    [customersData.data]
  );
  const currencyOptions = useMemo(
    () => currenciesData.data.map((c) => ({ value: String(c.id), label: `${c.code}` })),
    [currenciesData.data]
  );

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col'>
      <PosTopbar
        warehouseId={warehouseId}
        onWarehouseChange={setWarehouseId}
        warehouseOptions={warehouseOptions}
        billerId={billerId}
        onBillerChange={setBillerId}
        billerOptions={billerOptions}
        customerId={customerId}
        onCustomerChange={setCustomerId}
        customerOptions={customerOptions}
        onAddCustomer={() => setCustomerDialogOpen(true)}
        currencyId={currencyId}
        onCurrencyChange={setCurrencyId}
        currencyOptions={currencyOptions}
        register={register}
        cashRegisterActive={posSettings.cash_register_active}
        onOpenCashRegister={() => setCashRegisterDialogOpen(true)}
        onOpenHeldSales={() => setHeldSalesOpen(true)}
        keyboardActive={posSettings.keyboard_active}
        showKeyboard={showKeyboard}
        onToggleKeyboard={() => setShowKeyboard((v) => !v)}
        offlineQueueCount={offlineQueue.pendingCount}
      />

      <div className='flex min-h-0 flex-1'>
        <div className='flex min-h-0 flex-1 flex-col border-r'>
          <div className='space-y-2 p-3 pb-0'>
            <PosProductSearch
              ref={searchInputRef}
              value={searchTerm}
              onChange={setSearchTerm}
              onEnter={() => handleSearchSubmit(searchTerm)}
            />
          </div>
          <PosCategoryFilter categoryId={categoryId} onCategoryChange={setCategoryId} brandId={brandId} onBrandChange={setBrandId} />
          <ScrollArea className='min-h-0 flex-1'>
            <PosProductGrid
              search={searchTerm}
              categoryId={categoryId}
              brandId={brandId}
              warehouseId={warehouseIdNum}
              perPage={posSettings.product_number}
              currencyCode={currencyCode}
              onSelectProduct={handleSelectProduct}
            />
          </ScrollArea>
          {posSettings.keyboard_active && showKeyboard && (
            <PosOnscreenKeyboard
              className='m-2'
              onKey={(char) => setSearchTerm((prev) => prev + char)}
              onBackspace={() => setSearchTerm((prev) => prev.slice(0, -1))}
              onEnter={() => handleSearchSubmit(searchTerm)}
              onClose={() => setShowKeyboard(false)}
            />
          )}
        </div>

        <div className='flex w-full max-w-md min-h-0 flex-col'>
          <PosCart
            lines={cart.state.lines}
            currencyCode={currencyCode}
            onUpdateLine={cart.updateLine}
            onRemoveLine={cart.removeLine}
            onClear={cart.clear}
          />
          <PosTotals
            totals={cart.totals}
            orderDiscount={cart.state.order_discount}
            coupon={cart.state.coupon}
            orderTaxRate={cart.state.order_tax_rate}
            shippingCost={cart.state.shipping_cost}
            currencyCode={currencyCode}
            onOpenDiscount={() => setDiscountDialogOpen(true)}
            onOpenCoupon={() => setCouponDialogOpen(true)}
            onOpenTax={() => setTaxDialogOpen(true)}
            onOpenShipping={() => setShippingDialogOpen(true)}
            onRemoveCoupon={() => cart.setCoupon(null)}
          />
          <div className='flex gap-2 border-t p-3'>
            <Button
              type='button'
              variant='outline'
              className='flex-1'
              disabled={cart.state.lines.length === 0}
              onClick={handleHoldSale}
            >
              <Icons.hold className='mr-1.5 h-4 w-4' /> Hold
            </Button>
            <Button
              type='button'
              className='flex-1'
              disabled={cart.state.lines.length === 0 || (posSettings.cash_register_active && !register)}
              onClick={() => setCheckoutOpen(true)}
            >
              <Icons.pos className='mr-1.5 h-4 w-4' /> Checkout
            </Button>
          </div>
        </div>
      </div>

      <PosVariantPickerDialog
        product={variantPickerProduct}
        open={variantPickerProduct != null}
        onOpenChange={(o) => !o && setVariantPickerProduct(null)}
        onConfirm={(input) => {
          cart.addLine(input);
          playScan();
        }}
      />

      <PosOrderDiscountDialog
        open={discountDialogOpen}
        onOpenChange={setDiscountDialogOpen}
        value={cart.state.order_discount}
        onApply={cart.setOrderDiscount}
      />
      <PosCouponDialog
        open={couponDialogOpen}
        onOpenChange={setCouponDialogOpen}
        cartTotal={cart.totals.itemsTotal}
        onApply={cart.setCoupon}
      />
      <PosOrderTaxDialog open={taxDialogOpen} onOpenChange={setTaxDialogOpen} value={cart.state.order_tax_rate} onApply={cart.setOrderTaxRate} />
      <PosShippingDialog
        open={shippingDialogOpen}
        onOpenChange={setShippingDialogOpen}
        value={cart.state.shipping_cost}
        onApply={cart.setShippingCost}
      />
      <PosCustomerQuickAddDialog
        open={customerDialogOpen}
        onOpenChange={setCustomerDialogOpen}
        onCreated={(customer) => {
          setCustomerId(String(customer.id));
        }}
      />

      <PosCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        cart={cart}
        customerId={customerId ? Number(customerId) : null}
        warehouseId={warehouseIdNum}
        billerId={billerId ? Number(billerId) : null}
        currencyId={currencyId ? Number(currencyId) : null}
        currencyCode={currencyCode}
        cashRegisterId={register?.id ?? null}
        posSettings={posSettings}
        customer={selectedCustomer}
        offlineQueue={offlineQueue}
        onSuccess={handleCheckoutSuccess}
        onQueuedOffline={handleCheckoutQueuedOffline}
      />

      <PosCashRegisterDialog
        open={cashRegisterDialogOpen}
        onOpenChange={setCashRegisterDialogOpen}
        warehouseId={warehouseIdNum}
        register={register}
        currencyCode={currencyCode}
        onOpened={() => registerQuery.refetch()}
        onClosed={() => registerQuery.refetch()}
      />

      <PosHeldSalesDrawer
        open={heldSalesOpen}
        onOpenChange={setHeldSalesOpen}
        warehouseId={warehouseIdNum}
        currencyCode={currencyCode}
        onResumeDraft={(sale) => {
          cart.loadDraft(sale);
          setCustomerId(String(sale.customer_id));
          setWarehouseId(String(sale.warehouse_id));
          if (sale.biller_id) setBillerId(String(sale.biller_id));
          if (sale.currency_id) setCurrencyId(String(sale.currency_id));
          setHeldSalesOpen(false);
        }}
        onReprint={(saleId) => {
          setReprintSaleId(saleId);
          setHeldSalesOpen(false);
        }}
      />

      <PosReceipt
        open={receiptOpen}
        onOpenChange={(next) => {
          setReceiptOpen(next);
          if (!next) setAutoPrintReceipt(false);
        }}
        data={receiptData}
        invoiceOption={invoiceOption}
        thermalSize={posSettings.thermal_invoice_size}
        autoPrint={autoPrintReceipt}
      />
    </div>
  );
}
