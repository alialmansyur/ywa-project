-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: mysql:3306
-- Generation Time: May 20, 2026 at 11:22 PM
-- Server version: 8.0.46
-- PHP Version: 8.2.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tapg_maintenance`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` bigint UNSIGNED NOT NULL,
  `log_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject_id` bigint UNSIGNED DEFAULT NULL,
  `event` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `causer_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `causer_id` bigint UNSIGNED DEFAULT NULL,
  `attribute_changes` json DEFAULT NULL,
  `properties` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`id`, `log_name`, `description`, `subject_type`, `subject_id`, `event`, `causer_type`, `causer_id`, `attribute_changes`, `properties`, `created_at`, `updated_at`) VALUES
(19, 'default', 'created', 'App\\Models\\User', 7, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"Super Admin TAPG\", \"email\": \"superadmin@tapg.local\", \"is_active\": true}}', '[]', '2026-05-19 05:59:48', '2026-05-19 05:59:48'),
(20, 'default', 'created', 'App\\Models\\User', 8, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"Admin TAPG\", \"email\": \"admin@tapg.local\", \"is_active\": true}}', '[]', '2026-05-19 05:59:48', '2026-05-19 05:59:48'),
(21, 'default', 'created', 'App\\Models\\User', 9, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"Budi Supervisor\", \"email\": \"supervisor@tapg.local\", \"is_active\": true}}', '[]', '2026-05-19 05:59:48', '2026-05-19 05:59:48'),
(22, 'default', 'created', 'App\\Models\\User', 10, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"Andi Mechanic\", \"email\": \"mechanic@tapg.local\", \"is_active\": true}}', '[]', '2026-05-19 05:59:48', '2026-05-19 05:59:48'),
(23, 'default', 'created', 'App\\Models\\User', 11, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"Doni Operator\", \"email\": \"operator@tapg.local\", \"is_active\": true}}', '[]', '2026-05-19 05:59:48', '2026-05-19 05:59:48'),
(24, 'default', 'created', 'App\\Models\\User', 12, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"Viewer TAPG\", \"email\": \"viewer@tapg.local\", \"is_active\": true}}', '[]', '2026-05-19 05:59:48', '2026-05-19 05:59:48'),
(25, 'default', 'created', 'App\\Models\\Asset', 7, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 3245.5, \"current_km\": 0}}', '[]', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(26, 'default', 'created', 'App\\Models\\Asset', 8, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 5120, \"current_km\": 0}}', '[]', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(27, 'default', 'created', 'App\\Models\\Asset', 9, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 48520.5}}', '[]', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(28, 'default', 'created', 'App\\Models\\Asset', 10, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"maintenance\", \"current_hm\": 7890, \"current_km\": 0}}', '[]', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(29, 'default', 'created', 'App\\Models\\Asset', 11, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 2100, \"current_km\": 0}}', '[]', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(30, 'default', 'created', 'App\\Models\\WorkOrder', 5, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"in_progress\", \"actual_cost\": null, \"approved_by\": 9}}', '[]', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(31, 'default', 'created', 'App\\Models\\WorkOrder', 6, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"pending\", \"actual_cost\": null, \"approved_by\": null}}', '[]', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(32, 'default', 'created', 'App\\Models\\WorkOrder', 7, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"completed\", \"actual_cost\": 1750000, \"approved_by\": 9}}', '[]', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(33, 'default', 'created', 'App\\Models\\User', 13, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"ADEK SETIAWAN\", \"email\": \"adek.setiawan@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:09', '2026-05-19 06:03:09'),
(34, 'default', 'created', 'App\\Models\\User', 14, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"RESTU PAMUJI\", \"email\": \"restu.pamuji@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:09', '2026-05-19 06:03:09'),
(35, 'default', 'created', 'App\\Models\\User', 15, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"ATI RILA MUSTIKA\", \"email\": \"ati.rila.mustika.244709@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:10', '2026-05-19 06:03:10'),
(36, 'default', 'created', 'App\\Models\\User', 16, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"ROMSIDI\", \"email\": \"romsidi.517901@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:10', '2026-05-19 06:03:10'),
(37, 'default', 'created', 'App\\Models\\User', 17, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"ARDIANSYAH\", \"email\": \"ardiansyah.181400@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:10', '2026-05-19 06:03:10'),
(38, 'default', 'created', 'App\\Models\\User', 18, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"AHMAD HAERUDIN\", \"email\": \"ahmad.haerudin.101061@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:11', '2026-05-19 06:03:11'),
(39, 'default', 'created', 'App\\Models\\User', 19, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"MOHAMAD ASRI\", \"email\": \"mohamad.asri.234264@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:11', '2026-05-19 06:03:11'),
(40, 'default', 'created', 'App\\Models\\User', 20, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"DENI ARDIANSYAH\", \"email\": \"deni.ardiansyah.234269@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:11', '2026-05-19 06:03:11'),
(41, 'default', 'created', 'App\\Models\\User', 21, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"MA\'ROFAN FIKRI ALHAQI\", \"email\": \"marofan.fikri.alhaqi.234142@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:12', '2026-05-19 06:03:12'),
(42, 'default', 'created', 'App\\Models\\User', 22, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"DANIAR APRILLYANDA\", \"email\": \"daniar.aprillyanda.234217@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:12', '2026-05-19 06:03:12'),
(43, 'default', 'created', 'App\\Models\\User', 23, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"ASKAR\", \"email\": \"askar.234275@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:12', '2026-05-19 06:03:12'),
(44, 'default', 'created', 'App\\Models\\User', 24, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"IKSAN HALIM\", \"email\": \"iksan.halim.234218@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:13', '2026-05-19 06:03:13'),
(45, 'default', 'created', 'App\\Models\\User', 25, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"DEMRI IFRANTO SIHOMBING\", \"email\": \"demri.ifranto.sihombing.233842@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:13', '2026-05-19 06:03:13'),
(46, 'default', 'created', 'App\\Models\\User', 26, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"PUTRI SEA\", \"email\": \"putri.sea.181802@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:13', '2026-05-19 06:03:13'),
(47, 'default', 'created', 'App\\Models\\User', 27, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"FAHRODIN\", \"email\": \"fahrodin.234141@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:14', '2026-05-19 06:03:14'),
(48, 'default', 'created', 'App\\Models\\User', 28, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"RIVANDY NATANAEL SEMBIRIN\", \"email\": \"rivandy.natanael.sembirin.255159@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:14', '2026-05-19 06:03:14'),
(49, 'default', 'created', 'App\\Models\\User', 29, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"ZULFAHMI\", \"email\": \"zulfahmi.265623@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:14', '2026-05-19 06:03:14'),
(50, 'default', 'created', 'App\\Models\\User', 30, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"DANI JATI HIDAYAT\", \"email\": \"dani.jati.hidayat.255163@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:14', '2026-05-19 06:03:14'),
(51, 'default', 'created', 'App\\Models\\User', 31, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"EKO NUR PUJIANTO\", \"email\": \"eko.nur.pujianto.265659@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:15', '2026-05-19 06:03:15'),
(52, 'default', 'created', 'App\\Models\\User', 32, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"MUH. ARFANDI\", \"email\": \"muh.arfandi.265660@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:15', '2026-05-19 06:03:15'),
(53, 'default', 'created', 'App\\Models\\User', 33, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"ASMA\'UL MUSLIH\", \"email\": \"asmaul.muslih.265707@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:15', '2026-05-19 06:03:15'),
(54, 'default', 'created', 'App\\Models\\User', 34, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"YOHANES SAMPE\", \"email\": \"yohanes.sampe.265726@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:16', '2026-05-19 06:03:16'),
(55, 'default', 'created', 'App\\Models\\User', 35, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"MUHAMAD SYAHRUL KHAKIM\", \"email\": \"muhamad.syahrul.khakim.265727@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:16', '2026-05-19 06:03:16'),
(56, 'default', 'created', 'App\\Models\\User', 36, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"MUH. IKBAL\", \"email\": \"muh.ikbal.244846@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:16', '2026-05-19 06:03:16'),
(57, 'default', 'created', 'App\\Models\\User', 37, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"WAHYU ADITYA\", \"email\": \"wahyu.aditya.244863@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:16', '2026-05-19 06:03:16'),
(58, 'default', 'created', 'App\\Models\\User', 38, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"R RYANDRA AQMAL MAULANA\", \"email\": \"r.ryandra.aqmal.maulana.255318@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:17', '2026-05-19 06:03:17'),
(59, 'default', 'created', 'App\\Models\\User', 39, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"RIVAN SURYO WIDODO\", \"email\": \"rivan.suryo.widodo.255379@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:17', '2026-05-19 06:03:17'),
(60, 'default', 'created', 'App\\Models\\User', 40, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"ARYA FIRMANSYAH\", \"email\": \"arya.firmansyah.255448@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:17', '2026-05-19 06:03:17'),
(61, 'default', 'created', 'App\\Models\\User', 41, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"BIMA HIDAYAT\", \"email\": \"bima.hidayat.244958@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:18', '2026-05-19 06:03:18'),
(62, 'default', 'created', 'App\\Models\\User', 42, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"DANIEL BAYU SAPUTRA\", \"email\": \"daniel.bayu.saputra.244975@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:18', '2026-05-19 06:03:18'),
(63, 'default', 'created', 'App\\Models\\User', 43, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"EVANS MUBA SAMOSIR\", \"email\": \"evans.muba.samosir.244977@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:18', '2026-05-19 06:03:18'),
(64, 'default', 'created', 'App\\Models\\User', 44, 'created', NULL, NULL, '{\"attributes\": {\"name\": \"FAJAR DWI HARDIANSYAH\", \"email\": \"fajar.dwi.hardiansyah.244979@tapg.operator.local\", \"is_active\": true}}', '[]', '2026-05-19 06:03:18', '2026-05-19 06:03:18'),
(65, 'default', 'updated', 'App\\Models\\WorkOrder', 6, 'updated', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"pending\", \"actual_cost\": null, \"approved_by\": null}, \"attributes\": {\"status\": \"pending\", \"actual_cost\": null, \"approved_by\": null}}', '[]', '2026-05-19 06:19:29', '2026-05-19 06:19:29'),
(66, 'default', 'created', 'App\\Models\\WorkOrder', 8, 'created', 'App\\Models\\User', 8, '{\"attributes\": {\"status\": \"draft\", \"actual_cost\": null, \"approved_by\": null}}', '[]', '2026-05-19 13:07:33', '2026-05-19 13:07:33'),
(67, 'default', 'updated', 'App\\Models\\WorkOrder', 8, 'updated', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"draft\", \"actual_cost\": null, \"approved_by\": null}, \"attributes\": {\"status\": \"draft\", \"actual_cost\": null, \"approved_by\": null}}', '[]', '2026-05-19 13:07:45', '2026-05-19 13:07:45'),
(68, 'default', 'updated', 'App\\Models\\WorkOrder', 8, 'updated', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"draft\", \"actual_cost\": null, \"approved_by\": null}, \"attributes\": {\"status\": \"completed\", \"actual_cost\": null, \"approved_by\": null}}', '[]', '2026-05-19 13:10:03', '2026-05-19 13:10:03'),
(69, 'default', 'updated', 'App\\Models\\WorkOrder', 6, 'updated', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"pending\", \"actual_cost\": null, \"approved_by\": null}, \"attributes\": {\"status\": \"completed\", \"actual_cost\": null, \"approved_by\": null}}', '[]', '2026-05-19 13:18:56', '2026-05-19 13:18:56'),
(70, 'default', 'created', 'App\\Models\\WorkOrder', 9, 'created', 'App\\Models\\User', 8, '{\"attributes\": {\"status\": \"draft\", \"actual_cost\": null, \"approved_by\": null}}', '[]', '2026-05-19 13:20:00', '2026-05-19 13:20:00'),
(71, 'default', 'updated', 'App\\Models\\WorkOrder', 9, 'updated', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"draft\", \"actual_cost\": null, \"approved_by\": null}, \"attributes\": {\"status\": \"pending\", \"actual_cost\": null, \"approved_by\": null}}', '[]', '2026-05-19 13:27:06', '2026-05-19 13:27:06'),
(72, 'default', 'updated', 'App\\Models\\WorkOrder', 9, 'updated', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"pending\", \"actual_cost\": null, \"approved_by\": null}, \"attributes\": {\"status\": \"approved\", \"actual_cost\": null, \"approved_by\": 8}}', '[]', '2026-05-19 13:27:13', '2026-05-19 13:27:13'),
(73, 'default', 'updated', 'App\\Models\\WorkOrder', 9, 'updated', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"approved\", \"actual_cost\": null, \"approved_by\": 8}, \"attributes\": {\"status\": \"approved\", \"actual_cost\": null, \"approved_by\": 8}}', '[]', '2026-05-19 13:27:22', '2026-05-19 13:27:22'),
(74, 'default', 'updated', 'App\\Models\\WorkOrder', 9, 'updated', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"approved\", \"actual_cost\": null, \"approved_by\": 8}, \"attributes\": {\"status\": \"in_progress\", \"actual_cost\": null, \"approved_by\": 8}}', '[]', '2026-05-19 13:27:22', '2026-05-19 13:27:22'),
(75, 'default', 'updated', 'App\\Models\\WorkOrder', 9, 'updated', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"in_progress\", \"actual_cost\": null, \"approved_by\": 8}, \"attributes\": {\"status\": \"completed\", \"actual_cost\": null, \"approved_by\": 8}}', '[]', '2026-05-19 13:29:59', '2026-05-19 13:29:59'),
(76, 'default', 'updated', 'App\\Models\\WorkOrder', 8, 'updated', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"completed\", \"actual_cost\": null, \"approved_by\": null}, \"attributes\": {\"status\": \"completed\", \"actual_cost\": null, \"approved_by\": null}}', '[]', '2026-05-19 14:09:28', '2026-05-19 14:09:28'),
(77, 'default', 'deleted', 'App\\Models\\Asset', 7, 'deleted', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"active\", \"current_hm\": 3245.5, \"current_km\": 0}}', '[]', '2026-05-19 19:27:46', '2026-05-19 19:27:46'),
(78, 'default', 'deleted', 'App\\Models\\Asset', 8, 'deleted', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"active\", \"current_hm\": 5120, \"current_km\": 0}}', '[]', '2026-05-19 19:27:50', '2026-05-19 19:27:50'),
(79, 'default', 'deleted', 'App\\Models\\Asset', 9, 'deleted', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 48520.5}}', '[]', '2026-05-19 19:27:55', '2026-05-19 19:27:55'),
(80, 'default', 'deleted', 'App\\Models\\Asset', 10, 'deleted', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"maintenance\", \"current_hm\": 7890, \"current_km\": 0}}', '[]', '2026-05-19 19:27:59', '2026-05-19 19:27:59'),
(81, 'default', 'deleted', 'App\\Models\\Asset', 11, 'deleted', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"active\", \"current_hm\": 2100, \"current_km\": 0}}', '[]', '2026-05-19 19:28:03', '2026-05-19 19:28:03'),
(361, 'default', 'created', 'App\\Models\\Asset', 292, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(362, 'default', 'created', 'App\\Models\\Asset', 293, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(363, 'default', 'created', 'App\\Models\\Asset', 294, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(364, 'default', 'created', 'App\\Models\\Asset', 295, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(365, 'default', 'created', 'App\\Models\\Asset', 296, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(366, 'default', 'created', 'App\\Models\\Asset', 297, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(367, 'default', 'created', 'App\\Models\\Asset', 298, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(368, 'default', 'created', 'App\\Models\\Asset', 299, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(369, 'default', 'created', 'App\\Models\\Asset', 300, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(370, 'default', 'created', 'App\\Models\\Asset', 301, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(371, 'default', 'created', 'App\\Models\\Asset', 302, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(372, 'default', 'created', 'App\\Models\\Asset', 303, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(373, 'default', 'created', 'App\\Models\\Asset', 304, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(374, 'default', 'created', 'App\\Models\\Asset', 305, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(375, 'default', 'created', 'App\\Models\\Asset', 306, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(376, 'default', 'created', 'App\\Models\\Asset', 307, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(377, 'default', 'created', 'App\\Models\\Asset', 308, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(378, 'default', 'created', 'App\\Models\\Asset', 309, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(379, 'default', 'created', 'App\\Models\\Asset', 310, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(380, 'default', 'created', 'App\\Models\\Asset', 311, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(381, 'default', 'created', 'App\\Models\\Asset', 312, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(382, 'default', 'created', 'App\\Models\\Asset', 313, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(383, 'default', 'created', 'App\\Models\\Asset', 314, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(384, 'default', 'created', 'App\\Models\\Asset', 315, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(385, 'default', 'created', 'App\\Models\\Asset', 316, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(386, 'default', 'created', 'App\\Models\\Asset', 317, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(387, 'default', 'created', 'App\\Models\\Asset', 318, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(388, 'default', 'created', 'App\\Models\\Asset', 319, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(389, 'default', 'created', 'App\\Models\\Asset', 320, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(390, 'default', 'created', 'App\\Models\\Asset', 321, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(391, 'default', 'created', 'App\\Models\\Asset', 322, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(392, 'default', 'created', 'App\\Models\\Asset', 323, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(393, 'default', 'created', 'App\\Models\\Asset', 324, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(394, 'default', 'created', 'App\\Models\\Asset', 325, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(395, 'default', 'created', 'App\\Models\\Asset', 326, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(396, 'default', 'created', 'App\\Models\\Asset', 327, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(397, 'default', 'created', 'App\\Models\\Asset', 328, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(398, 'default', 'created', 'App\\Models\\Asset', 329, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(399, 'default', 'created', 'App\\Models\\Asset', 330, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(400, 'default', 'created', 'App\\Models\\Asset', 331, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(401, 'default', 'created', 'App\\Models\\Asset', 332, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(402, 'default', 'created', 'App\\Models\\Asset', 333, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(403, 'default', 'created', 'App\\Models\\Asset', 334, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(404, 'default', 'created', 'App\\Models\\Asset', 335, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(405, 'default', 'created', 'App\\Models\\Asset', 336, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(406, 'default', 'created', 'App\\Models\\Asset', 337, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(407, 'default', 'created', 'App\\Models\\Asset', 338, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(408, 'default', 'created', 'App\\Models\\Asset', 339, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(409, 'default', 'created', 'App\\Models\\Asset', 340, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(410, 'default', 'created', 'App\\Models\\Asset', 341, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(411, 'default', 'created', 'App\\Models\\Asset', 342, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(412, 'default', 'created', 'App\\Models\\Asset', 343, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(413, 'default', 'created', 'App\\Models\\Asset', 344, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(414, 'default', 'created', 'App\\Models\\Asset', 345, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(415, 'default', 'created', 'App\\Models\\Asset', 346, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(416, 'default', 'created', 'App\\Models\\Asset', 347, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(417, 'default', 'created', 'App\\Models\\Asset', 348, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(418, 'default', 'created', 'App\\Models\\Asset', 349, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(419, 'default', 'created', 'App\\Models\\Asset', 350, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(420, 'default', 'created', 'App\\Models\\Asset', 351, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(421, 'default', 'created', 'App\\Models\\Asset', 352, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(422, 'default', 'created', 'App\\Models\\Asset', 353, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(423, 'default', 'created', 'App\\Models\\Asset', 354, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(424, 'default', 'created', 'App\\Models\\Asset', 355, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(425, 'default', 'created', 'App\\Models\\Asset', 356, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(426, 'default', 'created', 'App\\Models\\Asset', 357, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(427, 'default', 'created', 'App\\Models\\Asset', 358, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(428, 'default', 'created', 'App\\Models\\Asset', 359, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(429, 'default', 'created', 'App\\Models\\Asset', 360, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(430, 'default', 'created', 'App\\Models\\Asset', 361, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(431, 'default', 'created', 'App\\Models\\Asset', 362, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(432, 'default', 'created', 'App\\Models\\Asset', 363, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(433, 'default', 'created', 'App\\Models\\Asset', 364, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(434, 'default', 'created', 'App\\Models\\Asset', 365, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(435, 'default', 'created', 'App\\Models\\Asset', 366, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(436, 'default', 'created', 'App\\Models\\Asset', 367, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(437, 'default', 'created', 'App\\Models\\Asset', 368, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(438, 'default', 'created', 'App\\Models\\Asset', 369, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(439, 'default', 'created', 'App\\Models\\Asset', 370, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(440, 'default', 'created', 'App\\Models\\Asset', 371, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(441, 'default', 'created', 'App\\Models\\Asset', 372, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(442, 'default', 'created', 'App\\Models\\Asset', 373, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(443, 'default', 'created', 'App\\Models\\Asset', 374, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(444, 'default', 'created', 'App\\Models\\Asset', 375, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(445, 'default', 'created', 'App\\Models\\Asset', 376, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(446, 'default', 'created', 'App\\Models\\Asset', 377, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(447, 'default', 'created', 'App\\Models\\Asset', 378, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(448, 'default', 'created', 'App\\Models\\Asset', 379, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(449, 'default', 'created', 'App\\Models\\Asset', 380, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(450, 'default', 'created', 'App\\Models\\Asset', 381, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(451, 'default', 'created', 'App\\Models\\Asset', 382, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(452, 'default', 'created', 'App\\Models\\Asset', 383, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(453, 'default', 'created', 'App\\Models\\Asset', 384, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(454, 'default', 'created', 'App\\Models\\Asset', 385, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(455, 'default', 'created', 'App\\Models\\Asset', 386, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(456, 'default', 'created', 'App\\Models\\Asset', 387, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(457, 'default', 'created', 'App\\Models\\Asset', 388, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(458, 'default', 'created', 'App\\Models\\Asset', 389, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(459, 'default', 'created', 'App\\Models\\Asset', 390, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(460, 'default', 'created', 'App\\Models\\Asset', 391, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(461, 'default', 'created', 'App\\Models\\Asset', 392, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(462, 'default', 'created', 'App\\Models\\Asset', 393, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(463, 'default', 'created', 'App\\Models\\Asset', 394, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(464, 'default', 'created', 'App\\Models\\Asset', 395, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(465, 'default', 'created', 'App\\Models\\Asset', 396, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(466, 'default', 'created', 'App\\Models\\Asset', 397, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(467, 'default', 'created', 'App\\Models\\Asset', 398, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(468, 'default', 'created', 'App\\Models\\Asset', 399, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(469, 'default', 'created', 'App\\Models\\Asset', 400, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(470, 'default', 'created', 'App\\Models\\Asset', 401, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(471, 'default', 'created', 'App\\Models\\Asset', 402, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(472, 'default', 'created', 'App\\Models\\Asset', 403, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(473, 'default', 'created', 'App\\Models\\Asset', 404, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(474, 'default', 'created', 'App\\Models\\Asset', 405, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(475, 'default', 'created', 'App\\Models\\Asset', 406, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(476, 'default', 'created', 'App\\Models\\Asset', 407, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(477, 'default', 'created', 'App\\Models\\Asset', 408, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(478, 'default', 'created', 'App\\Models\\Asset', 409, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(479, 'default', 'created', 'App\\Models\\Asset', 410, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(480, 'default', 'created', 'App\\Models\\Asset', 411, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(481, 'default', 'created', 'App\\Models\\Asset', 412, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(482, 'default', 'created', 'App\\Models\\Asset', 413, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(483, 'default', 'created', 'App\\Models\\Asset', 414, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:09', '2026-05-19 19:37:09'),
(484, 'default', 'created', 'App\\Models\\Asset', 415, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(485, 'default', 'created', 'App\\Models\\Asset', 416, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(486, 'default', 'created', 'App\\Models\\Asset', 417, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(487, 'default', 'created', 'App\\Models\\Asset', 418, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(488, 'default', 'created', 'App\\Models\\Asset', 419, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(489, 'default', 'created', 'App\\Models\\Asset', 420, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(490, 'default', 'created', 'App\\Models\\Asset', 421, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(491, 'default', 'created', 'App\\Models\\Asset', 422, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(492, 'default', 'created', 'App\\Models\\Asset', 423, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(493, 'default', 'created', 'App\\Models\\Asset', 424, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(494, 'default', 'created', 'App\\Models\\Asset', 425, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(495, 'default', 'created', 'App\\Models\\Asset', 426, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(496, 'default', 'created', 'App\\Models\\Asset', 427, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(497, 'default', 'created', 'App\\Models\\Asset', 428, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(498, 'default', 'created', 'App\\Models\\Asset', 429, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(499, 'default', 'created', 'App\\Models\\Asset', 430, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(500, 'default', 'created', 'App\\Models\\Asset', 431, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(501, 'default', 'created', 'App\\Models\\Asset', 432, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(502, 'default', 'created', 'App\\Models\\Asset', 433, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(503, 'default', 'created', 'App\\Models\\Asset', 434, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(504, 'default', 'created', 'App\\Models\\Asset', 435, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(505, 'default', 'created', 'App\\Models\\Asset', 436, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(506, 'default', 'created', 'App\\Models\\Asset', 437, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(507, 'default', 'created', 'App\\Models\\Asset', 438, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(508, 'default', 'created', 'App\\Models\\Asset', 439, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(509, 'default', 'created', 'App\\Models\\Asset', 440, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(510, 'default', 'created', 'App\\Models\\Asset', 441, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(511, 'default', 'created', 'App\\Models\\Asset', 442, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(512, 'default', 'created', 'App\\Models\\Asset', 443, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(513, 'default', 'created', 'App\\Models\\Asset', 444, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(514, 'default', 'created', 'App\\Models\\Asset', 445, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(515, 'default', 'created', 'App\\Models\\Asset', 446, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(516, 'default', 'created', 'App\\Models\\Asset', 447, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(517, 'default', 'created', 'App\\Models\\Asset', 448, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(518, 'default', 'created', 'App\\Models\\Asset', 449, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10');
INSERT INTO `activity_log` (`id`, `log_name`, `description`, `subject_type`, `subject_id`, `event`, `causer_type`, `causer_id`, `attribute_changes`, `properties`, `created_at`, `updated_at`) VALUES
(519, 'default', 'created', 'App\\Models\\Asset', 450, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(520, 'default', 'created', 'App\\Models\\Asset', 451, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(521, 'default', 'created', 'App\\Models\\Asset', 452, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(522, 'default', 'created', 'App\\Models\\Asset', 453, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(523, 'default', 'created', 'App\\Models\\Asset', 454, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(524, 'default', 'created', 'App\\Models\\Asset', 455, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(525, 'default', 'created', 'App\\Models\\Asset', 456, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(526, 'default', 'created', 'App\\Models\\Asset', 457, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(527, 'default', 'created', 'App\\Models\\Asset', 458, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(528, 'default', 'created', 'App\\Models\\Asset', 459, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(529, 'default', 'created', 'App\\Models\\Asset', 460, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(530, 'default', 'created', 'App\\Models\\Asset', 461, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(531, 'default', 'created', 'App\\Models\\Asset', 462, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(532, 'default', 'created', 'App\\Models\\Asset', 463, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(533, 'default', 'created', 'App\\Models\\Asset', 464, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(534, 'default', 'created', 'App\\Models\\Asset', 465, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(535, 'default', 'created', 'App\\Models\\Asset', 466, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(536, 'default', 'created', 'App\\Models\\Asset', 467, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(537, 'default', 'created', 'App\\Models\\Asset', 468, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(538, 'default', 'created', 'App\\Models\\Asset', 469, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(539, 'default', 'created', 'App\\Models\\Asset', 470, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(540, 'default', 'created', 'App\\Models\\Asset', 471, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(541, 'default', 'created', 'App\\Models\\Asset', 472, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(542, 'default', 'created', 'App\\Models\\Asset', 473, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(543, 'default', 'created', 'App\\Models\\Asset', 474, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(544, 'default', 'created', 'App\\Models\\Asset', 475, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(545, 'default', 'created', 'App\\Models\\Asset', 476, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:10', '2026-05-19 19:37:10'),
(546, 'default', 'created', 'App\\Models\\Asset', 477, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(547, 'default', 'created', 'App\\Models\\Asset', 478, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(548, 'default', 'created', 'App\\Models\\Asset', 479, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(549, 'default', 'created', 'App\\Models\\Asset', 480, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(550, 'default', 'created', 'App\\Models\\Asset', 481, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(551, 'default', 'created', 'App\\Models\\Asset', 482, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(552, 'default', 'created', 'App\\Models\\Asset', 483, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(553, 'default', 'created', 'App\\Models\\Asset', 484, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(554, 'default', 'created', 'App\\Models\\Asset', 485, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(555, 'default', 'created', 'App\\Models\\Asset', 486, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(556, 'default', 'created', 'App\\Models\\Asset', 487, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(557, 'default', 'created', 'App\\Models\\Asset', 488, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(558, 'default', 'created', 'App\\Models\\Asset', 489, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(559, 'default', 'created', 'App\\Models\\Asset', 490, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(560, 'default', 'created', 'App\\Models\\Asset', 491, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(561, 'default', 'created', 'App\\Models\\Asset', 492, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(562, 'default', 'created', 'App\\Models\\Asset', 493, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(563, 'default', 'created', 'App\\Models\\Asset', 494, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(564, 'default', 'created', 'App\\Models\\Asset', 495, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(565, 'default', 'created', 'App\\Models\\Asset', 496, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(566, 'default', 'created', 'App\\Models\\Asset', 497, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(567, 'default', 'created', 'App\\Models\\Asset', 498, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(568, 'default', 'created', 'App\\Models\\Asset', 499, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(569, 'default', 'created', 'App\\Models\\Asset', 500, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(570, 'default', 'created', 'App\\Models\\Asset', 501, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(571, 'default', 'created', 'App\\Models\\Asset', 502, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(572, 'default', 'created', 'App\\Models\\Asset', 503, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(573, 'default', 'created', 'App\\Models\\Asset', 504, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(574, 'default', 'created', 'App\\Models\\Asset', 505, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(575, 'default', 'created', 'App\\Models\\Asset', 506, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(576, 'default', 'created', 'App\\Models\\Asset', 507, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(577, 'default', 'created', 'App\\Models\\Asset', 508, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(578, 'default', 'created', 'App\\Models\\Asset', 509, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(579, 'default', 'created', 'App\\Models\\Asset', 510, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(580, 'default', 'created', 'App\\Models\\Asset', 511, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(581, 'default', 'created', 'App\\Models\\Asset', 512, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(582, 'default', 'created', 'App\\Models\\Asset', 513, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(583, 'default', 'created', 'App\\Models\\Asset', 514, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(584, 'default', 'created', 'App\\Models\\Asset', 515, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(585, 'default', 'created', 'App\\Models\\Asset', 516, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(586, 'default', 'created', 'App\\Models\\Asset', 517, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(587, 'default', 'created', 'App\\Models\\Asset', 518, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(588, 'default', 'created', 'App\\Models\\Asset', 519, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(589, 'default', 'created', 'App\\Models\\Asset', 520, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(590, 'default', 'created', 'App\\Models\\Asset', 521, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(591, 'default', 'created', 'App\\Models\\Asset', 522, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(592, 'default', 'created', 'App\\Models\\Asset', 523, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(593, 'default', 'created', 'App\\Models\\Asset', 524, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(594, 'default', 'created', 'App\\Models\\Asset', 525, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(595, 'default', 'created', 'App\\Models\\Asset', 526, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(596, 'default', 'created', 'App\\Models\\Asset', 527, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(597, 'default', 'created', 'App\\Models\\Asset', 528, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(598, 'default', 'created', 'App\\Models\\Asset', 529, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(599, 'default', 'created', 'App\\Models\\Asset', 530, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(600, 'default', 'created', 'App\\Models\\Asset', 531, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(601, 'default', 'created', 'App\\Models\\Asset', 532, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(602, 'default', 'created', 'App\\Models\\Asset', 533, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(603, 'default', 'created', 'App\\Models\\Asset', 534, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(604, 'default', 'created', 'App\\Models\\Asset', 535, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(605, 'default', 'created', 'App\\Models\\Asset', 536, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(606, 'default', 'created', 'App\\Models\\Asset', 537, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(607, 'default', 'created', 'App\\Models\\Asset', 538, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(608, 'default', 'created', 'App\\Models\\Asset', 539, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(609, 'default', 'created', 'App\\Models\\Asset', 540, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(610, 'default', 'created', 'App\\Models\\Asset', 541, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:11', '2026-05-19 19:37:11'),
(611, 'default', 'created', 'App\\Models\\Asset', 542, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(612, 'default', 'created', 'App\\Models\\Asset', 543, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(613, 'default', 'created', 'App\\Models\\Asset', 544, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(614, 'default', 'created', 'App\\Models\\Asset', 545, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(615, 'default', 'created', 'App\\Models\\Asset', 546, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(616, 'default', 'created', 'App\\Models\\Asset', 547, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(617, 'default', 'created', 'App\\Models\\Asset', 548, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(618, 'default', 'created', 'App\\Models\\Asset', 549, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(619, 'default', 'created', 'App\\Models\\Asset', 550, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(620, 'default', 'created', 'App\\Models\\Asset', 551, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(621, 'default', 'created', 'App\\Models\\Asset', 552, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(622, 'default', 'created', 'App\\Models\\Asset', 553, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(623, 'default', 'created', 'App\\Models\\Asset', 554, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(624, 'default', 'created', 'App\\Models\\Asset', 555, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(625, 'default', 'created', 'App\\Models\\Asset', 556, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(626, 'default', 'created', 'App\\Models\\Asset', 557, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(627, 'default', 'created', 'App\\Models\\Asset', 558, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(628, 'default', 'created', 'App\\Models\\Asset', 559, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(629, 'default', 'created', 'App\\Models\\Asset', 560, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(630, 'default', 'created', 'App\\Models\\Asset', 561, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(631, 'default', 'created', 'App\\Models\\Asset', 562, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(632, 'default', 'created', 'App\\Models\\Asset', 563, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(633, 'default', 'created', 'App\\Models\\Asset', 564, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(634, 'default', 'created', 'App\\Models\\Asset', 565, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(635, 'default', 'created', 'App\\Models\\Asset', 566, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(636, 'default', 'created', 'App\\Models\\Asset', 567, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(637, 'default', 'created', 'App\\Models\\Asset', 568, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(638, 'default', 'created', 'App\\Models\\Asset', 569, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(639, 'default', 'created', 'App\\Models\\Asset', 570, 'created', NULL, NULL, '{\"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:37:12', '2026-05-19 19:37:12'),
(640, 'default', 'updated', 'App\\Models\\Asset', 292, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(641, 'default', 'updated', 'App\\Models\\Asset', 293, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(642, 'default', 'updated', 'App\\Models\\Asset', 294, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(643, 'default', 'updated', 'App\\Models\\Asset', 295, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(644, 'default', 'updated', 'App\\Models\\Asset', 296, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(645, 'default', 'updated', 'App\\Models\\Asset', 297, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(646, 'default', 'updated', 'App\\Models\\Asset', 298, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(647, 'default', 'updated', 'App\\Models\\Asset', 299, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(648, 'default', 'updated', 'App\\Models\\Asset', 300, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(649, 'default', 'updated', 'App\\Models\\Asset', 301, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(650, 'default', 'updated', 'App\\Models\\Asset', 302, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(651, 'default', 'updated', 'App\\Models\\Asset', 303, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(652, 'default', 'updated', 'App\\Models\\Asset', 304, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(653, 'default', 'updated', 'App\\Models\\Asset', 305, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(654, 'default', 'updated', 'App\\Models\\Asset', 306, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(655, 'default', 'updated', 'App\\Models\\Asset', 307, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(656, 'default', 'updated', 'App\\Models\\Asset', 308, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(657, 'default', 'updated', 'App\\Models\\Asset', 309, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(658, 'default', 'updated', 'App\\Models\\Asset', 310, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(659, 'default', 'updated', 'App\\Models\\Asset', 311, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(660, 'default', 'updated', 'App\\Models\\Asset', 312, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(661, 'default', 'updated', 'App\\Models\\Asset', 313, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(662, 'default', 'updated', 'App\\Models\\Asset', 314, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(663, 'default', 'updated', 'App\\Models\\Asset', 315, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(664, 'default', 'updated', 'App\\Models\\Asset', 316, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(665, 'default', 'updated', 'App\\Models\\Asset', 317, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(666, 'default', 'updated', 'App\\Models\\Asset', 318, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(667, 'default', 'updated', 'App\\Models\\Asset', 319, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(668, 'default', 'updated', 'App\\Models\\Asset', 320, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(669, 'default', 'updated', 'App\\Models\\Asset', 321, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(670, 'default', 'updated', 'App\\Models\\Asset', 322, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(671, 'default', 'updated', 'App\\Models\\Asset', 323, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(672, 'default', 'updated', 'App\\Models\\Asset', 324, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:38', '2026-05-19 19:44:38'),
(673, 'default', 'updated', 'App\\Models\\Asset', 325, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(674, 'default', 'updated', 'App\\Models\\Asset', 326, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(675, 'default', 'updated', 'App\\Models\\Asset', 327, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(676, 'default', 'updated', 'App\\Models\\Asset', 328, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(677, 'default', 'updated', 'App\\Models\\Asset', 329, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(678, 'default', 'updated', 'App\\Models\\Asset', 330, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(679, 'default', 'updated', 'App\\Models\\Asset', 331, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(680, 'default', 'updated', 'App\\Models\\Asset', 332, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(681, 'default', 'updated', 'App\\Models\\Asset', 333, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(682, 'default', 'updated', 'App\\Models\\Asset', 334, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(683, 'default', 'updated', 'App\\Models\\Asset', 335, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(684, 'default', 'updated', 'App\\Models\\Asset', 336, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(685, 'default', 'updated', 'App\\Models\\Asset', 337, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(686, 'default', 'updated', 'App\\Models\\Asset', 338, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(687, 'default', 'updated', 'App\\Models\\Asset', 339, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(688, 'default', 'updated', 'App\\Models\\Asset', 340, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(689, 'default', 'updated', 'App\\Models\\Asset', 341, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(690, 'default', 'updated', 'App\\Models\\Asset', 342, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(691, 'default', 'updated', 'App\\Models\\Asset', 343, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(692, 'default', 'updated', 'App\\Models\\Asset', 344, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(693, 'default', 'updated', 'App\\Models\\Asset', 345, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(694, 'default', 'updated', 'App\\Models\\Asset', 346, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(695, 'default', 'updated', 'App\\Models\\Asset', 347, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(696, 'default', 'updated', 'App\\Models\\Asset', 348, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(697, 'default', 'updated', 'App\\Models\\Asset', 349, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(698, 'default', 'updated', 'App\\Models\\Asset', 350, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(699, 'default', 'updated', 'App\\Models\\Asset', 351, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(700, 'default', 'updated', 'App\\Models\\Asset', 352, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(701, 'default', 'updated', 'App\\Models\\Asset', 353, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(702, 'default', 'updated', 'App\\Models\\Asset', 354, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(703, 'default', 'updated', 'App\\Models\\Asset', 355, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(704, 'default', 'updated', 'App\\Models\\Asset', 356, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(705, 'default', 'updated', 'App\\Models\\Asset', 357, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(706, 'default', 'updated', 'App\\Models\\Asset', 358, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(707, 'default', 'updated', 'App\\Models\\Asset', 359, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(708, 'default', 'updated', 'App\\Models\\Asset', 360, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(709, 'default', 'updated', 'App\\Models\\Asset', 361, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(710, 'default', 'updated', 'App\\Models\\Asset', 362, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(711, 'default', 'updated', 'App\\Models\\Asset', 363, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(712, 'default', 'updated', 'App\\Models\\Asset', 364, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(713, 'default', 'updated', 'App\\Models\\Asset', 365, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(714, 'default', 'updated', 'App\\Models\\Asset', 366, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(715, 'default', 'updated', 'App\\Models\\Asset', 367, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(716, 'default', 'updated', 'App\\Models\\Asset', 368, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(717, 'default', 'updated', 'App\\Models\\Asset', 369, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(718, 'default', 'updated', 'App\\Models\\Asset', 370, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(719, 'default', 'updated', 'App\\Models\\Asset', 371, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(720, 'default', 'updated', 'App\\Models\\Asset', 372, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(721, 'default', 'updated', 'App\\Models\\Asset', 373, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(722, 'default', 'updated', 'App\\Models\\Asset', 374, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39'),
(723, 'default', 'updated', 'App\\Models\\Asset', 375, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:39', '2026-05-19 19:44:39');
INSERT INTO `activity_log` (`id`, `log_name`, `description`, `subject_type`, `subject_id`, `event`, `causer_type`, `causer_id`, `attribute_changes`, `properties`, `created_at`, `updated_at`) VALUES
(724, 'default', 'updated', 'App\\Models\\Asset', 376, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(725, 'default', 'updated', 'App\\Models\\Asset', 377, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(726, 'default', 'updated', 'App\\Models\\Asset', 378, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(727, 'default', 'updated', 'App\\Models\\Asset', 379, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(728, 'default', 'updated', 'App\\Models\\Asset', 380, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(729, 'default', 'updated', 'App\\Models\\Asset', 381, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(730, 'default', 'updated', 'App\\Models\\Asset', 382, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(731, 'default', 'updated', 'App\\Models\\Asset', 383, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(732, 'default', 'updated', 'App\\Models\\Asset', 384, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(733, 'default', 'updated', 'App\\Models\\Asset', 385, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(734, 'default', 'updated', 'App\\Models\\Asset', 386, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(735, 'default', 'updated', 'App\\Models\\Asset', 387, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(736, 'default', 'updated', 'App\\Models\\Asset', 388, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(737, 'default', 'updated', 'App\\Models\\Asset', 389, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(738, 'default', 'updated', 'App\\Models\\Asset', 390, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(739, 'default', 'updated', 'App\\Models\\Asset', 391, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(740, 'default', 'updated', 'App\\Models\\Asset', 392, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(741, 'default', 'updated', 'App\\Models\\Asset', 393, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(742, 'default', 'updated', 'App\\Models\\Asset', 394, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(743, 'default', 'updated', 'App\\Models\\Asset', 395, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(744, 'default', 'updated', 'App\\Models\\Asset', 396, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(745, 'default', 'updated', 'App\\Models\\Asset', 397, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(746, 'default', 'updated', 'App\\Models\\Asset', 398, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(747, 'default', 'updated', 'App\\Models\\Asset', 399, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(748, 'default', 'updated', 'App\\Models\\Asset', 400, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(749, 'default', 'updated', 'App\\Models\\Asset', 401, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(750, 'default', 'updated', 'App\\Models\\Asset', 402, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(751, 'default', 'updated', 'App\\Models\\Asset', 403, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(752, 'default', 'updated', 'App\\Models\\Asset', 404, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(753, 'default', 'updated', 'App\\Models\\Asset', 405, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(754, 'default', 'updated', 'App\\Models\\Asset', 406, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(755, 'default', 'updated', 'App\\Models\\Asset', 407, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(756, 'default', 'updated', 'App\\Models\\Asset', 408, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(757, 'default', 'updated', 'App\\Models\\Asset', 409, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(758, 'default', 'updated', 'App\\Models\\Asset', 410, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(759, 'default', 'updated', 'App\\Models\\Asset', 411, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(760, 'default', 'updated', 'App\\Models\\Asset', 412, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(761, 'default', 'updated', 'App\\Models\\Asset', 413, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(762, 'default', 'updated', 'App\\Models\\Asset', 414, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(763, 'default', 'updated', 'App\\Models\\Asset', 415, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(764, 'default', 'updated', 'App\\Models\\Asset', 416, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(765, 'default', 'updated', 'App\\Models\\Asset', 417, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(766, 'default', 'updated', 'App\\Models\\Asset', 418, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(767, 'default', 'updated', 'App\\Models\\Asset', 419, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(768, 'default', 'updated', 'App\\Models\\Asset', 420, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(769, 'default', 'updated', 'App\\Models\\Asset', 421, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(770, 'default', 'updated', 'App\\Models\\Asset', 422, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(771, 'default', 'updated', 'App\\Models\\Asset', 423, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(772, 'default', 'updated', 'App\\Models\\Asset', 424, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(773, 'default', 'updated', 'App\\Models\\Asset', 425, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(774, 'default', 'updated', 'App\\Models\\Asset', 426, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(775, 'default', 'updated', 'App\\Models\\Asset', 427, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(776, 'default', 'updated', 'App\\Models\\Asset', 428, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(777, 'default', 'updated', 'App\\Models\\Asset', 429, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(778, 'default', 'updated', 'App\\Models\\Asset', 430, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(779, 'default', 'updated', 'App\\Models\\Asset', 431, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:40', '2026-05-19 19:44:40'),
(780, 'default', 'updated', 'App\\Models\\Asset', 432, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(781, 'default', 'updated', 'App\\Models\\Asset', 433, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(782, 'default', 'updated', 'App\\Models\\Asset', 434, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(783, 'default', 'updated', 'App\\Models\\Asset', 435, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(784, 'default', 'updated', 'App\\Models\\Asset', 436, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(785, 'default', 'updated', 'App\\Models\\Asset', 437, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(786, 'default', 'updated', 'App\\Models\\Asset', 438, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(787, 'default', 'updated', 'App\\Models\\Asset', 439, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(788, 'default', 'updated', 'App\\Models\\Asset', 440, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(789, 'default', 'updated', 'App\\Models\\Asset', 441, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(790, 'default', 'updated', 'App\\Models\\Asset', 442, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(791, 'default', 'updated', 'App\\Models\\Asset', 443, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(792, 'default', 'updated', 'App\\Models\\Asset', 444, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(793, 'default', 'updated', 'App\\Models\\Asset', 445, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(794, 'default', 'updated', 'App\\Models\\Asset', 446, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(795, 'default', 'updated', 'App\\Models\\Asset', 447, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(796, 'default', 'updated', 'App\\Models\\Asset', 448, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(797, 'default', 'updated', 'App\\Models\\Asset', 449, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(798, 'default', 'updated', 'App\\Models\\Asset', 450, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(799, 'default', 'updated', 'App\\Models\\Asset', 451, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(800, 'default', 'updated', 'App\\Models\\Asset', 452, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(801, 'default', 'updated', 'App\\Models\\Asset', 453, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(802, 'default', 'updated', 'App\\Models\\Asset', 454, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(803, 'default', 'updated', 'App\\Models\\Asset', 455, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(804, 'default', 'updated', 'App\\Models\\Asset', 456, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(805, 'default', 'updated', 'App\\Models\\Asset', 457, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(806, 'default', 'updated', 'App\\Models\\Asset', 458, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(807, 'default', 'updated', 'App\\Models\\Asset', 459, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(808, 'default', 'updated', 'App\\Models\\Asset', 460, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(809, 'default', 'updated', 'App\\Models\\Asset', 461, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(810, 'default', 'updated', 'App\\Models\\Asset', 462, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(811, 'default', 'updated', 'App\\Models\\Asset', 463, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(812, 'default', 'updated', 'App\\Models\\Asset', 464, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(813, 'default', 'updated', 'App\\Models\\Asset', 465, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(814, 'default', 'updated', 'App\\Models\\Asset', 466, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(815, 'default', 'updated', 'App\\Models\\Asset', 467, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(816, 'default', 'updated', 'App\\Models\\Asset', 468, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(817, 'default', 'updated', 'App\\Models\\Asset', 469, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(818, 'default', 'updated', 'App\\Models\\Asset', 470, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(819, 'default', 'updated', 'App\\Models\\Asset', 471, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(820, 'default', 'updated', 'App\\Models\\Asset', 472, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(821, 'default', 'updated', 'App\\Models\\Asset', 473, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(822, 'default', 'updated', 'App\\Models\\Asset', 474, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(823, 'default', 'updated', 'App\\Models\\Asset', 475, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(824, 'default', 'updated', 'App\\Models\\Asset', 476, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(825, 'default', 'updated', 'App\\Models\\Asset', 477, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(826, 'default', 'updated', 'App\\Models\\Asset', 478, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(827, 'default', 'updated', 'App\\Models\\Asset', 479, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(828, 'default', 'updated', 'App\\Models\\Asset', 480, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(829, 'default', 'updated', 'App\\Models\\Asset', 481, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(830, 'default', 'updated', 'App\\Models\\Asset', 482, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(831, 'default', 'updated', 'App\\Models\\Asset', 483, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(832, 'default', 'updated', 'App\\Models\\Asset', 484, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(833, 'default', 'updated', 'App\\Models\\Asset', 485, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(834, 'default', 'updated', 'App\\Models\\Asset', 486, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(835, 'default', 'updated', 'App\\Models\\Asset', 487, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(836, 'default', 'updated', 'App\\Models\\Asset', 488, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(837, 'default', 'updated', 'App\\Models\\Asset', 489, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(838, 'default', 'updated', 'App\\Models\\Asset', 490, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(839, 'default', 'updated', 'App\\Models\\Asset', 491, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:41', '2026-05-19 19:44:41'),
(840, 'default', 'updated', 'App\\Models\\Asset', 492, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(841, 'default', 'updated', 'App\\Models\\Asset', 493, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(842, 'default', 'updated', 'App\\Models\\Asset', 494, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(843, 'default', 'updated', 'App\\Models\\Asset', 495, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(844, 'default', 'updated', 'App\\Models\\Asset', 496, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(845, 'default', 'updated', 'App\\Models\\Asset', 497, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(846, 'default', 'updated', 'App\\Models\\Asset', 498, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(847, 'default', 'updated', 'App\\Models\\Asset', 499, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(848, 'default', 'updated', 'App\\Models\\Asset', 500, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(849, 'default', 'updated', 'App\\Models\\Asset', 501, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(850, 'default', 'updated', 'App\\Models\\Asset', 502, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(851, 'default', 'updated', 'App\\Models\\Asset', 503, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(852, 'default', 'updated', 'App\\Models\\Asset', 504, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(853, 'default', 'updated', 'App\\Models\\Asset', 505, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(854, 'default', 'updated', 'App\\Models\\Asset', 506, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(855, 'default', 'updated', 'App\\Models\\Asset', 507, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(856, 'default', 'updated', 'App\\Models\\Asset', 508, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(857, 'default', 'updated', 'App\\Models\\Asset', 509, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(858, 'default', 'updated', 'App\\Models\\Asset', 510, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(859, 'default', 'updated', 'App\\Models\\Asset', 511, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(860, 'default', 'updated', 'App\\Models\\Asset', 512, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(861, 'default', 'updated', 'App\\Models\\Asset', 513, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(862, 'default', 'updated', 'App\\Models\\Asset', 514, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(863, 'default', 'updated', 'App\\Models\\Asset', 515, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(864, 'default', 'updated', 'App\\Models\\Asset', 516, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(865, 'default', 'updated', 'App\\Models\\Asset', 517, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(866, 'default', 'updated', 'App\\Models\\Asset', 518, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(867, 'default', 'updated', 'App\\Models\\Asset', 519, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(868, 'default', 'updated', 'App\\Models\\Asset', 520, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(869, 'default', 'updated', 'App\\Models\\Asset', 521, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(870, 'default', 'updated', 'App\\Models\\Asset', 522, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(871, 'default', 'updated', 'App\\Models\\Asset', 523, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(872, 'default', 'updated', 'App\\Models\\Asset', 524, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(873, 'default', 'updated', 'App\\Models\\Asset', 525, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(874, 'default', 'updated', 'App\\Models\\Asset', 526, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(875, 'default', 'updated', 'App\\Models\\Asset', 527, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(876, 'default', 'updated', 'App\\Models\\Asset', 528, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(877, 'default', 'updated', 'App\\Models\\Asset', 529, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(878, 'default', 'updated', 'App\\Models\\Asset', 530, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(879, 'default', 'updated', 'App\\Models\\Asset', 531, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(880, 'default', 'updated', 'App\\Models\\Asset', 532, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(881, 'default', 'updated', 'App\\Models\\Asset', 533, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(882, 'default', 'updated', 'App\\Models\\Asset', 534, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(883, 'default', 'updated', 'App\\Models\\Asset', 535, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(884, 'default', 'updated', 'App\\Models\\Asset', 536, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(885, 'default', 'updated', 'App\\Models\\Asset', 537, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(886, 'default', 'updated', 'App\\Models\\Asset', 538, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(887, 'default', 'updated', 'App\\Models\\Asset', 539, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(888, 'default', 'updated', 'App\\Models\\Asset', 540, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(889, 'default', 'updated', 'App\\Models\\Asset', 541, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(890, 'default', 'updated', 'App\\Models\\Asset', 542, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(891, 'default', 'updated', 'App\\Models\\Asset', 543, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(892, 'default', 'updated', 'App\\Models\\Asset', 544, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(893, 'default', 'updated', 'App\\Models\\Asset', 545, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(894, 'default', 'updated', 'App\\Models\\Asset', 546, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(895, 'default', 'updated', 'App\\Models\\Asset', 547, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(896, 'default', 'updated', 'App\\Models\\Asset', 548, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(897, 'default', 'updated', 'App\\Models\\Asset', 549, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42');
INSERT INTO `activity_log` (`id`, `log_name`, `description`, `subject_type`, `subject_id`, `event`, `causer_type`, `causer_id`, `attribute_changes`, `properties`, `created_at`, `updated_at`) VALUES
(898, 'default', 'updated', 'App\\Models\\Asset', 550, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(899, 'default', 'updated', 'App\\Models\\Asset', 551, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(900, 'default', 'updated', 'App\\Models\\Asset', 552, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(901, 'default', 'updated', 'App\\Models\\Asset', 553, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(902, 'default', 'updated', 'App\\Models\\Asset', 554, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(903, 'default', 'updated', 'App\\Models\\Asset', 555, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:42', '2026-05-19 19:44:42'),
(904, 'default', 'updated', 'App\\Models\\Asset', 556, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:43', '2026-05-19 19:44:43'),
(905, 'default', 'updated', 'App\\Models\\Asset', 557, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:43', '2026-05-19 19:44:43'),
(906, 'default', 'updated', 'App\\Models\\Asset', 558, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:43', '2026-05-19 19:44:43'),
(907, 'default', 'updated', 'App\\Models\\Asset', 559, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:43', '2026-05-19 19:44:43'),
(908, 'default', 'updated', 'App\\Models\\Asset', 560, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:43', '2026-05-19 19:44:43'),
(909, 'default', 'updated', 'App\\Models\\Asset', 561, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:43', '2026-05-19 19:44:43'),
(910, 'default', 'updated', 'App\\Models\\Asset', 562, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:43', '2026-05-19 19:44:43'),
(911, 'default', 'updated', 'App\\Models\\Asset', 563, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:43', '2026-05-19 19:44:43'),
(912, 'default', 'updated', 'App\\Models\\Asset', 564, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:43', '2026-05-19 19:44:43'),
(913, 'default', 'updated', 'App\\Models\\Asset', 565, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:43', '2026-05-19 19:44:43'),
(914, 'default', 'updated', 'App\\Models\\Asset', 566, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:43', '2026-05-19 19:44:43'),
(915, 'default', 'updated', 'App\\Models\\Asset', 567, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:43', '2026-05-19 19:44:43'),
(916, 'default', 'updated', 'App\\Models\\Asset', 568, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:43', '2026-05-19 19:44:43'),
(917, 'default', 'updated', 'App\\Models\\Asset', 569, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:43', '2026-05-19 19:44:43'),
(918, 'default', 'updated', 'App\\Models\\Asset', 570, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:44:43', '2026-05-19 19:44:43'),
(919, 'default', 'updated', 'App\\Models\\Asset', 335, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(920, 'default', 'updated', 'App\\Models\\Asset', 336, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(921, 'default', 'updated', 'App\\Models\\Asset', 337, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(922, 'default', 'updated', 'App\\Models\\Asset', 338, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(923, 'default', 'updated', 'App\\Models\\Asset', 341, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(924, 'default', 'updated', 'App\\Models\\Asset', 342, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(925, 'default', 'updated', 'App\\Models\\Asset', 343, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(926, 'default', 'updated', 'App\\Models\\Asset', 344, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(927, 'default', 'updated', 'App\\Models\\Asset', 345, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(928, 'default', 'updated', 'App\\Models\\Asset', 346, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(929, 'default', 'updated', 'App\\Models\\Asset', 347, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(930, 'default', 'updated', 'App\\Models\\Asset', 348, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(931, 'default', 'updated', 'App\\Models\\Asset', 350, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(932, 'default', 'updated', 'App\\Models\\Asset', 351, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(933, 'default', 'updated', 'App\\Models\\Asset', 352, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(934, 'default', 'updated', 'App\\Models\\Asset', 353, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(935, 'default', 'updated', 'App\\Models\\Asset', 390, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(936, 'default', 'updated', 'App\\Models\\Asset', 391, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(937, 'default', 'updated', 'App\\Models\\Asset', 392, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(938, 'default', 'updated', 'App\\Models\\Asset', 393, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(939, 'default', 'updated', 'App\\Models\\Asset', 395, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(940, 'default', 'updated', 'App\\Models\\Asset', 396, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(941, 'default', 'updated', 'App\\Models\\Asset', 397, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(942, 'default', 'updated', 'App\\Models\\Asset', 398, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(943, 'default', 'updated', 'App\\Models\\Asset', 485, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(944, 'default', 'updated', 'App\\Models\\Asset', 486, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(945, 'default', 'updated', 'App\\Models\\Asset', 487, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(946, 'default', 'updated', 'App\\Models\\Asset', 488, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(947, 'default', 'updated', 'App\\Models\\Asset', 496, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(948, 'default', 'updated', 'App\\Models\\Asset', 497, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(949, 'default', 'updated', 'App\\Models\\Asset', 498, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(950, 'default', 'updated', 'App\\Models\\Asset', 499, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(951, 'default', 'updated', 'App\\Models\\Asset', 500, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(952, 'default', 'updated', 'App\\Models\\Asset', 501, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(953, 'default', 'updated', 'App\\Models\\Asset', 502, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(954, 'default', 'updated', 'App\\Models\\Asset', 503, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(955, 'default', 'updated', 'App\\Models\\Asset', 561, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(956, 'default', 'updated', 'App\\Models\\Asset', 562, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(957, 'default', 'updated', 'App\\Models\\Asset', 563, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(958, 'default', 'updated', 'App\\Models\\Asset', 564, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(959, 'default', 'updated', 'App\\Models\\Asset', 565, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(960, 'default', 'updated', 'App\\Models\\Asset', 566, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(961, 'default', 'updated', 'App\\Models\\Asset', 567, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(962, 'default', 'updated', 'App\\Models\\Asset', 568, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(963, 'default', 'updated', 'App\\Models\\Asset', 569, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(964, 'default', 'updated', 'App\\Models\\Asset', 570, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:46:28', '2026-05-19 19:46:28'),
(965, 'default', 'updated', 'App\\Models\\Asset', 396, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:47:15', '2026-05-19 19:47:15'),
(966, 'default', 'updated', 'App\\Models\\Asset', 397, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:47:15', '2026-05-19 19:47:15'),
(967, 'default', 'updated', 'App\\Models\\Asset', 398, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:47:15', '2026-05-19 19:47:15'),
(968, 'default', 'updated', 'App\\Models\\Asset', 565, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:47:16', '2026-05-19 19:47:16'),
(969, 'default', 'updated', 'App\\Models\\Asset', 566, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:47:16', '2026-05-19 19:47:16'),
(970, 'default', 'updated', 'App\\Models\\Asset', 567, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 0}}', '[]', '2026-05-19 19:47:16', '2026-05-19 19:47:16'),
(971, 'default', 'updated', 'App\\Models\\Asset', 7, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 3245.5, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 3245.5, \"current_km\": 0}}', '[]', '2026-05-19 19:56:16', '2026-05-19 19:56:16'),
(972, 'default', 'updated', 'App\\Models\\Asset', 8, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 5120, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 5120, \"current_km\": 0}}', '[]', '2026-05-19 19:56:16', '2026-05-19 19:56:16'),
(973, 'default', 'updated', 'App\\Models\\Asset', 9, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 48520.5}, \"attributes\": {\"status\": \"active\", \"current_hm\": 0, \"current_km\": 48520.5}}', '[]', '2026-05-19 19:56:16', '2026-05-19 19:56:16'),
(974, 'default', 'updated', 'App\\Models\\Asset', 10, 'updated', NULL, NULL, '{\"old\": {\"status\": \"maintenance\", \"current_hm\": 7890, \"current_km\": 0}, \"attributes\": {\"status\": \"maintenance\", \"current_hm\": 7890, \"current_km\": 0}}', '[]', '2026-05-19 19:56:16', '2026-05-19 19:56:16'),
(975, 'default', 'updated', 'App\\Models\\Asset', 11, 'updated', NULL, NULL, '{\"old\": {\"status\": \"active\", \"current_hm\": 2100, \"current_km\": 0}, \"attributes\": {\"status\": \"active\", \"current_hm\": 2100, \"current_km\": 0}}', '[]', '2026-05-19 19:56:16', '2026-05-19 19:56:16'),
(976, 'default', 'updated', 'App\\Models\\User', 7, 'updated', NULL, NULL, '{\"old\": {\"name\": \"Super Admin TAPG\", \"email\": \"superadmin@tapg.local\", \"is_active\": true}, \"attributes\": {\"name\": \"Super Admin TAPG\", \"email\": \"superadmin@tapg.local\", \"is_active\": true}}', '[]', '2026-05-19 22:29:24', '2026-05-19 22:29:24'),
(977, 'default', 'updated', 'App\\Models\\User', 8, 'updated', NULL, NULL, '{\"old\": {\"name\": \"Admin TAPG\", \"email\": \"admin@tapg.local\", \"is_active\": true}, \"attributes\": {\"name\": \"Admin TAPG\", \"email\": \"admin@tapg.local\", \"is_active\": true}}', '[]', '2026-05-19 22:29:24', '2026-05-19 22:29:24'),
(978, 'default', 'updated', 'App\\Models\\User', 9, 'updated', NULL, NULL, '{\"old\": {\"name\": \"Budi Supervisor\", \"email\": \"supervisor@tapg.local\", \"is_active\": true}, \"attributes\": {\"name\": \"Budi Supervisor\", \"email\": \"supervisor@tapg.local\", \"is_active\": true}}', '[]', '2026-05-19 22:29:24', '2026-05-19 22:29:24'),
(979, 'default', 'updated', 'App\\Models\\User', 10, 'updated', NULL, NULL, '{\"old\": {\"name\": \"Andi Mechanic\", \"email\": \"mechanic@tapg.local\", \"is_active\": true}, \"attributes\": {\"name\": \"Andi Mechanic\", \"email\": \"mechanic@tapg.local\", \"is_active\": true}}', '[]', '2026-05-19 22:29:24', '2026-05-19 22:29:24'),
(980, 'default', 'updated', 'App\\Models\\User', 11, 'updated', NULL, NULL, '{\"old\": {\"name\": \"Doni Operator\", \"email\": \"operator@tapg.local\", \"is_active\": true}, \"attributes\": {\"name\": \"Doni Operator\", \"email\": \"operator@tapg.local\", \"is_active\": true}}', '[]', '2026-05-19 22:29:24', '2026-05-19 22:29:24'),
(981, 'default', 'updated', 'App\\Models\\User', 12, 'updated', NULL, NULL, '{\"old\": {\"name\": \"Viewer TAPG\", \"email\": \"viewer@tapg.local\", \"is_active\": true}, \"attributes\": {\"name\": \"Viewer TAPG\", \"email\": \"viewer@tapg.local\", \"is_active\": true}}', '[]', '2026-05-19 22:29:24', '2026-05-19 22:29:24'),
(982, 'default', 'created', 'App\\Models\\WorkOrder', 10, 'created', 'App\\Models\\User', 8, '{\"attributes\": {\"status\": \"draft\", \"actual_cost\": null, \"approved_by\": null}}', '[]', '2026-05-19 23:10:46', '2026-05-19 23:10:46'),
(983, 'default', 'updated', 'App\\Models\\WorkOrder', 10, 'updated', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"draft\", \"actual_cost\": null, \"approved_by\": null}, \"attributes\": {\"status\": \"pending\", \"actual_cost\": null, \"approved_by\": null}}', '[]', '2026-05-19 23:10:49', '2026-05-19 23:10:49'),
(984, 'default', 'updated', 'App\\Models\\WorkOrder', 10, 'updated', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"pending\", \"actual_cost\": null, \"approved_by\": null}, \"attributes\": {\"status\": \"approved\", \"actual_cost\": null, \"approved_by\": 8}}', '[]', '2026-05-19 23:10:56', '2026-05-19 23:10:56'),
(985, 'default', 'updated', 'App\\Models\\WorkOrder', 10, 'updated', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"approved\", \"actual_cost\": null, \"approved_by\": 8}, \"attributes\": {\"status\": \"approved\", \"actual_cost\": null, \"approved_by\": 8}}', '[]', '2026-05-19 23:11:02', '2026-05-19 23:11:02'),
(986, 'default', 'updated', 'App\\Models\\WorkOrder', 10, 'updated', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"approved\", \"actual_cost\": null, \"approved_by\": 8}, \"attributes\": {\"status\": \"in_progress\", \"actual_cost\": null, \"approved_by\": 8}}', '[]', '2026-05-19 23:11:02', '2026-05-19 23:11:02'),
(987, 'default', 'updated', 'App\\Models\\WorkOrder', 10, 'updated', 'App\\Models\\User', 8, '{\"old\": {\"status\": \"in_progress\", \"actual_cost\": null, \"approved_by\": 8}, \"attributes\": {\"status\": \"in_progress\", \"actual_cost\": null, \"approved_by\": 8}}', '[]', '2026-05-19 23:11:10', '2026-05-19 23:11:10');

-- --------------------------------------------------------

--
-- Table structure for table `app_menus`
--

CREATE TABLE `app_menus` (
  `id` bigint UNSIGNED NOT NULL,
  `menu_key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `route` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` text COLLATE utf8mb4_unicode_ci,
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `permission_prefix` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `required_permission` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `app_menus`
--

INSERT INTO `app_menus` (`id`, `menu_key`, `label`, `route`, `icon`, `parent_id`, `sort_order`, `is_active`, `permission_prefix`, `required_permission`, `created_at`, `updated_at`) VALUES
(14, 'dashboard', 'Dashboard', '/dashboard', NULL, NULL, 10, 1, 'dashboard', 'view dashboard', '2026-05-19 22:29:26', '2026-05-19 22:29:26'),
(15, 'assets', 'Asset Management', '/assets', NULL, NULL, 20, 1, 'assets', 'view assets', '2026-05-19 22:29:26', '2026-05-19 22:29:26'),
(16, 'p2h', 'P2H / Checklist', '/p2h', NULL, NULL, 30, 1, 'p2h', 'view p2h', '2026-05-19 22:29:26', '2026-05-19 22:29:26'),
(17, 'work-orders', 'Work Order', '/work-orders', NULL, NULL, 40, 1, 'work-orders', 'view work-orders', '2026-05-19 22:29:26', '2026-05-19 22:29:26'),
(18, 'schedule', 'Jadwal Maintenance', '/schedule', NULL, NULL, 50, 1, 'schedules', 'view schedules', '2026-05-19 22:29:26', '2026-05-19 22:29:26'),
(19, 'inventory', 'Inventory / Parts', '/inventory', NULL, NULL, 60, 1, 'inventory', 'view inventory', '2026-05-19 22:29:26', '2026-05-19 22:29:26'),
(20, 'reports', 'Laporan', '/reports', NULL, NULL, 70, 1, 'reports', 'view reports', '2026-05-19 22:29:26', '2026-05-19 22:29:26'),
(22, 'users', 'User Management', '/users', NULL, NULL, 90, 1, 'users', 'view users', '2026-05-19 22:29:26', '2026-05-19 22:29:26'),
(23, 'settings', 'Pengaturan', '/settings/role-manager', NULL, NULL, 100, 1, 'settings', 'manage settings', '2026-05-19 22:29:26', '2026-05-19 22:29:26'),
(24, 'settings-role-manager', 'Role Manager', '/settings/role-manager', NULL, 23, 1, 1, 'settings.role-manager', 'manage settings', '2026-05-19 22:29:26', '2026-05-19 22:29:26'),
(25, 'settings-smtp', 'SMTP Configuration', '/settings/smtp', NULL, 23, 2, 1, 'settings.smtp', 'manage smtp', '2026-05-19 22:29:26', '2026-05-19 22:29:26'),
(26, 'settings-system', 'System Setting', '/settings/system', NULL, 23, 3, 1, 'settings.system', 'manage system settings', '2026-05-19 22:29:26', '2026-05-19 22:29:26'),
(27, 'workshop-control-tower', 'Workshop Control', '/workshop-control-tower', NULL, NULL, 45, 1, 'work-orders', 'view work-orders', '2026-05-19 22:29:26', '2026-05-19 22:29:26'),
(28, 'monitoring', 'Asset Monitoring', '/monitoring', NULL, NULL, 80, 0, 'monitoring', 'view monitoring', '2026-05-19 22:29:26', '2026-05-19 22:29:26');

-- --------------------------------------------------------

--
-- Table structure for table `app_menu_services`
--

CREATE TABLE `app_menu_services` (
  `id` bigint UNSIGNED NOT NULL,
  `menu_id` bigint UNSIGNED NOT NULL,
  `service_key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `http_method` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `endpoint` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permission_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `app_menu_services`
--

INSERT INTO `app_menu_services` (`id`, `menu_id`, `service_key`, `label`, `http_method`, `endpoint`, `permission_name`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 14, 'dashboard.overview', 'Dashboard Overview', 'GET', '/dashboard/overview', 'view dashboard', 1, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(2, 15, 'assets.list', 'List Assets', 'GET', '/assets', 'view assets', 1, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(3, 15, 'assets.create', 'Create Asset', 'POST', '/assets', 'create assets', 2, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(4, 15, 'assets.update', 'Update Asset', 'PUT', '/assets/{asset}', 'edit assets', 3, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(5, 15, 'assets.delete', 'Delete Asset', 'DELETE', '/assets/{asset}', 'delete assets', 4, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(6, 15, 'assets.import', 'Import Assets', 'POST', '/assets/import', 'import assets', 5, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(7, 15, 'assets.export', 'Export Assets', 'GET', '/assets/export', 'export assets', 6, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(8, 16, 'p2h.list', 'List P2H', 'GET', '/p2h', 'view p2h', 1, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(9, 16, 'p2h.create', 'Create P2H', 'POST', '/p2h', 'create p2h', 2, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(10, 16, 'p2h.review', 'Review P2H', 'PATCH', '/p2h/{p2h}/review', 'review p2h', 3, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(11, 17, 'work-orders.list', 'List Work Orders', 'GET', '/work-orders', 'view work-orders', 1, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(12, 17, 'work-orders.create', 'Create Work Order', 'POST', '/work-orders', 'create work-orders', 2, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(13, 17, 'work-orders.update', 'Update Work Order', 'PUT', '/work-orders/{workOrder}', 'edit work-orders', 3, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(14, 17, 'work-orders.delete', 'Delete Work Order', 'DELETE', '/work-orders/{workOrder}', 'delete work-orders', 4, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(15, 17, 'work-orders.approve', 'Approve Work Order', 'POST', '/work-orders/{workOrder}/approve', 'approve work-orders', 5, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(16, 17, 'work-orders.assign', 'Assign Work Order', 'POST', '/work-orders/{workOrder}/assign', 'assign work-orders', 6, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(17, 17, 'work-orders.execute', 'Execute Work Order Process', 'POST', '/work-orders/{workOrder}/process/*', 'execute work-orders', 7, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(18, 27, 'workshop-control-tower.overview', 'Workshop Control Tower Overview', 'GET', '/workshop-control-tower/overview', 'view work-orders', 1, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(19, 18, 'schedules.list', 'List Schedules', 'GET', '/schedules', 'view schedules', 1, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(20, 18, 'schedules.manage', 'Manage Schedules', 'POST', '/schedules', 'manage schedules', 2, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(21, 19, 'inventory.list', 'List Inventory', 'GET', '/inventory', 'view inventory', 1, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(22, 19, 'inventory.manage', 'Manage Inventory', 'POST', '/inventory/transactions', 'manage inventory', 2, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(23, 20, 'reports.view', 'View Reports', 'POST', '/reports/*', 'view reports', 1, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(24, 20, 'reports.export', 'Export Reports', 'POST', '/reports/*', 'export reports', 2, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(25, 28, 'monitoring.view', 'View Monitoring', 'GET', '/monitoring', 'view monitoring', 1, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(26, 22, 'users.view', 'View Users', 'GET', '/users', 'view users', 1, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(27, 22, 'users.manage', 'Manage Users', 'POST', '/users', 'manage users', 2, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(28, 24, 'settings.role-manager.manage', 'Manage Role Manager', 'PUT', '/settings/roles/{role}', 'manage settings', 1, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(29, 25, 'settings.smtp.manage', 'Manage SMTP Configuration', 'PUT', '/settings/smtp/{id}', 'manage smtp', 1, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27'),
(30, 26, 'settings.system.manage', 'Manage System Settings', 'PUT', '/settings/system/{id}', 'manage system settings', 1, 1, '2026-05-19 22:29:27', '2026-05-19 22:29:27');

-- --------------------------------------------------------

--
-- Table structure for table `assets`
--

CREATE TABLE `assets` (
  `id` bigint UNSIGNED NOT NULL,
  `public_uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `io_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `model` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plant_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plant` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `year` smallint DEFAULT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `status` enum('active','inactive','maintenance','breakdown') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `current_hm` decimal(10,1) NOT NULL DEFAULT '0.0',
  `current_km` decimal(10,1) NOT NULL DEFAULT '0.0',
  `qr_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serial_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chasis_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `engine_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `engine_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sap_asset_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `asset_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plate_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `veh_plate_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assets`
--

INSERT INTO `assets` (`id`, `public_uuid`, `code`, `io_code`, `name`, `brand`, `model`, `company_code`, `plant_code`, `plant`, `year`, `category_id`, `status`, `current_hm`, `current_km`, `qr_code`, `serial_number`, `chasis_no`, `engine_number`, `engine_no`, `sap_asset_no`, `asset_no`, `plate_number`, `veh_plate_no`, `notes`, `photo`, `created_at`, `updated_at`, `deleted_at`) VALUES
(7, 'ee8d627c-e5b6-4025-8118-173d809b7922', 'EXC-001', NULL, 'Excavator CAT 320', 'Caterpillar', '320 GC', NULL, NULL, NULL, 2021, 7, 'active', 3245.5, 0.0, 'TAPG-EXC001', 'CAT320-2021-001', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 05:59:49', '2026-05-19 19:56:16', '2026-05-19 19:27:46'),
(8, '27bbadfd-505a-4509-8332-f3e9347426e0', 'BLD-001', NULL, 'Bulldozer Komatsu D65', 'Komatsu', 'D65EX-18', NULL, NULL, NULL, 2020, 8, 'active', 5120.0, 0.0, 'TAPG-BLD001', 'KOM-D65-2020-001', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 05:59:49', '2026-05-19 19:56:16', '2026-05-19 19:27:50'),
(9, 'e6353414-95ee-4953-be8a-8553d06cc856', 'DMP-001', NULL, 'Dump Truck Hino FR', 'Hino', 'FR 500JD', NULL, NULL, NULL, 2022, 9, 'active', 0.0, 48520.5, 'TAPG-DMP001', 'HINO-FR-2022-001', NULL, NULL, NULL, NULL, NULL, 'B 1234 XYZ', NULL, NULL, NULL, '2026-05-19 05:59:49', '2026-05-19 19:56:16', '2026-05-19 19:27:55'),
(10, '3d3c8391-9d44-4102-9465-43defb8889d2', 'GRD-001', NULL, 'Motor Grader Volvo G940', 'Volvo', 'G940', NULL, NULL, NULL, 2019, 10, 'maintenance', 7890.0, 0.0, 'TAPG-GRD001', 'VOLVO-G940-2019-001', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 05:59:49', '2026-05-19 19:56:16', '2026-05-19 19:27:59'),
(11, '2871066c-2afd-45b7-8a00-7ab0133cb939', 'CRN-001', NULL, 'Crawler Crane Liebherr LR1100', 'Liebherr', 'LR 1100', NULL, NULL, NULL, 2020, 11, 'active', 2100.0, 0.0, 'TAPG-CRN001', 'LIEB-LR1100-2020-001', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 05:59:49', '2026-05-19 19:56:16', '2026-05-19 19:28:03'),
(292, '031f3cb1-cd33-45f6-9101-ab5cd3155dac', 'O6321AR001', 'O6321AR001', 'DUMP TRUCK HINO DUTRO ARM ROLL D130', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-QMTWOD5R', 'MJEC1JG43K5187902', 'MJEC1JG43K5187902', 'W04DTRR77347', 'W04DTRR77347', NULL, NULL, 'KT 8449 NP', 'KT 8449 NP', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(293, '5d36f96b-7141-47da-a995-27ca0d5ea00a', 'O6321AR002', 'O6321AR002', 'DUMP TRUCK HINO DUTRO ARM ROLL D130', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-WIMYQP5D', 'MJEC1JG43K5187903', 'MJEC1JG43K5187903', 'W04DTRR77348', 'W04DTRR77348', NULL, NULL, 'KT 8443 NP', 'KT 8443 NP', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(294, '24e20fc5-09cd-453a-ba83-ed41a4ffc8f3', 'O6321AR003', 'O6321AR003', 'DUMP TRUCK HINO DUTRO ARM ROLL D130', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-0VVEWCFX', 'MJEC1JG43K5187904', 'MJEC1JG43K5187904', 'W04DTRR77349', 'W04DTRR77349', NULL, NULL, 'KT 8447 NP', 'KT 8447 NP', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(295, 'd8bc39a1-8af4-4b59-8908-f7c55c2012a4', 'O6321BL001', 'O6321BL001', 'Backhoe Loader', NULL, NULL, '63', '6321', '6321', NULL, 15, 'active', 0.0, 0.0, 'TAPG-U2HBZJ4Y', '6 SV29 - 20480', '6 SV29 - 20480', 'RJ 38105 * R 000890', 'RJ 38105 * R 000890', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(296, '58e05bc1-83a6-4552-b09f-ff5c4a0ffe4f', 'O6321BS004', 'O6321BS004', 'Bus Sekolah', NULL, NULL, '63', '6321', '6321', NULL, 16, 'active', 0.0, 0.0, 'TAPG-EFN8F0F3', 'MJEC1JG43C5063457', 'MJEC1JG43C5063457', 'OE04DTRJ65354', 'OE04DTRJ65354', NULL, NULL, 'B 7153 UDA', 'B 7153 UDA', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(297, '599e1a71-ca4d-4894-9f9f-9dc0c71579ac', 'O6321DT001', 'O6321DT001', 'Dump Truck 1', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-FB9ZXRP1', 'JKT723176', 'JKT723176', '4 D 34 T 870520', '4 D 34 T 870520', NULL, NULL, 'B 9847 ZG', 'B 9847 ZG', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(298, '49c52162-cd4c-48fb-bd0a-0b060eb155dd', 'O6321DT002', 'O6321DT002', 'Dump Truck 2', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-KP9LCROE', 'JKT732429', 'JKT732429', '4 D 43 TDX 5148', '4 D 43 TDX 5148', NULL, NULL, 'B 9372 FH', 'B 9372 FH', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(299, '31f2f2ec-0db6-4972-b96e-988190410d24', 'O6321DT003', 'O6321DT003', 'Dump Truck 3', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-KKXBGVLH', 'MJEC1JG43C5051581', 'MJEC1JG43C5051581', 'W04DTRJ54543', 'W04DTRJ54543', NULL, NULL, 'B 9379 UDC', 'B 9379 UDC', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(300, '8286e1b9-84f0-4194-a380-cf6d7952ab96', 'O6321DT005', 'O6321DT005', 'Dump Truck 5', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-1PQND6UX', 'MJEC1JG43C5050617', 'MJEC1JG43C5050617', 'W04DTRJ53554', 'W04DTRJ53554', NULL, NULL, 'B 9361 UDC', 'B 9361 UDC', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(301, 'a00a2d63-aed4-43c3-ab1c-a776f00b5d92', 'O6321DT009', 'O6321DT009', 'Dump Truck 9', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-NEWIX7AV', 'MJEC1JG43D5098142', 'MJEC1JG43D5098142', 'W04DTRJ93154', 'W04DTRJ93154', NULL, NULL, 'B 9189 UDD', 'B 9189 UDD', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(302, '550cb8ed-f08b-4352-8536-17147ef5dfd2', 'O6321DT015', 'O6321DT015', 'Dump Truck 15', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-CQXFQXAG', 'MJEC1JG43E5109714', 'MJEC1JG43E5109714', 'W04DTRR09236', 'W04DTRR09236', NULL, NULL, 'B 9541 UDE', 'B 9541 UDE', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(303, '89c7af79-8cb3-4e45-9f53-bab115ddd930', 'O6321DT016', 'O6321DT016', 'Dump Truck 16', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-DFQKTRBA', 'MJEC1JG43E5107107', 'MJEC1JG43E5107107', 'W04DTRR06653', 'W04DTRR06653', NULL, NULL, 'B 9542 UDE', 'B 9542 UDE', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(304, '9900f39a-d371-4a1b-8225-1e2426da988e', 'O6321DT022', 'O6321DT022', 'Dump Truck 22', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-3FU5WBPQ', 'MJEC1JG43H5161732', 'MJEC1JG43H5161732', 'W04DTRR52263', 'W04DTRR52263', '40100235', '40100235', 'KT 8027 YX', 'KT 8027 YX', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(305, '813fb5bd-8767-4d76-9135-a6f5b847acd0', 'O6321DT030', 'O6321DT030', 'Dump Truck 30', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-LIHW4Z4H', '161020', '161020', '51571', '51571', '40100240', '40100240', 'O6321DT030', 'O6321DT030', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(306, 'bc649dce-30a2-4229-92dd-a4931275ed8d', 'O6321DT031', 'O6321DT031', 'Dump Truck 31', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-WHZQAARP', '160450', '160450', '50956', '50956', NULL, NULL, 'O6321DT031', 'O6321DT031', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(307, '47ea8fd4-2311-4fb2-9f1e-9fadca416c4e', 'O6321DT037', 'O6321DT037', 'Dump Truck 37', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-NKR4BWHO', '161627', '161627', '52193', '52193', '40100242', '40100242', 'O6321DT037', 'O6321DT037', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(308, '3c5f0cd5-87d3-46df-b5d7-0390adaa6dd9', 'O6321DT040', 'O6321DT040', 'Dump Truck 40', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-AEMKLIPA', '161043', '161043', '51594', '51594', '40100239', '40100239', 'O6321DT040', 'O6321DT040', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(309, '7509aaa7-41b3-4688-b55a-cb951ce94f48', 'O6321DT041', 'O6321DT041', 'Dump Truck 41', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-WQ1W2ZUR', '161629', '161629', '52195', '52195', '40100238', '40100238', 'O6321DT041', 'O6321DT041', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(310, 'be39621e-5589-4ae9-bf4e-2ffcfb3c57ed', 'O6321DT042', 'O6321DT042', 'Dump Truck 42', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-FENENJDU', '160399', '160399', '50881', '50881', NULL, NULL, 'O6321DT042', 'O6321DT042', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(311, '27e5589a-a83e-47b0-a43f-0a38c979d9d7', 'O6321DT044', 'O6321DT044', 'Dump Truck 44', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-VLGP5TLZ', '161015', '161015', '51551', '51551', '40100241', '40100241', 'O6321DT044', 'O6321DT044', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(312, 'd69bd7ca-7ab3-45c7-bb69-1a81187ffcaf', 'O6321DT046', 'O6321DT046', 'Dump Truck 46', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-U23LWA8A', '160363', '160363', '50874', '50874', NULL, NULL, 'O6321DT044', 'O6321DT044', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(313, '27075612-f953-4f79-ada3-e655965c547a', 'O6321DT047', 'O6321DT047', 'DUM TRUCK HINO DT 130 HD PS', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-EUJ3DVA8', 'MJEC1JG43H161630', 'MJEC1JG43H161630', 'W04DTRR 52201', 'W04DTRR 52201', '40100237', '40100237', 'KT 8052 YX', 'KT 8052 YX', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(314, 'b1959665-236c-45cd-b9ae-e353407f5cd3', 'O6321DT048', 'O6321DT048', 'DUM TRUCK HINO DT 130 HD PS', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-FZKORIKS', 'MJEC1JG43H161631', 'MJEC1JG43H161631', 'W04DTRR 52202', 'W04DTRR 52202', '40100236', '40100236', 'KT 8053 YX', 'KT 8053 YX', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(315, '3e256fca-2ed7-4d3f-a620-a841d99643b5', 'O6321DT049', 'O6321DT049', 'DUM TRUCK HINO DT 130 HD PS', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-INEP3THK', 'MJEC1JG43H159860', 'MJEC1JG43H159860', 'W04DTRR 50236', 'W04DTRR 50236', NULL, NULL, 'KT 8054 YX', 'KT 8054 YX', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(316, '61ec6c9a-c9db-4a37-a347-4885fc1879ce', 'O6321DT061', 'O6321DT061', 'DUMP TRUCK HINO DUTRO 130HD 6.4PS INT', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-6NXN64AN', 'MJEC1JG43C5051499', 'MJEC1JG43C5051499', 'W04DTRJ54376', 'W04DTRJ54376', NULL, NULL, 'B 9421 PDB', 'B 9421 PDB', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(317, '032daec2-2924-4390-9075-ebd7eb93b5b4', 'O6321DT062', 'O6321DT062', 'DUMP TRUCK HINO DUTRO 130HD 6.4PS INT', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-JEQU00E8', 'MJEC1JG43C5051498', 'MJEC1JG43C5051498', 'WO4DTRJ54375', 'WO4DTRJ54375', NULL, NULL, 'B 9422 PDB', 'B 9422 PDB', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(318, 'daea5442-0723-451f-a14e-99e96130bf0a', 'O6321DT065', 'O6321DT065', 'DUMP TRUCK HINO DUTRO D130HD-INT', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-LMG9IDW6', 'MJEC1JG43J5172167', 'MJEC1JG43J5172167', 'W04DTRR61843', 'W04DTRR61843', NULL, NULL, 'KT 8381 NM', 'KT 8381 NM', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(319, 'be0df5c1-171b-4130-846b-b5414f943375', 'O6321DZ001', 'O6321DZ001', 'Bull Dozer 1', NULL, NULL, '63', '6321', '6321', NULL, 8, 'active', 0.0, 0.0, 'TAPG-AKQGUSS7', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(320, 'e5ea85cc-a019-42f2-8ee3-e6c131b27d8b', 'O6321DZ002', 'O6321DZ002', 'XBull Dozer 2', NULL, NULL, '63', '6321', '6321', NULL, 8, 'active', 0.0, 0.0, 'TAPG-VVYEFBCL', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(321, '96b53f36-001e-4329-90b3-3753a3daa647', 'O6321DZ003', 'O6321DZ003', 'DOZER D-85 SS', NULL, NULL, '63', '6321', '6321', NULL, 8, 'active', 0.0, 0.0, 'TAPG-K0REBEGY', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(322, 'ce33be8f-9f17-4c0c-a851-8cc3be1f623b', 'O6321EX002', 'O6321EX002', 'EXCAVATOR 01 COBELCO PC 48', NULL, NULL, '63', '6321', '6321', NULL, 7, 'active', 0.0, 0.0, 'TAPG-HY6QKGBZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(323, '7f8ca8fc-3ce2-42cc-bfae-fe665b65525f', 'O6321EX003', 'O6321EX003', 'EXCAVATOR 02 HITACHI PC 210', NULL, NULL, '63', '6321', '6321', NULL, 7, 'active', 0.0, 0.0, 'TAPG-CXLUBCNH', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(324, 'eaa22c20-3493-4218-bd7f-cdc06ac3d842', 'O6321EX004', 'O6321EX004', 'EXCAVATOR 03 HITACHI PC 210', NULL, NULL, '63', '6321', '6321', NULL, 7, 'active', 0.0, 0.0, 'TAPG-Q5RCHVJD', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:38', NULL),
(325, 'b64c972d-2d9f-49b7-bb33-27ebda78e84e', 'O6321EX005', 'O6321EX005', 'EXCAVATOR 04 COBELCO PC 200', NULL, NULL, '63', '6321', '6321', NULL, 7, 'active', 0.0, 0.0, 'TAPG-V75TWDS9', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:39', NULL),
(326, '539e8acc-98bd-4321-b003-69604d347726', 'O6321EX006', 'O6321EX006', 'EXCAVATOR 05 HITACHI PC 210', NULL, NULL, '63', '6321', '6321', NULL, 7, 'active', 0.0, 0.0, 'TAPG-DVOW1KQC', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:39', NULL),
(327, 'a9737bdb-20d7-407a-9387-90d3e97ccc2c', 'O6321EX007', 'O6321EX007', 'EXCAVATOR 06 KOMATSU PC 200', NULL, NULL, '63', '6321', '6321', NULL, 7, 'active', 0.0, 0.0, 'TAPG-PFTTBI1U', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:39', NULL),
(328, '76a8fe52-7af9-435e-9d92-589cd35dc2d7', 'O6321EX008', 'O6321EX008', 'EXCAVATOR PC 50 (Unit Rental)', NULL, NULL, '63', '6321', '6321', NULL, 7, 'active', 0.0, 0.0, 'TAPG-E0BGR9N9', 'HCMAEA90L00032750', 'HCMAEA90L00032750', '729630-515500101', '729630-515500101', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:39', NULL),
(329, '06e31acc-4636-48e1-96b4-e8b46573b1e8', 'O6321EX015', 'O6321EX015', 'EXCAVATOR MINI KOMATSU PC45MR-3', NULL, NULL, '63', '6321', '6321', NULL, 7, 'active', 0.0, 0.0, 'TAPG-TQHXGKBG', 'KMTPC207CNE007906', 'KMTPC207CNE007906', '4D88E6BPDA-43250', '4D88E6BPDA-43250', '40300013', '40300013', NULL, NULL, NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:39', NULL),
(330, 'f987cdf4-6ae1-43f6-9b7a-10e16ec5eaa2', 'O6321005', 'O6321005', 'TRACTOR QUICK TRUCK QT-14E', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-JQ2Y7XSE', 'D2300018CGC2', 'D2300018CGC2', 'KI ANJ1722', 'KI ANJ1722', '40100167', '40100167', 'O6321005', 'O6321005', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:39', NULL),
(331, '2d30e8d6-2377-4e14-ad65-b1616a7961ce', 'O6321009', 'O6321009', 'TRACTOR QUICK TRUCK QT-14E', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-SCQMBYCC', 'D2300033CGC2', 'D2300033CGC2', 'KI ANJ1732', 'KI ANJ1732', '40100171', '40100171', 'O6321009', 'O6321009', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:39', NULL),
(332, 'd7b6eb23-65d4-4229-b235-fce331ea17c8', 'O6321014', 'O6321014', 'MINI TRACTOR MF2615-4WD 47 HP', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-5TLVV4NU', 'MEA6054DYN1391370', 'MEA6054DYN1391370', 'S325M83359', 'S325M83359', '40100180', '40100180', 'O6321014', 'O6321014', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:39', NULL),
(333, '9f35f288-fd07-42dc-90c6-32b0167c3ecd', 'O6321GD001', 'O6321GD001', 'Motor Greader  1', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-JLI00HHB', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:39', NULL),
(334, '0231be95-4c52-4013-b0a0-df5cb7363ec4', 'O6321GD002', 'O6321GD002', 'Motor Greader  2', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-W1QAQIXW', 'KMTGD005E01013350', 'KMTGD005E01013350', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:39', NULL),
(335, '1414e0e4-d5a7-4b1e-b738-989ab7203191', 'O6321GD003', 'O6321GD003', 'GRADER 01 G 511 A', NULL, NULL, '63', '6321', '6321', NULL, 10, 'active', 0.0, 0.0, 'TAPG-GUL0UGNR', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:46:27', NULL),
(336, '09c252e1-d9b9-4e27-80bf-461a4f9ad8a9', 'O6321GD004', 'O6321GD004', 'GRADER 02 G 511 A', NULL, NULL, '63', '6321', '6321', NULL, 10, 'active', 0.0, 0.0, 'TAPG-32JFLGE4', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:46:27', NULL),
(337, '4260d386-e899-4052-8b42-87dee3c861ba', 'O6321GD005', 'O6321GD005', 'GRADER 03 G 511 A', NULL, NULL, '63', '6321', '6321', NULL, 10, 'active', 0.0, 0.0, 'TAPG-XUT9TP9T', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:46:27', NULL),
(338, 'e9f447c9-387f-4a89-bef1-666e4a2898f5', 'O6321GD099', 'O6321GD099', 'MOTOR GRADER KOMATSU GD511A (EXTERNAL)', NULL, NULL, '63', '6321', '6321', NULL, 10, 'active', 0.0, 0.0, 'TAPG-LQCUO60F', 'KMTGD005VHXJ21096', 'KMTGD005VHXJ21096', '620731JK00', '620731JK00', NULL, NULL, 'O6321GD099', 'O6321GD099', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:46:27', NULL),
(339, 'd4012a4b-b9be-48fa-9dff-bb56649fe1c1', 'O6321MB001', 'O6321MB001', 'Mobil Roda 4 B 9183 UAB', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-YO9A0ZQX', 'B 9183 UAB', 'B 9183 UAB', NULL, NULL, '40100007', '40100007', 'B 9183 UAB', 'B 9183 UAB', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:39', NULL),
(340, 'e8d682ed-33c9-417a-b85b-315face63a8c', 'O6321MB002', 'O6321MB002', 'Mobil Roda 4 KT 8921 GA', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-8QC8YGMX', NULL, NULL, NULL, NULL, NULL, NULL, 'KT 8921 GA', 'KT 8921 GA', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:44:39', NULL),
(341, 'f58ffa22-8c5a-43bd-9b2c-0d47a80499d7', 'O6321MB003', 'O6321MB003', 'TOYOTA HILUX EKSTRA CABIN', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-ZJXATUTI', NULL, NULL, NULL, NULL, NULL, NULL, 'KT 8055 RM', 'KT 8055 RM', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:46:27', NULL),
(342, '590caf3d-c6f5-4d2f-85fe-67031e04c93f', 'O6321MB004', 'O6321MB004', 'MITSUBISHI TRITON', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-C0AIVWA4', NULL, NULL, NULL, NULL, NULL, NULL, 'KT 8121 GC', 'KT 8121 GC', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:46:27', NULL),
(343, 'c8f9df3f-0604-49c2-9e01-3b3724e49c4c', 'O6321MB005', 'O6321MB005', 'MITSUBISHI PAJERO', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-5BLHPLLA', NULL, NULL, NULL, NULL, NULL, NULL, 'KT 1652 YN', 'KT 1652 YN', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:46:27', NULL),
(344, '056a2212-3b4a-42d3-9c5e-835bfcc3fbfb', 'O6321MB006', 'O6321MB006', 'MITSUBISHI STRADA DOUBLE CABIN', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-5LA3SX0X', NULL, NULL, NULL, NULL, NULL, NULL, 'KT 8682 LV', 'KT 8682 LV', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:46:27', NULL),
(345, '0f5c2785-1949-4a24-8f07-783b0c21d217', 'O6321MB007', 'O6321MB007', 'TOYOTA HILUX DOUBLE CABIN', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-CVXGFXXD', NULL, NULL, NULL, NULL, NULL, NULL, 'KT 8092 XD', 'KT 8092 XD', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:46:27', NULL),
(346, 'a897be2f-4943-49a4-a992-0b91aa6f9ca4', 'O6321MB008', 'O6321MB008', 'TOYOTA HILUX DOUBLE CABIN', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-FFYLNOUI', NULL, NULL, NULL, NULL, NULL, NULL, 'L 9531 WC', 'L 9531 WC', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:46:27', NULL),
(347, '45011146-7432-49bd-bb7c-32c41fa79c00', 'O6321MB009', 'O6321MB009', 'TOYOTA HILUX EKSTRA CABIN', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-MGWYKWCH', NULL, NULL, NULL, NULL, NULL, NULL, 'KT 8014 RI', 'KT 8014 RI', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:46:27', NULL),
(348, '1a30b166-6284-44f8-b856-50ee8cbddd5b', 'O6321MB010', 'O6321MB010', 'TOYOTA HILUX EKSTRA CABIN', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-ALG8DGTW', NULL, NULL, NULL, NULL, NULL, NULL, 'KT 8322 NF', 'KT 8322 NF', NULL, NULL, '2026-05-19 19:37:08', '2026-05-19 19:46:27', NULL),
(349, 'fc41543c-2ddb-4736-8001-eb9c179b2079', 'O6321MB011', 'O6321MB011', 'MITSUBISHI L-300', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-NVZ1G41Z', NULL, NULL, NULL, NULL, NULL, NULL, 'KT 8615 GD', 'KT 8615 GD', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(350, '8b7e8cb6-cb6b-4160-b329-aae735972eb3', 'O6321MB012', 'O6321MB012', 'TOYOTA HILUX PICK-UP', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-PZQ4FJIF', NULL, NULL, NULL, NULL, NULL, NULL, 'KT 8821 NG', 'KT 8821 NG', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:46:27', NULL),
(351, '74efb922-9a8d-4817-be02-c51d327e2684', 'O6321MB014', 'O6321MB014', 'MOBIL TOYOTA NEW HILUX GUN12DCGMT01 2.4G', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-MNQ5M3PO', 'MR0KB8CD5J1118820', 'MR0KB8CD5J1118820', '2GD4506839-48562', '2GD4506839-48562', '40100264', '40100264', 'O6321MB014', 'O6321MB014', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:46:27', NULL),
(352, '116e6170-79c4-4e01-a568-19e266123eb4', 'O6321MB016', 'O6321MB016', 'MOBIL TOYOTA HILUX 2.5 4X4', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-STDHLZFL', 'MROKS8C01F1031732', 'MROKS8C01F1031732', '2KD-S609173', '2KD-S609173', NULL, NULL, 'KT 8381 NM', 'KT 8381 NM', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:46:27', NULL),
(353, 'bb1402b3-f833-4744-8d2b-eef493affd43', 'O6321MB017', 'O6321MB017', 'MOBIL MITSUBISHI TRITON', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-443COR5K', 'MMBENKL30JH054650', 'MMBENKL30JH054650', '4D56UAU384', '4D56UAU384', NULL, NULL, 'O6321MB017', 'O6321MB017', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:46:27', NULL),
(354, '3ea0e524-14e0-49d5-8716-8dece89fa50e', 'O6321MB021', 'O6321MB021', 'MOBIL MITSUBSHI TRIRON DC (4X4)', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-HSUQ8SKJ', 'MMBJNKL30MHD28580', 'MMBJNKL30MHD28580', '4D56U5D5083', '4D56U5D5083', NULL, NULL, 'KT 8615 GI', 'KT 8615 GI', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(355, '0f7ef1b0-c27a-40a6-aeab-c32a0b78d5d0', 'O6321MB022', 'O6321MB022', 'MOBIL ISUZU PICK UP (RENTAL)', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-ST4JOLAT', 'MHCPHR54CLJ418013', 'MHCPHR54CLJ418013', 'E418013', 'E418013', NULL, NULL, 'KT 8387 RQ', 'KT 8387 RQ', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(356, '7a02539b-4b2a-400b-99d9-57f489de7e0a', 'O6321SM001', 'O6321SM001', 'Sepeda Motor', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-BA35KTKN', 'MH1KC5213EK173892', 'MH1KC5213EK173892', 'KC52E1171990', 'KC52E1171990', '40100058', '40100058', 'KT6154GC', 'KT6154GC', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(357, 'c4a1250b-7f7a-4e2e-8d96-93408b6bfe91', 'O6321SM007', 'O6321SM007', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-HLQNWDJF', 'MH1KC5215HK342637', 'MH1KC5215HK342637', 'KC52E1339173', 'KC52E1339173', '40100064', '40100064', 'KT6013GL', 'KT6013GL', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(358, '5f91d483-5e2e-489a-aa10-758466054439', 'O6321SM018', 'O6321SM018', 'SEPEDA MOTOR KAWASAKI KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-FMGCLZO3', 'MH4LX150CCKP48241', 'MH4LX150CCKP48241', 'LX150CEP74516', 'LX150CEP74516', '40100052', '40100052', 'KT6683GA', 'KT6683GA', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(359, 'fe79440e-0c4c-4a82-b298-6b187c0fd93a', 'O6321SM019', 'O6321SM019', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-B6RXELJD', 'MH4LX150CCKP56017', 'MH4LX150CCKP56017', 'LX150CEP86583', 'LX150CEP86583', '40100053', '40100053', 'KT6793GA', 'KT6793GA', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(360, '7640687b-0531-4d2f-98e0-1008496ea32d', 'O6321SM020', 'O6321SM020', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-DPYEKUKA', 'MH4LX150CCKP43285', 'MH4LX150CCKP43285', 'LX150CEP66559', 'LX150CEP66559', '40100054', '40100054', 'KT6634GA', 'KT6634GA', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(361, '1820b990-4449-479f-a216-28551bb9bf27', 'O6321SM023', 'O6321SM023', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-MEBHJVZW', 'MH4LX150CCKP40953', 'MH4LX150CCKP40953', 'LX150CEP65910', 'LX150CEP65910', '40100057', '40100057', 'KT6636GA', 'KT6636GA', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(362, 'ecc5a836-f8f6-4b4d-be90-a9ef8693768f', 'O6321SM024', 'O6321SM024', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-YNWTEUEK', 'MH4LX150CCKP56104', 'MH4LX150CCKP56104', 'LX150CEP86428', 'LX150CEP86428', '40100203', '40100203', 'KT6794GA', 'KT6794GA', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(363, 'ce1a150a-f609-448e-989b-c687992935e6', 'O6321SM025', 'O6321SM025', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-UWBVZ2IH', 'MH4LX150CCKP58418', 'MH4LX150CCKP58418', 'LX150CEP90824', 'LX150CEP90824', '40100038', '40100038', 'KT6795GA', 'KT6795GA', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(364, '9fafaa27-7439-42a3-a928-bf4f1d70eee7', 'O6321SM028', 'O6321SM028', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-TLJX9CMR', 'MH4LX150CCKP48311', 'MH4LX150CCKP48311', 'LX150CEP75126', 'LX150CEP75126', '40100043', '40100043', 'KT6685GA', 'KT6685GA', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(365, 'f8ff3010-08bb-4874-9ac9-bfef7dff0b13', 'O6321SM032', 'O6321SM032', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-LIPNCY96', 'MH4LX150CCKP49147', 'MH4LX150CCKP49147', 'LX150CEP75601', 'LX150CEP75601', '40100044', '40100044', 'KT6682GA', 'KT6682GA', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(366, '15ec3bd3-75e3-487b-a3fa-150855967b47', 'O6321SM033', 'O6321SM033', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-K8QMZSFB', 'MH4LX150CCKP49073', 'MH4LX150CCKP49073', 'LX150CEP75591', 'LX150CEP75591', '40100048', '40100048', 'KT6681GA', 'KT6681GA', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(367, '9786f4e6-1667-4194-8b40-28a4df43c83b', 'O6321SM034', 'O6321SM034', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-ZZ5GNVVP', 'MH4LX150CBKP28191', 'MH4LX150CBKP28191', 'LX150CEP43185', 'LX150CEP43185', '40100035', '40100035', 'KT6457GA', 'KT6457GA', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(368, '7f5e67a7-c4a4-412c-b2e1-d71ab6a3e05e', 'O6321SM035', 'O6321SM035', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-VDKVZZBL', 'MH4LX150CCKP56463', 'MH4LX150CCKP56463', 'LX150CEP88182', 'LX150CEP88182', '40100049', '40100049', 'KT 6756 GA', 'KT 6756 GA', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(369, '13c8bbe5-3920-4ccc-824e-d63947b0eaa5', 'O6321SM038', 'O6321SM038', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-TY8XEJOG', 'MH4LX150CCKP53514', 'MH4LX150CCKP53514', 'LX150CEP82923', 'LX150CEP82923', '40100202', '40100202', 'KT 6759 GA', 'KT 6759 GA', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(370, 'e2f1c7be-0e29-40e4-9c5d-64e9e66162d7', 'O6321SM039', 'O6321SM039', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-L5XFZ3UZ', 'MH4LX150CCKP51611', 'MH4LX150CCKP51611', 'LX150CEP81351', 'LX150CEP81351', '40100037', '40100037', 'KT 6770 GA', 'KT 6770 GA', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(371, '2d7ae611-d132-4ce1-a5a9-9cf783469759', 'O6321SM040', 'O6321SM040', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-KSMDW4SH', 'MH4LX150CCKP54049', 'MH4LX150CCKP54049', 'LX150CEP83488', 'LX150CEP83488', '40100042', '40100042', NULL, NULL, NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(372, '0ab4d463-bcd8-44ab-af63-8803d2013f97', 'O6321SM042', 'O6321SM042', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-7T071ISH', 'MH1KC5210JK372859', 'MH1KC5210JK372859', 'KC52E1369602', 'KC52E1369602', '40100070', '40100070', 'KT4790GH', 'KT4790GH', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(373, 'ac88293d-9486-4576-a555-22e0c2e07c6a', 'O6321SM044', 'O6321SM044', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-SIYUYKOY', 'MH1KC521XJK367815', 'MH1KC521XJK367815', 'KC52E1365594', 'KC52E1365594', '40100072', '40100072', 'KT6035GH', 'KT6035GH', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(374, '5028bfac-f703-4b74-9281-7242c23d41c7', 'O6321SM053', 'O6321SM053', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-5IEPWQLX', 'MH1KC5211JK370246', 'MH1KC5211JK370246', 'KC52E1366824', 'KC52E1366824', NULL, NULL, 'KT4745GH', 'KT4745GH', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(375, '3e1ec370-2fb4-4904-bfa7-e488669b6acb', 'O6321SM054', 'O6321SM054', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-COQUNYQ5', 'MH1KC5214JK373190', 'MH1KC5214JK373190', 'KC52E1369756', 'KC52E1369756', NULL, NULL, 'KT4642GH', 'KT4642GH', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(376, '348ff161-91bc-4e3d-9701-40acf5fd623f', 'O6321SM055', 'O6321SM055', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-NSLTPRBY', 'MH1KC5210JK372859', 'MH1KC5210JK372859', 'KC52E1369602', 'KC52E1369602', NULL, NULL, 'KT4790GH', 'KT4790GH', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:39', NULL),
(377, '90c531fc-5905-49e8-aa66-a14f9e37c893', 'O6321SM056', 'O6321SM056', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-UM8CP5NH', 'MH1KC5210JK372862', 'MH1KC5210JK372862', 'KC52E1369591', 'KC52E1369591', NULL, NULL, 'KT4797GH', 'KT4797GH', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(378, 'a7b280d0-fd57-4e15-a151-bd4e3ef118e6', 'O6321SM057', 'O6321SM057', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-BAQHS2DY', 'MH1KC5219JK373170A', 'MH1KC5219JK373170A', 'KC52E1369699', 'KC52E1369699', NULL, NULL, 'KT4665GH', 'KT4665GH', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(379, '1b6a2d13-c3df-450a-be7e-937dd0c53b9e', 'O6321SM058', 'O6321SM058', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-4TH6R7U4', 'MH1KC5212JK370286', 'MH1KC5212JK370286', 'KC52E1367056', 'KC52E1367056', NULL, NULL, 'KT4668GH', 'KT4668GH', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(380, '39fe667e-da4a-4ae2-8f25-063f4dc081d3', 'O6321SM062', 'O6321SM062', 'SEPEDA MOTOR HONDA MEGAPRO', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-ODLYPSTV', 'MH1KC3116EK312080', 'MH1KC3116EK312080', 'KC31E1310729', 'KC31E1310729', NULL, NULL, 'KT2994GN', 'KT2994GN', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(381, '85e0ca31-ce03-4a2c-80a6-e0eb74a0f276', 'O6321SM069', 'O6321SM069', 'SEPEDA MOTOR HONDA VERZA 150CC', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-ZH4RADBO', 'MH1KC0219KK079188', 'MH1KC0219KK079188', 'KC02E1079652', 'KC02E1079652', NULL, NULL, 'KT6875GP', 'KT6875GP', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(382, '488bd71f-faad-4997-a8ff-1dce30b77b5f', 'O6321SM070', 'O6321SM070', 'SEPEDA MOTOR HONDA VERZA 150CC', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-E5ENIGJ0', 'MH1KC021XKK087512', 'MH1KC021XKK087512', 'KC02E1087996', 'KC02E1087996', NULL, NULL, 'KT6871GP', 'KT6871GP', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(383, '29b77706-2a37-4c85-b44e-c295d700a1e4', 'O6321SM071', 'O6321SM071', 'SEPEDA MOTOR HONDA VERZA 150CC', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-RWAYYWG6', 'MH1KC0210KK082576', 'MH1KC0210KK082576', 'KC02E1082856', 'KC02E1082856', NULL, NULL, 'KT6874GP', 'KT6874GP', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(384, '4d19894f-923b-480c-9724-7f3ade4ec594', 'O6321SM072', 'O6321SM072', 'SEPEDA MOTOR HONDA VERZA 150CC', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-PA44TL7A', 'MH1KC0215KK086817', 'MH1KC0215KK086817', 'KC02E1087323', 'KC02E1087323', NULL, NULL, 'KT6872GP', 'KT6872GP', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(385, 'b60358fc-366d-4d33-8771-6ba049a87aa6', 'O6321SM073', 'O6321SM073', 'SEPEDA MOTOR HONDA VERZA 150CC', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-O95EJGDY', 'MH1KC0219KK079188', 'MH1KC0219KK079188', 'KC02E1079652', 'KC02E1079652', '40100108', '40100108', 'KT6875GP', 'KT6875GP', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(386, '21ff6230-8d0f-48a5-9dc4-6f89c056f6c1', 'O6321SM074', 'O6321SM074', 'SEPEDA MOTOR HONDA VERZA 150CC', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-ZVEXCFK0', 'MH1KC021XKK087512', 'MH1KC021XKK087512', 'KC02E1087996', 'KC02E1087996', '40100109', '40100109', 'KT6871GP', 'KT6871GP', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(387, 'f341bdfa-83b6-4a8f-96f3-71647bd9b402', 'O6321SM081', 'O6321SM081', 'SEPEDA MOTOR HONDA VERZA 150CC', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-NLVDHJ3Q', 'MH1KC021XMK163426', 'MH1KC021XMK163426', 'KC02E1163010', 'KC02E1163010', '40100145', '40100145', 'KT4085FQ', 'KT4085FQ', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(388, '73702585-b656-400d-8d66-c3c5fe0f4f88', 'O6321SM092', 'O6321SM092', 'SEPEDA MOTOR HONDA VERZA CB150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-VWB4X1NG', 'MH1KC0211RK275717', 'MH1KC0211RK275717', 'KC02E1275244', 'KC02E1275244', '40100207', '40100207', 'KT2302XY', 'KT2302XY', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(389, '71534f16-d76d-43ee-a135-96e93f23029a', 'O6321TT001', 'O6321TT001', 'Mobil Damkar', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-9UBY5EXN', 'MJEC1JG43D5073865', 'MJEC1JG43D5073865', 'W04DTRJ74237', 'W04DTRJ74237', NULL, NULL, 'B 9189 UDD', 'B 9189 UDD', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(390, 'd3ae6d91-c39f-448b-84a8-387de1b28cf1', 'O6321TT006', 'O6321TT006', 'TRUK TANGKI CPO TOYOTA D130HD', NULL, NULL, '63', '6321', '6321', NULL, 19, 'active', 0.0, 0.0, 'TAPG-KSPZCVLL', 'MJEC1JG43K5178085', 'MJEC1JG43K5178085', 'W04DTRR67786', 'W04DTRR67786', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:46:27', NULL),
(391, '8bfb640a-a7e4-4fe7-985a-865ea9295414', 'O6321VC004', 'O6321VC004', 'COMPACTOR VIBRO 01', NULL, NULL, '63', '6321', '6321', NULL, 20, 'active', 0.0, 0.0, 'TAPG-ZF7HXVI0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:46:27', NULL),
(392, 'c2de28d1-9412-42fd-ba42-f3757a5792fc', 'O6321VC005', 'O6321VC005', 'COMPACTOR VIBRO 02', NULL, NULL, '63', '6321', '6321', NULL, 20, 'active', 0.0, 0.0, 'TAPG-3H6UWLQC', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:46:27', NULL),
(393, '24cb39bb-3d61-4db2-9b9d-ca62bd7db718', 'O6321VC006', 'O6321VC006', 'COMPACTOR VIBRO 03', NULL, NULL, '63', '6321', '6321', NULL, 20, 'active', 0.0, 0.0, 'TAPG-1CQFFC2H', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:46:27', NULL),
(394, '17604a86-4a52-4650-90a9-48cb7695823e', 'O6321AB001', 'O6321AB001', 'AMBULANCE SUZUKI APV', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-09LQGKE0', 'MHYGDN41VEJ400804', 'MHYGDN41VEJ400804', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(395, '4e185216-0c82-4183-8035-5074b9bf4091', 'O6321AB002', 'O6321AB002', 'MOBIL AMBULANCE MITSUBISHI TRITON SC HDX', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-D1QTRH5R', 'MMBENLC10SH043464', 'MMBENLC10SH043464', '4N16UAY8128', '4N16UAY8128', '40100244', '40100244', NULL, NULL, NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:46:27', NULL),
(396, '7affa95a-07f0-4b73-b56c-f92e0e468ef4', 'O6321BS001', 'O6321BS001', 'Truck Sekolah 01', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-AUDMNXEN', 'MJEC1JGP434509069', 'MJEC1JGP434509069', 'OE04DTRJ17861', 'OE04DTRJ17861', NULL, NULL, 'B 9532  UDA', 'B 9532  UDA', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:47:15', NULL),
(397, 'd14d74c4-4dbc-4802-a39e-c93241adcef5', 'O6321BS002', 'O6321BS002', 'Truck Sekolah 02', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-L4PCK26A', 'MJEC1JG43H5160873', 'MJEC1JG43H5160873', 'W04DTRR51394', 'W04DTRR51394', '40100233', '40100233', 'KT 8640 NJ', 'KT 8640 NJ', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:47:15', NULL),
(398, 'f8443c16-ee24-42f5-8e8a-5363c9b0d671', 'O6321BS003', 'O6321BS003', 'Truck Sekolah 03', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-WZ1QKZVI', 'MJEC1JG43H5160885', 'MJEC1JG43H5160885', 'W04DTRR51396', 'W04DTRR51396', '40100232', '40100232', 'KT 8644 NJ', 'KT 8644 NJ', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:47:15', NULL),
(399, '9e772a15-5fa3-4bd2-a703-0a963c3d3f8f', 'O6321BS005', 'O6321BS005', 'BUS SEKOLAH HINO DUTRO FB130-INT', NULL, NULL, '63', '6321', '6321', NULL, 16, 'active', 0.0, 0.0, 'TAPG-FIJSWTBJ', 'MJEFB2WGLJ1E15205', 'MJEFB2WGLJ1E15205', 'W04DTNJ85205', 'W04DTNJ85205', NULL, NULL, 'KT 7176 BS', 'KT 7176 BS', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(400, '9f04eaa1-e06c-42e1-b3da-548adea2f32d', 'O6321BS006', 'O6321BS006', 'BUS SEKOLAH HINO DUTRO GB150', NULL, NULL, '63', '6321', '6321', NULL, 16, 'active', 0.0, 0.0, 'TAPG-OXUDQDPQ', 'MJEYCP5F7P9800241', 'MJEYCP5F7P9800241', 'N04CWKJ10482', 'N04CWKJ10482', '40100196', '40100196', 'O6321BS006', 'O6321BS006', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(401, '73e56a0d-1913-4f40-b3f4-8b8fbce8338b', 'O6321BS007', 'O6321BS007', 'BUS SEKOLAH HINO DUTRO GB150', NULL, NULL, '63', '6321', '6321', NULL, 16, 'active', 0.0, 0.0, 'TAPG-N0HFTAY8', 'MJEYCP5F4P9800262', 'MJEYCP5F4P9800262', 'N0CWKJ10511', 'N0CWKJ10511', '40100199', '40100199', 'O6321BS007', 'O6321BS007', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(402, 'b52a72c0-6569-4b0e-a091-296a0baa780e', 'O6321BS008', 'O6321BS008', 'BUS SEKOLAH HINO DUTRO EURO4 (6RODA)', NULL, NULL, '63', '6321', '6321', NULL, 16, 'active', 0.0, 0.0, 'TAPG-F8ZVZ1JL', 'MJEECB0F9S5006385', 'MJEECB0F9S5006385', 'N04CWYJ38711', 'N04CWYJ38711', '40100267', '40100267', 'O6321BS008', 'O6321BS008', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(403, '670378ac-e133-4bf1-87c7-10c4ebdbcf55', 'O6321DT004', 'O6321DT004', 'Dump Truck 4', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-TPF94IUD', 'MJEC1JG43C5050618', 'MJEC1JG43C5050618', 'W04DTRJ53555', 'W04DTRJ53555', NULL, NULL, 'B 9360 UDC', 'B 9360 UDC', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(404, 'fa0c347a-9a15-40d2-8337-585f866582b8', 'O6321DT006', 'O6321DT006', 'Dump Truck 6', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-BPB50RK5', 'MJEC1JG43C5051582', 'MJEC1JG43C5051582', 'W04DTRJ54544', 'W04DTRJ54544', NULL, NULL, 'B 9381 UDC', 'B 9381 UDC', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(405, 'a38dfba0-c3aa-47b1-9fbd-9ddbee45166d', 'O6321DT007', 'O6321DT007', 'Dump Truck 7', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-E5W5S8LO', 'MJEC1JG43C5050076', 'MJEC1JG43C5050076', 'W04DTRJ52973', 'W04DTRJ52973', NULL, NULL, 'B 9409 UDC', 'B 9409 UDC', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(406, '1a304433-88ea-4aa8-9c0c-c92953dcdafd', 'O6321DT008', 'O6321DT008', 'Dump Truck 8', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-GFXUOWYQ', 'MJEC1JG43C5051583', 'MJEC1JG43C5051583', 'W04DTRJ54545', 'W04DTRJ54545', NULL, NULL, 'B 9383 UDC', 'B 9383 UDC', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(407, 'b47c64a5-65d7-4a36-96ce-3671cc69a344', 'O6321DT010', 'O6321DT010', 'Dump Truck 10', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-U96WV2TP', 'MJEC1JG43D5098143', 'MJEC1JG43D5098143', 'W04DTRJ93155', 'W04DTRJ93155', NULL, NULL, 'B 9078 UDE', 'B 9078 UDE', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(408, '3b586e4c-9273-49e1-af5f-1a7300076cb5', 'O6321DT011', 'O6321DT011', 'Dump Truck 11', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-BNNEIKBO', 'MJEC1JG43D5098142', 'MJEC1JG43D5098142', 'W04DTRJ93154', 'W04DTRJ93154', NULL, NULL, 'B 9080 UDE', 'B 9080 UDE', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(409, '0b674e5c-2c98-4e41-a711-75d004e2f1cd', 'O6321DT012', 'O6321DT012', 'Dump Truck 12', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-6QSLMJSO', 'MJEC1JG43D5098140', 'MJEC1JG43D5098140', 'W04DTRJ93156', 'W04DTRJ93156', NULL, NULL, 'B 9077 UDE', 'B 9077 UDE', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(410, '3178b85b-a673-4820-8fb7-52a7f59db62f', 'O6321DT013', 'O6321DT013', 'Dump Truck 13', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-Y4TMBO6K', 'MJEC1JG43D5098141', 'MJEC1JG43D5098141', 'W04DTRJ93153', 'W04DTRJ93153', NULL, NULL, 'B 9079 UDE', 'B 9079 UDE', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(411, 'bc5910f6-8dec-4270-a0d4-a8bff094e355', 'O6321DT014', 'O6321DT014', 'Dump Truck 14', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-MBU8LDJE', 'MJEC1JG43E5108550', 'MJEC1JG43E5108550', 'W04DTRR08037', 'W04DTRR08037', NULL, NULL, 'B 9540 UDE', 'B 9540 UDE', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(412, '8896ddf1-74b4-4db8-ab55-09bf709f2917', 'O6321DT017', 'O6321DT017', 'Dump Truck 17', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-V9MDMVGP', 'MJEC1JG43E5104551', 'MJEC1JG43E5104551', 'W04DTRR04332', 'W04DTRR04332', NULL, NULL, 'B 9543 UDE', 'B 9543 UDE', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(413, '08700b4d-1ff7-4926-aeff-e68e442f5f4e', 'O6321DT018', 'O6321DT018', 'Dump Truck 18', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-PSAM2NBG', 'MJEC1JG43E5119430', 'MJEC1JG43E5119430', 'W04DTRR16581', 'W04DTRR16581', NULL, NULL, 'B 9762 UDE', 'B 9762 UDE', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(414, 'e6a3fdfb-0e6c-4b29-b52b-03805c944dcd', 'O6321DT019', 'O6321DT019', 'Dump Truck 19', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-NMW2SWKB', 'MJEC1JG43E5119432', 'MJEC1JG43E5119432', 'W04DTRR16583', 'W04DTRR16583', NULL, NULL, 'B 9763 UDE', 'B 9763 UDE', NULL, NULL, '2026-05-19 19:37:09', '2026-05-19 19:44:40', NULL),
(415, 'eeb7e469-1f8f-4716-8b1e-a044c09decfa', 'O6321DT020', 'O6321DT020', 'Dump Truck 20', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-ZBPNFJNN', 'MJEC1JG43E5119433', 'MJEC1JG43E5119433', 'W04DTRR16584', 'W04DTRR16584', NULL, NULL, 'B 9764 UDE', 'B 9764 UDE', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:40', NULL),
(416, 'a75b396e-8e38-4771-a29e-c0b7c415bb85', 'O6321DT021', 'O6321DT021', 'Dump Truck 21', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-VH31P0FK', 'MJEC1JG43E5119431', 'MJEC1JG43E5119431', 'W04DTRR16582', 'W04DTRR16582', NULL, NULL, 'B 9765 UDE', 'B 9765 UDE', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:40', NULL),
(417, '921dd5fe-3c3c-4d68-9712-85ba4089fd38', 'O6321DT023', 'O6321DT023', 'Dump Truck 23', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-GXEEIKQV', 'MJEFM8JN1HJE161843', 'MJEFM8JN1HJE161843', 'WO4DTRR52389', 'WO4DTRR52389', '40100231', '40100231', 'KT 8035 YX', 'KT 8035 YX', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:40', NULL),
(418, 'ae032d3c-3da3-49ae-af9b-551200bb1262', 'O6321DT024', 'O6321DT024', 'Dump Truck 24', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-DWJXGS2D', 'MJEC1JG43H5161035', 'MJEC1JG43H5161035', 'W04DTRR51581', 'W04DTRR51581', '40100217', '40100217', 'KT 8212 NJ', 'KT 8212 NJ', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:40', NULL),
(419, 'df476d9e-a1dd-4873-9607-55af5396e273', 'O6321DT025', 'O6321DT025', 'Dump Truck 25', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-FQERVW9J', 'MJEC1JG43H5161731', 'MJEC1JG43H5161731', 'W04DTRR52262', 'W04DTRR52262', '40100253', '40100253', 'KT 8182 NJ', 'KT 8182 NJ', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:40', NULL),
(420, 'b235cd6e-027d-4d48-96ff-6028430a34ad', 'O6321DT026', 'O6321DT026', 'Dump Truck 26', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-OHNOAOWL', 'MJEC1JG43H5161628', 'MJEC1JG43H5161628', 'W04DTRR52194', 'W04DTRR52194', '40100220', '40100220', 'KT 8180 NJ', 'KT 8180 NJ', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:40', NULL),
(421, '87d34450-3863-4304-8dbe-d890dda7a9af', 'O6321DT027', 'O6321DT027', 'Dump Truck 27', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-XSCZPOQ3', 'MJEC1JG43H5161017', 'MJEC1JG43H5161017', 'W04DTRR51553', 'W04DTRR51553', '40100212', '40100212', 'KT 8083 NK', 'KT 8083 NK', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:40', NULL),
(422, '0a119026-6558-4568-9460-cfc05fa32249', 'O6321DT028', 'O6321DT028', 'Dump Truck 28', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-NJTYQYUQ', 'MJEC1JG43H5161044', 'MJEC1JG43H5161044', 'W04DTRR51595', 'W04DTRR51595', '40100234', '40100234', 'O6321DT028', 'O6321DT028', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:40', NULL),
(423, 'd84dd5ad-1119-46df-83f7-ef57fdc47a37', 'O6321DT029', 'O6321DT029', 'Dump Truck 29', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-ZQ20MCM4', 'MJEC1JG43H5161730', 'MJEC1JG43H5161730', 'W04DTRR52261', 'W04DTRR52261', '40100222', '40100222', 'KT 8178 NJ', 'KT 8178 NJ', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:40', NULL),
(424, '825c6bc7-f491-43b4-87ab-04182fd0e412', 'O6321DT032', 'O6321DT032', 'Dump Truck 32', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-HZZECQWM', 'MJEC1JG43H5161023', 'MJEC1JG43H5161023', 'W04DTRR51574', 'W04DTRR51574', '40100215', '40100215', 'KT 8968 NJ', 'KT 8968 NJ', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:40', NULL),
(425, 'd723fcdd-e9d0-4157-8b99-0da2d7eb3596', 'O6321DT033', 'O6321DT033', 'Dump Truck 33', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-8SAE8SPV', 'MJEC1JG43H5161024', 'MJEC1JG43H5161024', 'W04DTRR51575', 'W04DTRR51575', '40100216', '40100216', 'KT 8001 NJ', 'KT 8001 NJ', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:40', NULL),
(426, '9af6d87f-1eea-457d-9753-79437d4797c0', 'O6321DT034', 'O6321DT034', 'Dump Truck 34', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-F0V1TIGN', 'MJEC1JG43H5161042', 'MJEC1JG43H5161042', 'W04DTRR51583', 'W04DTRR51583', '40100219', '40100219', 'KT 8002 NJ', 'KT 8002 NJ', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:40', NULL),
(427, '4242587c-cc38-4bf7-8638-23f3fcfef741', 'O6321DT035', 'O6321DT035', 'Dump Truck 35', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-VMRRHYPP', 'MJEC1JG43H5161041', 'MJEC1JG43H5161041', 'W04DTRR51582', 'W04DTRR51582', '40100218', '40100218', 'KT 8007 NJ', 'KT 8007 NJ', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:40', NULL),
(428, '4def6663-df0a-4b28-a745-2d8e96c41d0c', 'O6321DT036', 'O6321DT036', 'Dump Truck 36', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-GYONCMML', 'MJEC1JG43H5161022', 'MJEC1JG43H5161022', 'W04DTRR51573', 'W04DTRR51573', '40100214', '40100214', 'KT 8006 NJ', 'KT 8006 NJ', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:40', NULL),
(429, 'e0399934-cd83-4100-9d86-440636393c10', 'O6321DT038', 'O6321DT038', 'Dump Truck 38', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-SL178F0F', 'MJEC1JG43H5161729', 'MJEC1JG43H5161729', 'W04DTRR52260', 'W04DTRR52260', '40100221', '40100221', 'KT 8179 NJ', 'KT 8179 NJ', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:40', NULL);
INSERT INTO `assets` (`id`, `public_uuid`, `code`, `io_code`, `name`, `brand`, `model`, `company_code`, `plant_code`, `plant`, `year`, `category_id`, `status`, `current_hm`, `current_km`, `qr_code`, `serial_number`, `chasis_no`, `engine_number`, `engine_no`, `sap_asset_no`, `asset_no`, `plate_number`, `veh_plate_no`, `notes`, `photo`, `created_at`, `updated_at`, `deleted_at`) VALUES
(430, 'd08be30e-6d2e-40cd-8998-1b86226bc36f', 'O6321DT039', 'O6321DT039', 'Dump Truck 39', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-XJ9SIZJM', 'MJEC1JG43H5161019', 'MJEC1JG43H5161019', 'W04DTRR51555', 'W04DTRR51555', '40100213', '40100213', 'KT 8213 NJ', 'KT 8213 NJ', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:40', NULL),
(431, '2cfe5d51-cb29-49bc-9c60-f14b118c27d1', 'O6321DT043', 'O6321DT043', 'Dump Truck 43', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-Z3VRJK1S', 'MJEC1JG43H5161018', 'MJEC1JG43H5161018', 'W04DTRR51554', 'W04DTRR51554', '40100243', '40100243', 'KT 8048 YX', 'KT 8048 YX', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:40', NULL),
(432, '211a07ec-f04b-41e6-bd40-b4a0977f4045', 'O6321DT045', 'O6321DT045', 'Dump Truck 45', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-RUWN7CO4', 'MJEC1JG43H5161016', 'MJEC1JG43H5161016', 'W04DTRR51552', 'W04DTRR51552', '40100211', '40100211', 'KT 8208 NJ', 'KT 8208 NJ', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(433, 'b9923b5f-938f-43fc-b806-3b70db53c126', 'O6321DT050', 'O6321DT050', 'DUMP TRUCK HINO DUTRO D130HD 6.4PS', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-MYITT9IX', 'MJEC1JG43J5170829', 'MJEC1JG43J5170829', 'W04DTRR60910', 'W04DTRR60910', '40100223', '40100223', 'KT 8445 NM', 'KT 8445 NM', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(434, '8f50b0fb-8f0e-4707-9dd2-1fe0b03ab4a7', 'O6321DT051', 'O6321DT051', 'DUMP TRUCK HINO DUTRO 130HD 6.4PS -INFRA', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-WDRO1P5Y', 'MJEC1JG43J5170831', 'MJEC1JG43J5170831', 'W04DTRR60922', 'W04DTRR60922', '40100255', '40100255', 'KT 8446 NM', 'KT 8446 NM', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(435, 'ae776bff-07d5-41e8-9bb9-b34be6c2d55d', 'O6321DT052', 'O6321DT052', 'DUMP TRUCK HINO DUTRO 130HD 6.4PS -INFRA', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-ZQ67M4M7', 'MJEC1JG43J5170833', 'MJEC1JG43J5170833', 'W04DTRR60924', 'W04DTRR60924', '40100246', '40100246', 'O6321DT052', 'O6321DT052', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(436, '6e3e2247-5018-42a5-add4-f8c327931c75', 'O6321DT053', 'O6321DT053', 'DUMP TRUCK HINO DUTRO 130HD 6.4PS -INFRA', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-7V0PXMYK', 'MJEC1JG43J5170834', 'MJEC1JG43J5170834', 'W04DTRR60925', 'W04DTRR60925', '40100247', '40100247', 'KT 8440 NM', 'KT 8440 NM', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(437, 'b16ae822-4c8e-41e7-a9ea-df4bda2d9360', 'O6321DT054', 'O6321DT054', 'DUMP TRUCK HINO DUTRO 130HD 6.4PS -INFRA', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-E85PBB28', 'MJEC1JG43J5170832', 'MJEC1JG43J5170832', 'W04DTRR60923', 'W04DTRR60923', NULL, NULL, 'O6321DT054', 'O6321DT054', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(438, 'bb8ef802-65a7-471a-a79f-535f3ee447e1', 'O6321DT055', 'O6321DT055', 'DUMP TRUCK HINO DUTRO 130HD 6.4PS -INFRA', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-Z2NP5NIY', 'MJEC1JG43J5170830', 'MJEC1JG43J5170830', 'W04DTRR60921', 'W04DTRR60921', '40100224', '40100224', 'O6321DT055', 'O6321DT055', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(439, 'e279e19e-9a12-41dd-93f5-e99749538dd0', 'O6321DT056', 'O6321DT056', 'DUMP TRUCK HINO DUTRO 130HD 6.4PS', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-PHAEEUEH', 'MJEC1JG43J5172169', 'MJEC1JG43J5172169', 'W04DTRR61845', 'W04DTRR61845', '40100250', '40100250', 'KT 8600 NL', 'KT 8600 NL', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(440, '8a31423f-39e4-479a-a96f-c7bd55950c03', 'O6321DT057', 'O6321DT057', 'DUMP TRUCK HINO DUTRO 130HD 6.4PS INT', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-ISK9JGP9', 'MJEC1JG43J5172170', 'MJEC1JG43J5172170', 'W04DTRR61846', 'W04DTRR61846', '40100251', '40100251', 'KT 8123 NM', 'KT 8123 NM', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(441, '4f8f048d-2639-477a-8507-8718ddf4c467', 'O6321DT058', 'O6321DT058', 'DUMP TRUCK HINO DUTRO 130HD 6.4PS INT', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-GZS6ZJR7', 'MJEC1JG43J5172168', 'MJEC1JG43J5172168', 'W04DTRR61844', 'W04DTRR61844', '40100249', '40100249', 'KT 8124 NM', 'KT 8124 NM', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(442, 'bc260061-0ef2-402d-9179-cc3e08893180', 'O6321DT059', 'O6321DT059', 'DUMP TRUCK HINO DUTRO 130HD 6.4PS INT', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-WHALLNY0', 'MJEC1JG43J5170855', 'MJEC1JG43J5170855', 'W04DTRR60931', 'W04DTRR60931', '40100248', '40100248', 'KT 8607 NM', 'KT 8607 NM', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(443, '231f8c3e-3873-4473-8ace-1d943a8c4c2e', 'O6321DT060', 'O6321DT060', 'DUMP TRUCK HINO DUTRO 130HD 6.4PS INT', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-ZYNKVBBV', 'MJEC1JG43C5051580', 'MJEC1JG43C5051580', 'W04DTRJ54654', 'W04DTRJ54654', NULL, NULL, 'B 9420 PDB', 'B 9420 PDB', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(444, '55a8ddf3-84fb-4047-80dc-967d4654639a', 'O6321DT063', 'O6321DT063', 'DUMP TRUCK HINO DUTRO 130HD 6.4PS INT', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-7ZH1F9GH', 'MJEC1JG43F5123507', 'MJEC1JG43F5123507', 'WO4DTRR19638', 'WO4DTRR19638', NULL, NULL, 'B 9617 SDB', 'B 9617 SDB', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(445, '2abeb974-4d41-4e4b-a753-d7afc8b97947', 'O6321DT064', 'O6321DT064', 'DUMP TRUCK HINO DUTRO D130HD-INT', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-YAQLUI7R', 'MJEC1JG43J5172166', 'MJEC1JG43J5172166', 'W04DTRR61842', 'W04DTRR61842', NULL, NULL, 'KT 8385 NM', 'KT 8385 NM', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(446, '31a94cb1-8261-4829-abc2-3a51302228b2', 'O6321DT066', 'O6321DT066', 'DUMP TRUCK HINO DUTRO D130HD-INT', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-GVFAMTAN', 'MJEC1JG43J5172165', 'MJEC1JG43J5172165', 'W04DTRR61841', 'W04DTRR61841', NULL, NULL, 'KT 8380 NM', 'KT 8380 NM', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(447, '676f57b7-9611-47c5-bc15-5ec5d1fe3100', 'O6321DT067', 'O6321DT067', 'DUMP TRUCK MITSUBISHI FE SUPER HD', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-HOWFDTIR', 'MHMFE75P6JK040052', 'MHMFE75P6JK040052', '4D34TS09754', '4D34TS09754', NULL, NULL, 'KT 8483 NN', 'KT 8483 NN', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(448, 'a6cefdbc-027b-4369-8c50-872fc8f7c6a0', 'O6321DT068', 'O6321DT068', 'DUMP TRUCK MITSUBISHI FE SUPER HD', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-YKO9TNHZ', 'MHMFE75P6JK039757', 'MHMFE75P6JK039757', '4D34TS77215', '4D34TS77215', NULL, NULL, 'KT 8476 NN', 'KT 8476 NN', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(449, '1099044a-6f25-46c1-9244-c4b0e71973ae', 'O6321DT069', 'O6321DT069', 'DUMP TRUCK MITSUBISHI FE SUPER HD', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-QESUG4CH', 'MHMFE75P6JK039948', 'MHMFE75P6JK039948', '4D34TS82497', '4D34TS82497', NULL, NULL, 'KT 8853 NN', 'KT 8853 NN', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(450, '3199d893-7777-4b4d-b635-e45384d34ebb', 'O6321DT070', 'O6321DT070', 'DUMP TRUCK MITSUBISHI FE SUPER HD', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-WEZWFKXM', 'MHMFE75P6JK039937', 'MHMFE75P6JK039937', '4D34TS82487', '4D34TS82487', NULL, NULL, 'KT 8489 NN', 'KT 8489 NN', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(451, '6ab3e9f9-dea0-49a3-bca2-03d6f2cbef6a', 'O6321DT071', 'O6321DT071', 'DUMP TRUCK MITSUBISHI FE SUPER HD', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-1PHN0UD0', 'MHMFE75P6JK040061', 'MHMFE75P6JK040061', '4D34TS09728', '4D34TS09728', NULL, NULL, 'KT 8479 NN', 'KT 8479 NN', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(452, '66b48791-8014-44c3-9b88-24e6a0679853', 'O6321DT072', 'O6321DT072', 'DUMP TRUCK MITSUBISHI FE SUPER HD', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-N60Y9HLV', 'MHMFE75P6JK039779', 'MHMFE75P6JK039779', '4D34TS77224', '4D34TS77224', NULL, NULL, 'KT 8473 NN', 'KT 8473 NN', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(453, 'ab00c874-e12f-47da-a8d3-30069a2da5cb', 'O6321DT073', 'O6321DT073', 'DUMP TRUCK MITSUBISHI FE SUPER HD', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-YZG8UXF2', 'MHMFE75P6JK039935', 'MHMFE75P6JK039935', '4D34TS82484', '4D34TS82484', NULL, NULL, 'KT 8481 NN', 'KT 8481 NN', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(454, '35d9d03c-2631-44ce-950c-9237dd8e7ad6', 'O6321DT074', 'O6321DT074', 'DUMP TRUCK MITSUBISHI FE SUPER HD', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-MXVHY9AV', 'MHMFE75P6JK039950', 'MHMFE75P6JK039950', '4D34TS82503', '4D34TS82503', NULL, NULL, 'KT 8480 NN', 'KT 8480 NN', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(455, '064ddde1-fc64-4d77-9e7b-f8668f8a2b5b', 'O6321DT075', 'O6321DT075', 'DUMP TRUCK MITSUBISHI FE SUPER HD', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-3KSOFLL4', 'MHMFE75P6JK040064', 'MHMFE75P6JK040064', '4D34TS09757', '4D34TS09757', NULL, NULL, 'KT 8475 NN', 'KT 8475 NN', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(456, '068f80af-4d84-4be0-8576-ce9ac8548cb8', 'O6321DT076', 'O6321DT076', 'DUMP TRUCK MITSUBISHI FE SUPER HD', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-Y64ZGYGG', 'MHMFE75P6JK040048', 'MHMFE75P6JK040048', '4D34TS09721', '4D34TS09721', NULL, NULL, 'KT 8485 NN', 'KT 8485 NN', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(457, '43493ee3-5dbc-4f95-b5cc-81593e3e0730', 'O6321DT077', 'O6321DT077', 'DUMP TRUCK HINO DUTRO D130HD', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-DH2UM6RU', 'MJEC1JG43H5161732', 'MJEC1JG43H5161732', 'W04DTRR52263', 'W04DTRR52263', NULL, NULL, 'O6321DT077', 'O6321DT077', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(458, '78843efc-5ffa-4c13-a2dc-e4629a3464b6', 'O6321DT078', 'O6321DT078', 'DUMP TRUCK MITSUBISHI FE SUPER HD', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-NOOSTC9M', 'MHMFE75P6JK039959', 'MHMFE75P6JK039959', '4D34TS82471', '4D34TS82471', NULL, NULL, 'O6321DT078', 'O6321DT078', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(459, '6db90e7b-1592-4d36-8c67-643502cd2d2d', 'O6321DT079', 'O6321DT079', 'DUMP TRUCK HINO DUTRO D130HD', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-QS4JIU6I', 'MJEC1JG43J5167530', 'MJEC1JG43J5167530', 'W04DTRR57846', 'W04DTRR57846', '40100212', '40100212', 'O6321DT079', 'O6321DT079', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(460, 'fa814b9d-b9f3-4bc3-b1a7-fdb453f764b1', 'O6321DZ004', 'O6321DZ004', 'BULLDOZER KOMATSU D31PX-22', NULL, NULL, '63', '6321', '6321', NULL, 8, 'active', 0.0, 0.0, 'TAPG-TPN9JQTE', '573960', '573960', 'SAA4D95LE-5', 'SAA4D95LE-5', NULL, NULL, 'O6321DZ004', 'O6321DZ004', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(461, '0f2a87fe-f9b6-41d7-b6b3-3292e37e58c7', 'O6321EX001', 'O6321EX001', 'EXCAVATOR KOMATSU PC 130', NULL, NULL, '63', '6321', '6321', NULL, 7, 'active', 0.0, 0.0, 'TAPG-VHLKCWZV', 'KMTPC122V53J11716', 'KMTPC122V53J11716', '143888', '143888', NULL, NULL, 'O6321EX001', 'O6321EX001', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(462, '2850c58b-7ab6-49a7-a16e-9164163bbf88', 'O6321EX009', 'O6321EX009', 'EXCAVATOR KOMATSU PC200-8MO (INTERNAL)', NULL, NULL, '63', '6321', '6321', NULL, 7, 'active', 0.0, 0.0, 'TAPG-PI58NZV7', 'KMTPC244TJTC21885', 'KMTPC244TJTC21885', '26689144', '26689144', '40300031', '40300031', 'O6321EX009', 'O6321EX009', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(463, '32c4f247-18b2-4a8d-80e1-c6eae259ddf2', 'O6321EX010', 'O6321EX010', 'EXCAVATOR MINI KUBOTA PC-50', NULL, NULL, '63', '6321', '6321', NULL, 7, 'active', 0.0, 0.0, 'TAPG-OBEPBKT0', 'JKUU0505E01H60599', 'JKUU0505E01H60599', '7JU4924', '7JU4924', NULL, NULL, 'O6321EX010', 'O6321EX010', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(464, 'ffa30809-51af-465c-8622-3341cfa0da89', 'O6321EX011', 'O6321EX011', 'EXCAVATOR MINI KOMATSU PC45MR-3', NULL, NULL, '63', '6321', '6321', NULL, 7, 'active', 0.0, 0.0, 'TAPG-8BUHBOC6', 'KMTPC207TME007839', 'KMTPC207TME007839', '4D88E-6BPDA / 43063', '4D88E-6BPDA / 43063', '40300007', '40300007', 'O6321EX011', 'O6321EX011', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(465, 'bd60b1bc-a5cd-46a8-a14b-2c716b2815fc', 'O6321EX012', 'O6321EX012', 'EXCAVATOR KOMATSU PC135F', NULL, NULL, '63', '6321', '6321', NULL, 7, 'active', 0.0, 0.0, 'TAPG-MYLIWFXQ', 'KMTPC298CMXJ10376', 'KMTPC298CMXJ10376', 'SAA4D95LE-5 579711', 'SAA4D95LE-5 579711', '40300009', '40300009', 'O6321EX012', 'O6321EX012', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(466, '2c9ed37a-1b6d-4a6b-a132-e7e37c74cc75', 'O6321EX013', 'O6321EX013', 'EXCAVATOR MINI KOMATSU PC45MR-3', NULL, NULL, '63', '6321', '6321', NULL, 7, 'active', 0.0, 0.0, 'TAPG-ZQDEOJSR', 'KMTPC207CNE007873', 'KMTPC207CNE007873', '4D88E6BPDA-43168', '4D88E6BPDA-43168', '40300010', '40300010', 'O6321EX013', 'O6321EX013', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(467, '61687261-258c-461b-b452-2a077b20f5c1', 'O6321EX014', 'O6321EX014', 'EXCAVATOR KOMATSU PC45', NULL, NULL, '63', '6321', '6321', NULL, 7, 'active', 0.0, 0.0, 'TAPG-TAS3JZ3Z', 'KMTPC207VNE007882', 'KMTPC207VNE007882', '4D88E6BPDA-43197', '4D88E6BPDA-43197', '40300011', '40300011', NULL, NULL, NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(468, '21662ae5-ea0e-486f-bf04-e3911e6b8cec', 'O6321EX016', 'O6321EX016', 'EXCAVATOR MINI KOMATSU PC45MR-3', NULL, NULL, '63', '6321', '6321', NULL, 7, 'active', 0.0, 0.0, 'TAPG-8RRZDH9R', 'KMTPC207TNE007907', 'KMTPC207TNE007907', '4D88E6BPDA-43244', '4D88E6BPDA-43244', '40300012', '40300012', NULL, NULL, NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(469, 'e29b0694-a949-41e7-aa4c-9820357b2bf9', 'O6321EX017', 'O6321EX017', 'EXCAVATOR BOBCAT E80', NULL, NULL, '63', '6321', '6321', NULL, 7, 'active', 0.0, 0.0, 'TAPG-NQRLQZFF', 'AETB13082', 'AETB13082', '192649', '192649', '40300024', '40300024', 'O6321EX017', 'O6321EX017', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(470, '9ed78984-c20b-45f1-9eb6-749d26324981', 'O6321EX018', 'O6321EX018', 'EXCAVATOR KOMATSU PC200-10M0', NULL, NULL, '63', '6321', '6321', NULL, 7, 'active', 0.0, 0.0, 'TAPG-F5MT7EJD', 'KMTPC303ARMCH1750', 'KMTPC303ARMCH1750', 'SAA4D107E-1 26789706', 'SAA4D107E-1 26789706', '40300027', '40300027', NULL, NULL, NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(471, 'c2275334-c00c-4abd-89ea-89de98b38072', 'O6321EX019', 'O6321EX019', 'EXCAVATOR BOBCAT E80', NULL, NULL, '63', '6321', '6321', NULL, 7, 'active', 0.0, 0.0, 'TAPG-YLAFYLMT', 'AETB13087', 'AETB13087', '193521', '193521', '40300049', '40300049', NULL, NULL, NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(472, '7195a90a-5f00-45ef-b1d4-40ba56e4cf70', 'O6321001', 'O6321001', 'TRACTOR BUFFALO ERREPPI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-1THURH0F', 'E137YE171736', 'E137YE171736', 'YANMAR 3G2950', 'YANMAR 3G2950', '40300033', '40300033', 'O6321001', 'O6321001', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(473, '54469a65-892b-4274-98a8-a1508037b8de', 'O6321002', 'O6321002', 'TRACTOR MASSEY FERGUSON 2615-4WD', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-0JATAWE0', 'MEA6054DYH1158600', 'MEA6054DYH1158600', 'S325EH97038', 'S325EH97038', '40300029', '40300029', 'O6321002', 'O6321002', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(474, '1a4bf141-8713-4287-bbf8-9ac0ddcba8cf', 'O6321003', 'O6321003', 'MASSEY FERGUSON MF2615 GRABBER SP3000-IN', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-78AY0DJ0', 'MEA6054DYJ1198241', 'MEA6054DYJ1198241', 'S325EJ64507', 'S325EJ64507', '40300030', '40300030', 'O6321003', 'O6321003', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(475, 'b1f1509f-4534-4d45-bc3c-e3a2290918a2', 'O6321004', 'O6321004', 'TRACTOR QUICK TRUCK QT-14E', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-PKNJ1TQ4', 'C2200080CGC2', 'C2200080CGC2', 'KIAMJ0836', 'KIAMJ0836', '40100146', '40100146', 'O6321004', 'O6321004', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(476, '3a46ea80-f441-4db8-8520-51b4cd0a84b5', 'O6321006', 'O6321006', 'TRACTOR QUICK TRUCK QT-14E', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-MF4DUATD', 'D2300026CGC2', 'D2300026CGC2', 'KI ANJ1740', 'KI ANJ1740', '40100168', '40100168', 'O6321006', 'O6321006', NULL, NULL, '2026-05-19 19:37:10', '2026-05-19 19:44:41', NULL),
(477, '79cab70e-2f2e-4781-8be1-fe106408280a', 'O6321007', 'O6321007', 'TRACTOR QUICK TRUCK QT-14E', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-EDH2CKE3', 'D2300027CGC2', 'D2300027CGC2', 'KI ANJ1730', 'KI ANJ1730', '40100169', '40100169', 'O6321007', 'O6321007', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:41', NULL),
(478, '7f673e00-2cc1-4022-b92d-a5ca99f0e16c', 'O6321008', 'O6321008', 'TRACTOR QUICK TRUCK QT-14E', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-KEYVSRPO', 'D2300032CGC2', 'D2300032CGC2', 'KI ANJ1734', 'KI ANJ1734', '40100170', '40100170', 'O6321008', 'O6321008', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:41', NULL),
(479, '535069e3-3fae-4e17-a9d2-0e3aebda8f8d', 'O6321010', 'O6321010', 'MINI TRACTOR MF2615-4WD 47 HP', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-BNQMGQ0Y', 'MEA6054DYN1385515', 'MEA6054DYN1385515', 'MEA6054DYN1385515', 'MEA6054DYN1385515', '40100176', '40100176', 'O6321010', 'O6321010', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:41', NULL),
(480, '11ed25c0-a21e-4dfd-97c1-fb6b8209e2fd', 'O6321011', 'O6321011', 'MINI TRACTOR MF2615-4WD 47 HP', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-N5WAS9AB', 'MEA6054DYN1385555', 'MEA6054DYN1385555', 'S325EM89215', 'S325EM89215', '40100177', '40100177', 'O6321011', 'O6321011', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:41', NULL),
(481, '975f03a5-57c6-4d39-abd9-a64f2c89024b', 'O6321012', 'O6321012', 'MINI TRACTOR MF2615-4WD 47 HP', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-DOZKPBHU', 'MEA6054DYN1385559', 'MEA6054DYN1385559', 'S325M84188', 'S325M84188', '40100178', '40100178', 'O6321012', 'O6321012', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:41', NULL),
(482, '531c8039-3d4e-45fd-950d-702670b4bec6', 'O6321013', 'O6321013', 'MINI TRACTOR MF2615-4WD 47 HP', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-V1YTCUOD', 'MEA6054DYN1391031', 'MEA6054DYN1391031', 'S325M69350', 'S325M69350', '40100179', '40100179', 'O6321013', 'O6321013', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:41', NULL),
(483, '2a8d8ea8-16d9-4105-a4d8-00bbb7353e0c', 'O6321015', 'O6321015', 'FARM SMALL TRACTOR BADAK WEA08 14 HP', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-P5GXWMJR', '24/11/0012-2412012', '24/11/0012-2412012', 'RD140NESR/24/11/0012', 'RD140NESR/24/11/0012', '40100227', '40100227', 'O6321015', 'O6321015', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:41', NULL),
(484, '0fb0cfa1-de30-42bc-8691-2bc1cf0f3686', 'O6321016', 'O6321016', 'FARM SMALL TRACTOR BADAK WEA08 14 HP', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-I4AW2EGX', '24/11/0006-2412006', '24/11/0006-2412006', 'RD140NESR/24/11/0006', 'RD140NESR/24/11/0006', '40100228', '40100228', 'O6321016', 'O6321016', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:41', NULL),
(485, '155faf23-9479-46d9-bdc6-db9abb70dd72', 'O6321GD006', 'O6321GD006', 'Motor Grader Komatsu GD 535-5', NULL, NULL, '63', '6321', '6321', NULL, 10, 'active', 0.0, 0.0, 'TAPG-8SJ54KQX', 'KMTGD033VJA001172', 'KMTGD033VJA001172', 'SAA6D107E-1 26679302', 'SAA6D107E-1 26679302', '40400007', '40400007', 'O6321GD006', 'O6321GD006', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:46:28', NULL),
(486, 'd581c66c-d058-4dbf-9e9e-c7e2805af77a', 'O6321GD007', 'O6321GD007', 'Motor Grader Komatsu GD 535-5', NULL, NULL, '63', '6321', '6321', NULL, 10, 'active', 0.0, 0.0, 'TAPG-VCFWBVFF', 'KMTGD033EMXJ10254', 'KMTGD033EMXJ10254', 'SAA6D107E-1 26750071', 'SAA6D107E-1 26750071', '40300008', '40300008', 'O6321GD007', 'O6321GD007', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:46:28', NULL),
(487, '9bab1042-5e52-4fe4-9b46-33571a4c075c', 'O6321GD008', 'O6321GD008', 'MOTOR GRADER KOMATSU GD 535-5', NULL, NULL, '63', '6321', '6321', NULL, 10, 'active', 0.0, 0.0, 'TAPG-GJA95AYO', 'KMTGD033CMXJ10389', 'KMTGD033CMXJ10389', 'SAA6D107E-1 26774169', 'SAA6D107E-1 26774169', '40300016', '40300016', NULL, NULL, NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:46:28', NULL),
(488, '1ca1a284-7691-4780-a690-ae4bc1df0015', 'O6321GD009', 'O6321GD009', 'MOTOR GRADER KOMATSU GD 535-5', NULL, NULL, '63', '6321', '6321', NULL, 10, 'active', 0.0, 0.0, 'TAPG-X0YJFRFR', 'KMTGD033EMXJ10402', 'KMTGD033EMXJ10402', 'SAA6D107E-1 26775759', 'SAA6D107E-1 26775759', '40300017', '40300017', NULL, NULL, NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:46:28', NULL),
(489, '2888566f-1010-47d6-8b5b-096bf005b3b4', 'O6321HL001', 'O6321HL001', 'HOOK LIFT TRUCK HINO DUTRO 130 HD', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-ETDTGP4D', 'MJEC1JG43K5187902', 'MJEC1JG43K5187902', 'W04DTRR77347', 'W04DTRR77347', NULL, NULL, 'KT 8449 NP', 'KT 8449 NP', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:41', NULL),
(490, '65b0fc66-e0a9-426f-ac01-22f2e41418f2', 'O6321HL002', 'O6321HL002', 'HOOK LIFT TRUCK HINO DUTRO 130 HD', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-4BCPB5Z4', 'MJEC1JG43K5187903', 'MJEC1JG43K5187903', 'W04DTRR77348', 'W04DTRR77348', NULL, NULL, 'KT 8443 NP', 'KT 8443 NP', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:41', NULL),
(491, 'd6fb288f-d437-4755-8113-f700be956e10', 'O6321HL003', 'O6321HL003', 'HOOK LIFT TRUCK HINO DUTRO 130 HD', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-HGMIWYDR', 'MJEC1JG43K5187904', 'MJEC1JG43K5187904', 'W04DTRR77349', 'W04DTRR77349', NULL, NULL, 'KT 7745 YD', 'KT 7745 YD', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:41', NULL),
(492, '6df8e483-b84e-4206-b529-a45203326966', 'O6321HL004', 'O6321HL004', 'HOOK LIFT TRUCK HINO DUTRO EURO4', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-BVD8VDVW', 'MJECCB2F3N5007539', 'MJECCB2F3N5007539', 'N04CWYJ16545', 'N04CWYJ16545', '40100150', '40100150', 'O6321HL004', 'O6321HL004', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(493, '84d1cf48-a31b-4287-bcf7-4c015a86cdc9', 'O6321HL005', 'O6321HL005', 'HOOK LIFT TRUCK HINO DUTRO EURO4', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-Y5ZZDWM5', 'MJECCB2F2N5007693', 'MJECCB2F2N5007693', 'N04CWYJ16734', 'N04CWYJ16734', '40100149', '40100149', 'O6321HL005', 'O6321HL005', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(494, 'c2829926-f180-43c2-96ee-8fc237a841ca', 'O6321HL006', 'O6321HL006', 'HOOK LIFT TRUCK HINO DUTRO EURO4', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-EU202NYT', 'MJECCB2F1N5007605', 'MJECCB2F1N5007605', 'N04CWYJ16656', 'N04CWYJ16656', '40100148', '40100148', 'O6321HL006', 'O6321HL006', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(495, 'b610e26f-826e-4892-b7b9-c902ea7e8e48', 'O6321HL007', 'O6321HL007', 'HOOK LIFT TRUCK HINO RANGER FG260', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-4TOCWK7H', 'MJEFG8JJ2PJP10703', 'MJEFG8JJ2PJP10703', 'J08EWEJ18083', 'J08EWEJ18083', '40100197', '40100197', 'O6321HL007', 'O6321HL007', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(496, '73b00f9a-7cb8-41da-bc16-11c0821daff2', 'O6321MB013', 'O6321MB013', 'MOBIL TOYOTA NEW HILUX GUN12DCGMT01 2.4G', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-TRZM87JB', 'MR0KB8CD9J1205863', 'MR0KB8CD9J1205863', '2GD4468651-40974', '2GD4468651-40974', '40100252', '40100252', 'O6321MB013', 'O6321MB013', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:46:28', NULL),
(497, '79cb6153-7b92-41b1-8219-184632919cb1', 'O6321MB015', 'O6321MB015', 'MOBIL MITSUBISHI TRITON ALL NEW MTCE-INT', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-GAPQBTCE', 'MMBENKL30JH049402', 'MMBENKL30JH049402', '4D56UAT9486', '4D56UAT9486', NULL, NULL, 'O6321MB015', 'O6321MB015', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:46:28', NULL),
(498, '5c8bbd68-246e-4f24-b236-9a62f9f0ddd0', 'O6321MB018', 'O6321MB018', 'MOBIL TOYOTA HILUX DC (INTERNAL)', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-DVDFUWT6', 'MR0KB8CD8K1121078', 'MR0KB8CD8K1121078', '2GD4651012', '2GD4651012', NULL, NULL, 'KT 8577 NN', 'KT 8577 NN', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:46:28', NULL),
(499, '9874c447-065a-4793-80d2-458b536a99f1', 'O6321MB019', 'O6321MB019', 'MOBIL PAJERO SPORT 2.5GLX-H 5M/T-INTERNA', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-SO0F0MUE', 'MK2KSWMDNK1000742', 'MK2KSWMDNK1000742', '4D56UAX3838', '4D56UAX3838', NULL, NULL, 'O6321MB019', 'O6321MB019', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:46:28', NULL),
(500, 'eea5b6c0-4f34-41ea-8183-54a0e3328e5f', 'O6321MB020', 'O6321MB020', 'MOBIL TOYOTA HILUX GUN 120DCGM-INT', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-KNIDQK9Y', 'MROKB8CD1K1123496', 'MROKB8CD1K1123496', '2GD0776114', '2GD0776114', NULL, NULL, 'O6321MB020', 'O6321MB020', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:46:28', NULL),
(501, 'cb671877-cd99-47ab-922b-fe7fa2a47b74', 'O6321MB023', 'O6321MB023', 'MOBIL TOYOTA HILUX DC', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-UCR3A7UO', 'MR0KB8CDXM1214608', 'MR0KB8CDXM1214608', '2GD5120971', '2GD5120971', '40100140', '40100140', 'KT 8277 GJ', 'KT 8277 GJ', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:46:28', NULL),
(502, 'c5e9618d-010c-4e47-b798-046b31865ca6', 'O6321MB024', 'O6321MB024', 'MOBIL TOYOTA HILUX 2.5G DC 4WD M/T', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-UEHVKYDZ', 'MR0KB8CD0J1206495', 'MR0KB8CD0J1206495', '2GD0500728', '2GD0500728', NULL, NULL, 'O6321MB024', 'O6321MB024', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:46:28', NULL),
(503, '7ec4bb09-6291-4a5e-b253-a283c1a978cb', 'O6321MB025', 'O6321MB025', 'MOBIL MITSUBISHI PAJERO SPORT', NULL, NULL, '63', '6321', '6321', NULL, 18, 'active', 0.0, 0.0, 'TAPG-LANAE6WG', 'MK2KSWMDNPJ000253', 'MK2KSWMDNPJ000253', '4D56UBK3874', '4D56UBK3874', '40100204', '40100204', 'KT 1140 IG', 'KT 1140 IG', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:46:28', NULL),
(504, '6f826228-1e6b-4ce3-b667-ec02bdff8d2e', 'O6321MP001', 'O6321MP001', 'SEPEDA MOTOR HONDA VERZA CB150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-FKQIAEHE', 'MH1KC0215RK261903', 'MH1KC0215RK261903', 'KC02E1261360', 'KC02E1261360', NULL, NULL, 'KT2342XY', 'KT2342XY', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(505, '2b5aed08-990b-43c3-83f3-364e6d64c9de', 'O6321MP002', 'O6321MP002', 'SEPEDA MOTOR HONDA VERZA CB150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-VFSOWENU', 'MH1KC0213RK264198', 'MH1KC0213RK264198', 'KC02E1263724', 'KC02E1263724', '40100261', '40100261', 'KT8900XY', 'KT8900XY', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(506, 'f7e1a105-8d43-4ce9-85bf-5d19c8fcb589', 'O6321MP003', 'O6321MP003', 'SEPEDA MOTOR HONDA VERZA CB150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-7MATUEYZ', 'MH1KC0218RK258848', 'MH1KC0218RK258848', 'KC02E1258470', 'KC02E1258470', '40100260', '40100260', 'KT2340XY', 'KT2340XY', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(507, '86d783e2-082e-4f40-9f02-5b1152a98b28', 'O6321MP005', 'O6321MP005', 'SEPEDA MOTOR HONDA VERZA CB150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-IGTAGNPM', 'MH1KC0216RK264230', 'MH1KC0216RK264230', 'KC02E1263685', 'KC02E1263685', NULL, NULL, 'KT5670XY', 'KT5670XY', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(508, '100a0d7c-61df-495b-aeea-0655e5a029d6', 'O6321MP006', 'O6321MP006', 'SEPEDA MOTOR HONDA VERZA CB150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-ARFX7TAO', 'MH1KC0218RK274628', 'MH1KC0218RK274628', 'KC02E1274169', 'KC02E1274169', '40100210', '40100210', 'KT2301XY', 'KT2301XY', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(509, 'c83de977-31ae-4fa1-a213-4f95abb12363', 'O6321MP007', 'O6321MP007', 'SEPEDA MOTOR HONDA VERZA CB150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-GMJSRAYT', 'MH1KC0211RK275717', 'MH1KC0211RK275717', 'KC02E1275244', 'KC02E1275244', '40100207', '40100207', 'KT2302XY', 'KT2302XY', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(510, '3b2b36fc-68d4-4a72-a3a2-13bca61c912f', 'O6321MP008', 'O6321MP008', 'SEPEDA MOTOR HONDA VERZA CB150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-WSPKZUNH', 'MH1KC0215RK275896', 'MH1KC0215RK275896', 'KC02E1275416', 'KC02E1275416', '40100209', '40100209', 'KT2300XY', 'KT2300XY', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(511, 'fdc7a59c-2cfc-4ac7-ada9-299bc1f14dc3', 'O6321MP009', 'O6321MP009', 'SEPEDA MOTOR HONDA SUPRA X-125', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-RUSV6TZW', 'MH1JBP12XSK099984', 'MH1JBP12XSK099984', 'JBP1E2100009', 'JBP1E2100009', '40100245', '40100245', NULL, NULL, NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(512, 'c0da92b6-cd8d-4847-8a17-d8e3dc0a923a', 'O6321MP010', 'O6321MP010', 'SEPEDA MOTOR HONDA VERZA CB150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-FZON36CG', 'MH1KC0417SK006527', 'MH1KC0417SK006527', 'KC04E1006492', 'KC04E1006492', '40100257', '40100257', 'KT2344XY', 'KT2344XY', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(513, 'b7da98af-d488-40b1-a520-97e38d54fa94', 'O6321MP011', 'O6321MP011', 'SEPEDA MOTOR HONDA VERZA CB150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-CFZOCRJN', 'MH1KC0410SK007633', 'MH1KC0410SK007633', 'KC04E1007654', 'KC04E1007654', '40100258', '40100258', 'KT6767XY', 'KT6767XY', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(514, 'a99588e8-8094-4fcf-95ad-77496fb2ac4c', 'O6321SL001', 'O6321SL001', 'SELF LOADER HINO FM280JW', NULL, NULL, '63', '6321', '6321', NULL, 15, 'active', 0.0, 0.0, 'TAPG-DJQRU60W', 'MJEFM8JW2NJX10337', 'MJEFM8JW2NJX10337', 'J08EWDJ14663', 'J08EWDJ14663', '40100147', '40100147', 'O6321SL001', 'O6321SL001', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(515, '82240401-9840-4ddc-9bab-5652a60a5e5a', 'O6321SM002', 'O6321SM002', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-CUOEBNGH', 'MH1KC5217EK169893', 'MH1KC5217EK169893', 'KC52E1168077', 'KC52E1168077', '40100060', '40100060', 'KT6153GC', 'KT6153GC', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(516, 'cbc0816e-3633-4c38-b633-0179cf0bb40b', 'O6321SM003', 'O6321SM003', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-SU8Y0UZ8', 'MH1KC5211EK183997', 'MH1KC5211EK183997', 'KC52E1182218', 'KC52E1182218', '40100059', '40100059', 'KT6155GC', 'KT6155GC', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(517, 'c2da757e-bb2d-4c9d-bbf7-c316b5db92d0', 'O6321SM004', 'O6321SM004', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-JVNQEGXF', 'MH1KC5215FK123838', 'MH1KC5215FK123838', 'KC52E1221443', 'KC52E1221443', '40100061', '40100061', 'KT6889GE', 'KT6889GE', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(518, '9808be04-708b-4a2e-80d9-7bb2e89e7137', 'O6321SM005', 'O6321SM005', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-U0H0T0ZP', 'MH1KC5211FK234576', 'MH1KC5211FK234576', 'KC52E1231958', 'KC52E1231958', '40100062', '40100062', 'KT6890GE', 'KT6890GE', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(519, 'a318791a-f738-4cbf-9d36-a61dcc818ac9', 'O6321SM006', 'O6321SM006', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-LTXURYCY', 'MH1KC5216FK234752', 'MH1KC5216FK234752', 'KC52E1232711', 'KC52E1232711', '40100063', '40100063', 'KT6887GE', 'KT6887GE', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(520, '1869f1cb-485c-4709-a8fe-8928830d69d2', 'O6321SM008', 'O6321SM008', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-BBLENTA3', 'MH1KC5214HK341799', 'MH1KC5214HK341799', 'KC52E1338224', 'KC52E1338224', '40100065', '40100065', 'KT6014GL', 'KT6014GL', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(521, '45d2cbad-4e59-4ae7-ba85-fe4e955104d4', 'O6321SM009', 'O6321SM009', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-4HOESUDP', 'MH1KC5219HK343046', 'MH1KC5219HK343046', 'KC52E1339560', 'KC52E1339560', '40100066', '40100066', 'KT6016GL', 'KT6016GL', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(522, '9511576e-2b10-4514-b6af-7bf4ef4ab834', 'O6321SM010', 'O6321SM010', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-HKJBMOSX', 'MH1KC5215HK343027', 'MH1KC5215HK343027', 'KC52E1339542', 'KC52E1339542', '40100067', '40100067', 'KT6017GL', 'KT6017GL', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(523, '851813b1-8244-43a1-8fd8-bd3e6163fbe9', 'O6321SM015', 'O6321SM015', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-EOZSRWTK', 'MH4LX150CCKP58644', 'MH4LX150CCKP58644', 'LX150CEP91423', 'LX150CEP91423', '40100051', '40100051', 'KT 6793 GA', 'KT 6793 GA', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(524, '8dd63c3e-ad42-451a-b5b9-12ba72a07c13', 'O6321SM036', 'O6321SM036', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-WOAGMCTM', 'MH4LX150CCKP52757', 'MH4LX150CCKP52757', 'LX150CEP81026', 'LX150CEP81026', '40100050', '40100050', 'KT 6757 GA', 'KT 6757 GA', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(525, 'cbf644e3-241d-4ab4-b440-e1e31825cf58', 'O6321SM037', 'O6321SM037', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-NL8YAUTU', 'MH4LX150CCKP57103', 'MH4LX150CCKP57103', 'LX150CEP89062', 'LX150CEP89062', '40100036', '40100036', 'KT 6769 GA', 'KT 6769 GA', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(526, '332d4d90-7bc5-445d-8981-60cd4f91eb7c', 'O6321SM041', 'O6321SM041', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-2QFBXS0Z', 'MH1KC521XJK372853', 'MH1KC521XJK372853', 'KC52E1369480', 'KC52E1369480', '40100069', '40100069', 'KT4749GI', 'KT4749GI', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(527, '77c881e7-9555-45c3-b4c9-0050dde1f8d2', 'O6321SM043', 'O6321SM043', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-8N4WJ8X1', 'MH1KC5210JK372862', 'MH1KC5210JK372862', 'KC52E1369591', 'KC52E1369591', '40100071', '40100071', 'KT4797GH', 'KT4797GH', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(528, '1042fa32-91a2-40ac-bbe7-d37d75e7a860', 'O6321SM045', 'O6321SM045', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-FLKCUS0A', 'MH1KC5219JK373170', 'MH1KC5219JK373170', 'KC52E1369699', 'KC52E1369699', '40100073', '40100073', 'KT4665GH', 'KT4665GH', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(529, '47d261c6-ad70-4f3c-8b08-3f5a53c32877', 'O6321SM046', 'O6321SM046', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-A42P2HGJ', 'MH1KC0215JK003143', 'MH1KC0215JK003143', 'KC02E1003133', 'KC02E1003133', '40100086', '40100086', 'KT6107GI', 'KT6107GI', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(530, '1e1c4dbb-6bf5-4b0c-8311-da37f0a15b89', 'O6321SM047', 'O6321SM047', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-ZJEUY9MO', 'MH1KC021XJK002750', 'MH1KC021XJK002750', 'KC02E1002593', 'KC02E1002593', '40100087', '40100087', 'KT6114GI', 'KT6114GI', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(531, 'ee99a72c-607a-42d3-b3a2-4c2b6935d258', 'O6321SM048', 'O6321SM048', 'Sepeda Motor Honda Verza 150 CC PGM FI', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-IQV1HRX3', 'MH1KC0219JK011441', 'MH1KC0219JK011441', 'KC02E1011403', 'KC02E1011403', '40100088', '40100088', 'KT4799GH', 'KT4799GH', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(532, '6fa9316f-1f72-4ce4-a3b6-f79d1c095567', 'O6321SM049', 'O6321SM049', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-ZKBF0FCD', 'MH4LX150GJJP63183', 'MH4LX150GJJP63183', 'LX150CEW96192', 'LX150CEW96192', '40100089', '40100089', 'KT6034GW', 'KT6034GW', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(533, '737213dd-c09f-468f-a1b5-0791054300ee', 'O6321SM050', 'O6321SM050', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-PRLNDPCB', 'MH4LX150GJJP62884', 'MH4LX150GJJP62884', 'LX150CEW96874', 'LX150CEW96874', '40100090', '40100090', 'KT6035GW', 'KT6035GW', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(534, '7403c43d-9d70-472e-baf6-53bb6ec7efa4', 'O6321SM051', 'O6321SM051', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-Y7YUY9RZ', 'MH4LX150GJJP63995', 'MH4LX150GJJP63995', 'LX150CEW98822', 'LX150CEW98822', '40100091', '40100091', 'KT6033GW', 'KT6033GW', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(535, 'fc60884c-f3dc-4da8-9e66-f1f2317463b4', 'O6321SM052', 'O6321SM052', 'Sepeda Motor Kawasaki KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-ENKQBS9D', 'MH4LX150GJJP64194', 'MH4LX150GJJP64194', 'LX150CEWA0125', 'LX150CEWA0125', '40100092', '40100092', 'KT6036GW', 'KT6036GW', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(536, '9a44ec10-1d41-4f09-a9eb-23cd47709a9b', 'O6321SM059', 'O6321SM059', 'SEPEDA MOTOR 125CC SUPRA X HONDA(GDG Est', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-IEPEQMJS', 'MH1JBP11XJK649741', 'MH1JBP11XJK649741', 'JBP1E1649608', 'JBP1E1649608', '40100097', '40100097', 'KT6384GT', 'KT6384GT', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(537, 'a996628d-7e52-47fb-be68-109169f908af', 'O6321SM060', 'O6321SM060', 'SEPEDA MOTOR KAWASAKI KLX150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-TCWZOGXI', 'MH4LX150GJJP68567', 'MH4LX150GJJP68567', 'LX150CEWB2785', 'LX150CEWB2785', '40100098', '40100098', 'KT6182GW', 'KT6182GW', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(538, '9c040121-1af6-4c4b-8b16-1a00a9100b23', 'O6321SM061', 'O6321SM061', 'SEPEDA MOTOR KAWASAKI KLX150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-NIJJ4UQO', 'MH4LX150GJJP68743', 'MH4LX150GJJP68743', 'LX150CEWB3474', 'LX150CEWB3474', '40100099', '40100099', 'KT6190GW', 'KT6190GW', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(539, '7f8ebe2a-3706-4951-8c10-45ef617f95b9', 'O6321SM063', 'O6321SM063', 'SEPEDA MOTOR HONDA VERZA CB150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-ZWMLCHLF', 'MH1KC5216EK169206', 'MH1KC5216EK169206', 'KC52E1167490', 'KC52E1167490', NULL, NULL, 'KT6334GC', 'KT6334GC', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(540, '60cd0a7c-531a-461d-a61a-02cc96c8f0cb', 'O6321SM064', 'O6321SM064', 'SEPEDA MOTOR HONDA VERZA CB150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-RRVODJNW', 'MH1KC5214EK184285', 'MH1KC5214EK184285', 'KC52E1182722', 'KC52E1182722', NULL, NULL, 'KT6335GC', 'KT6335GC', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(541, 'ac69c7bd-ceda-4790-a961-d7db4d3585f3', 'O6321SM065', 'O6321SM065', 'SEPEDA MOTOR HONDA VERZA CB150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-T55JV4OO', 'MH1KC5213EK218135', 'MH1KC5213EK218135', 'KC52E1216406', 'KC52E1216406', NULL, NULL, 'KT6948GC', 'KT6948GC', NULL, NULL, '2026-05-19 19:37:11', '2026-05-19 19:44:42', NULL),
(542, 'ac913998-6625-407a-8c57-3af71532f97b', 'O6321SM066', 'O6321SM066', 'SEPEDA MOTOR HONDA VERZA CB150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-RIX4HLR9', 'MH1KC5213EK192460', 'MH1KC5213EK192460', 'KC52E1190835', 'KC52E1190835', NULL, NULL, 'KT6947GC', 'KT6947GC', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:44:42', NULL),
(543, '900b0f82-699d-4ca5-8ee3-bc50e2f70523', 'O6321SM067', 'O6321SM067', 'SEPEDA MOTOR HONDA VERZA 150CC', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-DRXLK3H5', 'MH1KC0210KK082576', 'MH1KC0210KK082576', 'KC02E1082856', 'KC02E1082856', '40100106', '40100106', 'KT6874GP', 'KT6874GP', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:44:42', NULL),
(544, '5fdb854b-6ace-4735-a4b2-89327019f6a5', 'O6321SM068', 'O6321SM068', 'SEPEDA MOTOR HONDA VERZA 150CC', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-WFDRZFIY', 'MH1KC0215KK086817', 'MH1KC0215KK086817', 'KC02E1087323', 'KC02E1087323', '40100107', '40100107', 'KT6872GP', 'KT6872GP', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:44:42', NULL),
(545, 'e2d248e7-8409-470a-9e29-0c3b7f6ded4f', 'O6321SM075', 'O6321SM075', 'SEPEDA MOTOR KAWASAKI KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-OSALWULF', 'MH4LX150GJJP71949', 'MH4LX150GJJP71949', 'LX150CEWC6617', 'LX150CEWC6617', '40100041', '40100041', 'KT6199GW', 'KT6199GW', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:44:42', NULL),
(546, 'f9287e2a-3ee5-4c3a-8fa9-8c19b951d83c', 'O6321SM076', 'O6321SM076', 'SEPEDA MOTOR KAWASAKI KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-USBKL7FM', 'MH4LX150GJJP72711', 'MH4LX150GJJP72711', 'LX150CEWC9545', 'LX150CEWC9545', '40100032', '40100032', 'KT6219GW', 'KT6219GW', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:44:42', NULL),
(547, '22246f36-6a0c-4db3-873c-f18114672afb', 'O6321SM077', 'O6321SM077', 'SEPEDA MOTOR HONDA VERZA 150CC', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-6E40C79F', 'MH1KC0214MK163700', 'MH1KC0214MK163700', 'KC02E1163060', 'KC02E1163060', '40100141', '40100141', 'KT4080FQ', 'KT4080FQ', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:44:42', NULL),
(548, '50b8bad2-e748-4a33-90a4-f1b3367cc593', 'O6321SM078', 'O6321SM078', 'SEPEDA MOTOR HONDA VERZA 150CC', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-4EJRQLW0', 'MH1KC0219MK163160', 'MH1KC0219MK163160', 'KC02E1162661', 'KC02E1162661', '40100142', '40100142', 'KT4082FQ', 'KT4082FQ', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:44:42', NULL),
(549, '1fa67295-6e1c-4553-87a5-9a8a41fa78ee', 'O6321SM079', 'O6321SM079', 'SEPEDA MOTOR HONDA VERZA 150CC', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-MNTTWWJ8', 'MH1KC0214MK163681', 'MH1KC0214MK163681', 'KC02E1163093', 'KC02E1163093', '40100143', '40100143', 'KT4081FQ', 'KT4081FQ', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:44:42', NULL),
(550, '46e8808e-bb27-4b25-a2c2-b1cd03a9a95d', 'O6321SM080', 'O6321SM080', 'SEPEDA MOTOR HONDA VERZA 150CC', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-CSY7FJ65', 'MH1KC021XNK162276', 'MH1KC021XNK162276', 'KC02E1161793', 'KC02E1161793', '40100144', '40100144', 'KT4088FQ', 'KT4088FQ', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:44:42', NULL),
(551, 'b9cc317c-4230-4028-beb4-e677e11d44bf', 'O6321SM082', 'O6321SM082', 'SEPEDA MOTOR KAWASAKI KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-YWHXCYPO', 'MH4LX150GNJP97138', 'MH4LX150GNJP97138', 'LX150CEWY4543', 'LX150CEWY4543', '40100181', '40100181', 'KT5378FG', 'KT5378FG', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:44:42', NULL),
(552, '80c002ef-b4e6-44fd-969e-87494440feb9', 'O6321SM083', 'O6321SM083', 'SEPEDA MOTOR KAWASAKI KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-QYMAKWCO', 'MH4LX150GNJP97146', 'MH4LX150GNJP97146', 'LX150CEWY4852', 'LX150CEWY4852', '40100182', '40100182', 'KT5379FG', 'KT5379FG', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:44:42', NULL),
(553, '150b12f6-f7b4-410d-8208-dfda50212d88', 'O6321SM084', 'O6321SM084', 'SEPEDA MOTOR KAWASAKI KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-F5LWDTN7', 'MH4LX150GNJP97137', 'MH4LX150GNJP97137', 'LX150CEWY4547', 'LX150CEWY4547', '40100173', '40100173', 'KT5381FG', 'KT5381FG', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:44:42', NULL),
(554, '2a3c3a68-3ce3-4353-a758-737a1b939424', 'O6321SM085', 'O6321SM085', 'SEPEDA MOTOR KAWASAKI KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-LXS94HQI', 'MH4LX150GNJP97160', 'MH4LX150GNJP97160', 'LX150CEWY4850', 'LX150CEWY4850', '40100174', '40100174', 'KT5380FG', 'KT5380FG', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:44:42', NULL),
(555, 'c7609af4-845c-49b0-b76a-2164ca2fdef7', 'O6321SM086', 'O6321SM086', 'SEPEDA MOTOR KAWASAKI KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-VD0OJBEV', 'MH4LX150GNJP97130', 'MH4LX150GNJP97130', 'LX150CEWY4539', 'LX150CEWY4539', '40100175', '40100175', 'KT5382FG', 'KT5382FG', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:44:42', NULL),
(556, 'c59dcbf6-77a2-482e-a22a-94d6d1c85503', 'O6321SM087', 'O6321SM087', 'SEPEDA MOTOR HONDA VERZA 150CC', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-GTLBQV5K', 'MH1KC5211JK373194', 'MH1KC5211JK373194', 'KC52E1369775', 'KC52E1369775', NULL, NULL, 'KT6103GI', 'KT6103GI', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:44:43', NULL),
(557, '90b71d71-991f-4916-84e1-d9f10a76bce8', 'O6321SM088', 'O6321SM088', 'SEPEDA MOTOR KAWASAKI KLX 150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-NCE1GIVC', 'MH4LX150GJJP70159', 'MH4LX150GJJP70159', 'LX150CEWC0841', 'LX150CEWC0841', NULL, NULL, 'KT6221GW', 'KT6221GW', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:44:43', NULL),
(558, 'e979238b-f394-4fd3-a86b-0c655b8d1953', 'O6321SM089', 'O6321SM089', 'SEPEDA MOTOR HONDA VERZA CB150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-DW7INP1O', 'MH1KC0212NK188001', 'MH1KC0212NK188001', 'KC02E1187509', 'KC02E1187509', NULL, NULL, 'KT4862FQ', 'KT4862FQ', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:44:43', NULL),
(559, 'ff5bed21-3e50-453a-8744-a2f450ed298f', 'O6321SM090', 'O6321SM090', 'SEPEDA MOTOR KAWASAKI KLX 150G', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-2YQUNKQE', 'MH4LX150GNJP95566', 'MH4LX150GNJP95566', 'LX150CEWX2409', 'LX150CEWX2409', NULL, NULL, 'KT4810FP', 'KT4810FP', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:44:43', NULL),
(560, 'c1e5628f-2309-40e9-9ab6-a86850816886', 'O6321SM091', 'O6321SM091', 'SEPEDA MOTOR HONDA VERZA CB150', NULL, NULL, '63', '6321', '6321', NULL, 17, 'active', 0.0, 0.0, 'TAPG-LL8YCRMM', 'MH1KC5210JK372859', 'MH1KC5210JK372859', 'KC52E1369602', 'KC52E1369602', NULL, NULL, 'O6321SM091', 'O6321SM091', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:44:43', NULL),
(561, '133d4cdf-2f01-4d56-8e6f-596de9907f74', 'O6321TT002', 'O6321TT002', 'TRUK TANGKI HINO DUTRO D130HD-CHEMIST IN', NULL, NULL, '63', '6321', '6321', NULL, 19, 'active', 0.0, 0.0, 'TAPG-XVTNUIZB', 'MJEC1JG43K5177729', 'MJEC1JG43K5177729', 'W04DTRR67420', 'W04DTRR67420', NULL, NULL, 'O6321TT002', 'O6321TT002', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:46:28', NULL),
(562, 'c130f3f3-52b4-49be-b0d9-278bfbe68633', 'O6321TT003', 'O6321TT003', 'TRUK TANGKI HINO DUTRO D130HD-CHEMIST IN', NULL, NULL, '63', '6321', '6321', NULL, 19, 'active', 0.0, 0.0, 'TAPG-NNVKMEPF', 'MJEC1JG43K5177728', 'MJEC1JG43K5177728', 'W04DTRR67419', 'W04DTRR67419', NULL, NULL, 'KT 8813 NN', 'KT 8813 NN', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:46:28', NULL);
INSERT INTO `assets` (`id`, `public_uuid`, `code`, `io_code`, `name`, `brand`, `model`, `company_code`, `plant_code`, `plant`, `year`, `category_id`, `status`, `current_hm`, `current_km`, `qr_code`, `serial_number`, `chasis_no`, `engine_number`, `engine_no`, `sap_asset_no`, `asset_no`, `plate_number`, `veh_plate_no`, `notes`, `photo`, `created_at`, `updated_at`, `deleted_at`) VALUES
(563, '97e4b2c4-c5d2-4077-afe8-0609c8036ea9', 'O6321TT004', 'O6321TT004', 'TRUK TANGKI HINO DUTRO D130HD-CHEMIST IN', NULL, NULL, '63', '6321', '6321', NULL, 19, 'active', 0.0, 0.0, 'TAPG-FK8I3BSZ', 'MJEC1JG43K5177597', 'MJEC1JG43K5177597', 'W04DTRR67278', 'W04DTRR67278', NULL, NULL, 'KT 8153 NO', 'KT 8153 NO', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:46:28', NULL),
(564, 'e5726297-db72-4906-8626-2859f5d78c5c', 'O6321TT005', 'O6321TT005', 'TRUK TANGKI CPO TOYOTA D130HD', NULL, NULL, '63', '6321', '6321', NULL, 19, 'active', 0.0, 0.0, 'TAPG-XHSIE5IM', 'MJEC1JG43K5178082', 'MJEC1JG43K5178082', 'W04DTRR67773', 'W04DTRR67773', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:46:28', NULL),
(565, '88bdace8-cb50-44c9-af1f-014744d66f13', 'O6321TT007', 'O6321TT007', 'TRUCK TANGKI HINO DUTRO EURO4', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-ICWI7IH7', 'MJECCB2F0P5003984', 'MJECCB2F0P5003984', 'N04CWYJ23870', 'N04CWYJ23870', '40100195', '40100195', NULL, NULL, NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:47:16', NULL),
(566, '6ac3c275-1a19-48fd-9067-c89697bcc68b', 'O6321TT008', 'O6321TT008', 'TRUCK TANGKI HINO DUTRO EURO4', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-N65HMGZ5', 'MJECCB2F9R5021788', 'MJECCB2F9R5021788', 'N04CWYJ31844', 'N04CWYJ31844', '40100206', '40100206', 'O6321TT008', 'O6321TT008', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:47:16', NULL),
(567, 'a79e798e-a869-4180-b1f3-4989da6004e9', 'O6321TT009', 'O6321TT009', 'TRUCK TANGKI HINO DUTRO EURO4', NULL, NULL, '63', '6321', '6321', NULL, 9, 'active', 0.0, 0.0, 'TAPG-2UAQTVL6', 'MJECCB2F6S5026890', 'MJECCB2F6S5026890', 'N04CWYJ37041', 'N04CWYJ37041', '40100263', '40100263', 'O6321TT009', 'O6321TT009', NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:47:16', NULL),
(568, '44f4a694-691f-49e2-a3cb-f4096f38718a', 'O6321VC007', 'O6321VC007', 'COMPACTOR BOMAG BW211D-40 SL', NULL, NULL, '63', '6321', '6321', NULL, 20, 'active', 0.0, 0.0, 'TAPG-EV3DKWZH', '961582391285', '961582391285', '93055824', '93055824', '40300014', '40300014', NULL, NULL, NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:46:28', NULL),
(569, 'c8e76b23-ad00-44ae-aa23-16bf3924649e', 'O6321VC008', 'O6321VC008', 'COMPACTOR BOMAG BW211D-40 SL', NULL, NULL, '63', '6321', '6321', NULL, 20, 'active', 0.0, 0.0, 'TAPG-LORBFIV9', '961582391310', '961582391310', '93078678', '93078678', '40300015', '40300015', NULL, NULL, NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:46:28', NULL),
(570, '75a8f6a8-9173-4637-9377-25f2c02dd228', 'O6321VC009', 'O6321VC009', 'COMPACTOR BOMAG BW211D-40 SL', NULL, NULL, '63', '6321', '6321', NULL, 20, 'active', 0.0, 0.0, 'TAPG-U9TWCTSV', '961582391575', '961582391575', '93214071', '93214071', '40100205', '40100205', NULL, NULL, NULL, NULL, '2026-05-19 19:37:12', '2026-05-19 19:46:28', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `asset_categories`
--

CREATE TABLE `asset_categories` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `asset_categories`
--

INSERT INTO `asset_categories` (`id`, `name`, `icon`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(7, 'Excavator', '🚧', 'Alat gali', 1, '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(8, 'Bulldozer', '🚜', 'Alat dorong', 1, '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(9, 'Dump Truck', '🚛', 'Truk pengangkut', 1, '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(10, 'Motor Grader', '🛤️', 'Alat perataan', 1, '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(11, 'Crane', '🏗️', 'Alat angkat', 1, '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(15, 'Loader', NULL, 'Auto-created by asset import', 1, '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(16, 'Bus', NULL, 'Auto-created by asset import', 1, '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(17, 'General Asset', NULL, 'Auto-created by asset import', 1, '2026-05-19 19:37:08', '2026-05-19 19:37:08'),
(18, 'Light Vehicle', NULL, 'Auto-created by asset import', 1, '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(19, 'Water Truck', NULL, 'Auto-created by asset import', 1, '2026-05-19 19:46:27', '2026-05-19 19:46:27'),
(20, 'Compactor', NULL, 'Auto-created by asset import', 1, '2026-05-19 19:46:27', '2026-05-19 19:46:27');

-- --------------------------------------------------------

--
-- Table structure for table `asset_documents`
--

CREATE TABLE `asset_documents` (
  `id` bigint UNSIGNED NOT NULL,
  `asset_id` bigint UNSIGNED NOT NULL,
  `type` enum('stnk','bpkb','kir','insurance','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issued_at` date DEFAULT NULL,
  `expired_at` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `asset_locations`
--

CREATE TABLE `asset_locations` (
  `id` bigint UNSIGNED NOT NULL,
  `asset_id` bigint UNSIGNED NOT NULL,
  `lat` decimal(10,8) NOT NULL,
  `lng` decimal(11,8) NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recorded_by` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `asset_photos`
--

CREATE TABLE `asset_photos` (
  `id` bigint UNSIGNED NOT NULL,
  `asset_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `asset_preventive_settings`
--

CREATE TABLE `asset_preventive_settings` (
  `id` bigint UNSIGNED NOT NULL,
  `asset_id` bigint UNSIGNED NOT NULL,
  `trigger_type` enum('hm','km','calendar') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hm',
  `alert_before_value` decimal(10,1) NOT NULL DEFAULT '25.0',
  `escalation_target` enum('planner','supervisor','planner_supervisor') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'planner_supervisor',
  `auto_create_work_order` tinyint(1) NOT NULL DEFAULT '1',
  `notification_channels` json DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `asset_workshop_histories`
--

CREATE TABLE `asset_workshop_histories` (
  `id` bigint UNSIGNED NOT NULL,
  `asset_id` bigint UNSIGNED NOT NULL,
  `reference_no` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` enum('preventive','corrective','breakdown','refurbish') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'corrective',
  `date_in` date DEFAULT NULL,
  `date_out` date DEFAULT NULL,
  `issue` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action_taken` text COLLATE utf8mb4_unicode_ci,
  `cost` decimal(14,2) NOT NULL DEFAULT '0.00',
  `downtime_hours` int UNSIGNED NOT NULL DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hm_logs`
--

CREATE TABLE `hm_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `asset_id` bigint UNSIGNED NOT NULL,
  `hm_value` decimal(10,1) NOT NULL DEFAULT '0.0',
  `km_value` decimal(10,1) NOT NULL DEFAULT '0.0',
  `recorded_by` bigint UNSIGNED NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `recorded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hm_logs`
--

INSERT INTO `hm_logs` (`id`, `asset_id`, `hm_value`, `km_value`, `recorded_by`, `notes`, `recorded_at`, `created_at`, `updated_at`) VALUES
(5, 7, 3245.5, 0.0, 11, 'Initial HM record dari seeder', '2026-05-19 05:59:49', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(6, 8, 5120.0, 0.0, 11, 'Initial HM record dari seeder', '2026-05-19 05:59:49', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(7, 10, 7890.0, 0.0, 11, 'Initial HM record dari seeder', '2026-05-19 05:59:49', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(8, 11, 2100.0, 0.0, 11, 'Initial HM record dari seeder', '2026-05-19 05:59:49', '2026-05-19 05:59:49', '2026-05-19 05:59:49');

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `id` bigint UNSIGNED NOT NULL,
  `part_id` bigint UNSIGNED NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'gudang-utama',
  `qty_available` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory`
--

INSERT INTO `inventory` (`id`, `part_id`, `location`, `qty_available`, `created_at`, `updated_at`) VALUES
(6, 6, 'gudang-utama', 71.00, '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(7, 7, 'gudang-utama', 43.00, '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(8, 8, 'gudang-utama', 59.00, '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(9, 9, 'gudang-utama', 56.00, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(10, 10, 'gudang-utama', 69.00, '2026-05-19 05:59:50', '2026-05-19 05:59:50');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_transactions`
--

CREATE TABLE `inventory_transactions` (
  `id` bigint UNSIGNED NOT NULL,
  `part_id` bigint UNSIGNED NOT NULL,
  `type` enum('in','out','adjustment','return') COLLATE utf8mb4_unicode_ci NOT NULL,
  `qty` decimal(10,2) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL DEFAULT '0.00',
  `reference_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint UNSIGNED DEFAULT NULL,
  `processed_by` bigint UNSIGNED NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_schedules`
--

CREATE TABLE `maintenance_schedules` (
  `id` bigint UNSIGNED NOT NULL,
  `asset_id` bigint UNSIGNED NOT NULL,
  `type` enum('preventive','periodic','conditional') COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `interval_hm` decimal(10,1) DEFAULT NULL,
  `interval_km` decimal(10,1) DEFAULT NULL,
  `last_done_hm` decimal(10,1) DEFAULT NULL,
  `last_done_km` decimal(10,1) DEFAULT NULL,
  `last_done_at` timestamp NULL DEFAULT NULL,
  `next_due_at` timestamp NULL DEFAULT NULL,
  `next_due_hm` decimal(10,1) DEFAULT NULL,
  `next_due_km` decimal(10,1) DEFAULT NULL,
  `status` enum('scheduled','due','overdue','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'scheduled',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `maintenance_schedules`
--

INSERT INTO `maintenance_schedules` (`id`, `asset_id`, `type`, `name`, `interval_hm`, `interval_km`, `last_done_hm`, `last_done_km`, `last_done_at`, `next_due_at`, `next_due_hm`, `next_due_km`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(6, 7, 'preventive', 'Service 250 HM', 250.0, NULL, 3125.5, NULL, '2026-05-04 05:59:49', '2026-05-29 05:59:49', 3375.5, NULL, 'scheduled', NULL, '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(7, 8, 'preventive', 'Service 250 HM', 250.0, NULL, 5000.0, NULL, '2026-05-04 05:59:49', '2026-05-29 05:59:49', 5250.0, NULL, 'scheduled', NULL, '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(8, 9, 'preventive', 'Service 250 HM', 250.0, NULL, -120.0, NULL, '2026-05-04 05:59:49', '2026-05-29 05:59:49', 130.0, NULL, 'scheduled', NULL, '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(9, 10, 'preventive', 'Service 250 HM', 250.0, NULL, 7770.0, NULL, '2026-05-04 05:59:49', '2026-05-29 05:59:49', 8020.0, NULL, 'scheduled', NULL, '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(10, 11, 'preventive', 'Service 250 HM', 250.0, NULL, 1980.0, NULL, '2026-05-04 05:59:49', '2026-05-29 05:59:49', 2230.0, NULL, 'scheduled', NULL, '2026-05-19 05:59:49', '2026-05-19 05:59:49');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_01_01_000010_create_asset_categories_table', 1),
(5, '2026_01_01_000011_create_assets_table', 1),
(6, '2026_01_01_000012_create_asset_locations_table', 1),
(7, '2026_01_01_000013_create_asset_documents_table', 1),
(8, '2026_01_01_000014_create_hm_logs_table', 1),
(9, '2026_01_01_000015_create_maintenance_schedules_table', 1),
(10, '2026_01_01_000016_create_p2h_templates_table', 1),
(11, '2026_01_01_000017_create_p2h_submissions_table', 1),
(12, '2026_01_01_000018_create_p2h_items_table', 1),
(13, '2026_01_01_000019_create_work_orders_table', 1),
(14, '2026_01_01_000020_create_work_order_relations_table', 1),
(15, '2026_01_01_000021_create_inventory_tables', 1),
(16, '2026_01_01_000022_create_notifications_table', 1),
(17, '2026_05_18_161208_create_permission_tables', 1),
(18, '2026_05_18_161816_create_activity_log_table', 1),
(19, '2026_05_18_165127_create_personal_access_tokens_table', 1),
(20, '2026_05_19_052512_create_user_profiles_table', 1),
(21, '2026_05_19_120000_create_app_menus_table', 1),
(22, '2026_05_19_123000_create_user_access_modes_table', 1),
(23, '2026_05_19_130000_create_smtp_tables', 1),
(24, '2026_05_19_131000_create_system_settings_table', 1),
(25, '2026_05_19_200001_add_public_uuid_to_assets_table', 1),
(26, '2026_05_19_200002_create_asset_photos_table', 1),
(27, '2026_05_19_200003_create_asset_preventive_settings_table', 1),
(28, '2026_05_19_200004_create_asset_workshop_histories_table', 1),
(29, '2026_05_19_210100_create_work_order_process_tracking_tables', 1),
(30, '2026_05_19_230000_add_sap_reference_to_work_orders_table', 2),
(31, '2026_05_20_000100_add_bay_tracking_to_wo_process_step_logs', 3),
(32, '2026_05_20_010000_add_jobcard_fields_to_work_orders_table', 4),
(33, '2026_05_20_020000_create_wo_process_abnormalities_table', 5),
(34, '2026_05_20_022546_add_schedule_id_to_work_orders_table', 6),
(35, '2026_05_20_100000_add_io_metadata_to_assets_table', 7),
(36, '2026_05_20_110000_add_excel_columns_to_assets_table', 8),
(37, '2026_05_20_130000_create_app_menu_services_table', 9);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(7, 'App\\Models\\User', 7),
(8, 'App\\Models\\User', 8),
(9, 'App\\Models\\User', 9),
(10, 'App\\Models\\User', 10),
(11, 'App\\Models\\User', 11),
(12, 'App\\Models\\User', 12),
(11, 'App\\Models\\User', 13),
(11, 'App\\Models\\User', 14),
(11, 'App\\Models\\User', 15),
(11, 'App\\Models\\User', 16),
(11, 'App\\Models\\User', 17),
(11, 'App\\Models\\User', 18),
(11, 'App\\Models\\User', 19),
(11, 'App\\Models\\User', 20),
(11, 'App\\Models\\User', 21),
(11, 'App\\Models\\User', 22),
(11, 'App\\Models\\User', 23),
(11, 'App\\Models\\User', 24),
(11, 'App\\Models\\User', 25),
(11, 'App\\Models\\User', 26),
(11, 'App\\Models\\User', 27),
(11, 'App\\Models\\User', 28),
(11, 'App\\Models\\User', 29),
(11, 'App\\Models\\User', 30),
(11, 'App\\Models\\User', 31),
(11, 'App\\Models\\User', 32),
(11, 'App\\Models\\User', 33),
(11, 'App\\Models\\User', 34),
(11, 'App\\Models\\User', 35),
(11, 'App\\Models\\User', 36),
(11, 'App\\Models\\User', 37),
(11, 'App\\Models\\User', 38),
(11, 'App\\Models\\User', 39),
(11, 'App\\Models\\User', 40),
(11, 'App\\Models\\User', 41),
(11, 'App\\Models\\User', 42),
(11, 'App\\Models\\User', 43),
(11, 'App\\Models\\User', 44);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` json DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `p2h_items`
--

CREATE TABLE `p2h_items` (
  `id` bigint UNSIGNED NOT NULL,
  `submission_id` bigint UNSIGNED NOT NULL,
  `group` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `condition` enum('ok','not_ok','na') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ok',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `photo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `p2h_submissions`
--

CREATE TABLE `p2h_submissions` (
  `id` bigint UNSIGNED NOT NULL,
  `asset_id` bigint UNSIGNED NOT NULL,
  `operator_id` bigint UNSIGNED NOT NULL,
  `template_id` bigint UNSIGNED NOT NULL,
  `reviewed_by` bigint UNSIGNED DEFAULT NULL,
  `status` enum('draft','submitted','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `geolat` decimal(10,8) DEFAULT NULL,
  `geolng` decimal(11,8) DEFAULT NULL,
  `signature_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `review_notes` text COLLATE utf8mb4_unicode_ci,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `p2h_templates`
--

CREATE TABLE `p2h_templates` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset_category_id` bigint UNSIGNED NOT NULL,
  `items` json NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `p2h_templates`
--

INSERT INTO `p2h_templates` (`id`, `name`, `asset_category_id`, `items`, `is_active`, `created_at`, `updated_at`) VALUES
(3, 'P2H Excavator', 7, '[{\"type\": \"checkbox\", \"group\": \"Mesin\", \"item_name\": \"Cek level oli mesin\"}, {\"type\": \"checkbox\", \"group\": \"Mesin\", \"item_name\": \"Cek level air radiator\"}, {\"type\": \"checkbox\", \"group\": \"Mesin\", \"item_name\": \"Cek level bahan bakar\"}, {\"type\": \"checkbox\", \"group\": \"Hidrolik\", \"item_name\": \"Cek kebocoran selang hidrolik\"}, {\"type\": \"checkbox\", \"group\": \"Hidrolik\", \"item_name\": \"Cek level oli hidrolik\"}, {\"type\": \"checkbox\", \"group\": \"Undercarriage\", \"item_name\": \"Cek kondisi track & sprocket\"}, {\"type\": \"checkbox\", \"group\": \"Safety\", \"item_name\": \"Cek alarm mundur berfungsi\"}, {\"type\": \"checkbox\", \"group\": \"Safety\", \"item_name\": \"Cek lampu & klakson\"}, {\"type\": \"checkbox\", \"group\": \"Kabin\", \"item_name\": \"Cek seat belt\"}, {\"type\": \"checkbox\", \"group\": \"Kabin\", \"item_name\": \"Cek APAR tersedia\"}]', 1, '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(4, 'P2H Dump Truck', 9, '[{\"type\": \"checkbox\", \"group\": \"Mesin\", \"item_name\": \"Cek level oli mesin\"}, {\"type\": \"checkbox\", \"group\": \"Mesin\", \"item_name\": \"Cek tekanan ban (depan & belakang)\"}, {\"type\": \"checkbox\", \"group\": \"Rem\", \"item_name\": \"Cek fungsi rem utama\"}, {\"type\": \"checkbox\", \"group\": \"Rem\", \"item_name\": \"Cek rem parkir\"}, {\"type\": \"checkbox\", \"group\": \"Lampu\", \"item_name\": \"Cek lampu depan & belakang\"}, {\"type\": \"checkbox\", \"group\": \"Safety\", \"item_name\": \"Cek alarm mundur\"}, {\"type\": \"checkbox\", \"group\": \"Safety\", \"item_name\": \"Cek APAR tersedia\"}, {\"type\": \"checkbox\", \"group\": \"Bak\", \"item_name\": \"Cek kondisi bak dump\"}]', 1, '2026-05-19 05:59:49', '2026-05-19 05:59:49');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(24, 'view assets', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(25, 'create assets', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(26, 'edit assets', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(27, 'delete assets', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(28, 'import assets', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(29, 'export assets', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(30, 'view p2h', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(31, 'create p2h', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(32, 'review p2h', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(33, 'view work-orders', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(34, 'create work-orders', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(35, 'edit work-orders', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(36, 'delete work-orders', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(37, 'approve work-orders', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(38, 'assign work-orders', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(39, 'execute work-orders', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(40, 'view inventory', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(41, 'manage inventory', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(42, 'view reports', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(43, 'export reports', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(44, 'view users', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(45, 'manage users', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(46, 'manage settings', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(47, 'view dashboard', 'web', '2026-05-19 22:29:22', '2026-05-19 22:29:22'),
(48, 'view schedules', 'web', '2026-05-19 22:29:22', '2026-05-19 22:29:22'),
(49, 'manage schedules', 'web', '2026-05-19 22:29:22', '2026-05-19 22:29:22'),
(50, 'view monitoring', 'web', '2026-05-19 22:29:22', '2026-05-19 22:29:22'),
(51, 'manage smtp', 'web', '2026-05-19 22:29:22', '2026-05-19 22:29:22'),
(52, 'manage system settings', 'web', '2026-05-19 22:29:22', '2026-05-19 22:29:22');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(2, 'App\\Models\\User', 8, 'api-token', 'e0f2fa2c438362cfe9375fd3ba74a6858c737f6bf589490d89ed8e342cb26d53', '[\"*\"]', '2026-05-19 20:23:51', '2026-06-18 20:23:48', '2026-05-19 20:23:48', '2026-05-19 20:23:51'),
(3, 'App\\Models\\User', 8, 'api-token', '1d6462b2fe7ac476b1c2ce5702232f6b50de6694acd3934d5be3c8e44aea8037', '[\"*\"]', '2026-05-19 20:43:59', '2026-06-18 20:43:58', '2026-05-19 20:43:58', '2026-05-19 20:43:59'),
(4, 'App\\Models\\User', 8, 'api-token', '14c9443f701279669a7fd32c09dbe97689042266ce7bcb0e4d14edfce73f92b9', '[\"*\"]', '2026-05-20 03:06:04', '2026-06-18 23:05:28', '2026-05-19 23:05:28', '2026-05-20 03:06:04'),
(6, 'App\\Models\\User', 8, 'api-token', '0836c638ea38c342e9bd21875a3ee197fbc36233fe47b2eed4f990433bbb6a24', '[\"*\"]', '2026-05-20 01:09:52', '2026-06-19 01:09:30', '2026-05-20 01:09:30', '2026-05-20 01:09:52'),
(7, 'App\\Models\\User', 8, 'api-token', '56ffd9e5fa5e034d1802b3ffab6bfc9ef6045132d4c9b9a1145bd79f3abec6a8', '[\"*\"]', '2026-05-20 04:25:47', '2026-06-19 01:11:33', '2026-05-20 01:11:33', '2026-05-20 04:25:47'),
(8, 'App\\Models\\User', 8, 'api-token', '56dfe143f024b681a4bc7de61f84d5c15db8a3086643d23b472a7d47702caa21', '[\"*\"]', '2026-05-20 04:33:38', '2026-06-19 03:06:24', '2026-05-20 03:06:24', '2026-05-20 04:33:38');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(7, 'super_admin', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(8, 'admin', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(9, 'supervisor', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(10, 'mechanic', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(11, 'operator', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46'),
(12, 'viewer', 'web', '2026-05-19 05:59:46', '2026-05-19 05:59:46');

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `role_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_has_permissions`
--

INSERT INTO `role_has_permissions` (`permission_id`, `role_id`) VALUES
(24, 7),
(25, 7),
(26, 7),
(27, 7),
(28, 7),
(29, 7),
(30, 7),
(31, 7),
(32, 7),
(33, 7),
(34, 7),
(35, 7),
(36, 7),
(37, 7),
(38, 7),
(39, 7),
(40, 7),
(41, 7),
(42, 7),
(43, 7),
(44, 7),
(45, 7),
(46, 7),
(47, 7),
(48, 7),
(49, 7),
(50, 7),
(51, 7),
(52, 7),
(24, 8),
(25, 8),
(26, 8),
(28, 8),
(29, 8),
(33, 8),
(34, 8),
(35, 8),
(37, 8),
(38, 8),
(39, 8),
(40, 8),
(41, 8),
(42, 8),
(43, 8),
(44, 8),
(45, 8),
(46, 8),
(47, 8),
(48, 8),
(49, 8),
(50, 8),
(51, 8),
(52, 8),
(24, 9),
(26, 9),
(30, 9),
(32, 9),
(33, 9),
(34, 9),
(35, 9),
(37, 9),
(38, 9),
(39, 9),
(40, 9),
(42, 9),
(47, 9),
(48, 9),
(50, 9),
(24, 10),
(30, 10),
(33, 10),
(35, 10),
(39, 10),
(40, 10),
(47, 10),
(48, 10),
(24, 11),
(30, 11),
(31, 11),
(33, 11),
(39, 11),
(47, 11),
(48, 11),
(24, 12),
(30, 12),
(33, 12),
(40, 12),
(42, 12),
(47, 12),
(48, 12),
(50, 12);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `smtp_configurations`
--

CREATE TABLE `smtp_configurations` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `host` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `port` smallint UNSIGNED NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_encrypted` text COLLATE utf8mb4_unicode_ci,
  `encryption` enum('none','ssl','tls') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'tls',
  `from_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `last_test_at` timestamp NULL DEFAULT NULL,
  `last_test_status` enum('success','failed') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `smtp_test_email_logs`
--

CREATE TABLE `smtp_test_email_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `smtp_configuration_id` bigint UNSIGNED NOT NULL,
  `to_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('success','failed') COLLATE utf8mb4_unicode_ci NOT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `sent_at` timestamp NOT NULL,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `spare_parts`
--

CREATE TABLE `spare_parts` (
  `id` bigint UNSIGNED NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brand` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `part_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_stock` int NOT NULL DEFAULT '0',
  `unit_price` decimal(15,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `spare_parts`
--

INSERT INTO `spare_parts` (`id`, `code`, `name`, `unit`, `category`, `brand`, `part_number`, `min_stock`, `unit_price`, `notes`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(6, 'OLI-001', 'Oli Mesin Shell Rimula R4 15W-40', 'liter', 'Pelumas', 'Shell', NULL, 50, 45000.00, NULL, 1, '2026-05-19 05:59:49', '2026-05-19 05:59:49', NULL),
(7, 'FLT-001', 'Filter Oli Caterpillar 1R-0739', 'pcs', 'Filter', 'Caterpillar', NULL, 5, 185000.00, NULL, 1, '2026-05-19 05:59:49', '2026-05-19 05:59:49', NULL),
(8, 'FLT-002', 'Filter Bahan Bakar Caterpillar 1R-0756', 'pcs', 'Filter', 'Caterpillar', NULL, 5, 210000.00, NULL, 1, '2026-05-19 05:59:49', '2026-05-19 05:59:49', NULL),
(9, 'HYD-001', 'Oli Hidrolik Shell Tellus S2 MX 46', 'liter', 'Pelumas', 'Shell', NULL, 30, 62000.00, NULL, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50', NULL),
(10, 'GRS-001', 'Grease Shell Gadus S2 V220', 'kg', 'Pelumas', 'Shell', NULL, 10, 75000.00, NULL, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` bigint UNSIGNED NOT NULL,
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value_text` text COLLATE utf8mb4_unicode_ci,
  `value_json` json DEFAULT NULL,
  `type` enum('string','number','boolean','json','email','url','select') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string',
  `scope` enum('global','module') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'global',
  `module_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `validation_rules` json DEFAULT NULL,
  `is_secret` tinyint(1) NOT NULL DEFAULT '0',
  `is_editable` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `fcm_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `email_verified_at`, `password`, `avatar`, `is_active`, `fcm_token`, `remember_token`, `created_at`, `updated_at`) VALUES
(7, 'Super Admin TAPG', 'superadmin@tapg.local', '08100000001', NULL, '$2y$12$glAOMB6oM0RgLMTE47DaBuITkmbVjQW5hXR9D5dlU1tnEYYbTHDwO', NULL, 1, NULL, NULL, '2026-05-19 05:59:48', '2026-05-19 22:29:24'),
(8, 'Admin TAPG', 'admin@tapg.local', '08100000002', NULL, '$2y$12$LxgHz9q1Gct4CGzekJNzAexPH85cjwHK1v8LfD9/40i/NWaG.zkl6', NULL, 1, NULL, NULL, '2026-05-19 05:59:48', '2026-05-19 22:29:24'),
(9, 'Budi Supervisor', 'supervisor@tapg.local', '08100000003', NULL, '$2y$12$jWxPx9ms6t8reojv9uYhhe1rhTyI3NMmgx6Z.46fwpirQ2tVYHxkq', NULL, 1, NULL, NULL, '2026-05-19 05:59:48', '2026-05-19 22:29:24'),
(10, 'Andi Mechanic', 'mechanic@tapg.local', '08100000004', NULL, '$2y$12$4LyDHcAVuSmliRHOXHw7h.5EXnMI4m7jVkEFbdQQC6My7VpUXHXqe', NULL, 1, NULL, NULL, '2026-05-19 05:59:48', '2026-05-19 22:29:24'),
(11, 'Doni Operator', 'operator@tapg.local', '08100000005', NULL, '$2y$12$9pskVNejnxse2DxBGw4hyO6FleeXi7I0tKBzD0e1DyVf0e4kpev4C', NULL, 1, NULL, NULL, '2026-05-19 05:59:48', '2026-05-19 22:29:24'),
(12, 'Viewer TAPG', 'viewer@tapg.local', '08100000006', NULL, '$2y$12$vFAhw1jbtkoD5iwu9CdcaOdXIREXmaYY6AvXWSko8LlyqCxRCQwX.', NULL, 1, NULL, NULL, '2026-05-19 05:59:48', '2026-05-19 22:29:24'),
(13, 'ADEK SETIAWAN', 'adek.setiawan@tapg.operator.local', NULL, NULL, '$2y$12$lWoNsoGDSyXF8752yR/jUeBnJUX/0RkAzAA2hp00fufgKIDgM/crC', NULL, 1, NULL, NULL, '2026-05-19 06:03:09', '2026-05-19 06:03:09'),
(14, 'RESTU PAMUJI', 'restu.pamuji@tapg.operator.local', NULL, NULL, '$2y$12$3vuvvtdEyaAUQsg8wZmSxeHDZCMuZO2sP/68uW4XO4CEZIv7m8hte', NULL, 1, NULL, NULL, '2026-05-19 06:03:09', '2026-05-19 06:03:09'),
(15, 'ATI RILA MUSTIKA', 'ati.rila.mustika.244709@tapg.operator.local', NULL, NULL, '$2y$12$wpvuvRABYzRkh6kDRZ37QOuSO7atclHcqOi/bSGcN89ccqby4Lrx.', NULL, 1, NULL, NULL, '2026-05-19 06:03:10', '2026-05-19 06:03:10'),
(16, 'ROMSIDI', 'romsidi.517901@tapg.operator.local', NULL, NULL, '$2y$12$hva48EGz1z84IpGKbDudB.K.wiKUiTaJyU/wAa0cjslSKE4MW2V6i', NULL, 1, NULL, NULL, '2026-05-19 06:03:10', '2026-05-19 06:03:10'),
(17, 'ARDIANSYAH', 'ardiansyah.181400@tapg.operator.local', NULL, NULL, '$2y$12$sMq06dl0MfJp0Kc5tjY7wOAFEXhFBO3mnr4KFeBYneuru1dV3UUxi', NULL, 1, NULL, NULL, '2026-05-19 06:03:10', '2026-05-19 06:03:10'),
(18, 'AHMAD HAERUDIN', 'ahmad.haerudin.101061@tapg.operator.local', NULL, NULL, '$2y$12$we5tB1dpMG7iGNRqcczOfueuYEtVFgF81NTa1fLmRdYsnbt1nrgMK', NULL, 1, NULL, NULL, '2026-05-19 06:03:11', '2026-05-19 06:03:11'),
(19, 'MOHAMAD ASRI', 'mohamad.asri.234264@tapg.operator.local', NULL, NULL, '$2y$12$FF8lSYrsuKiDBayrTprd.OCTFR/zlH8yecL9/6CZOsif/VpQN5g.6', NULL, 1, NULL, NULL, '2026-05-19 06:03:11', '2026-05-19 06:03:11'),
(20, 'DENI ARDIANSYAH', 'deni.ardiansyah.234269@tapg.operator.local', NULL, NULL, '$2y$12$/4tUncu0t4dUSzvLMd7/De.zruBSq9QLjUKTmYG0dIQnjoiQ5YntG', NULL, 1, NULL, NULL, '2026-05-19 06:03:11', '2026-05-19 06:03:11'),
(21, 'MA\'ROFAN FIKRI ALHAQI', 'marofan.fikri.alhaqi.234142@tapg.operator.local', NULL, NULL, '$2y$12$sObFcfdyhSKgB0Pqts5iMuNY8jN05NTo9n8rwLRCR6dIDZsS6r.Sy', NULL, 1, NULL, NULL, '2026-05-19 06:03:12', '2026-05-19 06:03:12'),
(22, 'DANIAR APRILLYANDA', 'daniar.aprillyanda.234217@tapg.operator.local', NULL, NULL, '$2y$12$0CW.tZi/OU/.uUCnjjO0n.WhqxVqx5zR8tbOm0ipORcXsSZRglRqS', NULL, 1, NULL, NULL, '2026-05-19 06:03:12', '2026-05-19 06:03:12'),
(23, 'ASKAR', 'askar.234275@tapg.operator.local', NULL, NULL, '$2y$12$or3lNkwhK3frFHWCHV9NS.jQNtkjyKYgf9yX8RMocb2yRz9.kpSdq', NULL, 1, NULL, NULL, '2026-05-19 06:03:12', '2026-05-19 06:03:12'),
(24, 'IKSAN HALIM', 'iksan.halim.234218@tapg.operator.local', NULL, NULL, '$2y$12$TQqosHFW9uoSC0IF6A1xz.PfK2aaKI13bhKPJQejYkqerMrQUCFi.', NULL, 1, NULL, NULL, '2026-05-19 06:03:13', '2026-05-19 06:03:13'),
(25, 'DEMRI IFRANTO SIHOMBING', 'demri.ifranto.sihombing.233842@tapg.operator.local', NULL, NULL, '$2y$12$keVLJfXYTIzVldjZuxJ9h.L8dYIChuEe1JEOCvU9a/aV8whNvn71i', NULL, 1, NULL, NULL, '2026-05-19 06:03:13', '2026-05-19 06:03:13'),
(26, 'PUTRI SEA', 'putri.sea.181802@tapg.operator.local', NULL, NULL, '$2y$12$f2pkWmkyp9bD1iudlS5bDOzJZHsO0le2P8CIkjvbS0xfJZevs6EQG', NULL, 1, NULL, NULL, '2026-05-19 06:03:13', '2026-05-19 06:03:13'),
(27, 'FAHRODIN', 'fahrodin.234141@tapg.operator.local', NULL, NULL, '$2y$12$bQmKY1omXd6LgcrWgGYGv.1Xes3WNLIGNKAWtUqwkNxJBN.c8JBAa', NULL, 1, NULL, NULL, '2026-05-19 06:03:14', '2026-05-19 06:03:14'),
(28, 'RIVANDY NATANAEL SEMBIRIN', 'rivandy.natanael.sembirin.255159@tapg.operator.local', NULL, NULL, '$2y$12$mqR6Fda0LPif5BZH4RGf8evYh62iUcRjimJ4amgNWwIkG40BlPuRy', NULL, 1, NULL, NULL, '2026-05-19 06:03:14', '2026-05-19 06:03:14'),
(29, 'ZULFAHMI', 'zulfahmi.265623@tapg.operator.local', NULL, NULL, '$2y$12$2.i0m729uHw4EF9K5doweeQfH7XrZo/2MJvddiCVN6UATZHezUIGK', NULL, 1, NULL, NULL, '2026-05-19 06:03:14', '2026-05-19 06:03:14'),
(30, 'DANI JATI HIDAYAT', 'dani.jati.hidayat.255163@tapg.operator.local', NULL, NULL, '$2y$12$jTpoj9X6mqeptMCwP50.1uXG1EG4dEIt56shn2U.tQqJex53mUCqu', NULL, 1, NULL, NULL, '2026-05-19 06:03:14', '2026-05-19 06:03:14'),
(31, 'EKO NUR PUJIANTO', 'eko.nur.pujianto.265659@tapg.operator.local', NULL, NULL, '$2y$12$nARJ3Nv5T3/kwgav92Mgdemi/GzVRKjFf.WA5PzXKAtiDLPtTvjDy', NULL, 1, NULL, NULL, '2026-05-19 06:03:15', '2026-05-19 06:03:15'),
(32, 'MUH. ARFANDI', 'muh.arfandi.265660@tapg.operator.local', NULL, NULL, '$2y$12$Sq0wgmx0oziyGbFnUySHGu8XSTCVWPiBCjco7lptSAKlBBz1hYD8.', NULL, 1, NULL, NULL, '2026-05-19 06:03:15', '2026-05-19 06:03:15'),
(33, 'ASMA\'UL MUSLIH', 'asmaul.muslih.265707@tapg.operator.local', NULL, NULL, '$2y$12$QYXaO.yQ/e9cHS7nleC9E.7weOKvZqbSJroJmi/uRYHLhrRkGofHG', NULL, 1, NULL, NULL, '2026-05-19 06:03:15', '2026-05-19 06:03:15'),
(34, 'YOHANES SAMPE', 'yohanes.sampe.265726@tapg.operator.local', NULL, NULL, '$2y$12$0KXQX9MfYuvCJuJM.v8areDbfqql4JZUimSoddFGMFoz4rrI.vXbe', NULL, 1, NULL, NULL, '2026-05-19 06:03:16', '2026-05-19 06:03:16'),
(35, 'MUHAMAD SYAHRUL KHAKIM', 'muhamad.syahrul.khakim.265727@tapg.operator.local', NULL, NULL, '$2y$12$H2cS9QLezwcCXUCNS3MiUuyUxTt3qzMLoLTaUSqLg8Rn1XrcVlCRe', NULL, 1, NULL, NULL, '2026-05-19 06:03:16', '2026-05-19 06:03:16'),
(36, 'MUH. IKBAL', 'muh.ikbal.244846@tapg.operator.local', NULL, NULL, '$2y$12$aN2iIFlD/Fgod2iPcOpCPuORcCY85ISF9.G7Jr/HI/9oAGHviL7pW', NULL, 1, NULL, NULL, '2026-05-19 06:03:16', '2026-05-19 06:03:16'),
(37, 'WAHYU ADITYA', 'wahyu.aditya.244863@tapg.operator.local', NULL, NULL, '$2y$12$EACoPnWf85OqARBEWKrbkO8oCtL5xmjWEvWqitui9J9IItT1p1qCW', NULL, 1, NULL, NULL, '2026-05-19 06:03:16', '2026-05-19 06:03:16'),
(38, 'R RYANDRA AQMAL MAULANA', 'r.ryandra.aqmal.maulana.255318@tapg.operator.local', NULL, NULL, '$2y$12$70UrXbitMUj3ASNtYa6bAuDWJ7Q53YSg7yGVTMIqkdJCxJ5LERWLq', NULL, 1, NULL, NULL, '2026-05-19 06:03:17', '2026-05-19 06:03:17'),
(39, 'RIVAN SURYO WIDODO', 'rivan.suryo.widodo.255379@tapg.operator.local', NULL, NULL, '$2y$12$rrEx9OiTvy4j3uNMiNyvSuBRYBjeAwNWwksrpWF9zXqmWATxYMDi6', NULL, 1, NULL, NULL, '2026-05-19 06:03:17', '2026-05-19 06:03:17'),
(40, 'ARYA FIRMANSYAH', 'arya.firmansyah.255448@tapg.operator.local', NULL, NULL, '$2y$12$j4X87Yefo9fQydfZB722SeB2OlyAvz2OpB6k4G5UpIfUnPfE1YRha', NULL, 1, NULL, NULL, '2026-05-19 06:03:17', '2026-05-19 06:03:17'),
(41, 'BIMA HIDAYAT', 'bima.hidayat.244958@tapg.operator.local', NULL, NULL, '$2y$12$Z7R7EmF2gi/mWzS4beFVKORx2Lb5c4jYxX2fbNcVjrvpzKCmjSEU6', NULL, 1, NULL, NULL, '2026-05-19 06:03:18', '2026-05-19 06:03:18'),
(42, 'DANIEL BAYU SAPUTRA', 'daniel.bayu.saputra.244975@tapg.operator.local', NULL, NULL, '$2y$12$9.1d1LEkeHwkuQpg8i4BROugFGDtR3MKg4fENa01ziWCwp10fqVaO', NULL, 1, NULL, NULL, '2026-05-19 06:03:18', '2026-05-19 06:03:18'),
(43, 'EVANS MUBA SAMOSIR', 'evans.muba.samosir.244977@tapg.operator.local', NULL, NULL, '$2y$12$vN4p3AJ/EHyaSb6zEzdHFuplBmCLyo6aihOLVYRLQnDHoLwTtY/xu', NULL, 1, NULL, NULL, '2026-05-19 06:03:18', '2026-05-19 06:03:18'),
(44, 'FAJAR DWI HARDIANSYAH', 'fajar.dwi.hardiansyah.244979@tapg.operator.local', NULL, NULL, '$2y$12$BgjThNYPmnXF5oDGWCrJyObhni8iodEWkuyAywPwy4Vzc.W8NYI/2', NULL, 1, NULL, NULL, '2026-05-19 06:03:18', '2026-05-19 06:03:18');

-- --------------------------------------------------------

--
-- Table structure for table `user_access_modes`
--

CREATE TABLE `user_access_modes` (
  `user_id` bigint UNSIGNED NOT NULL,
  `access_mode` enum('role','custom') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'role',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `employee_code` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `job_code` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sex` enum('male','female','other','unknown') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unknown',
  `employment_status` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `site_location` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supervisor_name` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birth_place` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `contract_start_date` date DEFAULT NULL,
  `contract_end_date` date DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `emergency_contact_name` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_phone` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_profiles`
--

INSERT INTO `user_profiles` (`id`, `user_id`, `employee_code`, `job_code`, `sex`, `employment_status`, `company`, `department`, `site_location`, `supervisor_name`, `birth_place`, `birth_date`, `hire_date`, `contract_start_date`, `contract_end_date`, `address`, `emergency_contact_name`, `emergency_contact_phone`, `meta`, `created_at`, `updated_at`) VALUES
(1, 13, NULL, 'Kepala Workshop', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:09', '2026-05-19 06:03:09'),
(2, 14, NULL, 'Staff Workshop', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:09', '2026-05-19 06:03:09'),
(3, 15, '63/6321/0424/4709', 'TOOLMAN', 'female', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:10', '2026-05-19 06:03:10'),
(4, 16, '63/6321/0517/901', 'MEKANIK SEPEDA MOTOR', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:10', '2026-05-19 06:03:10'),
(5, 17, '63/6321/0518/1400', 'MEKANIK LISTRIK', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:10', '2026-05-19 06:03:10'),
(6, 18, '63/6321/1010/61', 'MEKANIK LISTRIK', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:11', '2026-05-19 06:03:11'),
(7, 19, '63/6321/0723/4264', 'MEKANIK LAS & BODY', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:11', '2026-05-19 06:03:11'),
(8, 20, '63/6321/0723/4269', 'MEKANIK LAS & BODY', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:11', '2026-05-19 06:03:11'),
(9, 21, '63/6321/0523/4142', 'MEKANIK KENDARAAN', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:12', '2026-05-19 06:03:12'),
(10, 22, '63/6321/0623/4217', 'MEKANIK KENDARAAN', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:12', '2026-05-19 06:03:12'),
(11, 23, '63/6321/0723/4275', 'MEKANIK KENDARAAN', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:12', '2026-05-19 06:03:12'),
(12, 24, '63/6321/0623/4218', 'MEKANIK ALAT BERAT', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:13', '2026-05-19 06:03:13'),
(13, 25, '63/6321/0123/3842', 'MAINTENANCE PLANNER', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:13', '2026-05-19 06:03:13'),
(14, 26, '63/6321/1118/1802', 'KRANI BENGKEL', 'female', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:13', '2026-05-19 06:03:13'),
(15, 27, '63/6321/0523/4141', 'KOORDINATOR MEKANIK', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:14', '2026-05-19 06:03:14'),
(16, 28, '63/6321/0225/5159', 'HELPER MEKANIK', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:14', '2026-05-19 06:03:14'),
(17, 29, '63/6321/0226/5623', 'HELPER MEKANIK', 'male', 'KP', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:14', '2026-05-19 06:03:14'),
(18, 30, '63/6321/0325/5163', 'HELPER MEKANIK', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:14', '2026-05-19 06:03:14'),
(19, 31, '63/6321/0426/5659', 'HELPER MEKANIK', 'male', 'KP', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:15', '2026-05-19 06:03:15'),
(20, 32, '63/6321/0426/5660', 'HELPER MEKANIK', 'male', 'KP', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:15', '2026-05-19 06:03:15'),
(21, 33, '63/6321/0526/5707', 'HELPER MEKANIK', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:15', '2026-05-19 06:03:15'),
(22, 34, '63/6321/0526/5726', 'HELPER MEKANIK', 'male', 'KP', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:16', '2026-05-19 06:03:16'),
(23, 35, '63/6321/0526/5727', 'HELPER MEKANIK', 'male', 'KP', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:16', '2026-05-19 06:03:16'),
(24, 36, '63/6321/0624/4846', 'HELPER MEKANIK', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:16', '2026-05-19 06:03:16'),
(25, 37, '63/6321/0724/4863', 'HELPER MEKANIK', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:17', '2026-05-19 06:03:17'),
(26, 38, '63/6321/0725/5318', 'HELPER MEKANIK', 'male', 'KK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:17', '2026-05-19 06:03:17'),
(27, 39, '63/6321/0825/5379', 'HELPER MEKANIK', 'male', 'KK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:17', '2026-05-19 06:03:17'),
(28, 40, '63/6321/0925/5448', 'HELPER MEKANIK', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:17', '2026-05-19 06:03:17'),
(29, 41, '63/6321/1024/4958', 'HELPER MEKANIK', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:18', '2026-05-19 06:03:18'),
(30, 42, '63/6321/1024/4975', 'HELPER MEKANIK', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:18', '2026-05-19 06:03:18'),
(31, 43, '63/6321/1024/4977', 'HELPER MEKANIK', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:18', '2026-05-19 06:03:18'),
(32, 44, '63/6321/1024/4979', 'HELPER MEKANIK', 'male', 'KT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 06:03:18', '2026-05-19 06:03:18');

-- --------------------------------------------------------

--
-- Table structure for table `work_orders`
--

CREATE TABLE `work_orders` (
  `id` bigint UNSIGNED NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sap_reference_no` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `wo_source` enum('internal','sap') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'internal',
  `jobcard_no` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jobcard_status` enum('draft','generated','printed','acknowledged') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `jobcard_generated_at` timestamp NULL DEFAULT NULL,
  `jobcard_printed_at` timestamp NULL DEFAULT NULL,
  `jobcard_acknowledged_at` timestamp NULL DEFAULT NULL,
  `asset_id` bigint UNSIGNED NOT NULL,
  `schedule_id` bigint UNSIGNED DEFAULT NULL,
  `type` enum('preventive','corrective','breakdown','inspection') COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('low','medium','high','critical') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('draft','pending','approved','in_progress','on_hold','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `process_template_id` bigint UNSIGNED DEFAULT NULL,
  `is_process_tracking_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `supervisor_id` bigint UNSIGNED NOT NULL,
  `created_by` bigint UNSIGNED NOT NULL,
  `approved_by` bigint UNSIGNED DEFAULT NULL,
  `scheduled_start` timestamp NULL DEFAULT NULL,
  `scheduled_end` timestamp NULL DEFAULT NULL,
  `actual_start` timestamp NULL DEFAULT NULL,
  `actual_end` timestamp NULL DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `estimated_cost` decimal(15,2) DEFAULT NULL,
  `actual_cost` decimal(15,2) DEFAULT NULL,
  `completion_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `work_orders`
--

INSERT INTO `work_orders` (`id`, `code`, `sap_reference_no`, `wo_source`, `jobcard_no`, `jobcard_status`, `jobcard_generated_at`, `jobcard_printed_at`, `jobcard_acknowledged_at`, `asset_id`, `schedule_id`, `type`, `priority`, `title`, `description`, `status`, `process_template_id`, `is_process_tracking_enabled`, `supervisor_id`, `created_by`, `approved_by`, `scheduled_start`, `scheduled_end`, `actual_start`, `actual_end`, `approved_at`, `estimated_cost`, `actual_cost`, `completion_notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
(5, 'WO-20260519-00001', NULL, 'internal', NULL, 'draft', NULL, NULL, NULL, 7, NULL, 'preventive', 'medium', 'Service 250 HM Excavator CAT 320', 'Ganti oli mesin, filter oli, filter bahan bakar. Cek kondisi hidrolik.', 'in_progress', NULL, 1, 9, 8, 9, '2026-05-18 05:59:49', '2026-05-20 05:59:49', '2026-05-19 02:59:49', NULL, '2026-05-18 05:59:49', 2500000.00, NULL, NULL, '2026-05-19 05:59:49', '2026-05-19 05:59:49', NULL),
(6, 'WO-20260519-00002', NULL, 'internal', NULL, 'draft', NULL, NULL, NULL, 8, NULL, 'corrective', 'high', 'Perbaikan Track Bulldozer Komatsu D65', 'Track sebelah kiri mengalami keausan berlebihan. Perlu penggantian track shoe.', 'completed', 6, 1, 9, 8, NULL, '2026-05-21 05:59:49', '2026-05-22 05:59:49', NULL, '2026-05-19 13:18:56', NULL, 15000000.00, NULL, NULL, '2026-05-19 05:59:49', '2026-05-19 13:18:56', NULL),
(7, 'WO-20260519-00003', NULL, 'internal', NULL, 'draft', NULL, NULL, NULL, 10, NULL, 'preventive', 'low', 'Ganti Oli Blade Motor Grader Volvo G940', 'Service rutin penggantian oli blade dan cek kondisi cutting edge.', 'completed', NULL, 1, 9, 8, 9, '2026-05-14 05:59:49', '2026-05-15 05:59:49', '2026-05-14 05:59:49', '2026-05-15 08:59:49', '2026-05-13 05:59:49', 1800000.00, 1750000.00, 'Service selesai. Cutting edge masih bagus, tidak perlu diganti.', '2026-05-19 05:59:49', '2026-05-19 05:59:49', NULL),
(8, 'WO-20260519-YK8JL', 'SAP-W0-001', 'sap', 'JC-20260519-PN7YMA', 'generated', '2026-05-19 14:09:28', NULL, NULL, 7, NULL, 'preventive', 'medium', 'Testing', 'testing', 'completed', 9, 1, 9, 8, NULL, NULL, NULL, NULL, '2026-05-19 13:10:03', NULL, NULL, NULL, NULL, '2026-05-19 13:07:33', '2026-05-19 14:09:28', NULL),
(9, 'WO-20260519-M50J5', 'SAP-WO-456', 'sap', NULL, 'draft', NULL, NULL, NULL, 7, NULL, 'preventive', 'medium', 'Test', '-', 'completed', 9, 1, 9, 8, 8, NULL, NULL, '2026-05-19 13:27:22', '2026-05-19 13:29:59', '2026-05-19 13:27:13', NULL, NULL, NULL, '2026-05-19 13:20:00', '2026-05-19 13:29:59', NULL),
(10, 'WO-20260520-HMVUI', 'SAP-WO-12345', 'sap', 'JC-20260520-V0ELTE', 'generated', '2026-05-19 23:11:10', NULL, NULL, 442, NULL, 'preventive', 'medium', 'Testing', '-', 'in_progress', 9, 1, 9, 8, 8, NULL, NULL, '2026-05-19 23:11:02', NULL, '2026-05-19 23:10:56', NULL, NULL, NULL, '2026-05-19 23:10:46', '2026-05-19 23:11:10', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `work_order_assignees`
--

CREATE TABLE `work_order_assignees` (
  `id` bigint UNSIGNED NOT NULL,
  `wo_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `role` enum('lead','member','support') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'member',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `work_order_assignees`
--

INSERT INTO `work_order_assignees` (`id`, `wo_id`, `user_id`, `role`, `created_at`, `updated_at`) VALUES
(3, 5, 10, 'lead', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(4, 7, 10, 'lead', '2026-05-19 05:59:49', '2026-05-19 05:59:49');

-- --------------------------------------------------------

--
-- Table structure for table `work_order_attachments`
--

CREATE TABLE `work_order_attachments` (
  `id` bigint UNSIGNED NOT NULL,
  `wo_id` bigint UNSIGNED NOT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('photo','document','video','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'photo',
  `uploaded_by` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `work_order_checklists`
--

CREATE TABLE `work_order_checklists` (
  `id` bigint UNSIGNED NOT NULL,
  `wo_id` bigint UNSIGNED NOT NULL,
  `item` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_done` tinyint(1) NOT NULL DEFAULT '0',
  `done_by` bigint UNSIGNED DEFAULT NULL,
  `done_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `work_order_checklists`
--

INSERT INTO `work_order_checklists` (`id`, `wo_id`, `item`, `is_done`, `done_by`, `done_at`, `created_at`, `updated_at`) VALUES
(6, 5, 'Drain oli mesin lama', 1, 10, '2026-05-19 03:59:49', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(7, 5, 'Pasang filter oli baru', 1, 10, '2026-05-19 03:59:49', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(8, 5, 'Isi oli mesin baru 15L', 0, NULL, NULL, '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(9, 5, 'Ganti filter bahan bakar', 0, NULL, NULL, '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(10, 5, 'Test run 30 menit', 0, NULL, NULL, '2026-05-19 05:59:49', '2026-05-19 05:59:49');

-- --------------------------------------------------------

--
-- Table structure for table `work_order_comments`
--

CREATE TABLE `work_order_comments` (
  `id` bigint UNSIGNED NOT NULL,
  `wo_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `work_order_status_logs`
--

CREATE TABLE `work_order_status_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `wo_id` bigint UNSIGNED NOT NULL,
  `from_status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_by` bigint UNSIGNED NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `changed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `work_order_status_logs`
--

INSERT INTO `work_order_status_logs` (`id`, `wo_id`, `from_status`, `to_status`, `changed_by`, `notes`, `changed_at`, `created_at`, `updated_at`) VALUES
(10, 5, NULL, 'draft', 8, NULL, '2026-05-19 12:59:49', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(11, 5, 'draft', 'pending', 8, NULL, '2026-05-19 12:59:49', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(12, 5, 'pending', 'approved', 9, NULL, '2026-05-19 12:59:49', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(13, 5, 'approved', 'in_progress', 10, NULL, '2026-05-19 12:59:49', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(14, 6, NULL, 'draft', 8, NULL, '2026-05-19 12:59:49', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(15, 6, 'draft', 'pending', 8, NULL, '2026-05-19 12:59:49', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(16, 7, 'approved', 'in_progress', 10, NULL, '2026-05-19 12:59:49', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(17, 7, 'in_progress', 'completed', 10, 'Service selesai tepat waktu.', '2026-05-19 12:59:49', '2026-05-19 05:59:49', '2026-05-19 05:59:49'),
(18, 8, NULL, 'draft', 8, NULL, '2026-05-19 20:07:33', '2026-05-19 13:07:33', '2026-05-19 13:07:33'),
(19, 8, 'draft', 'completed', 8, 'Process completed.', '2026-05-19 13:10:03', '2026-05-19 13:10:03', '2026-05-19 13:10:03'),
(20, 6, 'pending', 'completed', 8, 'Process completed.', '2026-05-19 13:18:56', '2026-05-19 13:18:56', '2026-05-19 13:18:56'),
(21, 9, NULL, 'draft', 8, NULL, '2026-05-19 20:20:00', '2026-05-19 13:20:00', '2026-05-19 13:20:00'),
(22, 9, 'draft', 'pending', 8, 'Diajukan untuk approval', '2026-05-19 13:27:06', '2026-05-19 13:27:06', '2026-05-19 13:27:06'),
(23, 9, 'pending', 'approved', 8, NULL, '2026-05-19 20:27:13', '2026-05-19 13:27:13', '2026-05-19 13:27:13'),
(24, 9, 'approved', 'in_progress', 8, 'Process started.', '2026-05-19 13:27:22', '2026-05-19 13:27:22', '2026-05-19 13:27:22'),
(25, 9, 'in_progress', 'completed', 8, 'Process completed.', '2026-05-19 13:29:59', '2026-05-19 13:29:59', '2026-05-19 13:29:59'),
(26, 10, NULL, 'draft', 8, NULL, '2026-05-20 06:10:46', '2026-05-19 23:10:46', '2026-05-19 23:10:46'),
(27, 10, 'draft', 'pending', 8, 'Diajukan untuk approval', '2026-05-19 23:10:49', '2026-05-19 23:10:49', '2026-05-19 23:10:49'),
(28, 10, 'pending', 'approved', 8, NULL, '2026-05-20 06:10:56', '2026-05-19 23:10:56', '2026-05-19 23:10:56'),
(29, 10, 'approved', 'in_progress', 8, 'Process started.', '2026-05-19 23:11:02', '2026-05-19 23:11:02', '2026-05-19 23:11:02');

-- --------------------------------------------------------

--
-- Table structure for table `wo_parts_usage`
--

CREATE TABLE `wo_parts_usage` (
  `id` bigint UNSIGNED NOT NULL,
  `wo_id` bigint UNSIGNED NOT NULL,
  `part_id` bigint UNSIGNED NOT NULL,
  `qty_requested` decimal(10,2) NOT NULL DEFAULT '0.00',
  `qty_used` decimal(10,2) NOT NULL DEFAULT '0.00',
  `unit_price` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wo_process_abnormalities`
--

CREATE TABLE `wo_process_abnormalities` (
  `id` bigint UNSIGNED NOT NULL,
  `wo_id` bigint UNSIGNED NOT NULL,
  `process_instance_id` bigint UNSIGNED DEFAULT NULL,
  `step_log_id` bigint UNSIGNED DEFAULT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` enum('low','medium','high','critical') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `status` enum('open','resolved') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `summary` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details_json` json DEFAULT NULL,
  `reported_by` bigint UNSIGNED DEFAULT NULL,
  `resolved_by` bigint UNSIGNED DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wo_process_abnormalities`
--

INSERT INTO `wo_process_abnormalities` (`id`, `wo_id`, `process_instance_id`, `step_log_id`, `category`, `severity`, `status`, `summary`, `details_json`, `reported_by`, `resolved_by`, `resolved_at`, `created_at`, `updated_at`) VALUES
(1, 9, NULL, NULL, 'part_supply', 'medium', 'resolved', '-', NULL, 8, 8, '2026-05-19 14:10:56', '2026-05-19 14:10:36', '2026-05-19 14:10:56');

-- --------------------------------------------------------

--
-- Table structure for table `wo_process_events`
--

CREATE TABLE `wo_process_events` (
  `id` bigint UNSIGNED NOT NULL,
  `wo_id` bigint UNSIGNED NOT NULL,
  `event_key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_step_order` int UNSIGNED DEFAULT NULL,
  `target_step_order` int UNSIGNED DEFAULT NULL,
  `triggered_by` bigint UNSIGNED DEFAULT NULL,
  `payload_json` json DEFAULT NULL,
  `triggered_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wo_process_events`
--

INSERT INTO `wo_process_events` (`id`, `wo_id`, `event_key`, `source_step_order`, `target_step_order`, `triggered_by`, `payload_json`, `triggered_at`, `created_at`, `updated_at`) VALUES
(5, 6, 'PROCESS_STARTED', NULL, 10, 8, '[]', '2026-05-19 06:19:29', '2026-05-19 06:19:29', '2026-05-19 06:19:29'),
(6, 6, 'STEP_IN', 10, 10, 8, '{\"step_code\": \"RECEIVE_JOB\"}', '2026-05-19 12:51:22', '2026-05-19 12:51:22', '2026-05-19 12:51:22'),
(7, 6, 'BAY_IN', 10, 10, 8, '{\"bay\": \"service_bay\"}', '2026-05-19 12:51:22', '2026-05-19 12:51:22', '2026-05-19 12:51:22'),
(8, 8, 'PROCESS_STARTED', NULL, 10, 8, '[]', '2026-05-19 13:07:46', '2026-05-19 13:07:46', '2026-05-19 13:07:46'),
(9, 8, 'STEP_IN', 10, 10, 8, '{\"step_code\": \"BAY_WASHING_WAITING\"}', '2026-05-19 13:08:28', '2026-05-19 13:08:28', '2026-05-19 13:08:28'),
(10, 8, 'BAY_IN', 10, 10, 8, '{\"bay\": \"washing_bay\"}', '2026-05-19 13:08:28', '2026-05-19 13:08:28', '2026-05-19 13:08:28'),
(11, 8, 'NEXT_STEP_READY', 10, 20, 8, '{\"step_code\": \"UNIT_CHECK_PART_NEED\"}', '2026-05-19 13:08:40', '2026-05-19 13:08:40', '2026-05-19 13:08:40'),
(12, 8, 'STEP_OUT', 10, 20, 8, '{\"actual_minutes\": 1, \"downtime_minutes\": null, \"requires_approval\": false}', '2026-05-19 13:08:40', '2026-05-19 13:08:40', '2026-05-19 13:08:40'),
(13, 8, 'BAY_OUT', 10, 20, 8, '{\"bay\": \"washing_bay\"}', '2026-05-19 13:08:40', '2026-05-19 13:08:40', '2026-05-19 13:08:40'),
(14, 8, 'STEP_IN', 20, 20, 8, '{\"step_code\": \"UNIT_CHECK_PART_NEED\"}', '2026-05-19 13:08:49', '2026-05-19 13:08:49', '2026-05-19 13:08:49'),
(15, 8, 'BAY_IN', 20, 20, 8, '{\"bay\": \"service_bay\"}', '2026-05-19 13:08:49', '2026-05-19 13:08:49', '2026-05-19 13:08:49'),
(16, 8, 'PART_REQUIRED', 20, 30, 8, '[]', '2026-05-19 13:08:55', '2026-05-19 13:08:55', '2026-05-19 13:08:55'),
(17, 8, 'NEXT_STEP_READY', 20, 30, 8, '{\"step_code\": \"PART_SUPPLY\"}', '2026-05-19 13:08:55', '2026-05-19 13:08:55', '2026-05-19 13:08:55'),
(18, 8, 'STEP_OUT', 20, 30, 8, '{\"actual_minutes\": 1, \"downtime_minutes\": null, \"requires_approval\": false}', '2026-05-19 13:08:55', '2026-05-19 13:08:55', '2026-05-19 13:08:55'),
(19, 8, 'BAY_OUT', 20, 30, 8, '{\"bay\": \"service_bay\"}', '2026-05-19 13:08:55', '2026-05-19 13:08:55', '2026-05-19 13:08:55'),
(20, 8, 'STEP_IN', 30, 30, 8, '{\"step_code\": \"PART_SUPPLY\"}', '2026-05-19 13:09:03', '2026-05-19 13:09:03', '2026-05-19 13:09:03'),
(21, 8, 'BAY_IN', 30, 30, 8, '{\"bay\": \"service_bay\"}', '2026-05-19 13:09:03', '2026-05-19 13:09:03', '2026-05-19 13:09:03'),
(22, 8, 'NEXT_STEP_READY', 30, 40, 8, '{\"step_code\": \"SERVICE_REPAIR\"}', '2026-05-19 13:09:10', '2026-05-19 13:09:10', '2026-05-19 13:09:10'),
(23, 8, 'STEP_OUT', 30, 40, 8, '{\"actual_minutes\": 1, \"downtime_minutes\": null, \"requires_approval\": false}', '2026-05-19 13:09:10', '2026-05-19 13:09:10', '2026-05-19 13:09:10'),
(24, 8, 'BAY_OUT', 30, 40, 8, '{\"bay\": \"service_bay\"}', '2026-05-19 13:09:10', '2026-05-19 13:09:10', '2026-05-19 13:09:10'),
(25, 8, 'STEP_IN', 40, 40, 8, '{\"step_code\": \"SERVICE_REPAIR\"}', '2026-05-19 13:09:16', '2026-05-19 13:09:16', '2026-05-19 13:09:16'),
(26, 8, 'BAY_IN', 40, 40, 8, '{\"bay\": \"service_bay\"}', '2026-05-19 13:09:16', '2026-05-19 13:09:16', '2026-05-19 13:09:16'),
(27, 8, 'NEXT_STEP_READY', 40, 50, 8, '{\"step_code\": \"QC_CHECK\"}', '2026-05-19 13:09:26', '2026-05-19 13:09:26', '2026-05-19 13:09:26'),
(28, 8, 'STEP_OUT', 40, 50, 8, '{\"actual_minutes\": 1, \"downtime_minutes\": null, \"requires_approval\": false}', '2026-05-19 13:09:26', '2026-05-19 13:09:26', '2026-05-19 13:09:26'),
(29, 8, 'BAY_OUT', 40, 50, 8, '{\"bay\": \"service_bay\"}', '2026-05-19 13:09:26', '2026-05-19 13:09:26', '2026-05-19 13:09:26'),
(30, 8, 'STEP_IN', 50, 50, 8, '{\"step_code\": \"QC_CHECK\"}', '2026-05-19 13:09:32', '2026-05-19 13:09:32', '2026-05-19 13:09:32'),
(31, 8, 'BAY_IN', 50, 50, 8, '{\"bay\": \"qc_bay\"}', '2026-05-19 13:09:32', '2026-05-19 13:09:32', '2026-05-19 13:09:32'),
(32, 8, 'STEP_OUT', 50, NULL, 8, '{\"actual_minutes\": 1, \"downtime_minutes\": null, \"requires_approval\": true}', '2026-05-19 13:09:36', '2026-05-19 13:09:36', '2026-05-19 13:09:36'),
(33, 8, 'BAY_OUT', 50, NULL, 8, '{\"bay\": \"qc_bay\"}', '2026-05-19 13:09:36', '2026-05-19 13:09:36', '2026-05-19 13:09:36'),
(34, 8, 'NEXT_STEP_READY', 50, 60, 8, '{\"step_code\": \"CLOSE_WO\"}', '2026-05-19 13:09:48', '2026-05-19 13:09:48', '2026-05-19 13:09:48'),
(35, 8, 'QC_OK', 50, 60, 8, '[]', '2026-05-19 13:09:48', '2026-05-19 13:09:48', '2026-05-19 13:09:48'),
(36, 8, 'STEP_APPROVED', 50, 60, 8, '[]', '2026-05-19 13:09:48', '2026-05-19 13:09:48', '2026-05-19 13:09:48'),
(37, 8, 'STEP_IN', 60, 60, 8, '{\"step_code\": \"CLOSE_WO\"}', '2026-05-19 13:09:53', '2026-05-19 13:09:53', '2026-05-19 13:09:53'),
(38, 8, 'BAY_IN', 60, 60, 8, '{\"bay\": \"ready_bay\"}', '2026-05-19 13:09:53', '2026-05-19 13:09:53', '2026-05-19 13:09:53'),
(39, 8, 'STEP_OUT', 60, NULL, 8, '{\"actual_minutes\": 1, \"downtime_minutes\": null, \"requires_approval\": false}', '2026-05-19 13:09:59', '2026-05-19 13:09:59', '2026-05-19 13:09:59'),
(40, 8, 'BAY_OUT', 60, NULL, 8, '{\"bay\": \"ready_bay\"}', '2026-05-19 13:09:59', '2026-05-19 13:09:59', '2026-05-19 13:09:59'),
(41, 8, 'PROCESS_COMPLETED', 60, NULL, 8, '{\"notes\": null}', '2026-05-19 13:10:03', '2026-05-19 13:10:03', '2026-05-19 13:10:03'),
(42, 6, 'NEXT_STEP_READY', 10, 20, 8, '{\"step_code\": \"PLAN_REPAIR\"}', '2026-05-19 13:12:16', '2026-05-19 13:12:16', '2026-05-19 13:12:16'),
(43, 6, 'STEP_OUT', 10, 20, 8, '{\"actual_minutes\": 20, \"downtime_minutes\": null, \"requires_approval\": false}', '2026-05-19 13:12:16', '2026-05-19 13:12:16', '2026-05-19 13:12:16'),
(44, 6, 'BAY_OUT', 10, 20, 8, '{\"bay\": \"service_bay\"}', '2026-05-19 13:12:16', '2026-05-19 13:12:16', '2026-05-19 13:12:16'),
(45, 6, 'STEP_IN', 20, 20, 8, '{\"step_code\": \"PLAN_REPAIR\"}', '2026-05-19 13:12:23', '2026-05-19 13:12:23', '2026-05-19 13:12:23'),
(46, 6, 'BAY_IN', 20, 20, 8, '{\"bay\": \"service_bay\"}', '2026-05-19 13:12:23', '2026-05-19 13:12:23', '2026-05-19 13:12:23'),
(47, 6, 'STEP_OUT', 20, NULL, 8, '{\"actual_minutes\": 1, \"downtime_minutes\": null, \"requires_approval\": true}', '2026-05-19 13:12:28', '2026-05-19 13:12:28', '2026-05-19 13:12:28'),
(48, 6, 'BAY_OUT', 20, NULL, 8, '{\"bay\": \"service_bay\"}', '2026-05-19 13:12:28', '2026-05-19 13:12:28', '2026-05-19 13:12:28'),
(49, 6, 'NEXT_STEP_READY', 20, 30, 8, '{\"step_code\": \"EXECUTION\"}', '2026-05-19 13:12:36', '2026-05-19 13:12:36', '2026-05-19 13:12:36'),
(50, 6, 'STEP_APPROVED', 20, 30, 8, '[]', '2026-05-19 13:12:36', '2026-05-19 13:12:36', '2026-05-19 13:12:36'),
(51, 6, 'STEP_IN', 30, 30, 8, '{\"step_code\": \"EXECUTION\"}', '2026-05-19 13:17:32', '2026-05-19 13:17:32', '2026-05-19 13:17:32'),
(52, 6, 'BAY_IN', 30, 30, 8, '{\"bay\": \"service_bay\"}', '2026-05-19 13:17:32', '2026-05-19 13:17:32', '2026-05-19 13:17:32'),
(53, 6, 'NEXT_STEP_READY', 30, 40, 8, '{\"step_code\": \"TEST_RUN\"}', '2026-05-19 13:17:49', '2026-05-19 13:17:49', '2026-05-19 13:17:49'),
(54, 6, 'STEP_OUT', 30, 40, 8, '{\"actual_minutes\": 1, \"downtime_minutes\": null, \"requires_approval\": false}', '2026-05-19 13:17:49', '2026-05-19 13:17:49', '2026-05-19 13:17:49'),
(55, 6, 'BAY_OUT', 30, 40, 8, '{\"bay\": \"service_bay\"}', '2026-05-19 13:17:49', '2026-05-19 13:17:49', '2026-05-19 13:17:49'),
(56, 6, 'STEP_IN', 40, 40, 8, '{\"step_code\": \"TEST_RUN\"}', '2026-05-19 13:18:04', '2026-05-19 13:18:04', '2026-05-19 13:18:04'),
(57, 6, 'NEXT_STEP_READY', 40, 50, 8, '{\"step_code\": \"QC\"}', '2026-05-19 13:18:12', '2026-05-19 13:18:12', '2026-05-19 13:18:12'),
(58, 6, 'STEP_OUT', 40, 50, 8, '{\"actual_minutes\": 1, \"downtime_minutes\": null, \"requires_approval\": false}', '2026-05-19 13:18:12', '2026-05-19 13:18:12', '2026-05-19 13:18:12'),
(59, 6, 'STEP_IN', 50, 50, 8, '{\"step_code\": \"QC\"}', '2026-05-19 13:18:16', '2026-05-19 13:18:16', '2026-05-19 13:18:16'),
(60, 6, 'BAY_IN', 50, 50, 8, '{\"bay\": \"qc_bay\"}', '2026-05-19 13:18:16', '2026-05-19 13:18:16', '2026-05-19 13:18:16'),
(61, 6, 'STEP_OUT', 50, NULL, 8, '{\"actual_minutes\": 1, \"downtime_minutes\": null, \"requires_approval\": true}', '2026-05-19 13:18:21', '2026-05-19 13:18:21', '2026-05-19 13:18:21'),
(62, 6, 'BAY_OUT', 50, NULL, 8, '{\"bay\": \"qc_bay\"}', '2026-05-19 13:18:21', '2026-05-19 13:18:21', '2026-05-19 13:18:21'),
(63, 6, 'NEXT_STEP_READY', 50, 60, 8, '{\"step_code\": \"CLOSE\"}', '2026-05-19 13:18:28', '2026-05-19 13:18:28', '2026-05-19 13:18:28'),
(64, 6, 'STEP_APPROVED', 50, 60, 8, '[]', '2026-05-19 13:18:28', '2026-05-19 13:18:28', '2026-05-19 13:18:28'),
(65, 6, 'STEP_IN', 60, 60, 8, '{\"step_code\": \"CLOSE\"}', '2026-05-19 13:18:46', '2026-05-19 13:18:46', '2026-05-19 13:18:46'),
(66, 6, 'BAY_IN', 60, 60, 8, '{\"bay\": \"ready_bay\"}', '2026-05-19 13:18:46', '2026-05-19 13:18:46', '2026-05-19 13:18:46'),
(67, 6, 'STEP_OUT', 60, NULL, 8, '{\"actual_minutes\": 1, \"downtime_minutes\": null, \"requires_approval\": false}', '2026-05-19 13:18:51', '2026-05-19 13:18:51', '2026-05-19 13:18:51'),
(68, 6, 'BAY_OUT', 60, NULL, 8, '{\"bay\": \"ready_bay\"}', '2026-05-19 13:18:51', '2026-05-19 13:18:51', '2026-05-19 13:18:51'),
(69, 6, 'PROCESS_COMPLETED', 60, NULL, 8, '{\"notes\": null}', '2026-05-19 13:18:56', '2026-05-19 13:18:56', '2026-05-19 13:18:56'),
(70, 9, 'PROCESS_STARTED', NULL, 10, 8, '[]', '2026-05-19 13:27:22', '2026-05-19 13:27:22', '2026-05-19 13:27:22'),
(71, 9, 'STEP_IN', 10, 10, 8, '{\"step_code\": \"BAY_WASHING_WAITING\"}', '2026-05-19 13:27:31', '2026-05-19 13:27:31', '2026-05-19 13:27:31'),
(72, 9, 'BAY_IN', 10, 10, 8, '{\"bay\": \"washing_bay\"}', '2026-05-19 13:27:31', '2026-05-19 13:27:31', '2026-05-19 13:27:31'),
(73, 9, 'NEXT_STEP_READY', 10, 20, 8, '{\"step_code\": \"UNIT_CHECK_PART_NEED\"}', '2026-05-19 13:27:45', '2026-05-19 13:27:45', '2026-05-19 13:27:45'),
(74, 9, 'STEP_OUT', 10, 20, 8, '{\"actual_minutes\": 1, \"downtime_minutes\": null, \"requires_approval\": false}', '2026-05-19 13:27:45', '2026-05-19 13:27:45', '2026-05-19 13:27:45'),
(75, 9, 'BAY_OUT', 10, 20, 8, '{\"bay\": \"washing_bay\"}', '2026-05-19 13:27:45', '2026-05-19 13:27:45', '2026-05-19 13:27:45'),
(76, 9, 'STEP_IN', 20, 20, 8, '{\"step_code\": \"UNIT_CHECK_PART_NEED\"}', '2026-05-19 13:28:01', '2026-05-19 13:28:01', '2026-05-19 13:28:01'),
(77, 9, 'BAY_IN', 20, 20, 8, '{\"bay\": \"service_bay\"}', '2026-05-19 13:28:01', '2026-05-19 13:28:01', '2026-05-19 13:28:01'),
(78, 9, 'PART_REQUIRED', 20, 30, 8, '[]', '2026-05-19 13:28:10', '2026-05-19 13:28:10', '2026-05-19 13:28:10'),
(79, 9, 'NEXT_STEP_READY', 20, 30, 8, '{\"step_code\": \"PART_SUPPLY\"}', '2026-05-19 13:28:10', '2026-05-19 13:28:10', '2026-05-19 13:28:10'),
(80, 9, 'STEP_OUT', 20, 30, 8, '{\"actual_minutes\": 1, \"downtime_minutes\": null, \"requires_approval\": false}', '2026-05-19 13:28:10', '2026-05-19 13:28:10', '2026-05-19 13:28:10'),
(81, 9, 'BAY_OUT', 20, 30, 8, '{\"bay\": \"service_bay\"}', '2026-05-19 13:28:10', '2026-05-19 13:28:10', '2026-05-19 13:28:10'),
(82, 9, 'STEP_IN', 30, 30, 8, '{\"step_code\": \"PART_SUPPLY\"}', '2026-05-19 13:28:23', '2026-05-19 13:28:23', '2026-05-19 13:28:23'),
(83, 9, 'BAY_IN', 30, 30, 8, '{\"bay\": \"service_bay\"}', '2026-05-19 13:28:23', '2026-05-19 13:28:23', '2026-05-19 13:28:23'),
(84, 9, 'NEXT_STEP_READY', 30, 40, 8, '{\"step_code\": \"SERVICE_REPAIR\"}', '2026-05-19 13:28:28', '2026-05-19 13:28:28', '2026-05-19 13:28:28'),
(85, 9, 'STEP_OUT', 30, 40, 8, '{\"actual_minutes\": 1, \"downtime_minutes\": null, \"requires_approval\": false}', '2026-05-19 13:28:28', '2026-05-19 13:28:28', '2026-05-19 13:28:28'),
(86, 9, 'BAY_OUT', 30, 40, 8, '{\"bay\": \"service_bay\"}', '2026-05-19 13:28:28', '2026-05-19 13:28:28', '2026-05-19 13:28:28'),
(87, 9, 'STEP_IN', 40, 40, 8, '{\"step_code\": \"SERVICE_REPAIR\"}', '2026-05-19 13:28:37', '2026-05-19 13:28:37', '2026-05-19 13:28:37'),
(88, 9, 'BAY_IN', 40, 40, 8, '{\"bay\": \"service_bay\"}', '2026-05-19 13:28:37', '2026-05-19 13:28:37', '2026-05-19 13:28:37'),
(89, 9, 'NEXT_STEP_READY', 40, 50, 8, '{\"step_code\": \"QC_CHECK\"}', '2026-05-19 13:28:46', '2026-05-19 13:28:46', '2026-05-19 13:28:46'),
(90, 9, 'STEP_OUT', 40, 50, 8, '{\"actual_minutes\": 1, \"downtime_minutes\": null, \"requires_approval\": false}', '2026-05-19 13:28:46', '2026-05-19 13:28:46', '2026-05-19 13:28:46'),
(91, 9, 'BAY_OUT', 40, 50, 8, '{\"bay\": \"service_bay\"}', '2026-05-19 13:28:46', '2026-05-19 13:28:46', '2026-05-19 13:28:46'),
(92, 9, 'STEP_IN', 50, 50, 8, '{\"step_code\": \"QC_CHECK\"}', '2026-05-19 13:28:50', '2026-05-19 13:28:50', '2026-05-19 13:28:50'),
(93, 9, 'BAY_IN', 50, 50, 8, '{\"bay\": \"qc_bay\"}', '2026-05-19 13:28:50', '2026-05-19 13:28:50', '2026-05-19 13:28:50'),
(94, 9, 'STEP_OUT', 50, NULL, 8, '{\"actual_minutes\": 1, \"downtime_minutes\": null, \"requires_approval\": true}', '2026-05-19 13:28:54', '2026-05-19 13:28:54', '2026-05-19 13:28:54'),
(95, 9, 'BAY_OUT', 50, NULL, 8, '{\"bay\": \"qc_bay\"}', '2026-05-19 13:28:54', '2026-05-19 13:28:54', '2026-05-19 13:28:54'),
(96, 9, 'NEXT_STEP_READY', 50, 60, 8, '{\"step_code\": \"CLOSE_WO\"}', '2026-05-19 13:29:05', '2026-05-19 13:29:05', '2026-05-19 13:29:05'),
(97, 9, 'QC_OK', 50, 60, 8, '[]', '2026-05-19 13:29:05', '2026-05-19 13:29:05', '2026-05-19 13:29:05'),
(98, 9, 'STEP_APPROVED', 50, 60, 8, '[]', '2026-05-19 13:29:05', '2026-05-19 13:29:05', '2026-05-19 13:29:05'),
(99, 9, 'STEP_IN', 60, 60, 8, '{\"step_code\": \"CLOSE_WO\"}', '2026-05-19 13:29:21', '2026-05-19 13:29:21', '2026-05-19 13:29:21'),
(100, 9, 'BAY_IN', 60, 60, 8, '{\"bay\": \"ready_bay\"}', '2026-05-19 13:29:21', '2026-05-19 13:29:21', '2026-05-19 13:29:21'),
(101, 9, 'STEP_OUT', 60, NULL, 8, '{\"actual_minutes\": 1, \"downtime_minutes\": null, \"requires_approval\": false}', '2026-05-19 13:29:27', '2026-05-19 13:29:27', '2026-05-19 13:29:27'),
(102, 9, 'BAY_OUT', 60, NULL, 8, '{\"bay\": \"ready_bay\"}', '2026-05-19 13:29:27', '2026-05-19 13:29:27', '2026-05-19 13:29:27'),
(103, 9, 'PROCESS_COMPLETED', 60, NULL, 8, '{\"notes\": null}', '2026-05-19 13:29:59', '2026-05-19 13:29:59', '2026-05-19 13:29:59'),
(104, 10, 'PROCESS_STARTED', NULL, 10, 8, '[]', '2026-05-19 23:11:02', '2026-05-19 23:11:02', '2026-05-19 23:11:02'),
(105, 10, 'STEP_IN', 10, 10, 8, '{\"step_code\": \"PLANNER_CHECK\"}', '2026-05-19 23:11:23', '2026-05-19 23:11:23', '2026-05-19 23:11:23'),
(106, 10, 'BAY_IN', 10, 10, 8, '{\"bay\": \"waiting_bay\"}', '2026-05-19 23:11:23', '2026-05-19 23:11:23', '2026-05-19 23:11:23'),
(107, 10, 'NEXT_STEP_READY', 10, 20, 8, '{\"step_code\": \"KRANI_WO_JOBCARD\"}', '2026-05-19 23:11:27', '2026-05-19 23:11:27', '2026-05-19 23:11:27'),
(108, 10, 'STEP_OUT', 10, 20, 8, '{\"actual_minutes\": 1, \"downtime_minutes\": null, \"requires_approval\": false}', '2026-05-19 23:11:27', '2026-05-19 23:11:27', '2026-05-19 23:11:27'),
(109, 10, 'BAY_OUT', 10, 20, 8, '{\"bay\": \"waiting_bay\"}', '2026-05-19 23:11:27', '2026-05-19 23:11:27', '2026-05-19 23:11:27'),
(110, 10, 'STEP_IN', 20, 20, 8, '{\"step_code\": \"KRANI_WO_JOBCARD\"}', '2026-05-19 23:15:02', '2026-05-19 23:15:02', '2026-05-19 23:15:02'),
(111, 10, 'BAY_IN', 20, 20, 8, '{\"bay\": \"waiting_bay\"}', '2026-05-19 23:15:02', '2026-05-19 23:15:02', '2026-05-19 23:15:02');

-- --------------------------------------------------------

--
-- Table structure for table `wo_process_instances`
--

CREATE TABLE `wo_process_instances` (
  `id` bigint UNSIGNED NOT NULL,
  `wo_id` bigint UNSIGNED NOT NULL,
  `template_id` bigint UNSIGNED NOT NULL,
  `current_step_order` int UNSIGNED DEFAULT NULL,
  `state` enum('not_started','running','hold','done','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_started',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wo_process_instances`
--

INSERT INTO `wo_process_instances` (`id`, `wo_id`, `template_id`, `current_step_order`, `state`, `created_at`, `updated_at`) VALUES
(2, 6, 6, 60, 'done', '2026-05-19 06:19:29', '2026-05-19 13:18:56'),
(3, 8, 9, 60, 'done', '2026-05-19 13:07:45', '2026-05-19 13:10:03'),
(4, 9, 9, 60, 'done', '2026-05-19 13:27:22', '2026-05-19 13:29:59'),
(5, 10, 9, 20, 'running', '2026-05-19 23:11:02', '2026-05-19 23:11:27');

-- --------------------------------------------------------

--
-- Table structure for table `wo_process_step_logs`
--

CREATE TABLE `wo_process_step_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `wo_id` bigint UNSIGNED NOT NULL,
  `process_instance_id` bigint UNSIGNED NOT NULL,
  `template_step_id` bigint UNSIGNED DEFAULT NULL,
  `step_order` int UNSIGNED NOT NULL,
  `step_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `step_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ready','in_progress','waiting_approval','done','rejected','skipped','hold') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ready',
  `process_in_at` timestamp NULL DEFAULT NULL,
  `process_out_at` timestamp NULL DEFAULT NULL,
  `est_minutes` int UNSIGNED DEFAULT NULL,
  `actual_minutes` int UNSIGNED DEFAULT NULL,
  `downtime_minutes` int UNSIGNED DEFAULT NULL,
  `performed_by` bigint UNSIGNED DEFAULT NULL,
  `approved_by` bigint UNSIGNED DEFAULT NULL,
  `reject_reason` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `bay_in` enum('washing_bay','waiting_bay','service_bay','qc_bay','ready_bay') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bay_in_at` timestamp NULL DEFAULT NULL,
  `bay_out_at` timestamp NULL DEFAULT NULL,
  `queue_minutes` int UNSIGNED DEFAULT NULL,
  `rework_count` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wo_process_step_logs`
--

INSERT INTO `wo_process_step_logs` (`id`, `wo_id`, `process_instance_id`, `template_step_id`, `step_order`, `step_code`, `step_name`, `status`, `process_in_at`, `process_out_at`, `est_minutes`, `actual_minutes`, `downtime_minutes`, `performed_by`, `approved_by`, `reject_reason`, `notes`, `bay_in`, `bay_in_at`, `bay_out_at`, `queue_minutes`, `rework_count`, `created_at`, `updated_at`) VALUES
(6, 6, 2, 28, 10, 'RECEIVE_JOB', 'Terima WO & Diagnosa', 'done', '2026-05-19 12:51:22', '2026-05-19 13:12:16', 60, 20, NULL, 8, NULL, NULL, NULL, 'service_bay', '2026-05-19 12:51:22', '2026-05-19 13:12:16', 20, 0, '2026-05-19 06:19:29', '2026-05-19 13:12:16'),
(7, 6, 2, 29, 20, 'PLAN_REPAIR', 'Rencana Perbaikan & Part', 'done', '2026-05-19 13:12:23', '2026-05-19 13:12:28', 60, 1, NULL, 8, 8, NULL, NULL, 'service_bay', '2026-05-19 13:12:23', '2026-05-19 13:12:28', 0, 0, '2026-05-19 06:19:29', '2026-05-19 13:12:36'),
(8, 6, 2, 30, 30, 'EXECUTION', 'Pengerjaan Corrective', 'done', '2026-05-19 13:17:32', '2026-05-19 13:17:49', 240, 1, NULL, 8, NULL, NULL, NULL, 'service_bay', '2026-05-19 13:17:32', '2026-05-19 13:17:49', 0, 0, '2026-05-19 06:19:29', '2026-05-19 13:17:49'),
(9, 6, 2, 31, 40, 'TEST_RUN', 'Testing / Commissioning', 'done', '2026-05-19 13:18:04', '2026-05-19 13:18:12', 60, 1, NULL, 8, NULL, NULL, NULL, NULL, '2026-05-19 13:18:04', '2026-05-19 13:18:12', 0, 0, '2026-05-19 06:19:29', '2026-05-19 13:18:12'),
(10, 6, 2, 32, 50, 'QC', 'QC / Approval Supervisor', 'done', '2026-05-19 13:18:16', '2026-05-19 13:18:21', 45, 1, NULL, 8, 8, NULL, NULL, 'qc_bay', '2026-05-19 13:18:16', '2026-05-19 13:18:21', 0, 0, '2026-05-19 06:19:29', '2026-05-19 13:18:28'),
(11, 6, 2, 33, 60, 'CLOSE', 'Close WO', 'done', '2026-05-19 13:18:46', '2026-05-19 13:18:51', 30, 1, NULL, 8, NULL, NULL, NULL, 'ready_bay', '2026-05-19 13:18:46', '2026-05-19 13:18:51', 0, 0, '2026-05-19 06:19:29', '2026-05-19 13:18:51'),
(12, 8, 3, 45, 10, 'BAY_WASHING_WAITING', 'Transit Washing Bay -> Waiting Bay', 'done', '2026-05-19 13:08:28', '2026-05-19 13:08:40', 30, 1, NULL, 8, NULL, NULL, NULL, 'washing_bay', '2026-05-19 13:08:28', '2026-05-19 13:08:40', 0, 0, '2026-05-19 13:07:46', '2026-05-19 13:08:40'),
(13, 8, 3, 46, 20, 'UNIT_CHECK_PART_NEED', 'Pengecekan kondisi unit & kebutuhan part', 'done', '2026-05-19 13:08:49', '2026-05-19 13:08:55', 45, 1, NULL, 8, NULL, NULL, NULL, 'service_bay', '2026-05-19 13:08:49', '2026-05-19 13:08:55', 0, 0, '2026-05-19 13:07:46', '2026-05-19 13:08:55'),
(14, 8, 3, 47, 30, 'PART_SUPPLY', 'Supply part dari gudang (jika diperlukan)', 'done', '2026-05-19 13:09:03', '2026-05-19 13:09:10', 60, 1, NULL, 8, NULL, NULL, NULL, 'service_bay', '2026-05-19 13:09:03', '2026-05-19 13:09:10', 0, 0, '2026-05-19 13:07:46', '2026-05-19 13:09:10'),
(15, 8, 3, 48, 40, 'SERVICE_REPAIR', 'Melaksanakan service/perbaikan', 'done', '2026-05-19 13:09:16', '2026-05-19 13:09:26', 240, 1, NULL, 8, NULL, NULL, NULL, 'service_bay', '2026-05-19 13:09:16', '2026-05-19 13:09:26', 0, 0, '2026-05-19 13:07:46', '2026-05-19 13:09:26'),
(16, 8, 3, 49, 50, 'QC_CHECK', 'QC Koordinator Mekanik & Planner', 'done', '2026-05-19 13:09:32', '2026-05-19 13:09:36', 45, 1, NULL, 8, 8, NULL, NULL, 'qc_bay', '2026-05-19 13:09:32', '2026-05-19 13:09:36', 0, 0, '2026-05-19 13:07:46', '2026-05-19 13:09:48'),
(17, 8, 3, 50, 60, 'CLOSE_WO', 'Close WO & unit ke Ready Bay', 'done', '2026-05-19 13:09:53', '2026-05-19 13:09:59', 30, 1, NULL, 8, NULL, NULL, NULL, 'ready_bay', '2026-05-19 13:09:53', '2026-05-19 13:09:59', 0, 0, '2026-05-19 13:07:46', '2026-05-19 13:09:59'),
(18, 9, 4, 45, 10, 'BAY_WASHING_WAITING', 'Transit Washing Bay -> Waiting Bay', 'done', '2026-05-19 13:27:31', '2026-05-19 13:27:44', 30, 1, NULL, 8, NULL, NULL, 'Quick step out from kanban', 'washing_bay', '2026-05-19 13:27:31', '2026-05-19 13:27:44', 0, 0, '2026-05-19 13:27:22', '2026-05-19 13:27:45'),
(19, 9, 4, 46, 20, 'UNIT_CHECK_PART_NEED', 'Pengecekan kondisi unit & kebutuhan part', 'done', '2026-05-19 13:28:01', '2026-05-19 13:28:10', 45, 1, NULL, 8, NULL, NULL, 'Quick step out from kanban', 'service_bay', '2026-05-19 13:28:01', '2026-05-19 13:28:10', 0, 0, '2026-05-19 13:27:22', '2026-05-19 13:28:10'),
(20, 9, 4, 47, 30, 'PART_SUPPLY', 'Supply part dari gudang (jika diperlukan)', 'done', '2026-05-19 13:28:23', '2026-05-19 13:28:28', 60, 1, NULL, 8, NULL, NULL, 'Quick step out from kanban', 'service_bay', '2026-05-19 13:28:23', '2026-05-19 13:28:28', 0, 0, '2026-05-19 13:27:22', '2026-05-19 13:28:28'),
(21, 9, 4, 48, 40, 'SERVICE_REPAIR', 'Melaksanakan service/perbaikan', 'done', '2026-05-19 13:28:37', '2026-05-19 13:28:45', 240, 1, NULL, 8, NULL, NULL, 'Quick step out from kanban', 'service_bay', '2026-05-19 13:28:37', '2026-05-19 13:28:45', 0, 0, '2026-05-19 13:27:22', '2026-05-19 13:28:46'),
(22, 9, 4, 49, 50, 'QC_CHECK', 'QC Koordinator Mekanik & Planner', 'done', '2026-05-19 13:28:50', '2026-05-19 13:28:54', 45, 1, NULL, 8, 8, NULL, NULL, 'qc_bay', '2026-05-19 13:28:50', '2026-05-19 13:28:54', 0, 0, '2026-05-19 13:27:22', '2026-05-19 13:29:05'),
(23, 9, 4, 50, 60, 'CLOSE_WO', 'Close WO & unit ke Ready Bay', 'done', '2026-05-19 13:29:21', '2026-05-19 13:29:26', 30, 1, NULL, 8, NULL, NULL, 'Quick step out from kanban', 'ready_bay', '2026-05-19 13:29:21', '2026-05-19 13:29:26', 0, 0, '2026-05-19 13:27:22', '2026-05-19 13:29:26'),
(24, 10, 5, 45, 10, 'PLANNER_CHECK', 'Planner cek kondisi unit & kebutuhan part', 'done', '2026-05-19 23:11:23', '2026-05-19 23:11:27', 20, 1, NULL, 8, NULL, NULL, NULL, 'waiting_bay', '2026-05-19 23:11:23', '2026-05-19 23:11:27', 0, 0, '2026-05-19 23:11:02', '2026-05-19 23:11:27'),
(25, 10, 5, 46, 20, 'KRANI_WO_JOBCARD', 'Krani buat WO, waiting approval, cetak jobcard', 'in_progress', '2026-05-19 23:15:02', NULL, 30, NULL, NULL, 8, NULL, NULL, 'Quick step in from kanban', 'waiting_bay', '2026-05-19 23:15:02', NULL, NULL, 0, '2026-05-19 23:11:02', '2026-05-19 23:15:02'),
(26, 10, 5, 47, 30, 'ASST_VERIFY_JOBCARD', 'Asst Workshop verifikasi & validasi jobcard', 'ready', NULL, NULL, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2026-05-19 23:11:02', '2026-05-19 23:11:02'),
(27, 10, 5, 48, 40, 'KOORD_ALLOCATE_MECHANIC', 'Koord Mekanik alokasi pekerjaan mekanik', 'ready', NULL, NULL, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2026-05-19 23:11:02', '2026-05-19 23:11:02'),
(28, 10, 5, 49, 50, 'BAY_WASHING', 'Washing Bay', 'ready', NULL, NULL, 15, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2026-05-19 23:11:02', '2026-05-19 23:11:02'),
(29, 10, 5, 50, 60, 'BAY_WAITING', 'Waiting Bay', 'ready', NULL, NULL, 30, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2026-05-19 23:11:02', '2026-05-19 23:11:02'),
(30, 10, 5, 69, 70, 'UNIT_CHECK_PART_NEED', 'Pengecekan kondisi unit & kebutuhan part', 'ready', NULL, NULL, 45, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2026-05-19 23:11:02', '2026-05-19 23:11:02'),
(31, 10, 5, 73, 80, 'PART_SUPPLY', 'Supply part dari gudang (jika diperlukan)', 'ready', NULL, NULL, 60, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2026-05-19 23:11:02', '2026-05-19 23:11:02'),
(32, 10, 5, 74, 90, 'SERVICE_REPAIR', 'Melaksanakan service/perbaikan', 'ready', NULL, NULL, 240, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2026-05-19 23:11:02', '2026-05-19 23:11:02'),
(33, 10, 5, 75, 100, 'QC_CHECK', 'QC Koordinator Mekanik & Planner', 'ready', NULL, NULL, 45, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2026-05-19 23:11:02', '2026-05-19 23:11:02'),
(34, 10, 5, 76, 110, 'CLOSE_WO', 'Close WO & unit ke Ready Bay', 'ready', NULL, NULL, 30, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2026-05-19 23:11:02', '2026-05-19 23:11:02');

-- --------------------------------------------------------

--
-- Table structure for table `wo_process_templates`
--

CREATE TABLE `wo_process_templates` (
  `id` bigint UNSIGNED NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `wo_type` enum('preventive','corrective','breakdown','inspection') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wo_process_templates`
--

INSERT INTO `wo_process_templates` (`id`, `code`, `name`, `wo_type`, `is_active`, `created_at`, `updated_at`) VALUES
(5, 'WO-PREVENTIVE-V1', 'Workshop Preventive Standard', 'preventive', 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(6, 'WO-CORRECTIVE-V1', 'Workshop Corrective Standard', 'corrective', 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(7, 'WO-BREAKDOWN-V1', 'Workshop Breakdown Emergency', 'breakdown', 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(8, 'WO-INSPECTION-V1', 'Workshop Inspection Follow-up', 'inspection', 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(9, 'WO-WORKSHOP-BAY-PREVENTIVE-V1', 'Workshop Bay Flow Preventive', 'preventive', 1, '2026-05-19 06:42:13', '2026-05-19 06:42:13'),
(10, 'WO-WORKSHOP-BAY-CORRECTIVE-V1', 'Workshop Bay Flow Corrective', 'corrective', 1, '2026-05-19 06:42:13', '2026-05-19 06:42:13'),
(11, 'WO-WORKSHOP-BAY-BREAKDOWN-V1', 'Workshop Bay Flow Breakdown', 'breakdown', 1, '2026-05-19 06:42:13', '2026-05-19 06:42:13'),
(12, 'WO-WORKSHOP-BAY-INSPECTION-V1', 'Workshop Bay Flow Inspection', 'inspection', 1, '2026-05-19 06:42:13', '2026-05-19 06:42:13');

-- --------------------------------------------------------

--
-- Table structure for table `wo_process_template_steps`
--

CREATE TABLE `wo_process_template_steps` (
  `id` bigint UNSIGNED NOT NULL,
  `template_id` bigint UNSIGNED NOT NULL,
  `step_order` int UNSIGNED NOT NULL,
  `step_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `step_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sla_minutes` int UNSIGNED DEFAULT NULL,
  `requires_approval` tinyint(1) NOT NULL DEFAULT '0',
  `allow_parallel` tinyint(1) NOT NULL DEFAULT '0',
  `is_mandatory` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wo_process_template_steps`
--

INSERT INTO `wo_process_template_steps` (`id`, `template_id`, `step_order`, `step_code`, `step_name`, `sla_minutes`, `requires_approval`, `allow_parallel`, `is_mandatory`, `created_at`, `updated_at`) VALUES
(23, 5, 10, 'RECEIVE_JOB', 'Terima WO & Persiapan', 30, 0, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(24, 5, 20, 'INSPECTION', 'Inspection & Checklist Awal', 45, 0, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(25, 5, 30, 'EXECUTION', 'Pengerjaan Preventive', 180, 0, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(26, 5, 40, 'QC', 'QC / Review Supervisor', 45, 1, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(27, 5, 50, 'CLOSE', 'Close WO & Serah Unit', 30, 0, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(28, 6, 10, 'RECEIVE_JOB', 'Terima WO & Diagnosa', 60, 0, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(29, 6, 20, 'PLAN_REPAIR', 'Rencana Perbaikan & Part', 60, 1, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(30, 6, 30, 'EXECUTION', 'Pengerjaan Corrective', 240, 0, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(31, 6, 40, 'TEST_RUN', 'Testing / Commissioning', 60, 0, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(32, 6, 50, 'QC', 'QC / Approval Supervisor', 45, 1, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(33, 6, 60, 'CLOSE', 'Close WO', 30, 0, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(34, 7, 10, 'TRIAGE', 'Emergency Triage', 20, 0, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(35, 7, 20, 'ISOLATION', 'Isolasi Unit & Safety Control', 20, 0, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(36, 7, 30, 'REPAIR', 'Perbaikan Darurat', 180, 0, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(37, 7, 40, 'TEST_RUN', 'Test Run Cepat', 40, 0, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(38, 7, 50, 'APPROVAL', 'Review Supervisor', 30, 1, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(39, 7, 60, 'CLOSE', 'Close Breakdown WO', 20, 0, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(40, 8, 10, 'RECEIVE_FINDING', 'Terima Temuan Inspeksi', 30, 0, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(41, 8, 20, 'VERIFY_FINDING', 'Verifikasi Temuan', 45, 0, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(42, 8, 30, 'ACTION', 'Tindakan Perbaikan', 120, 0, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(43, 8, 40, 'VALIDATION', 'Validasi Hasil', 45, 1, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(44, 8, 50, 'CLOSE', 'Close WO Inspeksi', 20, 0, 0, 1, '2026-05-19 05:59:50', '2026-05-19 05:59:50'),
(45, 9, 10, 'PLANNER_CHECK', 'Planner cek kondisi unit & kebutuhan part', 20, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(46, 9, 20, 'KRANI_WO_JOBCARD', 'Krani buat WO, waiting approval, cetak jobcard', 30, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(47, 9, 30, 'ASST_VERIFY_JOBCARD', 'Asst Workshop verifikasi & validasi jobcard', 20, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(48, 9, 40, 'KOORD_ALLOCATE_MECHANIC', 'Koord Mekanik alokasi pekerjaan mekanik', 20, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(49, 9, 50, 'BAY_WASHING', 'Washing Bay', 15, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(50, 9, 60, 'BAY_WAITING', 'Waiting Bay', 30, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(51, 10, 10, 'PLANNER_CHECK', 'Planner cek kondisi unit & kebutuhan part', 20, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(52, 10, 20, 'KRANI_WO_JOBCARD', 'Krani buat WO, waiting approval, cetak jobcard', 30, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(53, 10, 30, 'ASST_VERIFY_JOBCARD', 'Asst Workshop verifikasi & validasi jobcard', 20, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(54, 10, 40, 'KOORD_ALLOCATE_MECHANIC', 'Koord Mekanik alokasi pekerjaan mekanik', 20, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(55, 10, 50, 'BAY_WASHING', 'Washing Bay', 15, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(56, 10, 60, 'BAY_WAITING', 'Waiting Bay', 30, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(57, 11, 10, 'PLANNER_CHECK', 'Planner cek kondisi unit & kebutuhan part', 20, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(58, 11, 20, 'KRANI_WO_JOBCARD', 'Krani buat WO, waiting approval, cetak jobcard', 30, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(59, 11, 30, 'ASST_VERIFY_JOBCARD', 'Asst Workshop verifikasi & validasi jobcard', 20, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(60, 11, 40, 'KOORD_ALLOCATE_MECHANIC', 'Koord Mekanik alokasi pekerjaan mekanik', 20, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(61, 11, 50, 'BAY_WASHING', 'Washing Bay', 15, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(62, 11, 60, 'BAY_WAITING', 'Waiting Bay', 30, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(63, 12, 10, 'PLANNER_CHECK', 'Planner cek kondisi unit & kebutuhan part', 20, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(64, 12, 20, 'KRANI_WO_JOBCARD', 'Krani buat WO, waiting approval, cetak jobcard', 30, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(65, 12, 30, 'ASST_VERIFY_JOBCARD', 'Asst Workshop verifikasi & validasi jobcard', 20, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(66, 12, 40, 'KOORD_ALLOCATE_MECHANIC', 'Koord Mekanik alokasi pekerjaan mekanik', 20, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(67, 12, 50, 'BAY_WASHING', 'Washing Bay', 15, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(68, 12, 60, 'BAY_WAITING', 'Waiting Bay', 30, 0, 0, 1, '2026-05-19 06:42:13', '2026-05-19 13:47:02'),
(69, 9, 70, 'UNIT_CHECK_PART_NEED', 'Pengecekan kondisi unit & kebutuhan part', 45, 0, 0, 1, '2026-05-19 13:32:31', '2026-05-19 13:47:02'),
(70, 10, 70, 'UNIT_CHECK_PART_NEED', 'Pengecekan kondisi unit & kebutuhan part', 45, 0, 0, 1, '2026-05-19 13:32:32', '2026-05-19 13:47:02'),
(71, 11, 70, 'UNIT_CHECK_PART_NEED', 'Pengecekan kondisi unit & kebutuhan part', 45, 0, 0, 1, '2026-05-19 13:32:32', '2026-05-19 13:47:02'),
(72, 12, 70, 'UNIT_CHECK_PART_NEED', 'Pengecekan kondisi unit & kebutuhan part', 45, 0, 0, 1, '2026-05-19 13:32:32', '2026-05-19 13:47:02'),
(73, 9, 80, 'PART_SUPPLY', 'Supply part dari gudang (jika diperlukan)', 60, 0, 0, 1, '2026-05-19 13:47:02', '2026-05-19 13:47:02'),
(74, 9, 90, 'SERVICE_REPAIR', 'Melaksanakan service/perbaikan', 240, 0, 0, 1, '2026-05-19 13:47:02', '2026-05-19 13:47:02'),
(75, 9, 100, 'QC_CHECK', 'QC Koordinator Mekanik & Planner', 45, 1, 0, 1, '2026-05-19 13:47:02', '2026-05-19 13:47:02'),
(76, 9, 110, 'CLOSE_WO', 'Close WO & unit ke Ready Bay', 30, 0, 0, 1, '2026-05-19 13:47:02', '2026-05-19 13:47:02'),
(77, 10, 80, 'PART_SUPPLY', 'Supply part dari gudang (jika diperlukan)', 60, 0, 0, 1, '2026-05-19 13:47:02', '2026-05-19 13:47:02'),
(78, 10, 90, 'SERVICE_REPAIR', 'Melaksanakan service/perbaikan', 240, 0, 0, 1, '2026-05-19 13:47:02', '2026-05-19 13:47:02'),
(79, 10, 100, 'QC_CHECK', 'QC Koordinator Mekanik & Planner', 45, 1, 0, 1, '2026-05-19 13:47:02', '2026-05-19 13:47:02'),
(80, 10, 110, 'CLOSE_WO', 'Close WO & unit ke Ready Bay', 30, 0, 0, 1, '2026-05-19 13:47:02', '2026-05-19 13:47:02'),
(81, 11, 80, 'PART_SUPPLY', 'Supply part dari gudang (jika diperlukan)', 60, 0, 0, 1, '2026-05-19 13:47:02', '2026-05-19 13:47:02'),
(82, 11, 90, 'SERVICE_REPAIR', 'Melaksanakan service/perbaikan', 240, 0, 0, 1, '2026-05-19 13:47:02', '2026-05-19 13:47:02'),
(83, 11, 100, 'QC_CHECK', 'QC Koordinator Mekanik & Planner', 45, 1, 0, 1, '2026-05-19 13:47:02', '2026-05-19 13:47:02'),
(84, 11, 110, 'CLOSE_WO', 'Close WO & unit ke Ready Bay', 30, 0, 0, 1, '2026-05-19 13:47:02', '2026-05-19 13:47:02'),
(85, 12, 80, 'PART_SUPPLY', 'Supply part dari gudang (jika diperlukan)', 60, 0, 0, 1, '2026-05-19 13:47:02', '2026-05-19 13:47:02'),
(86, 12, 90, 'SERVICE_REPAIR', 'Melaksanakan service/perbaikan', 240, 0, 0, 1, '2026-05-19 13:47:02', '2026-05-19 13:47:02'),
(87, 12, 100, 'QC_CHECK', 'QC Koordinator Mekanik & Planner', 45, 1, 0, 1, '2026-05-19 13:47:02', '2026-05-19 13:47:02'),
(88, 12, 110, 'CLOSE_WO', 'Close WO & unit ke Ready Bay', 30, 0, 0, 1, '2026-05-19 13:47:02', '2026-05-19 13:47:02');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject` (`subject_type`,`subject_id`),
  ADD KEY `causer` (`causer_type`,`causer_id`),
  ADD KEY `activity_log_log_name_index` (`log_name`);

--
-- Indexes for table `app_menus`
--
ALTER TABLE `app_menus`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `app_menus_menu_key_unique` (`menu_key`),
  ADD KEY `app_menus_parent_id_foreign` (`parent_id`);

--
-- Indexes for table `app_menu_services`
--
ALTER TABLE `app_menu_services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `app_menu_services_service_key_unique` (`service_key`),
  ADD KEY `app_menu_services_menu_id_is_active_index` (`menu_id`,`is_active`),
  ADD KEY `app_menu_services_permission_name_index` (`permission_name`);

--
-- Indexes for table `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `assets_code_unique` (`code`),
  ADD UNIQUE KEY `assets_qr_code_unique` (`qr_code`),
  ADD UNIQUE KEY `assets_public_uuid_unique` (`public_uuid`),
  ADD KEY `assets_category_id_foreign` (`category_id`);

--
-- Indexes for table `asset_categories`
--
ALTER TABLE `asset_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `asset_documents`
--
ALTER TABLE `asset_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `asset_documents_asset_id_foreign` (`asset_id`);

--
-- Indexes for table `asset_locations`
--
ALTER TABLE `asset_locations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `asset_locations_recorded_by_foreign` (`recorded_by`),
  ADD KEY `asset_locations_asset_id_created_at_index` (`asset_id`,`created_at`);

--
-- Indexes for table `asset_photos`
--
ALTER TABLE `asset_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `asset_photos_asset_id_foreign` (`asset_id`);

--
-- Indexes for table `asset_preventive_settings`
--
ALTER TABLE `asset_preventive_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `asset_preventive_settings_asset_id_unique` (`asset_id`);

--
-- Indexes for table `asset_workshop_histories`
--
ALTER TABLE `asset_workshop_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `asset_workshop_histories_asset_id_foreign` (`asset_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  ADD KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`);

--
-- Indexes for table `hm_logs`
--
ALTER TABLE `hm_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hm_logs_recorded_by_foreign` (`recorded_by`),
  ADD KEY `hm_logs_asset_id_recorded_at_index` (`asset_id`,`recorded_at`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `inventory_part_id_location_unique` (`part_id`,`location`);

--
-- Indexes for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inventory_transactions_processed_by_foreign` (`processed_by`),
  ADD KEY `inventory_transactions_part_id_created_at_index` (`part_id`,`created_at`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `maintenance_schedules`
--
ALTER TABLE `maintenance_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `maintenance_schedules_asset_id_foreign` (`asset_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_is_read_index` (`user_id`,`is_read`),
  ADD KEY `notifications_user_id_created_at_index` (`user_id`,`created_at`);

--
-- Indexes for table `p2h_items`
--
ALTER TABLE `p2h_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `p2h_items_submission_id_foreign` (`submission_id`);

--
-- Indexes for table `p2h_submissions`
--
ALTER TABLE `p2h_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `p2h_submissions_template_id_foreign` (`template_id`),
  ADD KEY `p2h_submissions_reviewed_by_foreign` (`reviewed_by`),
  ADD KEY `p2h_submissions_asset_id_created_at_index` (`asset_id`,`created_at`),
  ADD KEY `p2h_submissions_operator_id_created_at_index` (`operator_id`,`created_at`),
  ADD KEY `p2h_submissions_status_index` (`status`);

--
-- Indexes for table `p2h_templates`
--
ALTER TABLE `p2h_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `p2h_templates_asset_category_id_foreign` (`asset_category_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `smtp_configurations`
--
ALTER TABLE `smtp_configurations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `smtp_configurations_created_by_foreign` (`created_by`),
  ADD KEY `smtp_configurations_updated_by_foreign` (`updated_by`);

--
-- Indexes for table `smtp_test_email_logs`
--
ALTER TABLE `smtp_test_email_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `smtp_test_email_logs_smtp_configuration_id_foreign` (`smtp_configuration_id`),
  ADD KEY `smtp_test_email_logs_created_by_foreign` (`created_by`);

--
-- Indexes for table `spare_parts`
--
ALTER TABLE `spare_parts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `spare_parts_code_unique` (`code`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `system_settings_key_unique` (`key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `user_access_modes`
--
ALTER TABLE `user_access_modes`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_profiles_user_id_unique` (`user_id`),
  ADD UNIQUE KEY `user_profiles_employee_code_unique` (`employee_code`),
  ADD KEY `user_profiles_job_code_index` (`job_code`),
  ADD KEY `user_profiles_employment_status_index` (`employment_status`),
  ADD KEY `user_profiles_site_location_index` (`site_location`);

--
-- Indexes for table `work_orders`
--
ALTER TABLE `work_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `work_orders_code_unique` (`code`),
  ADD KEY `work_orders_created_by_foreign` (`created_by`),
  ADD KEY `work_orders_approved_by_foreign` (`approved_by`),
  ADD KEY `work_orders_asset_id_status_index` (`asset_id`,`status`),
  ADD KEY `work_orders_supervisor_id_status_index` (`supervisor_id`,`status`),
  ADD KEY `work_orders_status_index` (`status`),
  ADD KEY `work_orders_process_template_id_foreign` (`process_template_id`),
  ADD KEY `work_orders_sap_reference_no_index` (`sap_reference_no`),
  ADD KEY `work_orders_wo_source_index` (`wo_source`),
  ADD KEY `work_orders_jobcard_no_index` (`jobcard_no`),
  ADD KEY `work_orders_jobcard_status_index` (`jobcard_status`),
  ADD KEY `work_orders_schedule_id_status_index` (`schedule_id`,`status`);

--
-- Indexes for table `work_order_assignees`
--
ALTER TABLE `work_order_assignees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `work_order_assignees_wo_id_user_id_unique` (`wo_id`,`user_id`),
  ADD KEY `work_order_assignees_user_id_foreign` (`user_id`);

--
-- Indexes for table `work_order_attachments`
--
ALTER TABLE `work_order_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `work_order_attachments_wo_id_foreign` (`wo_id`),
  ADD KEY `work_order_attachments_uploaded_by_foreign` (`uploaded_by`);

--
-- Indexes for table `work_order_checklists`
--
ALTER TABLE `work_order_checklists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `work_order_checklists_wo_id_foreign` (`wo_id`),
  ADD KEY `work_order_checklists_done_by_foreign` (`done_by`);

--
-- Indexes for table `work_order_comments`
--
ALTER TABLE `work_order_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `work_order_comments_wo_id_foreign` (`wo_id`),
  ADD KEY `work_order_comments_user_id_foreign` (`user_id`);

--
-- Indexes for table `work_order_status_logs`
--
ALTER TABLE `work_order_status_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `work_order_status_logs_wo_id_foreign` (`wo_id`),
  ADD KEY `work_order_status_logs_changed_by_foreign` (`changed_by`);

--
-- Indexes for table `wo_parts_usage`
--
ALTER TABLE `wo_parts_usage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wo_parts_usage_wo_id_foreign` (`wo_id`),
  ADD KEY `wo_parts_usage_part_id_foreign` (`part_id`);

--
-- Indexes for table `wo_process_abnormalities`
--
ALTER TABLE `wo_process_abnormalities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wo_process_abnormalities_process_instance_id_foreign` (`process_instance_id`),
  ADD KEY `wo_process_abnormalities_step_log_id_foreign` (`step_log_id`),
  ADD KEY `wo_process_abnormalities_reported_by_foreign` (`reported_by`),
  ADD KEY `wo_process_abnormalities_resolved_by_foreign` (`resolved_by`),
  ADD KEY `wo_process_abnormalities_wo_id_status_index` (`wo_id`,`status`),
  ADD KEY `wo_process_abnormalities_category_severity_index` (`category`,`severity`);

--
-- Indexes for table `wo_process_events`
--
ALTER TABLE `wo_process_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wo_process_events_triggered_by_foreign` (`triggered_by`),
  ADD KEY `wo_process_events_wo_id_triggered_at_index` (`wo_id`,`triggered_at`),
  ADD KEY `wo_process_events_event_key_index` (`event_key`);

--
-- Indexes for table `wo_process_instances`
--
ALTER TABLE `wo_process_instances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wo_process_instances_template_id_foreign` (`template_id`),
  ADD KEY `wo_process_instances_wo_id_state_index` (`wo_id`,`state`);

--
-- Indexes for table `wo_process_step_logs`
--
ALTER TABLE `wo_process_step_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wo_process_step_logs_template_step_id_foreign` (`template_step_id`),
  ADD KEY `wo_process_step_logs_performed_by_foreign` (`performed_by`),
  ADD KEY `wo_process_step_logs_approved_by_foreign` (`approved_by`),
  ADD KEY `wo_process_step_logs_wo_id_step_order_index` (`wo_id`,`step_order`),
  ADD KEY `wo_process_step_logs_process_instance_id_status_index` (`process_instance_id`,`status`),
  ADD KEY `wo_process_step_logs_wo_id_bay_in_index` (`wo_id`,`bay_in`);

--
-- Indexes for table `wo_process_templates`
--
ALTER TABLE `wo_process_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wo_process_templates_code_unique` (`code`),
  ADD KEY `wo_process_templates_wo_type_is_active_index` (`wo_type`,`is_active`);

--
-- Indexes for table `wo_process_template_steps`
--
ALTER TABLE `wo_process_template_steps`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wo_process_template_steps_template_id_step_order_unique` (`template_id`,`step_order`),
  ADD UNIQUE KEY `wo_process_template_steps_template_id_step_code_unique` (`template_id`,`step_code`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=988;

--
-- AUTO_INCREMENT for table `app_menus`
--
ALTER TABLE `app_menus`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `app_menu_services`
--
ALTER TABLE `app_menu_services`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `assets`
--
ALTER TABLE `assets`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=571;

--
-- AUTO_INCREMENT for table `asset_categories`
--
ALTER TABLE `asset_categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `asset_documents`
--
ALTER TABLE `asset_documents`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `asset_locations`
--
ALTER TABLE `asset_locations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `asset_photos`
--
ALTER TABLE `asset_photos`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `asset_preventive_settings`
--
ALTER TABLE `asset_preventive_settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `asset_workshop_histories`
--
ALTER TABLE `asset_workshop_histories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hm_logs`
--
ALTER TABLE `hm_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `maintenance_schedules`
--
ALTER TABLE `maintenance_schedules`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `p2h_items`
--
ALTER TABLE `p2h_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `p2h_submissions`
--
ALTER TABLE `p2h_submissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `p2h_templates`
--
ALTER TABLE `p2h_templates`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `smtp_configurations`
--
ALTER TABLE `smtp_configurations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `smtp_test_email_logs`
--
ALTER TABLE `smtp_test_email_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `spare_parts`
--
ALTER TABLE `spare_parts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `user_profiles`
--
ALTER TABLE `user_profiles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `work_orders`
--
ALTER TABLE `work_orders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `work_order_assignees`
--
ALTER TABLE `work_order_assignees`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `work_order_attachments`
--
ALTER TABLE `work_order_attachments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `work_order_checklists`
--
ALTER TABLE `work_order_checklists`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `work_order_comments`
--
ALTER TABLE `work_order_comments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `work_order_status_logs`
--
ALTER TABLE `work_order_status_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `wo_parts_usage`
--
ALTER TABLE `wo_parts_usage`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wo_process_abnormalities`
--
ALTER TABLE `wo_process_abnormalities`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `wo_process_events`
--
ALTER TABLE `wo_process_events`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=112;

--
-- AUTO_INCREMENT for table `wo_process_instances`
--
ALTER TABLE `wo_process_instances`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `wo_process_step_logs`
--
ALTER TABLE `wo_process_step_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `wo_process_templates`
--
ALTER TABLE `wo_process_templates`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `wo_process_template_steps`
--
ALTER TABLE `wo_process_template_steps`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `app_menus`
--
ALTER TABLE `app_menus`
  ADD CONSTRAINT `app_menus_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `app_menus` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `app_menu_services`
--
ALTER TABLE `app_menu_services`
  ADD CONSTRAINT `app_menu_services_menu_id_foreign` FOREIGN KEY (`menu_id`) REFERENCES `app_menus` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assets`
--
ALTER TABLE `assets`
  ADD CONSTRAINT `assets_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `asset_categories` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `asset_documents`
--
ALTER TABLE `asset_documents`
  ADD CONSTRAINT `asset_documents_asset_id_foreign` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `asset_locations`
--
ALTER TABLE `asset_locations`
  ADD CONSTRAINT `asset_locations_asset_id_foreign` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `asset_locations_recorded_by_foreign` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `asset_photos`
--
ALTER TABLE `asset_photos`
  ADD CONSTRAINT `asset_photos_asset_id_foreign` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `asset_preventive_settings`
--
ALTER TABLE `asset_preventive_settings`
  ADD CONSTRAINT `asset_preventive_settings_asset_id_foreign` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `asset_workshop_histories`
--
ALTER TABLE `asset_workshop_histories`
  ADD CONSTRAINT `asset_workshop_histories_asset_id_foreign` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hm_logs`
--
ALTER TABLE `hm_logs`
  ADD CONSTRAINT `hm_logs_asset_id_foreign` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hm_logs_recorded_by_foreign` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_part_id_foreign` FOREIGN KEY (`part_id`) REFERENCES `spare_parts` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  ADD CONSTRAINT `inventory_transactions_part_id_foreign` FOREIGN KEY (`part_id`) REFERENCES `spare_parts` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `inventory_transactions_processed_by_foreign` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `maintenance_schedules`
--
ALTER TABLE `maintenance_schedules`
  ADD CONSTRAINT `maintenance_schedules_asset_id_foreign` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `p2h_items`
--
ALTER TABLE `p2h_items`
  ADD CONSTRAINT `p2h_items_submission_id_foreign` FOREIGN KEY (`submission_id`) REFERENCES `p2h_submissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `p2h_submissions`
--
ALTER TABLE `p2h_submissions`
  ADD CONSTRAINT `p2h_submissions_asset_id_foreign` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `p2h_submissions_operator_id_foreign` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `p2h_submissions_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `p2h_submissions_template_id_foreign` FOREIGN KEY (`template_id`) REFERENCES `p2h_templates` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `p2h_templates`
--
ALTER TABLE `p2h_templates`
  ADD CONSTRAINT `p2h_templates_asset_category_id_foreign` FOREIGN KEY (`asset_category_id`) REFERENCES `asset_categories` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `smtp_configurations`
--
ALTER TABLE `smtp_configurations`
  ADD CONSTRAINT `smtp_configurations_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `smtp_configurations_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `smtp_test_email_logs`
--
ALTER TABLE `smtp_test_email_logs`
  ADD CONSTRAINT `smtp_test_email_logs_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `smtp_test_email_logs_smtp_configuration_id_foreign` FOREIGN KEY (`smtp_configuration_id`) REFERENCES `smtp_configurations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_access_modes`
--
ALTER TABLE `user_access_modes`
  ADD CONSTRAINT `user_access_modes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `user_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `work_orders`
--
ALTER TABLE `work_orders`
  ADD CONSTRAINT `work_orders_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `work_orders_asset_id_foreign` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `work_orders_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `work_orders_process_template_id_foreign` FOREIGN KEY (`process_template_id`) REFERENCES `wo_process_templates` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `work_orders_schedule_id_foreign` FOREIGN KEY (`schedule_id`) REFERENCES `maintenance_schedules` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `work_orders_supervisor_id_foreign` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `work_order_assignees`
--
ALTER TABLE `work_order_assignees`
  ADD CONSTRAINT `work_order_assignees_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `work_order_assignees_wo_id_foreign` FOREIGN KEY (`wo_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `work_order_attachments`
--
ALTER TABLE `work_order_attachments`
  ADD CONSTRAINT `work_order_attachments_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `work_order_attachments_wo_id_foreign` FOREIGN KEY (`wo_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `work_order_checklists`
--
ALTER TABLE `work_order_checklists`
  ADD CONSTRAINT `work_order_checklists_done_by_foreign` FOREIGN KEY (`done_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `work_order_checklists_wo_id_foreign` FOREIGN KEY (`wo_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `work_order_comments`
--
ALTER TABLE `work_order_comments`
  ADD CONSTRAINT `work_order_comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `work_order_comments_wo_id_foreign` FOREIGN KEY (`wo_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `work_order_status_logs`
--
ALTER TABLE `work_order_status_logs`
  ADD CONSTRAINT `work_order_status_logs_changed_by_foreign` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `work_order_status_logs_wo_id_foreign` FOREIGN KEY (`wo_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wo_parts_usage`
--
ALTER TABLE `wo_parts_usage`
  ADD CONSTRAINT `wo_parts_usage_part_id_foreign` FOREIGN KEY (`part_id`) REFERENCES `spare_parts` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `wo_parts_usage_wo_id_foreign` FOREIGN KEY (`wo_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wo_process_abnormalities`
--
ALTER TABLE `wo_process_abnormalities`
  ADD CONSTRAINT `wo_process_abnormalities_process_instance_id_foreign` FOREIGN KEY (`process_instance_id`) REFERENCES `wo_process_instances` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `wo_process_abnormalities_reported_by_foreign` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `wo_process_abnormalities_resolved_by_foreign` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `wo_process_abnormalities_step_log_id_foreign` FOREIGN KEY (`step_log_id`) REFERENCES `wo_process_step_logs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `wo_process_abnormalities_wo_id_foreign` FOREIGN KEY (`wo_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wo_process_events`
--
ALTER TABLE `wo_process_events`
  ADD CONSTRAINT `wo_process_events_triggered_by_foreign` FOREIGN KEY (`triggered_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `wo_process_events_wo_id_foreign` FOREIGN KEY (`wo_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wo_process_instances`
--
ALTER TABLE `wo_process_instances`
  ADD CONSTRAINT `wo_process_instances_template_id_foreign` FOREIGN KEY (`template_id`) REFERENCES `wo_process_templates` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `wo_process_instances_wo_id_foreign` FOREIGN KEY (`wo_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wo_process_step_logs`
--
ALTER TABLE `wo_process_step_logs`
  ADD CONSTRAINT `wo_process_step_logs_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `wo_process_step_logs_performed_by_foreign` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `wo_process_step_logs_process_instance_id_foreign` FOREIGN KEY (`process_instance_id`) REFERENCES `wo_process_instances` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wo_process_step_logs_template_step_id_foreign` FOREIGN KEY (`template_step_id`) REFERENCES `wo_process_template_steps` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `wo_process_step_logs_wo_id_foreign` FOREIGN KEY (`wo_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wo_process_template_steps`
--
ALTER TABLE `wo_process_template_steps`
  ADD CONSTRAINT `wo_process_template_steps_template_id_foreign` FOREIGN KEY (`template_id`) REFERENCES `wo_process_templates` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
