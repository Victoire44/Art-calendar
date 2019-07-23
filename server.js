// Dependencies
var express = require("express");
var logger = require("morgan")
// var mongojs = require("mongojs");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");


// Axios and cheerio for the web scraping
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var app = express();
var PORT = 3000;

// Sets up the Express app to handle data parsing
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder
app.use(express.static("public"));

//configure view engine for handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars")

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/auctions";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

//Routes

app.get("/scrape", function (req, res) {
    axios.get("https://www.sothebys.com/en/calendar").then(function (response) {
        var $ = cheerio.load(response.data);


        $(".Card").filter(function(i, element){
            return $(this).children(".Card-info").children(".Card-info-container").attr("href") != undefined
        }).each(function (i, element) {
            var result = {};

            result.media = $(this).children(".Card-media").find("img[data-style=portrait]").first().attr("data-src");
    
            var cardInfo = $(this).children(".Card-info").children(".Card-info-container");
            result.link = cardInfo.attr("href");
            result.title = cardInfo.children(".Card-title").text();
            result.details = cardInfo.children(".Card-details").text();


            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.error(err);
                });
        });
        res.send("Scrape Complete");
    });
});

app.get("/", function (req, res) {
    db.Article.find({ saved: false })
        .then(function (dbArticles) {
            console.log(dbArticles)
            res.render("home", {
                articles: dbArticles
            })
        })
        .catch(function (err) {
            console.error("err", err)
        });
});

app.get("/saved", function (req, res) {
    db.Article.find({ saved: true })
        .then(function (dbArticles) {
            res.render("saved", {
                articles: dbArticles
            })
        })
        .catch(function (err) {
            console.log("err", err)
        });
});

app.put("/articles/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, req.body)
        .then(function (response) {
            console.log(response)
            res.json(true)
        })
        .catch(function (err) {
            console.log(err)
        })
});

// app.put("/articles/:id/note", function (req, res) {
//     db.Article.create(result)
//                 .then(function (dbArticle) {
//                     console.log(dbArticle);
//                 })
//                 .catch(function (err) {
//                     console.error(err);
//                 });
// });


app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT);
});