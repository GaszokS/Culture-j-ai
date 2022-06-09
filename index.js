// Import
const express = require("express");
const sessions = require("express-session");
const cookieParser = require("cookie-parser");
const consolidate = require('consolidate');
const bodyParser = require('body-parser');

const bcrypt = require('bcrypt');
const secret = 'SECRETKEY';

const db = require('./db');
var ObjectId = require('mongodb').ObjectId; // for ObjectId to work

// App Config
const app = express();
app.use(
    bodyParser.urlencoded({ extended: true })
);
app.engine('html', consolidate.hogan)
app.set('views', 'Content');

//session config
app.use(sessions({
    secret: secret,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false
}));

app.use(cookieParser());

//Usefull functions
function creatSession(userInfo, req, res) {
    delete userInfo.password;
    req.session.user = userInfo;
    console.log(req.session.user);
    res.redirect("/");
}

// Routes
app.get("/", function (req, res) {
    res.render("index.html", { user: req.session.user });
});

app.post("/", function (req, res) {
    var inputs = req.body.search;
    console.log(inputs);
    res.render("index.html", { user: req.session.user });
});



app.get("/login", function (req, res) {
    if (req.session.user) {
        res.redirect("/");
    } else {
        res.render("login.html");
    }
});

app.post("/login", async function (req, res) {
    var userInfo = await db.getOneFromCollection("UserInfo", "users", { username: req.body.username });

    if (userInfo != null) {
        if (await bcrypt.compare(req.body.password, userInfo.password)) {
            console.log("Login Successful");
            creatSession(userInfo, req, res);
        } else {
            res.render("login.html", { error: "Mauvais mots de passe" });
        }
    } else {
        res.render("login.html", { error: "L'utilisateur n'a pas été trouvé" });
    }
});

app.get("/register", function (req, res) {
    if (req.session.user) {
        res.redirect("/");
    } else {
        res.render("register.html");
    }
});

app.post("/register", async function (req, res) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    var UserExist = await db.isInCollection("UserInfo", "users", { username: req.body.username });
    var mailExist = await db.isInCollection("UserInfo", "users", { email: req.body.email });

    if (UserExist) {
        res.render("register.html", { error: "Le pseudo a déjà été utilisé" });
    } else if (mailExist) {
        res.render("register.html", { error: "L'Email a déjà été utilisé" });
    } else {
        db.addToDB("UserInfo", "users", { username: req.body.username, password: hash, email: req.body.email, poidsEnHabricot: req.body.poidsEnHabricot });
        creatSession(await db.getOneFromCollection("UserInfo", "users", { username: req.body.username }), req, res);
    }
});

app.get("/logout", function (req, res) {
    req.session.destroy();
    res.redirect("/");
});

app.get("/add", function (req, res) {
    if (req.session.user) {
        res.render("add.html");
    } else {
        res.redirect("/login");
    }
});

app.post("/add", async function (req, res) {
    if (!(req.body.question && req.body.reponse)) {
        res.render("add.html", { error: "Remplissez tout les champs" });
    } else {
        db.addToDB("Questions", "questions", { question: req.body.question, reponse: req.body.reponse, userId: req.session.user._id, CreationDate: new Date(), upVotes: 0 });
        res.render("add.html", { error: "Question créée avec succes !" });
    }
});

app.get("/account", async function (req, res) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        var questionsFromUser = await db.getFromCollection("Questions", "questions", { userId: req.session.user._id });
        console.log("Question of the user :\n", questionsFromUser);
        res.render("account.ejs", { user: req.session.user, cards: questionsFromUser });
    }
});

app.get("/card/:id", async function (req, res) {
    var id = req.params.id;

    try {
        var card = await db.getOneFromCollection("Questions", "questions", { _id: ObjectId(id) });
    } catch (error) {
        console.log("Not a valid id");
    }

    if (card != null) {
        res.render("questionCard.ejs", { card: card });
    } else {
        res.send("Error : Card not found");
    }
});

app.use(
    express.static('content')
);
app.listen(3000);