@extends('layouts.pdf')

@section('title', 'Taxes')

@section('content')
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Rate</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($taxes as $tax)
                <tr>
                    <td>{{ $tax->id }}</td>
                    <td>{{ $tax->name }}</td>
                    <td>{{ $tax->rate }}</td>
                    <td>{{ $tax->created_at?->toDateTimeString() }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
