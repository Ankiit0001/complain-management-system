const express = require('express');
const { check, validationResult} = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
//const auth = require('../middleware/auth');
//const fs = require('fs');

const Emp = require('../schema/emp');
const Otp = require('../schema/otpSchema');
const generateOtp = require('../apis/otpgeneration');

router.post(
    "/signup",
    [
        check("_id", "Please Enter a valid Employee Id")
        .notEmpty(),
        check("email", "Please Enter a Valid email")
        .isEmail(),
        check("password", "Please Enter a valid password(minimum 6 characters)").isLength({
            min: 6
        }),
    ],
    async (req, res) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return res.status(400).json({
                err: err.array()
            });
        }
        const {
            _id,
            name,
            email,
            password,
            departmentId,
            designationId,
            phone,
        } = req.body;
        console.log(req.body);
        try {
            let emp = await Emp.findOne({
                _id
            });
            if (emp) {
                return res.status(400).json({
                    msg: "User Already Exists"
                });
            }
            emp = new Emp({
                _id,
                name,
                email,
                password,
                departmentId,
                designationId,
                phone,
            });
            const salt = await bcrypt.genSalt(10);
            emp.password = await bcrypt.hash(password, salt);
            await emp.save();
            return (
                res.status(200).json({
                    msg: "Successfully signed in"
                })
            );
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Signing user");
        }
    }
);

router.post(
    '/login',
    [
        check("_id", "Please Enter a Employee Id")
        .notEmpty(),
        check("password", "Please Enter correct Password")
        .isLength({
            min: 6
        })
    ],
    async(req,res) => {
        console.log(req.body);
        const err = validationResult(req);
        if(!err.isEmpty()) {
            return res.status(400).json({
                err: err.array()
            });
        }
        const {
            _id,
            password
        } = req.body;
        console.log(req.body);
        try {
            const emp = await Emp.findOne({
                _id
            });
            if(!emp) {
                return res.status(400).json({
                    msg: "User does not exist"
                });
            } else {
                const isMatchPassword = await bcrypt.compare(password, emp.password);
                if(!isMatchPassword) {
                    return res.status(400).json({
                        msg: "Incorrect Password"
                    });
                } 
            }
            const payload = {
                emp: {
                    id: emp.id
                }
            }
            console.log(payload)
            jwt.sign(
                payload,
                "randomString", //some proper private key needs to be provided
                {
                    expiresIn: '30d', 
                },
                (err, token) => {
                    if(err)
                        throw err;
                    return res.status(200).json({
                        token: token,
                        empid: emp.id
                    });
                }
            );
        } catch(err) {
            console.error(err.message);
            res.status(500).json({
                message: "Internal server error"
            });
        }
    }
)


router.post(
    '/getotp',
    [
        check("email", "Please Enter a Valid Email")
        .notEmpty(),
    ],
    async (req,res) => {
        const err = validationResult(req);
        if(!err.isEmpty()) {
            return res.status(400).json({
                err: err.array()
            });
        }
        const { email } = req.body;
        try {
            const emp = await Emp.findOne({
                email
            });
            if(!emp) {
                return res.status(404).json({
                    msg: 'User does not exist',
                });
            }
            generateOtp(email, res);
        } catch(err) {
            console.error(err)
        }
    }
)


router.post(
    '/verifyotp',
    async (req,res) => {
        try {
            let { email, otp } = req.body;
            if(!email || !otp) {
                return res.status(404).json({
                    msg: 'Params are missing'
                })
            } 
            let empOtp = await Otp.findOne({
                email
            });
            if(!empOtp) {
                return res.status(404).json({
                    msg: 'records does not exists'
                })
            }
            const expiredAt = empOtp.expiredAt;
            const hashedOtp = empOtp.otp;

            if(expiredAt < Date.now()) {
                await Otp.deleteMany({ empId: email});
                return res.status(400).json({
                    msg: 'Code has expired'
                });
            }
            const isValidOtp = await bcrypt.compare(otp,hashedOtp);

            if(!isValidOtp) {
                return res.status(403).json({
                    msg: 'Wrong otp'
                })
            }
            await Otp.deleteMany({ empId: email});
            const emp = await Emp.findOne({
                email
            });
            const payload = {
                emp: {
                    id: emp.id
                }
            }
            jwt.sign(
                payload,
                'randomString',
                {
                    expiresIn: '30d'
                },
                (err,token) => {
                    if(err)
                        throw err
                    else {
                        return res.status(200).json({
                            token: token,
                            empid: emp.id
                        })
                    }
                }
            )
        } catch (err) {
            console.error(err);
            res.status(500).json({
                msg: 'Internal Server Error'
            })
        }
    }
)

//By only admin
router.post(
    "/update/:empId",
    async (req,res) => {
        const {
            name,
            email,
            departmentId,
            designationId,
            phone,
        } = req.body
        console.log(name)
        try {
            const paramsEmp = req.params.empId;
            console.log(paramsEmp)
            const newValues = {
                '$set': {
                    name: name,
                    email: email,
                    departmentId: departmentId,
                    designationId: designationId,
                    phone: phone
                }
            }
            const rsp = await Emp.updateOne(
                { _id: paramsEmp},
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
    "/updatePassword/:empId",
    async (req,res) => {
        const {
            oldpassword,
            newpassword,
        } = req.body;
        try{
            const paramsEmp = req.params.empId;
            const emp = await Emp.findOne({_id: paramsEmp});
            const salt = await bcrypt.genSalt(10);
            const isMatchPassword = await bcrypt.compare(oldpassword, emp.password);
            if(!isMatchPassword) {
                return res.status(400).json({
                    msg: "Incorrect Password"
                });
            } 
            const newhashpassword = await bcrypt.hash(newpassword, salt);
            const rsp = await Emp.updateOne(
                {_id: emp.id},
                {
                    '$set': {
                        password: newhashpassword
                    }
                }
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

module.exports = router;