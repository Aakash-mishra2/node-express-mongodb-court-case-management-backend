// const express = require('express');
// const router = express.Router();

// const Chat = require('../models/chat');


// //handle socket connections
// io.on('connection', (socket) => {
//     console.log('socket connected', socket.id);
//     socket.on('sent-message', (payload) => {

//         //scope for llm model
//         const reply = parseMessageAndReply(payload);

//         socket.emit('reply-message', reply);
//     });
//     socket.emit('testEvent', 'Server is Connected!');
// });


// router.get('/', async (req, res) => {
//     try {
//         await Chat.find()
//             .populate('sender')
//             .exec((err, chats) => {
//                 console.log(chats);
//                 if (err) return res.status(400).send(err);
//                 res.status(200).send(chats);
//             });
//     } catch (err) {
//         console.error(err);
//     }
// });

// module.exports = router;

const parseMessageAndReply = (message) => {
    if (message === "Hi") {
        return "Welcome to our App!";
    }
}

module.exports = function (io) {
    //handle socket connections
    io.on('connection', (socket) => {
        socket.on('sent-message', (payload) => {
            //scope for llm model
            const reply = parseMessageAndReply(payload);

            socket.emit('reply-message', reply);
        });

        socket.on('disconnected', () => {
            console.log('socket disconnected');
        });
    });
};