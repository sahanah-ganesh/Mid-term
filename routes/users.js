//this file is for the routes using knex and postgres to update the database
//* equals which table we are looking at and which
"use strict";

const express = require('express');
const router  = express.Router();
const wolfApi = require ('../public/scripts/wolf-api.js');


///////////////////FUNCTIONS///////////////////


function findEmail(userId) {
  console.log('userId: ',userId);
  return new Promise (function(resolve, reject){
    let results;

    knex
        .select('*')
        .returning('id')
        .from('users')
        .where('id', userId)
        .then((email) => {
          console.log('results from findEmail: ',email[0]);
          results = email[0];
          return resolve(results);
        })
        .catch(error => reject(error));
      });
}


///////////////////MODULE EXPORTS///////////////////


module.exports = (knex) => {

  router.get("/", (req, res) => {
    knex
      .select("*")
      .from("users")
      .then((results) => {
        res.json(results);
    });
  });



/////////////LETICIA - CREATE BUTTON/////////////

  // get list page from user - items contents
  router.get("/list/items", (req, res) => {
    console.log('req.session.userId: ', req.session.userId);

    if (!req.session.userId) {
      res.status(401).send('Unauthorized').redirect('/urls');
    } else {
      knex
        .select("items.id", "what", "completed", "userID", "categoryID", "name")
        .from("items")
        .leftJoin('categories', 'categories.id', 'items.categoryID')
        .where('userID', req.session.userId)
        .orderBy('items.id')
        .then((results) => {
          console.log('results: ',results);
          res.json(results);
      });
    }
  });

  // select * from "items" left join "categories" on "categories"."id" = "items"."categoryID" where "userID" = 1 order by "items"."id";


  // create/post a new item in the list page -- replaced with AJAX code
  router.post("/list/items", (req, res) => {

    const what = req.body.newItem;
    let categoryID;

    console.log('req.session.userId: ', req.session.userId);
    console.log('req.body: ', req.body);
    console.log('req.body.newItem: ', req.body.newItem);

    wolfApi.categorizer(what, (error, result) =>{
      if (!error) {
        console.log("Success",result.category, result.type);
        categoryID = result.category;
      } else if (error === "No datatypes") {
        console.log("Search returned nothing",error, "Category =","Uncategorized");
        categoryID = 5;
      } else {
        console.log("ERROR",error);
        throw error;
      }

      console.log('categoryID: ', categoryID);
      // and put that inside category field
      knex('items')
        .insert([{'what': what, completed: 'false', userID: req.session.userId, 'categoryID': categoryID}])
        .then((results) => {
          res.json(results);
          res.send("It's Ok!!!");
      // render everything again/load items again --> in app.js
        });
    });
  });



/////////////LETICIA - END - CREATE BUTTON/////////////

router.delete("/", (req, res) => {
    console.log("started", req.body.itemId);
    knex('items')
      .where('id', req.body.itemId)
      .del()
      .then(() => res.send("Ok"))

});


//////////////////sahanah - edit///////////////////////



router.get("/list/items/:itemId/edit", (req, res) => {
  let itemName;
  let catName;
  let templateVars;

  function editItem(itemID) {
    knex
      .select("items.id", "what", "completed", "userID", "categoryID", "name", 'email')
      .from("items")
      .leftJoin("categories", "categories.id", "items.categoryID")
      .leftJoin("users", "users.id", "items.userID")
      .where('userID', req.session.userId)
      .where('items.id', itemID)
      .then((results) => {
        console.log('results from then: ',results);
        templateVars = {'itemName': results[0].what,
                        'catName': results[0].categoryID,
                        'itemId':  results[0].id,
                        'userId': req.session.userId,
                        'email': results[0].email
                        };
        console.log('templateVars: ',templateVars);
        res.render("items", templateVars);
      })
      .catch(error => res.status(403).send(error));
  }
editItem(req.params.itemId);
});



  router.post("/list/items/:itemId/edit", (req, res) => {

    console.log("update");
    console.log("itemID", req.params.itemId);
    console.log("newCatID", req.body.categories);
    console.log("itemName", req.body.newName);

    knex("items")
      .where("id", req.params.itemId)
      .update({categoryID: req.body.categories, what: req.body.newName})
      .then(() => res.redirect('/list')).catch(()=> console.log('err'));
  });

  return router;

  // router.get("/:userId/edit", (req, res) => {

  //   knex
  //     .select();
  // });

};


