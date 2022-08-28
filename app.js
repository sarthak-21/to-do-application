//jshint esversion:6
// Complete the comments for your FUTURE SELF

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// setting up database connection
mongoose.connect("mongodb+srv://demo:" + process.env.PASSWORD + "@cluster0.upmvb.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});
// create a schema
const itemsSchema = new mongoose.Schema({
  name: String
});
// database collection
const Item = mongoose.model("Item", itemsSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

// creating documents
const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "Checkbox to delete the item from the list."
});
// create a default array
const defaultArray = [item1, item2, item3];



app.get("/", function(req, res) {

  Item.find({}, function(err, result){

    if(result.length === 0)
    {
      Item.insertMany(defaultArray, function(err){
        if(err){
          console.log(err);
        }
      });
    }
    res.render("list", {listTitle: "Today", newListItems: result});
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if(listName === "Today")
  {
    newItem.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkItemId, function(err){
      if(err){
        console.log(err);
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}}, function(err, foundList){
      if(!err)
      {
        res.redirect("/" + listName);
      }
    });
  }

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, result){
    if(!err)
    {
      if(!result){
        // create a new list
        const list = new List({
          name: customListName,
          items: defaultArray
        });

        list.save();
        res.redirect("/" + customListName);
      }else{
        // show an existing list
        res.render("list", {listTitle: result.name, newListItems: result.items})
      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == "")
{
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
