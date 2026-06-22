import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required: [true,'Task title is required']

        },
        description:{
            type:String,
            default:"",
            trim: true,
        },
        status:{
            type: String,
            enum: ['todo', 'in_progress', 'review', 'done'],
            default: 'todo'
        },
        priority:{
            type:String,
            enum: ['low','medium','high'],
            default:'Medium'
        },
        assignedTo:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true,'Task must be assigned to someone'],
        },
        createdBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        project:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Project',
            default:null,
        },
        dueDate:{
            type:Date,
            default: null,
        },
        history: [
        {
        status: {
            type: String,
            enum: ['todo', 'in_progress', 'review', 'done'],
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        changedAt: {
            type: Date,
            default: Date.now,
        },
        note: {
            type: String,
            default: '',
        },
        },
    ],
        
    },
    {
        timestamps: true,
    }
)

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ createdBy: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;