/*
haven't yet figured out how to use the same session instance from multiple files, so all routes are in index.js
 */


/*const express = require('express');
const Cart = require('../cart');
const StoreItem = require('../storeitem');
const cartRouter = express.Router();

const index = require("../index");

// add new item to cart by CartId; body contains store id and quantity
cartRouter.post('/cart/:CartId/cartItem', async (req, res) => {
    console.log("entered route");
    let foundCart;
    let foundStoreItem;
    try {
        foundCart = await Cart.findById(req.params.CartId);
        foundStoreItem = await StoreItem.findById(req.body.id);

        //push store item to cart
        if (foundCart && foundStoreItem) {
            const foundCartItem = foundCart.cartItems.find((cartItem) => {
                // I spent two days debugging this. Both IDs are equal but == and === will not return true
                // unless I typecast to string. I do not know why.
                return String(cartItem.storeItem._id) === String(foundStoreItem._id);
            });
            if (foundCartItem) {
                foundCartItem.quantity += req.body.quantity;
            } else {
                let newCartItem = {
                    quantity: req.body.quantity,
                    storeItem: foundStoreItem
                }
                foundCart.cartItems.push(newCartItem);
            }
            await foundCart.save();
        }

    } catch (e) {
        console.log(e);
    }

    res.send((foundStoreItem && foundCart) ? foundCart : 404);
});

// remove item from cart by CartId, cartItemId
cartRouter.delete('/cart/:CartId/cartItem/:cartItemId', async (req, res) => {
    let deletedCartItem;
    try{
        const foundCart = await Cart.findById(req.params.CartId);
        const foundCartItemIndex = foundCart.cartItems.indexOf(foundCart.cartItems.find( (cartItem) => {
            return String(cartItem._id) === String(req.params.cartItemId);
        }));

        if (foundCartItemIndex >= 0)
            deletedCartItem = foundCart.cartItems.splice(foundCartItemIndex, 1);
        await foundCart.save();
    } catch(e)
    {
        //console.log(e);
    }

    res.send(deletedCartItem ? deletedCartItem : 404);
});

module.exports = cartRouter;

 */