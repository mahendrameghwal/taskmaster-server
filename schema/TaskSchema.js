const mongoose= require('mongoose');

const TaskSchema = new mongoose.Schema({
    userId:mongoose.Types.ObjectId,
    taskname:String,
    time:String,
    IsCompleted:Boolean
});

const Taskmodel = mongoose.model("tasks",TaskSchema);
module.exports = Taskmodel;