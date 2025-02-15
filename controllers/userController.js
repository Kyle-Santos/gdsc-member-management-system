const User = require('../models/Member');
//const bcrypt = require('bcrypt');

const createUser = async(req, res) => {
    const {firstname, lastname, email, password} = req.body;

    // confirm required fields
    if( !firstname || !lastname ||!email || !password) return res.status(400).json({'message': 'All credentials are required', 'data': req.body });

    // find duplicate user by email
    const userExisting = await User.findOne({email: email}).exec();
    if (userExisting) return res.status(409).json({'message': 'Email already used.', problem : 'email'});

    try{
        const lastID = await User.findOne({},{},{sort: {'userID': -1}}).exec();

        if (lastID){
            newUserID = lastID.userID + 1;
        }

        const hashedPass = await bcrypt.hash(password,10);

        await User.create({
            userID: newUserID,
            email: email,
            password: hashedPass,
            firstname: firstname,
            lastname: lastname
        });

        res.status(201).json({ 'success' : `New user created!`});

    }catch(error){
        res.status(500).json({message: 'error creating user'});
    }

}

const readUser = async(req, res) => {
    const {studentID} = req.body;

    try{
        const matchingUser = await User.findOne({studentId: studentID}).exec();
        res.status(201).json(matchingUser);

    }catch(error){
        res.status(500).json({message: 'error finding user'});
    }

}

const getUser = async(req, res) => {
    const selectedID = req.query.studentId;
    try {
        const matchingUser = await User.findOne({studentId: selectedID}).exec();
        res.status(201).json(matchingUser);

    }catch(error){
        res.status(500).json({message: 'error finding user'});
    }
}

const updateUser = async(req, res) => {
    const { editedUserData, id } = req.body;

    try {
    const updatedUser = await User.findOneAndUpdate({ studentId: id }, {
        $set: {
            email: editedUserData.email,
            contact: editedUserData.contactnum,
        }
    }, { new: true });
    
    if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const updateUserLogin = async(req, res) => {
    const {email, password} = req.body;
    const hashedPass = await bcrypt.hash(password,10);

    try{
        const updatedUser = await User.findOneAndUpdate({email}, {
          $set: {
            password: hashedPass
          }
        }, {new: true});
        
        if (!updatedUser) { // didn't find user
          return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({user:updatedUser});
    }catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
}

const deleteUser = async(req, res) => {
    const {studentID} = req.body;

    try{
        const deleteUser = await User.findOneAndDelete({studentID});

        if (deleteUser){
            return res.status(200).json({ message : 'User deleted successfuly'});
        } else{
            return res.status(404).json({ message : 'User not found'});
        }

    }catch(error){
        res.status(500).json({message: 'error deleting user'});
    }

}

const readAllMembers = async (req, res) => {
    try{
        const matchingUsers = await User.find({}).lean().exec();

        return matchingUsers;

    }catch(error){
        res.status(500).json({message: 'error finding users'});
    }
}
module.exports = { createUser, readUser, updateUser, updateUserLogin, deleteUser, readAllMembers };