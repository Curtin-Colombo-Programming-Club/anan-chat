// globals
var activeRoom = "public";
var scrollOnMessage = true;


// document references
let publicRoom = document.getElementById("public");
let roomsPanel = document.getElementById("rooms");
let roomChat = document.getElementById("room-chat");
let chatDisplay = document.getElementById("chat-display");
let down = document.getElementById("down");

// sock events
socket.on("message", async (data) => {
    console.log(data);
    let cbc = newChatBubble(data.msg, false, data.user, data.color);
    cbc.id = data.msgID;

    if (scrollOnMessage) {
        cbc.scrollIntoView({ behavior: 'smooth' });
    }
});

// functions
/**
 * Makes the clicked room the active room.
 *
 * @param {object} event - The first number.
 * @returns {boolean} true if action was done or else false.
 */
function makeActiveRoom(event) {
    if (event.target.classList.contains('room')) {
        activeRoom = event.target.id;
        // Log the text content of the clicked child
        console.log(event.target);
        if (!event.target.classList.contains('a')) {
            event.target.classList.add('a');
        }

        return true;
    }
    return false
}

function checkScrollEnd() {
    // Check if scrolled to the bottom
    console.log(`${chatDisplay.scrollTop}, ${chatDisplay.scrollHeight - chatDisplay.clientHeight}`)
    if (chatDisplay.scrollTop >= (chatDisplay.scrollHeight - chatDisplay.clientHeight) - 5) {
        console.log('Scrolled to the end');
        scrollOnMessage = true;
        roomChat.classList.remove("not-down");
    }
    else {
        scrollOnMessage = false;
        roomChat.classList.add("not-down");
    }
}

// newChatBubble function
function newChatBubble(msg, self = false, username = null, color = null) {
    let chatBubbleContainer = document.createElement('div');
    let chatBubble = document.createElement('div');
    let chatMessage = document.createElement('div');

    chatBubbleContainer.className = "chat-bubble-container";
    chatBubble.className = "chat-bubble";
    chatMessage.className = "message";
    chatMessage.innerHTML = msg;

    if (!self) {
        let chatUser = document.createElement("div");

        chatUser.className = "user";
        chatUser.style.color = "rgb" + color;
        chatUser.style.display = "none";
        chatUser.innerText = username;

        try {
            let lastChatBubbleUserDiv = chatDisplay.lastChild.childNodes[0].childNodes[0];
            if (lastChatBubbleUserDiv.innerText === username) {
                chatBubbleContainer.classList.add("follow");
            }

            if (lastChatBubbleUserDiv.style.color != chatUser.style.color) {
                throw new Error("Last message is same user but different color!")
            }
        }
        catch (err) {
            console.log(err.message);
            chatUser.style.display = "block";
        }
        finally {
            // adding from user for chat bubble
            chatBubble.appendChild(chatUser);
        }
    }

    chatBubble.appendChild(chatMessage);
    chatBubbleContainer.appendChild(chatBubble);

    if (self) {
        chatBubbleContainer.classList.add("self");

        try {
            if (chatDisplay.lastChild.classList.contains("self")) {
                chatBubbleContainer.classList.add("follow");
            }
        }
        catch (err) {
            console.log(err.message);
        }

        let loadingDiv = document.createElement('div');
        let errorDiv = document.createElement('div');
        loadingDiv.className = "loading";
        errorDiv.className = "error";

        chatBubbleContainer.appendChild(loadingDiv);
        chatBubbleContainer.appendChild(errorDiv);
    }

    chatDisplay.appendChild(chatBubbleContainer);

    return chatBubbleContainer;
}

// sendMessage function
function sendMessage(msg, i = 0, cbc = null) {
    if (i === 0) {
        cbc = newChatBubble(msg, true);
        cbc.scrollIntoView({ behavior: 'smooth' });
    }

    socket.timeout(2000).emit("message", { msg: msg, room: activeRoom }, (err, ack) => {
        //console.log(ack);
        if (err) {
            console.log(err);
            if (i < 4) {
                console.log("Retrying sending message!");
                i++;
                sendMessage(msg, i, cbc);
            }
            else {
                console.log("Message not delivered!");
                cbc.classList.add("not-sent");
            }
        }
        else if (ack.status === "ok") {
            cbc.classList.add("sent");
            cbc.id = ack.msgID;
        }
        else if (ack.status === "not ok") {
            return false;
        }
        else if (ack.status === "delete") {
            cbc.remove();
        }
    });
}


function adjustTextareaHeight(textarea) {
    let lineCount = textarea.value.split('\n').length;
    textarea.rows = Math.min(10, lineCount);
}

function captureInput(event) {
    let capturedText = "";
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();

        if (textArea.value.replaceAll("\n", "")) {

            capturedText += textArea.value;
            console.log(capturedText);

            sendMessage(capturedText.replaceAll("\n", "<br>"));

            textArea.value = '';
            adjustTextareaHeight(textArea);
        }
        else {
            textArea.value = "";
            adjustTextareaHeight(textArea);
        }
    }
}

// event listners
roomsPanel.addEventListener('click', makeActiveRoom);
chatDisplay.addEventListener('scroll', checkScrollEnd);
down.addEventListener("click", () => {
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
})