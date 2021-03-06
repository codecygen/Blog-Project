//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

// console.log(process.env.email);

// Load the full build.
const _ = require('lodash');

const main = async () => {
  await mongoose.connect('mongodb://localhost:27017/blogDB');
};

main().catch(err => {
  console.log(err);
});

const blogPostSchema = new mongoose.Schema({
  title: String,
  content: String
});

// Pass third parameter if you dont want your collections to be plurilized by MongoDB
const blogPost = mongoose.model('blogpost', blogPostSchema, 'blogpost');

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let postArray = [];

blogPost.find((err, allPostsObj) => {
  if(!err) {
    console.log(allPostsObj);

    allPostsObj.forEach(postObj => {
      const post = {
        title: postObj.title,
        content: postObj.content
      }

      postArray.push(post);
    });

  } else {
    console.error(err);
  }
});

app.get('/', function(req, res){
  res.render(__dirname + "/views/home.ejs", {homeStartingContent: homeStartingContent, postArray: postArray});
});

app.get("/about", function(req, res) {
  res.render(__dirname + "/views/about.ejs", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res) {
  res.render(__dirname + "/views/contact.ejs", {contactContent: contactContent});
});

app.get("/compose", function(req, res) {
  res.render(__dirname + "/views/compose.ejs");
});

app.post('/', function(req, res) {
  let newPost = new blogPost({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  const saveData = () => {
    return new Promise((res) => {
        newPost.save();
        res();
    });
  };

  const findData = () => {
    return new Promise((res, rej) => {
      blogPost.find((err, allPostsObj) => {
        if(!err) {
          console.log(allPostsObj);
          res(allPostsObj);

          postArray = [];

          allPostsObj.forEach(postObj => {
            const post = {
              title: postObj.title,
              content: postObj.content
            }

            postArray.push(post);
          });

        } else {
          console.error(err);
          rej([]);
        }
      });
    });
  };

  const dbSaveShow = async () => {
    await saveData();
    await findData();
  };

  dbSaveShow();

  res.redirect('/');

});

// This is route parameters. Look for the details in the documentation of Express for route parameters. So that you can get different link requests.
app.get('/posts/:postName', function(req, res) {
  // Change requested title to lodash string so that it can be entered in any form (new title, new Title, new-title, New_title will be all same)
  // (They will all be equal to new title with _.lodash(string))
  const requestedTitle = _.lowerCase(req.params.postName);

  // Match posted blog title to the manually entered link and see if the blog title exists.
  for(i = 0; i < postArray.length; i++) {
    // Change requested title to lodash string so that it can be entered in any form (new title, new Title, new-title, New_title will be all same)
    // (They will all be equal to new title with _.lodash(string))
    const storedTitle = _.lowerCase(postArray[i].title);
    const totalPost = postArray.length;

    if(requestedTitle === storedTitle) {
      console.log('Match found!');
      const blogTitle = postArray[i].title;
      const blogContent = postArray[i].content;
      res.render(__dirname + "/views/post.ejs", {blogTitle: blogTitle, blogContent: blogContent});
      break;
    } else if (requestedTitle !== storedTitle && i === totalPost - 1) {
      console.log('No match found!');
    }
  }
});

const port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log(`Server started on port ${port}.`);
});
