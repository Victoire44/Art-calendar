// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var mongoose = require("mongoose");


// Axios and cheerio for the web scraping
var axios = require("axios");
var cheerio = require("cheerio");

var app = express();
var PORT = process.env.PORT || 8000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Database configuration
var databaseUrl = "sothebys";
var collections = ["auctions"];

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// Static directory
app.use(express.static("public"));

// Use mongojs to hook the database to the db variable
var db = mongojs(databaseUrl, collections)

// This makes sure that any errors are logged if mongodb runs into an issue
db.on("error", function (error) {
    console.log("Database Error:", error);
});

//Routes
app.get("/", function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.get("/scrape", function (req, res) {
    axios.get("https://www.sothebys.com/en/calendar").then(function (response) {
        var $ = cheerio.load(response.data);

        var results = [];
        $("a.card-info-container").each(function (i, element) {
            var title = $(this).find("div.card-title").text();
            var details = $(this).find("div.Card-details").text()
            var dots = $(this).find("div.Card-details").children("span.js-shave-char").text()

            results.push({
                link: title,
                details: details
            });
        });
        console.log(results);
    });
});
console.log("hi")

app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT);
  });


  