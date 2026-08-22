@extends('layouts.pdf')

@section('title', 'Currencies')

@section('content')
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Code</th>
                <th>Symbol</th>
                <th>Exchange Rate</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($currencies as $currency)
                <tr>
                    <td>{{ $currency->id }}</td>
                    <td>{{ $currency->name }}</td>
                    <td>{{ $currency->code }}</td>
                    <td>{{ $currency->symbol }}</td>
                    <td>{{ $currency->exchange_rate }}</td>
                    <td>{{ $currency->created_at?->toDateTimeString() }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
