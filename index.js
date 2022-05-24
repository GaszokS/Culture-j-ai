// Import
const express = require("express");
const consolidate = require('consolidate');
const bodyParser = require('body-parser')
const crypto = require('crypto');
const secret = 'SECRETKEY';

const db = require('./db');

// App Config
const app = express();
app.use(
    bodyParser.urlencoded({ extended: true }),
    express.static('content')
    );
app.set('views','Content', 'ejs');
app.engine('html', consolidate.hogan)
app.listen(3000);

// Routes
app.get("/", function(req, res){
    res.render("index.html");
});

app.get("/login", function(req, res){
    res.render("login.html");    
});

app.post("/login", function(req, res){
    const sha256Hasher = crypto.createHmac("sha256", secret);
    const hash = sha256Hasher.update(req.body.password).digest("hex");
    console.log(hash);
    res.render("login.html");
});

app.get("/register", function(req, res){
    res.render("register.html");
});

app.post("/register", function(req, res){
    const sha256Hasher = crypto.createHmac("sha256", secret);
    const hash = sha256Hasher.update(req.body.password).digest("hex");
    db.addToDB("mydb", "users", {username: req.body.id, password: hash});
    console.log(req.body);
    res.render("register.html");
});