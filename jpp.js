const express = require('express');
const app = express();
//project has start script to nodemon app.js setted up.
//allows us to register a middleware on all incoming request  .
app.use((req, res, next) => {
    let body = '';
    req.on('end', () => {
        const userName = body.split('=')[1];
        //without using line 10 gives Undefined because then I am always setting request body 
        //element even when there is just a get request which has no attatched data. This end 
        //event listener on line 7 will fire so request body will always set to object which has 
        //undefined as the value.
        if (userName) {
            console.log(userName);
            req.body = { name: userName };
        }
        //forward the request to next middleware in line.
        next();
    })
    req.on('data', chunk => {
        body += chunk;
    });
});

app.use((req, res, next) => {
    if (req.body) {
        return res.send("<h1>" + req.body.name + "</h1>");
    }
    res.send(
        '<form method="POST"><input type="text" name="nameHolder"><button>Submit</button></form>'
    );
});

app.listen(5000);