const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Complaint_type = require('../schema/complaint_type');
const Complaint = require('../schema/complaint');
const Complaint_attendee = require('../schema/complaint_attendee');

const { check, validationResult} = require("express-validator");
const generateComplaintTypeId = require('../apis/complainttypeidgeneration');
const mongodb = require('mongodb');

router.post(
    "/addcomplaintType", 
    async (req, res) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return res.status(400).json({
                err: err.array()
            });
        }
        const { 
            complaintTypeName,
            departmentId,
        } = req.body;
        console.log(req.body);
        const complaintTypeID = generateComplaintTypeId(complaintTypeName,departmentId);
        console.log(complaintTypeID);
        try {
            let complaint_type = await Complaint_type.findOne({
                complaintTypeID
            });
            if (complaint_type) {
                return res.status(400).json({
                    msg: "Complaint Type Already Exists"
                });
            }
            complaint_type = new Complaint_type({
                complaintTypeID,
                complaintTypeName,
                departmentId,
            });
            await complaint_type.save();
            return (
                res.status(200).json({
                    msg: "Successfully added new complaint type"
                })
            );
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in adding new complaint type");
        }
    }
);

router.post(
    "/updatecomplainttype/:complaintTypeID",
    async (req,res) => {
        const {
            complaintTypeName,
            departmentId,
        } = req.body;
        const complaintTypeID = generateComplaintTypeId(complaintTypeName,departmentId);
        try{
            const paramsComplaint_type = req.params.complaintTypeID;
            console.log(paramsComplaint_type);
            const newValues = {
                '$set': {
                    complaintTypeID:complaintTypeID,
                    complaintTypeName:complaintTypeName,
                    departmentId:departmentId
                }
            }
            const rsp = await Complaint_type.updateOne(
                { complaintTypeID: paramsComplaint_type},
                //console.log(paramsComplaint_type),
                newValues,
            )
            if(rsp){
                console.log(rsp)
                return res.status(200).json({
                    msg: "updated"
                })
            }
        }
        catch(err) {
            console.error(err)
            return res.status(500).json({
                msg: "Internal server error"
            })
        }
    }
)

router.post(
    "/deletecomplainttype/:complaintTypeID",
    async (req,res) => {
        try{
            const paramsComplaint_type = req.params.complaintTypeID;
            console.log(paramsComplaint_type);
            
            let complaint_type = await Complaint_type.findOne({
                paramsComplaint_type 
            });
            if(!complaint_type) {
                return res.status(404).json({
                    msg: 'Complaint Type does not exists'
                })
            }

            await Complaint_type.deleteMany({ complaintTypeID:paramsComplaint_type });
            return res.status(400).json({
                    msg: 'Successfully Deleted'
                });
            
        }
        catch(err) {
            console.error(err)
            return res.status(500).json({
                msg: "Internal server error"
            })
        }
    }
)

router.post(
    "/addcomplaint", 
    async (req, res) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return res.status(400).json({
                err: err.array()
            });
        }
        const { 
            empId,
            origin_departmentId,
            complaint_departmentId,
            complaint_location,
            complaint_type_id,
            complaint_description,
        } = req.body;
        console.log(req.body);
        complaint_no=1
        try {
            let complaint = await Complaint.findOne({
                complaint_no
            });
            while (complaint) {
                complaint_no+=1;
                complaint = await Complaint.findOne({
                complaint_no
                });
            }
            complaint = new Complaint({
                complaint_no,
                empId,
                origin_departmentId,
                complaint_departmentId,
                complaint_location,
                complaint_type_id,
                complaint_description,

            })
            await complaint.save();
            return (
                res.status(200).json({
                    msg: "Successfully added new complaint"
                })
            );
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in adding new complaint");
        }
    }
);

router.post(
    "/addattendee/:complaint_no", 
    async (req, res) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return res.status(400).json({
                err: err.array()
            });
        }
        const { 
            attendee_empId,
            attendee_remark,
        } = req.body;
        console.log(req.body);
        const paramsComplaint_no = req.params.complaint_no;
        console.log(paramsComplaint_no);
        try {
            let complaint_attendee = await Complaint_attendee.findOne({
                complaint_no:paramsComplaint_no
            });

            if(complaint_attendee) {
                return res.status(404).json({
                    msg: 'Complaint_no already addressed'
                })
            }

            let complaint_no = paramsComplaint_no;
            complaint_attendee = new Complaint_attendee({
                complaint_no,
                attendee_empId,
                attendee_remark,
            })
        
            await complaint_attendee.save();
            return (
                res.status(200).json({
                    msg: "Successfully attended complaint"
                })
            );

        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in solving complaint");
        }
    }
);


router.post(
    "/updatestatus/:complaint_no", 
    async (req, res) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return res.status(400).json({
                err: err.array()
            });
        }
        const { 
            tickmark,
        } = req.body;
        console.log(req.body);
        const paramsComplaint_no = await req.params.complaint_no;
        try {
            if(tickmark==1){
            const newValues = await {
                '$set': {
                    complaint_status:"S"
                }
            }

            const rsp = await Complaint.updateOne(
                { complaint_no: paramsComplaint_no},
                newValues,
                
            )
            return (
                res.status(200).json({
                    msg: "Successfully updated complaint status"
                })
            );
            
            }
            return (
                res.status(200).json({
                    msg: "No updates"
                })
            );

        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in solving complaint");
        }
    }
);

router.get(
    '/mycomplaints/:empId',
    async (req, res) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return res.status(400).json({
                err: err.array()
            });
        }

        const paramsEmpId = req.params.empId;
        try {
           const my_complaint = await Complaint.aggregate([
                {
                  $lookup: {
                    from: "complaint_types",
                    localField: "complaint_type_id",
                    foreignField: "complaintTypeID",
                    as: "joinComplaint_type",
                  } 
                },
                  {
                    $match: {
                    empId: paramsEmpId
                    }
                  },
                {
                  $lookup: {
                    from: "departments",
                    localField: "complaint_departmentId",
                    foreignField: "departmentId",
                    as: "joindepartment"
                  }
                },
                {
                  $project: {
                    _id: 0,
                    complaint_no: 1,
                    complaint_status:1,
                    created_at:1,
                    "joinComplaint_type.complaintTypeName": 1,
                    "joindepartment.departmentName":1,
                  }
                }
              ])
              let my_complaintlist = []
              for await (const doc of my_complaint) {
                console.log(doc);
                my_complaintlist.push(doc);
              }              
              return res.json(my_complaintlist);
        } catch (err) {
            console.log(err.message);
            res.status(500).json({msg:"Error in solving complaint"});
        }
    }
);

router.get(
    '/mydepartmentcomplaintspending/:departmentId',
    async (req, res) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return res.status(400).json({
                err: err.array()
            });
        }

        const paramsdepartmentId = req.params.departmentId;
        try {
           const my_complaint = await Complaint.aggregate([
                {
                  $lookup: {
                    from: "complaint_types",
                    localField: "complaint_type_id",
                    foreignField: "complaintTypeID",
                    as: "joinComplaint_type",
                  } 
                },

                {
                  $lookup: {
                    from: "departments",
                    localField: "complaint_departmentId",
                    foreignField: "departmentId",
                    as: "joindepartment"
                  }
                },
                {
                    $match: {
                    complaint_departmentId: paramsdepartmentId,
                    complaint_status:"N"
                    }
                  },
                {
                  $project: {
                    _id: 0,
                    complaint_no: 1,
                    origin_departmentId:1,
                    complaint_status:1,
                    created_at:1,
                    "joinComplaint_type.complaintTypeName": 1,
                    "joindepartment.departmentName":1,
                  }
                }
              ])
              let my_complaintlist = []
              for await (const doc of my_complaint) {
                console.log(doc);
                my_complaintlist.push(doc);
              }              
              return res.json(my_complaintlist);
        } catch (err) {
            console.log(err.message);
            res.status(500).json({msg:"Error in solving complaint"});
        }
    }
);

router.get(
    '/mydepartmentcomplaintattended/:departmentId',
    async (req, res) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return res.status(400).json({
                err: err.array()
            });
        }

        const paramsdepartmentId = req.params.departmentId;
        try {
           const my_complaint = await Complaint.aggregate([
                {
                  $lookup: {
                    from: "complaint_types",
                    localField: "complaint_type_id",
                    foreignField: "complaintTypeID",
                    as: "joinComplaint_type",
                  } 
                },

                {
                  $lookup: {
                    from: "departments",
                    localField: "complaint_departmentId",
                    foreignField: "departmentId",
                    as: "joindepartment"
                  }
                },
                {
                    $lookup: {
                      from: "complaint_attendees",
                      localField: "complaint_no",
                      foreignField: "complaint_no",
                      as: "joinattendee"
                    }
                  },
                {
                    $match: {
                    complaint_departmentId: paramsdepartmentId,
                    complaint_status:"S"
                    }
                  },
                {
                  $project: {
                    _id: 0,
                    complaint_no: 1,
                    complaint_status:1,
                    created_at:1,
                    "joinattendee.solved_at":1,
                    "joinComplaint_type.complaintTypeName": 1,
                    "joindepartment.departmentName":1,
                  }
                }
              ])
              let my_complaintlist = []
              for await (const doc of my_complaint) {
                console.log(doc);
                my_complaintlist.push(doc);
              }              
              return res.json(my_complaintlist);
        } catch (err) {
            console.log(err.message);
            res.status(500).json({msg:"Error in solving complaint"});
        }
    }
);

router.get(
    '/departmentcomplaintsreports/:departmentId',
    async (req, res) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return res.status(400).json({
                err: err.array()
            });
        }

        const paramsdepartmentId = req.params.departmentId;
        try {
           const my_complaint = await Complaint.aggregate([
                {
                  $lookup: {
                    from: "complaint_types",
                    localField: "complaint_type_id",
                    foreignField: "complaintTypeID",
                    as: "joinComplaint_type",
                  } 
                },

                {
                  $lookup: {
                    from: "departments",
                    localField: "complaint_departmentId",
                    foreignField: "departmentId",
                    as: "joindepartment"
                  }
                },
                {
                    $match: {
                    complaint_departmentId: paramsdepartmentId,
                    }
                  },
                {
                  $project: {
                    _id: 0,
                    complaint_no: 1,
                    complaint_description:1,
                    complaint_status:1,
                    created_at:1,
                    "joinComplaint_type.complaintTypeName": 1,
                    "joindepartment.departmentName":1,
                  }
                }
              ])
              let my_complaintlist = []
              for await (const doc of my_complaint) {
                console.log(doc);
                my_complaintlist.push(doc);
              }              
              return res.json(my_complaintlist);
        } catch (err) {
            console.log(err.message);
            res.status(500).json({msg:"Error in solving complaint"});
        }
    }
);

router.get(
    '/employeecomplaintsreports/:empId',
    async (req, res) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return res.status(400).json({
                err: err.array()
            });
        }

        const paramsEmpId = req.params.empId;
        try {
           const my_complaint = await Complaint.aggregate([
                {
                  $lookup: {
                    from: "complaint_types",
                    localField: "complaint_type_id",
                    foreignField: "complaintTypeID",
                    as: "joinComplaint_type",
                  } 
                },

                {
                  $lookup: {
                    from: "departments",
                    localField: "complaint_departmentId",
                    foreignField: "departmentId",
                    as: "joindepartment"
                  }
                },
                {
                    $match: {
                    empId: paramsEmpId,
                    }
                  },
                {
                  $project: {
                    _id: 0,
                    complaint_no: 1,
                    complaint_description:1,
                    complaint_status:1,
                    created_at:1,
                    "joinComplaint_type.complaintTypeName": 1,
                    "joindepartment.departmentName":1,
                  }
                }
              ])
              let my_complaintlist = []
              for await (const doc of my_complaint) {
                console.log(doc);
                my_complaintlist.push(doc);
              }              
              return res.json(my_complaintlist);
        } catch (err) {
            console.log(err.message);
            res.status(500).json({msg:"Error in solving complaint"});
        }
    }
);

router.get(
    '/listofpendingcomplaints',
    async (req, res) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return res.status(400).json({
                err: err.array()
            });
        }

        try {
           const my_complaint = await Complaint.aggregate([
                {
                  $lookup: {
                    from: "complaint_types",
                    localField: "complaint_type_id",
                    foreignField: "complaintTypeID",
                    as: "joinComplaint_type",
                  } 
                },

                {
                    $match: {
                    complaint_status:"N",
                    }
                  },
                {
                  $project: {
                    _id: 0,
                    complaint_no: 1,
                    complaint_description:1,
                    complaint_status:1,
                    complaint_location:1,
                    created_at:1,
                    "joinComplaint_type.complaintTypeName": 1,
                  }
                }
              ])
              let my_complaintlist = []
              for await (const doc of my_complaint) {
                console.log(doc);
                my_complaintlist.push(doc);
              }              
              return res.json(my_complaintlist);
        } catch (err) {
            console.log(err.message);
            res.status(500).json({msg:"Error in solving complaint"});
        }
    }
);

router.get(
    '/listofattendedcomplaints',
    async (req, res) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return res.status(400).json({
                err: err.array()
            });
        }

        try {
           const my_complaint = await Complaint.aggregate([
                {
                  $lookup: {
                    from: "complaint_types",
                    localField: "complaint_type_id",
                    foreignField: "complaintTypeID",
                    as: "joinComplaint_type",
                  } 
                },

                {
                    $match: {
                    complaint_status:"S",
                    }
                  },
                {
                  $project: {
                    _id: 0,
                    complaint_no: 1,
                    complaint_description:1,
                    complaint_status:1,
                    complaint_location:1,
                    created_at:1,
                    "joinComplaint_type.complaintTypeName": 1,
                  }
                }
              ])
              let my_complaintlist = []
              for await (const doc of my_complaint) {
                console.log(doc);
                my_complaintlist.push(doc);
              }              
              return res.json(my_complaintlist);
        } catch (err) {
            console.log(err.message);
            res.status(500).json({msg:"Error in solving complaint"});
        }
    }
);

module.exports = router;