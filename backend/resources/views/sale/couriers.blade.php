@extends('layouts.pdf')

@section('title', 'Couriers')

@section('content')
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Phone Number</th>
                <th>Active</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($couriers as $courier)
                <tr>
                    <td>{{ $courier->id }}</td>
                    <td>{{ $courier->name }}</td>
                    <td>{{ $courier->type }}</td>
                    <td>{{ $courier->phone_number }}</td>
                    <td>{{ $courier->is_active ? 'Yes' : 'No' }}</td>
                    <td>{{ $courier->created_at?->toDateTimeString() }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
