FROM php:8.2-fpm-bullseye

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_HOME=/composer

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    git \
    unzip \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    iputils-ping \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libsqlite3-dev \
    && docker-php-ext-configure gd \
    --with-freetype \
    --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
    intl \
    pdo_mysql \
    pdo_sqlite \
    zip \
    bcmath \
    gd \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2.2 /usr/bin/composer /usr/local/bin/composer

WORKDIR /data

COPY infra/php/php.ini /usr/local/etc/php/php.ini

RUN chown -R www-data:www-data /data \
    && chmod -R 775 /data

CMD ["php-fpm"]
