const socket = io("/", {
    auth: { token: localStorage.token }
});

// functions


// events
socket.on("connect", async () => {
    console.log(socket.id); // x8WIv7-
});


socket.on("auth", ({ token }) => {
    console.log(`token: ${token}`);
    socket.auth = { token };
    localStorage.token = token;
});

socket.on("connect_error", (err) => {
    console.log(err);
    try
    {
        if (err.data.code === 409) {
            setCookie("errorStatus", 409, 1, "/error");
            console.log("fkn off of here!");
            window.location.href = "/error";
        }
    }
    catch(tryErr) {
        socket.timeout(10000).connect();
    }
});