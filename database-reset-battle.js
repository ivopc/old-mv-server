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
console.log("Cleaning up the battle related databases...");
mysqlConnection.query(
    "TRUNCATE TABLE `battle`;TRUNCATE TABLE `battle_buffs_nerfs`;TRUNCATE TABLE `battle_exp_share`;TRUNCATE TABLE `tamer_bot_monsters_in_pocket`;UPDATE `current_doing` SET `battle_type` = '0';DELETE FROM `monsters` WHERE `type` = '1';DELETE FROM `monsters` WHERE `type` = '2'",
    (err, data) => {
        if (err) {
            console.error(err);
        } else {
            console.log("Battle databases cleaned with success!!");
        };
        mysqlConnection.end();
    }
);