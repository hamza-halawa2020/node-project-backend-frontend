const express = require("express")
const router = express.Router()
const event = require('../models/event.js')
const { check, validationResult } = require('express-validator'); // (express-validator package) to validate the form 
const moment = require('moment')//to edit in the date
const isAuthenticated = require('./middleware.js')


moment().format()//calling moment package


// show all cards

router.get('/', isAuthenticated, (req, res) => {
    event.find({})
        .then((events) => {
            let card = [];
            let cardSize = 3;
            for (let i = 0; i < events.length; i += cardSize) {
                card.push(events.slice(i, i + cardSize));
            }
            res.render('event/index', {
                card: card,
                message: req.flash('info')//when task saved show message to user done "the code in down :#954
            })
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Internal Server Error');
        });
});

//create new task
router.get('/create', isAuthenticated, (req, res) => {
    res.render('event/create', { result: req.flash('result') });
})

//save task to database
router.post('/create', [
    check('title').isLength({ min: 5 }).withMessage('title should be more than 5 char'),
    check('description').isLength({ min: 5 }).withMessage('description should be more than 5 char'),
    check('location').isLength({ min: 5 }).withMessage('location should be more than 5 char'),
    // check('date').isLength({ min: 5 }).withMessage('title should be more than 5 char'),

], (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        req.flash('result', result.array())
        res.redirect('/create')
        //res.render('event/create')
        console.log(result);
    } else {
        let newEvent = new event({
            title: req.body.title,
            description: req.body.description,
            location: req.body.location,
            user_id: req.user.id,
            date: req.body.date,
            created_at: Date.now()
        });
        newEvent.save()
            .then(savedEvent => {
                console.log('Event added successfully.', savedEvent);
                req.flash('info', "the task was created successfully")//#954
                res.redirect('/');
            })
            .catch(err => {
                console.error('Error adding event:', err);

            });
    }
});

// show single card
router.get('/:id', (req, res) => {
    console.log(req.params.id);

    event.findOne({ _id: req.params.id })
        .then((eventat) => {
            res.render('event/show', {
                eventat: eventat,
            })
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Internal Server Error');
        });
})

//edit task
router.get('/edit/:id', (req, res) => {
    event.findOne({ _id: req.params.id })
        .then((eventat) => {
            res.render('event/edit', {
                eventat: eventat,
                eventDate: moment(eventat.date).format('YYY-MM-DD'),
                result: req.flash('result'),
                message: req.flash('info')
            })
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Internal Server Error');
        });
})

//save the edit 
router.post('/update', [
    check('title').isLength({ min: 5 }).withMessage('title should be more than 5 char'),
    check('description').isLength({ min: 5 }).withMessage('description should be more than 5 char'),
    check('location').isLength({ min: 5 }).withMessage('location should be more than 5 char'),
], async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        req.flash('result', result.array());
        res.redirect('/edit/' + req.body.id);
        console.log(result);
    } else {
        let updatedEvent = {
            title: req.body.title,
            description: req.body.description,
            location: req.body.location,
            date: req.body.date,
            //created_at: Date.now()
        };
        let query = { _id: req.body.id };


        try {
            await event.updateOne(query, updatedEvent);
            req.flash('info', "The task was updated successfully");
            event.findOne({ _id: req.body.id }) // Use req.body.id instead of req.params.id
                .then((eventat) => {
                    res.render('event/show', {
                        eventat: eventat,
                        user:req.user
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                });
        } catch (err) {
            console.log("err");
        }


    }
});


//delete task
router.delete('/delete/:id', async (req, res) => {

    let query = { _id: req.params.id }

    try {
        await event.deleteOne(query);
        res.status(200).json('deleted')
    } catch (err) {
        res.status(404).json('error404')
    }
})



module.exports = router 