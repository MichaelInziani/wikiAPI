const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

//TODO
//CONNECT MONGOOSE
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wikiDB');
}
//mongoose.connect('mongodb://127.0.0.1:27017/wikiDB');

//CREATE A SCHEMA
const { Schema } = mongoose;

const articleSchema = new Schema({
    title: String,
    content: String
});

//CREATE A MODEL
const Article = mongoose.model("Article", articleSchema);

//GET REQUESTS
//app.get("/articles", async (req, res) => {
  //  try {
   //     const foundArticles = await Article.find();
       // console.log(foundArticles);
  //      res.send(foundArticles);
  //  }
   // catch (err) {
       // console.log(err);
  //      res.send(err);
   // }
//});


//app.post("/articles", async (req, res) => {
 //   try {
     //   const newArticle = new Article({
    //        title: req.body.title,
     //       content: req.body.content
  //      })
  //      await newArticle.save();
  //      res.send("Successfuly added a new article.");
       // console.log("Successfuly added a new article.");
  //  }
 //   catch (err) {
   //     res.send(err);
       // console.log(err);
 //   }
//});

//app.delete("/articles", async (req, res) => {
  //  try {
  //      await Article.deleteMany({});
  //      res.send("Successfuly deleted all the articles.");
        //console.log("Successfuly deleted all the articles.");

   // }
   // catch (err) {
   //     res.send(err);
       // console.log(err);
 //   }
//});

//CHAINED ROUTE HANDLERS USING EXPRESS
//Requests targetting all articles
app.route("/articles")
    .get(async (req, res) => {
        try {
            const foundArticles = await Article.find();
            // console.log(foundArticles);
            res.send(foundArticles);
        }
        catch (err) {
            // console.log(err);
            res.send(err);
        }
    })
    .post(async (req, res) => {
        try {
            const newArticle = new Article({
                title: req.body.title,
                content: req.body.content
            })
            await newArticle.save();
            res.send("Successfuly added a new article.");
            // console.log("Successfuly added a new article.");
        }
        catch (err) {
            res.send(err);
            // console.log(err);
        }
    })
    .delete(async (req, res) => {
        try {
            await Article.deleteMany({});
            res.send("Successfuly deleted all the articles.");
            //console.log("Successfuly deleted all the articles.");

        }
        catch (err) {
            res.send(err);
            // console.log(err);
        }
    });


//Requests targetting a specific article
app.route("/articles/:articleTitle")
    .get(async (req, res) => {
        try {
            const foundArticle = await Article.findOne({
                title: req.params.articleTitle
            });
            if (foundArticle) {
                res.send(foundArticle);
            }
            else {
                res.send("No articles matching that title was found.");
            }
        }
        catch (err) {
            res.send(err);
            console.log(err);

            res.status(400).json({
                message: "Something went wrong",
            });
        }
    })

    .put(async (req, res) => {
        try {
            const { articleTitle } = req.params;
            const { title, content } = req.body;

            const result = await Article.findOneAndUpdate(
                { title: articleTitle },
                { title, content },
                { overwrite: true }
            );

            if (result.modifiedCount === 1) {
                res.send("Successfuly updated one document.");
            } else {
                res.send(`Article '${articleTitle}' not found`);
            }
        } catch (err) {
            res.send(err);
        }
    })

    .patch(async (req, res) => {
        try {
            const updatedArticle = await Article.findOneAndUpdate(
                { title: req.params.articleTitle },
                { title: req.body.title, content: req.body.content },
                { $set: req.body }
            );
            res.send({
                message: "Article updated successfuly for:", title: req.body.title, content: req.body.content
            });
        }
        catch (err) {
            console.log(err);
            res.send("Update failed");
            res.status(400).json({
                message: "Can't update the article",
            });
        }
    })

    .delete(async (req, res) => {
        try {
            await Article.deleteOne(
                { title: req.params.articleTitle }
            );
            res.send("Article deleted successfuly.");
        }
        catch (err) {
            res.send(err);
        }
    });

app.listen(3000, function () {
    console.log("Server started on port 3000");
});