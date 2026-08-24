@extends('layouts.pdf')

@section('title', 'Coupons')

@section('content')
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Name</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Minimum Amount</th>
                <th>Quantity</th>
                <th>Used</th>
                <th>Expired Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($coupons as $coupon)
                <tr>
                    <td>{{ $coupon->id }}</td>
                    <td>{{ $coupon->code }}</td>
                    <td>{{ $coupon->name }}</td>
                    <td>{{ $coupon->type }}</td>
                    <td>{{ $coupon->amount }}</td>
                    <td>{{ $coupon->minimum_amount }}</td>
                    <td>{{ $coupon->quantity }}</td>
                    <td>{{ $coupon->used }}</td>
                    <td>{{ $coupon->expired_date?->toDateString() }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
