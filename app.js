const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");

const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));

// using BodyParser
app.use(bodyParser.urlencoded({ extended: true }));

// connecting to local mongoose DB
mongoose.connect("mongodb://localhost:27017/wikiDB", { useNewUrlParser: true });

// Creating mongoose schema
const articleSchema = new mongoose.Schema({
    title: String,
    content: String
});

// Creating a collections in wikiDB
const Article = new mongoose.model("article", articleSchema);

////////////////////////////////////////////////////////Requests targeting all the articles////////////////////////////////////////////////////////////

// Chained Route handlers for "/articles" route
app.route("/articles")
    // handling get requests
    .get(function (req, res) {
        // sending all the articles using .find
        Article.find(function (err, foundArticles) {
            if (err) {
                res.send(err);
            } else {
                res.send(foundArticles);
            }
        });
    })
    // handling post requests
    .post(function (req, res) {

        // Parsing the posted article
        console.log(req.body.title);
        console.log(req.body.content);
        const newArticle = new Article({
            title: req.body.title,
            content: req.body.content
        });
        // saving the article
        newArticle.save(function (err) {
            if (err) {
                res.send(err);
            } else {
                res.send("Successfully added new article");
            }
        });
    })
    // deleting all the articles
    .delete(function (req, res) {
        // using .deleteMany without any filters deletes every object in the collection wikiDB
        Article.deleteMany({}, function (err) {
            if (err) {
                res.send(err);
            } else {
                res.send("Successfully deleted every articles");
            }
        });
    });

////////////////////////////////////////////////////////Requests targeting a specific article////////////////////////////////////////////////////////////

// using express route parameters
app.route("/articles/:articleName")
    .get(function (req, res) {
        // using findOne with title as a filter
        Article.findOne({ title: req.params.articleName }, function (err, foundArticle) {
            if (foundArticle) {
                res.send(foundArticle);
            } else {
                res.send("No article found..");
            }
        })
    })
    // handling update requests
    .put(function (req, res) {
        Article.update(
            { title: req.params.articleName },
            { title: req.body.title, content: req.body.content },
            // overwrite is set to true means we are changing the entire article
            { overwrite: true },
            function (err) {
                if (!err) {
                    res.send("Successfully updated article");
                }
            }
        );
    })
    .patch(function (req, res) {
        // updating particular attributes of the article
        Article.update(
            { title: req.params.articleName },
            { $set: req.body },
            function (err) {
                if (err) {
                    res.send(err);
                } else {
                    res.send("succesfully updated the item");
                }
            }
        );
    })
    // deleting specific articles
    .delete(function (req, res) {
        Article.deleteOne(
            { title: req.params.articleName },
            function (err) {
                if (err) {
                    res.send(err);
                } else {
                    res.send("Successfully deleted the article..");
                }
            }
        );
    });

app.listen(3000, function (req, res) {
    console.log("server started at port 3000");
});