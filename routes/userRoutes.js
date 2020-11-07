/*
haven't yet figured out how to use the same session instance from multiple files, so all routes are in index.js
 */


/*const express = require('express');
const User = require('../user');
const Cart = require('../cart');

const userRouter = express.Router();

//get all users or get by filter query param using Regular Expression
userRouter.get('/users', async (req, res) => {
    let foundUsers = await User.find({
        firstName: new RegExp(req.query.firstName),
        lastName: new RegExp(req.query.lastName)
    }).populate('cart');

    res.send(foundUsers ? foundUsers : 404);
});

//get user by ID
userRouter.get('/user/:UserId', async (req, res) => {
    try {
        const foundUser = await User.findById(req.params.UserId).populate('cart');
        return res.send(foundUser ? foundUser :  404);
    } catch (e) {
        //console.log(e);
    }
    res.send(404);
});

//Create a user
userRouter.post('/user', async (req, res) => {
    const newUser = await User.create(req.body);
    newUser.cart = await Cart.create({
        ownerID: newUser._id,
        cartItems: []
    });
    await newUser.save();

    res.send(newUser ? newUser : 500);
});

//get user's cart
userRouter.get('/user/:UserId/cart', async (req, res) => {
    try {
        const foundUser = await User.findById(req.params.UserId).populate('cart');
        const foundCart = foundUser.cart;
        return res.send( foundCart ? foundCart : 404);
    } catch (e) {
        console.log(e);
    }

    res.send(404);
});

//empty cart by ID
userRouter.delete('/user/:UserId/cart', async (req, res) => {
    try {
        const foundUser = await User.findById(req.params.UserId).populate('cart');
        const foundCart = foundUser.cart;
        if (foundCart) {
            foundCart.cartItems = [];
            await foundUser.save();
            await foundCart.save();
        }

        return res.send(foundCart ? foundCart : 404);
    } catch (e) {
        console.log(e);
    }
    res.send(404);
});

module.exports = userRouter;
 */