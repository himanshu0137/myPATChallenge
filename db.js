const MongoClient = require('mongodb').MongoClient;

// const url = process.env.MongoURI || 'mongodb://localhost:27017';
const url = "mongodb+srv://himanshu:himanshu_mypat@cluster0-jt1k5.mongodb.net/test?retryWrites=true&w=majority"
const dbName = 'myPatDatabase';
var db;

function initDb() {
    return new Promise((resolve, reject) => {
        const client = new MongoClient(url, { useUnifiedTopology: true });
        client.connect((err) => {
            if (!err) {
                console.log("Connected successfully to server");
                db = client.db(dbName);
                resolve(db);
            }
            else{
                console.log(err);
                reject(err);
            }
        });
    });
}

module.exports = {
    db: db, 
    initDb: initDb
};

