const express = require('express');
const app = express();
app.use(express.json());

console.log("reloaded");

let users = [];
let store = {
  "StoreItems": [
    {
      "id": 1,
      "name": "apple"
    },
    {
      "id": 2,
      "name": "keyboard"
    },
    {
      "id": 3,
      "name": "chair"
    },
    {
      "id": 4,
      "quantity": 15
    }
  ]
}


const sampleUser = {
    "id":users.length,
    "firstName": "Sample",
    "lastName": "Author",
    "email": "user@example.com",
    "cart": {
      "cartId": 0,
      "cartItems": [
        {
          "id": 1,
          "quantity": 4
        },
        {
          "id": 2,
          "quantity": 1
        },
        {
          "id": 4,
          "quantity": 15
        }
      ]
    }
}


users.push(sampleUser);


//get all users
app.get('/users', (req, res) => {
        res.send(users);
    })


//get users by firstname
app.get('/users/byFirstName', (req, res) => {
    const foundUser = users.filter((user) =>{
        return user.firstName == req.param('firstName');
    })

    res.send(foundUser);
})

//get user by ID
app.get('/users/byId/:id', (req, res) => {
    const foundUser = users.find((user) => {
        return user.id == req.params.id;
    })

    res.send(foundUser);
})

//delete user by ID
app.delete('/users/byId/:id', (req, res) => {
    const foundUser = users.find((user) => {
        return user.id == req.params.id; // change this to remove user from users[]
    })

    res.send(foundUser);
})

//Create a user
app.post('/user', (req, res) => {
    let newUser = req.body;
    /*
    newuser.author = {};
    newuser.author.firstName = req.body.author.firstName;
    newuser.author.firstName = req.body.author.lastName;

    newuser.title = req.body.title;*/
    newUser.id = users.length;

    users.push(newUser);
    res.send(204);
})

app.listen(8080);
