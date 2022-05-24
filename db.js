var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/";

function connect(dbToUse, Collection, callback) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbToUse);
        callback(dbo, db, Collection);
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

module.exports = {connect, addToDB, addCollection};