const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const port = process.env.PORT || 8080;
const app = express();

app.use(express.json());
const router = express.Router();


const mongoose = require('mongoose');
const url = 'mongodb+srv://dbUser:iJPvPJCel@cluster0.hgetv.mongodb.net/store-db?retryWrites=true&w=majority';

const User = require('./user');
const Cart = require('./cart');
const StoreItem = require('./storeitem');

let database;

const initDataBase = async () => {
    database = await mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
    if (database) {
        app.use(session({
            secret: 'CS3320DatabaseSecretJH',
            store: new MongoStore({mongooseConnection: mongoose.connection})
        }));
        app.use(router);
        console.log('Successfully connected to DB');
    } else {
        console.log('Error connecting to DB');
    }
}

const initStoreItems = async () => {
    let storeItems = [];
    const itemNames = [ "apple", "banana", "guitar", "keyboard", "notebook" ];

    for (let i = 0; i < itemNames.length; i++)
    {
        storeItems.push({
            itemName: itemNames[i]
        });
    }
    await StoreItem.create(storeItems);
}

const initUsers = async () => {
    const users = [];
    const firstNames = [ "John", "Bob" ];
    const lastNames = [ "Doe", "Dylan" ];
    const emails = [ "user@example.com", "bob.dylan@gmail.com" ];

    for (let i = 0; i < firstNames.length; i++)
    {
        users.push({
            firstName: firstNames[i],
            lastName: lastNames[i],
            email: emails[i]
        });
    }
    await User.create(users);
}

const initCarts = async () => {
    let carts = [];
    const foundUsers = await User.find({});
    for (let i = 0; i < foundUsers.length; i++)
    {
        const newCart = {
            ownerID: foundUsers[i]._id,
            cartItems: []
        };
        const createdCart = await Cart.create(newCart);
        foundUsers[i].cart = createdCart;
        await foundUsers[i].save();
    }
}

const initCartItems = async () => {
    const foundUsers = await User.find({}).populate('cart');

    const apple = await StoreItem.find({itemName: "apple"});
    const banana = await StoreItem.find({itemName: "banana"});
    const guitar = await StoreItem.find({itemName: "guitar"});
    const keyboard = await StoreItem.find({itemName: "keyboard"});

    await pushStoreItemToCart(foundUsers[0].cart, apple[0], 2);
    await pushStoreItemToCart(foundUsers[0].cart, banana[0], 4);
    await pushStoreItemToCart(foundUsers[1].cart, banana[0], 3);
    await pushStoreItemToCart(foundUsers[1].cart, guitar[0], 1);
    await pushStoreItemToCart(foundUsers[0].cart, keyboard[0], 1);
    await pushStoreItemToCart(foundUsers[1].cart, keyboard[0], 1);
}

const pushStoreItemToCart = async (cart, storeItem, quantity) => {
    if (!cart || !storeItem)
        return;

    let foundCartItem;
    foundCartItem = cart.cartItems.find((cartItem) => {
        return cartItem.storeItem._id == storeItem._id;
    });

    if (foundCartItem)
    {
        console.log("found storeItem already existing in cart");
        foundCartItem.quantity += quantity;
    } else {
        const newCartItem = {
            quantity: quantity,
            storeItem: storeItem
        }.populate('storeItem');
        cart.cartItems.push(newCartItem);
    }
    await cart.save();
}





/*
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
*/


const initData = async () => {
    await initDataBase();
    console.log("Database initialized");

    await User.deleteMany({});
    console.log("Deleted users");
    await Cart.deleteMany({});
    console.log("Deleted carts");
    //await StoreItem.deleteMany({});
    //console.log("Deleted storeItems");
    //await initStoreItems();
    //console.log("Initialized storeItems");
    await initUsers();
    console.log("Initialized users");
    await initCarts();
    console.log("Initialized carts");
    await initCartItems();
    console.log("Initialized carts with items");

    console.log("ready");

}

initData();

router.get('/', async (req, res) => {
    console.log(`req.session: ${JSON.stringify(req.session)}`);
    req.session.numCalls++;
    res.send(200);
})

//get all users or get by filter query param using Regular Expression
router.get('/users', async (req, res) => {
    let foundUsers = await User.find({
        firstName: new RegExp(req.query.firstName),
        lastName: new RegExp(req.query.lastName)
    }).populate('cart');

    res.send(foundUsers ? foundUsers : 404);
});

//get user by ID
router.get('/user/:UserId', async (req, res) => {
    try {
        const foundUser = await User.findById(req.params.UserId).populate('cart');
        return res.send(foundUser ? foundUser :  404);
    } catch (e) {
        //console.log(e);
    }
    res.send(404);
});

//Create a user
router.post('/user', async (req, res) => {
    const newUser = await User.create(req.body);
    newUser.cart = await Cart.create({
        ownerID: newUser._id,
        cartItems: []
    });
    await newUser.save();

    res.send(newUser ? newUser : 500);
});

//get user's cart
router.get('/user/:UserId/cart', async (req, res) => {
    try {
        const foundUser = await User.findById(req.params.UserId).populate('cart');
        const foundCart = foundUser[0].cart;
        return res.send( foundCart ? foundCart : 404);
    } catch (e) {
        //console.log(e);
    }

    res.send(404);
});

//empty cart by ID
router.delete('/user/:UserId/cart', async (req, res) => {
    try {
        const foundUser = await User.findById(req.params.id).populate('cart');
        const foundCart = foundUser[0].cart;
        if (foundCart) {
            foundCart.cartItems = [];
            await foundUser[0].save();
            await foundCart.save();
        }

        return res.send(foundCart ? foundCart : 404);
    } catch (e) {
        //console.log(e);
    }
    res.send(404);
});

// add new item to cart by CartId; body contains store id and quantity
router.post('/cart/:CartId/cartItem', async (req, res) => {
    const foundCart = (await Cart.findById(req.params.CartId))[0];
    const foundStoreItem = (await StoreItem.findById(req.body.id))[0];

    console.log(foundCart);
    console.log(foundStoreItem);
    try {
        await pushStoreItemToCart(foundCart, foundStoreItem, req.params.quantity);
    } catch (e) {
        //console.log(e);
    }

    res.send((foundStoreItem && foundCart) ? foundCart : 404);
});

// remove item from cart by CartId, cartItemId
router.delete('/cart/:CartId/cartItem/:cartItemId', (req, res) => {
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
router.get('/StoreItem/:StoreItemID', (req, res) => {
    const foundStoreItem = storeItems.find( (storeItem) => {
        return storeItem.id == req.params.StoreItemID;
    })
    res.send(foundStoreItem ? foundStoreItem : 404);
})

// get all items that satisfy the regular expression query
router.get('/StoreItem', (req, res) => {
    let re = new RegExp(req.query.query);
    let foundStoreItems = storeItems.filter( (storeItem) => {
        return re.test(storeItem.name);
    })
    res.send(foundStoreItems ? foundStoreItems : 404);
})

app.listen(port);
console.log("listening on port " + port);
