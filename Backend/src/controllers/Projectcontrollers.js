import Project from '../models/Project.js';
import User from '../models/User.js';

const createProject = async (req,res)=>{
    try {
        const { name, description, managers=[], employee=[]} = req.body;

        //Validate managers
        if(managers.length>0){
            const validatemanager = await User.find({ _id : { $in : managers },role : 'manager'});
            if(validatemanager.length !== managers.length){
                return res.status(400).json({
                    success:false,
                    message:"One or more manager IDs are invalid or not managers",
                });
            }
        }

        //Validate Employee
        if (employees.length > 0) {
            const validEmployees = await User.find({ _id: { $in: employees }, role: 'employee' });
            if (validEmployees.length !== employees.length) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more employee IDs are invalid or not employees',
                });
            }
        }

        const project = await Project.create({
            name,
            description,
            managers,
            employee,
            createdBy: req.User._id,
        });

        await project.populate([
            {path:'manager',select:'username email password'},
            {path:'employee',select:'username email password'},
            {path:"createdBy", select:"username email password"},
        ]);
        res.status(201).json({
            success:true,
            message:project
        });
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

const getProjects = async (req,res)=>{
    try {
        let filter={}

        if (req.User.role=="manager"){
            filter = {managers:req.User._id}
        }else if(req.User.role === 'employee'){
            filter = {employee:req.User._id}
        }

        const projects = await Project.find(filter)
        .populate('manager','username email password')
        .populate('employee','username email passowrd')
        .populate('createdBy','username email password')
        .sort({createdAt : -1})

        res.status(200).json({ success: true, count: projects.length, projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProjectsById = async (req,res)=>{
    try {
        const project = await Project.findById(req.params.id)
         .populate('manager','username email password')
         .populate('employee','username email password')
         .populate('createdBy','username email password')
        if(!project){
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        if(req.User.role === 'manager'){
            const isMember = project.managers.some((m) => m._id.toString() === req.user._id.toString());
            if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if (req.user.role === 'employee') {
            const isMember = project.employee.some((e) => e._id.toString() === req.user._id.toString());
            if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });
        }

         res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//Update project

const UpdateProject = async (req,res)=>{
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const allowField = ['name','description','status','isActive','managers','employee',];
        allowField.forEach((field)=>{
            if(req.body[filed] !== undefined) project[field]=req.body[field];
        });

        await project.save();
        await project.populate([
            {path:'managers',select:'username email password'},
            {path:'employee',select:'username email password'}
        ]);

        res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const Addmember = async (req,res)=>{
    try {
        const { userid,role }=req.body;
        const project = await Project.findById(req.params.id);
        if(!project){
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (role === 'manager') {
            if (!project.managers.includes(userId)) project.managers.push(userId);
        } else if (role === 'employee') {
            if (!project.employee.includes(userId)) project.employee.push(userId);
        } else {
            return res.status(400).json({ success: false, message: 'Role must be manager or employee' });
        }

        await project.save();
        res.status(201).json({
            success:true,
            project
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// REMOVE MEMBER FROM PROJECT 
const removeMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (role === 'manager') {
        project.managers = project.managers.filter((id) => id.toString() !== userId);
    } else if (role === 'employee') {
        project.employees = project.employee.filter((id) => id.toString() !== userId);
    } else {
        return res.status(400).json({ success: false, message: 'Role must be manager or employee' });
    }

    await project.save();
    res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── DELETE PROJECT (Admin only) ───────────────────────────────────────────────
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        res.status(200).json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}; 

export{
    getProjects,
    getProjectsById,
    createProject,
    UpdateProject,
    deleteProject,
    Addmember,
    removeMember
};
