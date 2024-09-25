-- CreateTable
CREATE TABLE `Statement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dateTime` DATETIME(3) NOT NULL,
    `transNo` DOUBLE NOT NULL,
    `credit` DOUBLE NOT NULL,
    `debit` DOUBLE NOT NULL,
    `detail` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
