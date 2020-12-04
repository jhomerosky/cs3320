const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cors = require('cors');

const port = process.env.PORT || 8080;
const app = express();

const corsConfig = {
    origin: true,
    credentials: true,
};
app.use(cors(corsConfig));
app.options('*', cors(corsConfig));

app.use(express.json());
const router = express.Router();

const mongoose = require('mongoose');
const url = 'mongodb+srv://dbUser:iJPvPJCel@cluster0.hgetv.mongodb.net/store-db?retryWrites=true&w=majority';

const User = require('./user');
const Cart = require('./cart');
const StoreItem = require('./storeitem');

const jwt = require('jsonwebtoken');
const accessTokenSecret = "CS3320DatabaseJWTSecretJH";

let database;

const initDataBase = async () => {
    database = await mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
    if (database) {
        app.use(session({
            secret: 'CS3320DatabaseSecretJH',
            store: new MongoStore({mongooseConnection: mongoose.connection})
        }));
        app.use(cors());
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
            email: emails[i],
            login: `${firstNames[i]}.${lastNames[i]}`,
            password: 'password123'
        });
    }
    await User.create(users);
}

const initCarts = async () => {
    const foundUsers = await User.find({});
    for (let i = 0; i < foundUsers.length; i++)
    {
        const newCart = {
            ownerID: foundUsers[i]._id,
            cartItems: []
        };
        foundUsers[i].cart = await Cart.create(newCart);
        await foundUsers[i].save();
    }
}

const initCartItems = async () => {
    const foundUsers = await User.find({}).populate('cart');

    const apple = (await StoreItem.find({itemName: "apple"}))[0];
    const banana = (await StoreItem.find({itemName: "banana"}))[0];
    const guitar = (await StoreItem.find({itemName: "guitar"}))[0];
    const keyboard = (await StoreItem.find({itemName: "keyboard"}))[0];

    foundUsers[0].cart.cartItems.push({ quantity: 2, storeItem: apple });
    foundUsers[0].cart.cartItems.push({ quantity: 4, storeItem: banana });
    foundUsers[1].cart.cartItems.push({ quantity: 3, storeItem: banana });
    foundUsers[1].cart.cartItems.push({ quantity: 1, storeItem: guitar });
    foundUsers[0].cart.cartItems.push({ quantity: 1, storeItem: keyboard });
    foundUsers[1].cart.cartItems.push({ quantity: 1, storeItem: keyboard });

    await foundUsers[0].cart.save();
    await foundUsers[1].cart.save();

}

// empties and re-initializes database data
const initData = async () => {
    await User.deleteMany({});
    console.log("Deleted users");
    await Cart.deleteMany({});
    console.log("Deleted carts");
    await StoreItem.deleteMany({});
    console.log("Deleted storeItems");
    await initStoreItems();
    console.log("Initialized storeItems");
    await initUsers();
    console.log("Initialized users");
    await initCarts();
    console.log("Initialized carts");
    await initCartItems();
    console.log("Initialized carts with items");
}

const init = async () => {
    await initDataBase();
    console.log("Database connected");
    //await initData();
    console.log("ready");
}

init();

//app.use(require('./routes/userRoutes'));
//get all users or get by filter query param using Regular Expression
//Postman: localhost:8080/users/
router.get('/users', async (req, res) => {
    let foundUsers = await User.find({
        firstName: new RegExp(req.query.firstName),
        lastName: new RegExp(req.query.lastName)
    }).populate('cart')

    res.send(foundUsers ? foundUsers : 404);
});

//get user by ID
//Postman: localhost:8080/user/5fa657e6f0b7550904ad2829
router.get('/user/:UserId', async (req, res) => {
    try {
        const foundUser = await User.findById(req.params.UserId).populate([
                {
                    path: 'cart',
                    model: 'Cart',
                    populate: {
                        path: 'cartItems.storeItem',
                        model: 'StoreItem',
                    }
                },
        ]);
        return res.send(foundUser ? foundUser :  404);
    } catch (e) {
        //console.log(e);
    }
    res.send(404);
});

//Create a user
//Postman: localhost:8080/users/
/*Postman body:
{
    "firstName": "Syd",
    "lastName": "Barret",
    "email": "syd.barret@gmail.com",
    "login": "Syd.Barrett",
    "password": "password123"
}
 */
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
//Postman: localhost:8080/user/5fa657e6f0b7550904ad2829/cart
router.get('/user/:UserId/cart', async (req, res) => {
    try {
        const foundUser = await User.findById(req.params.UserId).populate([
            {
                path: 'cart',
                model: 'Cart',
                populate: {
                    path: 'cartItems.storeItem',
                    model: 'StoreItem',
                }
            },
        ]);
        const foundCart = foundUser.cart;
        return res.send( foundCart ? foundCart : 404);
    } catch (e) {
        //console.log(e);
    }

    res.send(404);
});

//empty cart by ID
//Postman: localhost:8080/user/5fa657e6f0b7550904ad2829/cart
router.delete('/user/:UserId/cart', async (req, res) => {
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
        //console.log(e);
    }
    res.send(404);
});


//app.use(require('./routes/cartRoutes'));
// add new item to cart by CartId; body contains store id and quantity
//Postman: localhost:8080/cart/5fa657e6f0b7550904ad282b/cartItem
/* Postman Body:
{
    "id": "5fa657e6f0b7550904ad2825",
    "quantity": 2
}
 */
router.post('/cart/:CartId/cartItem', async (req, res) => {
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
//WARNING: cartItemId is different from storeItemId; mongoose creates a new cartItemId every time a unique item is added
//Postman tests require searching for a new cartItemId from a previous GET result
//Postman: localhost:8080/cart/5fa657e6f0b7550904ad282b/cartItem/5fa6582ff0b7550904ad2833
router.delete('/cart/:CartId/cartItem/:cartItemId', async (req, res) => {
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

//app.use(require('./routes/storeitemRoutes'));
// get store item's details
//Postman: localhost:8080/StoreItem/5fa657e6f0b7550904ad2824
router.get('/StoreItem/:StoreItemID', async (req, res) => {
    let foundStoreItem;
    try {
        foundStoreItem = await StoreItem.findById(req.params.StoreItemID);
        if (!req.session.lastItemsViewed) {
            req.session.lastItemsViewed = [foundStoreItem];
        } else {
            if (req.session.lastItemsViewed.length >= 10) req.session.lastItemsViewed.shift();
            req.session.lastItemsViewed.push(foundStoreItem);
        }
    } catch (e) {
        console.log(e);
    }
    res.send (foundStoreItem ? foundStoreItem : 404);
})

// get all items that satisfy the regular expression query
//Postman: localhost:8080/StoreItems?name=a
router.get('/StoreItems', async (req, res) => {
    const foundStoreItems = await StoreItem.find({
        itemName: new RegExp(req.query.name)
    });
    res.send(foundStoreItems ? foundStoreItems : 404);
})

//get up to 10 of the most recent items searched from /StoreItem/:StoreItemID
//Postman: localhost:8080/StoreItems/Recent?num=10
router.get('/StoreItems/Recent', async (req, res) => {
    const sess = req.session;
    const num = req.query.num;

    if (!num)
        return res.send(404);

    if (num < 0 || num > 10)
        return res.send(404);

    if (!sess.lastItemsViewed)
        return res.send([]);

    let foundItems = [];
    for (let i = sess.lastItemsViewed.length - 1; i >= Math.max(sess.lastItemsViewed.length - num, 0); i--)
    {
        foundItems.push(sess.lastItemsViewed[i]);
    }

    res.send(foundItems);
})

app.listen(port);
console.log("listening on port " + port);


// new JWT routes

app.use(async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const jwtToken = authHeader.split(' ')[1];
            const user = jwt.verify(jwtToken, accessTokenSecret);
            req.user = user;
        }
    } catch (e) {
        res.send(403);
    }
    next();
});

//Postman: localhost:8080/user/login
/* Postman body
{
    "login": "John.Doe",
    "password": "password123"
}
 */
router.post('/user/login', async (req, res) => {
    const {login, password} = req.body;
    const foundUser = await User.findOne({login, password});

    if (foundUser) {
        const accessToken = jwt.sign({user:foundUser}, accessTokenSecret);
        res.send({jwt: accessToken, user: foundUser});
    } else {
        res.send(403);
    }
});