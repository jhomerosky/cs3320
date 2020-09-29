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
let storeItem = storeItems.find((storeItem) => {
        return storeItem.name === "apple";
    });
let item = {
    id: storeItem.id,
    name: storeItem.name,
    quantity: 2
}
firstUser.cart.cartItems.push(item);

storeItem = storeItems.find((storeItem) => {
        return storeItem.name === "banana";
    });
item = {
    id: storeItem.id,
    name: storeItem.name,
    quantity: 4
}
firstUser.cart.cartItems.push(item);

item = {
    id: storeItem.id,
    name: storeItem.name,
    quantity: 3
}
secondUser.cart.cartItems.push(item);

storeItem = storeItems.find((storeItem) => {
        return storeItem.name === "guitar";
    });
item = {
    id: storeItem.id,
    name: storeItem.name,
    quantity: 1
};
secondUser.cart.cartItems.push(item);


storeItem = storeItems.find((storeItem) => {
        return storeItem.name === "keyboard";
    });
item = {
    id: storeItem.id,
    name: storeItem.name,
    quantity: 1
}
firstUser.cart.cartItems.push(item);

item = {
    id: storeItem.id,
    name: storeItem.name,
    quantity: 1
}
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

// add new item to cart by CartId
app.post('/cart/:CartId/cartItem', (req, res) => {
    const foundCart = carts.find((cart) => {
        return cart.id == req.params.CartId;
    })
    if (!foundCart) return res.send(404);

    let foundCartItem = foundCart.cartItems.find((cartItem) => {
        return cartItem.id == req.body.id;
    });

    if (foundCartItem) {
        foundCartItem.quantity += req.body.quantity;
        return res.send(foundCart);
    } else {
        let foundStoreItem = storeItems.find((storeItem) => {
            return storeItem.id == req.body.id;
        });
        if (!foundStoreItem) return res.send(404);

        let newCartItem = {
            id: foundStoreItem.id,
            name: foundStoreItem.name,
            quantity: req.body.quantity
        };
        foundCart.cartItems.push(newCartItem);
        return res.send(foundCart);
    }

    res.send(404);
});

// remove item from cart by CartId, cartItemId
app.delete('/cart/:CartId/cartItem/:cartItemId', (req, res) => {
    let foundCart = carts.find((cart) => {
        return cart.id == req.params.CartId;
    })
    if (!foundCart) return res.send(404);
    const foundCartIndex = foundCart.cartItems.indexOf(foundCart.cartItems.find( (cartItem) => {
        return cartItem.id == req.params.cartItemId;
    }))

    let foundCartItem;
    if (foundCartIndex >= 0)
        foundCartItem = foundCart.cartItems.splice(foundCartIndex, 1);

    console.log(foundCartItem);
    res.send(foundCartItem ? foundCartItem : 404);
});
/*
Store Item:
GET /StoreItem/:StoreItemID – Get the store item’s details
GET /StoreItem?query=abc – Get all items that satisfy the regular expression query
 */
// get store item's details
app.get('/StoreItem/:StoreItemID', (req, res) => {
    const foundStoreItem = storeItems.find( (storeItem) => {
        return storeItem.id == req.params.StoreItemID;
    })
    res.send(foundStoreItem ? foundStoreItem : 404);
})

// get all items that satisfy the regular expression query
app.get('/StoreItem', (req, res) => {
    let re = new RegExp(req.query.query);
    let foundStoreItems = storeItems.filter( (storeItem) => {
        return re.test(storeItem.name);
    })
    res.send(foundStoreItems ? foundStoreItems : 404);
})

app.listen(8080);
