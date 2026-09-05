<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; font-size: 14px; color: #111; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        p.meta { margin-top: 0; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .totals td { border: none; }
        .totals tr td:first-child { text-align: right; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Quotation {{ $quotation->reference_no }}</h1>
    <p class="meta">
        Customer: {{ $quotation->customer?->name }}<br>
        Warehouse: {{ $quotation->warehouse?->name }}<br>
        Date: {{ $quotation->created_at?->toFormattedDateString() }}
    </p>

    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Tax</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($quotation->items as $item)
                <tr>
                    <td>{{ $item->product?->name }}</td>
                    <td>{{ $item->qty }}</td>
                    <td>{{ $item->net_unit_price }}</td>
                    <td>{{ $item->discount }}</td>
                    <td>{{ $item->tax }}</td>
                    <td>{{ $item->total }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr><td>Total Price:</td><td>{{ $quotation->total_price }}</td></tr>
        <tr><td>Order Tax:</td><td>{{ $quotation->order_tax }}</td></tr>
        <tr><td>Order Discount:</td><td>{{ $quotation->order_discount }}</td></tr>
        <tr><td>Shipping Cost:</td><td>{{ $quotation->shipping_cost }}</td></tr>
        <tr><td>Grand Total:</td><td>{{ $quotation->grand_total }}</td></tr>
    </table>

    @if ($quotation->note)
        <p><strong>Note:</strong> {{ $quotation->note }}</p>
    @endif
</body>
</html>
