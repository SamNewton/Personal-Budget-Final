 const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");

// Using json files as sort of "database"
// Easier to manage smaller amounts of data like this
var users = require("./users.json");
var budgets = require("./budgets.json");

app.use(cors());
app.use('/', express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(80, () => {
    console.log('Express served at 67.205.161.184');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if(username.length < 3) {
        res.send({success: false, message: "Your username must be at least 3 characters long."});
    } 

    if(password.length < 6) {
        res.send({success: false, message: "Your password must be at least 6 characters long."});
    }

    if(users[username] != null) {
        res.send({success: false, message: "That username is already taken"});
    } else {
        users[username] = {
            pw: password,
            auth: genAuth(100)
        }
        updateFiles();
        res.send({success: true, user: username,auth: users[username]["auth"]});
    }

});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if(users[username] != null) {
        if(users[username]["pw"] == password) {
            users[username]["auth"] = genAuth(100);
            updateFiles();
            res.send({success: true, user: username,auth: users[username]["auth"]});
        } else {
            res.send({success: false, message: "Incorrect login information"});
        }
    } else {
        res.send({success: false, message: "Incorrect login information"});
    }
});


app.post('/addBudget', (req, res) => {
    const { user, auth, title, amount } = req.body;
    if(users[user]["auth"] == auth) {
        if(budgets[user] == null) {
            budgets[user] = {};
        }
        budgets[user][title] = {
            amt: Number(amount),
            spent: 0
        }
        updateFiles();
        res.send({});
    }
});

app.post('/addExpense', (req, res) => {
    const { user, auth, title, spent } = req.body;
    if(users[user]["auth"] == auth) {
        budgets[user][title]["spent"] += Number(spent);
        updateFiles();
    }
    res.send({});
});

app.post('/editBudget', (req, res) => {
    const { user, auth, title, amount } = req.body;
    if(users[user]["auth"] == auth) {
        budgets[user][title]["amt"] = Number(amount);
        updateFiles(); 
    }

    res.send({});
});

app.post('/deleteBudget', (req, res) => {
    const { user, auth, title } = req.body;
    if(users[user]["auth"] == auth) {
        if(budgets[user] == null) {
            budgets[user] = {};
        }
        delete budgets[user][title];
        updateFiles();
    }

    res.send({});
});

app.post('/getBudgets', (req, res) => {
    const { user, auth } = req.body;
    if(budgets[user] != null) {
        res.send(budgets[user]);
    }

    res.send({});
    
});



function updateFiles() {
    fs.writeFileSync("./users.json", JSON.stringify(users));
    fs.writeFileSync("./budgets.json", JSON.stringify(budgets));
}

function genAuth(length) {
    // Taken from StackOverFlow
    // Source: https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript

    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }