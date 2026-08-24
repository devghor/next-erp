@extends('layouts.pdf')

@section('title', 'Billers')

@section('content')
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Company Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>City</th>
                <th>State</th>
                <th>Postal Code</th>
                <th>Country</th>
                <th>VAT Number</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($billers as $biller)
                <tr>
                    <td>{{ $biller->id }}</td>
                    <td>{{ $biller->name }}</td>
                    <td>{{ $biller->company_name }}</td>
                    <td>{{ $biller->phone }}</td>
                    <td>{{ $biller->email }}</td>
                    <td>{{ $biller->address }}</td>
                    <td>{{ $biller->city }}</td>
                    <td>{{ $biller->state }}</td>
                    <td>{{ $biller->postal_code }}</td>
                    <td>{{ $biller->country }}</td>
                    <td>{{ $biller->vat_number }}</td>
                    <td>{{ $biller->created_at?->toDateTimeString() }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
