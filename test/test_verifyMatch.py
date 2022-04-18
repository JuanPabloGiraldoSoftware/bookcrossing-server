import mysql.connector
import json
import requests
from case_builder import build_verifyMatch_test_case

request_url='http://localhost:4000/verifyMatch'

def test_verifyMatch(traderId, ownerId):
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
      'traderId':traderId,
      'ownerId':ownerId
    }

    disable_fullgroup = "SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))"
    dbQueryManager.execute(disable_fullgroup)

    dbQueryManager.execute("""SELECT ownerId, userId, COUNT(*) FROM tradeMatching 
     WHERE (ownerId={ownerIdVal} AND userId={traderIdVal}) 
     OR (ownerId={traderIdVal} AND userId={ownerIdVal})
     GROUP BY userId, ownerId"""
     .format(ownerIdVal=ownerId, traderIdVal=traderId))
    squery = dbQueryManager.fetchall()
    if len(squery)==2:
        dbQueryManager.execute("""SELECT * FROM tradeMatching 
        WHERE (ownerId={ownerIdVal} AND userId={traderIdVal}) 
        OR (ownerId={traderIdVal} AND userId={ownerIdVal})
        GROUP BY userId, ownerId"""
        .format(ownerIdVal=ownerId, traderIdVal=traderId))
        squery = dbQueryManager.fetchall()
        iBooks=dict()
        keyOwnerTrader = ownerId-traderId
        keyTraderOwner = traderId-ownerId
        iBooks[keyOwnerTrader]=[]
        iBooks[keyTraderOwner]=[]
        for i in range (len(squery)):
            currentKey = squery[i][1] - squery[i][2]
            iBooks[currentKey].append(squery[i][3])
        api_response=requests.post(request_url, headers=request_headers, data=json.dumps(request_body))
        dbBookcrossingTest.close()
        return api_response.text=="[[1],[2]]"
    else:
        api_response=requests.post(request_url, headers=request_headers, data=json.dumps(request_body))
        dbBookcrossingTest.close()
        return api_response.text=="false"
 

build_verifyMatch_test_case()
print(test_verifyMatch(1,2))
print(test_verifyMatch(1,3))
        