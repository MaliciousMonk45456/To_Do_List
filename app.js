//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require('mongoose');
// const uri = "mongodb+srv://tripathiaryan361:eBd9zsihFGVOd46W@cluster0.xtr1rua.mongodb.net/BlogDB?retryWrites=true&w=majority";
const uri=process.env.uri;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

    mongoose.connect(uri);

    const itemSchema=new mongoose.Schema({
      name:String
    });

    const Item=mongoose.model("Item",itemSchema);

    const item1=new Item({
      name:"Welcome to your todolist"
    });

    const item2=new Item({
      name:"Hit the + button to add a new item"
    });

    const item3=new Item({
      name:"<--Hit this to delete an item"
    });

    const listSchema=new mongoose.Schema({
      name:String,
      items:[itemSchema]
    });

    const List=mongoose.model("List",listSchema);

    const defaultitems=[item1,item2,item3];

    //console.log(Item.find({},'name'));

    app.get("/",async function(req, res) {
      founditems=await Item.find({});
      if(founditems.length===0){
        Item.insertMany(defaultitems);
        res.redirect("/");
      }
      else{
        res.render("list", {listTitle: "Today", newListItems: founditems});
      }
    });
    
    app.post("/",async function(req, res){
    
      const itemname = req.body.newItem;
      const listtitle=req.body.list;
      const itemnext=new Item({
        name:itemname
      });
      
      if(listtitle==="Today"){
        await itemnext.save();
        res.redirect("/")
      } else {
        founditems=await List.findOne({name:listtitle});
        founditems.items.push(itemnext);
        await founditems.save();
        res.redirect("/"+listtitle);
      }

    });
    
    app.post("/delete",async function(req,res){
      //console.log(req.body.checkbox);
      const idtorem=req.body.checkbox;
      const listname=req.body.listName;

      if(listname==="Today"){
        await Item.findByIdAndDelete(idtorem);
        res.redirect("/")
      } else{
        await List.findOneAndUpdate({name:listname},{$pull:{items:{_id:idtorem}}}); 
        res.redirect("/"+listname);                
      }
    });

    app.get("/:customListName",async function(req,res){
      customlistname=req.params.customListName;
      
      const foundlist=await List.findOne({name:customlistname});

      if(!foundlist){
        const deflist=new List({
          name:customlistname,
          items:defaultitems
        });
        await deflist.save();
        res.redirect("/"+customlistname);
      }
      else{
        res.render("list",{listTitle:foundlist.name,newListItems:foundlist.items});
      }  
    });

    // app.get("/work", function(req,res){
    //   res.render("list", {listTitle: "Work List", newListItems: workItems});
    // });
    
    // app.get("/about", function(req, res){
    //   res.render("about");
    // });
    
    app.listen(3000, function() {
      console.log("Server started on port 3000");
    });

