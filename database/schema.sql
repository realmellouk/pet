-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 15, 2026 at 11:26 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pet_marketplace`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(80) NOT NULL,
  `slug` varchar(80) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `icon`, `image`, `created_at`) VALUES
(1, 'Dog Food', 'dog-food', 'Premium nutrition for dogs', '🐕', NULL, '2026-05-06 12:58:18'),
(2, 'Cat Food', 'cat-food', 'Delicious meals for cats', '🐈', NULL, '2026-05-06 12:58:18'),
(3, 'Bird Supplies', 'bird-supplies', 'Everything for your feathered friend', '🦜', NULL, '2026-05-06 12:58:18'),
(4, 'Fish & Aquatic', 'fish-aquatic', 'Tanks, food & accessories', '🐠', NULL, '2026-05-06 12:58:18'),
(5, 'Toys & Play', 'toys-play', 'Keep your pets entertained', '🎾', NULL, '2026-05-06 12:58:18'),
(6, 'Grooming', 'grooming', 'Shampoos, brushes and more', '✂️', NULL, '2026-05-06 12:58:18'),
(7, 'Health & Vet', 'health-vet', 'Vitamins, meds & supplements', '💊', NULL, '2026-05-06 12:58:18'),
(8, 'Beds & Furniture', 'beds-furniture', 'Comfy resting spots for pets', '🛏️', NULL, '2026-05-06 12:58:18');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(10) UNSIGNED NOT NULL,
  `buyer_id` int(10) UNSIGNED NOT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` enum('cod','stripe','paypal') NOT NULL DEFAULT 'cod',
  `payment_status` enum('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
  `shipping_name` varchar(100) NOT NULL,
  `shipping_phone` varchar(20) NOT NULL,
  `shipping_address` varchar(300) NOT NULL,
  `shipping_city` varchar(80) NOT NULL,
  `shipping_zip` varchar(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `seller_id` int(10) UNSIGNED NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `product_name` varchar(200) NOT NULL,
  `product_image` varchar(500) DEFAULT NULL,
  `item_status` enum('pending','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(10) UNSIGNED NOT NULL,
  `seller_id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `compare_price` decimal(10,2) DEFAULT NULL,
  `stock` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `sku` varchar(100) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `weight` decimal(8,2) DEFAULT NULL,
  `pet_type` enum('dog','cat','bird','fish','rabbit','reptile','other') DEFAULT 'other',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `rating` decimal(3,2) NOT NULL DEFAULT 0.00,
  `review_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `sales_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `seller_id`, `category_id`, `name`, `slug`, `description`, `price`, `compare_price`, `stock`, `sku`, `brand`, `weight`, `pet_type`, `is_active`, `is_featured`, `rating`, `review_count`, `sales_count`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 'Premium Dog Kibble', 'premium-dog-kibble', 'Healthy dog food for adult dogs', 299.00, 349.00, 50, 'DOG001', 'Royal Bark', 5.00, 'dog', 1, 1, 4.80, 40, 120, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(2, 2, 5, 'Rubber Bone Toy', 'rubber-bone-toy', 'Durable chew toy for dogs', 79.00, 99.00, 100, 'DOG002', 'ChewyFun', 0.30, 'dog', 1, 0, 4.50, 21, 85, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(3, 2, 6, 'Dog Shampoo', 'dog-shampoo', 'Organic shampoo for dogs', 120.00, 150.00, 70, 'DOG003', 'CleanPaws', 0.50, 'dog', 1, 0, 4.60, 18, 60, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(4, 2, 8, 'Luxury Dog Bed', 'luxury-dog-bed', 'Soft comfortable bed for dogs', 450.00, 520.00, 20, 'DOG004', 'PetSleep', 4.50, 'dog', 1, 1, 4.90, 35, 44, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(5, 2, 7, 'Dog Vitamins', 'dog-vitamins', 'Daily vitamins for healthy dogs', 180.00, 220.00, 45, 'DOG005', 'VetPlus', 0.20, 'dog', 1, 0, 4.70, 14, 51, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(6, 2, 5, 'Tennis Ball Pack', 'tennis-ball-pack', 'Pack of 6 tennis balls for pets', 65.00, 85.00, 120, 'DOG006', 'PlayPet', 0.40, 'dog', 1, 0, 4.40, 10, 73, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(7, 3, 2, 'Salmon Cat Food', 'salmon-cat-food', 'Premium salmon meal for cats', 260.00, 320.00, 55, 'CAT001', 'CatLife', 4.00, 'cat', 1, 1, 4.80, 30, 98, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(8, 3, 5, 'Cat Scratching Post', 'cat-scratching-post', 'Strong scratching post for cats', 340.00, 400.00, 25, 'CAT002', 'Scratchy', 6.00, 'cat', 1, 1, 4.70, 24, 52, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(9, 3, 8, 'Cat House', 'cat-house', 'Cozy indoor cat house', 520.00, 590.00, 18, 'CAT003', 'CatHome', 7.00, 'cat', 1, 0, 4.60, 16, 40, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(10, 3, 6, 'Cat Brush', 'cat-brush', 'Soft grooming brush for cats', 90.00, 120.00, 80, 'CAT004', 'FurSoft', 0.20, 'cat', 1, 0, 4.30, 12, 37, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(11, 3, 7, 'Hairball Control Treats', 'hairball-control-treats', 'Healthy cat snacks', 110.00, 140.00, 60, 'CAT005', 'HealthyCat', 0.25, 'cat', 1, 0, 4.50, 11, 48, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(12, 3, 5, 'Interactive Laser Toy', 'interactive-laser-toy', 'Laser toy for active cats', 130.00, 160.00, 40, 'CAT006', 'PlayCat', 0.35, 'cat', 1, 1, 4.70, 20, 70, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(13, 4, 6, 'Pet Grooming Kit', 'pet-grooming-kit', 'Complete grooming set', 390.00, 450.00, 30, 'GR001', 'GoldenCare', 2.00, 'other', 1, 1, 4.80, 26, 58, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(14, 4, 6, 'Nail Clipper', 'nail-clipper', 'Safe pet nail clipper', 75.00, 95.00, 90, 'GR002', 'PetTrim', 0.10, 'other', 1, 0, 4.40, 10, 35, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(15, 4, 6, 'Pet Perfume', 'pet-perfume', 'Fresh scent for pets', 140.00, 180.00, 50, 'GR003', 'FreshPet', 0.25, 'other', 1, 0, 4.50, 9, 27, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(16, 4, 6, 'Deshedding Brush', 'deshedding-brush', 'Brush for shedding fur', 160.00, 210.00, 45, 'GR004', 'SmoothFur', 0.40, 'dog', 1, 0, 4.60, 17, 42, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(17, 4, 6, 'Pet Towel', 'pet-towel', 'Absorbent towel for pets', 95.00, 120.00, 65, 'GR005', 'DryPaws', 0.30, 'other', 1, 0, 4.20, 8, 22, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(18, 4, 6, 'Ear Cleaning Solution', 'ear-cleaning-solution', 'Pet ear hygiene solution', 125.00, 155.00, 35, 'GR006', 'VetClean', 0.20, 'dog', 1, 0, 4.40, 7, 20, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(19, 5, 4, 'Fish Tank 50L', 'fish-tank-50l', 'Glass aquarium tank', 890.00, 990.00, 10, 'AQ001', 'AquaLife', 12.00, 'fish', 1, 1, 4.90, 15, 18, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(20, 5, 4, 'Fish Food Flakes', 'fish-food-flakes', 'Nutritious flakes for fish', 60.00, 80.00, 100, 'AQ002', 'OceanFeed', 0.10, 'fish', 1, 0, 4.50, 11, 50, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(21, 5, 4, 'Aquarium Filter', 'aquarium-filter', 'Water filter for tanks', 280.00, 330.00, 25, 'AQ003', 'PureWater', 1.50, 'fish', 1, 1, 4.70, 19, 31, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(22, 5, 4, 'LED Aquarium Light', 'led-aquarium-light', 'Bright LED lighting system', 350.00, 410.00, 15, 'AQ004', 'AquaGlow', 1.00, 'fish', 1, 0, 4.60, 13, 25, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(23, 5, 4, 'Decorative Coral', 'decorative-coral', 'Aquarium decoration coral', 110.00, 140.00, 40, 'AQ005', 'SeaDecor', 0.70, 'fish', 1, 0, 4.30, 7, 18, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(24, 5, 4, 'Water Conditioner', 'water-conditioner', 'Clean water treatment solution', 95.00, 120.00, 60, 'AQ006', 'ClearTank', 0.50, 'fish', 1, 0, 4.50, 9, 24, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(25, 6, 3, 'Bird Cage Deluxe', 'bird-cage-deluxe', 'Large premium bird cage', 760.00, 850.00, 12, 'BR001', 'SkyBird', 9.00, 'bird', 1, 1, 4.80, 16, 21, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(26, 6, 3, 'Bird Seeds Mix', 'bird-seeds-mix', 'Healthy seed mix for birds', 85.00, 110.00, 90, 'BR002', 'Birdy', 1.00, 'bird', 1, 0, 4.40, 10, 36, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(27, 6, 3, 'Bird Swing Toy', 'bird-swing-toy', 'Fun swing for birds', 70.00, 95.00, 70, 'BR003', 'HappyWing', 0.20, 'bird', 1, 0, 4.30, 8, 19, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(28, 6, 3, 'Bird Water Bottle', 'bird-water-bottle', 'Automatic water dispenser', 55.00, 75.00, 85, 'BR004', 'PureBird', 0.15, 'bird', 1, 0, 4.20, 6, 15, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(29, 6, 3, 'Bird Nest House', 'bird-nest-house', 'Comfortable nesting house', 130.00, 160.00, 40, 'BR005', 'Nesty', 0.50, 'bird', 1, 0, 4.50, 9, 20, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(30, 6, 3, 'Calcium Bird Treats', 'calcium-bird-treats', 'Healthy calcium snacks', 45.00, 60.00, 100, 'BR006', 'BirdHealth', 0.10, 'bird', 1, 0, 4.40, 7, 17, '2026-05-15 21:17:16', '2026-05-15 21:17:16'),
(61, 7, 2, 'Tuna & Chicken Cat Food', 'tuna-chicken-cat-food', 'Grain-free tuna and chicken blend for adult cats', 275.00, 320.00, 60, 'PC001', 'PurrNaturals', 3.50, 'cat', 1, 1, 4.90, 38, 105, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(62, 7, 5, 'Feather Wand Toy', 'feather-wand-toy', 'Interactive feather wand to stimulate cats', 65.00, 85.00, 95, 'PC002', 'PlayPurr', 0.15, 'cat', 1, 0, 4.60, 22, 78, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(63, 7, 8, 'Cat Tree Tower', 'cat-tree-tower', 'Multi-level climbing tower with scratching posts', 680.00, 780.00, 14, 'PC003', 'CatZone', 9.50, 'cat', 1, 1, 4.80, 31, 47, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(64, 7, 2, 'Senior Cat Formula', 'senior-cat-formula', 'Specially formulated nutrition for older cats', 290.00, 340.00, 40, 'PC004', 'PurrNaturals', 3.00, 'cat', 1, 0, 4.70, 19, 55, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(65, 7, 6, 'Cat Dematting Comb', 'cat-dematting-comb', 'Gentle comb to remove mats and tangles', 85.00, 110.00, 75, 'PC005', 'FurSoft', 0.18, 'cat', 1, 0, 4.40, 13, 32, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(66, 7, 8, 'Covered Cat Litter Box', 'covered-cat-litter-box', 'Enclosed litter box with carbon odor filter', 310.00, 370.00, 30, 'PC006', 'CatHome', 2.80, 'cat', 1, 0, 4.60, 24, 61, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(67, 8, 1, 'Lamb & Rice Adult Kibble', 'lamb-rice-adult-kibble', 'Digestive-friendly lamb and rice formula for adult dogs', 315.00, 365.00, 55, 'DS001', 'Royal Bark', 5.50, 'dog', 1, 1, 4.80, 42, 132, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(68, 8, 5, 'Rope Tug Toy', 'rope-tug-toy', 'Braided cotton rope toy for interactive dog play', 55.00, 75.00, 110, 'DS002', 'PlayPet', 0.25, 'dog', 1, 0, 4.50, 18, 88, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(69, 8, 8, 'Orthopedic Dog Bed', 'orthopedic-dog-bed', 'Memory foam orthopedic bed for joint support', 580.00, 660.00, 16, 'DS003', 'PetSleep', 5.00, 'dog', 1, 1, 4.90, 29, 39, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(70, 8, 5, 'Retractable Dog Leash', 'retractable-dog-leash', '5-meter retractable leash with anti-slip grip', 145.00, 185.00, 60, 'DS004', 'WalkEasy', 0.35, 'dog', 1, 0, 4.60, 21, 67, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(71, 8, 1, 'Puppy Starter Kibble', 'puppy-starter-kibble', 'High-protein kibble for puppies under 12 months', 280.00, 330.00, 45, 'DS005', 'Royal Bark', 3.00, 'dog', 1, 0, 4.70, 16, 58, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(72, 8, 6, 'Adjustable Dog Harness', 'adjustable-dog-harness', 'No-pull padded harness with reflective strips', 195.00, 240.00, 50, 'DS006', 'WalkEasy', 0.45, 'dog', 1, 0, 4.50, 20, 49, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(73, 9, 8, 'Plush Pet Sofa', 'plush-pet-sofa', 'Velvet plush sofa bed for small to medium pets', 490.00, 570.00, 18, 'PCF001', 'PetSleep', 4.20, 'other', 1, 1, 4.70, 27, 43, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(74, 9, 8, 'Waterproof Pet Mat', 'waterproof-pet-mat', 'Non-slip waterproof mat for crates and car seats', 175.00, 220.00, 55, 'PCF002', 'ComfortZone', 1.80, 'other', 1, 0, 4.40, 15, 36, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(75, 9, 8, 'Elevated Pet Cot', 'elevated-pet-cot', 'Breathable mesh elevated cot for outdoor use', 360.00, 420.00, 22, 'PCF003', 'AirRest', 3.50, 'dog', 1, 0, 4.60, 19, 30, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(76, 9, 8, 'Cat Window Hammock', 'cat-window-hammock', 'Suction-cup hammock for cats to lounge by the window', 210.00, 260.00, 35, 'PCF004', 'CatHome', 0.60, 'cat', 1, 1, 4.80, 32, 71, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(77, 9, 8, 'Small Animal Fleece Nest', 'small-animal-fleece-nest', 'Cozy fleece nest for rabbits and guinea pigs', 130.00, 165.00, 40, 'PCF005', 'FuzzyNest', 0.40, 'other', 1, 0, 4.30, 10, 24, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(78, 9, 8, 'Dog Travel Carrier Bag', 'dog-travel-carrier-bag', 'Airline-approved soft carrier for small dogs', 380.00, 440.00, 20, 'PCF006', 'TravelPet', 1.20, 'dog', 1, 0, 4.50, 17, 33, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(79, 10, 7, 'Omega-3 Fish Oil Supplement', 'omega3-fish-oil-supplement', 'Cold-pressed fish oil capsules for coat and joint health', 195.00, 240.00, 50, 'HP001', 'VetPlus', 0.30, 'dog', 1, 1, 4.80, 35, 89, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(80, 10, 7, 'Probiotic Powder for Cats', 'probiotic-powder-cats', 'Daily digestive probiotic blend for cats', 175.00, 215.00, 45, 'HP002', 'HealthyCat', 0.20, 'cat', 1, 0, 4.70, 22, 64, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(81, 10, 7, 'Joint Support Chews', 'joint-support-chews', 'Glucosamine and chondroitin soft chews for dogs', 220.00, 270.00, 40, 'HP003', 'VetPlus', 0.25, 'dog', 1, 1, 4.90, 41, 97, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(82, 10, 7, 'Multi-Vitamin Drops', 'multi-vitamin-drops', 'Liquid multivitamin formula for all pet types', 165.00, 200.00, 55, 'HP004', 'PetVital', 0.15, 'other', 1, 0, 4.60, 18, 52, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(83, 10, 7, 'Dental Water Additive', 'dental-water-additive', 'Plaque-fighting additive for pet drinking water', 110.00, 140.00, 70, 'HP005', 'CleanFang', 0.30, 'dog', 1, 0, 4.40, 14, 43, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(84, 10, 7, 'Calming Anxiety Treats', 'calming-anxiety-treats', 'Natural chamomile and L-theanine calming bites for dogs', 190.00, 235.00, 45, 'HP006', 'ZenPet', 0.20, 'dog', 1, 0, 4.60, 20, 58, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(85, 11, 3, 'Parrot Training Perch', 'parrot-training-perch', 'Adjustable T-perch stand for training parrots', 220.00, 270.00, 28, 'ZP001', 'SkyBird', 1.80, 'bird', 1, 1, 4.70, 23, 38, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(86, 11, 4, 'Turtle Tank Starter Kit', 'turtle-tank-starter-kit', 'Complete 30L setup with UVB lamp and filter', 750.00, 860.00, 8, 'ZP002', 'AquaLife', 10.00, 'other', 1, 1, 4.80, 18, 15, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(87, 11, 3, 'Canary Breeding Cage', 'canary-breeding-cage', 'Double-compartment breeding cage with divider', 480.00, 550.00, 15, 'ZP003', 'SkyBird', 6.50, 'bird', 1, 0, 4.50, 12, 19, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(88, 11, 4, 'Tropical Fish Food Pellets', 'tropical-fish-food-pellets', 'Color-enhancing pellets for tropical fish species', 75.00, 95.00, 90, 'ZP004', 'OceanFeed', 0.15, 'fish', 1, 0, 4.60, 16, 44, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(89, 11, 5, 'Small Pet Playpen', 'small-pet-playpen', 'Foldable 8-panel exercise pen for rabbits and cats', 395.00, 460.00, 20, 'ZP005', 'PlayZone', 3.20, 'other', 1, 0, 4.40, 14, 28, '2026-05-15 21:23:31', '2026-05-15 21:23:31'),
(90, 11, 7, 'Reptile Calcium Supplement', 'reptile-calcium-supplement', 'Vitamin D3 and calcium powder for reptiles and turtles', 140.00, 175.00, 35, 'ZP006', 'HerpetoVet', 0.12, 'other', 1, 0, 4.50, 11, 22, '2026-05-15 21:23:31', '2026-05-15 21:23:31');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `url` varchar(500) NOT NULL,
  `alt_text` varchar(200) DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `buyer_id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL CHECK (`rating` between 1 and 5),
  `title` varchar(150) DEFAULT NULL,
  `body` text DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `seller_profiles`
--

CREATE TABLE `seller_profiles` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `shop_name` varchar(150) NOT NULL,
  `shop_desc` text DEFAULT NULL,
  `shop_logo` varchar(500) DEFAULT NULL,
  `shop_banner` varchar(500) DEFAULT NULL,
  `address` varchar(300) DEFAULT NULL,
  `rating` decimal(3,2) NOT NULL DEFAULT 0.00,
  `total_sales` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `seller_profiles`
--

INSERT INTO `seller_profiles` (`id`, `user_id`, `shop_name`, `shop_desc`, `shop_logo`, `shop_banner`, `address`, `rating`, `total_sales`, `created_at`) VALUES
(1, 3, 'all', NULL, NULL, NULL, NULL, 0.00, 0, '2026-05-06 14:20:28'),
(12, 2, 'Happy Paws Store', 'Premium pet products and accessories', NULL, NULL, 'Tangier, Morocco', 4.80, 230, '2026-05-15 21:16:18'),
(13, 1, 'Pet Kingdom', 'Everything your pets need', NULL, NULL, 'Casablanca, Morocco', 4.60, 190, '2026-05-15 21:16:18'),
(14, 4, 'Golden Fur Shop', 'Luxury grooming and pet care', NULL, NULL, 'Rabat, Morocco', 4.70, 140, '2026-05-15 21:16:18'),
(15, 5, 'Aqua World', 'Aquatic life and fish supplies', NULL, NULL, 'Marrakech, Morocco', 4.50, 120, '2026-05-15 21:16:18'),
(16, 6, 'Bird Paradise', 'Bird cages and bird food specialists', NULL, NULL, 'Tangier, Morocco', 4.40, 95, '2026-05-15 21:16:18'),
(17, 7, 'Purrfect Cats', 'Cat lovers dream shop', NULL, NULL, 'Fes, Morocco', 4.90, 260, '2026-05-15 21:16:18'),
(18, 8, 'Doggo Supplies', 'Dog food, toys and accessories', NULL, NULL, 'Agadir, Morocco', 4.60, 180, '2026-05-15 21:16:18'),
(19, 9, 'Pet Comfort', 'Beds and furniture for pets', NULL, NULL, 'Tetouan, Morocco', 4.30, 110, '2026-05-15 21:16:18'),
(20, 10, 'Healthy Pets', 'Pet vitamins and health products', NULL, NULL, 'Oujda, Morocco', 4.70, 160, '2026-05-15 21:16:18'),
(21, 11, 'Zoo Planet', 'Complete pet marketplace', NULL, NULL, 'Kenitra, Morocco', 4.50, 200, '2026-05-15 21:16:18');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('buyer','seller','admin') NOT NULL DEFAULT 'buyer',
  `avatar` varchar(500) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `avatar`, `phone`, `is_approved`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin@petmarket.com', '$2a$12$a0N2Qxe0L8FMFjPuc8GbC.tZgl8h1EVYsK3pztgyz1dvzN/wD4SH2', 'admin', NULL, NULL, 1, 1, '2026-05-06 12:58:18', '2026-05-06 14:36:32'),
(2, 'sdfsdf', 'melloukmed456@gmail.com', '$2a$12$lQuAig1V49zmtbIRwj0qyOWTH3mV7P83z0v2f72OtRZsOOPBs02Vy', 'buyer', NULL, NULL, 1, 1, '2026-05-06 14:19:53', '2026-05-06 14:19:53'),
(3, 'moe', 'mellouk@gmail.com', '$2a$12$lQ/BBep7hA8MAOEaSxg0LOhz0vYk/9a/ULTrN4ILHplVgz9R/qPQO', 'seller', NULL, NULL, 1, 1, '2026-05-06 14:20:28', '2026-05-06 14:37:39'),
(4, 'Happy Paws Store', 'happypaws@petmarket.com', '123456', 'seller', NULL, '+212600000001', 1, 1, '2026-05-15 21:14:59', '2026-05-15 21:14:59'),
(5, 'Pet Kingdom', 'petkingdom@petmarket.com', '123456', 'seller', NULL, '+212600000002', 1, 1, '2026-05-15 21:14:59', '2026-05-15 21:14:59'),
(6, 'Golden Fur Shop', 'goldenfur@petmarket.com', '123456', 'seller', NULL, '+212600000003', 1, 1, '2026-05-15 21:14:59', '2026-05-15 21:14:59'),
(7, 'Aqua World', 'aquaworld@petmarket.com', '123456', 'seller', NULL, '+212600000004', 1, 1, '2026-05-15 21:14:59', '2026-05-15 21:14:59'),
(8, 'Bird Paradise', 'birdparadise@petmarket.com', '123456', 'seller', NULL, '+212600000005', 1, 1, '2026-05-15 21:14:59', '2026-05-15 21:14:59'),
(9, 'Purrfect Cats', 'purrfectcats@petmarket.com', '123456', 'seller', NULL, '+212600000006', 1, 1, '2026-05-15 21:14:59', '2026-05-15 21:14:59'),
(10, 'Doggo Supplies', 'doggosupplies@petmarket.com', '123456', 'seller', NULL, '+212600000007', 1, 1, '2026-05-15 21:14:59', '2026-05-15 21:14:59'),
(11, 'Pet Comfort', 'petcomfort@petmarket.com', '123456', 'seller', NULL, '+212600000008', 1, 1, '2026-05-15 21:14:59', '2026-05-15 21:14:59'),
(12, 'Healthy Pets', 'healthypets@petmarket.com', '123456', 'seller', NULL, '+212600000009', 1, 1, '2026-05-15 21:14:59', '2026-05-15 21:14:59'),
(13, 'Zoo Planet', 'zooplanet@petmarket.com', '123456', 'seller', NULL, '+212600000010', 1, 1, '2026-05-15 21:14:59', '2026-05-15 21:14:59');

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

CREATE TABLE `wishlist` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cart_item` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_buyer` (`buyer_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_seller` (`seller_id`),
  ADD KEY `idx_product` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `idx_seller` (`seller_id`),
  ADD KEY `idx_category` (`category_id`),
  ADD KEY `idx_pet_type` (`pet_type`),
  ADD KEY `idx_price` (`price`),
  ADD KEY `idx_rating` (`rating`);
ALTER TABLE `products` ADD FULLTEXT KEY `ft_name_desc` (`name`,`description`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product` (`product_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_review` (`product_id`,`buyer_id`,`order_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_buyer` (`buyer_id`);

--
-- Indexes for table `seller_profiles`
--
ALTER TABLE `seller_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_wishlist` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `seller_profiles`
--
ALTER TABLE `seller_profiles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `seller_profiles`
--
ALTER TABLE `seller_profiles`
  ADD CONSTRAINT `seller_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
