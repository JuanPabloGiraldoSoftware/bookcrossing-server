/*Users table*/

CREATE TABLE users(
    id int NOT NULL AUTO_INCREMENT,
    username varchar(30),
    password varchar(30),
    email varchar(20),
    cel varchar(10),
    PRIMARY KEY (id)
)

/*Books table */

CREATE TABLE books(
    id int NOT NULL AUTO_INCREMENT,
    title varchar(30),
    author varchar(30),
    language varchar(30),
    gender varchar(30),
    year varchar(30),
    userName varchar(30),
    userId int NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (userId) REFERENCES users(id)
)

/*tradeMatching table */
CREATE TABLE tradeMatching(
    idTrade int NOT NULL AUTO_INCREMENT,
    userId int NOT NULL,
    ownerId int NOT NULL,
    bookId int NOT NULL,
    confirm boolean DEFAULT false,
    lockedBookId int DEFAULT -1,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (ownerId) REFERENCES users(id),
    FOREIGN KEY (bookId) REFERENCES books(id),
    PRIMARY KEY (idTrade)
)