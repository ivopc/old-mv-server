var mysqlConnection = require("mysql2").createPool({
    connectionLimit: 100,
    host: "localhost",
    user: "mv",
    password: "",
    database: "newvalle"
});

mysqlConnection.query("TRUNCATE TABLE `battle`");
mysqlConnection.query("TRUNCATE TABLE `battle_buffs_nerfs`");
mysqlConnection.query("TRUNCATE TABLE `battle_exp_share`");
mysqlConnection.query("TRUNCATE TABLE `tamer_bot_monsters_in_pocket`");
mysqlConnection.query("UPDATE `current_doing` SET `battle_type` = '0'");
mysqlConnection.query("DELETE FROM `monsters` WHERE `type` = '1'");
mysqlConnection.query("DELETE FROM `monsters` WHERE `type` = '2'");