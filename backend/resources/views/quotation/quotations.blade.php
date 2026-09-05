@extends('layouts.pdf')

@section('title', 'Quotations')

@section('content')
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Reference No</th>
                <th>Customer</th>
                <th>Warehouse</th>
                <th>Status</th>
                <th>Grand Total</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($quotations as $quotation)
                <tr>
                    <td>{{ $quotation->id }}</td>
                    <td>{{ $quotation->reference_no }}</td>
                    <td>{{ $quotation->customer?->name ?? 'N/A' }}</td>
                    <td>{{ $quotation->warehouse?->name }}</td>
                    <td>{{ $quotation->quotation_status }}</td>
                    <td>{{ $quotation->grand_total }}</td>
                    <td>{{ $quotation->created_at?->toDateTimeString() }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
