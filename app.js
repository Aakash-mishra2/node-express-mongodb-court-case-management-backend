const http = require('http');
//remember order : first serverIncomingmessage (request) argument, then serverResponse argument
//else error res.end() is not a function.
const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html');
    //w/o setheader browser wraps in some pre style text//
    //setHeader changes response content type.
    //res.end('<h1>Success!</h1>');
    res.end('<form><input type="text" name="nameHolder"><button type="submit">Create User</button></form>');

});
server.listen(5000);