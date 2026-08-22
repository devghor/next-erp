<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; margin: 0; padding: 0; }
        .label {
            width: 33%;
            display: inline-block;
            text-align: center;
            padding: 6px 0;
            box-sizing: border-box;
        }
        .label img { height: 40px; }
        .label .name { font-size: 10px; margin-top: 2px; }
        .label .price { font-size: 11px; font-weight: bold; }
    </style>
</head>
<body>
    @for ($i = 0; $i < $copies; $i++)
        <div class="label">
            <img src="data:image/png;base64,{{ $barcode }}" alt="{{ $product->code }}">
            <div class="name">{{ $product->name }}</div>
            <div class="price">{{ $product->code }} — {{ number_format($product->price, 2) }}</div>
        </div>
    @endfor
</body>
</html>
