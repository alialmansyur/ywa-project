<?php


return [
    /*
     * Judul API yang akan ditampilkan di Scramble UI
     */
    'api_title' => 'TAPG Maintenance API',

    /*
     * Versi API
     */
    'api_version' => '1.0.0',

    /*
     * Deskripsi API
     */
    'info' => [
        'description' => 'API untuk sistem TAPG Maintenance — mengelola aset, P2H, work order, dan inventory alat berat.',
        'contact' => [
            'name'  => 'TAPG Dev Team',
            'email' => 'dev@tapg.local',
        ],
    ],

    /*
     * Path prefix API (tanpa leading slash)
     */
    'api_path' => 'api',

    /*
     * Route prefix untuk docs (akses: /docs/api)
     */
    'ui_route_prefix' => 'docs/api',

    /*
     * OpenAPI document transformers
     */
    'extensions' => [],

    /*
     * Access middleware untuk docs (hanya aktifkan di production)
     */
    'middleware' => [
        'web',
        \App\Http\Middleware\ScrambleDocsBasicAuth::class,
    ],

    /*
     * Server untuk OpenAPI spec
     */
    'servers' => null, // auto-detect dari request

    /*
     * Default tags untuk controller tanpa @tags annotation
     */
    'default_tags_resolver' => \Dedoc\Scramble\Support\TagsResolver::class,

    /*
     * Exclude routes dari docs
     */
    'exclude_routes' => [
        // 'api/v1/internal/*',
    ],

    /*
     * Auth schemes untuk Swagger UI
     */
    'security_schemes' => [
        'bearerAuth' => [
            'type'         => 'http',
            'scheme'       => 'bearer',
            'bearerFormat' => 'Token (Sanctum)',
        ],
    ],
];
