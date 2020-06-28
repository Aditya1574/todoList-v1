//jshint esversion: 6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

mongoose.connect("mongodb+srv://admin-Aditya:aditya@740860@cluster0-rtoix.mongodb.net/ItemDB" , {useUnifiedTopology: true , useNewUrlParser: true});

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Item = mongoose.model("Item", itemSchema);


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

// CREATION OF A DYNAMIC LIST

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})

const List = mongoose.model("list" , listSchema);

app.get("/" , function(req, res){

Item.find({}, function(err, items){
  if(err){
    console.log(err);
  } else {
   if(items.length === 0){
  const item1 = new Item({name: "Chant Hare Krishna"});
  const item2 = new Item({name: "Sing Kirtans"});
  const item3 = new Item({name: "Dance"});

  const defaultItems = [item1, item2, item3];

  Item.insertMany(defaultItems, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("SuccessFully Addded Default Items");
    }
  });
}else{
res.render("list", {listTitle: "Today" , nayaitem: items});
}
  }
});
// end of get()
});


app.get("/:name", function(req, res){
const listName = _.capitalize(req.params.name);
List.findOne({name: listName}, function(err, foundList){
if(!err){
    if(!(foundList)){
        const list = new List({
          name: listName,
          items: []
        });
        list.save(function(err){
          if(err){
            console.log(err);
          }else{
            res.render("list", {listTitle: listName , nayaitem: list.items});
          }
        });
    }else{
     res.render("list", {listTitle: foundList.name , nayaitem: foundList.items});
    }
}
});

});


app.post("/" , function(req, res){

const listName = req.body.list;

const newItem = new Item({
  name: req.body.newitem
});

if(listName === "Today"){

        newItem.save(function(err){
          if(err){
            console.log(err);
          }else{
            console.log(newItem.name + " Added SuccessFully");
            res.redirect("/");
          }
        });

     } else {
       List.findOne({name: listName} , function(err, foundList){
         if(err){
           console.log(err);
         } else {
          foundList.items.push(newItem);
          foundList.save();
          res.redirect("/" + listName);
         }
       });
     }

});


app.post("/delete", function(req, res){

const listName  = req.body.listName;
const checkedItem = req.body.checkbox;

if(listName === "Today")  {
Item.findByIdAndRemove(req.body.checkbox , function(err){
if(err){
  console.log(err);
}else{
  console.log("Deleted SuccessFully");
res.redirect("/");
}
});
} else {                                  //pull   from     pull-this
List.findOneAndUpdate({name: listName} , { $pull: {items: {_id: checkedItem}}}, function(err, foundList){
  if(err){
    console.log(err);
  }else{
    res.redirect("/" + listName);
  }
});
}

});



app.get("/about" , function(req, res){
  res.render("about");
});

app.listen(3000, function(){
  console.log("The server is Running Properly on port 3000");
});
