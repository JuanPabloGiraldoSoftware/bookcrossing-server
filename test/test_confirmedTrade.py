import mysql.connector
import json
import requests
from case_builder import build_confirmTrade_test_case

request_url='http://localhost:4000/confirmTrade' 

def test_confirmTrade(idUsrT, idUsrO, idBookT, idBookO):
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
      'idUsrT':idUsrT,
      'idUsrO':idUsrO,
      'idBookT':idBookT,
      'idBookO':idBookO
    }
    dbQueryManager.execute("""SELECT * FROM tradeMatching 
    WHERE (ownerId={idUsrOVal} OR ownerId={idUsrTVal})
    AND (userId={idUsrTVal} OR userId={idUsrOVal})
    AND (bookId={idBookOVal} OR bookId={idBookTVal})"""
    .format(idUsrTVal=idUsrT, idUsrOVal=idUsrO, 
    idBookTVal=idBookT, idBookOVal=idBookO))
    squery = dbQueryManager.fetchall()
    print(squery)
    if len(squery) == 0: return
    indexT = 0 if squery[0][2]==idUsrT else 1
    indexO = 0 if indexT==1 else 1
    if(squery[indexT][4]):
        print('f')
        if(squery[indexT][5] == idBookO):
          print('ff')
          api_response = requests.post(request_url, headers=request_headers, data=json.dumps(request_body))
          print(api_response.text)
          dbBookcrossingTest.close()
          return api_response.text=='confirmed'
        else:
          print('fs')
          api_response = requests.post(request_url, headers=request_headers, data=json.dumps(request_body))
          print(api_response.text)
          dbBookcrossingTest.close()
          return api_response.text!='confirmed' and api_response.text!='pending'
    else:
      print('s')
      api_response = requests.post(request_url, headers=request_headers, data=json.dumps(request_body))
      print(api_response.text)
      dbBookcrossingTest.close()
      return api_response.text=='pending'

build_confirmTrade_test_case()
print(test_confirmTrade(1,2,4,5))
print(test_confirmTrade(2,1,5,1))
print(test_confirmTrade(2,1,5,4))
print(test_confirmTrade(3,3,3,3))
