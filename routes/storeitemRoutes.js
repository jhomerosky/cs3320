/*
haven't yet figured out how to use the same session instance from multiple files, so all routes are in index.js
 */


/*const express = require('express');
const StoreItem = require('../storeitem')

const storeitemRouter = express.Router();



// get store item's details
storeitemRouter.get('/StoreItem/:StoreItemID', async (req, res) => {
    console.log("got here");
    let foundStoreItem;
    try {
        foundStoreItem = await StoreItem.findById(req.params.StoreItemID);
        if (!req.session.lastItemsViewed) {
            req.session.lastItemsViewed = [foundStoreItem];
        } else {
            req.session.lastItemsViewed.push(foundStoreItem);
        }
    } catch (e) {
        console.log(e);
    }
    res.send (foundStoreItem ? foundStoreItem : 404);
})

// get all items that satisfy the regular expression query
storeitemRouter.get('/StoreItems', async (req, res) => {
    const foundStoreItems = await StoreItem.find({
        itemName: new RegExp(req.query.name)
    });
    res.send(foundStoreItems ? foundStoreItems : 404);
})

storeitemRouter.get('/StoreItems/Recent', async (req, res) => {

    if (!req.session)
    {
        console.log("broken");
        return res.send(404);
    }

    if (!req.query.num)
        return res.send(404);

    if (req.query.num < 0 || req.query.num > 10)
        return res.send(404);

    if (!req.session.lastItemsViewed)
        return res.send([]);

    let foundItems = [];
    for (let i = req.lastItemsViewed.length - 1; i >= req.lastItemsViewed.length - req.session.num; i--)
    {
        foundItems.push(req.session.lastItemsViewed[i]);
    }

    res.send(foundItems);
})

module.exports = storeitemRouter;


 */