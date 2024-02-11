const express = require("express");
const router = express.Router();
const main = require("../controllers/main");

const expValidator = require("express-validator");

// Post postBlog page
router.post("/postblog", main.postblog);

// Get Login Page
router.get("/login", main.getLogin);
// Get Signup Page
router.get("/signup", main.getSignup);
// Get LogoutPage
router.get("/logout", main.getLogout);
// Post Login Page
router.post(
  "/login",
  [
    expValidator.body("email", "Email Format Not correct").trim().isEmail(),
    expValidator
      .body("password", "Password length should be min 6 characters")
      .isLength({ min: 6 }),
  ],
  main.postLogin
);
// Post Signup Page
router.post(
  "/signup",
  [
    expValidator.body("email", "Email Format Not correct").trim().isEmail(),
    expValidator
      .body("password", "Password length should be min 6 characters")
      .isLength({ min: 6 }),
  ],
  main.postSignup
);

// Post Comment Page 
router.post('/comment', [expValidator.body("comment").trim()], main.postComment);

// post delete comment
router.post('/deletecomment', main.deleteComment);

// Get Index route
router.get("/", main.getIndex);


module.exports = router;
