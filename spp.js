const http = require('http');

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        let body = '';
        req.on('end', () => {
            const userName = body.split('=')[1];
            console.log(body);
            res.end('<h1>' + userName + '</h1>');
            // cant parse body element w/o express res.end('<h1>' + req.body.name + '</h1>');
        })
        req.on('data', (chunk) => {
            body += chunk;
        });
    } else {
        res.setHeader('Content-Type', 'text/html');
        res.end(
            '<form method="POST"><input type="text" name="username"><button>SUBMIT</button></form>'
        );
    }
});
server.listen(5000);