import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

//CONNECT MONGOOSE
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

    } catch (error) {
        console.log(error);
        process.exit(1);

    }
}

//main().catch(error => console.log(error));
//async function main() {
  //  await mongoose.connect('mongodb://127.0.0.1:27017/wikiDB');
//}
//mongoose.connect('mongodb://127.0.0.1:27017/wikiDB');

//CREATE A SCHEMA
const { Schema } = mongoose;

const articleSchema = new Schema({
    title: String,
    content: String
});

//CREATE A MODEL
const Article = mongoose.model("Article", articleSchema);



//CHAINED ROUTE HANDLERS USING EXPRESS
//Requests targetting all articles
app.route("/articles")
    .get(async (req, res) => {
        try {
            const foundArticles = await Article.find();
            console.log(foundArticles);
            res.send(foundArticles);
        }
        catch (error) {
            console.log(error.message);
            res.send(error.message);
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
            console.log(newArticle);
            console.log("Successfuly added a new article.");
        }
        catch (error) {
            res.send(error.message);
            console.log(error.message);
        }
    })
    .delete(async (req, res) => {
        try {
            await Article.deleteMany({});
            res.send("Successfuly deleted all the articles.");
            console.log("Successfuly deleted all the articles.");

        }
        catch (error) {
            res.send(error.message);
            console.log(error.message);
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
        catch (error) {
            res.send(error.message);
            console.log(error.message);

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
        } catch (error) {
            res.send(error.message);
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
        catch (error) {
            console.log(error.message);
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
        catch (error) {
            res.send(error.message);
        }
    });

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening for requests on port ${PORT}`);
    });
});
//app.listen(3000, function () {
   // console.log(`Listening for requests on port ${3000}`);
//});