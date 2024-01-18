const { v1: uuidv1, v3: uuidv3, v4: uuidv4 } = require('uuid');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Controller {
    constructor(io, users) {
        this.io = io;
        this.users = users;

        this.io.use((socket, next) => {
            this.sessionManager(socket, next);
        });
    }

    sessionManager(socket, next) {
        // authentication
        console.log(`\nhs token: ${socket.handshake.auth.token}`);
        console.log(socket.handshake.address);
        console.log(`hs sid: ${socket.id}`);

        let user = this.users.getUser(socket.handshake.auth.token) || this.users.getUserByIP(socket.handshake.address);

        console.log(user);
        if (user != null) {
            if (user.connected) {
                console.log("User already exist")
                const err = new Error("Session Already Exist!");
                err.data = { code: 409 };
                next(err);
            }
            else {
                user.sid = socket.id;
                user.connected = true;
            }
        }

        // new user
        if (user === null) {
            console.log("sending token")
            user = this.users.newUser(socket.handshake.address);
            user.sid = socket.id;
            user.connected = true;
        }

        socket.token = user.token;
        socket.username = user.username;
        socket.color = user.color;

        console.log(`-- token: ${socket.token}, sid: ${socket.id}`);
        next();
    }

    control() {
        // /
        this.io.on("connection", (socket) => {
            //
            socket.join("public"); // join public room

            //
            socket.emit("auth", { token: socket.token });

            // ping 
            socket.on("ping", async () => {
                let responseTime = new Date();
                if (!socket.t) {
                    console.log(`${socket.username}, Initail ping request`);
                }

                socket.t = responseTime;
                //await sleep(100);
                socket.emit("pong");
            });

            // pong
            socket.on("ding", () => {
                console.log(`${socket.username}, ping: ${new Date() - socket.t} ms`);
            })



            // chat
            // message
            socket.on("message", async (data, callback) => {
                console.log(socket.username);
                let messageID = uuidv3(data.msg, uuidv3(socket.username, uuidv1())).replaceAll('-', '');
                console.log(data);
                socket.broadcast.to(data.room).emit("message", { room: data.room, user: socket.username, color: socket.color, msg: data.msg, msgID: messageID });
                //await sleep(5000);
                callback({ status: "ok", msgID: messageID });
            });

            // disconnect
            socket.on("disconnect", (reason) => {
                let user = this.users.getUser(socket.token);
                if (socket.id === user.sid) {
                    user.connected = false;
                }
            });
        });
    }
}

module.exports = Controller;