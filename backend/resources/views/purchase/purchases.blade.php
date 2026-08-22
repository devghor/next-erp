@extends('layouts.pdf')

@section('title', 'Purchases')

@section('content')
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Reference No</th>
                <th>Supplier</th>
                <th>Warehouse</th>
                <th>Status</th>
                <th>Payment Status</th>
                <th>Grand Total</th>
                <th>Paid Amount</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($purchases as $purchase)
                <tr>
                    <td>{{ $purchase->id }}</td>
                    <td>{{ $purchase->reference_no }}</td>
                    <td>{{ $purchase->supplier?->name ?? 'N/A' }}</td>
                    <td>{{ $purchase->warehouse?->name }}</td>
                    <td>{{ $purchase->status }}</td>
                    <td>{{ $purchase->payment_status }}</td>
                    <td>{{ $purchase->grand_total }}</td>
                    <td>{{ $purchase->paid_amount }}</td>
                    <td>{{ $purchase->created_at?->toDateTimeString() }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
