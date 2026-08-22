@extends('layouts.pdf')

@section('title', 'Units')

@section('content')
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Name</th>
                <th>Base Unit</th>
                <th>Operator</th>
                <th>Operation Value</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($units as $unit)
                <tr>
                    <td>{{ $unit->id }}</td>
                    <td>{{ $unit->code }}</td>
                    <td>{{ $unit->name }}</td>
                    <td>{{ $unit->baseUnit?->name ?? 'N/A' }}</td>
                    <td>{{ $unit->operator }}</td>
                    <td>{{ $unit->operation_value }}</td>
                    <td>{{ $unit->created_at?->toDateTimeString() }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
