const path = require('path');
const fs = require('fs');
const { off } = require('process');
const eventController = require('../controllers/eventController');

function errorFn(err) {
    console.log("Error found");
    console.error(err);
  }

//adding schemas
const memberModel = require("../schemas/memberSchema");

// Read and parse the JSON file
const rawData = fs.readFileSync(path.join(__dirname, '../data/officer.json'));
const officer = JSON.parse(rawData);

function add(server){
    server.get('/', (req, res) => {
        res.render('landing-page', { 
            layout: 'index',
            title: "Home",
        });
            
    });

    // Route to handle form submission
    server.post('/submit-event', eventController.createEvent);
    
    // get officer page (for officer accounts)
    server.get('/officer', (req, res) => {
        res.render('officer', { 
            layout: 'index',
            title: "Officer",
            'officer': officer[0],
            isForOfficer: true,
        });
            
    });

    // get events page (admin)
    server.get('/events', async (req, res) => {
        try {
            const events = await eventController.readAllEvents();
    
            res.render('events', { 
                layout: 'index',
                title: "Events",
                isEvents: true,
                events: events
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching events' });
        }
    });

    server.get('/event/:id', async (req, res) => {
        try {
            const event = await eventController.readEvent(req.params.id);
            res.json(event);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching event details' });
        }
    });

    server.get('/members', (req,res) => {
        memberModel.find().lean().then(function(members){
            let selectedMember = members[0];
            res.render('members', {
                layout: 'index',
                title: "Members",
                isMembers: true,
                'member-list': members,
                'selected-member': selectedMember
            });
        }).catch(errorFn);
    });

    server.get('/member/:studentid', async (req,res) => {
        try {
            await memberModel.findOne({ studentid: req.params.studentid }).lean().then(function(member){
                if (member) {
                    res.json(member);
                } else {
                    res.status(404).json({ message: 'Member not found' });
                }
            }).catch(errorFn);
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching member details' });
        }
    });

    //ADDING USERS
    server.post('/add-member', async function(req, res){
        console.log(req.body);
        const {position, firstname, lastname, contact, email, studentid, password} = req.body;
        const newMember = new memberModel({
            position,
            firstname, 
            lastname,
            contact,
            email,
            studentid,
            password,
            profilepicture: "",
            violations: []
        });
        await newMember.save().then(function(){
            console.log('Added Member Successfully!', newMember);
            res.redirect('/members');
        });
    });

    //DELETING USERS
    server.post('/delete-member', async function(req,res){
        const{ studentid } = req.body;
        try {
            await memberModel.findOneAndDelete({ studentid });
            console.log('Deleted Member');
            res.redirect('/members');
        } catch (error) {
            errorFn(error);
            res.status(500).json({ message: 'Error deleting member' });
        }
    });

    server.get('/login', (req,res) => {
        res.render('login', {
            layout: 'index',
            title: "Login",
            isLogin: true
        });
    });
    // FOR TESTING ONLY
    server.get('/dbtester', (req, res) => {
        res.render('dbtester', {
            layout: 'index',
            title: "DBTester",
        });
    });
    

}

module.exports.add = add;