const express = require('express');
const app = express();
app.use(express.json());

let usersNextId = 0;
let users = [];

let cartsNextId = 0;
let carts = [];

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

createNewUserAndPush = (firstname, lastname, email) => {
    const newId = usersNextId++;
    const newUser = {
        id: newId,
        firstName: firstname,
        lastName: lastname,
        email: email,
        cart: {
            id: cartsNextId++,
            owner: newId,
            nextCartItemId: 0,
            cartItems: []
        }
    }
    users.push(newUser);
    carts.push(newUser.cart);
    return newUser;
}

createNewCartItemAndPush = (cartId, storeItemName, quantity) => {
    const foundStoreItem = storeItems.find((storeItem) => {
        return storeItem.name === storeItemName;
    });
    const foundCart = carts.find( (cart) => {
        return (cart.id === cartId);
    });
    const newItem = {
        id: foundCart.nextCartItemId++,
        storeItemId: foundStoreItem.id,
        name: foundStoreItem.name,
        quantity: quantity
    }
    foundCart.cartItems.push(newItem);
    return newItem;
}

initData = () => {
    createNewUserAndPush("John", "Doe", "user@example.com");
    createNewUserAndPush("Bob", "Dylan", "bob.dylan@gmail.com");
    createNewCartItemAndPush (0, "apple", 2);
    createNewCartItemAndPush (0, "banana", 4);
    createNewCartItemAndPush (1, "banana", 3);
    createNewCartItemAndPush (1, "guitar", 1);
    createNewCartItemAndPush (0, "keyboard", 1);
    createNewCartItemAndPush (1, "keyboard", 1);
}

initData();

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
    const newUser = createNewUserAndPush(req.body.firstName, req.body.lastName, req.body.email);
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
    let foundCartItems;
    if (foundUser) {
        foundCartItems = foundUser.cart.cartItems;
        foundUser.cart.cartItems = [];
        foundUser.cart.nextCartItemId = 0;
    }
    res.send(foundCartItems ? foundUser.cart : 404);
});

// add new item to cart by CartId; body contains store id and quantity
app.post('/cart/:CartId/cartItem', (req, res) => {
    const foundCart = carts.find((cart) => {
        return cart.id == req.params.CartId;
    })
    const foundStoreItem = storeItems.find((storeItem) => {
        return storeItem.id == req.body.id;
    });

    let foundCartItem;
    if (foundCart && foundStoreItem) {
        foundCartItem = foundCart.cartItems.find((cartItem) => {
            return cartItem.storeItemId == req.body.id;
        });
        if (foundCartItem)
            foundCartItem.quantity += req.body.quantity;
        else
            foundCartItem = createNewCartItemAndPush(foundCart.id, foundStoreItem.name, req.body.quantity);
    }
    res.send(foundCartItem ? foundCart : 404);
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

    res.send(foundCartItem ? foundCartItem : 404);
});

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