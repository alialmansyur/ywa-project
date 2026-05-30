# docker/api/Dockerfile
FROM php:8.4-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    tzdata \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    libzip-dev \
    zip \
    unzip \
    oniguruma-dev \
    icu-dev \
    freetype-dev \
    nginx \
    supervisor

# Configure GD
RUN docker-php-ext-configure gd \
    --with-freetype \
    --with-jpeg \
    --with-webp

# Install PHP extensions
RUN docker-php-ext-install \
    pdo_mysql \
    bcmath \
    pcntl \
    gd \
    intl \
    mbstring \
    zip \
    opcache

# Install Redis extension
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

# PHP runtime tuning (dev-focused)
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/99-opcache.ini
COPY docker/php/app.ini /usr/local/etc/php/conf.d/99-app.ini
COPY docker/php-fpm/zz-tapg.conf /usr/local/etc/php-fpm.d/zz-tapg.conf

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files (for production build)
# In development, this is overridden by volume mount
COPY . .

# Dependencies are installed at runtime in the mounted project volume.

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage 2>/dev/null || true \
    && chmod -R 755 /var/www/html/bootstrap/cache 2>/dev/null || true

EXPOSE 9000

CMD ["php-fpm"]
