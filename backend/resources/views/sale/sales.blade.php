@extends('layouts.pdf')

@section('title', 'Sales')

@section('content')
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Reference No</th>
                <th>Customer</th>
                <th>Warehouse</th>
                <th>Sale Status</th>
                <th>Payment Status</th>
                <th>Grand Total</th>
                <th>Paid Amount</th>
                <th>Due Amount</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($sales as $sale)
                <tr>
                    <td>{{ $sale->id }}</td>
                    <td>{{ $sale->reference_no }}</td>
                    <td>{{ $sale->customer?->name ?? 'N/A' }}</td>
                    <td>{{ $sale->warehouse?->name }}</td>
                    <td>{{ $sale->sale_status }}</td>
                    <td>{{ $sale->payment_status }}</td>
                    <td>{{ $sale->grand_total }}</td>
                    <td>{{ $sale->paid_amount }}</td>
                    <td>{{ (float) $sale->grand_total - (float) $sale->paid_amount }}</td>
                    <td>{{ $sale->created_at?->toDateTimeString() }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
