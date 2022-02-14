-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: 30-Nov-2019 às 22:12
-- Versão do servidor: 10.1.13-MariaDB
-- PHP Version: 5.6.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `valle`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `battle`
--

CREATE TABLE `battle` (
  `enabled` tinyint(1) NOT NULL,
  `id` bigint(10) UNSIGNED NOT NULL,
  `uid` bigint(10) NOT NULL,
  `battle_type` tinyint(1) NOT NULL,
  `field_category` tinyint(1) NOT NULL,
  `field_weather` tinyint(1) NOT NULL,
  `field_special` tinyint(1) NOT NULL,
  `need_to_trade_fainted_monster` tinyint(1) NOT NULL,
  `seen_presentation` tinyint(1) NOT NULL,
  `challenged` bigint(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura da tabela `battle_buffs_nerfs`
--

CREATE TABLE `battle_buffs_nerfs` (
  `id` bigint(10) NOT NULL,
  `battle_id` bigint(10) NOT NULL,
  `affected_monster` bigint(10) NOT NULL,
  `buff_or_nerf` tinyint(1) NOT NULL,
  `value` tinyint(1) NOT NULL,
  `stats_affected` tinyint(1) NOT NULL,
  `duration` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura da tabela `current_doing`
--

CREATE TABLE `current_doing` (
  `uid` int(10) NOT NULL,
  `battle_type` tinyint(1) NOT NULL,
  `if_is_pvp_battle_id` bigint(10) NOT NULL,
  `waiting_wild_battle` tinyint(1) NOT NULL,
  `doing_battle_action` tinyint(1) NOT NULL,
  `requesting_flag` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Extraindo dados da tabela `current_doing`
--

INSERT INTO `current_doing` (`uid`, `battle_type`, `if_is_pvp_battle_id`, `waiting_wild_battle`, `doing_battle_action`, `requesting_flag`) VALUES
(1, 0, 1, 0, 0, 0),
(2, 0, 1, 0, 0, 0),
(3, 0, 0, 0, 0, 0),
(4, 0, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Estrutura da tabela `flags`
--

CREATE TABLE `flags` (
  `id` int(10) UNSIGNED NOT NULL,
  `uid` int(10) NOT NULL,
  `type` varchar(2) NOT NULL,
  `flag_id` varchar(10) NOT NULL,
  `value` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Extraindo dados da tabela `flags`
--

INSERT INTO `flags` (`id`, `uid`, `type`, `flag_id`, `value`) VALUES
(1, 1, 'm', '1', 1),
(2, 1, 'm', '1-1', 1),
(3, 1, 'm', '2', 1),
(4, 2, 'm', '1', 1),
(5, 2, 'm', '1-1', 1),
(6, 2, 'm', '2', 1),
(7, 3, 'm', '1', 1),
(8, 3, 'm', '1-1', 1),
(9, 3, 'm', '2', 1),
(10, 4, 'm', '1', 1),
(11, 4, 'm', '1-1', 1),
(12, 4, 'm', '2', 1),
(13, 1, 'm', '3', 1),
(14, 2, 'm', '3', 1),
(16, 1, 'p', '1', 1),
(17, 2, 'p', '1', 1),
(18, 1, 'h', '1', 1),
(20, 1, 'i', '2', 1),
(21, 1, 'ka', '1', 1),
(22, 1, 'i', '1', 1),
(23, 2, 'i', '1', 1),
(24, 2, 'h', '1', 1),
(25, 2, 'ka', '1', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `freeze_items_monsters`
--

CREATE TABLE `freeze_items_monsters` (
  `id` bigint(10) UNSIGNED NOT NULL,
  `uid` bigint(10) NOT NULL,
  `sale_id` bigint(10) NOT NULL,
  `item_or_monster` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Extraindo dados da tabela `freeze_items_monsters`
--

INSERT INTO `freeze_items_monsters` (`id`, `uid`, `sale_id`, `item_or_monster`) VALUES
(1, 2, 200, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `items`
--

CREATE TABLE `items` (
  `id` bigint(10) UNSIGNED NOT NULL,
  `uid` int(10) NOT NULL,
  `item_id` int(10) NOT NULL,
  `amount` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Extraindo dados da tabela `items`
--

INSERT INTO `items` (`id`, `uid`, `item_id`, `amount`) VALUES
(2, 1, 1, 851),
(6, 1, 6, 886),
(7, 2, 1, 298);

-- --------------------------------------------------------

--
-- Estrutura da tabela `map_position`
--

CREATE TABLE `map_position` (
  `uid` int(10) NOT NULL,
  `pos_x` int(10) NOT NULL,
  `pos_y` int(10) NOT NULL,
  `pos_facing` tinyint(1) NOT NULL,
  `map` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Extraindo dados da tabela `map_position`
--

INSERT INTO `map_position` (`uid`, `pos_x`, `pos_y`, `pos_facing`, `map`) VALUES
(1, 13, 11, 1, 1),
(2, 12, 9, 3, 1),
(3, 22, 6, 1, 1),
(4, 9, 5, 1, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `marketplace`
--

CREATE TABLE `marketplace` (
  `enabled` tinyint(1) NOT NULL,
  `id` bigint(10) UNSIGNED NOT NULL,
  `uid` bigint(10) NOT NULL,
  `sale_id` bigint(10) NOT NULL,
  `if_is_monster_monsterpedia_id` smallint(10) NOT NULL,
  `negotiation_type` tinyint(1) NOT NULL,
  `item_or_monster` tinyint(1) NOT NULL,
  `requested_item_or_monster` tinyint(1) NOT NULL,
  `requested_id` bigint(10) NOT NULL,
  `requested_coin` tinyint(1) NOT NULL,
  `requested_amount` bigint(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Extraindo dados da tabela `marketplace`
--

INSERT INTO `marketplace` (`enabled`, `id`, `uid`, `sale_id`, `if_is_monster_monsterpedia_id`, `negotiation_type`, `item_or_monster`, `requested_item_or_monster`, `requested_id`, `requested_coin`, `requested_amount`) VALUES
(0, 4, 2, 200, 1, 1, 1, 0, 0, 2, 50),
(0, 5, 1, 200, 1, 1, 1, 0, 0, 1, 5200),
(0, 6, 2, 219, 1, 1, 1, 0, 0, 2, 500),
(0, 7, 2, 200, 1, 1, 1, 0, 0, 2, 9980),
(0, 8, 2, 224, 1, 1, 1, 0, 0, 1, 10),
(0, 9, 1, 200, 1, 1, 1, 0, 0, 2, 500),
(0, 10, 1, 222, 1, 1, 1, 0, 0, 2, 1570),
(0, 11, 1, 219, 1, 1, 1, 0, 0, 2, 500),
(0, 12, 1, 224, 1, 1, 1, 0, 0, 1, 8500),
(0, 13, 1, 219, 1, 1, 1, 0, 0, 1, 500),
(0, 14, 1, 224, 1, 1, 1, 0, 0, 1, 500),
(1, 15, 2, 200, 1, 1, 1, 0, 0, 2, 1500),
(0, 16, 1, 92, 10, 1, 1, 0, 0, 2, 1000),
(0, 17, 1, 92, 10, 1, 1, 0, 0, 1, 9900);

-- --------------------------------------------------------

--
-- Estrutura da tabela `monsters`
--

CREATE TABLE `monsters` (
  `id` bigint(10) UNSIGNED NOT NULL,
  `uid` bigint(10) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `wild` tinyint(1) NOT NULL DEFAULT '0',
  `shiny` tinyint(1) NOT NULL DEFAULT '0',
  `is_initial` tinyint(1) NOT NULL DEFAULT '0',
  `can_trade` tinyint(1) NOT NULL DEFAULT '1',
  `in_pocket` tinyint(1) NOT NULL DEFAULT '0',
  `monsterpedia_id` int(10) NOT NULL,
  `level` int(3) NOT NULL,
  `experience` int(10) NOT NULL,
  `gender` tinyint(1) NOT NULL,
  `hold_item` int(3) NOT NULL,
  `catch_item` int(3) NOT NULL,
  `move_0` int(3) NOT NULL,
  `move_1` int(3) NOT NULL,
  `move_2` int(3) NOT NULL,
  `move_3` int(3) NOT NULL,
  `current_HP` int(4) NOT NULL,
  `status_problem` int(3) NOT NULL,
  `stats_HP` int(4) NOT NULL,
  `current_MP` int(4) NOT NULL,
  `stats_MP` int(4) NOT NULL,
  `stats_attack` int(4) NOT NULL,
  `stats_defense` int(4) NOT NULL,
  `stats_speed` int(4) NOT NULL,
  `dp_HP` int(4) NOT NULL,
  `dp_attack` int(4) NOT NULL,
  `dp_defense` int(4) NOT NULL,
  `dp_speed` int(4) NOT NULL,
  `sp_HP` int(4) NOT NULL,
  `sp_attack` int(3) NOT NULL,
  `sp_defense` int(3) NOT NULL,
  `sp_speed` int(3) NOT NULL,
  `egg_is` tinyint(1) NOT NULL DEFAULT '0',
  `egg_date` varchar(13) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Extraindo dados da tabela `monsters`
--

INSERT INTO `monsters` (`id`, `uid`, `enabled`, `wild`, `shiny`, `is_initial`, `can_trade`, `in_pocket`, `monsterpedia_id`, `level`, `experience`, `gender`, `hold_item`, `catch_item`, `move_0`, `move_1`, `move_2`, `move_3`, `current_HP`, `status_problem`, `stats_HP`, `current_MP`, `stats_MP`, `stats_attack`, `stats_defense`, `stats_speed`, `dp_HP`, `dp_attack`, `dp_defense`, `dp_speed`, `sp_HP`, `sp_attack`, `sp_defense`, `sp_speed`, `egg_is`, `egg_date`) VALUES
(1, 1, 1, 0, 0, 1, 0, 1, 10, 24, 11030, 1, 0, 1, 1, 2, 0, 0, 66, 0, 74, 100, 100, 49, 57, 22, 0, 0, 0, 0, 6, 15, 25, 23, 0, '0'),
(200, 1, 1, 0, 0, 1, 0, 1, 10, 11, 890, 1, 0, 1, 1, 0, 0, 0, 39, 0, 39, 100, 100, 26, 29, 11, 0, 0, 0, 0, 5, 22, 30, 7, 0, '0'),
(341, 1, 1, 0, 0, 0, 1, 0, 10, 6, 181, 1, 0, 1, 1, 0, 0, 0, 26, 0, 26, 100, 100, 16, 18, 9, 0, 0, 0, 0, 14, 6, 28, 15, 0, '0'),
(342, 1, 1, 0, 0, 0, 1, 0, 10, 5, 135, 1, 0, 1, 1, 0, 0, 0, 23, 0, 23, 100, 100, 14, 15, 7, 0, 0, 0, 0, 4, 18, 2, 1, 0, '0'),
(343, 1, 1, 0, 0, 0, 1, 0, 10, 7, 271, 1, 0, 1, 1, 0, 0, 0, 30, 0, 30, 100, 100, 17, 20, 10, 0, 0, 0, 0, 22, 6, 18, 17, 0, '0'),
(346, 1, 1, 0, 0, 0, 1, 0, 10, 9, 427, 1, 0, 1, 1, 0, 0, 0, 36, 0, 36, 100, 100, 23, 24, 10, 0, 0, 0, 0, 30, 28, 24, 2, 0, '0'),
(377, 1, 1, 0, 0, 0, 1, 0, 10, 6, 179, 1, 0, 1, 1, 0, 0, 0, 10, 0, 26, 100, 100, 16, 18, 8, 0, 0, 0, 0, 2, 19, 31, 8, 0, '0'),
(603, 1, 1, 0, 0, 0, 1, 0, 10, 15, 2035, 1, 0, 1, 1, 0, 0, 0, 24, 0, 53, 100, 100, 31, 37, 13, 0, 0, 0, 0, 26, 5, 20, 2, 0, '0'),
(609, 1, 1, 0, 0, 0, 1, 0, 10, 16, 2535, 1, 0, 1, 1, 0, 0, 0, 5, 0, 53, 100, 100, 35, 36, 15, 0, 0, 0, 0, 9, 20, 5, 17, 0, '0'),
(614, 1, 1, 0, 0, 0, 1, 0, 10, 16, 2535, 1, 0, 1, 1, 0, 0, 0, 4, 0, 55, 100, 100, 36, 40, 15, 0, 0, 0, 0, 24, 23, 27, 12, 0, '0'),
(647, 1, 1, 0, 0, 0, 1, 0, 10, 13, 1261, 1, 0, 1, 1, 0, 0, 0, 8, 0, 46, 100, 100, 30, 31, 12, 0, 0, 0, 0, 16, 24, 9, 2, 0, '0'),
(648, 1, 1, 0, 0, 0, 1, 0, 10, 15, 2035, 1, 0, 1, 1, 0, 0, 0, 4, 0, 51, 100, 100, 33, 36, 15, 0, 0, 0, 0, 11, 16, 19, 21, 0, '0'),
(651, 1, 1, 0, 0, 0, 1, 0, 10, 13, 1261, 1, 0, 1, 1, 0, 0, 0, 11, 0, 46, 100, 100, 29, 32, 15, 0, 0, 0, 0, 14, 11, 20, 28, 0, '0'),
(655, 2, 1, 0, 0, 1, 0, 1, 10, 5, 135, 1, 0, 1, 1, 0, 0, 0, 24, 0, 24, 100, 100, 14, 16, 8, 0, 0, 0, 0, 15, 11, 25, 9, 0, '0'),
(656, 1, 0, 1, 0, 0, 1, 0, 10, 14, 1612, 1, 0, 1, 1, 0, 0, 0, 48, 0, 48, 100, 100, 30, 32, 15, 0, 0, 0, 0, 10, 8, 4, 22, 0, '0'),
(657, 1, 0, 1, 0, 0, 1, 0, 10, 12, 973, 1, 0, 1, 1, 0, 0, 0, -14, 0, 43, 100, 100, 28, 32, 13, 0, 0, 0, 0, 11, 24, 31, 15, 0, '0');

-- --------------------------------------------------------

--
-- Estrutura da tabela `monsters_in_pocket`
--

CREATE TABLE `monsters_in_pocket` (
  `uid` int(10) NOT NULL,
  `monster0` int(10) NOT NULL,
  `monster1` int(10) NOT NULL,
  `monster2` int(10) NOT NULL,
  `monster3` int(10) NOT NULL,
  `monster4` int(10) NOT NULL,
  `monster5` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Extraindo dados da tabela `monsters_in_pocket`
--

INSERT INTO `monsters_in_pocket` (`uid`, `monster0`, `monster1`, `monster2`, `monster3`, `monster4`, `monster5`) VALUES
(1, 1, 200, 346, 343, 341, 342),
(2, 655, 0, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Estrutura da tabela `pvp_invites`
--

CREATE TABLE `pvp_invites` (
  `id` bigint(10) UNSIGNED NOT NULL,
  `inviter` bigint(10) NOT NULL,
  `receiver` bigint(10) NOT NULL,
  `accepted` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Extraindo dados da tabela `pvp_invites`
--

INSERT INTO `pvp_invites` (`id`, `inviter`, `receiver`, `accepted`) VALUES
(2, 1, 2, 1),
(3, 1, 2, 1),
(4, 1, 2, 1),
(5, 1, 2, 1),
(6, 1, 2, 1),
(7, 1, 2, 1),
(8, 1, 2, 1),
(9, 1, 2, 1),
(10, 1, 2, 1),
(11, 1, 2, 1),
(12, 1, 2, 1),
(13, 1, 2, 1),
(14, 1, 2, 1),
(15, 1, 2, 1),
(16, 1, 2, 1),
(17, 1, 2, 1),
(18, 1, 2, 1),
(19, 1, 2, 1),
(20, 1, 2, 1),
(21, 1, 2, 1),
(22, 1, 2, 1),
(23, 1, 2, 1),
(24, 1, 2, 1),
(25, 1, 2, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `security_tokens`
--

CREATE TABLE `security_tokens` (
  `id` int(10) UNSIGNED NOT NULL,
  `uid` int(10) NOT NULL,
  `active` tinyint(1) NOT NULL,
  `token` varchar(150) NOT NULL,
  `lastActivity` varchar(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Extraindo dados da tabela `security_tokens`
--

INSERT INTO `security_tokens` (`id`, `uid`, `active`, `token`, `lastActivity`) VALUES
(1, 2, 1, 'S7AZffy0McxhlwZQjSYNFtJiM9PN60BxPRYhwx2UttjJtl3mtcjzdKwqUseyv2CYlvn3vdpTiwoYVeXT9XEQSMJFrYx4Wi9pJMbevKCjyOBBSGKRAnaKdgaTGjrM3tMVEwwtteqCtVsB4tEcQSH96r', '1529108767800'),
(2, 1, 1, 'snfQd1h05KxOjdAhuOVy8VFmmpIhWBpUrEATQLwWWk8p2Uzlnq8MLl2ZxIQDCzc9nVaPRt20RK0YSqwZtk9BnOKTwpDZ5wqdVsfd45djfZSV9i9OnqwCesIqaFhc3y6HuR8RAEVb511bp7zgiDAwfZ', '1529155942992'),
(3, 1, 1, 'mIdgTEBdAqSJSRRx2mYce1Jj2MJsNwiorlxcs0hYKia26wkS7t06XucPt9Sm4qvqGlFHoCfjzdLQBryFunvYXk6BiGKrDB2R77zdAP6dHDV0mATJA3LkjnLL72GQ3UeYMVvEU8sFDG366RZdRC0ts0', '1529159748887'),
(4, 2, 1, 'ynisswps6gCEmnGtTyrxd8KK0ZKyBZrnVpMqqil66bBSddd0oPiO80qPLdiVVV9Xny6u29KvNWO7rcMfFlofk8xOSJCQFdJnhzBwgATQ4G5z7pfc5PIGvuS7FwJsM7SbrKWAyaFHGEiJ4sida30TzB', '1529159839699'),
(5, 3, 1, 'eYGrxqByiJ61Y7trwdaSrlUoF4aFDA945FmWFPTWH0ARDk8b8AmAFm9jpiUt7FmQdsY52vLnTnrkC5zsTbJXJG0JMNBJLI0PmT8c4htyzQCwtvJBMtBPWErVnGkpFQ1QYOAqrGmhITZd3IVpKV6Pqv', '1529163211295'),
(6, 2, 1, '7yRiSpGfm78Wl2u8dMh1IvBCAGwr7OVlQDuubWTcJ1q35v3mjJ4x91FnbpgPxoTnLuaSgbA1VuxpnP0nIMsmnHWVzMfXecy5IZAH1y3l1M8Pf5aA246PzueeIvySh5uMEhWZjjgj7upNnLs3dx6sJX', '1529164379818'),
(7, 2, 1, 'eEqPMO0eYujE1NVA9gM3Xrv278WIDemCpI3TL2RGpKECsSPP7LZRCMoW1LOIIBro1FFAu9lKhdVDNd0iLRk7D52QJ7kHgGaYDUEPoEboifbLNQMRiXYqhlKmd6SA6z8lTDDI8zNMRgGOtwIpjFUkNP', '1529169968626'),
(8, 2, 1, '8GZVY2DIKY5JuyxVwnb9BbR67cCbxIG33Q6tEQAMNG9NoU0DsSLVuwMSPm1VIQgn2P0ffJzZVQRFf5TRhweLw8ViOCsVDvokqHjliw5gqaHFTU1J4JY6Z6kFlTM0FTswfflz1GmvIc33ZKE4DFsQQ6', '1529183018644'),
(9, 2, 1, 'jYRkKsSTJCg4snPFoCiWZAn9Rco2JCQPOmS18hfP71v2OgWQ9hoARu6JbAQHoB4NQvA1wAn5rsrUAcv5f3sC3zHdbZagFB08FXe6ChxUT4bR2U3Om4cVMGmlFQ73npRFb3fu3gc2t35khvcaXl7V1y', '1529183720995'),
(10, 2, 1, 'HptMzl4Ags48J30KZwRkE3L8tVOJ8LTvt2Tuq9SXsq1c445rBvyZTw8wdEWWsEEeojwzjFcLT9myh5ruXunliK3rNVYevFlwqPmY95SAvDbz8Rob4AWTYAEgzyAKzrRNcEv5897ngoHBg2fUnKSPk3', '1529190141680'),
(11, 2, 1, 'Zc2Eyjj2CNhsOjbO9svoSSyK1aLEfVDv8HdJp04a1Mb768i5NQX30BPu1TJjtp3JcCBEBcycRujhasQsRtMRxKatH80wYuYWjXvEYjKWKAmuz5YpqB7UfzZVqUXpAPID1zv6i3prTChaCv8gREAUeI', '1529192661429'),
(12, 2, 1, 'QJMlrfca1xz6Cq3MaVNn20Zy9HPMhR611EvKku1YMJscwp6Z6N6GeRq7nU441rnX6z59wcQbIlRIGw57T6JrVzS6IanfACeU0v7au0icd7fepx3P5w2MhjTJZDTPnqdNa6qsRcpFj6MoYcjXk2btc7', '1529249746215'),
(13, 1, 1, 'BRUCYoCZvTtMNjPnqszqnYa6geJCqmONhWDFAHVu9zwQ0Erhfur4uCNdMGQY7S5BHwp1te3kNo2ccPVcWRGaCeDmnqAUMW3Nk11nnDSWiCwuz8da1L1LYvuzsGTK219uxSYWiOUmjmuPPVKfIIvxnl', '1529249809009'),
(14, 2, 1, '6DeZVPXqSpYwP77aw6OoJNFldwi3D77wyDOw8c7XNAzaI6YkxgXCxB3PmgPIG5psN5KpZ9IFkSUrWeWouN95fJPgMfAAkx9RBpPCPQWtlU1CssD0I7ljZ1484CHHkGxrr7EfX7tbrOLVuMh9v9Vdxp', '1529254354768'),
(15, 2, 1, 'DeSyfuCiKsKIrXqhznQaCVAqPiHo9T9sNonniOgfH2dAmu7eb3pFuX74NACVPCYq1DrEgf93zZEIiizrfWTFdlKoMjXZfu2E1TPfWwABOzdzcY04gJ8WxaoiRYAMiUuQHzPebL9uOWpe7RCcfYUovI', '1529265950310'),
(16, 2, 1, 'P5ATQiyDH7UBwWrT2HxlZs6wRkAsNC316fxlT1RAXyd5UOuBQVLwBxtmAGvLu5hsN1W9q4rHNFLdv5RF02gtQYfh3r0MEurpDso6WAwRkVUbNRkqTSMMzTcPmcKlY3wwr15y6nWqCbO4802RI9B0HU', '1529285468481'),
(17, 1, 1, 'IES3gR4VP3hsTmpYjxnfGemdYrkXyCKkyTVxVyA69EDrCDdJhM0Gs5jLjniFIAB2NvIDyh2wONOy6y8gBP30YPIrgyD6642MEI9a1pfSydcNdBBBzASgNqzaQOs8RGp2hTvP4EdnfNaEFDah6oVTkF', '1529449264049'),
(18, 1, 1, 'CXumSPZgKae2zuQqSY1kr28kxMT4YsbQ7O1XTs8hyPtr9Wxt2EtU1lx06tjXoiApwAVc0OA7QPKS6yYrkKNJfW9x7XCi7sJ86iF4ReJehm525Hi2GQWr1TVPQSUgXVzv5mxdVjGpv7EvkB8DgZNz6a', '1529512197953'),
(19, 1, 1, 'F9raAixvqdMtKyTtq6vhc1Bhf0GYRTSghOaqkY8lFVoe9pCAxgeG72gXLYHiyNVm6qYemaxbFon9uy7E4FklDBEF077tyr4fdQQMHPkf9YsCpXFJnyu3jZNn2yHU3a9aBDdp2wuBo5y12JDUmldb7Z', '1529614158641'),
(20, 2, 1, 'ICNkRJtT3u87YVemGvX6JH2E7Wq1Cp5opNuO0cKKmNnsdWtb8lWjaGXPutstsiTqdsLTo5SNGfTfenorD89qQ8B8OdihheieOAukP13V4wWJ4kCopPGxMCCvspyfCNE3c65TGPdVCXIgJE0OlxVOTI', '1529633512779'),
(21, 2, 1, '8v7EHSlp5rk7v2qMA0ZnDTnP7YJpdRGmhfB7Ws4PBhX9yCN21Mx1TbeShJHV75lNuMmtl45tyG6xLeylWOAXi8HSpK9jERqxAcKM7HkMJwpz3tvcmVwjxSRJd9rNhyXxrWtF9UjLmSG15IPRCyskp0', '1529633582887'),
(22, 1, 1, 'oojaeIIwKoJqRY2ogpxti4cIdkYfBi7PJm00PMLvpYsBGFVjr8Ar4cA4riUL0y0qFQlpLvENeXnHZgIWN4eItEj4rWS2By6Qnrg1artgIH2TSwVhXTmVOSnT6DQU6JHVDTmGP6K80FAmB0x6NrNI93', '1529683074172'),
(23, 1, 1, 'ExBK7Bt5VHFZbobaJbf0RICaQNFOuYJ0vEqTUKNHAjgU6q1w8oiOz37yw0XbKAa1FO5iFEuxRgQ81G2VavIwDbdfZm7VmiWfehpGOQz2IGujipLtIsRVly3y2vJ4ALoJWHQ1G45QNPoyJuV6TouIcJ', '1529719818520'),
(24, 1, 1, 'u0ojSLaQWljl8kOHltkgv5tbQjacDCn4WnbCvWgvGHqo0FCt9FJn15EB6JhZ8F5szARaN3byFUS41kI3ok6r3wd0Ly0r4L9SuT6e3mjN2qev6Yo1ge1p9qrfOGgigWP97rlsm1ptEosbUU74491vFY', '1529772546420'),
(25, 2, 1, 'yRYEsXETMIDvGpROBbGzDkDxrCT9ldYIuM6jaZGfVc1qTGcDLB7E2EdrAxgrK5EBtd5VMGICWrn0c8UqXUXDZOwgLYCu4dO0587UWTxvSJgNl0YJCkqYTXhj4FiQepBZlqZ8odH8M2syxkhkeK7MFT', '1529775674298'),
(26, 1, 1, 'XEY2TNRFvhJJt1nrZs5Wy2CDJw2biQ0CDzmSQx8EWNQJqnB7wFR7DvVuUVz2vlWAHbJy1SRMoa2CsBunnEiQ9kDrkAVfgX9z0cNIRtuWYnitEFcco5EDCTkEkM6L4dMh4Fta4Aheuq7uOlGu1AeqjV', '1530230432380'),
(27, 2, 1, 'zOSo5BiCUyw4yV2v7RyZZ7bGwi9uPbnv71BH6U2cWkd7Hrj5L2KJxCs8JPY8GfQf6Dv0iNrlc4DrxLJ4kdHW1k19fTEG7rTSclRjYhXgg8946cCF6cCTckdv8UaziSDW4q3Mt6C6wReYhkUemq3lq1', '1530230642613'),
(28, 1, 1, 'faoAQOEZfrgez2dqjO2kFJDNFe76q9pIB2V7N7ZZvnehfMy9rY09q855nGSzU6EYVlTOz7KhELn2aDxvG1RzjKPZXu02xwFs3UCBdkyuDG50yu8FrSFdvZCNS29L1Cj2QhYWfRrSdbNLPQDIMcXWgy', '1531266426852'),
(29, 1, 1, 'LuChPZLZUGiftsaIIO6PtTseFtWRE8r4ymYeW6HYDhY3q3GTlyYoCfOY88iaG1hLNuKKf5WebdnrKC0b0Gp3dhkvXRe2Re9S1FGWfrVAjQLmuIaG2DkGemC7Yj1ja8aKl3nX2gMvZT8wOVU8IafYa3', '1531443561942'),
(30, 1, 1, 'e31I2xHw6utrSJKk6EwZoEBGayGVecmrl77hq9pQuvVEF2JjbbtIxdFL4GWVddCJb08vfqSqLEPgppgLGoU6SwXNBWrRUBsnbic6KcZvho6E2AJUi2Toc1twzZ9kFpcbkYBhXstWbFMhmkxs28folu', '1531512453064'),
(31, 1, 1, 'fEfHZSGrEyIa9eHTaGBZP1owdfyjF2EvBTgtUhpkio3KDn5TjCm8vyAKG9ARUQZJlb40NizAM4cLK6cM0539mQ8DNYiBWGVuFQqePlnYy3GmsdEr0nA0KKO5NfmrUUTfxToSQrto1Z99poBIVdzjQk', '1531512453799'),
(32, 1, 1, 'cktCODQioBZI9rLVXRmwDrTCiS69cvtb6dLwcY1pNhz8Y54tfzG4zratFvElZ94utoBHbid86jThldLQmpqs72ARi2dwtm52f0tOYOgkD0fGzdV8EbegVRUAK2DmDMakdoqYz28jQRGK3Jle5SMVoi', '1531591821629'),
(33, 1, 1, 'I2pC0C9Vn4kK8gcYupTc3ylPlBPAgx4G8fpvEf1l9EYUeo3aeJoykgwCgDd44NLuzjo3tRGz9PIeEYtIZcrTbyshpiEZEU0pSuLR3sAnKuQkneueG8GvyAZGeYSKyQk7gy8Iai3172FfgXEL6tSxfb', '1531682173478'),
(34, 1, 1, '84yCyuqSSnmC1uPGUoWzx3j3uNDNabbq7H24AvkTMzrFDxcSWoAatnJ8Oa5XmIfvLAqsWzmpfuUFtPl8DHwL7ncCjrIyIIVEMl7IQToJUxQ9lmJfDsuqzZqEh0Qty2hTDnM4bM1WndxkCqGny5ntVd', '1531702238024'),
(35, 1, 1, 'i2FchNttW4ZwwBozmXLkIuAi3hJVFoPNR2U2GTA1VnAoyydKfFTg5yxwQaUkFHqfmniLtbb2w3zl5fgLZCb03hhkeKb9rCvTBw2bHH247aohL9CNwG55hf6GO4qGUmVbZT8FjJ04gjkomG53LBaU2L', '1531785159170'),
(36, 1, 1, 'YKu3isZ2bAB9dkVSSMpXdWLFR9tKGZM8iP846ObPHI4XYr4yJdYsbmAXexRWYBcjNQu7ojbLT6JP5BPzYToRzdwLqKuRABXtX3oJidwYOXobtuTGXmRpzAR55s5yqmX50aVQgtZjLV73P3Nn5HZniu', '1531880809443'),
(37, 1, 1, '0jhnWiacArbLqxysqi8mvs5w4Lc485tGaqWgHfUjojAHr6OdJ8glVw2zo6fiNKdo3PWKHNWei5slyX3N1w1luaIdhbFy0DVzz3nLXq6eNPcEjmjwZz0aS83BL7h73OZnTsHI0wy50rd21Qx05fFP3F', '1531952537634'),
(38, 1, 1, '9oWUXv4oOKM41KhdQJ0ZHdx01weZrLhrXT2stFcPJZ4paMaKZI6mNgkrF194UOHe5bMGgDvIiGFqhfBmx8iOYUcXaPtxLad4d7WmShGOWTUQRTv30Slyif29c50TIeHVfWlPLubx5DieCHy6GaW3Gy', '1532113765560'),
(39, 2, 1, 'yyuc9XluvZCu8raA22UR0t2TgYCFhaCdxbnUifjvTyYflP2dPh4BtI0d3sEudpjEmyJXitqylbx76GU3vj45qegUUZjmsMWZNeNF5zjQsOtFKXsibN69jMwoDcvYHVXd5OJNs7OcJUWtePgtvXwvN4', '1532486516553'),
(40, 2, 1, '4MmjL8lf8sEWDr1XOb2uaUaVY2Ccc3X0orlJriSCNGEepZuQmu7ImueiLZElqvVmRoYxmPKh9z1IlU4sFJuEtA4R6P69Kz7HCT1DgvIuQ7nk0wrcvThUVJMmPlp25pufCvKVqtkkgZ7bPjfS6vZQEE', '1532486516643'),
(41, 4, 1, 'vhM1yl0vPthKRLtx2Kzm0UXSH89soGawrGpfEgLPXe8xSpcD23EYJoaKadDwDGFZ21oMFMMtX17xR5w3cti9bMQhu5XZ1G90YM6opiEwQ6G0oElUB7SyB6kABzrxSC9PaXzgia0KQS3IlmusDrbvBq', '1542389957466'),
(42, 1, 1, 'FmMLFKW52aJCtWAwLtCDY4KQc6M5i8EfOtfKha9GO0PrtTgu6nBO2z4lEwBxRGIGd7FyVWBTMyzSQlw7KqJwsVv6UtOups60ddSreujFpP70BfoqOt1W8EqY3Rg34qcWlg89wPVI1SqVzxIzyWZZPC', '1542390108989'),
(43, 1, 1, 'KFTEqbs2OksIsQsCV1an7mJmQYEPI7rlPp1KGTZF9ylyCt9CNqwaOZSm3JagzTK4siVfQD8sTEedVeOXqMLieNzVQya92O8qZq8Mc1OxrhMfHcfiOA3fBxi2ZZqMoXgdWSXi6Zc4bemoL6dYOPzrDX', '1542663639674'),
(44, 4, 1, 'D2J7tyHZZSPIPLvKUxE86wYRp0PdKUUvKpmgi4cMTwjNcgO1HYpRzCw13Y956F2e2HJZ1V1bMfenDv7SYyGNg2xyTD5O9fVukKyRmlsIZhhLq416pV8VmZkr2TgXz7sxTiGDvHH5dFVyBwyMo6bAZb', '1542663663506'),
(45, 3, 1, 'Qy7m7dfUfAVwLb6UGo2azsxJS8UhIgmcb0EEdqnmeFnFVrjprJO82ynLCIWN1E0nsebbUSewWCLupEAHMDcYV0E7nj0ic5U43JS7wrztp5vT8XdawvJ4OseUMhl5I83bpaBY8SyNzTxvSY09U8OFx2', '1542663713525'),
(46, 3, 1, '49AqB35aPRjYhmkCwOMC8ufCk2rWuvaJjKwtB8UfT5uhOGBHMYKOEdxx2NN2h2Fd8toXUCFB19f73CRI4Q4xtgcqwKJQgzgtoWA71keIADRniAvLuGkEuTlVlgK3JllNxQSVe20FT75m1JUzwzkwOY', '1542663884774'),
(47, 1, 1, 'PA9fU4uFN6f8DIyvTMAXPt2CigNffZaGtVxNnBmOPlcMKDJHhEdfDczp3MoL9atZKquh8F4iEcRt3iDElKGiK1BJnLkyvugfpT0iwTJUhFZfoBSkAneZUiDSohAVH0k6aKIHZP7V7fE4XuK2Y7Vvw6', '1543783615068'),
(48, 1, 1, '3Ou1aSeJoY60jb3sLF3eSZXL5lkMQJRph7ZYjkzDqPIh0nlk1ZFycN3nUXBdP2V4VJgmIDFP1bvQp6hetHBoPxJ3SmzQOB6PYykylug2pNrAHvDmrFgaMG5WZxwb868eqUoOCMYe7c2Lj38pBKx3QF', '1543783651969'),
(49, 4, 1, 'll8DJM0hlGIU19BQ5bK99Kk5J3nbTLEuaflsm0GEQR5RDZ3QNsIeG1Rmu4RucfEoCIGhKcyPozapNhJF5BVtEqx83mYP9NvlYJYKTmHHv3e4oqZZq2cWxgfJDUkrsYmFJMusbEsJwflnDlttmkKId4', '1544101041003'),
(50, 1, 1, '67YMURRiwPE80KxFYy2GTDY6c08dNvyffxhdT4P3LRsSAENE0Vkiz8ptphLZbyHpVWZy5qMcqVU2YKnyL5Qri4vNlVVOB0Wiz5aZGlXLwKgrl8MMyCths0Z7XWbGph1nHrIbBlPvBu1nr20nI4VhFU', '1544101066912'),
(51, 1, 1, 'n4sQhIJ4KvG1yJH2Jdue7m34K0cb3jyj3LtwU7BOjFJpSzpjiJhuf8iWpRXwxmTvspbfk1Saz5qA4F1CImvWCjweKJScDfislbCCbOXI2tOSK7fYcTWLaxIqELk3LZP7TL2PNKHJdoyedG7cq7MmUa', '1546190337999'),
(52, 3, 1, 'h63Ajd0epdG4cNNI8SZzHCEkL7WaaejInMvKgz0DhRk3P7naRYR3u7v7Wmt7irW9A4ZD0oX1h1XRdJxu0dJk5NpDMNp35ePeevlh68tdOhhr9ynan8aS34qrYdMbSQyL5furNPAhor6tXWH7oHjECK', '1546204236133'),
(53, 1, 1, 'gncLJM9hBzVfzTy6LyIKhheDBFjMAdxtFPrp1muRUmZfVgJDb98200KTrjnX66wgzra8ZRXnggcWEMyAInn74XocYr1H72errKAbLcdoiw1rTXNidUaVMZG6msoLys1AOIdVvnbqYCh4UdBoZhzBOv', '1550440117962'),
(54, 3, 1, '85BdCybykiGmftLeKLPijgUVwaV39GrLXX4ZntsILYLj6tric9whXZu7YLevXhaC4svSgl8vcFC4taHdtFrVRfS6ClofAIJVRRC6T0pVxbr1tcbdVDC9DYuB1nYbkX4tK1zUA5Eh2PmvYWY9uAZeSz', '1550440532005'),
(55, 1, 1, 'pDU1Aci2VbWa4tsEt4WFRfm9FRPlb8q8jN1n5y7SGNZbRoaeslKWZDOjuGhro6uEylkwYZihmUU09ninDEXzp3VD9GSRiNgQbAEZaWscNmhjOtIUcLcK33xC7ijmIeGcFWKLe6X0aHUba3iB7JJToy', '1551922136656'),
(56, 1, 1, 'n0xq7SDh6PpvIgQdIP8PmODLFtSYou2xLVgIgyNsXEhHHFbBdAb5Rx2BhOjbB9GBhYNOSzthfceJ1xgx2m6EEQyAOs8EBrmLb3xpF2EBxoGvn7p2QAK1lsRDj8XFvqJWoMp3OOh4yZxHDNJljrRhg6', '1552180738611'),
(57, 1, 1, 'TOtkzZF7ZIENJoUD419jGSpXcm4yAtKwNSilXb8bDTEbNQnKmfDuNxpvnxNWIdPnucafYwE5avb3PaKXiRmkWZe5ugiU9qSkXbpn2bJPBj6q28CUIzPCjx3ENCt99WzFA1Ogj5lwjZvukjFQcpLDRv', '1552243867716'),
(58, 1, 1, 'jVE3KA5Nl86kg1NUvLXDvxaQJOGgDJnkUsRiSdIAlVtHpscfU2GPhLXxRNGPammQ6d2110zzqU2PCqcynke51wJUQ1YiddlR4GAqjk0lfEVfZJIMgCYg4613D7D21DDmr8wHzeZtfsH6MUxg8UpwIS', '1552517055378'),
(59, 1, 1, 'A7lLDGEXNe4hgJxmZITCpMDvwnUpeDubLtHE2yvmyypHmpxzKtpc5eMk0HGByzjrYG2gVNypOVgqusT1CJBekpLjeovq7DMd4k2gW0P3c9jVkTeI0cBytxOuppPwUjNKDdGSSZQ5EfrjEFlXzSXybC', '1552517123305'),
(60, 1, 1, '5f0U3zLKBHOcp9o60md0rZGPVSLG4crPRyOnef4uAtO2qqXWAOY2f411Y3kz2U2D3P1janm11ryAsoS02agCBaxBfhUQvMkHXHhv3OcV0cXArxtCGfHZLhbBPhZOwS40Nf2VJPVFbTHWNHbbTe3OAY', '1552520065169'),
(61, 1, 1, 'kGWZhr4ClyHjLUMKPnuYWSoKYBV17ciJ7DcD4D4jZ3b4zJL3662uKtdC9KNr5KKr9s2sqjz4FTURCz4pKKyr9DoOWM0mKRRq2TqTDnwGoA4ebeCVtXINtUtSAaE1N61iCRku5YC7r8j6Z1qalhmplO', '1552524792412'),
(62, 2, 1, 'rKyQSf3CKZtKbXdmZMh4nKouKlq0J9Z6JM1nHoqxKTkSbVoFPz8p6P4jX9ptv1Ftx6RFcCvOkueG1qId5pPGzUFck5riUCAsUrjz3B5KzQ82V8tZtPXPnGBtZYyMZkd2KAjLOl9HezI0aiHSL2ONW1', '1552525126108'),
(63, 2, 1, 'IPMYo9Qi7wG4hTxgxoZob7lWIgPAitzE7Dmj1Er2ksjI77ZRp00BDCzZhwpuEG4FkgtkYg6uCXvsFp37jeCJ5eHmzsE9kzO7hQRnUNZFY1lBnRfdPqecjAHbZPrfPUCWnJKCG1pfDKHgjOIhP0bO5a', '1552618720077'),
(64, 1, 1, 'nhG7DaWU2kYy6bTBjUZgXwbOeyOdh2q35etUR1timfGlMRlbXfcbtpRtlDZSDh8nQQxdc3JmLT09gMNHmVHP5iyUsHcal7HLRtbmEfIKgksmJs2Ldua4TGjN5rRTcu76SVKReXesKEBrfQZkKUuc7F', '1552619164174'),
(65, 1, 1, 'GVZoKVPIw7y4baFoxMT90eAYaSAwcD6o5T8984zmWvKiMRbLQJRU3ILTnJ01wy2wBKfKagYAe6kokicF2I5FyalFoxN62l8Jgj5a16Hs3qVx7dlpb4g6BoSN9cy1v6SFy2TvmCyGQf6SukRmSNHR1Q', '1552619342109'),
(66, 1, 1, 'hHjrOxRY58CSyRJQgB47lgB4GOCDoDHEIljGuwRTBvq4gMrvxf7MALPggbAelqW1yfFc46SpsKF45faCdTFTaKtnQbWkjLjWEilTgzngmGhftr1lWoZSgRY56MLFYVa4SHcFbisCmT29kUSp4rAL9t', '1552670392552'),
(67, 2, 1, '2t5abwThRNHN2sQqSdYK2qqjLxpwcQHuZAWaHiV5V0qDUNQHvSEU9pIi0ORz1xoeyflP4bQmhkik27ZHmKrDMD5CflHT5xXgGCJwH4V3Sy8AovmWlol2uNK04RwJlwMJ4kAXbrynHjn2AC84lb1ryq', '1552670468765'),
(68, 1, 1, 'nHni1BOWAA97sOhh6xp7uBrCfiiXt6HltV3Bfk99Yjusd7MoNFxUyyHh9sJsg4VzkKa4gaHhq1RLxea5wuH2AO9HwtTkC3dJr7albG1PGFqGjNnChoWAzIzYPGPR3NPJctGTUDVOVYHFtTgARXa1iy', '1552755392440'),
(69, 2, 1, 'RB9GsL5tcl3wdo8hxHo4D1OoUdnp1FRUmxhHBvG7jKxVUMcpzDy2a3Sytd1gi8C7q18D8ZmzAhlWa3tZr4odUUvdD0CAHZ0G95NgNMOoTJihVFJqir9Twa0QhxJON7Ii75KAo9uovB4r21I7dkkKoB', '1552756855983'),
(70, 1, 1, 'koFYDyGGG0LMTsJraqBj9JaZJimm3oHpPTPxQzeGu3S0jOijpHN4Ns0oRjKpxoqMgPhLCU4I82Gcx0n5VEnZ8IGDMQlHDzeu7fESbrjqz76QaA8LR8KroTA50PRVg7v5t4vLiUuzGvSEyVW4AzIEkE', '1552758123764'),
(71, 2, 1, 'n3NuzuSmcpSk5GgOxXGI99DiOzA3YrnKtwgviFfOm5MRztZoKIGIprkovW1uHalLRNXggycoiMxTOMUupE5Y4vzvQWJmRDuxNFylv4eRabGeHUvYshrjp0V6ng8Wk28ulyXegu9XoRmtxgBC2rNgrB', '1552758652025'),
(72, 2, 1, 'qKqYcW06kwisUGRYxqIzVHdwbJd1VOEvUJrvmDLQEtk1nzVHhatkYmRI2RiMoBcaXKEeJV6kXhu1Hl8ZhYp05EmuSEJLfxj2VSNXim0G3gt7TrvCVdjwXGmlAfwtSGYNHyqiyeCYrDvgChr0CVGLcH', '1552759946801'),
(73, 2, 1, 'myuvBEW9Bg2QZagErEonxBQcD2PWOar1HaEQ6vfrU9mypg8Oaf2TfJuSGEtGq7ZaUGBU4qbNl27w6HwCuV0zONsOLvYHZGBCpHO9JI5CsSuoj0ik3AeVuo4KxNfQFF5yUWuUcIY8s1ZAGh6cVax2Xu', '1552761459940'),
(74, 1, 1, 'nqD3B3sNfgKhxAShZKxZ85I5s0xxV3AUQgBTBQg9ZhOaEt93vBeQh3ss2KHVPpY87nADz9ZoPPR2p0ywcHuwgP4IvulHkzLSIVpWTKE7gVFxk3C8zTdwf79Jc4BF0cTb0fgmBBPDlUafPRno1ATg3D', '1552761480375'),
(75, 1, 1, 'L4Yn21g8vpFxLBneJ69DKUVMGY37xLWqY4sP0yNxZVtNdVv3pnFqHlJTNrAJfSuXB5ENMaGP4N3hCnAFD1CrXKfRJZc4DnHvi3CFY0rhaKFg3IYSOVBxBWNQs5c52TR7YXWLeh1LIWWOp6fxBNcvSm', '1552763202515'),
(76, 2, 1, '38awUgsXYSRqL6ohHpJ93HRdCPZf4PxqNYVJ5e9jQV6BKEnDU6zpmhnEKE4DR7QCTgrK3RVl0nfZAOMX2xo4D7V0sj7iQm6Qvtd99nLBLAgiETSPA98JqT2IhiYr4XofG6WFg3CKcE2eqB82lG5UUc', '1552877682809'),
(77, 1, 1, 'JEIEViEmVip93UMPiExgvyzNgz9AREb8zbW5nY2pAaAJaq4eJNtdvpoSwvQ9LOSHOKrwQuhV3KsDK4w81ixDW0JurHyLjjQS1sQEKaic3mbaWE9EbbHnt8zs8AYswiK7S1hLOYqR6uehOJazt1Wzfe', '1553306427346'),
(78, 1, 1, 'h6z85OhGxAHnMo8vjOtgFzlp930w2nFb38r0LYUCK94Szb10GNwN8QzNxSYkGpOYF2A46xei4gOTPwTRjFnWJIiPmKWMyqHvddm4qCaM1HIDcw2L7xfXdLzh7l5XZwhb8v77t4mYfIeojaqFLEX0ND', '1553352701243'),
(79, 1, 1, 'RyUWGXEFiCoZ2MvHdJtb9iohtAj9UgxFWBC4XoJXdJESSIqZe0tX5qDH56yyZluKuEZUA8e2UzYeAIv4XOBNfSi7WYiu3iTQGMZFPvyrBOZrLiMI5UYzJfPB5httFi2r8CkXhGG1JT57JVOL04t1VK', '1553367109595'),
(80, 1, 1, 'j9r43kRsvFZD4MYTb6zw8kUl9tmFe2SXWeNNucGc2wJY20TrZPQjcSuc5Mk9ubBJOuWAXFazUGorLXqcRppxw0ZqJ9ZqBYMWjXA6p6x1fER52RXdM8TN3IDp4OkuF1KjApG2ILKrtpqa6vgjA3IkHq', '1553375506546'),
(81, 2, 1, 'IOA3CXQa8dJEwGIcDorX2f4lbnNbg8wrNKDU1cRf7phRbNLOkwbhdGHFAAfgIdMbwL61xE8NBHhVC06hPQDHDeepbvzUhLb1jfSxfgYz9cj2ezOC6XWCszGSm6rA7m9zewGAvjrXiCHFz0IXkzp5wi', '1553376843624'),
(82, 1, 1, 'g4lE5nNBjyFKIcypF43C4KKUkQnkEEYeU2vBQDBqMhuZlxdYJ4qvxAPCEdXspAN4Fm0huVafcrjJ98p5uNivebw9wLmBR7bKXjJyzSXVWtE9RzOsjnURS6pJpwxP1a3CQuffEdXTObl4DpyanlQr71', '1553379008755'),
(83, 1, 1, 'DoJhSoGKpFcZfJgEXBLr7cI6NajmGonYMhajxG6KDGraDhcLeUIY7wdWjDzLzYApH0hx42NOo7b7fqJwxx3Wv4u9j1cXN9tBnzhnnNdLXjxn4UzV63Ynlct3r8DeusYQbodCLjKdBZgoKknsIqxh0d', '1553442469870'),
(84, 2, 1, 'EPGrILk2mQYWJGh5Zphh6OuqAX0Qg2y0Cd66xwBgd1ssXEE2C7IRVioYZU3MZXC4nkdtlYCWrVpMSMX6kt9T7iqsXPOyvT62WB6TawpJPxn5DcHGuiwyCrMo61DkGN6PEbZUWeun1oabysFHZ93iOL', '1553443081351'),
(85, 2, 1, 'bZLiTHQFf3UFwYOCEiPCEUgWyCB221nKO22xLW9MWJWzW4vOUf2wuAktSPTJFEuo6zVm4YgaqPjBCjViBWALYFBPXceGpObYOfW8LPOFv4eblvSv6FwKnYcaNZtILU9fABOwIO0vOMM5alkFgmSXHD', '1553468771878'),
(86, 2, 1, 'cuhoYzcrY3c6IPi38zEHJHhFR8NotSrudwK87qIdlyPAg0dvEl6qLcWkBCPXplxpZor8L4gF2v9JEqLPLVT0rf7ui3g9ztKmjbF4i6fQ3HCyNytsV65IOUl6cZ74IzFGCpruX2MQQssx1tZWOHSdjH', '1553476557704'),
(87, 1, 1, 'B5rnZZjVRZeZ7Of4ZMCLh545kX6P6eCEvb9RE28dhjPo8lZ7WK7moFu3NY4ikp2cUVpWrTCWbDgGlJgqvUdsqSJ1GKqokeryLDi4tLEfNkzzphPCILj2ZsK6XRhkvWyyNwrmVbnwZDglb2a7pglInb', '1553519390774'),
(88, 1, 1, 'ztlT3OEm8DkRUr1k3yS0O3ok7KS06pr0JZR2HEvExtZl9InqqW0VYhgrQ2Dpt1MleOUWhuOd3j5IN0kbsSxxV1ODurHI1tuAILevb3pi7Kb85J2EQ8JZ9H9For7kuvAd8rKdJw01OMFfysHAkkcYWW', '1553543276746'),
(89, 1, 1, 'CdtJUs6AZ6uZKr2zlq1V19OkNFwoAdoFi4k5BG449vyLYTlaYT3Yh2KkqMp3niYnE2ibLise8UgU6Yp6L2wnY9KtZbKHEHWXjwJFEfQUw8RukjCwmqdn7B0lRFHXOTw6WLrjQePIqpPpuAPaxtW8V4', '1553609475472'),
(90, 1, 1, 'KYw7aDhbWIzIWpOeDbWNXlTpMsosuYBjWNoZfnVujATSF1uXAUOKC2H6QJ3AlTtCvAwzzadgIOZRHxYnJ3QgYGiK8lIc5c1A5bxmLsbWQJR0KC9ie3hqgkvDKrZcX3EQKFwGE6KcOLrFeBdwu7Z2QU', '1553656905603'),
(91, 1, 1, 'AxnJt1Eo58wrt8bmZj4xhLqJS9fGT4p7iGpYITwiBtkav0XPMATNigOvudROa4mLg51P9NSVBI2YFVHoJ39wFNmjmrmt6WSZXa2fcGHTm00l2kNWNYsVfc4DodF1bqLrKPb3fXBSoA4BDeWCDkUQ5A', '1553693302921'),
(92, 1, 1, 'WOjapqMSbybGt2RJi4NHe9a9PWd8REfksTowgeD7BLs0FjA7mg4SV780A07q00FYGNreAypY7xfTPhM41kuybdGCRYzwFnlg77KMd2RRODKKAD424Cs9rEbjBLt7xYJVOP5BJ2hK36opqhGnzrZKQB', '1553738265741'),
(93, 1, 1, 't0u9TTaHZo5T4qPN8yWkWC6hzEfyUzOrdXgUxx4qxypDc0BLr0M61wnJWNqpSiM6x70Aay2MNPyf1GXZvcUNQHR1ZtWtyld7LzdMdyyGbbKAtkfnbtgYfyj9EUxVD4xF5Ww6C8DYGWmGSSwqJFUcxt', '1553788908241'),
(94, 1, 1, 'khDVj0TrWkZzFVdh5rimU4EGfcdpkRlRKTyc76NJzlwvwyvJiNAvj16rENAPQcOylMt5I73wPhiUqLAT4NjYoCdWybGJkSDkKOMsV28irmtSx4XGCLpdD0HDZ0hdWUIT0pXuXHW1ygjMJlL87nsK6D', '1553805537194'),
(95, 1, 1, 'mvg1A7Q6CaUk7pPYxCvzZK2O5Ht5UFDsKn8paO59oIpMg1vkuN9buvnAyy2Rj29xHxszzKDPxv1lJ13TSpkd7PRuZ7aX1YKxprsKCBTJvzhd36ElFXcF9ChjFITPto3RrDVWY4n6i8PwdgQt9W2pgH', '1553826860916'),
(96, 1, 1, 'lvAg3FYyIcBlcanS7nZQ3ZxVFQgwg3WTEsVRfY9eMWgqjmEGer3EF6nnUeim2D2pzSJOtTditbqyYzuBOH6MJ0i42pRSvwDuaMvgUtaWpFnZZ4rbMAgxMISAXPyoz26kbK1eAJddnsgpt0YKDLfZoE', '1553875530533'),
(97, 1, 1, 'T3t8ndH0ifdWqaNsWVeTql39Qu4mjW6fW9I04nshTKg33lBFHd6ypxN0nAdEaLe9MxeYSjl2bbinonXQVxlbkQ5QVPeUZnDI5jvCRtiRdyvUv2IQfYEQ53KvzgTavYSBlqC0Ng8AuyJJJoNGE0HvMF', '1553909092766'),
(98, 2, 1, 'ReTDTi7cuibYucGdXMVBy7REX2NWFsmhsbqdTbZgm5etPvgFc0sbvsbsLInzZ7RlUWOSLyLbO2XQ9X7wWi9cfjMWhq9PDtP3ebYl4wOIqAIzuhIdDFeWRLwYcijQR7Atmvc3FZPT0Dnm7DDVcx7fx2', '1553909789275'),
(99, 2, 1, 'ElfecbcGCqAxYpHEqL9VC5K8xI01iaEbzj6N9rrqA9lVraRtQR8hGI0MAQUWcKSuwZ6DBN6hA11w6NeVICG5XCeoiVV64QWNQkSMEUmSmzhBe0hyyoBUX8LiqdWiRl1m1kcuVfaLAZ7fQjBRzHRLpL', '1553913848036'),
(100, 1, 1, 'sLMX7QHYTY8UhW5QTGjLQ8BU5kGKsJTqS16cGdLiN6XItfv9ckHZPvM3e3uW32XMlGqYxaSTqPqiLYCvaZJ98q3pb7DI0YVP6xnprCLZuXCy8zVPbNrVjaNVkdc2tkM5FxZ8IlgrgojTHjSZntrfWs', '1553964826139'),
(101, 1, 1, 'jC56EEB0KW0mNRnvnX2DCkHY7JjpVF7MiDQmZfBfBVQdM12a0Qxkkj9t5C6pMQq0wEggMuCmwVpD6bZbEIG45UjUrKkuEmym9eLqVubBiElSiLeTIeGnT9g3IHvQtVGFPDMkilMNBu45pRCQaM2qv8', '1554056213805'),
(102, 1, 1, 'b3yi5qDTLp4WLSaSOOYnCDYg13VXm0ROfHCBD8NwdM5kQJLLWCF0E6G3X9k7nr8HQvO6xdoBlCWH1oBSOY9lUs6d5IvGQd8I8SFg61ISHGpTYLyXWNrcoi5SEuHa5zcAiqNym6eyBwF93VFjo74Fqy', '1554147656674'),
(103, 1, 1, 'Y1pj8Tv6buesUWfPv1tDClBdJAEoMgmscJJCEaJmt6M3IXB7mgZkzr9VTvrKD9ri6tB3jFovVC8REzppaXjimtGTFW19TEAjA6OyCwGx1JR6MA4YizsXzI20rltM43VQQJBvLavzXtpB6ohmBAGJEM', '1554234108675'),
(104, 1, 1, 'fVaQ9fGMa5UubTT5lu8xoR02eHVneuAucUqhsT7vw7HWlQ7izUecJGcgOiuiHCMCG38Zb5HgPg5pLn82hsZg8HiZnzXna4C13WVyJbwUqFwJv5WuXvnXZ1iD09p63hgupK66ezNLXiSeZLcSyIGqpk', '1554424007500'),
(105, 1, 1, 'UJoNrlgIAQW8FVv9ezV2lFaOgjiMzusKE47YngbUHKsMqBjIKLx8b1A58DOOEPSYjtr4Mj34pkTifp37rVJWpPy8dUOD0tIg0MWRUGRVkRocemktzYuN6apFu8mXQhRqmR94yYEZKysjnwNzSJ7rCJ', '1554480281972'),
(106, 1, 1, 'j2tJ7wFRQbHSxABubsw16AI2Dl8e4ZRzgw0BRDPwMPpT2q8UBWtTg0nR4ukdKAMirrH5BQ3eHBUx5RDSTY9b8ArR731z6Atw7ATjSxSKH7TDXyyVZhwiYzQJh8RtaSwXSZhDaYJuUjAYGb1zBgV3mC', '1554517241727'),
(107, 1, 1, 'x14q26CDGkaeQ9rBwy1PHjnLqkjRLk30bADw27wUSXLnJ6Ip19ZB6RkAu3PVGGztP4uLbNba6Pkbk6yWXFBzxRmruWFgLRdKt2fW7uR4EU55d8xoazXaYfqu85Z9FSrro9jtDyJLate8Zm6gnh8jcU', '1554518912939'),
(108, 1, 1, 'xGXZXrkmhiatzc4MsQzDesmsIYj521pkPY63fTWyvvLq1BY2jPKbFZYSGZAJizMWux6ysuISH69VafU2rn61CTAhOhWsJgJX8gd0k8d5otEFXJWF1EVvpSCJq08BtcgRfO9O6bCiyqkji7zmK2nUyF', '1554564560299'),
(109, 1, 1, 'Ef2WPUtQXyZ9oUYuvDvsr7TiBS0Hf6pt5wYJ8LlD941U6aOGUNJc1eLdsHQUwCSvfkuF5nmpVnGD4GLEWldmi8Z5Mebt6sgZi8ozSOYcZ8aphlARK77Om9UGOJ50frmsuG8q6e7NlNpyOAQyAUB89v', '1554652832591'),
(110, 2, 1, 'OuJSoUAo05nFIept2U7FOQjtU02jquTOjyFeSF6XmlhNFkdsejOOOBNf2ecuE8GEgxc3Zl5lGRDempjq1YpZHCuhmIuhANBCBBhUv67TLTVhDLkrJTCLisni4eOF7PSxoxu2iGk46hByNuwev2AwYb', '1554652910938'),
(111, 2, 1, 'NMilDAgLdMUhePJCZYYyOCnF2I57kpvVhrRrKYS5XZKuY7P9w6CBHaerVYXzmJb7dDlwmEIp94n0IXBnWlJrfPpZ9k6dzsfaYFibNMwAyY5EyHwjENCq87kAB41O2PS2tngjPkrYi502o0KYpSy6ar', '1554686276761'),
(112, 2, 1, '1GKsIU9l4TF3vk5584kUKjoGHuHMoBhF7dH8e9Qtqjd58v64o0Z6Owz6KLaY1QrVZhzwDWkuBxbVLpRtr5gQp028sOLHyOIa2SVST5O544ZFiK0uPPtW4dJ0g1Mfz9SODiuM2Sa53flwUgXIB1ZJt8', '1554686276924'),
(113, 1, 1, 'wHRvYOsFhzuRXpAHb7MtljFwXfwyLOdCpmDv4JLL5DJxtR6BV6kCXXYQhAiKIh7gkH8WbjHaoXTicdNVVWO9FnBBYhbQj4eOHC2pK5Hg731GanT2rSor3NqjyqWhY4BednHjfME7iQy47jjakQZHax', '1554686786119'),
(114, 2, 1, '17WM7y6pa6Ar5aySs9xG7fxVfIDu9og6UauCohjwciuaBN4zFdT499km3pvXvjL1HKkQEA5mpglGr90x1HLTukOG582A2BDl2cXL8DqcmMjPXXABi0ngsuh3ufqW0oelASnp8oyilQJ2i0THATBRia', '1554686967546'),
(115, 1, 1, 'Uc9CWMn88r5fZN68K6R1QaBfDcb5bPa0ZNfXUxu0PhChO52FADmACHycdrCtTDy8WUkDQesIS7HCcXA0wWwk2DPqUes20IIEkhOGOnjXo6AYl6XsNGLW62i1KfiP7byOAMlyHfQjhVPIdW3ULLfIJw', '1554687763001'),
(116, 2, 1, 'nOrMVZmkGLRLxhYtphU2iklNk09oz4fonqjKfphPkMj4r3ARHmn8wvIvB9vXubSN3ThUHwHS3SMjfBoDvEkWrrwYY7o4e8UKG6MRr92Zj87nXQ1AO50JC5kUzGMCNHxEUHKwSRAAXnYyOT6tG1fGCy', '1554687798749'),
(117, 1, 1, 'VvYmT6XM8tCrgr9MQTZhctI0jjoQmPpwH70ieULxiiDPcCNpdyrkdY51EyBzUcmFzA4LtxcNi0DiCDBAR8kPO1xbgin3MtH9cD3gyw3pv1puOrFaeVfiSySlAG7UGoRrxGXDfekEyeIpGgfEOHMHEP', '1554721102057'),
(118, 2, 1, 'sNDYhPftheT1Xkn5oMHJ9tgd1tcVChz3hIHY6KwH8itNR8N4N9xPDryzpu7naorqEPSugLxfRya7Zq6oe4phsQwTPd8WKNURfie00um4t5c5oGpP8nuFouAm5eBvPOkvDMs92oSw3VULHXvXlm2oal', '1554721118524'),
(119, 1, 1, 'PfKduyoygnI0JqXEBaVDvs2DXNXC0fgkeZuomVSOgRKMI25CNm7Lc6bEF1ZRkVazeMWsBlzWrEKh7xmw9bvyovlc4qHArDZfsIdtm1j2LndEOGngRWewxECLmqvhSwEc5LNTBSyHe2S0uB7ZAqprTo', '1554752653803'),
(120, 2, 1, 'DtvR0JC7VG6SsBwfdhYSWOwl2EPsk2lk4O4wOWEAk4Gd4pbzvl1A5nJMwicGo8ElRSDISq0uJpnpgt3BnWdzPDUVBLW0QWfWdaVvuEdA6nRt5SB3AbWPFrOBnBwgwhpkwymRhdpCUrGmGTE8zJfkW6', '1554752675548'),
(121, 1, 1, 'LfQDIwSa716DUV1ZY0ElhZriBp9ZftIyYcNMddCPEs1uF72LRV4ToZdlMIYrriszqeDRG0NCsIAXEBZzNjQaub7mAuNl0bj62QXjJ9vdA8hBqij7wluCYE8ndifmEztQ60KRr5JtL12jMaz2qFxYkg', '1554753901334'),
(122, 2, 1, 'zu3fmgC4hmFssbqHWOJJnPbxaQR9DnbDgI8bwYKYnRaxpBs2PxtNQdjRC57weIZ32owJwrOtRfCPheM63aZ0IaGJmL6KJxR1rx8LCExEddq8pg2u6Z4Qk6nXaCP2ubrgRTdRi69mXyYOlW5BScSZ2m', '1554753912113'),
(123, 1, 1, 'XLGIcUNukXmfeoANl587oV5rjtEKTYR2o2UiKc8DXiPhhBvMCLgUCBTR7y1JdpMKoYttyKM4LIyxUqppOQOAAp3j6Ekk0kUzz8ZDgTfuYMmHdhpK6ZsZPtnU1hhJCZ2pvK9MpDlxau8NcIIMjMHC8n', '1555727609661'),
(124, 1, 1, 'LgbIRR125BAproKXXj4Fwrj2rAQR4K15OkFyOieggOJCdN5wX3bhNL3chpv2TUoM2Zuh6MFStIxHBzNT0a5LigivuQIwJ3OiI5oHEXGMKlKK3L94m45M11Tx3ztaNuXtQx6LmuNOeNPWq6ibA7aUXx', '1555779557498'),
(125, 1, 1, 'Y9bQzXmHt2QiGQf4XW5c07B1NKIlH84B2VGBiDy9iNUpkwxGDjjzB9RMgePTBi40VDdVs18HpV6kHeWo349qwUT3HYQHhe5dsk7MWw6ELgl7eHWbgpBUOGiCUBpNVIW6R4xHssmIblZA67vVWaIxIS', '1557007779504'),
(126, 2, 1, '8sHBMO1cszWaIT4pRIUvOPGvaQKq07MuoGOcZJXbjQV24BdsXBgr0U4n47jNdZY9MSgDh5Ogn6NR3Av8b8YDHwzYb2y2fbvPbAUzKyGDnGrSy51SCTkelZzI4AcremUnG2d9igwRDDiv6D7y51dDEK', '1557007842024'),
(127, 1, 1, 'T8vHTueEYAVYtFMOiuHE7fIzVzU9VClqJ6CPjVigndfPXk4uO1hNqlybsfkSkXzh1EBGNFf6QdKScCHIzOWSJkZHL0sbzP7f4maaZFZQj8OK5VX1NefG3VIA7w8AeD9fP3Iw82HtyxLiqrjghx6Zat', '1557370284723'),
(128, 1, 1, 'ZdsdL0QckpSmoYmzjxCXQKJI8hmoqZ7rizsW3mPh2Frk6aNa9QRW79cNDV9zp03hSpZLa69AHhvtvDhvwebQriJiiqmKM6sndml57Mx11cmqokbSwPtEXd6J0mv8h7xZdhX6Py9f7YqArDDWJ9CQXz', '1557541368528'),
(129, 1, 1, 'S7Z4ORqPPg2IdrCOCWwaOrl2Qjpb1p4izcptCKcvWTgmL1YX3yGutaUTWa2ajoZIyU4ZebxEprTyRfukCVTcB8cKbYf8yVGKAyByHJuWq5Gs81CCkh6poWUgkTZG2cB3xNMQ9m4l2MnK3DLc5EdCAF', '1557613585686'),
(130, 1, 1, 'N7cL6RLF3mXCBuF7A2mDgMUFJJGzuCxi1wPLxJNwKRxrkgK8Hssr0yNOjN2tdDZas4iP7DVFcaqlrgiaVD3a8NJ7LYvqn0F75qnOcI7nJVN32LnW1CXxiiTbn4N5oFSXFNrbdQJISJezrHc0aRBHv3', '1557675367178'),
(131, 2, 1, 'gwEO2GVKiZZRqHZNxlww5p8d7gpGZSRzI1fG1OYPNxbICGPs59Nb5XNCts8lE13eNiASbslqmYiKILwyz9XbO7kf5rP4HJmh2rIchRT6z7tSP0SFvlgRhe2Qu5OxDsJ2fHUJs1SI7XUNk5oU5dfp46', '1557718802060'),
(132, 1, 1, 'AFCGAZfnnYxIC7WuCnmomLQHnEUhU0pvJ1gkBvGywoOAU7ovg5i5rvvUcDv5KiTKkvrMgdEMiBnurVc76Srm8vtvzWnamqd7oqToet5R4Tm2FOsRUl4qFfnWWXmhFgUd7lkfAnH1WdKnBXBOMGj4iq', '1557762902782'),
(133, 1, 1, 'D3kFK5Qojc3rmos0C1JxLbiyzbu6hLx6h0zSWC95Fcp7SqJdw1wxXB6xCSDGW8eZbbuzSgbPlZKN3PHBuAeJRUHMMwOzO2l4Qg2Tkhkc1vcw1tdQQlcaTVNu7ZmohVS6dhyPV2zjffzffbVihMFRU5', '1557777330030'),
(134, 1, 1, 'HSrt2U5bPNNoNXhVX27ccOjniZZ6yGD2vTOqD1UHmpjQQFPQkXJWMov5685QcxrkbhdzLkjpyWmIFNuYcRvCaphx95TKiIJSJPYuVZnfSNIyVCDTDrMi6z56FlVZgFFc5HNzsK5emK1d8SSJzsXrUn', '1557801263094'),
(135, 1, 1, 'LYI4Fg9J4WJ0PWG6IPHYGULdSubqLwAExYMxv5HAkSIBS8sa2zrB7wUjjGtHthEQWmzvTnrBn6hIN2CubLrPxz8rskfTTweoOgoSRr5vUPPV0mKCvMGTZu1mdWjoyqJklJZnLLetfZxX812HXis2LH', '1557850408316'),
(136, 1, 1, 'cagh3H6GNH8VtqadCnE9F9qzqIB03l2rNYtrQHVZVJt6WJCvkwRhW7KB6NBCEV8zqfAvCF7DhaPwBwWuwjg4L5Bu1JEyN4y9SR8G73xmH91fIa07tO0sFgE9ilCqPYtgcOTV11Km1sle1gUNSnw5OI', '1557890045122'),
(137, 1, 1, 'DYaxWAopfvBzQz7j7mZALTVLgk53mhwNU7mBelfZCgcRLFBZKSprzW5WDL7B9jkRllRXHMe0UtAqpEX7Rex249BzPOXQu8AjXfEm3vjMlb5PkVEQ5ZJ3U6waltbcHgSqzuN8L9pOtXWLB0NbgfecXp', '1557890425830'),
(138, 1, 1, 'jmb9k1Q02QID3DRxmzOBdWmiACFdAQDMF5qKG5nYtIQxY0qvqmTAmQdxWnbYQ5bNzTGE6V5gL9E7UF3Yd4ou8PfFIpsvwQeE4wSwxQXSggtDFrVgwyQuiQfjixl5P9HTKAk8flV6SEhxfn6Zm5f51v', '1557932140338'),
(139, 1, 1, '5DzXWx9FPlk1DUr6s8BRCKhIQegEgNnEkhFxgeRZ2kwEgRtYmjpTxcbkkajXfYIJkdQo29V4RMLWXJfGVKBfD0wlMwWaEdqbkwYTecZabdbuoDP5JF4rhxZR8GjfrumP2qQ4aAQmEQa0BeaEhvbmRa', '1557953769864'),
(140, 1, 1, 'yRr2ss7DBjdwIxuSqmIPjMUyx32xFykMyalWe5Cu2NLmOoS9Ta6mmZ12OrOGXnUfCezL4ZUio0ITg1VYbwX17J3Dg4SlR1VEr7l3Err6t4IF4lOanx2olTBIx1faVD5lfhEAvxK1Q9FBZUrFjUl9jP', '1557972626449'),
(141, 2, 1, 'NQKnVFKo4pUFCU29zmxXjp2kLSqG8K0XuNXneJD9LlaJn7q7yUHWzs4o67OJZHZIEGQMRDSJfTHeS8l8yfrkJxMHuhdHdVVHZ6AfBJAPV97ksNbBPwZpNeOZK3NvmXoKxtGe6kv87rkaE9OMWxI7Cb', '1557972774204'),
(142, 1, 1, 'lIhDJNVdyK2YDOGcRqvPBfDJyN2Q3kd0Ptt2qjI1MiXeV1ygYp3Ngcam87VkEjNc6s2XbHNhBZYY4FbqhCnfXggZDlENlf05nrtNj0dbxAVSOO3HzHthAd7jF6o04u32avgR5Dici5QzBJx29v2qIV', '1558014946700'),
(143, 2, 1, 'LvKZY7mXFOqbvmFUgGYvncE2QktVibkyX2JAYw65oRQ2nUNaAm2LlL8t2OquUj2nfJIttvcEvd3RVCd3zkjiymlgW48sxv04GjvcvyiNUCxKtpPuOniDyT2XstEiTUlLViA1hSG45my7FbxuqJWu1V', '1558015528743'),
(144, 1, 1, 'grB1fW0zr5nPr5cHrE6yiPnxksBzYILCtUjFfXNVsOcjKlvi8aAjQTGKkx9UCMZXHlMpIMhznRHUAf7cZ0XRgMbHiuIpsCdikTFcQIxJbBDT2s4dHuF6jY70sZwB9SS4jJCbMvn06MzRjNSROYGQcD', '1558038723304'),
(145, 1, 1, 'q5H0uVTmiKurgTfzy6WjqwCbWNktN1RUMKi5LV1Y3CHq8rVj7N3wl3Bg1Bos2JbZqjygMQGvuGih9af8PwzJM8eCTdM50SjRpBu6LT44cdRorDNLXsgW2HEOJhrjSrrquNWlHoAX6OLlsNmi1S6OOw', '1558317628424'),
(146, 1, 1, 'l8jjsHX97jB0rmBxypzMbbpesHSGERm5DxOWytUJmjGp6o33CDqBhR0GvJbSUjVMx2Ey6CDfCCabrT6DtTzf2BPfsu1VqROQKokNm1fsAdaTMuUJ46RavAfHl0uKHVb17pG4TXDbEQ58ZZnKVkCnrw', '1558496080981'),
(147, 1, 1, 'OJwG7nZjWuhA0aRew3O7aKTfZ5NNh4p5jv8yZaSjeDvPts3oGM3FdfFPSo5oIGuB7Wt9f58Icxj8Pgk1qpvfKWScvC65GMYRgT1xbbN8ot0shlfgz7oN9EN897gt6IPumc0gkDRcLdUiZUlRde2JGW', '1558497261996'),
(148, 1, 1, 'GIhSBiqzfSh8K5OhuVYnEGqytvR5ISuFJZDRKat6QcGmskfC9hOvZYcrpn9bsGgJR4xoh3G5ui1gocZzn4bOdBgcwptlrR2mItalBzd9rEQsLDK65zoGPCdahx0FbyMJiSvzDAcrbJbKMcUTghGGgl', '1558497545563'),
(149, 1, 1, 'DEC5oWYVVCFYltecYOuEYFxrcf9rrN8lDmzmCXFdMytxzLRcHefnvNpEGqLaYXvaeGXN0honqWBOzYWOFWQyzAm5mZ5U1ZOZRDwRVZPmeR7VK5QlekLsAGX2NwgjEJ0HqcTMcC9tSmMwrfXGQUvx25', '1558540746988'),
(150, 2, 1, 'qK1sTpaQETzClkaoJZaaRL81lCOoznxS6vwlRdVmOd8E6jVrknnM3149HRy8onCPa8cSWIGJzGGY5pkceD8YsKAVUmKQB5rPiaflppvWIjFnRoE1dcc4tPwiT9q1L8SpXn5qVOl5T5ilnyZdrgGSws', '1558541351131'),
(151, 1, 1, 'HXSfItmf4UG38xpDEYigOOOEIpS7YRUHXjpELLaDy4dAhMMiZQb4Iyn0URlLcCX1DWiZu4bp0gK5EyGrfRiHoLBNHptsFHJlIcHxDKz4NPk4plkylvEKyRO2BZFcJEufp3g6HLWsL2VBZ548NA0zzW', '1558629195389'),
(152, 1, 1, 'peGV1XZzwN4m6ZEqTXIE7g78wDowtKsRUUgc7vWEAB9rTwbIB8ACONGmu1eDPaBTd6CUwC8huNvgNXfjv7rH2CEVahyL8zmjyO4LUMbTtkBj7kkk84in6EdHNS9JZOTrpvzEiCQ79e4Mr2iHW5pKtm', '1558966842783'),
(153, 1, 1, 'PCOzmd0AE80FEBm3eKOPbrIPythkBrnENYHpCAM95rVA43fq0oFxtQGle2RukQ0BG6nfHdUKYOzfqykaTEaI7Ex7sjC5dcDUM6cfUUsonMfRMvirCXaclnmKy4YBLLwcuyztyEqSMjvimN4aZtyGCJ', '1559059927320'),
(154, 1, 1, 'DwjMbUCixYGvI2qPk4k6Re6HaBa0YaeHMf0Z0S5UEfjNOKf8oZmGZT0mrGWFboNEKHpqTdBZ7zZlxtrAW0clu261rvWgkfChEaLebGIt40LEeTJCsxq5xPzhBOrpj5ASpv5ZAVhOtZ5fjc8vhYP9af', '1559059981071'),
(155, 1, 1, 'jJTqkmTzIMwzBtaLmnoCE7qd1mGOUC9SPKPX3ZhQbrRS3Yj6f0LuPE9AladqnXrRBQMNWqSNfe2QSD0aeWCr7Uoj6f2csFz41dqJcJYnC9gMSoaxMjvC7K2HakDDPkMCfQBci1jYfAlWCq4M5Y9cWD', '1559077039586'),
(156, 1, 1, 'AL1p006arDYfX6Mxwfig9C94ayXfBPUX7i87ixmsiPH9tbWqz0L2hvqA08eIAVndpPHQ1hzQwVoMxtqidTFMxvhGLBYRG30UHkuHt4bLj4o82ABYiswdEzx10qae9iIcNa5Um1RUuGbNfluCx8Xxny', '1559100307483'),
(157, 2, 1, 'E2IAtYAuVBxlb5MAI60FmIC621aKtkp2tY7nhk7o3fq1VOwPWgd4hFMI7gGx9ce3sKKsBLy3x6w5NNFzbuGVtQx67Q9Kxpe0LN77h7L8LPdSXj2cK9bWza1YfBhQpdpU0FOtj5zfcurl5kUNeS0EBi', '1559107303119'),
(158, 2, 1, 'emTxuXmMQ4IHejYvTvdxytwSNGhHzDLaGQX34wNrc3DghvWdJLwasXDZYYAsaclcoicantkW3MQbwIIxasJ3gMmsOb65LYvgatdQHJkz3f2cKrATWsk1z6hSO9jjpxdCEbgcVI1eyZWdXfReCNKFyx', '1559107304591'),
(159, 1, 1, 'OyGPUSLKb7umK72qVTQnygNNuyOKdxsZ60aOAXddjpMMk27yAse7d1P9WZKC9bouswWyaVPTS2Lyirwna8PgzQwnFEwJE2OYybdSS6cp7ysJzfHBrPFV5ilJW4SDhgAVxXY7xaot77Q9zTSYwEJ84E', '1559107469190'),
(160, 1, 1, 'qnFJ0eeM5mpjsLlNsarA6EHP9i7k4tIZcHtIwXRchu2HTJLDOljgbSjdVognJJA5E5rfdPpxWO3BGqlg6bzvMIT81FYb6kLOmWqcKSVn2NQ944odi9dkmwwiGfa53fGyzlMMm3DPpsaObqgk7ulijr', '1559108018787'),
(161, 1, 1, 'WQjKT00BC08mDVPZy6ZMxbDM9kbqpqjbWjLMilybb9CWHwHPZOtSSBLmHCpchiPa4zgQSKYxaS9P1Xr98GmVLUdnRaggXKXdj7fIQuvLoYSXPWcbmOytEPazOvgGML35FuJKh5rR2oVZKmGOqdtB2z', '1559109575980'),
(162, 1, 1, 'Ov3nEoXCOpigjfB2frvYT8Q3asPAhhvBqG7VC5UI8YNyMMKZ8LgaPPb4PUnLIJ0rdzlE25JsGAULYNRnvSeoYLXPSAYw7qMg3ifLDhALBnYM9LFGg9LZTMMs1lYyy4vNd8VrTQEWxGXA1KfWJZNguu', '1559145249044'),
(163, 1, 1, 'o8uNuHJiD10zBGD6RO8tMReO0eDWWL4xQ47lmhJV4S2a5YlOb9y2onpSisMDHuluLfuviWtCE0c6xcvneUNpvH0Y8MXXhN8UKnR3wKx4rIWXtGw6tTdIhNG2OepDRneonnHlellH1uPry378dNqML9', '1559164779206'),
(164, 1, 1, 'fhOzteZJm8F5DT2peFeH3x7vSq659kmFIvRC1dUgszpmqIr37w0EYPyYl8zRtetyHmpO74HX5P6dKPOiTPSEywrbiqIXjCS4HzyBfhaQEWTx55a9Oj6oFd0UT1O0v4bh0yHJCvh5exGWyWtlds8PnM', '1559178080206'),
(165, 1, 1, 'w01N4AHoc2sGTGn5ZeeHLR0URT2jVd67fTJiwTVhcWbJnVhRjOWrtzUSpZf0uZxYdPsXUP2F2q5Ctm70Dw1WfAPMX9ci6MKJWaIvaKjc1iIPLBD9db0QHQcpYR9DT8RU4kSwBV5wZHMvys0jYBri1z', '1559178202012'),
(166, 1, 1, 'tcUw7FZYTR9Jlypun5wYBPEGsXzwinJLeKKaAY4UzCfKWPM509TAfEZLFHDBQ5fIMWYbf5PckMqzADRGD0fztgujnMmVTLw44IGhyOB5GroDB1szU0BuirexPlqCLKorxzjpLe6ymqGuBrENp4kAz9', '1559221647001'),
(167, 1, 1, '6zTQfvlh7JQK7h6VUtOf9LQF1Pj6cDcNT7mcrF8sXS1HCEGNIEAQlUCfwyfsIZdwnoOs1ImNa8vaa9Qj1LNN9F357PfkWGaxYg0apGiYeF8vQivLb73FpGRY4PHWGusWb9We5aUsUdYQzPdCGAMeif', '1560907859323'),
(168, 1, 1, 'W1a0WjkRHTa4WPNHcd7YYRm9iM3m4nRjVAoiXEWIOLBC7hs4ThJojmL9Gq0lnWTzLxBvViexU7aMBoI9j3WrOhi29J1MIEMuRUD74rlinP6btx8wwJyUlhzsD7g2uYgOFSivpdtcBpL7aolOn2l9iL', '1561055187066'),
(169, 1, 1, 'YLHSUvXCi4LVH7EbjHPDrmksNkzwBDKNAjhYeL0t5mvqAv7mk5AVKiJIM5vvGtBwE1FHjbmXbKHWsZ024MeOPX0kCG7SBdo7TYs8Er5DxsxgdsTy7vLjGGyC3OfNEeC8pxfLFa5YpM8rli1SN7EZDE', '1561155227434'),
(170, 1, 1, 'HganGzSofoXuoBxb7Gc2Iy3tVJgvvb86Zag6taYzDWffkSjPCd9r11PuWo55RAkCv6JuBLMxsCXUykJeLy33ugLpe2CTQ1QL88IObesFLrIVYmbwhz7GzCImAoANJ9UmSXYRHhuzfkTDqN4dTqc5Sq', '1561234810374'),
(171, 1, 1, 'pNtTuGk0C3dihYDVFzU2prsTCEQxIxSBWDRaVApRP0WuTjgObhxpu4CIbmTM0KW7SzT5OT9AsXO2IGfH6yRqPUNZSJOinTvoAsEO9qKooRRxtpMrJSonGMOsoZkajfPqErkDODf3xONUcqsbRMst3C', '1561330307294'),
(172, 1, 1, 'nnUp7D8Io9rOQoERhyZX0cKmydpzZV3hCF1bsc3cRNks1PtNbMTsZiurEdBKI4PwrJjEQuX9Upmqq0bgEElD6xTVv4uohmT1aaDy4caPmky2YBSaNtY8m0BOzafqEqs3hHCJXhehBEcnSXb4NQ9PUl', '1561335168371'),
(173, 1, 1, 'i5BIVbP608cAoXAnLUFeqcu6JXyTJB9RibCuuCJ7S5YK8OdNQZESMcnGU7tbSomz5dAIN2mQXObIhePcdLNKRPgmfnaRGTNyaZHKGfyJYcSFjkNkmgYEg5jQzNWLaLDB1bRDaTHC5zPQ3J4gLdOqLv', '1561506837842'),
(174, 1, 1, 'jFsVNaszNGfGTGF3wg2gdV9gqytY69RGAhy9TK1POXwE1mX63KKYR8p0WpFx7U7yEJnr5aUj2JS4wuo4STEBXSWKgixt6nUhbfcaHkzCsiNNNPs920BpOSk3OQkZSsr6vjcHmJIhCQe3Q5ZJcqCcYc', '1561568617032'),
(175, 1, 1, 'UBKv7YCgLcPtTYPfTDoXwcpOvKJXxfRDr53AYQ7YBkswsVDwprRCbs7S3KvyTw3RbstUmdh1lHfXuQi8mQ4IgPmKcxIxaWtshiMDrmT9h83LwDzhE67zOZXK9c5lq9QGScZqO81tklY6NrcpYxQaaV', '1561656972390'),
(176, 1, 1, 'T2qkj3otFAWEvDjXLgkmnV5wEpwX1rNe7EvEp0WoLEHZ95LuBftDA7kGoc66Sgnjcxd2UT7jh7fhOwvybUGLtdz8Eb9xdE5QmAlW8dP9iRubArRWsHCrz8zq27MUatptE4Qyfa11s2XCDj3WnrTVHT', '1561746133939'),
(177, 2, 1, 'Su7nINT848PH3jEE5Tp3K67nRSBF8fxLT2g23z6f6fl8IWzRvBP6H778WEJVLXLA68dezvINMzpGYJbjRhKqkeCKT6rvTInoY9qngVP2zUSe8792BAERsujk2UzE88i7nGjgpsFgBSSRXLXFbWxQQy', '1561759445427'),
(178, 2, 1, 'vXf4ZuCCKRyDXzrnj8rjZhjiFXAdQRrI2kcdFU10cANvnAHSbwCYfY2VoJ3dyhiFTRtGmRBDQyG7ZioNK7SWcwmGjp7yf79gX1PwQtWDKY6BWSgZK1apJuIjMEzpkppMpaNsgJw3soJTSyar56JH3g', '1561759847923'),
(179, 1, 1, 'szPnzyMzBY5waB0NkEXtaaDUY5rGnuvsXabilO9FCR3VetARQ9X9mUN24ajodk3j4b3cwJs8Megb68LYXTsXmy1ijHOdhPW0CU8W1yok6H92qni4QUlbWFSXBhqNbiBSCZK92ThwchVGDuy1WGfDtR', '1561759937374'),
(180, 1, 1, 'CaFWJAVu3bc3FTAbhqc1S6V4Uevbd7evFoucpPgb4M4Xs1uAQr2ujbNZepgkI1KjiChMFEzOiqJflHyEPkQ8dNM2Phy4xVE2doqZN8Eu2xXU7ncZyWgLBiZnsgYD7QrC4RDFgo176ncdW7dkPI1cRZ', '1561762106685'),
(181, 1, 1, 'UhJLGQSUyndxujdkqGj217ZLyaRUOyrdkgvG6UukBngSJ2SSpP22tJnYxnAWUNmlSzqMjiqlCbjwgLApyK9Al3S8BBBGcHh1Ec5n09jCGcTPxvsRr2xJXmWawLub2Xfg5QEAFKtVBnw1WyupY1ugfx', '1561827668703'),
(182, 1, 1, 'v6dAJw0ykRY3SSr2rBucz5gsDYdJNSZE4GogdbNllexonzU9CNJISLC8mOVHsBbRyxybC2Oe8gN5K3jRql0YtF3DOCUPDCpTu9xMZxnrpfASgEj7qOnvnsUEitooMU6DsWBtbTRHbuhFpQpdPT7yJW', '1561853740241'),
(183, 1, 1, 'EKlsIHBVAQK9wHh13LNFnBI3ajM9sbQZVV018muV88m4HxgNJleGKSy7z0Wft1UKHFrzeKIwvxH3o648Bblul8gKvenxVzhuopwiaALVnVSJrnTmBxjVi6tQ0EYD8F9PML18NBWyskgru8eUYbVU8i', '1561899652595'),
(184, 1, 1, 'Gp8WeeT5wO3rl4cmNXHsIo0bS2bFGIIlO3GzPgdhed0Gyd313Wgszdgi41tNAe8ZSxh0I2ShJRx2vu0FKQLuLbOYgjMsnEo7EKdGdE7ZwNcFbq1VXQwYCboRYye3DyYE3gtT7giSF2elC3tqZepUjB', '1561936565401'),
(185, 1, 1, '9uoqeXaAdikKvridt51kdWiZqac81eTTHTBSuR52pqZgjXxF6Cz2WJQ6Qd5av5XJoVqjnmXa8hwrFNl941nQkavV7xqfQgGT4bUsuNG2fr30eaYk3lKsalX1e5AIuD2EwYMa4rWXJmgAkvGlnKE8vF', '1561936568658'),
(186, 1, 1, 'ejVjNakVdRHEwsd0VfmLk9BHyNkQKzviYl2Su5WxY3PFk3Zx5c3Tkw3ydT9NKQKprk0BGgDg6D4GfS2HWUzuN41HuVfHMuQAMxsadKyXS3jKZXaZIKJDYd6Wiq396WEsqOazfNOQFFmDisxpTxUrp5', '1561938098383'),
(187, 1, 1, 'FL3yo7Zz9vzkLZAmsib93uhjJTsdZPcdaL2tiXiY0e3iR9SznSDFFtbAOTiQd8FFwrOZXn83KTUkO1bHRFFPi4eaV7cEG0vtTmvMYKH5fN5KhPJTOijbxLLUPKTOE6h2l7u4Tahnk9WABWDGES0i4U', '1561944281980'),
(188, 1, 1, 'CeXkGpUdEqQCVa3YAFYu67K3jVskZtvLSjWxceYkcSsaRAX7wzbi7I5aAGoKfGEeFhMnG1BZLrHdugRgUkWabUdjJTE8YOvplVtS4Jr0Z0gLiwCgK0JZ27Blfg9LH9BV6bADLzQGg6q64a6lI7JAjV', '1561944986200'),
(189, 1, 1, 'RxXZtPNKqvLmL3m2DQ2KSP2GXAG6PuKJYl0PgotBiqLElJ9AfMEOickyaFTA3OOaTibeAnVu2nonet4j8BmcFRr4BIUM2eWnSU8GeU3KPkXbnhwFe7hlu7uwfb9P6DfQuMehtrjG9o3psnbD7qGnz5', '1562009760407'),
(190, 2, 1, 'rOCHo6H97nxQ1hwk1UMgClWH9sQw9bjr11xRIOiSwQvJoSkczkPsA6jENqwNAiPXTqc1EmXNLzT6Aals7sAKgsyzg4TLwQ43oS9PCSHpyGkohVtAbhAOTsdZu8GbXIBNZHbL2HlG4rBAgVFhf8klx6', '1562039058915'),
(191, 1, 1, '0zMJLE4snFMaNcHo1XeeESfJg43PtCNQBl1e10tlfyglCzDC8UpH4C2VQuysnlHCxDw74LtmFRkV4hcUM3Bry7UcbbhJ9f3LUgMdwKN84rwXbDUN9NBJnBYGAgl3SyAfVaDYbFziNBccxlchNVkaQl', '1562068506513'),
(192, 1, 1, 'ALHOSJTNh9WM8FqzCYIwRV8w4eH9NuriYNiBz4NILXtmSHrbBRsCLiP8tqAcNwb2H23LKtFEv72DtQHj2KT9KA7nsSmpMgDxmu0PcMu5DPotEaKQv71k2fn7O3c4I3sH3GHjiEwUXQpfsl3w4WdMH3', '1562102922022'),
(193, 1, 1, 'HdoC0sBbraPHHBRWFZHcuNTvhyqwYgHprz0E0RsaChBXH5olpatsKlCUdFKNTN33wsjvOMZArioVc6Jj7YBJ84AX37bAt0xdo9swUqFUWdV1R3HyWzt6aB1QUjT1xe8rKvEm5QEzuaN87wN2MWOrK3', '1562127009733'),
(194, 1, 1, 'O4GsRFJXF5eFAmdLXA7qw6tCP7viUCNMp9UmHzU943CuapQRE9Ep4jnrxuMANrzzz6cV8C2DxSbVSZvTlH3GPmr2psxgJR1eqISIFgB7JukqHVKj2yDtg2iFhaoAOA9l8xeNmoohsaC6Mz7lUu99hK', '1562164820108'),
(195, 1, 1, 'nKkMyGhBAeIgc6eCYDadqPIxMTLPZagrD0okqUXNOYRikEiYGrJJxoWdLIenLpQ0gnjmGB9iCPvDxq3Mp5RyxBjsUimXIz1i6tO7XCt09lD7d3SMudntHlvqz8NGSM6lAjJqrqShJa1McuNkiueDpY', '1562204182188'),
(196, 1, 1, '98qm2FFQg9S9BYNTZ52Mb2aO2uvT4ZUNnKwAI3RKeoJxElMe4i5KU1mZFO3tlOgAkdop9rl7punDeEnhNCaByFu2O0JT57ZKa7PfkuOfC2ANVqZbnofpTXasksQO8IiZGa7ESD8phmjore8pnJnpt3', '1562210762549'),
(197, 1, 1, 'O5IszNlXViIdGsM1AOsWHFaC0ku5ltfsxMmWsinYb8jQO6mTfLQ4p1VEnCPcySA4V4gYvE9qAVYfrxWFPOYH9Crf5dekbN8mzJYJ7EemdjLVM4urF5qMlBKltqbpULDPotMEHI4Zot4pU4AkxLfmNc', '1562212932636'),
(198, 2, 1, '0igt7W4lPfmLyz9319z7YV54SdkMQGex5C8EveeoYx8Paqn2ULZ1dNSRXOEW9pDM1OEIfxY8VGsQ4nwLQqLeiCLXejaVOIHKzc5GdBFGFjzxojN6VSkbc3hftpZEGkAKnY37sS6SGdiBs5chRDmqk7', '1562214896499'),
(199, 2, 1, '3yZeegX2Su09GogUNWLYaFiCloEbg5mVySZfgtCoajDm9uM6pdfgcSzyQfB2gkG4R3VdbL4Ief7zQyyiFhp1xqX5lnoijzEZmCNCWz5hVpj5H0BvrPwTteBufhDtWKuyTkeVXSLjyKtlVCnExHJzlL', '1562214970471'),
(200, 2, 1, '9AOavUNzO7LBinJ01R6Xz34zLsFX3cdXPaGTiWSIIorsLewzFAVZ2U6ggMSXcrWrw5slrxEuuKAvRm8BdPD2fA2WuepnhTuTvxUngDhlNCIrKtsfsljPNGgGLuAKqmn7oW8iS9WjaEZ61lgw0Y8nT4', '1562215762001'),
(201, 2, 1, 'j4qYURLrMaJKyz1OXceALoShb5CY8gFOWBk6QQ4Wzc3SZK1a121YBzW7oEZ2Wxeq0k7eSgwhLy1Dkdm8D49wzFBjW4a4dvyjrJ5FbWax7oty9rtaMeEvuMDACImW9ZR1Nq2mvCVgzi7Va1ut3KesNU', '1562216118206'),
(202, 1, 1, 'O5HPkwUso8FK3D2D2YJTRvhDNtSiLNAzrWPJJXQ7pAA2vRBN9xYnRMtKLOwkOy333LYovmyZXEPTHM7aIfz3OPQtNW0LsECZw4A0lBXmSVGmM30M19W1y7WwlvqJ7NwTJ0IC28k5Ieej1csL92FXx7', '1562249563226'),
(203, 2, 1, '9wyIa5li60qOOxlXSg4aivFs3m0FI1dWW9WvKEMjsGlFvCxHDWfPoOLkxpCQsMetPxdLl6qjkhutB6a8vaelG4yuxOw1VHPlJPgPal9zZvhHw3Yw1yxwimuonSlj1j7yB6hPAUFsvremgwJF2y28db', '1562266377898'),
(204, 2, 1, 'X1oe8zdEH7UhIcrNpQ4FifxaEYAnUSFHidS9w3c8GTydjqC0me1cNdeJtU0mBgSxoCzKqqir1V3gO3Aqt3xqL8Ntcefpju3BhFW6wA8qNsNCIgA7M0VX2T0wynbYFOzwJhFdoC4aArasDqMEa9q85r', '1562289688340'),
(205, 1, 1, 'Mtdyi6yerujW4n4ndZzjOMCZ3Rwwh9Jgma5A2qQlutajfdgD3nvcD7iYJXZ9YdE3ZDUWWGa3g0ghj7vnT9It5XUssWSGvDKrzjiRg5QIWEqwC2ArVdcGje8Df60882rXwrVN4neVAO3kAqustxYRY9', '1562342133906'),
(206, 1, 1, 'Q5Hx2KzhNhZ7oEphpcfHOqSc2iza0Uafs3MAnRvDvSCZhwN8Ct68dY70EfFf1LdFtXRwLlDShOnaQmGnrPlylV7j6KtT0mfmZMYC3KaglYPzb0nCwfGtcMxaBWyflwdPHA1RLoh3YU1BbsHWSfDzzt', '1562376783964'),
(207, 2, 1, 'nEj6lFrALEgmNiXNdC7ymGRDvUxOhi39RYJZr2q8Jez4gN8G930eZ4YsFrHmBatBU4sRA8fh11hPA3GGiJplRWWPKDWmFFsd5Ev8y1t1tksbs441UvflXNaCZHw3xzZNghJuoNWCNdSr44NQPj0sM3', '1562379361508'),
(208, 2, 1, 'F9ceSHfPLPalzm92Z2QxjqtuCQhM5Il2kfIXr2lndQUAF796WujtEtWoyMUpRfXZVidtWX5K62cLp3NeRI5BGwVOspL5Zpuq5uMmrPw64iTSYlQVLtaEYdKAmWszC49icXljeE42zdEHsC7nWZsA9s', '1562391544256'),
(209, 1, 1, 'VqNeXSXREwwVhTa400r7klgA8GKtVPUA1xekTklT1fbq8A23ftPoGx8zaJuxiRMjzsG5wzJGySnx9yE3s6FGAtKQUIoIDY2ftemIvk461dnaSflZIdOMcmAvzmoOYoCUM9nZVr7R2ohO8xqdkfwExW', '1562393308881'),
(210, 1, 1, 'TtHiZUc3Gm63ZOaogYBEEBdpqTRI330JVPqlYGrU2JM2ndfIA72J4vAtCMeBEubKG01MPKEGEaNik1F69nW77GcIZGyFE7a68RTIPCDTVhZeFOK5UnqVqscuTob3zEktXkGbgIZZFKxcKsxYnJu3V3', '1562393836435'),
(211, 1, 1, 'akeOnXDQQVZqZeyrITbQ2SJydvAIoPj9GeEkSKeuXYOND9UWMohSuQTL3X0bzfMnU4mnSLy73J7u9at0yDpSUPEDwajEzVyfQ85lcHuBq0sGUPCdT0L0N3EDgG8zPEIGgSkVCJkPphKBeNwEBQbdaf', '1562394298014'),
(212, 1, 1, 'GVaWmXSJPj0ZNERwAxKeX97DKy97ZYn3hLaCdw2rg7ab1SArKVyNvLV3Gn1ZxGXpszMO8IXCpDr8RcOSDQaCm5ChIS6yVEs0mgl0rpUUd07x3qiZVlh8NfvPIIWJZaBXpv4HZmPVlxADKpNrBo6ilT', '1562436152614'),
(213, 2, 1, 'FoWUhhtmuOXsDytP4fNMwoQUVSlac10D6XB6aKD6Kv7nj39ICmULihGMXvD68xJ9CWNaggYNMAbGZwimWi1MDjBKTm6SXLUgWLw73wPs5fXdJ2HB3LEoyZvtazDne5h1jnCmvSgz1acWJ6yF5QaZyO', '1562446413975'),
(214, 2, 1, '1KZKkxw3REkCIB8lyrwGJ3SMUt200bieBxwXqDpG20TYG2vzqT9pxIIot4Rcwzu6dbXS6sL1EtGmvRQEsjGtSgmOloZeOcrNwPu78zUjeAAiJJ81GZFnN3Gn2x292wCs8gZsiSPD4mnBfY4HIUqRMw', '1562451824986'),
(215, 1, 1, 'jEffAOMXrYo5Z3KZ5qR4JebTRy4rQBSgYjoGg2rkaphVu03bBqd8z8yoGFlklQZ7VZE0TDbNtRoWHdQ9s2fTOCztsDI3CP0pQLzMd28R5MYem2PMt3B8WiNicNpqEAFHUaPPCN4jyANd8QJkWjtcbE', '1562452033626'),
(216, 2, 1, '8zc7LG3YElGjIm2NsxenpftfQm9F8KPTHjmZYDtuEc9ErMKdt8oH9fPmVthtIafnZ5Tgn0dE0Ofwofm3pUYHuBVs63ALB2gBPWsWgAhDxPmeb03HNAJgAKCUDJrB2eF1V5dje9TjM7nJZlTBgvwLb4', '1562452425397'),
(217, 1, 1, 'mFV3u5XFY3gl6WKZZy3lD3MDeG3EZ3t0n6kZBNEYrPWwiopgHlmZiWQu6PMmRICHR7s5ON5MYjMLWziTmgMnOFeWw2OGptTArKdfjQvlksCfDpQ0BLFJDcaO4ZJMnpX6weCllxxLyasUUnuxcfE5gi', '1562470638813'),
(218, 1, 1, '1naggOexS2LmDzB3XWVZk68rO8GWY1Lc5cjrNKWzeCKjxssfscpGSZgsNSif0K4Q3CG85HSk74kFZLAuGf1mPghA9I5jYGaSfv4KTyEHLH64TvlWUQyxplrx3KVGFUvNPqnJtyXm7Fm7w5hU1IODeB', '1562519402960'),
(219, 2, 1, 'JvKJDX5drdRVBmzrLLGErloBJegxZgvnHWlihSpBGvrx2x0sizsOO3tcHDq9ZKKb71thRQOmldx6EeohY6pJo7Ku0qPQRsERSMBgtAb6WVVP8kIavMMekIZbo8GF5H0z6MinlTBQxmED1vYGzMedBK', '1562534974954'),
(220, 1, 1, 'uOyKxrHx1VfAXh7CZ2dCDKewvBKyUGy3Ylrb9FRB9gryzQBApPv0bBLBwsPNfborVo1Hm3hfAKUcOxRaSNNe4Lfv9zGtsRmUClu3L6o3jNQMonPBLGcXcc3ZfZIyT00MEGn2sB7xzABoIZFTlMDpvP', '1562590966855'),
(221, 2, 1, '3rUQnImX4DhaeObFez9QVgGEWtp29A9UfyclyzaXZfP87Zodg5Q0Yr8leY5gwRC0OwNnVf8sqfJt8ehlNDvSXMO88k63tnBYBv02jsfoYyxJrsGohZp9L89y33cyimWwi8PRDVcedIz6xyjx8GuECE', '1562594532684'),
(222, 1, 1, 'ngb92yrffbQp64VnAPBwqLBck6iydGsgazWRzOTwJBoaHR5og25R1PmmmMLu0H2YvwRCRmxCIaTUepBmuBgzBGMCCXMRbuy3uOpr8is5Prm73GEZufG2XlbwQzhx2gApVoe1TCEpw1GulOtge5IhfB', '1562628649885'),
(223, 2, 1, 'L9c98bJ0G03jtpLL31buHn1oWKz9p7Le5N3Y85Y26s6uG7HvjJdztcQBjDAsIXnlUW9aYkBSotiwNLuGjbvUR6oRYkU0pjEvRnijvqGSYRIyMNsBBWcAdgwxRO9g0PZ3Id4YZ64AFyIytUTPzIMNGp', '1562636582417'),
(224, 2, 1, '9Ue5ZiTgSTxtWcqL9t1ijRz7Odu5DtZa8yWuj53n27WiysCHi9pMzOTplvS4LSZ4dFgTpW6ISa3a2wT5i4yopf9iOtwieCfehozDGzDck6uceHv3GUFWdX6c1sTeNNmHZf54dayJlCrWW51ShAJPfA', '1562641665787'),
(225, 2, 1, 'ungk0eakNT1xrDoB0OfATNDvx6B2KF0uQyMsWr6GRtmJV2hwrnJV7MSscvUPOgoYQO2KjcQOQXzuL58GsKgUjutcJTzgPCQhKuCwDgSqdtwLkfoRLa5jxTlga7EDIdJeZZqc7SKjITV2BOi1Oj21k6', '1562700164891'),
(226, 1, 1, 'YfiyCfMEiOETAdkaYluLDwFpiM0FSIUYylzF2EKRuFLBEHi6D1xzRURUB4aFjwk5qwjhKWD3vyQEd8vEU2DI9f3020TxQ36hBMuO75FuEmElY7JCFDWtftRB9OZSVVhGZoQqe3GiKyA8ITprmKnOyM', '1562700858437'),
(227, 2, 1, 'M91TkZjJOYU6WWKJr1CCrVBPC6OJNCVt5LgAlWmD3NsiUi8a5YOTh2qWZ15bZz9V4ZN7zxc9k42v8zRfsEzaBNB10VQVtU5mk5DHAUiTmowbHF2jHk8p5SiKpswhrbUDPZOOcSApfNpUQ7hiXl7Sl2', '1562709785833'),
(228, 2, 1, 'ZU6BxoRkxlmOOehOARbaj4kJk22giD0246WYBZ1bIuTBy2Io5y83gumjjFcYK6JcACQEAx2WhUAMjFb4USOqBDUU1NcxncpJUUKQCkapm9Ajssc4byrGL1UuMqOi3l1rJTo95fSUC8RfhDCAkCoUGi', '1562727283497'),
(229, 1, 1, 'MKNMAJ04jmWVyTCZBrqDrMkFlguYqqh2ykMOkVg9ychWeR89tcr4U9SU9thu8hy5XEx4S4GO2OtDQu4dQ6AAtCC28zNdrqsr0p0R4RqtzjGMhm27CjrQYaNqc3euUxP5GJUr2ydiP5ttxGmYAkauaT', '1562769337009'),
(230, 2, 1, 'Vdj0sp9ebI36RGKd1RSMoAUEPpGzw96KBRKMiFKqi2xO9SO9l8X13Es84ymytC8rxh0ZWM0etFJOd8ELOWrGTst0SXJHwQadj9XK0YxpbePDgFlzSWhfIS2UUC2EFzaWDEWQ1VyIDnVufn2ZBrZzzD', '1562770292467'),
(231, 1, 1, '79UKhED7EjW2bjt9bLxXywItWQPOVbEjikl0aXRmeNAXKCmxjXbdIOT9pfqQeP1LAHLW4hwUXulPCHsQN1HPcGmYZtb1na5QpE8v0HiD6gmIQeeiJijQLwUerkb6cx7b0gEGqwl2AWQvEvNuAZiycZ', '1562807264986'),
(232, 2, 1, 'EpXaPqw2AlMHZNXHrTrD4I24cFkGInVGRPglS6MFDXqJ10nMbkVBHPw2oXN2z1KLIH3zNtSuGkj24IT01Ddloo1K8ANJBrV2MEyWPrenxusFwgVJPrF3Sw6elPtMQliRSF11V32iXWdrVdtGIxfZaY', '1562807691698'),
(233, 1, 1, 'LqKSJFQ0cfu3e03xi8ArHvXfW061uxyGNe7ula1cI1UQ9wNPNXuHvkOflnzzQuUOTogx8N9jMYPXLflkNiTjBqihLQ4DqAJGgkGK6WMauAVGUhBuhj50bYZ2Ly7KtWJr9PLYhTtlRgRDCsvOlkm838', '1562867386748'),
(234, 2, 1, 'xDIfKPZVmRPKOy3VSFET76MxCrJq1JJPUr9Zq8nNd8l4MTsclH1Qum5OdjEoaq2Au5N5IpsaUGp6Qz8ar4aoSQ1cxtiGAbggwX9b8XBz3onbf78IobHXRcgcYfkFFITGrQltyKbbIwYiVWRZcDQ9D5', '1562867885174'),
(235, 2, 1, 'lD5lMCCPgb8Dly4QFh4n7LK436IrGEoiPWuBSmvdUtqhBowSr44cau70AsX2LtH39NjQRKuVjKOpKrweWgzwIiIXLpXAZhgHRPdpH2uLgp7cxZdM9YqVRAdcYdTNJd4bEOw4znEs7qwLvlROkRWgZn', '1562888973266'),
(236, 2, 1, 'fo3DD1nhUEyOtMC3FmeD6a8TPqsrkWnuaaMpRhBziNe1a4540OON5PVYo3wYppTNY6hgK4uzxnqRxVpgPy2mreMOM2UVCkNZqHaaCKMevEaPnt4rZyxf0B2gNushJXoaSSbWud415zgFOrZDQCedKU', '1562889101413'),
(237, 2, 1, 'LGTOOGMP80oGMNWQZkkqlmIwhDk0Q33OxZhqDF7hV7QkpcKGDOi7wUmz0y5PoTGqTM04bbijWVC1MCQWnIwhc5PN3ilh78HTU46eUXB5mcCcu8A4XxGc3lAQg9YCFhEbmETpe3r4d6knmDp0ElClDq', '1562889176374'),
(238, 1, 1, 's0K26F1XHEY5j0XRmiLfjETPYgKNvXVHc4C1JBLs0TkzFAhHYAWJnQMYYERWQlvPTpRgrCdshbTfibpP2QmZ3Ym55tJ4pkLzeVXuCveIMHzGNCjiC5FjQbQfKsV1Gr26GHoKG0vaTiTEbm2dF5TlaV', '1562940218915'),
(239, 2, 1, 'TSmImfg1sb909nV6fe5Ul9uRHty85giIrzItJwzaD6yUpu0b85bgbJOH0sPovR7B6dxKCovlZqEdGj84rveQa5Po1HZPj65wkcaaaA1jEgnwRWuLyBUsl5kzAPJ0bslL9Co4sBKBeHYP63DPQBm65b', '1562950466179'),
(240, 1, 1, '9wzU7gBhVFrPkL5EL2zL6TaAYIjc8Wp5QBt2cSO0O0TS6HoZ5fdXFm5LBK0E5iCNQ7gJl62ATLC4SkM6z6AyrWwwIO7Tev3WOC6uzthwKkr5I68nSmwZc4Czdw3iF1vvrTUTh7jRbdAsIYUDuBby07', '1563035456090'),
(241, 2, 1, 'y0VTZBTEX0vFqiRgZjlsUoBJPBYdm2fgz681LWEEGBTEesJ5RneqnzujVbtPzHRtNeA5be6kqEAGDo06RSDCnu0r6rgrYabp8sRd8KPqxGCZ86uVH9Rvhavvok0P2a1YRYxEldu5mWQ7ixSr0ZgPvC', '1563068476143'),
(242, 1, 1, 'QuI1xDwkz5z7GNyAiqNWG6U64EiT8hlyfI2KCMFeelKKiN2UJT8rYf1JDaUouKlkWrC3Pf9M7iG6GPzBRYFxgrO6MVCYOFc1iQtMhiG2sv3BdRzFBLTfziLRL54kpBfWlw8cm7ol394GqEQARS3SSX', '1563124347887'),
(243, 2, 1, 'zB8Lo1lpgVzwp28VDPYSpJi2va2Z0tyraRCwvOi8V7rDyDKUfv1vaz59j2a2LSB4gX09HX7Uu9l4jBgPpNRBzfjHi0o7q3rYnRICtwRBHP7YPNb2dhv1ISx6LjoxUsJ0AfRA5vYkVbZevBhIbqQOPq', '1563125576691'),
(244, 2, 1, 'uydB98leCdyarDUNK5pnoKcsjuiCOyNRsWK0Gal5YL4V4wj95J8sJMs7GtMYbyjtX3PiM653XOp5ZhNEd3mGTCpUFOy4oA88grhTD1K9Dv43cCXyf1g1nFuBqAAbofQnQ45EBrBUBSPvmUvJrlCdD5', '1563129119904'),
(245, 2, 1, '3VZ9Ewp4GZuT1yjBlMYEseIGXuFsE3Pg5LIycRVRSD9vPIZrOjhfJMxpWNUDGJDeKSktSJIfEx0hB90RgoGtlbeooPe3rdkcStXOZTxZzDYJLNNLRFMiARE4dsLlRHh0IdFpXkJY9j29VhCfDv76or', '1563132361374'),
(246, 2, 1, 'AfIUe8gxbF0AnIOmZl8wZ4abjwgnap2iLL9vfPzDORwB8RUyEY4FD9TUFiz6k1A62udNUBVN6E4twTRFEjc6fVs07AHkPSTSsJUhUzVU7H9jelRddM6K2sheaRmF00f7va3PM4CSQqNWmKgjN9CXDZ', '1563137034897'),
(247, 1, 1, 'wAvgRj6DvmuoxhP4AcJpnVRjv3o26WhJRIisp3KQd7piLKgCRfjvkxX9WtGHN1TbHIw73KF1C3RWDuMoZiLJXhWU0hJJkfAd3Ygh2kJnadSrDKA11PHMcvwYWgnY0qnE6FDL4mpfe3JNiStcX2CdsO', '1563574678106'),
(248, 1, 1, 'HKVCCQnoO19WH7Wblm97qws47QFXe8fF6L5NMIKnqaZjKOC8oQujBFN54SlrEPUh2YkM5hY4iCK4U1vBgROFgeQCWmKRARSPwNkK6GkMS5PQeJxu7PD1evGQDEQ28mg4UkysMlYAiAxlhGUUEdfUNC', '1563653835269'),
(249, 2, 1, 'WwOlo2eS7EzkOpwBh48hDmQiA2z8IiAeeassImOqZ2pcIMSssOuomJlWGM2Pn8dB6Px79lqH8HpHn63pW3uVNm3KJtqMXavwsAJXpUD0AbXuwd4RAA403aLtxNvSSsCh20B1SRdQzdBZmwy6VmdIFk', '1563654061631'),
(250, 1, 1, 'bzGARkCv983GeKi79jJt6b3u6j8uJuyYYMDFVwolmu4pyaN6smGgiAugqMEfqRncg09ULLPi2rqk4EdKZdJfIC0iSvo5LbtEs5UGThTmpaLnAiMpNNiYkLbV1NDvlH8To58WHSqSF5C2xipzU2DLl4', '1563991863382'),
(251, 2, 1, 'WhCZDKVV8aaVNWqsckcQEUDW25NnYPYpVRb8qxNQG0S8StuVNU8oQHmyRnzAnzJJePKDslBpeXcSOouRDLigtxiX5teXlyVSSmig0c8u7e3Bkol4KY6y7PRVvrHQkSmDmk64m1oUNJB9AHExVbNW0G', '1563991895867'),
(252, 1, 1, '2DGGMkOGDqyt4OOskt0i82oSq1uEUa4IU7Xk8J3PUimxKcDlS0WWyzukugQeJv1bHeeSJAccbR8bl9MyZzuu5v6D1oN4KIaQhqZIAAKBCO76n17GqxAQOf6bTU6bMQVeFkHlok60bGKOLiV1ixiRia', '1564281879139'),
(253, 1, 1, '4xlYRyzWnVv7qI6pfcovuiz3okGyp52raOfJathxaJsyrEyRfrBlarBQakSqyvbgYzWUSbYQEq96oZRjNkxgZrjDKGWWB9wGOw2YMsGuPrcVYhD2jlN88XDXa9RxQlPtdKeoPkSLCWvpQ6DP1KpSN0', '1564788053945'),
(254, 1, 1, 'DH7XIYEXYREIL08pB2qciag8lAoPahMxfUNhdxSE0g2SEy4YecobGiSJnWUZ22kVoxc3lxpiqK7q5dkmAz2nNUrWjHqWbeG7OSRUCyJuAh0SsllFtpA4AadKXBW4GIVAckQfxogsfIAkPNSSgGbGzx', '1564794997836'),
(255, 1, 1, 'XxLL8jAap68vu5pUTLORQ87F4bevEXaAXYeFOknt3Z06u6oToxab10A99NbL5CuPd9xgJlQlsGivsDCq8wkFyOGQyVgDWOroewjKhXCFkSBv5fa3csFm6V03smpc6AWEyScY8WyufjCDKKStODu8Uv', '1564864858536'),
(256, 1, 1, 'q6fLjqHGlBcAxsbet917w8XJBZreTAI7bkftfKNgsiTyOqu5pRrWaWd3jGqBtuH3qMaZtL2pATM3iIHDXrfWMc7ZYOG2IQlDNMCJV7WSuAImV0fkb3MQ6V1KIiEYFta77WEz1zedK0597k5s3F3RQ9', '1564865902266'),
(257, 2, 1, 'mkACUjpnkG8bVMuT4qW5f4r64XhMebn2e0IPf89X3QRctSnEWRlyPsb8yvLpGDYSeAIxhhspa307uqJHl1DCzMAMlAeLdjfKNUgK8l8lJooXMzoE0G9FdQl7UkkYfEqz6Y3g8ixlPEbFr1qZaPhV2E', '1564884747285'),
(258, 2, 1, '0VBq5FDnfXLYVE9cWUfjJ6desl0WOxs6YNQCxIZCPvAtL0a9PqCk5bxwZToQvyeLE9uUr1xmm3hNojrsSgAw5UUrcX15SoOhV4LEi2wVVXC1mi5QFb8Q2aBvcuMb2wFqYNyxDwDucrGYlPSszcLd63', '1564886265837'),
(259, 1, 1, 'bnK5CzoOMkKHJprOtzOPeprfgBlXS6PYCPCr9ZT9uaS7sudLmzkLkXdbDOLU9hsvmvuiDaBnWH2G8yh5BvJY0jadQ82ib3kv02MKVEMDPasWGdW7YmyJmrbszapnmLBjuPGoCP8hBL7T9ZIhnEjTBl', '1564946045456'),
(260, 2, 1, '98aCBEakWQ3mQ4AKP96GdhNCrkZtRdXLCmqS3XOesblAUDcfWKCX5ZZrkELL5kGEAXXT8NXZRaxZlFpFu21bJl8z28cQIfiJltbtBHMU0R4Amy1H9d89wEkwca0vIaPSdtiHF4zTUg4pVWfE2tP750', '1564972380772'),
(261, 1, 1, 'HeXzsC83lTELelOig9gVxZPX9ZrBKoyly0xbNR7WrCjhK13bNfaJel61VtpKdrV4JvXZyCv7KCMSonf8QTwupN6HXA9AlrqXZOZB2EjVRbwZiAMBiiEdJbk7Xce3Ka3YlLHey32EYQLAPUS6PFzbEI', '1564972465420'),
(262, 1, 1, '3TPb64Lo86LtiBBzWT4anU8dtlfOf0HkwJr4EI6Gpf8LyKuu6h1cOk8YWkjUYoswahUBVruYIhKsNnbiXmsb44epxujJHLvWi8uSYCEOKcJxvkOYuvnQgbiacBMgIp10Fp4JyziB2oaUxdPypXeYig', '1564973190315'),
(263, 1, 1, 'bCw4cojW6ksO3aC1fyqe9z8jpuxp5zAdkAUGf62U8HVx59aUp8CDdSvaReQFKz0BInl2fGdpZM1AMIE8SjUO1cyPwTzItNCLUC5luS9f5d9rFKTMy0X3kMXA6fMK55k3UYk9pbnnoiq1KEwgZDGVU6', '1564976336584'),
(264, 1, 1, '0oVfhg4wdnKsSAO9mwIPbAhJyctWsHrl03rgrZRtqowJncutqAjwDGLcv6xSDx5i3VCGBLMo2bH9z8UkOpSI0mqRZiXs8wAlHd7jDlEY181jPqTdXn72sLf2aRiXzOnC7UpF7n07d8i19eD1J1htso', '1565024892328'),
(265, 2, 1, 'UtYdhZhEDmIfxvbZAKAk2EgTh4qvbpJTsh6BW9sszx3HSgy9D1yIkxCzygQET7mW86t7gCMmVVd8n7hro85CiDNunV6l0xstOs8OsMjVQmC1H9IAQNEjnIDd5EDo4dC0DJq5x4FW60Se4Vosp23iJK', '1565024941833'),
(266, 1, 1, 'qGq5vEeoFDWGX1CVTi9LIlkppPGqQQGQF6HZNVwAFlnJhVkTIvIdHp31p68TmqBw44Nabp2L6nYvGziyEGumXATZzGNF9r9gujbv43hTRJLpDCLfxlQex7p7q1MZwmQpofS35gOMSbVALd5AlOMIGc', '1565111864403'),
(267, 1, 1, 'lUVdGcxotxMhN1MHu87khZcMxUwYdDvEqDCqfO0okGDZI0ueoBjcUfuw5oQbE4FJZXDD31Nz0hr99wv6mdFBObFebR65iQ2HafILsjJI0BLx3P3YrHVwXP2U6KwDrhwsc52XsPCspspahmtO9uZN0c', '1565212272622'),
(268, 1, 1, 'BWvqkSL3FqeqUL8BraJBrGrdUTqOs7Mr4VuMJv2VUhKmfGILXTojhAmOX4jOMr4r2fZSYSBa6TzL6ehUbJzpOra5ckQSsMAWbUrEJ5ZzSWXo2fhR0Cbm6yV8lxz82a7brWkNVJjYSyo7l2BajWvcF6', '1565221070704'),
(269, 1, 1, 'qsq660VLbbiOpGUp4y1Xowf7UooYVFSrOSgtAeFeBpZIuEPk7SPDZRWxjnvhz0FOL1HvPYbtQbnISfBNVVWnQA2dI0V1uViuuLdJ7D9a1yLUBfWcMr2ql4LnJtxF4vSA8ru2G57DBfjPfGC8cz2x7Q', '1565232513470'),
(270, 1, 1, '2ICSstqLHTxpV9fUMyz5xBHecDw1f5TkUt7XzbTLeQAkVDHc4HByX5XhpShjtqchRf8LM8qUSTSkc8f6vCxyWsbVHdWFRswkObY0iJqREryl8AiYrW82Wg9Ih1uSfHgTTpGee2kK9eRlG0IHSX6ux4', '1565236254570'),
(271, 1, 1, 'oEVBi5QroYBKGp4p6NJp5CjJyzOZgqCx96ULcoKyA7J6QQCxScF5meygS0jgVyn64HGNsEV5zP5j38DyJk6eMxoOz9F5TN07s4JaQ5L2QktK2VWqzxLBu1cuUQztApC96JOnU94XA3n9doOQhyDcJb', '1565288900087'),
(272, 1, 1, 'kVdqaUwJnp73kSAPUTdEONMYpXSxx56YhgawI242X1O2gOSPpdtRaCLhdf7aT3gTttuPs0ksjxCHJwmFhiWWLOLSJb9I2h6IHtFmzs5xyO98jvo4aEf3tee3KlTByDzvVBs9sHzaT1Lj7p4KMA42ju', '1565313461014'),
(273, 1, 1, 'eERzFTQqH3utuHW5GTKpP0SiVvmhWGUmv2uoZEmSMdHgtl7LeOFkzZ8Vd2FKVrS6AvWlyyRhHVM0BDlgJJRQLYEhQCMTbpHIp2xBjEe54Adh0PZ84EVwQxljU7YzX65KfiwLAwCOGHOaDieIZklpnW', '1565378728033'),
(274, 1, 1, 'yZrNZaUIu19nKtbMVfcZjqZRtqSTDuOuneKsARs6HuPTmycCwqgQ58KamDdR5lzGfk0ghL3NhcqoX61sg0cny8cVJKlaWP9BvljHafhSWZf8YbbmgaJWs8dysmAFdhOPwnEzvSGXcPw1EybDTS8t8i', '1565439493020');
INSERT INTO `security_tokens` (`id`, `uid`, `active`, `token`, `lastActivity`) VALUES
(275, 1, 1, '1bzZxjR01hsFyYDWL8hgAsPpYwztqV3A0fuufg4lnjX9hS84LExCBAt2spSxEJdO1ZsA8KkapDHb66ydAzN6GSGukhWYLQ8rfK0RVJCzGO6WOZUNHmOJjY2rj7d0ga6stliDD3vK6QsmtZHCEbY8dx', '1565441938634'),
(276, 1, 1, '6myoqUt8oOl3w3TrkDekMMSzmPl3Bomesld6IYWI2HYOjQSyLsmIrpunhluGQImJ5SRHMIxblKmtfubMF0IdxSrGeHhgPG4KSjHT8XKEIgKY9gTgplp0tOLPHv93eU1uFJim1UVIObdTAE9GWTw6nw', '1565495263748'),
(277, 1, 1, 'UouZ0cvg4xEXz51FTcgpDM9YT2oLiTJ6eZ2KXZmrM3NQxB8GDecohc8pzY4f6KDcWcOMGQBXWEk1MuYEVIIKdWpBsfu6yVCNFEG4y8lsYYndyEI4aX5sb92oAlEqCCn6hal7OkfXz76d8TWfH4FEAR', '1565532790043'),
(278, 1, 1, 'spXNq8Ft9I7aMgA7wGYK7ufnBwtzho5JC2mgUpuQpV5U7QQbNzoWxRCKOF8OAHZyjFNHRXzbbsprTUXlyOEtZX7W6d4e3vf0KU7bg5pm7FHRVNZQp3qmtLCETvboPg0hLhMQehcEb3aofWvr6J0xPx', '1565618958199'),
(279, 1, 1, '2qrhcIAE0FhFLC3IIaa6K9RambbRGo5mJSNERhuiIzJDBHPgiL3MhAtbs5pf7g0gfzbSc43IXJNeVWJuW9qkS5M8OHDy8m2yyD4w4S8sRiEdO8ctvkmdkk8D060uGl0VaCxkNjUp4dXmI8JuOw4qLj', '1565639596206'),
(280, 1, 1, 'BTQqH0cU6MB2hzUKXWcrEcyvNaBzbrp3oi3XIu57viwqAR1hyURkpaONArZmApCxwUc1lC1yEXTxgD9mNGXXMd8OFpdndFja6VCz43v7HNjNSCFS6z69X74t3ccVZAJH7CsLVFa8hJ51ZFQcm5qZdO', '1565707932215'),
(281, 1, 1, 'E49TeWSZW2gBRmUy0WSF6T6JNP1oZvcvdFzZYp2ec5sn0B9qIORVYizgmgoLIsUbTANjtsjOXLyS896p7VcRudzTzRtevieK1ENWcJ2CKJIcdmXPNmuWyE36siDYkUOmGUj7jiy78Mwbb6TLNem8CW', '1565799828882'),
(282, 1, 1, 'OdWVAlMH8awhK29wIPCJ9SnfkP1bitn1E8fZ0U0pjWL1ABMVrO4klPkHZmwFbJecW2MDUdeVgvf46tvxk8AZW8srb59xB72QVMVmajvBs32HKWje8i7XWex8J3gRazBGCLwrA4oPQko7n2PTEHW5AQ', '1565894561551'),
(283, 1, 1, 'F8BxJksZqcwICAJFe1UdBHEskRDnEcg8jCO16BosWgPikxmkdxMhGbTPEf4T9pjBgYhMVjlupfJnQpXOviy9YHK1yLMihzAcVLB7An5bgNv6sP5kOB5tDYTGK7puOyt6FdmCEip7WcCTKJj8VBabds', '1565903697861'),
(284, 1, 1, 'TWeEMXVGzDkW2OOc7LfITnmvt6EwJHJHy9R3Ubh65ePeH9wkN9xM5sGwjqs5msTHM6mEwINzjbMm1hoMYYDl4atvCznvjWACfRnGLK2zJib3fFVTIruh4M88eTNZO2ZTXrLkvgxUi9uPOIbWHUJpXK', '1565983322591'),
(285, 1, 1, 'BSjiY2HwoqCiSMqGlUaJkulwcdZoADGVHCxoYOcEXN7hrmy7PuIr4So2ZFcsnHPzRMAS3Wm8MQtVmZa4Arb9Ar0AcmhuqyobcQ9CJKo5L9pOa5F2iJDJTXXfxyEbH4ggpu9Wv8t85QDLkIXT9Q89aZ', '1566070284352'),
(286, 1, 1, 'yIr2S5wyLa4SIPL6gUVLC2wColjgKAKAGVCTy3P6ESrp7k2IpFdjAH2oz0cEfEC3U0Rupu4bgQUZsp1ms6fdszoXHqsZFn6qu26e6ISmfvaznneXFktnhCCrcWniq8b770tM2Mwxkq8HetwIgZG2l2', '1568829665846'),
(287, 1, 1, 'vVcAhVgXZs4D9eC13cteY0IFAriVsTdZPAhpKRrw1q47BiwA7AkbJZXRtTZrBzGeVTf91b0KrxdfP0zVn1Tv8AJB5dVVsy2SKSwA0s7lGx0gloORF7yg6RsLxQlvxioGMCqImeBDRws3fZ8XUgBgBR', '1568859766522'),
(288, 1, 1, 'fyrXoxIbGPJmfHSttRJ9NquZ3yaDeRNIOYvG3dV1EbOEigE0SwZ5dZTnw0PptaKY8yenQxysvp5Y7ZoGCNa1xfUjggmIOiEZ7pqZ6Mn1o3zBPndbEfAnYnZeyHhBeb29yIU6DCY5dLErs8BIGyXuws', '1568926830410'),
(289, 1, 1, 'CYygeSZkMaVZ7Dh0f57wD1coxDmGcD46sy3a2SUOdOhUcTz01bfBYijIsLqIMNfRVXcoKM4WASUIWD23iCoyRGxQHptw3JxLlNjdrFSE1TxtAQhGdwfaYRKuEz0aFm7JTKXGb9IflbndmQhxJdvt6U', '1568998330316'),
(290, 1, 1, 'wLIWus8qL6MpSRbbXYt8UMSZxqMER2BlUFVZUQH3VJgVq8RtfMjqm1SIDoHCKLrRhWix0IhgG3WpcMXc1Fl6rOS7UCjt3NYB5WtDdzQPXVfLWKwNfidrzLTq35K6Gp4LqO2yNEiLVpoa27ypPpfjhV', '1569016575736'),
(291, 1, 1, 'AL3JOpTdtoGXwwzeQozdpsabCNP8hxq324vThIrM5LyQEBcqV5QVYrZOl4cFXXF9o3AmfX03nNrAm48Okgk4a72FheZuhTM2IjajWVBbIB1yIRdixRmnddav619R5eaMWx63nO42sDOdgwnbgbjLnp', '1569115409393'),
(292, 1, 1, 'Jd9nzc9k2elqqjUrbISE4jFCNAtvG3oIUnNPdCRUBQNtqTWowsqehZHhZp3oHVEzmSNBh0byAkIPlmHNQMv3R2IvsnUyHjjC3lSfCqDHy9Q2pETfrnRvxV6j9iNC6mOYnqD0xxJc3zZzmSry7hGrCC', '1569120622473'),
(293, 1, 1, 'GxLkzQrfGaq2iEDAnL2T1o2NWgYBwCSVUEI2Xt7VYef5Y3ey5ukHPctVQZIPq8IuGVepL35UVcGpDymPx1sIpbpjIHhX27JaWAdy7gVMDiUy6b5avToWzKTrqotWcrlk4DULsmloC9lFWTTjm9gMc6', '1569172869912'),
(294, 1, 1, 'zN8cR1XRipy01RvVG6nVRObzZe8jDoPsjtXNhB1SAQzeXtIRffjcJDgupAPcBfHexhApttvAu94ICMOQO4WtpK8pRJRHShRkcWkW4qdsMaDePYkJxcIl90e1IYpyBZ4dxTbfhuGBLX0DBd3f3RCeVZ', '1570296266353'),
(295, 1, 1, 'OJNoUk9KQ3sPhN80zMutIty6pwroumWzihzYjPMkIiFMZkAXbtlfShWwLTv64RlZ5eIABRx9NMupzvbZhOtjmqOH2m0KFSYb7v6pXasyhFpwvm6ZwcBPoR8p38gvUn9zo88Qz8FVkCzTS8S8Nvs1cL', '1570390710769'),
(296, 1, 1, 's3HpjaXJlHJXynl20lQ0w0M2ltrPXr4Zq88radEnvlznlznXgAD61BHRrrPZvGVteHquPnIoSOKbLfcCRRqpKNgI4AcU6sYiujimuyKrNkuhnjKNY9lnoKSD6p7YmbUzr3ioVepak9ZtJI3EmENMS7', '1570414219184'),
(297, 1, 1, 'GbkiVUqPZUNDhz8GKaqEYbC4qrkODNlOrBDxvyXqGqmjFKyTtzKeUw8CeTLyQvoXRxXq5eL7UY1JXCiYF7ohBfjVHfjDHxVgqrLiZwWLD4BOG5NuJhFjZ9S6MJAUdiQq13mo1oYVTGkDg8aISGtZqy', '1570415099668'),
(298, 1, 1, 'hooOtmONd47JoHL0pbSTUoykJu7XrShLbikzA7R7R3ouGRxGTXnhHYoq3ed34WGPzVlC9IvrvtCyb6UCkooTRBWvB1uGQuxeDhMDam45poKYZZOBNdwlSHUCpKtmQQ7bCae2dlHNrEq6eeWRGGRHce', '1570417634541'),
(299, 1, 1, 'qfkK2iznWrXtXwIufooXzkPDTkBRUVQbP0Izg7j85VB97U50vAywLFKX7t9Rc5z3aZq5UuOqWkoyCTyZCUDLO3WHQSH1NtMFbY980pO9hENOK0a25Dkm2yD805RzNphEzxjrHXDoIxiCCVVmoOh0FO', '1570501348094'),
(300, 1, 1, '7Y48OmbhJRsBydsDrLpSXzJuNOLFcHLyQEFRzvPPyoTTfGqTwn4FcbVa9aHJjF8yQbTDbEfVbiK4asWhhL0l3FSJ41nWNd16a74cF56s0BnKnXsfjf4jmGIU7dp8E5SJejhJ37Mh63rgXOKyEXYZLP', '1570559355638'),
(301, 1, 1, 'uzem3UZ2vZztUoSbw0ZQXX497I5YG2yjMfsNi5YJgprPokxqB5pA5mXYelOIxHe2xd92YKtCs0OC2luOoOxWiBcyqqaG0JpYp3TwR1nYHvCWdbAxdDpsBx3LdR5sI3QQ52bcmGthX5Y4jkeg45KqDl', '1570569333983'),
(302, 1, 1, 'SyEsT43eCzgxCNZse16qxPVlWIC5npwL6XsKpMHZdWxL69JFXwf6AC4uft4PsSSkALq4PuhjuLZdSRD9QRpzcs6tjGnbygVQ34uDJMKdJVvplG7FabFiTz1PPRE0dV4RiUbuJdIlq68pgkufXRQ89l', '1570645099185'),
(303, 1, 1, 'ngjegvsXEXjSNQCmArj0S0d5u5B8vxLAAYPnCxNmBMUYNhMwaN4XQta3TtDKb0dMlwc1xRu0q6T45CTrMMxS8RaKcVTVBSAfkv5yFnZTEChS2CL2MUkcbTVWfZFGCTJ7lh8WQqa5sn06Im8rLBK0kN', '1570667857473'),
(304, 1, 1, '5RMfRVCPsH8vwWn7Z6BD6lFSgJsb7fpUGjAMswmQOegZIfXAsa3BBp4b6dVFgemFDDpXcjoTOOg4zjiVq1cmNH6VB9reTXKfu62Pwsbh9Er6DBWTThX2fD7s5nwBCd5z134iLUe3RuuQNyUbYNzO3o', '1570726624425'),
(305, 1, 1, 'ICAOfdhrFdqsQ93iJ1VKmyoMHNJMcwetxUGRmaT9y7zFfci02lG1S5ocTaSbkzdCUIsu398uaKLY0mq9Y8M3n4rflFcQCtPoJu8yVKigvIp8rj7VjVprt8HU4eHvp7LLyHcKkcMLHjrjF2IvcdAzNS', '1570815408713'),
(306, 1, 1, 'wSkCySxUSU89Is3g6ReQoRpdaymsiZ0MpcjlaAc2LXpfpLbG2soqKnOeJuqGHIyztEQDTPHPTNytE9AD2aMIUw7fDNbblNRPm17u8qvOvcHFbvtvbLI99cyNfS6rFPQOF3m4xpT7nBd3wZYIQoyFB7', '1570889109205'),
(307, 1, 1, 'yjzsIPIw9ujYf13apv0u9PrMbryyKZ4ItRwniVj1elp4FIu29IZi5qIkOR1bY3ynTQ9wrc7buVRZ0KnJENJNhZRTGd7ZMMTi6n4iqB8VvzLHrPrcIPInE6cbTx827FxT0D9jInoq7UF7s0k8jnqc7q', '1570897020165'),
(308, 1, 1, 'DcIDKjA8heu5IpfRKYcpQdmGts9lApPz5Q4fPHChwh9QYLsP4DYghwgrUaf5wxEtJXd261s9RdXJp1Q1LRxf2HPHtXSrg3XGD8ivsICaDzAGg80HKd8PsjDTk6dE01BTvMXSs61d0Tr1jlUl6bLGbD', '1570899744524'),
(309, 1, 1, 'h2sFPDqjNy9BDjFrcxFsBwZlkXdkgkL60TE3nTPQt37qrFrdoiOSsIOeAhPp3e1e6qmfJ7EChYCI3S9g9PUiGKWFcNHFQAFFis7jIp2ZhJT5zbLde5twwVj04TiOq2YYEGP5LUO2HWr0rv2ZU38zYU', '1570900040750'),
(310, 1, 1, 'rfILEgbknxW0JJBJTku3rMEzq1g2nUAAPA75ZT29RiC3Doo7OKJ6Js9H6Lp1LVQGMkIZJQ7E3Dn90xXIAEWob278nL4ZGQtKKfAjCncijUMlAA26pLszON3lUhDzro16T1trhDB1d95DqaCM8bCY3M', '1571160616468'),
(311, 1, 1, 'jC0qbwL0E4FMSpvCgN2ar8fOdX5jxlTzkB6IdDDAxsZy1bIiGn0kqtBMf7QSBI7DZfNyLRFrRLgru5YRADSLPxkZfD2XNUTMx5XAERILfOvTru6zxUa19juhKuIhTnstE6lvzwifPPe89Ao6FzYone', '1571196880086'),
(312, 2, 1, 'VLY1EDcED6eqjaxrIEX0qBKGPZndvzo1OmjuJjJ4XGteFtfmuUSAqxsisIwCVMJv07oKpMtZgXuK7E0uBt8EZamHaK9wgKvz27wcYBieIno17Clbx2rS3qCPcLO9fnZ7MrSw6yetg0tFHwlpueDxki', '1571196987179'),
(313, 1, 1, 'f90OvcljlWd54OFjmLgi94kdlbpTGyiXv0h8L7FnDFLFjanhuoFWcNdSSfFi6PyZ49eI5rcoP9QIk5a1Thjj9wTyLAO1mKArGpd03DQtdxpjzZYBV8mxFMAgFyYXbkISvS4BiilMEr4TKWs0MeBwqY', '1571332948286'),
(314, 1, 1, '21rpu2NX780jB3hqub0UOII1eTKIycm8QJCy2kp5gnT7vSV8j1DCC0LmpiXqA9IpL6rl47YDCVrPcTvv2DpdCIoQcyk9LgGuvTnzeyOLjtlrqY9Ez5bqRXlk8z6aTqhBgG6RmCgIgNxz2DbAR7OIOg', '1571425681317'),
(315, 1, 1, 'Ny9cJZgNVQHn2hSPGKcwwRuGyEpbjn5BVVJMzY2iytC7Ih8tGzwuUyncGyvbjUAaxNels0BbLoUkt5GWDOAqQyADCESM7w6zxR7spaQzqSRklrByXITtZ0w6fn8oFUWaYYVoKA3x6XLXrIaePPsKsR', '1571507649771'),
(316, 1, 1, 'hbu2FtXBKlmeImgCPntbUkqUCvn133jHrkMAMmG4lHn7eBLQzr3H0s697w5M5s0ocK7oS3O20eOn4rqtB29ZM7qCt0CwXthJQ5E4DN1kKHPXN6TPFsCKiiuoPT3P8tcypamKGWk8tLSicqAs94K4zD', '1571521189012'),
(317, 1, 1, 'J90cmkoYfKc4T9z6Sf4cnoPMMb5bplHAvc8iMUQNxwva6tX1EET6ZE5ZbwH0U8MWqRvxHR9j19TwEaiXLsnhjDVHZp5hvMAzpMte8YJlwmU5zWmuNAQRr62KbqbG9pAZmUJ6BIAeD4Q7p6bwQaflj5', '1571588250622'),
(318, 1, 1, '8thDYjfFDNWYh1fRUOeRKelRnZ7PXzKrU6BbX2WaAVdUkKfjGrk4bIiZFt2FycZkzkhkiM4kPXSWYrcPkiuWk9rv1sQobG0CIUVoyBWM7stcIamCdVVMsfp1CqnEeaeQ3TkT4snem7QPTxLGWCPKHY', '1571601937844'),
(319, 1, 1, 'LpPN0gNaT4tRCb62axXVdzx2VgtHZ5o6Cw9RcFcx221ZTA7kumaYiT9lSHjh3jXSQnFjfDMxBQLRRUxhHVQRE3PGFVOkDu3IUQbZUgCDkjuMskrX7XlcagAuk7UtDUjwl5H5O9Ebd2zsnbxVPGDjcw', '1571690240996'),
(320, 1, 1, 'epCQ6VaT3k9JXNZseTyaedMIHXBcKakamZiWZTFn06bkecmjrLIDW0TESDHHzOUNt0QjWu26xn3S3qPslH079Ccdl4QHlUmifVwyx03cD1mRBmysXznpUvGCL1r1nmBEORgBWPD5bgAIsjaq3Wmig6', '1571768979750'),
(321, 1, 1, 'AY962O6hCsa2g3sKxmDNgDKA8vRQIweZja1l8iNk3iMxOVm45S8WN3Qxnu3YhlohDZEyyPGBX9WsfUCLXmBuX0yrRSnrJMR2gIyAcmd0ALzkz2bcXffrWVkzAaLyHrVWezZEjrZA2lK3kNxzNSGT3M', '1571845661534'),
(322, 1, 1, 'CcldPi0W8ZgpRiSUpJJHAmIcEuRxrCKfcpSzT9K1u5RN6DS9dMnqDIxfsRe3DPANAqdMMpIp9RsCSFM3h3oUtFBHJPZhzQXKIoFBwztLGYH0r79jXUW4Cb1LJZz4BFBioJslZGcc51tNXt1D9gYCIe', '1571879431515'),
(323, 1, 1, 'Q1sulvVyGpQZJ7KeoBxzw1C8aVCVpvLM0x40FRMK2u4xIPasQduo08vcQqNTBAN00lCUDq6ahs8EuiS1xs7nGDglZ1MoYj9WTVJ5zkQksQHesqYmv2J6rMESXzMuOVAiDWfLvSa9KBTLGzu26zEN4n', '1571923985476'),
(324, 1, 1, 'WZBFCYnwQxskrpOcstWv4XDYzivacdAttp97ahKsv5NlVmoiQlGUeOcuEsJWIS8MNzNpN5sDxe8BEnSJdc1nhXUBtIwp3QnXhPrIA1PfVgILPCtQW8EzgzzPrQ3PPXowFJZ2lkVTe9Gl4N3PfnJCq7', '1572008690212'),
(325, 1, 1, 'NzpRQeq8EGTRlRZYZXGz53KjOoo3YU2mA5PfVbo04b5JbzIBVG4rfKCXNwLrO2QYDGVm3yNcfK4bv12h1vlyEcjyNb6sybNGxFzONQGRZhD0pai75d8Er5qSXKTfYcud5G0CPJMLRj5OFC8HRE2YfP', '1572054139558'),
(326, 1, 1, 'YlaBdMJDugJv9RobmRTcnCy5GKbWNNLVhndb0LkIUUB8g3QrK38zAX7gsUrm0pbwsYvGdYeqNUUfeLpUICakZ0iUQxnTtnaJHCl46DF4EeZcmiYc8XPl8uUSULAeWRMIvow6z0rYtyTRxvS6QKKckq', '1572055538596'),
(327, 1, 1, 'RlS27XCpXTAtsevZjvgCTnkpLuuODwVMwzrUCxxWVrpScPJaDEFV6tx7SJGWEsVsqAXanek7mTxa9q7KsbDn23OsrrsQgRIhJ1wRpXNuK0ZtTV3W8lfmN2MJahFzkiNkWLfZ3fKtWPNvK9x2a1y3dE', '1572107605546'),
(328, 1, 1, 'wwF7CIYfUvoNQRUadvMaJI81Q1ZDvEr3kKzJvcK4nd2xIzNNW0Gn00DGyPDFdOR19AQvD0e0q0qxpBlMj4C2fVSi5ZITbZETR2DAXVXWH4iximbEKpArXM7ANrNGNJP6ARbQHpC0u27kKvxpuCKRbu', '1572209746362'),
(329, 1, 1, 'yZLZ9OGNYWpNELFsPIPiDumE7H0uHObJS5pgLvcV9T8SCmHseNz0insfmOutb8SEri7hNSejxNxbOcsVQjnXgmQNk1wBd5Sla4VAm09sblaAmAcgn75zNzn2nWKj2MwenZw517Wg7hXH5ZOQ0ILFRJ', '1572213481904'),
(330, 1, 1, 'BWNqzh5og5utzpncx3X6LAZW0p2cFUpceyjkqJKLAm270AnsiSueUW1YdQ6ndSXaAu06LQA0CPDmK0n0rzN3VReNVa1ALKIUHvPHmd5vbDP9M2HPHmdBLSg8xecUZe0LF6lNIUYwVKEkflTaYQCLuh', '1572227268799'),
(331, 1, 1, 'NppH8PYeRoCI6EGE43kVN4JEgWlJQlIEpuOq8W8QoX6V8iTCi1Its0ho6TH0biBA0vFJaniAjQR99C3055UdoleoS2r9WIBybqHRkBYvjPH4w6Ut7ZVBPrcokUboRs8SJMS4pgRgJQxRhEZtrPbytz', '1572227699404'),
(332, 1, 1, 'CNs5rQLCOjFSvt9Mrd1laUx1Hmh9cuWJaAtjW779vWlsH7RoH3NfGDAi9I3okrsCH418XVM8FHwVFFkpyB91uhFrLR8Gyrg9zoTG5fFOBh1p3iLCRY2uPO7WghAOWml2GVeDp6pU0wwY3eaLTS99OU', '1572835938126'),
(333, 1, 1, 'egFKVOHXx1A8eWywcWG1q9kPx1GnoASngwVjlBHSDavj6ur8fi0fErSnFRN9Z3E2jP4Sg7n7paj8iJLhOpp5KfYug7eEfiU5UnIlnGKTED0ejbT9hc1Q2O97mVPWE0XlJKVA6N74gbaj1HOc72JRWh', '1572904398921'),
(334, 1, 1, 'b6ceVPHQuenYrXHCLDYbawbCoF8HCHQhUFCh2UFpvAh496xIWb8SqdhS0L4sn4rsPGgCHzbCuTy2DzZFeHqnxTBdZE7GEvdPFLoOQkODj1RZoNFvtSMwfJKfDmsanHL2wLMNFuk71tub7n9YlYRyPN', '1572970652275'),
(335, 1, 1, 'OfrQTj9bzQhq9TNxG32eQIfC5Aucdr4YBguAsaL64flG2duEGW0lJxGEHW7tVXpIwoAZitkkSGBXxN2KvjHsTpwdlMbChGhffnrC49gbuvheEGy80KKlw0ZjCl0OzB8vJ8SXlpvvnC4MpT7JiBBg4g', '1573060055164'),
(336, 1, 1, 'iMBdTE853fcsjtaLMLeA09bcxOEuNuIs8AV0ZuQ7yUVfGzi0j32dkVyFmucujjLi0ZBWY0F4l4cBsjmlDE2VbJaFJ2Tv43kyju1BLYXCglFO8gMaWr2OslprpFEHD24TL0l83vXhZxkHYJsDf8ktPU', '1573157980038'),
(337, 1, 1, 'oTfWW4ZlNvug0qyFKbgmZqZcBAByEZfdgvTw4vZFwTya5RiyjGdQG2jC13eVOplqR3dcQ62fmLpBo9vIQFrSpFmxSBIqqJRN0GXIpB56DNre5fc0TTpvTGbNca0tnaVNZq2b41sfvlhbMzbcPmoXR4', '1573247384074'),
(338, 1, 1, 'XYIjb0FqxE2ikQ0PwVpzdVODkwPgJaHfTcEV56bIsVUsIn5VOFr6A7ursC3WbwGy2OXg2uTGFeYKRu7m0CWc6WTYwwxMG2M9s9SXXfjrwkdEaRqXaIwOvkxXZzxjSh9hFwZxyBuh0eSC2mOzhCePeP', '1573321748119'),
(339, 1, 1, 'AAOrjX0hxIwcG37fQAQI9cgUBJWTJt09Af8jQSsRFHAtoDhSOl7sH0PzfedPQzauFoeQrY4eHHyRgGjyXOcENvMbyZKQOU0oGqGAMhP1DuRFXbYORk1NhwUd0vvEQ1I7O4EC9LzKpxpD7ZhB8iGBRY', '1573384336397'),
(340, 1, 1, 'vOha1Xmx0YSMIvnRLcSBHqO5VuEgIrTUnI2C3NYWKrmeKEOdqnloLJIU91591mo7q2TzACpctu0nPNbDruVtyPoNIl2z63Wzz5E7O1HmYmN24RBX5dBzAmEJLoOpuQKmBJe2bWWjizDb6tAi1EvVK4', '1573481341408'),
(341, 2, 1, '7WYUqaDDqnueBTxJS20TwQRWaDJgvMMgMbNgynIHJIBQ3evQOAZAKjpH8koo6sWhNzseBbPfJZ1dQT3iLLv9g2FQViu73jxvgUjZEKWgaRClmUK2Q6GVodVJ7lMeLCDdPpjzIeE1s4ELgawDZnFTtj', '1573481378596'),
(342, 2, 1, 'U4Y3PYh2U4M2L80lAJTaxeWx153mbIRI0s3tuIUEMGWOQiHhsAJgAIcJxd6H3QciTBDdefPJSlUPCf4YJfyAeJAyB3GijlZrqdBXxsI5GyDgc1qUV9pwQxPN8AXYfkdjDRSPfaIjQHt7c7XrLMjNin', '1573481431878'),
(343, 2, 1, 'Fsk4KfB3NaLXxbU8AjPteb0G5WRWH6WTbQjj1n8z9yML0RDfxubGXngiUR6TZxhzy14G6DTSE31UGcXl8yb0Za7yCUOiEKoKdCSSZ0oX8KsfEXzG5xlG0oGd4gco0SaxvrSgnU9kOVg4iw1wsCAaGR', '1573483740731'),
(344, 1, 1, 'ldZQT2gWC5RBXv14WUWlzipg6SORA5iEQWotvsqaz4etKb6LP7vC5moxbLnXx1W2CRUROkRrxzCfiVx5T3BaafsMWqZRllMeqn3tHdZFSlnmmrJ6Jc3NWfJm1DZERmFFKD97MPUoNksKHXcU5ZhZFP', '1574027195018'),
(345, 1, 1, 'MMhMcDwbopeIUG7F2XNk5Ngy4cvR2arT9LT3QZMDhhyCEeWBreuKJT173Qat88xfkeK79cMY9a2OmXM7GJACPLxYZEO2klMxlaJH9oJ00LqWmzeZyDxMYTLKPilGT09t8Bm351Jpp0sqPSliP0stBX', '1574100073310'),
(346, 1, 1, 'ERGYarOAOFtBRHuaeSFBfacEmab0kiGX84YNoXz4puJoFG7xdwwUI688Vi8gAPAA32xjMJLkTPIoW8fH2RVncvV1P5L4nxJS2zqApQmlLqyPeMlk89PZeWXDkbaiuSN0vwhhoAR2rwQlKfIWOFvkjR', '1574534888562'),
(347, 2, 1, 'sgpOF9O8O2P7PbLRxcvq4f4XlAUasmWBMJaMOxCD2C6WsqLnktea6Z8MSuKrcftMWR62z8XLYYKENtoLvlsQ5FDwe86Hbjsmt40qw3qzddLElpvhjwwqlnTDzhxdirergcDGhi9i61SDLGzQtkg9dl', '1574535371502'),
(348, 1, 1, '2bN6HG1O1vWpthRasEy2hHvug6gud1Ora1VQbOICe7Llw3i3ITdPEGbN9uJreQrwpmbTcs5shAFEcfedXbosNV05Sg0Gc2HpwKvTAs13JT2GpeaUIcNe3qvxMYcqzk4IrMdijfK4tbHsQyqZL2ZLAz', '1574634366779'),
(349, 2, 1, 'sBdwEos8bdKvmezeuvOWViBlIiXpdjybTdzgvGJhYPWNZMHx6Zz0S8yyGRKYFdZzSRTYvhYpa5E4aoZqsuw4M5sUgW11LiG9Ek3Kg3B4fkyEtScarqfP3MgOvE0alIkl59kO6bDYuaXAXlpaeqSu8P', '1574634405065'),
(350, 1, 1, 'XMkdGfpFbTINTlf25zkfn4UXKw1vqta0H3pm8LQakhwR56XKwL3onoERujlN32mZFmZrFmTp7O3KgjohkCD9ZWiiR6AX2bGuAW11gB83khUozS2S9kxDbl0D2wXi4q0yetUc2UpB3rJl1NqJ7I25OJ', '1574703193156'),
(351, 2, 1, 'u9ZkBe49Ll1s35ixRAh9I6WGrbJHTqiNXvYXkoDu0JBJx6E4HaGnxDzgxUP5m0uexDjDCEFegKr1PvHBuBSQ9dSCpOrqDgiyJud4PjRcHXoc817WsIiRFfuTx76ZPE6xxlQRNzAJzS0zbiUNoyChSl', '1574703420162'),
(352, 2, 1, 'ZgDAigZRV5weXMSHh3ZbVHt3IrMwM894Y93BivR8uackcD3C6Z7jc0gga1DehNsTgCuKuKak5wBbk0jz9Qj0yygZ44Xlt0bPBfpBl5NtfHcn3SXjJcUxcd2lO4bMfImH9dV0fhWrotmMPkXObR21Cr', '1574708682853'),
(353, 1, 1, 'igqaJm5v3DIUyGwvylyesE95EFjCi8ty1FmP4w9ZrLn541LnOZ5jDjUX23DyIpORd7CUdb2EcziQd1PE1F6UnVm7J9Qv80z2N5tH6xdY9PNYHVtV8bmUeZh1Cau9MFwrejCG8JzxNL6N7qekJBXxNc', '1574789439994'),
(354, 2, 1, 'hANG1NI7BaOHOyz8L6zO2zTbaFuvPaNyPxWQynZCEhbsnTcUrcZOgAvQ8evlKnKbsdJfOzMnTyAlHxj5gBq3rJ42zqHjnJibRfe7VHvVOWBYJx9R9n4ZTHJIIG7n2TQn60PcCLXfxwkA2dL6KYFdOE', '1574789478938'),
(355, 1, 1, 'wGUEH1QwFqQrInZXHXo6ThULWmMQ67z61hGOiE3SIVtuBT70RHggusA4yzQn18Bsi4WQnE7xD1nniGGBGq4zya2HtsnhtBNLGsjvy19g0nZ3F1QNHDKLhLZhuTUANfTpoVLibNwiQpUwUjbKQSk5QV', '1574897925674'),
(356, 1, 1, 'tnsrN1dj2RekIOIBrG34QNsP9JrMRJNiuYsvziYmgq3zjEmpGwplrfaUQ1suqDJsG2FjtIG3BjWBgKLYbbU5oxkdXVZxzyqzXUY2bM4Uh1oT8btjy3oep0avhwZJ9ql9Lvr9EzKh9qcSgyzKy1iE23', '1574906779984'),
(357, 1, 1, 'vISBtoPG89nPuBDaOWN2e87tkMJdKfhZfHlVB3Af7rekb2iN7gX5qf9vdpNrgamEERnzFj8NwNUlUKe961B4nCoDglaoBb1NFUt8wYNplAnRGUNf1xkleZXvC9IkbGuLI6QdxWufGjGLfjJK45EkBR', '1574958556791'),
(358, 2, 1, '02dfyWSiADXsGYtxQ8ThQ8WpRDJLjJ103roUpqeE47xvJoR2iUwr4hrfx5ReYVzX5zOBZJyZOVzTC5fNUZV5TLuhsXDfMItzZOesv25YC4gmDNtPt33lCp1bv3xLT5yACdsR76hy4EPFgTSRbsmkLW', '1575066292417'),
(359, 1, 1, 'K1aJz3NhnJMGF4MBKQVnreSO20yXSge8hTz1B0TQK5uvX7zdcQ7lMhZCYFxxkOqbInBn1mZigXtJjiDDvftVrj1E3D4MyUuUpn5YOxmz000tKn5HjFU6d7Kk49I40VQWpM2RNxJWHBBXO5S0LqOyzd', '1575066425951'),
(360, 1, 1, 'P7SxdWvpKTTDHAuSPu05WWJriLHfX3Kwe859IRkyRq8r5HQlZqyQShHTfxEaR6pUfaN6zzbeeAIGcfbE7H90Wfb80TnlCEwki6wcB8WuLWA1HyaE0FrS9WSbeLGjgsqrzSDqsZwlyfBZopGpemqj8A', '1575129119028'),
(361, 2, 1, 'BK8KIiuH1a21MnKahcN9SzdgO0zh379nCBKTF3NoXU3qKmQXKkG6sh7hgH66uKD9eDqna2heKtF9N0QPZS7WTOvQtVOfTECGYaSbdjnf5TZyBliJivSkD8ETcKrBZrmZHezhOtFaC07CiwPmxOCsyg', '1575129349503');

-- --------------------------------------------------------

--
-- Estrutura da tabela `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Extraindo dados da tabela `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('7TmYD-6ntvv79xUJGkDbsKU7T6hojmZT', 1575165004, '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"captcha":"8u76","isConnected":true,"uid":1,"nickname":"SouXiterMex1","authToken":"K1aJz3NhnJMGF4MBKQVnreSO20yXSge8hTz1B0TQK5uvX7zdcQ7lMhZCYFxxkOqbInBn1mZigXtJjiDDvftVrj1E3D4MyUuUpn5YOxmz000tKn5HjFU6d7Kk49I40VQWpM2RNxJWHBBXO5S0LqOyzd","csrfToken":"uzzqyYCrKv1jvt5UlFgeSREWfCvL1p"}'),
('MFeoqHFP8ZIqmnhWZfNYRisuStUnxacU', 1575165006, '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"captcha":"k0vu","isConnected":true,"uid":2,"nickname":"Roberto","authToken":"02dfyWSiADXsGYtxQ8ThQ8WpRDJLjJ103roUpqeE47xvJoR2iUwr4hrfx5ReYVzX5zOBZJyZOVzTC5fNUZV5TLuhsXDfMItzZOesv25YC4gmDNtPt33lCp1bv3xLT5yACdsR76hy4EPFgTSRbsmkLW","csrfToken":"nf4qzQI1jyq4GBBmXrtI1JwXxmxgmV"}'),
('OhrhR8--1Xb2FDnczQO0dHaNdvNmlbGN', 1575227779, '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"captcha":"ltge","isConnected":true,"uid":1,"nickname":"SouXiterMex1","authToken":"P7SxdWvpKTTDHAuSPu05WWJriLHfX3Kwe859IRkyRq8r5HQlZqyQShHTfxEaR6pUfaN6zzbeeAIGcfbE7H90Wfb80TnlCEwki6wcB8WuLWA1HyaE0FrS9WSbeLGjgsqrzSDqsZwlyfBZopGpemqj8A","csrfToken":"9BuynDzkkKYGIXBszNiOd0exxE19EF"}'),
('zDIKT0kSOPZj95IM30QQ3YHwYmovFXL_', 1575227780, '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"captcha":"eofr","isConnected":true,"uid":2,"nickname":"Roberto","authToken":"BK8KIiuH1a21MnKahcN9SzdgO0zh379nCBKTF3NoXU3qKmQXKkG6sh7hgH66uKD9eDqna2heKtF9N0QPZS7WTOvQtVOfTECGYaSbdjnf5TZyBliJivSkD8ETcKrBZrmZHezhOtFaC07CiwPmxOCsyg","csrfToken":"TRQ5WTHqdH6ADgfVf746BRKpCDyq3R"}');

-- --------------------------------------------------------

--
-- Estrutura da tabela `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `confirmed` tinyint(1) NOT NULL DEFAULT '0',
  `fb_id` varchar(15) NOT NULL,
  `reg_date` char(13) NOT NULL,
  `email` varchar(254) NOT NULL,
  `nickname` varchar(15) NOT NULL,
  `password` char(60) NOT NULL,
  `rank` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
  `character` int(3) NOT NULL DEFAULT '0',
  `silver` int(10) UNSIGNED NOT NULL DEFAULT '100',
  `gold` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `silver_bank` int(10) UNSIGNED NOT NULL DEFAULT '100',
  `vip` tinyint(1) NOT NULL DEFAULT '0',
  `vip_date` varchar(13) NOT NULL DEFAULT '0',
  `ban` tinyint(1) NOT NULL DEFAULT '0',
  `ban_date` varchar(13) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Extraindo dados da tabela `users`
--

INSERT INTO `users` (`id`, `confirmed`, `fb_id`, `reg_date`, `email`, `nickname`, `password`, `rank`, `character`, `silver`, `gold`, `silver_bank`, `vip`, `vip_date`, `ban`, `ban_date`) VALUES
(1, 0, '0', '1529108243068', 'chara22@yopmail.com', 'SouXiterMex1', '$2a$10$jopvOE41g7UGVL1XU2jOfuDAeRDOzHSH4dE1JGqYTdLh4XbCE32rK', 0, 0, 42790, 2070, 0, 0, '0', 0, '0'),
(2, 0, '0', '1529108767115', 'chara33@yopmail.com', 'Roberto', '$2a$10$bhG.q/Xe/ytnqXc2fFPTMeRkyRSr3iX4KmSMtvxY1H36Bemtw1n3e', 0, 0, 79210, 17410, 0, 0, '0', 0, '0'),
(3, 0, '0', '1529163210620', 'LOLASD@yopmail.com', 'LOLASD123', '$2a$10$mzry3snwB4JqkgPzGq3VUeIrCcab840eFhMAQqgFYCqdzPTgbIvW2', 0, 0, 100, 0, 0, 0, '0', 0, '0'),
(4, 0, '0', '1542389956674', 'lucaspc@gmail.com', 'Lucas', '$2a$10$GETr1XLcE2B0QfUje2k/G.d05y7EO1jzwVggQAefZx8KsS6SEE6Bm', 0, 0, 100, 0, 0, 0, '0', 0, '0');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `battle`
--
ALTER TABLE `battle`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `battle_buffs_nerfs`
--
ALTER TABLE `battle_buffs_nerfs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `current_doing`
--
ALTER TABLE `current_doing`
  ADD PRIMARY KEY (`uid`);

--
-- Indexes for table `flags`
--
ALTER TABLE `flags`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `freeze_items_monsters`
--
ALTER TABLE `freeze_items_monsters`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `map_position`
--
ALTER TABLE `map_position`
  ADD PRIMARY KEY (`uid`);

--
-- Indexes for table `marketplace`
--
ALTER TABLE `marketplace`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `monsters`
--
ALTER TABLE `monsters`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `monsters_in_pocket`
--
ALTER TABLE `monsters_in_pocket`
  ADD PRIMARY KEY (`uid`);

--
-- Indexes for table `pvp_invites`
--
ALTER TABLE `pvp_invites`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `security_tokens`
--
ALTER TABLE `security_tokens`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nickname` (`nickname`),
  ADD KEY `rank` (`rank`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `battle`
--
ALTER TABLE `battle`
  MODIFY `id` bigint(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `battle_buffs_nerfs`
--
ALTER TABLE `battle_buffs_nerfs`
  MODIFY `id` bigint(10) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `flags`
--
ALTER TABLE `flags`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;
--
-- AUTO_INCREMENT for table `freeze_items_monsters`
--
ALTER TABLE `freeze_items_monsters`
  MODIFY `id` bigint(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` bigint(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT for table `marketplace`
--
ALTER TABLE `marketplace`
  MODIFY `id` bigint(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;
--
-- AUTO_INCREMENT for table `monsters`
--
ALTER TABLE `monsters`
  MODIFY `id` bigint(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=658;
--
-- AUTO_INCREMENT for table `pvp_invites`
--
ALTER TABLE `pvp_invites`
  MODIFY `id` bigint(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;
--
-- AUTO_INCREMENT for table `security_tokens`
--
ALTER TABLE `security_tokens`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=362;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
