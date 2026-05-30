<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'code' => 'AUTH_OTP',
                'name' => 'Email OTP Authentication',
                'subject' => 'Kode OTP Anda - TAPG Maintenance',
                'body_html' => '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;"><div style="background-color: #1e293b; padding: 20px; text-align: center;"><h2 style="color: #ffffff; margin: 0;">TAPG Maintenance</h2></div><div style="padding: 30px;"><p style="font-size: 16px; color: #334155;">Halo <strong>{{ name }}</strong>,</p><p style="font-size: 16px; color: #334155;">Gunakan kode OTP berikut untuk melanjutkan proses login Anda. Kode ini hanya berlaku selama 5 menit.</p><div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;"><span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">{{ otp }}</span></div><p style="font-size: 14px; color: #64748b;">Jika Anda tidak merasa meminta kode ini, mohon abaikan email ini dan pastikan akun Anda aman.</p></div><div style="background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;"><p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; 2026 TAPG Workshop Tracking System. All rights reserved.</p></div></div>',
                'variables' => json_encode(['name', 'otp']),
            ],
            [
                'code' => 'AUTH_RESET_PASSWORD',
                'name' => 'Reset Password',
                'subject' => 'Permintaan Reset Password - TAPG Maintenance',
                'body_html' => '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;"><div style="background-color: #1e293b; padding: 20px; text-align: center;"><h2 style="color: #ffffff; margin: 0;">TAPG Maintenance</h2></div><div style="padding: 30px;"><p style="font-size: 16px; color: #334155;">Halo <strong>{{ name }}</strong>,</p><p style="font-size: 16px; color: #334155;">Kami menerima permintaan untuk mereset kata sandi akun Anda. Silakan klik tombol di bawah ini untuk membuat kata sandi baru:</p><div style="text-align: center; margin: 30px 0;"><a href="{{ reset_url }}" style="background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Reset Password</a></div><p style="font-size: 14px; color: #64748b;">Atau salin tautan berikut ke browser Anda:<br><a href="{{ reset_url }}" style="color: #3b82f6; word-break: break-all;">{{ reset_url }}</a></p><p style="font-size: 14px; color: #64748b; margin-top: 20px;">Tautan ini hanya berlaku selama 60 menit. Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.</p></div><div style="background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;"><p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; 2026 TAPG Workshop Tracking System. All rights reserved.</p></div></div>',
                'variables' => json_encode(['name', 'reset_url']),
            ],
            [
                'code' => 'AUTH_ACTIVATION',
                'name' => 'Aktivasi Akun Baru',
                'subject' => 'Selamat Datang di TAPG Maintenance',
                'body_html' => '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;"><div style="background-color: #1e293b; padding: 20px; text-align: center;"><h2 style="color: #ffffff; margin: 0;">TAPG Maintenance</h2></div><div style="padding: 30px;"><p style="font-size: 16px; color: #334155;">Halo <strong>{{ name }}</strong>,</p><p style="font-size: 16px; color: #334155;">Akun Anda telah berhasil didaftarkan di TAPG Workshop Tracking System oleh Administrator. Berikut adalah kredensial login Anda:</p><div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;"><p style="margin: 5px 0;"><strong>Username / Email:</strong> {{ email }}</p><p style="margin: 5px 0;"><strong>Password Sementara:</strong> {{ password }}</p></div><div style="text-align: center; margin: 30px 0;"><a href="{{ login_url }}" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Login Sekarang</a></div><p style="font-size: 14px; color: #ef4444; font-weight: bold;">Mohon segera ganti password sementara Anda setelah berhasil login demi keamanan akun Anda.</p></div><div style="background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;"><p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; 2026 TAPG Workshop Tracking System. All rights reserved.</p></div></div>',
                'variables' => json_encode(['name', 'email', 'password', 'login_url']),
            ]
        ];

        foreach ($templates as $template) {
            DB::table('email_templates')->updateOrInsert(
                ['code' => $template['code']],
                $template
            );
        }
    }
}
