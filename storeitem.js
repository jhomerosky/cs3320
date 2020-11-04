const mongoose = require('mongoose');

const StoreItemSchema = new mongoose.Schema(
    {
        itemName: String
    })

const StoreItem = mongoose.model('StoreItem', StoreItemSchema);
module.exports = StoreItem;