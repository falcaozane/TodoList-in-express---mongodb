//jshint esversion:6
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const date = require(__dirname + "/date.js");
const app = express()
const port = 3000
app.set('view engine', 'ejs');
//import _ from 'lodash';
const _ = require('lodash')

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"))

//const items = ["Buy Food","Cook Food","Eat Food"]
//const workItems = []

//Set up default mongoose connection
const mongoDB = 'mongodb+srv://zane:9603Zane@notes.facuu4y.mongodb.net/todoListDB?retryWrites=true&w=majority';

mongoose.connect(mongoDB, { useNewUrlParser: true });
 //Get the default connection

const db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


const itemsSchema = {
  name: String
};

const Item = mongoose.model(
  "Item",
  itemsSchema
);

const item1 = new Item({
  name: "Welcome"
})

const item2 = new Item({
  name: "to the"
})

const item3 = new Item({
  name: "TodoList"
})

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


/*
//old way
Item.insertMany( defaultItems, function(err){
  if (err) {
    console.log(err)
  }
  else{
    console.log("inserted successfully")
  }
});
*/



/*
app.get('/', (req, res) => {
  //res.send('Hello World!')
    //const day = date.getDate();
    Item.find({}, function(err , foundItems){
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    });
    
});
*/
app.get('/', (req, res) => {
  
    Item.find({}).then((foundItems)=>{
        if (foundItems.length === 0) {
          Item.insertMany(defaultItems).then((err)=>{
            if (err) {
              console.log(err)
            }
            else{
              console.log("inserted successfully")
            }
          });
          res.redirect("/");
        }
        else{
          res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
    });
    
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then( foundList =>{
      if(!foundList){
        //console.log("Doesn't exist");
        // create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      }
      else{
        //console.log("Exist!");
        // existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
  })

});

app.post('/', (req,res)=>{

  //const item = req.body.newItem;
    /*
    if(req.body.list === "Work"){
      workItems.push(item);
      res.redirect("/work")
    }
    else{
      items.push(item)
      res.redirect("/")
    }
    */

    const itemName = req.body.newItem;
    const listName = req.body.list;

    //console.log(listName);

    const item = new Item({
      name: itemName
    });

    
    if (listName === "Today") {
      item.save();
      res.redirect("/");
    } 
    else {
      List.findOne({name: listName}).then(foundList =>{
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName)
      })
    }
})

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  //console.log(listName);

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId).then(function(err){
      if(!err) {
        //console.log("Deleted successfully");
        res.redirect("/");
      }
    })
    
  } 
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
      res.redirect("/" + listName);
    });
  }
  
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

/*

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
})

app.post("/work", function(req,res){
  const item = req.body.newItem
  workItems.push(item);
  res.redirect("/work");
})
*/

/*
var day ="";
  var currentDay = today.getDay()
  /*
  if (currentDay ===6 || currentDay === 0){
    day = "Weekend"
    //res.sendFile(__dirname+"/weekend.html")
  }
  else{
    //res.write("<h1>You got work to do !!</h1>")
    day = "Weekday"
    //res.sendFile(__dirname + "/weekday.html")
  }
  //
  switch (currentDay) {
    case 0:
        day = "Sunday"
        break;
    case 1:
        day = "Monday"
        break;
    case 2:
        day = "Tuesday"
        break;
    case 3:
        day = "Wednesday"
        break;
    case 4:
        day = "Thursday"
        break;
    case 5:
        day = "Friday"
        break;
    case 6:
        day = "Saturday"
        break;

    default:
        console.log("Error: day equals to =  "+ currentDay)
        break;
    }
*/ 