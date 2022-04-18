import mysql.connector
import json
import requests
from case_builder import build_verifyLikedBook_test_case

request_url='http://localhost:4000/verifyLikedBook' 

def test_verifyLikedBook(userId, bookId):
    dbBookcrossingTest = mysql.connector.connect(
    host="localhost",
    user="root",
    password="bcrs",
    database="db_bookcrossing"
    )

    dbQueryManager = dbBookcrossingTest.cursor()
    request_headers={
      'Bypass-Tunnel-Reminder':'true',
      'Content-Type': 'application/json'
    }
    request_body={
      'userId':userId,
      'bookId':bookId
    }
    
    dbQueryManager.execute("""SELECT * FROM tradeMatching 
     WHERE bookId={bookIdVal} AND userId={userIdVal}"""
     .format(bookIdVal=bookId, userIdVal=userId))
    squery = dbQueryManager.fetchall()
    print(squery)
    if(len(squery)>0):
        print('like in DB!')
        api_response=requests.post(request_url, headers=request_headers, data=json.dumps(request_body))
        casted_response = True if api_response.text=='true' else False
        dbBookcrossingTest.close()
        return casted_response==True
    else:
        print('Unexistent Like!')
        api_response=requests.post(request_url, headers=request_headers, data=json.dumps(request_body))
        casted_response = True if api_response.text=='true' else False
        dbBookcrossingTest.close()
        return casted_response==False

build_verifyLikedBook_test_case()
print(test_verifyLikedBook(1,3))
print(test_verifyLikedBook(1,2))