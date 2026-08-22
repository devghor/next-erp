<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; margin: 0; padding: 0; }
        .label {
            width: {{ $setting->width }}mm;
            height: {{ $setting->height }}mm;
            display: inline-block;
            text-align: center;
            box-sizing: border-box;
            padding: 2mm;
            overflow: hidden;
            page-break-inside: avoid;
        }
        .label img { max-width: 100%; height: auto; }
        .label .business-name { font-size: {{ $print['business_name_size'] ?? 12 }}px; font-weight: bold; }
        .label .brand-name { font-size: {{ $print['brand_name_size'] ?? 10 }}px; }
        .label .name { font-size: {{ $print['name_size'] ?? 12 }}px; margin-top: 2px; }
        .label .price { font-size: {{ $print['price_size'] ?? 12 }}px; font-weight: bold; }
    </style>
</head>
<body>
    @foreach ($labels as $label)
        <div class="label">
            @if ($print['business_name'] ?? true)
                <div class="business-name">{{ $business_name }}</div>
            @endif
            @if (($print['brand_name'] ?? true) && $label['brand_name'])
                <div class="brand-name">{{ $label['brand_name'] }}</div>
            @endif
            <img src="data:image/png;base64,{{ $label['barcode'] }}" alt="{{ $label['code'] }}">
            @if ($print['name'] ?? true)
                <div class="name">{{ $label['name'] }}</div>
            @endif
            <div class="name">{{ $label['code'] }}</div>
            @if ($print['price'] ?? true)
                <div class="price">{{ number_format($label['price'], 2) }}</div>
            @endif
        </div>
    @endforeach
</body>
</html>
