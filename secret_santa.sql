-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le :  Dim 08 mars 2020 à 19:51
-- Version du serveur :  10.3.9-MariaDB
-- Version de PHP :  7.2.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `secret_santa`
--

-- --------------------------------------------------------

--
-- Structure de la table `belong_to`
--

DROP TABLE IF EXISTS `belong_to`;
CREATE TABLE IF NOT EXISTS `belong_to` (
  `FK_idUser` int(11) NOT NULL,
  `FK_idGrp` int(11) NOT NULL,
  `grpAdmin` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`FK_idUser`,`FK_idGrp`),
  KEY `FK_idGrp` (`FK_idGrp`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `gift`
--

DROP TABLE IF EXISTS `gift`;
CREATE TABLE IF NOT EXISTS `gift` (
  `FK_idList` int(11) NOT NULL,
  `idGift` int(11) NOT NULL,
  `FK_buyer` int(11) DEFAULT NULL,
  `giftName` varchar(25) NOT NULL,
  `giftUrl` varchar(2048) DEFAULT NULL,
  `giftDescription` varchar(200) DEFAULT NULL,
  `giftPrice` int(4) DEFAULT NULL,
  PRIMARY KEY (`FK_idList`,`idGift`),
  KEY `FK_buyer` (`FK_buyer`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `grp`
--

DROP TABLE IF EXISTS `grp`;
CREATE TABLE IF NOT EXISTS `grp` (
  `idGrp` int(11) NOT NULL AUTO_INCREMENT,
  `grpName` varchar(25) NOT NULL,
  `grpCreationDate` date NOT NULL,
  PRIMARY KEY (`idGrp`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `invitation`
--

DROP TABLE IF EXISTS `invitation`;
CREATE TABLE IF NOT EXISTS `invitation` (
  `idInvitation` int(11) NOT NULL AUTO_INCREMENT,
  `FK_from` int(11) NOT NULL,
  `FK_to` int(11) NOT NULL,
  `FK_idGrp` int(11) NOT NULL,
  `invitationDate` datetime NOT NULL,
  `accepted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`idInvitation`),
  KEY `FK_idGrp` (`FK_idGrp`),
  KEY `FK_from` (`FK_from`),
  KEY `FK_to` (`FK_to`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `list`
--

DROP TABLE IF EXISTS `list`;
CREATE TABLE IF NOT EXISTS `list` (
  `idList` int(11) NOT NULL AUTO_INCREMENT,
  `FK_idUser` int(11) NOT NULL,
  `FK_idGrp` int(11) DEFAULT NULL,
  `listName` varchar(25) NOT NULL,
  `listModifDate` datetime NOT NULL,
  PRIMARY KEY (`idList`),
  KEY `FK_idUser` (`FK_idUser`),
  KEY `FK_idGrp` (`FK_idGrp`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `idUser` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(25) NOT NULL,
  `mail` varchar(50) NOT NULL,
  `pwdHash` varchar(129) NOT NULL,
  `salt` varchar(25) NOT NULL,
  PRIMARY KEY (`idUser`),
  UNIQUE KEY `mail` (`mail`),
  UNIQUE KEY `username` (`username`,`mail`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=latin1;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `belong_to`
--
ALTER TABLE `belong_to`
  ADD CONSTRAINT `belong_to_ibfk_1` FOREIGN KEY (`FK_idUser`) REFERENCES `user` (`idUser`),
  ADD CONSTRAINT `belong_to_ibfk_2` FOREIGN KEY (`FK_idGrp`) REFERENCES `grp` (`idGrp`);

--
-- Contraintes pour la table `gift`
--
ALTER TABLE `gift`
  ADD CONSTRAINT `gift_ibfk_3` FOREIGN KEY (`FK_idList`) REFERENCES `list` (`idList`),
  ADD CONSTRAINT `gift_ibfk_4` FOREIGN KEY (`FK_buyer`) REFERENCES `user` (`idUser`);

--
-- Contraintes pour la table `invitation`
--
ALTER TABLE `invitation`
  ADD CONSTRAINT `invitation_ibfk_3` FOREIGN KEY (`FK_idGrp`) REFERENCES `grp` (`idGrp`),
  ADD CONSTRAINT `invitation_ibfk_4` FOREIGN KEY (`FK_from`) REFERENCES `user` (`idUser`),
  ADD CONSTRAINT `invitation_ibfk_5` FOREIGN KEY (`FK_to`) REFERENCES `user` (`idUser`);

--
-- Contraintes pour la table `list`
--
ALTER TABLE `list`
  ADD CONSTRAINT `list_ibfk_1` FOREIGN KEY (`FK_idUser`) REFERENCES `user` (`idUser`),
  ADD CONSTRAINT `list_ibfk_2` FOREIGN KEY (`FK_idGrp`) REFERENCES `grp` (`idGrp`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
