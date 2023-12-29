require('dotenv').config();

const mysql = require("mysql2");

const mysqlConnection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    multipleStatements: true
});

mysqlConnection.query("TRUNCATE TABLE `battle`");
mysqlConnection.query("TRUNCATE TABLE `battle_buffs_nerfs`");
mysqlConnection.query("TRUNCATE TABLE `battle_exp_share`");
mysqlConnection.query("TRUNCATE TABLE `tamer_bot_monsters_in_pocket`");
mysqlConnection.query("UPDATE `current_doing` SET `battle_type` = '0'");
mysqlConnection.query("DELETE FROM `monsters` WHERE `type` = '1'");
mysqlConnection.query("DELETE FROM `monsters` WHERE `type` = '2'");