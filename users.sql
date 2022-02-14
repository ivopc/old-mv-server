-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: 30-Jun-2019 às 01:14
-- Versão do servidor: 10.3.14-MariaDB
-- versão do PHP: 7.3.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `id9221798_valle`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `reg_date` char(13) NOT NULL,
  `email` varchar(254) NOT NULL,
  `nickname` varchar(15) NOT NULL,
  `password` char(60) NOT NULL,
  `rank` tinyint(1) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Extraindo dados da tabela `users`
--

INSERT INTO `users` (`id`, `reg_date`, `email`, `nickname`, `password`, `rank`) VALUES
(1, '1558648555464', 'ivoopc@gmail.com', 'Ivopc', '$2y$10$7ISXGs3Q0WIcJCHO2G5TQeRzbe62tXHIawuH2StIwx453/BspNBhK', 0),
(2, '1558651707362', 'carlosyzeduardo@gmail.com', 'carlosyz', '$2y$10$YiiD7qw0Nt/aFPtTOnqReeDuJJs7N0iMasBL1Wchfc34NT2GjrEO6', 0),
(3, '1558653779679', 'adiel.vinicus@gmail.com', 'AdielV15', '$2y$10$XrzpS3hTgF53PoXXPlJ8JeXqnIa/9WQYe0lbYxv/kuiet3Wv6OdIq', 0),
(4, '1558656718161', 'felipe_barone25@hotmail.com', 'FelipeB', '$2y$10$ptvoII8aI4UwcZVP0rxWu.XN4fU6vy7LMjDohuvsGbt/E34YUQF8y', 0),
(5, '1558674958392', 'breno_jb5@hotmail.com', 'naglfari', '$2y$10$Q558qZAt4zLhN0RW/ja/WuyFHRwELKaYiFx9uTqHW/66S5VoEZ/Ye', 0),
(6, '1558714067611', 'zeltz1608@gmail.com', 'Klaben', '$2y$10$Rt9plByBV46tSu17IkQe6eQtqMx2hSuvtbKGKYhcBGDvbrULFBTfu', 0),
(7, '1558722930837', 'carlos', 'Rorsloth', '$2y$10$tnY0SeczVns9Q4hqsJtSnOrKxCms3bxlNVBLcfaBMYhz1ot1gPmBW', 0),
(8, '1558730138633', 'giozadi@hotmail.com', 'giozadi', '$2y$10$LWwXytyrTEFAykdqd9xtMuIdp.AU3I7FZVcZrsb9vk.dl4qrnHzK.', 0),
(10, '1558782104215', 'cristian-gc12@hotmail.com', 'Cryze', '$2y$10$AXORuGF11SJ0OEXdXTyyUeXPzu4jbiM85aEWP5QxYOSMS9MWAShwq', 0),
(11, '1558843857528', 'nicholas123458@gmail.com', 'kopaking', '$2y$10$gjhDImhnrRez/ztNRg8B8epUIEb678XIh3YFVDVGqGqdxggmkrj.y', 0),
(12, '1558885166269', 'gabriel.pio.espindola@gmail.com', 'Gabriel', '$2y$10$omURCrfVlrIMKx6AQDEo/uQOUXhMuCxDhW/QTcQgOUm6PQZbk6yaS', 0),
(13, '1558895971452', 'franneto2805@gmail.com', 'Neto_St', '$2y$10$BBcBig4FIS7YKfZp5ihoTuJoxUUUnufvdwaW8V7iT2c8Rub73uRKW', 0),
(14, '1558898982601', 'hhlyras2011@gmail.com', 'hlyras', '$2y$10$b7GCt2AXKzRmJsecrldqqueiz3oMSa1MXiOyoiXqZRHhHMu.YuYdC', 0),
(15, '1558918358926', 'rusleykcruz@gmail.com', 'rusleyrkc', '$2y$10$icN1x1ki6jqk0ElEYpeazuWMtbjo4jHZVr5R7tlct4efIPVfhctuu', 0),
(16, '1558918511984', 'batman.draw@live.com', 'guuuuuu', '$2y$10$/BtMwdVTg44dqIohmW1iOuizsQ2mPP5Ii04wu6xf5P0qLnF3oZ/RC', 0),
(17, '1558919022529', 'andrensaraiva@hotmail.com', 'andrensaraiva', '$2y$10$i2QG5Mx3cUZShlt6nf/b8uEt5yKAZVSrQJFEMwxIJwvETSUPiP1bq', 0),
(18, '1558935527449', 'kingcartoon20@gmail.com', 'KingIgor10', '$2y$10$8RbkpPS7HdnMeBepx4eMMeES231JOZf4oiNi5hcBfx.65QfqHVsNm', 0),
(19, '1558961546246', 'camargonick@hotmail.com', 'Gahengi', '$2y$10$5PdcxIU2EeX4iKhFsFPbnu0l8t5gQ7PILtPjTkzkdyhJcg.c6f6aa', 0),
(20, '1558972241075', 'craftzera@hotmail.com', 'JuanBLD', '$2y$10$oaArHvqr4IGoYKiBLsXMpuKsaZqgUF4oU0qa3Lyzvrp./jNUaO0Mq', 0),
(21, '1559071588345', 'breno_lotur@hotmail.com', 'Nexos', '$2y$10$G.9u7B6WmBzzq0W8/vdQM.eLTw3A2TmPPDfD2JawDzjj5PiTjLSsO', 0),
(22, '1559082689525', 'heidimeia@hotmail.com', 'megane-sama', '$2y$10$cjks51.gp9pvlNJLgT3SXOz6cX5k9o/y3Js6/NB6XdNJBZT3MnRyK', 0),
(23, '1559844713184', 'david.concha91@gmail.com', 'admin', '$2y$10$VVvA.ZUKuBR8zl/6zptrtuqf5M0TPzUKkhhP8U2veKUMXRBSslo62', 0);

--
-- Indexes for dumped tables
--

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
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
