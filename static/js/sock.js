var pingWorkerRunning = false;

const socket = io("/", {
    auth: { token: localStorage.token }
});

// functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearPingBar() {
    let e = document.getElementById("ping-bars");
    let cls = e.classList
    if (cls.contains('high')) {
        e.classList.remove('high');
    }
    else if (cls.contains('medium')) {
        e.classList.remove('medium');
    }
    else if (cls.contains('low')) {
        e.classList.remove('low');
    }
}


function sendPing() {
    socket.t = new Date();
    socket.timeout(2000).emit("ping")
}

// events
socket.on("connect", async () => {
    console.log(socket.id); // x8WIv7-
    socket.t = new Date();
    sendPing();
});

// auth
socket.on("auth", ({ token }) => {
    console.log(`token: ${token}`);
    socket.auth = { token };
    localStorage.token = token;
});

// ping -> pong (client ping update)
socket.on("pong", async () => {
    let p = new Date() - socket.t;
    document.getElementById("ping-txt").innerText = p + " ms";
    console.log(`ping: ${p} ms`);
    // back to server
    socket.emit("ding")

    let cl = "";
    if (p <= 50) {
        cl = "high";
    }
    else if (p <= 150) {
        cl = "medium";
    }
    else {
        cl = "low";
    }
    clearPingBar();
    document.getElementById("ping-bars").classList.add(cl);

    // next ping -> pong -> ding
    await sleep(5000);
    socket.t = new Date();
    socket.timeout(2000).emit("ping")
});

// connection error
socket.on("connect_error", (err) => {
    console.log(err);
    try {
        if (err.data.code === 409) {
            setCookie("errorStatus", 409, 1, "/error");
            console.log("fkn off of here!");
            window.location.href = "/error";
        }
    }
    catch (tryErr) {
        document.getElementById("ping-txt").innerText = "";
        clearPingBar();
        sleep(5000);
        socket.timeout(2000).connect();
    }
});