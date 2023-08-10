//! import npm
const express = require("express");
const app = express();
const ConnectDB = require("./dbconfig");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateUser = require("./auth/auth");

//!.env
require("dotenv").config();
const PORT = process.env.PORT;

ConnectDB();

//! models
const Usermodel = require("./schema/UserSchema");
const Taskmodel = require("./schema/TaskSchema");

//!use middlewares
app.use(cors());
app.use(bodyParser.json());

//! signup
const Users = [];
app.post("/signup", async (req, res) => {
  const {name,email,password,phone,address,gender} = req.body;
  console.log(req.body);
  if (name&&email && password&& phone&& address && gender) {
    const hashedpassword = await bcrypt.hash(password, 10);
    try {
      const userExists = await Usermodel.findOne({
        email: email.toLowerCase(),
      });

      if (userExists) {
        res.send({ success: false, message: "User already exists" });
      } else {
        const newUser = await Usermodel.create({
          name: name,
          email: email.toLowerCase(),
          password: hashedpassword,
          phone: phone,
          address: address,
          gender:gender
        });

        res.send({
          success: true,
          message: "Sign up successfully",
          data: newUser,
        });
      }
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  } else {
    res.send({ success: false, message: "Please fill in all data correctly" });
  }
});







//! login
app.post("/signin", async (req, res) => {
  const {email,password} = req.body;

  if (email && password) {
    try {
      const existUser = await Usermodel.findOne({
        email: email.toLowerCase(),
      });
      if (existUser) {
        const passwordMatch = await bcrypt.compare( password, existUser.password );
        if (passwordMatch) {
          const token = jwt.sign({ userId: existUser._id }, process.env.SECERET_KEY);
          res.send({ success: true, message: "login successfully ", token: token});
        } else {
          res.send({ success: false,   message: "please enter a valid password" })}
      } else {
        res.send({ success: false, message: "user not found " });
      }
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  } else {
    res.send({ success: false, message: "please enter all fields" });
  }
});

//! add task
const tasks = [];
app.post("/addtask", authenticateUser, async (req, res) => {
  const { taskname, time, IsCompleted } = req.body;

  if (taskname && time) {
    const NewTask = await Taskmodel.create({ userId: req.userId, taskname, time, IsCompleted: false });
    tasks.push(NewTask);
    res.send({
      success: true,
      data: tasks,
      message: "task added successfully",
    });
  } else {
    res.send({ success: false, message: "fill all data required" });
  }
});

//! delete task from database
app.delete("/remove/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;

  if (id) {
    try {
      await Taskmodel.deleteOne({ _id: id });
      res.send({ success: true, message: "task deleted successfully" });
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  } else {
    res.send({ success: false, message: "no delete task found" });
  }
});

//! update task from database

app.patch("/update/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;

  if (id) {
    try {
      await Taskmodel.updateOne({ _id: id }, { $set: { IsCompleted: true } });
      res.send({ success: true, message: "task updated successfully" });
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  }
});

//! search task from database

app.get("/search/:searchtext", authenticateUser, async (req, res) => {
  const { searchtext } = req.params;
  if (searchtext) {
    try {
      const searched =  await Taskmodel.find({
        $and: [
       {taskname: { $regex: searchtext, $options: "i" } },
           { userId: req.userId}
        ]
   })
   
      if (searched.length > 0) {
        res.send({ success: true, FilterData: searched });
      } else {
        res.send({ success: false, message: "searching task not found" });
      }
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  } else {
    res.send({ success: false, message: "enter search value" });
  }
});

//! filtered by Status
app.get("/status/:Statustext", authenticateUser, async (req, res) => {
  const { Statustext } = req.params;

  try {
    if (Statustext) {
    if (Statustext === "pending") {
      
      const PendingTask =  await Taskmodel.find({
        $and: [
          { IsCompleted: { $ne:true} },
           { userId: req.userId}
        ]
   })
     
      res.send({ success: true, data:PendingTask });
      } else if (Statustext === "completed") {
        
        const CompletedTask =  await Taskmodel.find({
          $and: [
            { IsCompleted: {$exists: true , $ne:false} },
             { userId: req.userId}
          ]
     })
  
     res.send({ success: true, data:CompletedTask });
      } else {
        const all = await Taskmodel.find({ userId: req.userId });;
       
          res.send({ success: true, data:all });
      }
    }
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});
//! edit task 

app.post('/edittodo',authenticateUser,async(req,res)=>{
 const {taskId,updatedTaskText} = req.body ;
 try {
  if(taskId){
    await Taskmodel.findByIdAndUpdate({_id:taskId},{taskname:updatedTaskText})
   
  }
 } catch (error) {
  res.send({ success: false, message: error.message });
 }


})
//! get user  


app.get("/getuser", authenticateUser, async (req, res) => {
  const resp = await Usermodel.findById( req.userId );
console.log(res);
  res.send( resp );
});

app.get("/users",async (req, res) => {
  const resp = await Usermodel.find( );
  res.send(resp)

});


//!task getting to body
app.get("/", authenticateUser, async (req, res) => {
  const resp = await Taskmodel.find({ userId: req.userId });

  res.send( resp );
});

app.listen(PORT, () => {
  console.log(`server listening on ${PORT}`);
});
