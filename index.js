
// add default objects
// add edit routes


import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: process.env.database,
  password: process.env.password,
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { _id: 1, title: "Welcome to your todolist" },
  { _id: 2, title: "Hit the + button to add a new item" },
  { _id: 3, title: "<--Hit this to delete an item" }
];

app.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM items WHERE listname='Today' ORDER BY _id ASC");
    items = result.rows;

    if(result.rows==""){
      await db.query("INSERT INTO lists(title) VALUES('Today')");
      await db.query("INSERT INTO items(title,listname) VALUES('Welcome to your todolist','Today'),('Hit the + button to add a new item','Today'),('<--Hit this to delete an item','Today')");
      res.redirect('/');      
    }

    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  const listname=req.body.list;
  // items.push({title: item});
  const result=await db.query("SELECT title FROM lists WHERE title=$1",[listname]);
  // console.log("result.rows=",result.rows);
  if(result.rows==""){
    // console.log("control");
    await db.query("INSERT INTO lists (title) VALUES ($1)", [listname]);
  } 
  await db.query("INSERT INTO items (title,listname) VALUES ($1,$2)", [item,listname]);
  if(listname==="Today"){
    res.redirect('/');
  }else {
    res.redirect('/'+listname);
  }
});

app.post("/edit", async (req, res) => {
  // const item = req.body.updatedItemTitle;
  // const id = req.body.updatedItemId;

  const idtoupdate=req.body.updatedItemId;
  const datatoupdate=req.body.updatedItemTitle;
  const listname=req.body.listname;

  await db.query("UPDATE items SET title = ($1) WHERE _id = $2 AND listname=$3", [datatoupdate, idtoupdate,listname]);

  if(listname=="Today"){
    res.redirect('/');
  }else{
    res.redirect('/'+listname);
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  const listname=req.body.listName;
  // console.log("id=",id);
  // console.log("listname=",listname);
  const result=await db.query("SELECT COUNT(title) AS cnt FROM items WHERE listname=$1",[listname]);
  await db.query("DELETE FROM items WHERE _id = $1", [id]);
  if(result.rows[0].cnt==1){
    await db.query("DELETE FROM lists WHERE title=$1",[listname]);
  }
  if(listname==="Today"){
    res.redirect("/");
  } else{
    res.redirect('/'+listname);
  }
});

app.get("/:customListName",async function(req,res){
  const customlistname=req.params.customListName;

  const result = await db.query("SELECT * FROM items WHERE listname=$1 ORDER BY _id ASC",[customlistname]);
    items = result.rows;

    if(result.rows==""){
      await db.query("INSERT INTO lists(title) VALUES($1)",[customlistname]);
      await db.query("INSERT INTO items(title,listname) VALUES('Welcome to your todolist',$1),('Hit the + button to add a new item',$1),('<--Hit this to delete an item',$1)",[customlistname]);
      res.redirect('/'+customlistname);      
    }
  const resultlist=await db.query("SELECT i.* FROM items AS i JOIN lists AS l ON i.listname=l.title WHERE l.title=$1",[customlistname]); 

  res.render("index.ejs",{listTitle:customlistname,listItems:resultlist.rows});
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// uncomment below code for nosql and mongodb

// import dotenv from 'dotenv';
// dotenv.config();
// import express from "express";
// import bodyParser from "body-parser";
// import { connect, Schema, model } from 'mongoose';
// const uri=process.env.uri;

// const app = express();

// app.set('view engine', 'ejs');

// app.use(bodyParser.urlencoded({extended: true}));
// app.use(express.static("public"));

// connect(uri);

// const itemSchema=new Schema({
//   name:String
// });

// const Item=model("Item",itemSchema);

// const item1=new Item({
//   name:"Welcome to your todolist"
// });

// const item2=new Item({
//   name:"Hit the + button to add a new item"
// });

// const item3=new Item({
//   name:"<--Hit this to delete an item"
// });

// const listSchema=new Schema({
//   name:String,
//   items:[itemSchema]
// });

// const List=model("List",listSchema);

// const defaultitems=[item1,item2,item3];

// app.get("/",async function(req, res) {
//   const founditems=await Item.find({});
//   if(founditems.length===0){
//     Item.insertMany(defaultitems);
//     res.redirect("/");
//   }
//   else{
//     // console.log(founditems);
//     res.render("index", {listTitle: "Today", listItems: founditems});
//   }
// });

// app.post("/add",async function(req,res){
//   const itemname=req.body.newItem;
//   const listname=req.body.list;
//   const itemnext=new Item({
//     name:itemname
//   });
//   if(listname==="Today"){
//     await itemnext.save();
//     res.redirect('/');
//   }else {
//     const founditems=await List.findOne({name:listname});
//     founditems.items.push(itemnext);
//     await founditems.save();
//     res.redirect("/"+listname);
//   }
// });

// app.post("/delete",async function(req,res){
//   const idtorem=req.body.deleteItemId;
//   const listname=req.body.listName;

//   if(listname==="Today"){
//     await Item.findByIdAndDelete(idtorem);
//     res.redirect('/');
//   }else {
//     await List.findOneAndUpdate({name:listname},{$pull:{items:{_id:idtorem}}}); 
//     res.redirect("/"+listname);
//   }
// });

// app.post("/edit",async function(req,res){
//   const idtoupdate=req.body.updatedItemId;
//   const datatoupdate=req.body.updatedItemTitle;
//   const listname=req.body.listname;

//   if(listname==="Today"){
//     await Item.findByIdAndUpdate(idtoupdate,{name:datatoupdate});
//     res.redirect('/');
//   } else{
//     let foundlist=await List.findOne({name:listname});
//     foundlist.items=foundlist.items.filter((item)=>{
//       if(item._id==idtoupdate){
//         item.name=datatoupdate;
//       } 
//       return item;
//     })
//     await foundlist.save();
//     res.redirect('/'+listname);
//   }
// });

// app.get("/:customListName",async function(req,res){
//   const customlistname=req.params.customListName;
  
//   const foundlist=await List.findOne({name:customlistname});

//   if(!foundlist){
//     const deflist=new List({
//       name:customlistname,
//       items:defaultitems
//     });
//     await deflist.save();
//     res.redirect("/"+customlistname);
//   }
//   else{
//     res.render("index",{listTitle:foundlist.name,listItems:foundlist.items});
//   }  
// });

// app.listen(3000,function(){
//   console.log("Server started on port 3000");
// })



