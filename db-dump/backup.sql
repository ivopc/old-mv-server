-- MySQL dump 10.13  Distrib 8.0.28, for Linux (x86_64)
--
-- Host: localhost    Database: valle
-- ------------------------------------------------------
-- Server version	8.0.28-0ubuntu0.20.04.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `battle`
--

DROP TABLE IF EXISTS `battle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `battle` (
  `enabled` tinyint(1) NOT NULL,
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `battle_type` tinyint(1) NOT NULL,
  `field_category` tinyint(1) NOT NULL,
  `field_weather` tinyint(1) NOT NULL,
  `field_special` tinyint(1) NOT NULL,
  `need_to_trade_fainted_monster` tinyint(1) NOT NULL,
  `challenged` bigint NOT NULL,
  `seen_presentation` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `battle`
--

LOCK TABLES `battle` WRITE;
/*!40000 ALTER TABLE `battle` DISABLE KEYS */;
INSERT INTO `battle` VALUES (1,2,1,1,1,0,0,0,0,1);
/*!40000 ALTER TABLE `battle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `battle_buffs_nerfs`
--

DROP TABLE IF EXISTS `battle_buffs_nerfs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `battle_buffs_nerfs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `battle_id` bigint NOT NULL,
  `affected_monster` bigint NOT NULL,
  `buff_or_nerf` tinyint(1) NOT NULL,
  `value` tinyint(1) NOT NULL,
  `stats_affected` tinyint(1) NOT NULL,
  `duration` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `battle_buffs_nerfs`
--

LOCK TABLES `battle_buffs_nerfs` WRITE;
/*!40000 ALTER TABLE `battle_buffs_nerfs` DISABLE KEYS */;
/*!40000 ALTER TABLE `battle_buffs_nerfs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `battle_exp_share`
--

DROP TABLE IF EXISTS `battle_exp_share`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `battle_exp_share` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `battle_id` bigint NOT NULL,
  `monster_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `battle_exp_share`
--

LOCK TABLES `battle_exp_share` WRITE;
/*!40000 ALTER TABLE `battle_exp_share` DISABLE KEYS */;
/*!40000 ALTER TABLE `battle_exp_share` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `current_doing`
--

DROP TABLE IF EXISTS `current_doing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `current_doing` (
  `uid` bigint NOT NULL,
  `battle_type` tinyint(1) NOT NULL,
  `if_is_pvp_battle_id` bigint NOT NULL,
  `waiting_wild_battle` tinyint(1) NOT NULL,
  `doing_battle_action` tinyint(1) NOT NULL,
  `requesting_flag` tinyint(1) NOT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `current_doing`
--

LOCK TABLES `current_doing` WRITE;
/*!40000 ALTER TABLE `current_doing` DISABLE KEYS */;
INSERT INTO `current_doing` VALUES (1,0,0,0,0,0),(2,0,0,0,0,0);
/*!40000 ALTER TABLE `current_doing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flags`
--

DROP TABLE IF EXISTS `flags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flags` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `type` varchar(2) NOT NULL,
  `flag_id` varchar(10) NOT NULL,
  `value` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flags`
--

LOCK TABLES `flags` WRITE;
/*!40000 ALTER TABLE `flags` DISABLE KEYS */;
INSERT INTO `flags` VALUES (1,1,'m','1',2),(2,1,'m','1-1',1),(3,1,'m','2',3),(4,2,'m','1',1),(5,2,'m','1-1',1),(6,2,'m','2',1),(13,1,'m','3',1),(14,2,'m','3',1),(15,1,'m','7',1),(26,1,'m','4',2),(27,1,'p','1',1),(28,1,'p','2',1),(29,1,'m','5',1),(30,1,'m','6',1),(31,1,'ka','1',1);
/*!40000 ALTER TABLE `flags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `freeze_items_monsters`
--

DROP TABLE IF EXISTS `freeze_items_monsters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `freeze_items_monsters` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `sale_id` bigint NOT NULL,
  `item_or_monster` tinyint(1) NOT NULL,
  `amount` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `freeze_items_monsters`
--

LOCK TABLES `freeze_items_monsters` WRITE;
/*!40000 ALTER TABLE `freeze_items_monsters` DISABLE KEYS */;
/*!40000 ALTER TABLE `freeze_items_monsters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `in_game_data`
--

DROP TABLE IF EXISTS `in_game_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `in_game_data` (
  `uid` bigint NOT NULL,
  `silver` bigint unsigned NOT NULL DEFAULT '0',
  `gold` bigint unsigned NOT NULL DEFAULT '0',
  `points` bigint unsigned NOT NULL DEFAULT '0',
  `level` bigint NOT NULL,
  `rank` tinyint(1) NOT NULL,
  `exp` bigint NOT NULL,
  `nickname` varchar(15) NOT NULL,
  `online` tinyint(1) NOT NULL,
  `map` smallint(10) NOT NULL,
  `pos_x` smallint(10) NOT NULL,
  `pox_y` smallint(10) NOT NULL,
  `pos_facing` tinyint(1) NOT NULL,
  `sprite` smallint(10) NOT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `in_game_data`
--

LOCK TABLES `in_game_data` WRITE;
/*!40000 ALTER TABLE `in_game_data` DISABLE KEYS */;
INSERT INTO `in_game_data` VALUES (1,1000,1000,1000,1,1,1),(2,1000,1000,1000,1,1,1);
/*!40000 ALTER TABLE `in_game_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `item_id` int NOT NULL,
  `amount` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (1,1,1,1);
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marketplace`
--

DROP TABLE IF EXISTS `marketplace`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketplace` (
  `enabled` tinyint(1) NOT NULL,
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `sale_id` bigint NOT NULL,
  `if_is_monster_monsterpedia_id` smallint NOT NULL,
  `negotiation_type` tinyint(1) NOT NULL,
  `item_or_monster` tinyint(1) NOT NULL,
  `requested_item_or_monster` tinyint(1) NOT NULL,
  `requested_id` bigint NOT NULL,
  `requested_coin` tinyint(1) NOT NULL,
  `requested_amount` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marketplace`
--

LOCK TABLES `marketplace` WRITE;
/*!40000 ALTER TABLE `marketplace` DISABLE KEYS */;
/*!40000 ALTER TABLE `marketplace` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `monsters`
--

DROP TABLE IF EXISTS `monsters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monsters` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `type` tinyint(1) NOT NULL DEFAULT '0',
  `shiny` tinyint(1) NOT NULL DEFAULT '0',
  `is_initial` tinyint(1) NOT NULL DEFAULT '0',
  `can_trade` tinyint(1) NOT NULL DEFAULT '1',
  `in_pocket` tinyint(1) NOT NULL DEFAULT '0',
  `monsterpedia_id` int NOT NULL,
  `nickname` varchar(9) DEFAULT NULL,
  `level` tinyint(1) NOT NULL,
  `experience` int NOT NULL,
  `gender` tinyint(1) NOT NULL,
  `hold_item` smallint NOT NULL,
  `catch_item` smallint NOT NULL,
  `move_0` smallint NOT NULL,
  `move_1` smallint NOT NULL,
  `move_2` smallint NOT NULL,
  `move_3` smallint NOT NULL,
  `current_HP` int NOT NULL,
  `status_problem` tinyint(1) NOT NULL,
  `stats_HP` int NOT NULL,
  `current_MP` int NOT NULL,
  `stats_MP` int NOT NULL,
  `stats_attack` int NOT NULL,
  `stats_defense` int NOT NULL,
  `stats_speed` int NOT NULL,
  `dp_HP` int NOT NULL,
  `dp_attack` int NOT NULL,
  `dp_defense` int NOT NULL,
  `dp_speed` int NOT NULL,
  `sp_HP` int NOT NULL,
  `sp_attack` int NOT NULL,
  `sp_defense` int NOT NULL,
  `sp_speed` int NOT NULL,
  `vita_HP` int NOT NULL,
  `vita_attack` int NOT NULL,
  `vita_defense` int NOT NULL,
  `vita_speed` int NOT NULL,
  `egg_is` tinyint(1) NOT NULL DEFAULT '0',
  `egg_date` varchar(13) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `monsters`
--

LOCK TABLES `monsters` WRITE;
/*!40000 ALTER TABLE `monsters` DISABLE KEYS */;
INSERT INTO `monsters` VALUES (1,1,1,0,0,1,0,1,4,'',6,216,1,0,1,1,2,0,0,26,0,48,100,100,36,37,13,4,0,0,0,27,19,26,26,0,0,0,0,0,'0'),(2,1,1,0,0,1,0,1,1,'',5,135,1,0,1,1,0,0,0,36,0,36,100,100,31,27,11,0,0,0,0,20,14,8,20,0,0,0,0,0,'0'),(3,1,1,0,0,1,0,1,1,'',5,135,1,0,1,1,0,0,0,35,0,35,100,100,31,28,12,0,0,0,0,2,23,30,30,0,0,0,0,0,'0'),(4,1,1,0,0,1,0,1,1,'',5,135,1,0,1,1,0,0,0,35,0,35,100,100,31,28,11,0,0,0,0,9,26,31,29,0,0,0,0,0,'0'),(5,1,1,0,0,1,0,1,7,'',5,135,1,0,1,1,0,0,0,40,0,40,100,100,31,31,11,0,0,0,0,2,13,25,15,0,0,0,0,0,'0'),(6,1,0,1,0,0,1,0,18,'',6,179,1,0,1,1,2,0,0,-3,0,37,100,100,17,18,21,0,0,0,0,27,13,10,23,0,0,0,0,0,'0'),(7,1,1,1,0,0,1,0,4,'',8,314,1,0,1,1,2,0,0,58,0,58,100,100,47,46,15,0,0,0,0,3,29,9,20,0,0,0,0,0,'0');
/*!40000 ALTER TABLE `monsters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `monsters_in_box`
--

DROP TABLE IF EXISTS `monsters_in_box`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monsters_in_box` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `slot_position` smallint NOT NULL,
  `monster_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `monsters_in_box`
--

LOCK TABLES `monsters_in_box` WRITE;
/*!40000 ALTER TABLE `monsters_in_box` DISABLE KEYS */;
/*!40000 ALTER TABLE `monsters_in_box` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `monsters_in_pocket`
--

DROP TABLE IF EXISTS `monsters_in_pocket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monsters_in_pocket` (
  `uid` bigint NOT NULL,
  `monster0` bigint NOT NULL,
  `monster1` bigint NOT NULL,
  `monster2` bigint NOT NULL,
  `monster3` bigint NOT NULL,
  `monster4` bigint NOT NULL,
  `monster5` bigint NOT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `monsters_in_pocket`
--

LOCK TABLES `monsters_in_pocket` WRITE;
/*!40000 ALTER TABLE `monsters_in_pocket` DISABLE KEYS */;
INSERT INTO `monsters_in_pocket` VALUES (1,1,2,4,5,0,0);
/*!40000 ALTER TABLE `monsters_in_pocket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notify`
--

DROP TABLE IF EXISTS `notify`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notify` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `viewed` tinyint(1) NOT NULL DEFAULT '0',
  `type` tinyint(1) NOT NULL,
  `n_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notify`
--

LOCK TABLES `notify` WRITE;
/*!40000 ALTER TABLE `notify` DISABLE KEYS */;
/*!40000 ALTER TABLE `notify` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notify_evolve`
--

DROP TABLE IF EXISTS `notify_evolve`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notify_evolve` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `evolve_to` smallint NOT NULL,
  `monster_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notify_evolve`
--

LOCK TABLES `notify_evolve` WRITE;
/*!40000 ALTER TABLE `notify_evolve` DISABLE KEYS */;
/*!40000 ALTER TABLE `notify_evolve` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notify_learn_move`
--

DROP TABLE IF EXISTS `notify_learn_move`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notify_learn_move` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `move_id` smallint NOT NULL,
  `monster_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notify_learn_move`
--

LOCK TABLES `notify_learn_move` WRITE;
/*!40000 ALTER TABLE `notify_learn_move` DISABLE KEYS */;
/*!40000 ALTER TABLE `notify_learn_move` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notify_marketplace`
--

DROP TABLE IF EXISTS `notify_marketplace`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notify_marketplace` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `item_or_monster` tinyint(1) NOT NULL,
  `solded` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notify_marketplace`
--

LOCK TABLES `notify_marketplace` WRITE;
/*!40000 ALTER TABLE `notify_marketplace` DISABLE KEYS */;
/*!40000 ALTER TABLE `notify_marketplace` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `online_offline_flag`
--

DROP TABLE IF EXISTS `online_offline_flag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `online_offline_flag` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `sckt_id` varchar(25) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `online_offline_flag`
--

LOCK TABLES `online_offline_flag` WRITE;
/*!40000 ALTER TABLE `online_offline_flag` DISABLE KEYS */;
INSERT INTO `online_offline_flag` VALUES (98,1,'0JAdo_XIsNGBOwBPAAAH');
/*!40000 ALTER TABLE `online_offline_flag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `picpay_payment`
--

DROP TABLE IF EXISTS `picpay_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `picpay_payment` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `product_id` tinyint(1) NOT NULL,
  `ref` char(10) NOT NULL,
  `value` varchar(100) NOT NULL,
  `status` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `picpay_payment`
--

LOCK TABLES `picpay_payment` WRITE;
/*!40000 ALTER TABLE `picpay_payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `picpay_payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pvp_invites`
--

DROP TABLE IF EXISTS `pvp_invites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pvp_invites` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `inviter` bigint NOT NULL,
  `receiver` bigint NOT NULL,
  `accepted` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pvp_invites`
--

LOCK TABLES `pvp_invites` WRITE;
/*!40000 ALTER TABLE `pvp_invites` DISABLE KEYS */;
/*!40000 ALTER TABLE `pvp_invites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quest_action`
--

DROP TABLE IF EXISTS `quest_action`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quest_action` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `quest_id` int NOT NULL,
  `action_type` tinyint(1) NOT NULL,
  `monsterpedia_id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quest_action`
--

LOCK TABLES `quest_action` WRITE;
/*!40000 ALTER TABLE `quest_action` DISABLE KEYS */;
/*!40000 ALTER TABLE `quest_action` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quests`
--

DROP TABLE IF EXISTS `quests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `quest_id` int NOT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quests`
--

LOCK TABLES `quests` WRITE;
/*!40000 ALTER TABLE `quests` DISABLE KEYS */;
/*!40000 ALTER TABLE `quests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `security_tokens`
--

DROP TABLE IF EXISTS `security_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `security_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `active` tinyint(1) NOT NULL,
  `token` varchar(150) NOT NULL,
  `lastActivity` varchar(13) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_tokens`
--

LOCK TABLES `security_tokens` WRITE;
/*!40000 ALTER TABLE `security_tokens` DISABLE KEYS */;
INSERT INTO `security_tokens` VALUES (1,1,1,'snfQd1h05KxOjdAhuOVy8VFmmpIhWBpUrEATQLwWWk8p2Uzlnq8MLl2ZxIQDCzc9nVaPRt20RK0YSqwZtk9BnOKTwpDZ5wqdVsfd45djfZSV9i9OnqwCesIqaFhc3y6HuR8RAEVb511bp7zgiDAwfZ','1644968751644'),(2,2,1,'eYGrxqByiJ61Y7trwdaSrlUoF4aFDA945FmWFPTWH0ARDk8b8AmAFm9jpiUt7FmQdsY52vLnTnrkC5zsTbJXJG0JMNBJLI0PmT8c4htyzQCwtvJBMtBPWErVnGkpFQ1QYOAqrGmhITZd3IVpKV6Pqv','1644968751644');
/*!40000 ALTER TABLE `security_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tamer_bot_monsters_in_pocket`
--

DROP TABLE IF EXISTS `tamer_bot_monsters_in_pocket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tamer_bot_monsters_in_pocket` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `tamer_id` smallint NOT NULL,
  `monster0` bigint NOT NULL,
  `monster1` bigint NOT NULL,
  `monster2` bigint NOT NULL,
  `monster3` bigint NOT NULL,
  `monster4` bigint NOT NULL,
  `monster5` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tamer_bot_monsters_in_pocket`
--

LOCK TABLES `tamer_bot_monsters_in_pocket` WRITE;
/*!40000 ALTER TABLE `tamer_bot_monsters_in_pocket` DISABLE KEYS */;
/*!40000 ALTER TABLE `tamer_bot_monsters_in_pocket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `confirmed` tinyint(1) NOT NULL DEFAULT '0',
  `fb_id` varchar(15) NOT NULL,
  `reg_date` char(13) NOT NULL,
  `email` varchar(254) NOT NULL,
  `nickname` varchar(15) NOT NULL,
  `password` char(60) NOT NULL,
  `rank` tinyint unsigned NOT NULL DEFAULT '0',
  `vip` tinyint(1) NOT NULL DEFAULT '0',
  `vip_date` varchar(13) NOT NULL DEFAULT '0',
  `ban` tinyint(1) NOT NULL DEFAULT '0',
  `ban_date` varchar(13) NOT NULL DEFAULT '0',
  `lang` varchar(2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nickname` (`nickname`),
  KEY `rank` (`rank`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'0','1529108243068','chara22@yopmail.com','SouXiterMex1','$2a$10$jopvOE41g7UGVL1XU2jOfuDAeRDOzHSH4dE1JGqYTdLh4XbCE32rK',0,0,'0',0,'0','br'),(2,1,'0','1529108243069','chara23@yopmail.com','Roberto','$2a$10$jopvOE41g7UGVL1XU2jOfuDAeRDOzHSH4dE1JGqYTdLh4XbCE32rK',0,0,'0',0,'0','br');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-02-16  1:47:23
