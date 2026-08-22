'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LoadingButton } from '@/components/ui/loading-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Can } from '@/components/can';
import { barcodeSettingsQueryOptions } from '@/features/product/barcode-settings/api/queries';
import type { Product } from '@/features/product/products/api/types';
import { printBarcodes } from '../api/service';
import type { PrintBarcodeProductRow, PrintOptions } from '../api/types';
import { ProductPicker } from './product-picker';
import { SelectedProductsTable } from './selected-products-table';
import { LabelOptionsPanel } from './label-options-panel';

const DEFAULT_PRINT: PrintOptions = {
  name: true,
  name_size: 15,
  price: true,
  price_size: 15,
  business_name: true,
  business_name_size: 15,
  brand_name: true,
  brand_name_size: 15
};

function openPdfBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function PrintBarcodesView() {
  const [rows, setRows] = useState<PrintBarcodeProductRow[]>([]);
  const [barcodeSettingId, setBarcodeSettingId] = useState('');
  const [print, setPrint] = useState<PrintOptions>(DEFAULT_PRINT);

  const { data: settingsData } = useQuery(barcodeSettingsQueryOptions({ per_page: 100 }));

  useEffect(() => {
    if (barcodeSettingId || !settingsData?.data.length) return;
    const defaultSetting = settingsData.data.find((s) => s.is_default) ?? settingsData.data[0];
    setBarcodeSettingId(String(defaultSetting.id));
  }, [settingsData, barcodeSettingId]);

  const printMutation = useMutation({
    mutationFn: printBarcodes,
    onSuccess: (blob) => openPdfBlob(blob),
    onError: () => toast.error('Failed to generate barcode labels')
  });

  const addProduct = (product: Product) => {
    setRows((prev) => {
      if (prev.some((row) => row.product_id === product.id)) {
        toast.error('Product already added');
        return prev;
      }
      return [
        ...prev,
        {
          product_id: product.id,
          code: product.code,
          name: product.name,
          price: product.price,
          brand_name: product.brand_name ?? null,
          qty: 1
        }
      ];
    });
  };

  const handleSubmit = () => {
    if (!barcodeSettingId) {
      toast.error('Select a label template');
      return;
    }
    if (rows.length === 0) {
      toast.error('Add at least one product');
      return;
    }

    printMutation.mutate({
      barcode_setting_id: Number(barcodeSettingId),
      products: rows.map((row) => ({ product_id: row.product_id, qty: row.qty })),
      print
    });
  };

  return (
    <div className='grid gap-6 lg:grid-cols-3'>
      <div className='space-y-4 lg:col-span-2'>
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <ProductPicker onSelect={addProduct} />
            <SelectedProductsTable rows={rows} onChange={setRows} />
          </CardContent>
        </Card>
      </div>

      <div className='space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle>Label Options</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <LabelOptionsPanel
              barcodeSettingId={barcodeSettingId}
              onBarcodeSettingChange={setBarcodeSettingId}
              print={print}
              onPrintChange={setPrint}
            />
            <Can permission='READ_PRODUCT_PRODUCTS'>
              <LoadingButton
                className='w-full'
                loading={printMutation.isPending}
                onClick={handleSubmit}
              >
                Preview &amp; Print
              </LoadingButton>
            </Can>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
