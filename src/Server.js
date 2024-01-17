const http = require('http');
const express = require('express');
const { Server, Socket } = require('socket.io');
const { httpController, socketController } = require('./Controllers');
const {Users} = require("./Users");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);
const users = new Users();

const hc = new httpController(app);
hc.control();

const sc = new socketController(io, users);
sc.control();
//

httpServer.listen(1289, "0.0.0.0", () => {
    console.log("Server up!");
});