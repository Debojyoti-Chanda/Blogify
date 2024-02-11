// All server logic connected over here

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const routes = require("./routes/index");

const csurf = require('tiny-csrf');
const cookieParser = require('cookie-parser');


const session = require("express-session");
const mongoDBStrore = require("connect-mongodb-session")(session);

const Users = require('./models/users');
const error = require("./controllers/error");

dotenv.config(); //This will load the variables from your .env file into process.env

const app = express();


//Session store in database
const store = new mongoDBStrore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Create a new cookie parser middleware function using the given secret and options.
app.use(cookieParser("cookie-parser-secret"));

//express-session middleware
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {},
  })
);



//Csrf prottection middleware 
app.use(
  csurf(
    "123456789iamasecret987654321look", // secret -- must be 32 bits or chars in length
    ["POST"], // the request methods we want CSRF protection for
    ["/detail", /\/detail\.*/i], // any URLs we want to exclude, either as strings or regexp
    [process.env.SITE_URL + "/service-worker.js"]  // any requests from here will not see the token and will not generate a new one
  )
);

// on req.session.user we are not able to get the moongoose methods as , the session store only the info , to get the functions we use req.user
app.use((req, res, next) => {
  // console.log(req.session.user);
  if (!req.session.user) {
    return next();   
  }
  Users.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

//It is useded to pass local variables to the views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken() ; //req.csrfToken()
  next();
})


// Set EJS as the view engine
app.set("view engine", "ejs");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => console.log(err));

// Routes
app.use("/", routes);
app.use(error.getError404);
app.use(error.getError500); //error handling middleware



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
