CREATE TABLE `languages` (
  `iso639-1` varchar(2) COLLATE utf8_unicode_ci NOT NULL,
  `english_name` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `local_name` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `english_short` varchar(5) COLLATE utf8_unicode_ci DEFAULT NULL,
  `local_short` varchar(15) COLLATE utf8_unicode_ci DEFAULT NULL,
  `direction` varchar(3) COLLATE utf8_unicode_ci DEFAULT 'ltr',
  `active` smallint(1) DEFAULT '1',
  PRIMARY KEY (`iso639-1`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(600) COLLATE utf8_unicode_ci DEFAULT NULL,
  `password` varchar(70) COLLATE utf8_unicode_ci DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `fb_id` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `google_id` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `interface_language` varchar(2) COLLATE utf8_unicode_ci DEFAULT 'en',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  KEY `usr_ln` (`interface_language`),
  CONSTRAINT `usr_ln` FOREIGN KEY (`interface_language`) REFERENCES `languages` (`iso639-1`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `sessions` (
  `session_id` varchar(250) COLLATE utf8_unicode_ci NOT NULL,
  `user_id` int(11) NOT NULL,
  `time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`,`user_id`),
  KEY `sess_user_idx` (`user_id`),
  CONSTRAINT `sess_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `user_credentials` (
  `credential_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `title` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8_unicode_ci,
  PRIMARY KEY (`credential_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `user_credential_xref` (
  `user_id` int(11) NOT NULL,
  `credential_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`user_id`,`credential_id`),
  KEY `ucx_cred` (`credential_id`),
  CONSTRAINT `ucx_cred` FOREIGN KEY (`credential_id`) REFERENCES `user_credentials` (`credential_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `ucx_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
