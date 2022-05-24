// Import
const express = require("express");
const consolidate = require('consolidate');
const bodyParser = require('body-parser')
// App Config
const app = express();
app.engine('html', consolidate.hogan)
app.set('views','Content');
app.use(
    bodyParser.urlencoded({ extended: true }),
    express.static('content')
);



// Routes
app.get("/", function(req, res){
    res.render("index.html");
});

app.post("/", function(req, res){
    var inputs = req.body.search;
    console.log(inputs);
    res.render("index.html");
});


app.listen(3000);