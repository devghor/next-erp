FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
        postgresql-dev \
        libzip-dev \
        oniguruma-dev \
        icu-dev \
        freetype-dev \
        libjpeg-turbo-dev \
        libpng-dev \
        $PHPIZE_DEPS \
    && docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        pgsql \
        zip \
        mbstring \
        intl \
        bcmath \
        opcache \
        gd \
    && apk del $PHPIZE_DEPS

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install \
        --no-interaction \
        --prefer-dist \
        --optimize-autoloader \
        --no-progress

RUN chown -R www-data:www-data \
        /var/www/html/storage \
        /var/www/html/bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]
