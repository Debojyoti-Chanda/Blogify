const Posts = require("../models/posts.js");
const Users = require("../models/users.js");
const mongoose = require("mongoose");
const MongoDB = require("mongodb");

const bcrypt = require("bcryptjs");

const { validationResult } = require("express-validator");

const POSTS_PER_PAGE = 10;

module.exports.getIndex = (req, res, next) => {
  // console.log(req.user._id.toString());
  // throw new Error("Login Required")  // we can't use this inside a async code
  const page = req.query.page;
  Posts.find()
    .skip((page - 1) * POSTS_PER_PAGE) //pagination
    .limit(POSTS_PER_PAGE)
    .then((posts) => {
      res.render("index", {
        posts: posts,
        currentUserId: req.user._id.toString(),
        isLogged: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      err = new Error("LogIn Required");
      err.httpStatusCode = 500;
      next(err); //when we pass error to next we skip all middlewares and move to error handling middleware
    });
};

module.exports.getLogin = (req, res, next) => {
  res.render("login", {});
};

module.exports.getLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};

module.exports.postLogin = (req, res, next) => {
  // res.setHeader('Set-Cookie', 'loggedIn=true');
  // console.log(req.get('Cookie'))
  const email = req.body.email;
  const password = req.body.password;

  // Login Validation Logic
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("login", { errorMessages: errors.array() });
  }

  if (!req.user) {
    Users.findOne({ email: email })
      .then((user) => {
        if (user == null) {
          throw new Error("User Does not exist");
        }
        bcrypt
          .compare(password, user.password)
          .then((doMatch) => {
            if (doMatch) {
              req.session.isLoggedIn = true;
              req.session.user = user;
              req.session.save((err) => {
                console.log(err);
                res.redirect("/");
              });
            } else {
              throw new Error("Password Not Correct");
            }
          })
          .catch((err) => {
            console.log(err.message);
            res.redirect("/login");
          });
      })
      .catch((err) => {
        console.log(err.message);
        res.redirect("/login");
      });
  } else {
    Users.findById(req.user._id.toString())
      .then((user) => {
        req.session.isLoggedIn = true; //we store it in the session server memeory,but not in database when we were not using store
        req.session.user = user; // now we are storing the session in database
        // console.log(user);
        req.session.save((err) => {
          //writing on the datbase might take some time , to ensure it is written database and then
          console.log(err); // redirect is fired
          res.redirect("/");
        });
      })
      .catch((err) => console.log(err));
  }
};

module.exports.getSignup = (req, res, next) => {
  res.render("signup", {});
};

module.exports.postSignup = (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  // Signup form validation added here
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("signup", { errorMessages: errors.array() });
  }

  Users.findOne({ email: email })
    .then((user) => {
      if (user) {
        console.log("Email has already been taken, user alraedy exists");
        return res.redirect("/login");
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const newUser = new Users({
            email: email,
            username: username,
            password: hashedPassword,
          });
          return newUser.save();
        })
        .then((result) => {
          // console.log(result);
          Users.findById(result._id.toString())
            .then((user) => {
              req.session.isLoggedIn = true;
              req.session.user = user;
              // console.log(user);
              req.session.save((err) => {
                console.log(err);
                res.redirect("/");
              });
            })
            .catch((err) => console.log(err));
          // res.redirect("/");
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports.postblog = (req, res, next) => {
  // const user = req.param.currentUser; // this wont work in Post requests , we have to send it in the body
  const title = req.body.title;
  const content = req.body.content;
  const userId = new MongoDB.ObjectId(req.body.currentUid);
  const time = new Date();

  Users.findById(userId)
    .then((userObj) => {
      return userObj.username;
    })
    .then((userName) => {
      const newPost = new Posts({
        title: title,
        content: content,
        createdAt: time,
        username: userName,
        userId: userId,
        comments: [],
      });
      newPost.save().then((result) => {
        console.log("new Post Added");
      });
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });
  res.redirect("/");
};

module.exports.postComment = (req, res, next) => {
  const comment = req.body.comment;
  const time = new Date();
  const commentUser = req.user.username;
  const PostUserId = req.body.PostUserId;
  // Find the post by ID
  const postId = PostUserId.toString(); // You need to replace this with the actual post ID
  Posts.findById(postId)
    .then((post) => {
      return post.postComment(comment, commentUser, time);
    })
    .then((result) => {
      console.log("Comment Added");
      res.redirect("/");
    })
    .catch((err) => {
      console.log("Error at Post Comment");
    });
};

module.exports.deleteComment = (req, res, next) => {
  const commentId = req.body.commentId;
  const UserName = req.body.commentUsername;
  const postId = req.body.postId.toString();
  // console.log(UserName);
  // console.log(req.user.username);
  if (UserName === req.user.username) {
    Posts.findById(postId)
      .then((post) => {
        return post.deleteComment(commentId);
      })
      .then((result) => {
        console.log("Comment Deleted");
        res.redirect("/");
      })
      .catch((err) => console.log(err));
  } else {
    console.log("You are not the author of the comment");
    res.redirect("/");
  }
};
