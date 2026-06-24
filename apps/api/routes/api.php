<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Asset\AssetController;
use App\Http\Controllers\Api\V1\Asset\AssetDetailController;
use App\Http\Controllers\Api\V1\Asset\AssetAssignmentController;
use App\Http\Controllers\Api\V1\Asset\GuideController;
use App\Http\Controllers\Api\V1\P2H\P2HController;
use App\Http\Controllers\Api\V1\WorkOrder\WorkOrderController;
use App\Http\Controllers\Api\V1\WorkOrder\WorkOrderProcessController;
use App\Http\Controllers\Api\V1\WorkOrder\WorkshopControlTowerController;
use App\Http\Controllers\Api\V1\Inventory\InventoryController;
use App\Http\Controllers\Api\V1\Schedule\ScheduleController;
use App\Http\Controllers\Api\V1\Notification\NotificationController;
use App\Http\Controllers\Api\V1\Report\ReportController;
use App\Http\Controllers\Api\V1\Dashboard\DashboardController;
use App\Http\Controllers\Api\V1\User\UserController;
use App\Http\Controllers\Api\V1\Settings\RoleManagerController;
use App\Http\Controllers\Api\V1\Settings\MenuAccessController;
use App\Http\Controllers\Api\V1\Settings\SmtpConfigurationController;
use App\Http\Controllers\Api\V1\Settings\SystemSettingController;
use App\Http\Controllers\Api\V1\Settings\ApprovalController;
use App\Http\Controllers\Api\V1\Settings\NotificationTestController;
use App\Http\Controllers\Api\V1\Settings\DatabaseBackupController;
use App\Http\Controllers\Api\V1\Settings\DashboardAccessTokenController;
use App\Http\Controllers\Api\V1\Settings\DashboardSettingController;
use App\Http\Controllers\Api\V1\Finding\FindingController;
use App\Http\Controllers\Api\V1\BreakdownReport\BreakdownReportController;

/*
|--------------------------------------------------------------------------
| TAPG Maintenance API Routes — Version 1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ─── AUTH (Public) ───────────────────────────────────────────────────────
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('login', [AuthController::class, 'login'])->name('login')
            ->middleware('throttle:5,1'); // 5 req/menit untuk login
        Route::post('dashboard-token/login', [AuthController::class, 'dashboardTokenLogin'])->name('dashboard-token.login')
            ->middleware('throttle:10,1');

        Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->name('forgot-password');
        Route::post('reset-password', [AuthController::class, 'resetPassword'])->name('reset-password');
    });

    // ─── AUTHENTICATED ROUTES ────────────────────────────────────────────────
    Route::middleware(['require.bearer', 'auth:sanctum', 'throttle:api-authenticated'])->group(function () {

        // Auth
        Route::prefix('auth')->name('auth.')->group(function () {
            Route::post('logout', [AuthController::class, 'logout'])->name('logout');
            Route::get('me', [AuthController::class, 'me'])->name('me');
            Route::put('profile', [AuthController::class, 'updateProfile'])->name('profile');
            Route::post('change-password', [AuthController::class, 'changePassword'])->name('change-password');
            Route::put('fcm-token', [AuthController::class, 'updateFcmToken'])->name('fcm-token');
            Route::post('email-otp/request', [AuthController::class, 'requestEmailOtp'])->name('email-otp.request');
            Route::post('email-otp/verify', [AuthController::class, 'verifyEmailOtp'])->name('email-otp.verify');
        });

        // ── Assets ──────────────────────────────────────────────────────────
        Route::prefix('assets')->name('assets.')->group(function () {
            Route::get('assignment/current', [AssetAssignmentController::class, 'current'])->name('assignment.current');
            Route::post('assignment', [AssetAssignmentController::class, 'assign'])->name('assignment.assign');
            Route::delete('assignment', [AssetAssignmentController::class, 'unassign'])->name('assignment.unassign');

            Route::get('categories', [AssetController::class, 'categories'])->name('categories');
            Route::post('categories', [AssetController::class, 'storeCategory'])->name('categories.store')->middleware('permission:manage master data');
            Route::put('categories/{category}', [AssetController::class, 'updateCategory'])->name('categories.update')->middleware('permission:manage master data');
            Route::delete('categories/{category}', [AssetController::class, 'destroyCategory'])->name('categories.destroy')->middleware('permission:manage master data');
            Route::get('/', [AssetController::class, 'index'])->name('index');
            Route::post('/', [AssetController::class, 'store'])->name('store');
            Route::post('import', [AssetController::class, 'import'])->name('import')
                ->middleware('throttle:10,1'); // 10 upload/menit
            Route::get('export', [AssetController::class, 'export'])->name('export');
            Route::get('scan/{qr_code}', [AssetController::class, 'scanQr'])->name('scan');
            Route::prefix('detail/{assetRef}')->name('detail.')->group(function () {
                Route::get('/', [AssetDetailController::class, 'show'])->name('show');
                Route::put('/', [AssetDetailController::class, 'updateAsset'])->name('update');
                Route::get('photos', [AssetDetailController::class, 'photos'])->name('photos');
                Route::post('photos', [AssetDetailController::class, 'uploadPhoto'])->name('photos.upload');
                Route::delete('photos/{photoId}', [AssetDetailController::class, 'deletePhoto'])->name('photos.delete');
                Route::get('documents', [AssetDetailController::class, 'documents'])->name('documents');
                Route::post('documents', [AssetDetailController::class, 'uploadDocument'])->name('documents.upload');
                Route::delete('documents/{documentId}', [AssetDetailController::class, 'deleteDocument'])->name('documents.delete');
                Route::get('preventive', [AssetDetailController::class, 'preventive'])->name('preventive');
                Route::put('preventive', [AssetDetailController::class, 'updatePreventive'])->name('preventive.update');
                Route::get('schedules', [AssetDetailController::class, 'schedules'])->name('schedules');
                Route::post('schedules', [AssetDetailController::class, 'storeSchedule'])->name('schedules.store');
                Route::put('schedules/{scheduleId}', [AssetDetailController::class, 'updateSchedule'])->name('schedules.update');
                Route::delete('schedules/{scheduleId}', [AssetDetailController::class, 'cancelSchedule'])->name('schedules.cancel');
                Route::get('workshop-history', [AssetDetailController::class, 'workshopHistory'])->name('workshop-history');
                Route::post('workshop-history', [AssetDetailController::class, 'storeWorkshopHistory'])->name('workshop-history.store');
                Route::get('kpis', [AssetDetailController::class, 'kpis'])->name('kpis');
            });

            Route::prefix('{asset}')->group(function () {
                Route::get('/', [AssetController::class, 'show'])->name('show');
                Route::put('/', [AssetController::class, 'update'])->name('update');
                Route::delete('/', [AssetController::class, 'destroy'])->name('destroy');
                Route::post('location', [AssetController::class, 'updateLocation'])->name('location');
                Route::post('hm', [AssetController::class, 'updateHm'])->name('hm');
                Route::get('history', [AssetController::class, 'history'])->name('history');
                Route::get('schedule', [AssetController::class, 'schedule'])->name('schedule');
            });
        });

        // ── P2H ─────────────────────────────────────────────────────────────
        Route::prefix('p2h')->name('p2h.')->group(function () {
            Route::get('checklists', [P2HController::class, 'checklists'])->name('checklists')->middleware('permission:view p2h');
            Route::post('checklists', [P2HController::class, 'storeChecklist'])->name('checklists.store')->middleware('permission:create p2h');
            Route::put('checklists/{template}', [P2HController::class, 'updateChecklist'])->name('checklists.update')->middleware('permission:review p2h');
            Route::delete('checklists/{template}', [P2HController::class, 'destroyChecklist'])->name('checklists.destroy')->middleware('permission:review p2h');

            Route::get('compliance', [P2HController::class, 'compliance'])->name('compliance');
            Route::get('template/{asset}', [P2HController::class, 'template'])->name('template');
            Route::get('/', [P2HController::class, 'index'])->name('index');
            Route::post('/', [P2HController::class, 'store'])->name('store');
            Route::get('{p2h}', [P2HController::class, 'show'])->name('show');
            Route::patch('{p2h}/review', [P2HController::class, 'review'])->name('review');
            Route::post('{p2h}/sync', [P2HController::class, 'sync'])->name('sync');
        });

        // ── Work Orders ──────────────────────────────────────────────────────
        Route::prefix('work-orders')->name('work-orders.')->group(function () {
            Route::get('/', [WorkOrderController::class, 'index'])->name('index')->middleware('permission:view work-orders');
            Route::post('/', [WorkOrderController::class, 'store'])->name('store')->middleware('permission:create work-orders');
            Route::post('register', [WorkOrderController::class, 'register'])->name('register'); // Open for drivers with auth
            Route::post('{workOrder}/triage', [WorkOrderController::class, 'triage'])->name('triage')->middleware('permission:approve work-orders|execute work-orders');
            Route::get('{workOrder}', [WorkOrderController::class, 'show'])->name('show')->middleware('permission:view work-orders');
            Route::put('{workOrder}', [WorkOrderController::class, 'update'])->name('update')->middleware('permission:edit work-orders');
            Route::patch('{workOrder}/status', [WorkOrderController::class, 'updateStatus'])->name('status')->middleware('permission:edit work-orders');
            Route::post('{workOrder}/assign', [WorkOrderController::class, 'assign'])->name('assign')->middleware('permission:assign work-orders');
            Route::post('{workOrder}/approve', [WorkOrderController::class, 'approve'])->name('approve')->middleware('permission:approve work-orders');
            Route::post('{workOrder}/jobcard/generate', [WorkOrderController::class, 'generateJobcard'])->name('jobcard.generate')->middleware('permission:execute work-orders');
            Route::post('{workOrder}/jobcard/print', [WorkOrderController::class, 'printJobcard'])->name('jobcard.print')->middleware('permission:execute work-orders');
            Route::post('{workOrder}/jobcard/acknowledge', [WorkOrderController::class, 'acknowledgeJobcard'])->name('jobcard.acknowledge')->middleware('permission:execute work-orders');
            Route::post('{workOrder}/checklist/{itemId}', [WorkOrderController::class, 'toggleChecklist'])->name('checklist')->middleware('permission:execute work-orders');
            Route::post('{workOrder}/attachment', [WorkOrderController::class, 'addAttachment'])->name('attachment')
                ->middleware(['permission:execute work-orders', 'throttle:10,1']);
            Route::post('{workOrder}/comment', [WorkOrderController::class, 'addComment'])->name('comment')->middleware('permission:view work-orders');
            Route::get('{workOrder}/pdf', [WorkOrderController::class, 'exportPdf'])->name('pdf')->middleware('permission:view work-orders');

            // Process tracking (API-centric for admin + mobile)
            Route::get('{workOrder}/process', [WorkOrderProcessController::class, 'process'])->name('process.show')->middleware('permission:view work-orders');
            Route::get('{workOrder}/timeline', [WorkOrderProcessController::class, 'timeline'])->name('process.timeline')->middleware('permission:view work-orders');
            Route::get('{workOrder}/metrics', [WorkOrderProcessController::class, 'metrics'])->name('process.metrics')->middleware('permission:view work-orders');
            Route::post('{workOrder}/process/start', [WorkOrderProcessController::class, 'start'])->name('process.start')->middleware('permission:execute work-orders');
            Route::post('{workOrder}/process/steps/{stepOrder}/in', [WorkOrderProcessController::class, 'stepIn'])->name('process.step.in')->middleware('permission:execute work-orders');
            Route::post('{workOrder}/process/steps/{stepOrder}/out', [WorkOrderProcessController::class, 'stepOut'])->name('process.step.out')->middleware('permission:execute work-orders');
            Route::post('{workOrder}/process/steps/{stepOrder}/approve', [WorkOrderProcessController::class, 'approve'])->name('process.step.approve')->middleware('permission:approve work-orders');
            Route::post('{workOrder}/process/steps/{stepOrder}/reject', [WorkOrderProcessController::class, 'reject'])->name('process.step.reject')->middleware('permission:approve work-orders');
            Route::post('{workOrder}/process/steps/{stepOrder}/hold', [WorkOrderProcessController::class, 'hold'])->name('process.step.hold')->middleware('permission:execute work-orders');
            Route::post('{workOrder}/process/steps/{stepOrder}/resume', [WorkOrderProcessController::class, 'resume'])->name('process.step.resume')->middleware('permission:execute work-orders');
            Route::post('{workOrder}/process/complete', [WorkOrderProcessController::class, 'complete'])->name('process.complete')->middleware('permission:execute work-orders');
            Route::get('{workOrder}/abnormalities', [WorkOrderProcessController::class, 'abnormalities'])->name('process.abnormalities')->middleware('permission:view work-orders');
            Route::post('{workOrder}/abnormalities', [WorkOrderProcessController::class, 'reportAbnormality'])->name('process.abnormalities.report')->middleware('permission:execute work-orders');
            Route::post('{workOrder}/abnormalities/{abnormalityId}/resolve', [WorkOrderProcessController::class, 'resolveAbnormality'])->name('process.abnormalities.resolve')->middleware('permission:approve work-orders');
        });

        Route::prefix('work-order-process')->name('work-order-process.')->group(function () {
            Route::get('templates', [WorkOrderProcessController::class, 'templates'])->name('templates')->middleware('permission:view work-orders');
        });


        Route::prefix('workshop-control-tower')->name('workshop-control-tower.')->middleware('permission:view work-orders')->group(function () {
            Route::get('overview', [WorkshopControlTowerController::class, 'overview'])->name('overview');
            Route::get('queues', [WorkshopControlTowerController::class, 'queues'])->name('queues');
            Route::get('step-queues', [WorkshopControlTowerController::class, 'stepQueues'])->name('step-queues');
            Route::get('live-feed', [WorkshopControlTowerController::class, 'liveFeed'])->name('live-feed');
            Route::get('bottlenecks', [WorkshopControlTowerController::class, 'bottlenecks'])->name('bottlenecks');
            Route::get('work-orders', [WorkshopControlTowerController::class, 'workOrders'])->name('work-orders');
            Route::get('approval-queue', [WorkshopControlTowerController::class, 'approvalQueue'])->name('approval-queue');
        });

        // Breakdown report
        Route::post('breakdown', [WorkOrderController::class, 'breakdown'])->name('breakdown')->middleware(['permission:create work-orders', 'approval.template:mobile.workshop.register']);
        Route::prefix('breakdown-reports')->name('breakdown-reports.')->group(function () {
            Route::get('/', [BreakdownReportController::class, 'index'])->name('index');
            Route::post('/', [BreakdownReportController::class, 'store'])->name('store')->middleware('approval.template:mobile.breakdown-reports.create');
            Route::get('{breakdownReport}', [BreakdownReportController::class, 'show'])->name('show');
            Route::put('{breakdownReport}', [BreakdownReportController::class, 'update'])->name('update');
            Route::delete('{breakdownReport}', [BreakdownReportController::class, 'destroy'])->name('destroy');
            Route::post('{breakdownReport}/process', [BreakdownReportController::class, 'process'])->name('process')->middleware('permission:create work-orders');
        });

        // ── Schedules ────────────────────────────────────────────────────────
        Route::prefix('schedules')->name('schedules.')->group(function () {
            Route::get('/', [ScheduleController::class, 'index'])->name('index');
            Route::get('upcoming', [ScheduleController::class, 'upcoming'])->name('upcoming');
            Route::get('calendar', [ScheduleController::class, 'calendar'])->name('calendar');
            Route::post('/', [ScheduleController::class, 'store'])->name('store');
            Route::put('{schedule}', [ScheduleController::class, 'update'])->name('update');
            Route::delete('{schedule}', [ScheduleController::class, 'destroy'])->name('destroy');
            Route::post('{schedule}/create-work-order', [ScheduleController::class, 'createWorkOrder'])->name('create-work-order')->middleware('approval.template:admin.schedule.create-work-order');
        });

        Route::get('guides', [GuideController::class, 'index'])->name('guides.index');
        Route::prefix('guides/chapters')->name('guides.chapters.')->group(function () {
            Route::get('/', [GuideController::class, 'chapters'])->name('index')->middleware('permission:manage system settings');
            Route::post('/', [GuideController::class, 'storeChapter'])->name('store')->middleware('permission:manage system settings');
            Route::get('{chapter}', [GuideController::class, 'showChapter'])->name('show')->middleware('permission:manage system settings');
            Route::put('{chapter}', [GuideController::class, 'updateChapter'])->name('update')->middleware('permission:manage system settings');
            Route::delete('{chapter}', [GuideController::class, 'destroyChapter'])->name('destroy')->middleware('permission:manage system settings');
        });

        // ── Inventory ────────────────────────────────────────────────────────
        Route::prefix('spare-parts')->name('spare-parts.')->group(function () {
            Route::get('/', [InventoryController::class, 'indexParts'])->name('index');
            Route::post('/', [InventoryController::class, 'storePart'])->name('store');
            Route::get('{part}', [InventoryController::class, 'showPart'])->name('show');
            Route::put('{part}', [InventoryController::class, 'updatePart'])->name('update');
            Route::patch('{part}/toggle-active', [InventoryController::class, 'togglePartActive'])->name('toggle-active');
            Route::delete('{part}', [InventoryController::class, 'destroyPart'])->name('destroy');
        });

        Route::prefix('inventory')->name('inventory.')->group(function () {
            Route::get('/', [InventoryController::class, 'indexInventory'])->name('index');
            Route::get('transactions', [InventoryController::class, 'indexTransactions'])->name('transactions.index');
            Route::post('transactions', [InventoryController::class, 'storeTransaction'])->name('transactions');
        });

        Route::prefix('findings')->name('findings.')->group(function () {
            Route::get('/', [FindingController::class, 'index'])->name('index');
            Route::post('/', [FindingController::class, 'store'])->name('store')->middleware(['throttle:15,1', 'approval.template:mobile.findings.create']);
            Route::get('{finding}', [FindingController::class, 'show'])->name('show');
            Route::post('{finding}', [FindingController::class, 'update'])->name('update')->middleware('throttle:15,1');
            Route::put('{finding}', [FindingController::class, 'update'])->name('update.put')->middleware('throttle:15,1');
            Route::patch('{finding}', [FindingController::class, 'update'])->name('update.patch')->middleware('throttle:15,1');
            Route::delete('{finding}', [FindingController::class, 'destroy'])->name('destroy');
        });

        // ── Notifications ────────────────────────────────────────────────────
        Route::prefix('notifications')->name('notifications.')->group(function () {
            Route::get('/', [NotificationController::class, 'index'])->name('index');
            Route::patch('{notification}/read', [NotificationController::class, 'markRead'])->name('read');
            Route::patch('read-all', [NotificationController::class, 'markAllRead'])->name('read-all');
            Route::delete('{notification}', [NotificationController::class, 'destroy'])->name('destroy');
        });

        // ── Reports ──────────────────────────────────────────────────────────
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('data', [ReportController::class, 'data'])->name('data');
            // Route::post('p2h', [ReportController::class, 'p2hReport'])->name('p2h');
            // Route::post('work-orders', [ReportController::class, 'workOrderReport'])->name('work-orders');
            // Route::post('breakdown', [ReportController::class, 'breakdownReport'])->name('breakdown');
            // Route::post('cost', [ReportController::class, 'costReport'])->name('cost');
            // Route::post('asset-utilization', [ReportController::class, 'assetUtilizationReport'])->name('asset-utilization');
        });

        // ── Dashboard ────────────────────────────────────────────────────────
        Route::prefix('dashboard')->name('dashboard.')->group(function () {
            Route::get('overview', [DashboardController::class, 'overview'])->name('overview');
            Route::get('workshop-operational-summary', [DashboardController::class, 'workshopOperationalSummary'])->name('workshop-operational-summary');
            Route::get('work-order-status', [DashboardController::class, 'workOrderStatus'])->name('work-order-status');
            Route::get('workshop-kpi-details', [DashboardController::class, 'workshopKpiDetails'])->name('workshop-kpi-details');
            Route::get('p2h-compliance-trend', [DashboardController::class, 'p2hComplianceTrend'])->name('p2h-compliance-trend');
            Route::get('upcoming-schedules', [DashboardController::class, 'upcomingSchedules'])->name('upcoming-schedules');
            Route::get('asset-status', [DashboardController::class, 'assetStatus'])->name('asset-status');
            Route::get('recent-activities', [DashboardController::class, 'recentActivities'])->name('recent-activities');
            Route::get('work-order-priority', [DashboardController::class, 'workOrderPriority'])->name('work-order-priority');
            Route::get('downtime-trend', [DashboardController::class, 'downtimeTrend'])->name('downtime-trend');
            Route::get('analyst-summary', [DashboardController::class, 'analystSummary'])->name('analyst-summary');
        });

        Route::prefix('approvals')->name('approvals.')->group(function () {
            Route::get('inbox', [ApprovalController::class, 'inbox'])->name('inbox');
            Route::post('requests/{requestId}/decide', [ApprovalController::class, 'decide'])->name('requests.decide');
        });

        // ── Settings ─────────────────────────────────────────────────────────
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('permissions', [RoleManagerController::class, 'permissions'])->name('permissions')->middleware('permission:manage settings|manage settings role-manager');
            Route::get('roles', [RoleManagerController::class, 'roles'])->name('roles')->middleware('permission:manage settings|manage settings role-manager');
            Route::put('roles/{role}', [RoleManagerController::class, 'updateRole'])->name('roles.update')->middleware('permission:manage settings|manage settings role-manager');
            Route::get('permission-matrix', [RoleManagerController::class, 'permissionMatrix'])->name('permission-matrix')->middleware('permission:manage settings|manage settings role-manager');
            Route::get('menu-access', [MenuAccessController::class, 'index'])->name('menu-access');
            Route::get('users/{user}/access', [RoleManagerController::class, 'userAccess'])->name('users.access')->middleware('permission:manage settings');
            Route::put('users/{user}/access-mode', [RoleManagerController::class, 'updateUserAccessMode'])->name('users.access-mode')->middleware('permission:manage settings');
            Route::put('users/{user}/permissions', [RoleManagerController::class, 'updateUserPermissions'])->name('users.permissions')->middleware('permission:manage settings');

            Route::get('smtp', [SmtpConfigurationController::class, 'index'])->name('smtp.index')->middleware('permission:manage smtp');
            Route::post('smtp', [SmtpConfigurationController::class, 'store'])->name('smtp.store')->middleware('permission:manage smtp');
            Route::get('smtp/{id}', [SmtpConfigurationController::class, 'show'])->name('smtp.show')->middleware('permission:manage smtp');
            Route::put('smtp/{id}', [SmtpConfigurationController::class, 'update'])->name('smtp.update')->middleware('permission:manage smtp');
            Route::post('smtp/{id}/test-email', [SmtpConfigurationController::class, 'testEmail'])->name('smtp.test-email')->middleware('permission:manage smtp');

            Route::get('system', [SystemSettingController::class, 'index'])->name('system.index')->middleware('permission:manage system settings');
            Route::post('system', [SystemSettingController::class, 'store'])->name('system.store')->middleware('permission:manage system settings');
            Route::get('system/{id}', [SystemSettingController::class, 'show'])->name('system.show')->middleware('permission:manage system settings');
            Route::put('system/{id}', [SystemSettingController::class, 'update'])->name('system.update')->middleware('permission:manage system settings');
            Route::post('system/{id}/upload', [SystemSettingController::class, 'upload'])->name('system.upload')->middleware('permission:manage system settings');
            Route::delete('system/{id}', [SystemSettingController::class, 'destroy'])->name('system.destroy')->middleware('permission:manage system settings');

            Route::get('approvals/templates', [ApprovalController::class, 'templates'])->name('approvals.templates')->middleware('permission:manage settings');
            Route::post('approvals/templates', [ApprovalController::class, 'upsertTemplate'])->name('approvals.templates.store')->middleware('permission:manage settings');
            Route::put('approvals/templates/{templateId}', [ApprovalController::class, 'upsertTemplate'])->name('approvals.templates.update')->middleware('permission:manage settings');
            Route::get('approvals/templates/{templateId}/steps', [ApprovalController::class, 'steps'])->name('approvals.steps')->middleware('permission:manage settings');
            Route::post('approvals/templates/{templateId}/steps', [ApprovalController::class, 'upsertStep'])->name('approvals.steps.store')->middleware('permission:manage settings');
            Route::put('approvals/templates/{templateId}/steps/{stepId}', [ApprovalController::class, 'upsertStep'])->name('approvals.steps.update')->middleware('permission:manage settings');
            Route::put('approvals/templates/{templateId}/steps/{stepId}/users', [ApprovalController::class, 'replaceStepUsers'])->name('approvals.steps.users')->middleware('permission:manage settings');
            Route::get('approvals/requests', [ApprovalController::class, 'requests'])->name('approvals.requests')->middleware('permission:manage settings');
            Route::get('approvals/requests/{requestId}', [ApprovalController::class, 'requestDetail'])->name('approvals.requests.show')->middleware('permission:manage settings');
            Route::post('approvals/requests/{requestId}/decide', [ApprovalController::class, 'decide'])->name('approvals.requests.decide-admin')->middleware('permission:manage settings');
            Route::get('email-templates', [\App\Http\Controllers\EmailTemplateController::class, 'index'])->name('email-templates.index')->middleware('permission:manage settings');
            Route::get('email-templates/{id}', [\App\Http\Controllers\EmailTemplateController::class, 'show'])->name('email-templates.show')->middleware('permission:manage settings');
            Route::put('email-templates/{id}', [\App\Http\Controllers\EmailTemplateController::class, 'update'])->name('email-templates.update')->middleware('permission:manage settings');
            Route::get('notification-test/active-users', [NotificationTestController::class, 'activeUsers'])->name('notification-test.active-users')->middleware('permission:manage settings');
            Route::post('notification-test/send', [NotificationTestController::class, 'send'])->name('notification-test.send')->middleware('permission:manage settings');

            Route::get('database-backups', [DatabaseBackupController::class, 'index'])->name('database-backups.index')->middleware('permission:manage settings database-backup');
            Route::post('database-backups', [DatabaseBackupController::class, 'store'])->name('database-backups.store')->middleware('permission:manage settings database-backup');
            Route::get('database-backups/{file}/download', [DatabaseBackupController::class, 'download'])->name('database-backups.download')->middleware('permission:manage settings database-backup');
            Route::get('dashboard-access-token', [DashboardAccessTokenController::class, 'index'])->name('dashboard-access-token.index')->middleware('permission:manage settings dashboard-access-token');
            Route::post('dashboard-access-token/rotate', [DashboardAccessTokenController::class, 'rotate'])->name('dashboard-access-token.rotate')->middleware('permission:manage settings dashboard-access-token');
            Route::get('dashboard-settings', [DashboardSettingController::class, 'show'])->name('dashboard-settings.show')->middleware('permission:view work-orders|manage settings dashboard-settings');
            Route::put('dashboard-settings', [DashboardSettingController::class, 'update'])->name('dashboard-settings.update')->middleware('permission:manage settings dashboard-settings');

        });

        // ── Reports ──────────────────────────────────────────────────────────
        Route::get('reports/export', [ReportController::class, 'exportExcel'])->name('reports.export')->middleware('permission:view reports');

        // ── Users ────────────────────────────────────────────────────────────
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('roles', [UserController::class, 'roles'])->name('roles')->middleware('permission:view users');
            Route::get('import-template', [UserController::class, 'importTemplate'])->name('import-template')->middleware('permission:view users');
            Route::post('import', [UserController::class, 'importExcel'])->name('import')->middleware(['permission:manage users', 'throttle:10,1']);
            Route::get('/', [UserController::class, 'index'])->name('index')->middleware('permission:view users');
            Route::post('/', [UserController::class, 'store'])->name('store')->middleware('permission:manage users');
            Route::put('{user}', [UserController::class, 'update'])->name('update')->middleware('permission:manage users');
            Route::patch('{user}/toggle-active', [UserController::class, 'toggleActive'])->name('toggle-active')->middleware('permission:manage users');
            Route::post('{user}/reset-password', [UserController::class, 'resetPassword'])->name('reset-password')->middleware('permission:manage users');
            Route::delete('{user}', [UserController::class, 'destroy'])->name('destroy')->middleware('permission:manage users');
        });

    }); // end auth:sanctum

}); // end v1
