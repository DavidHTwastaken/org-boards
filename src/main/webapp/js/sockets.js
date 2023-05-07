const socketUrl = "ws://localhost:8080/webboards-1.0-SNAPSHOT/ws"
const baseUrl = "http://localhost:8080/webboards-1.0-SNAPSHOT"
const loginUrl = "/login-servlet";
const signupUrl = "/signup-servlet";
// Create WebSocket connection.
let socket;
// const socket = new WebSocket(socketUrl);
let username;

// Login handler
function login() {
    // get form data
    const formData = {
        "user": document.getElementById('username').value,
        "pwd": document.getElementById('password').value
    };
    console.log(JSON.stringify(formData));
    // make API call
    fetch(baseUrl+loginUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            // check login status and display appropriate message
            if (data.loginStatus) {
                username = data.username;
                // redirect to home page
                window.localStorage.setItem("username",username);
                window.location.href = 'home.html';
                // // open the socket
                // socket = new WebSocket(socketUrl+`/${username}`);
                // setupSocket(socket);

            } else {
                alert('Invalid username or password');
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
            alert('An error occurred during login');
        });
}

function signup() {
    // get form data
    const formData = {
        "user": document.getElementById('username').value,
        "pwd": document.getElementById('password').value
    };

    // make API call
    fetch(baseUrl+signupUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            // check login status and display appropriate message
            if (data.success) {
                alert('Signup successful!');
                username = data.username;
                // redirect to page
                window.localStorage.setItem("username",username);
                window.location.href = 'home.html';
                // // open the socket
                // socket = new WebSocket(socketUrl+`/${username}`);
                // console.log("Socket connection created: "+socket);
                // setupSocket(socket);
            } else {
                alert('Signup failed');
            }
        })
        .catch(error => {
            console.log('Error during signup:', error);
            // alert('An error occurred during signup');
        });
}
function setupSocket(){
    username = window.localStorage.getItem("username");
    socket = new WebSocket(socketUrl+`/${username}`);

    // Connection opened
    socket.addEventListener("open", (event) => {
        console.log(event);
        console.log(socket.readyState);
    });

    socket.addEventListener('close', (event) => {
        window.location.href = 'index.html';
    })

    // Listen for messages
    socket.addEventListener("message", (event) => {
        console.log("Message: "+event.data);
        const data = JSON.parse(event.data);
        switch(data.type){
            case "new-card":
                addCard(data.title,data.creator);
                break;
            case "delete-card":
                removeCard(data.card);
                break;
            case "new-note":
                addNote(data.text,data.card,data.creator);
                break;
            case "delete-note":
                removeNote(parseInt(data.note),parseInt(data.card));
                break;
            case "board":
                console.log("Board setup according to server: "+JSON.stringify(data.board));
                setupBoard(data.board);
                break;
            case "error":
                console.error(data.message);
                break;
            default:
                console.error("Client was unable to parse a type from the server's message.");
                break;
        }
    });
    return socket;
}

function addCard(title,creator) {
    console.log("Adding card...");
    // Create a new card
    const newCard = createCard();

    // Card features
    addCardTitle(newCard,title);
    addDeleteCardBtn(newCard);
    createAddMessageBtn(newCard);

    // Add the new card to the cards container (before button or pending card)
    const containerChildren = cardsContainer.children;
    cardsContainer.insertBefore(newCard,containerChildren.item(containerChildren.length-1));
}

function removeCard(card) {
    const elems = document.getElementsByClassName('cards-container')[0]
        .getElementsByClassName('card');
    elems.item(card).remove();
}

function addNote(text,card,creator) {
    const targetCard = document.getElementsByClassName("cards-container")[0]
        .getElementsByClassName("card")[card];
    // Create the message card
    const messageCard = createMessageCard();

    // Create the message element
    const message = document.createElement('div');
    message.className = 'message';
    message.textContent = text;

    const messageDeleteBtn = createDeleteMessageBtn();

    // Insert the message into the message card
    messageCard.appendChild(message);
    messageCard.appendChild(messageDeleteBtn);

    // Add the message card to the card
    targetCard.appendChild(messageCard);
}

function removeNote(note, card){
    const cardList = document.getElementsByClassName("cards-container")[0]
        .getElementsByClassName("card");
    let targetCard = cardList.item(card);
    const messages = targetCard.getElementsByClassName("message-card");
    messages.item(note).remove();
}

function setupBoard(board){
    console.log("Setting up board...");
    for(let i = 0; i < board.cards.length; i++){
        addCard(board.cards[i].title, board.cards[i].creator);
        for(let j = 0; j < board.cards[i].notes.length; j++){
            addNote(board.cards[i].notes[j].text, i, board.cards[i].notes[j].creator);
        }
    }
}