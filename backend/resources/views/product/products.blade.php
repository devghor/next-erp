@extends('layouts.pdf')

@section('title', 'Products')

@section('content')
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Code</th>
                <th>Type</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Unit</th>
                <th>Cost</th>
                <th>Price</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($products as $product)
                <tr>
                    <td>{{ $product->id }}</td>
                    <td>{{ $product->name }}</td>
                    <td>{{ $product->code }}</td>
                    <td>{{ $product->type }}</td>
                    <td>{{ $product->category?->name ?? 'N/A' }}</td>
                    <td>{{ $product->brand?->name ?? 'N/A' }}</td>
                    <td>{{ $product->unit?->name ?? 'N/A' }}</td>
                    <td>{{ $product->cost }}</td>
                    <td>{{ $product->price }}</td>
                    <td>{{ $product->created_at?->toDateTimeString() }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
