const mongoose = require('mongoose');
const User = require('./user');
const StoreItem = require('./storeitem');

const CartSchema = new mongoose.Schema(
    {
        ownerID: String,
        //owner: { type: mongoose.ObjectId, ref: 'User' },
        cartItems: [{
            quantity: Number,
            storeItem: { type: mongoose.ObjectId, ref: 'StoreItem' }
        }]
    })

const Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart;