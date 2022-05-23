// Import
const express = require("express");
const consolidate = require('consolidate');

// App Config
const app = express();
app.use(express.static("public"));
app.set('views','Content', 'ejs');
app.engine('html', consolidate.hogan)
app.listen(3000);

// Routes
app.get("/", function(req, res){
    res.render("index.html");
});