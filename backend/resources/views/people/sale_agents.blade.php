@extends('layouts.pdf')

@section('title', 'Sale Agents')

@section('content')
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Commission Rate</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($saleAgents as $saleAgent)
                <tr>
                    <td>{{ $saleAgent->id }}</td>
                    <td>{{ $saleAgent->name }}</td>
                    <td>{{ $saleAgent->phone }}</td>
                    <td>{{ $saleAgent->email }}</td>
                    <td>{{ $saleAgent->address }}</td>
                    <td>{{ $saleAgent->commission_rate }}</td>
                    <td>{{ $saleAgent->created_at?->toDateTimeString() }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
