"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));


/////////////////////////ROUTES/////////////////////////

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

// get list page from user
app.get("/list", (req, res) => {
  console.log('Getting the list page...');
  res.render("list");
});





// get/redirect user to the edit item page
app.get("/items/:itemID/edit", (req, res) => {
  // identifies in wich item the user clicked
  // and pass that as a variable to edit the item ID she clicked!
  res.redirect("items");
});

// delete item from list page
app.delete("/items/:itemID/delete", (req, res) => {
  // identifies in wich item the user clicked
  // and delete that from the data base
  // render everything again/load items again
  res.render("list");
});

//TEST FUNCTION ONLY!
// get/redirect user to the edit item page
app.get("/items/:itemID/edit", (req, res) => {
 // identifies in wich item the user clicked
 // and pass that as a variable to edit the item ID she clicked!
 res.render("items");
});

// Clicked update button on item page allowing user to change item name, change category
// app.put("/users/:userID/list/items/:itemID/edit", (req, res) => {

//   if (item category changed) {
//     update database with new category;
//   }

//   if (item name changed) {
//     update databae with new item name;
//   }
//   //using knex to refresh table
//   res.redirect("index", updatedDatabase);
//   // res.redirect("index");

// });


app.put("/test_endpoint", (req, res) => {
  console.log("catID ", req.body.categoryID, "completed ", req.body.completed);
  res.json({'foo':'bar'});
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
