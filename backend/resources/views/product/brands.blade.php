@extends('layouts.pdf')

@section('title', 'Brands')

@section('content')
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($brands as $brand)
                <tr>
                    <td>{{ $brand->id }}</td>
                    <td>{{ $brand->name }}</td>
                    <td>{{ $brand->created_at?->toDateTimeString() }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
