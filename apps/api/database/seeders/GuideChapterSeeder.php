<?php

namespace Database\Seeders;

use App\Models\GuideChapter;
use Illuminate\Database\Seeder;

class GuideChapterSeeder extends Seeder
{
    public function run(): void
    {
        $chapters = [
            [
                'title' => 'BAB 1: Pemeriksaan Pra-Operasi Unit',
                'summary' => 'Checklist wajib sebelum engine start.',
                'body' => "1. Lakukan walk-around inspection 360 derajat.\n2. Pastikan tidak ada kebocoran oli, solar, coolant, atau hydraulic oil.\n3. Cek level oli mesin, coolant radiator, dan bahan bakar sesuai standar pabrikan.\n4. Periksa kondisi ban/track, baut roda, dan selang hidrolik.\n5. Pastikan alat pemadam, seatbelt, lampu, dan klakson berfungsi.\n6. Dokumentasikan temuan awal melalui menu Temuan jika ada anomali.",
                'sort_order' => 1,
            ],
            [
                'title' => 'BAB 2: Prosedur Engine Start dan Warming Up',
                'summary' => 'Langkah aman menyalakan unit.',
                'body' => "1. Nyalakan engine pada idle, tanpa akselerasi mendadak.\n2. Biarkan warming up minimal 5 menit atau sesuai manual unit.\n3. Pantau panel indikator: oil pressure, temperature, battery charge.\n4. Operasikan silinder hidrolik perlahan tanpa beban untuk sirkulasi awal.\n5. Hentikan operasi jika indikator abnormal menyala merah.",
                'sort_order' => 2,
            ],
            [
                'title' => 'BAB 3: Standar Pengisian HM Record',
                'summary' => 'Flow input HM harian di aplikasi mobile.',
                'body' => "1. Pastikan aset sudah di-assign pada menu Aset Unit.\n2. Buka menu HM Record di beranda mobile.\n3. Verifikasi HM awal shift yang muncul otomatis.\n4. Input HM akhir shift berdasarkan odometer aktual unit.\n5. Simpan HM dan pastikan notifikasi sukses muncul.\n6. HM digunakan sistem untuk trigger preventive schedule dan monitoring utilitas.",
                'sort_order' => 3,
            ],
            [
                'title' => 'BAB 4: Standar Pengisian Form P2H',
                'summary' => 'Proses inspeksi P2H sebelum/selesai operasi.',
                'body' => "1. Buka Form P2H dan pastikan unit aktif sesuai assignment.\n2. Isi setiap item checklist dengan status Aman, Catatan, atau Rusak.\n3. Untuk item Rusak, pastikan deskripsi kondisi dicatat jelas.\n4. Submit form setelah seluruh item terisi.\n5. Cek tab Riwayat untuk memastikan data tersimpan.\n6. Gunakan data P2H untuk evaluasi harian compliance.",
                'sort_order' => 4,
            ],
            [
                'title' => 'BAB 5: Registrasi Workshop dan Progress',
                'summary' => 'Flow ketika unit membutuhkan penanganan workshop.',
                'body' => "1. Buat registrasi workshop melalui menu Workshop pada mobile.\n2. Tulis keluhan/gejala unit sejelas mungkin.\n3. Sistem membuat work order breakdown/corrective sesuai flow.\n4. Pantau progres pada halaman detail workshop (timeline proses).\n5. Koordinasikan dengan mechanic dan supervisor jika status on-hold/reject.\n6. Tutup loop dengan verifikasi status completed.",
                'sort_order' => 5,
            ],
            [
                'title' => 'BAB 6: Preventive Maintenance dari Jadwal',
                'summary' => 'Cara membaca due schedule preventive.',
                'body' => "1. Buka menu Preventive untuk melihat jadwal 30 hari ke depan.\n2. Prioritaskan item dengan status due dan overdue.\n3. Cocokkan due dengan HM/KM/date trigger unit.\n4. Buat work order dari jadwal bila diperlukan.\n5. Setelah eksekusi preventive, update status schedule di sistem.",
                'sort_order' => 6,
            ],
            [
                'title' => 'BAB 7: Inventory dan Ketersediaan Spare Part',
                'summary' => 'Validasi stok sebelum pekerjaan dimulai.',
                'body' => "1. Gunakan menu Inventory untuk cek spare part yang dibutuhkan.\n2. Verifikasi code part, nama part, lokasi, dan qty_available.\n3. Jika stok nol, koordinasikan replenishment sebelum pengerjaan kritikal.\n4. Catat penggunaan part di proses work order untuk traceability.",
                'sort_order' => 7,
            ],
            [
                'title' => 'BAB 8: Pelaporan Temuan',
                'summary' => 'Panduan input, update, dan tindak lanjut temuan.',
                'body' => "1. Buka menu Temuan lalu isi bagian aset dan deskripsi detail.\n2. Lampirkan foto bukti kondisi aktual.\n3. Submit temuan dan monitor status pada tab riwayat.\n4. Gunakan edit jika deskripsi perlu perbaikan sebelum ditindaklanjuti.\n5. Hapus data hanya jika laporan benar-benar salah input.\n6. Status resolved menandakan tindak lanjut sudah selesai.",
                'sort_order' => 8,
            ],
            [
                'title' => 'BAB 9: K3 dan Batasan Operasional',
                'summary' => 'Ketentuan keselamatan kerja saat operasi unit.',
                'body' => "1. Wajib APD lengkap: helm, sepatu safety, rompi, sarung tangan.\n2. Dilarang bypass alarm keselamatan unit.\n3. Dilarang menjalankan unit jika rem/steering/hydraulic tidak normal.\n4. Pastikan area kerja steril sebelum manuver atau pengangkatan beban.\n5. Hentikan operasi ketika visibility dan cuaca tidak aman.",
                'sort_order' => 9,
            ],
            [
                'title' => 'BAB 10: Prosedur Darurat dan Eskalasi',
                'summary' => 'Langkah saat kondisi kritis.',
                'body' => "1. Segera hentikan unit di area aman ketika terjadi abnormal kritis.\n2. Matikan engine sesuai prosedur shutdown darurat.\n3. Laporkan ke atasan langsung dan tim workshop melalui aplikasi.\n4. Dokumentasikan kronologi, indikator panel, serta foto kondisi.\n5. Jangan mengoperasikan ulang unit sebelum clearance dari pihak berwenang.",
                'sort_order' => 10,
            ],
        ];

        foreach ($chapters as $chapter) {
            GuideChapter::updateOrCreate(
                ['title' => $chapter['title']],
                [
                    'summary' => $chapter['summary'],
                    'body' => $chapter['body'],
                    'sort_order' => $chapter['sort_order'],
                    'is_active' => true,
                ]
            );
        }
    }
}
