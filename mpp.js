const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
//allows us to register a middleware which only runs on incoming post request. 
//body parser automatically creates and populates body object field
//element name comes from input name 

app.post('/', (req, res, next) => {
    res.send("<h1>" + req.body.nameHolder + "</h1>");
});

//not on all requests but on get requests.
//without a path to target it  will return error.

app.get('/', (req, res, next) => {
    res.send(
        '<form method="POST"><input type="text" name="nameHolder"><button>Submit Add user?</button></form>'
    );
});
app.listen(5000);