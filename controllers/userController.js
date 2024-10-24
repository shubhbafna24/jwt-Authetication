const User = require('../models/userModel');

const bcrypt =require('bcryptjs');

const {validationResult } =require('express-validator');

const mailer = require('../helpers/mailer');

const randomstring =require('randomstring');
const PasswordReset =require('../models/passwordReset');

const userRegister = async(req, res)=>{
    try {

        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                msg: 'Errors',
                errors:errors.array()
            })        
        }

        const { name , email, mobile , password}= req.body;

        const isExist = await User.findOne({ email });

        if(isExist){
            return res.status(400).json({
                success: false,
                msg: 'Email Already Exist'                
            })

        }


        const hashPassword = await bcrypt.hash(password,10);

        const user = new User({
            name,
            email,
            mobile,
            password:hashPassword,
            image:'images/'+ req.file.filename
        })
        const userData = await user.save();

        const msg = '<p> Hii, ' + name + ', Please <a href="http://127.0.0.1:3000/mail-verification?id=' + userData._id + '">Verify</a> your mail.</p>';

        mailer.sendMail(email,'Mail Verification ', msg);

        return res.status(200).json({
            success: true,
            msg: 'Registered Successfully !',
            user : userData
        })
        
    } catch (error) {
        //console.log(error.message);
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const mailVerification = async(req,res)=>{
    try {
        if(req.query.id == undefined){
            return res.render('404');
        }

        const userData = await User.findOne({_id: req.query.id })

        if(userData){

            if(userData.is_verified==1){
                return res.render('mail-verification',{message:"Your Mail is Already Verified !!"})
            }

            await User.findByIdAndUpdate({_id: req.query.id},{
                $set:{
                    is_verified:1
            }
        });

            return res.render('mail-verification', {message:'Mail has been verified Successfully '});
        }
        else{
            return res.render('mail-verification', {message:'User not Found !!'});
        }
        
    } catch (error) {
        console.log(error.message);
        return res.render('404');
    }
}

const sendMailVerification = async(req,res)=>{
    try {
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                msg: 'Errors',
                errors:errors.array()
            });
        }

        const { email } =req.body;

        const userData = await User.findOne({ email});

        if(!userData){
            return res.status(400).json({
                success: false,
                msg: "Email doesn't exist !"
            });
        }
        if(userData.is_verified == 1){
            return res.status(400).json({
                success: false,
                msg: userData.email + " mail is already verified !"
            });                        
        }   

        const msg = '<p> Hii, ' + userData.name + ', Please <a href="http://127.0.0.1:3000/mail-verification?id=' + userData._id + '">Verify</a> your mail.</p>';

        mailer.sendMail(userData.email,'Mail Verification ', msg);

        return res.status(200).json({
            success: true,
            msg: 'Verification link send to your mail, please check !!',
            user : userData
        })
        
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
}

const forgetPassword = async (req,res)=>{
    try {
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                msg: 'Errors',
                errors:errors.array()
            });
        }

        const { email } =req.body;

        const userData = await User.findOne({ email});

        if(!userData){
            return res.status(400).json({
                success: false,
                msg: "Email doesn't exist !"
            });
        }

        const randomString = randomstring.generate();
        const msg = '<p> Hii '+userData.name+', Please click <a href="http://127.0.0.1:3000/reset-password?token='+randomString+'">here</a> Reset your Password </p>'

        await PasswordReset.deleteMany({ user_id: userData._id});

        const passwordReset = new PasswordReset({
            user_id:userData._id,
            token:randomString
        });
        await passwordReset.save();

        mailer.sendMail(userData.email,'Reset Password',msg);

        return res.status(201).json({
            success:true,
            msg:'Reset Password Link sent to your Mail, Please Cheack !'
        })
        
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });        
    }
}

const resetPassword = async(req,res)=> {
    try {

        if(req.query.token == undefined){
            return res.render('404');
        }

        const resetData = await PasswordReset.findOne({token:req.query.token});

        if(!resetData){
            return res.render('404');
        }
        
        return res.render('reset-password',{ resetData })
        
    } catch (error) {
        return res.render('404');
    }
}

const updatePassword=async(req,res)=>{
    try {
        const { user_id , password,c_password} =req.body;

        const resetData = await PasswordReset.findOne({user_id});

        if(password!=c_password){
            return res.render('reset-password',{resetData, error:'Confirm Password is not matching'});
        }

        const hashedPassword = await bcrypt.hash(c_password,10);

        await User.findByIdAndUpdate({_id:user_id},{
            $set:{
                password:hashedPassword
            }
        });

        await PasswordReset.deleteMany({user_id});

        return res.redirect('/reset-success');

    } catch (error) {
        return res.render('404');
    }
}

const resetSuccess= async(req,res)=>{
    try {
        return res.render('reset-success');        
    } catch (error) {
        return res.render('404');        
    }
}

module.exports={
    userRegister,
    mailVerification,
    sendMailVerification,
    forgetPassword,
    resetPassword,
    updatePassword,
    resetSuccess

}