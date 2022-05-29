const res = require('express/lib/response');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/";

async function connect(dbToUse, Collection, callback) {
    MongoClient.connect(url, async function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbToUse);
        return callback(dbo, db, Collection);
      });
}

function addToDB(dbToChange, collection, data) {
    connect(dbToChange, collection, function(dbo, db, collection) {
        dbo.collection(collection).insertOne(data, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
        });
    });
}

function addCollection(dbToChange, collection) {
    connect(dbToChange, collection, function(dbo, db, collection) {
        dbo.createCollection(collection, function(err, res) {
            if (err) throw err;
            console.log("Collection created!");
            db.close();
        });
    });
}

async function isInCollection(dbToUse, collection, data) {
    const client = await MongoClient.connect(url);
    var db = client.db(dbToUse);
    var res = await db.collection(collection).findOne(data);
    client.close();
    
    if (res != null) {
        return true;
    } else {
        return false;
    }
}

module.exports = {connect, addToDB, addCollection, isInCollection};