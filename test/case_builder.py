import mysql.connector

def build_confirmTrade_test_case():
    dbBookcrossingTest = mysql.connector.connect(
    host="localhost",
    user="root",
    password="bcrs",
    database="db_bookcrossing"
    )

    dbQueryManager = dbBookcrossingTest.cursor()

    disable_FKChecks = "SET FOREIGN_KEY_CHECKS = 0"
    dbQueryManager.execute(disable_FKChecks)

    tradeMatching_table_reset = """TRUNCATE TABLE tradeMatching"""
    dbQueryManager.execute(tradeMatching_table_reset)

    books_table_reset = """TRUNCATE TABLE books"""
    dbQueryManager.execute(books_table_reset)

    enable_FKChecks = "SET FOREIGN_KEY_CHECKS = 1"
    dbQueryManager.execute(enable_FKChecks)

    id_reset = """ALTER TABLE books AUTO_INCREMENT=1"""
    dbQueryManager.execute(id_reset)

    case_books_insertion = """INSERT INTO books 
    (title, author, language, gender, year, userName, userId) 
    VALUES (%s,%s,%s,%s,%s,%s,%s)"""

    case_books_values = [
      ('TestBook 1', 'TestAuthor 1', 'TestLanguage1', 'TestGender1', '1980', 'juan', 1),
      ('TestBook 2', 'TestAuthor 1', 'TestLanguage1', 'TestGender2', '1987', 'juan', 1),
      ('TestBook 3', 'TestAuthor 2', 'TestLanguage1', 'TestGender3', '2001', 'juan', 1),
      ('TestBook 4', 'TestAuthor 2', 'TestLanguage2', 'TestGender3', '1993', 'juan', 1),
      ('TestBook 5', 'TestAuthor 3', 'TestLanguage1', 'TestGender1', '1977', 'pedro', 2),
      ('TestBook 6', 'TestAuthor 3', 'TestLanguage1', 'TestGender2', '1965', 'pedro', 2),
      ('TestBook 7', 'TestAuthor 4', 'TestLanguage1', 'TestGender4', '1967', 'pedro', 2),
      ('TestBook 8', 'TestAuthor 4', 'TestLanguage2', 'TestGender5', '1999', 'pedro', 2),
    ]

    dbQueryManager.executemany(case_books_insertion, case_books_values)
    dbBookcrossingTest.commit()

    case_like_insertion = """INSERT INTO tradeMatching 
    (userId, ownerId, bookId, confirm, lockedBookId) 
    VALUES (%s,%s,%s,%s,%s)"""
    case_like_values = [
      (2,1,1,0,-1),
      (2,1,2,0,-1),
      (2,1,3,0,-1),
      (2,1,4,0,-1),
      (1,2,5,0,-1),
      (1,2,6,0,-1),
      (1,2,7,0,-1),
      (1,2,8,0,-1),
    ]

    dbQueryManager.executemany(case_like_insertion, case_like_values)
    dbBookcrossingTest.commit()

    dbBookcrossingTest.close() 