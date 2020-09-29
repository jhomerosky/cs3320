const express = require('express');
const app = express();
app.use(express.json());

console.log("reloaded");

let users = [];
let usersNextId = 0;

let storeItemsNextId = 0;
let storeItems = [
    {
        id: storeItemsNextId++,
        name: "apple"
    },
    {
        id: storeItemsNextId++,
        name: "banana"
    },
    {
        id: storeItemsNextId++,
        name: "guitar"
    },
    {
        id: storeItemsNextId++,
        name: "keyboard"
    },
    {
        id: storeItemsNextId++,
        name: "notebook"
    }
]

let carts = [];
let cartsNextId = 0;

let firstUser = {
    id: usersNextId++,
    firstName: "John",
    lastName: "Doe",
    email: "user@example.com",
    cart: {}
}

let secondUser = {
    id: usersNextId++,
    firstName: "Bob",
    lastName: "Dylan",
    email: "bob.dylan@gmail.com",
    cart: {}
}

// populating users
let firstCart = {
    id: cartsNextId++,
    owner: firstUser.id,
    cartItems: []
}

let secondCart = {
    id: cartsNextId++,
    owner: secondUser.id,
    cartItems: []
}

firstUser.cart = firstCart;
secondUser.cart = secondCart;

users.push(firstUser);
users.push(secondUser);

carts.push(firstCart);
carts.push(secondCart);


// populating carts
item = storeItems.find((storeItem) => {
        return storeItem.name === "apple";
    });
item.count = 2;
firstUser.cart.cartItems.push(item);

item = storeItems.find((storeItem) => {
        return storeItem.name === "banana";
    });
item.count = 4;
firstUser.cart.cartItems.push(item);
item.count = 3;
secondUser.cart.cartItems.push(item);

item = storeItems.find((storeItem) => {
        return storeItem.name === "guitar";
    });
item.count = 1;
secondUser.cart.cartItems.push(item);

item = storeItems.find((storeItem) => {
        return storeItem.name === "keyboard";
    });
item.count = 1;
firstUser.cart.cartItems.push(item);
secondUser.cart.cartItems.push(item);


// printing
//console.log(JSON.stringify(users));
//console.log(JSON.stringify(carts));
//console.log(JSON.stringify(storeItems));

//get all users
app.get('/users', (req, res) => {
    res.send(users);
});

//get user by ID
app.get('/user/:UserId', (req, res) => {
    const foundUser = users.find((user) => {
        return user.id == req.params.UserId;
    })
    res.send(foundUser ? foundUser : 404);
});

//Create a user
app.post('/user', (req, res) => {
    let newUser = req.body;
    newUser.id = usersNextId++;
    let newUserCart = {
        id: cartsNextId++,
        owner: newUser.id,
        cartItems: []
    }
    newUser.cart = newUserCart;
    carts.push(newUserCart);
    users.push(newUser);
    res.send(newUser);
});

//get user's cart
app.get('/user/:UserId/cart', (req, res) => {
    const foundCart = carts.find( (cart) => {
        return cart.owner == req.params.UserId;
    })
    res.send(foundCart ? foundCart : 404);
});

//empty cart by ID
app.delete('/user/:UserId/cart', (req, res) => {
    const foundUser = users.find( (user) => {
        return user.id == req.params.UserId;
    })
    const foundCartItems = foundUser.cart.cartItems;
    foundUser.cart.cartItems = [];
    res.send(foundCartItems ? foundUser.cart : 404);
});

app.post('/cart/:CartId/cartItem', (req, res) => {

});

app.listen(8080);
