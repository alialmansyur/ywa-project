# TAPG Web Surface

`apps/web` adalah surface khusus untuk dashboard display operasional, bukan admin CRUD umum dan bukan mobile operator workflow.

Kontrak yang sengaja berbeda:

- Auth memakai endpoint dashboard PIN: `/auth/dashboard-token/login`
- Token storage memakai key lokal `tapg-web-token`
- Routing hanya untuk display dashboard: `/` dan `/login`
- Permission check tetap memakai `/auth/me` agar akses display mengikuti role/permission backend

Batasan implementasi:

- Jangan menyamakan login flow web ini dengan login admin tanpa kebutuhan produk yang eksplisit
- Perubahan API helper atau auth di admin/mobile tidak otomatis harus dipindahkan ke web bila tidak menyentuh dashboard display
- Jika menambah fitur baru di `apps/web`, pertahankan pola sebagai display surface yang ringan dan read-mostly
