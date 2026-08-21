<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #111; }
        h1 { font-size: 16px; margin-bottom: 4px; }
        p.meta { margin-top: 0; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>@yield('title')</h1>
    <p class="meta">{{ $company->name }} &middot; Generated {{ now()->toDateTimeString() }}</p>
    @yield('content')
</body>
</html>
