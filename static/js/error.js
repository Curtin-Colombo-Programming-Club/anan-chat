const statusDiv = document.getElementById("error-code");
const messageDiv = document.getElementById("error-message");

const statusCode = parseInt(getCookie("errorStatus"), 10) || parseInt(window.location.search.replace(/^\?status=/, ''), 10);

// Check if the status code is valid
if (!isNaN(statusCode)) {
    console.log('Status Code:', statusCode);
    let message = "hmmm";
    statusDiv.innerText = statusCode;
    switch (statusCode) {
        case 400:
            message = "Bad Request!";
            break;

        case 404:
            message = "Page Not Found!";
            break;

        case 409:
            message = "Session Already Available In A Different Tab Or Browser!";
            break;

        default:
            message = "WTF?!";
            break;
    }

    messageDiv.innerText = message;
} else {
    console.error('Invalid or missing status code');
    statusDiv.innerText = "---";
    messageDiv.innerText = ""; 
}

deleteCookie("errorStatus", "/error");