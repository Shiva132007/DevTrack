import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:[true,'Project name ie required'],
            trim:true
        },
        descripton:{
            type:String,
            default:'',
            trim:true,
        },
        createdBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true,
        },
        managers:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
        }],
        employee:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }],
        status:{
            type:String,
            enum:['active','completed','on_hold'],
            default:'active',
        },
        isActive:{
            type:Boolean,
            default:true
        },
    },
    {
        timestamps:true,
    }
)

const Project = mongoose.model('Project',ProjectSchema);

export default Project;