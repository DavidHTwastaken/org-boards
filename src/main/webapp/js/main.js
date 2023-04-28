const cardsContainer = document.querySelector('.cards-container');
// const addCardBtn = document.querySelector('#add-card-btn');

function setupHome() {
    setupSocket();
    if(username === undefined || socket === undefined){
        window.location.href = 'index.html';
        return;
    }
    setupAddCardBtn();
}

function setupAddCardBtn() {
    // Create the button element
    const addCardBtn = document.createElement('button');
    addCardBtn.id = 'add-card-btn';
    addCardBtn.innerText = 'Add a card';
    cardsContainer.appendChild(addCardBtn);

    // Set up functionality
    addCardBtn.addEventListener('click', () => {
        const newCard = createCard();
        newCard.id = 'new-card';

        // Add features to new card
        setupCardTitleInput(newCard);
        addDeleteCardBtn(newCard);
        createAddMessageBtn(newCard);

        // Add the new card to the cards container
        cardsContainer.appendChild(newCard);

        // Remove the button so that user cannot create multiple pending cards
        addCardBtn.remove();
    });
}

const createCard = () => {
    // Create a new card
    const newCard = document.createElement('div');
    newCard.className = 'card';
    return newCard;
}

const setupCardTitleInput = (card) => {
    // Create the card title input
    const cardTitleInput = document.createElement('input');
    cardTitleInput.type = 'text';
    cardTitleInput.placeholder = 'Add a title...';

    // Create the card title submit button
    const cardTitleSubmitBtn = document.createElement('button');
    cardTitleSubmitBtn.type = 'button';
    cardTitleSubmitBtn.textContent = 'Submit';
    cardTitleSubmitBtn.className = 'card-title-submit-btn';

    // Append the card title input and submit button to the new card
    card.appendChild(cardTitleInput);
    card.appendChild(cardTitleSubmitBtn);

    // Focus the card title input
    cardTitleInput.focus();

    // When the user clicks the submit button or presses Enter, create the card title
    const createCardTitle = () => {
        let title = cardTitleInput.value;
        // Check if the title input is empty
        if (title.trim() === '') {
            title = 'Empty Title';
        }

        addCardTitle(card,title)

        // Remove the title input and submit button
        card.removeChild(cardTitleInput);
        card.removeChild(cardTitleSubmitBtn);

        // Card complete
        finalizeCard(card,title);
    };

    cardTitleSubmitBtn.addEventListener('click', createCardTitle);
    cardTitleInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            createCardTitle();
        }
    });
}

const addCardTitle = (card,title) => {
    // Create the card title
    const cardTitle = document.createElement('div');
    cardTitle.className = 'card-title';
    cardTitle.textContent = title;

    // Insert the card title into the new card
    card.appendChild(cardTitle);
}

const finalizeCard = (card,title) => {
    // Notify socket server
    const request = JSON.stringify(
        {"type": "new-card", "title": title,"creator": username}
    );
    console.log("Sending instruction to create card: "+ request);
    socket.send(request);

    // Remove the 'new-card' id and replace the Add Card button
    card.removeAttribute('id');
    setupAddCardBtn();
}

const addDeleteCardBtn = (card) => {
    // Create delete button
    const deleteCardButton = document.createElement('button');
    deleteCardButton.type = 'button';
    deleteCardButton.className = 'card-btn';
    deleteCardButton.textContent = 'Delete Card';

    // Functionality
    deleteCardButton.addEventListener('click', deleteCard);
    deleteCardButton.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            deleteCard(event);
        }
    });

    card.appendChild(deleteCardButton);
}

const deleteCard = (event) => {
    // If card has not been finalized, should simply delete and reset
    if(event.target.parentNode.id === 'new-card'){
        event.target.parentNode.remove();
        setupAddCardBtn();
        return;
    }

    let nodes = event.target.parentNode.parentNode.querySelectorAll(".card")
    for(let i = 0; i<nodes.length; i++){
        if(nodes[i] === event.target.parentNode){
            let request = JSON.stringify({"type":"delete-card","card":i});
            console.log("Sending instructions: " + request);
            socket.send(request);
        }
    }
    event.target.parentNode.remove();
};

const createAddMessageBtn = (card) => {
    // Add the "Add Message" button to the new card
    const addMessageBtn = document.createElement('button');
    addMessageBtn.textContent = 'Add Message';
    addMessageBtn.className = 'add-message-btn';
    card.appendChild(addMessageBtn);

    // When the user clicks the "Add Message" button, create a message input box
    addMessageBtn.addEventListener('click', () => {
        // Only one message input at a time
        if(document.getElementById('new-message')!==null){
            document.getElementById('new-message').remove();
        }

        // Create the message input box
        const messageInput = document.createElement('input');
        messageInput.type = 'text';
        messageInput.placeholder = 'Add a message...';
        messageInput.className = 'message-input';

        // Create the message submit button
        const messageSubmitBtn = document.createElement('button');
        messageSubmitBtn.type = 'button';
        messageSubmitBtn.textContent = 'Submit';
        messageSubmitBtn.className = 'card-btn';

        // Create the message delete button
        const messageDeleteBtn = createDeleteMessageBtn();

        // Create the message card
        const messageCard = createMessageCard();
        messageCard.id = 'new-message';
        messageCard.appendChild(messageInput);
        messageCard.appendChild(messageSubmitBtn);
        messageCard.appendChild(messageDeleteBtn);

        // Add the message card to the card
        card.appendChild(messageCard);

        // Focus the message input box
        messageInput.focus();

        // When the user clicks the message submit button or presses Enter, create the message
        const createMessage = () => {
            let text = messageInput.value;

            // Check if the message input is empty
            if (text.trim() === '') {
                text = 'Empty Message';
            }

            // Create the message element
            const message = document.createElement('div');
            message.className = 'message';
            message.textContent = text;

            // Insert the message into the message card
            messageCard.insertBefore(message, messageDeleteBtn);

            // Remove the message input and submit button
            messageCard.removeChild(messageInput);
            messageCard.removeChild(messageSubmitBtn);

            // Finish the message
            finalizeMessage(messageCard,text);
        };

        messageSubmitBtn.addEventListener('click', createMessage);
        messageInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                createMessage();
            }
        });


    });
}

const finalizeMessage = (messageCard,text) => {
    // Notify the socket
    let sent = false;
    const parentCard = messageCard.parentNode;
    const cards = parentCard.parentNode.querySelectorAll(".card");
    let i;
    for(i = 0; i<cards.length; i++){
        if(cards.item(i) === parentCard){
            socket.send(JSON.stringify({"type":"new-note",
                "text": text,
                "creator": username,
                "card":i}));
            sent = true;
        }
    }
    if(sent === false){
        console.error("Client failed to send command to create message.");
    }

    // MessageCard is no longer pending
    messageCard.removeAttribute('id');
}

const createMessageCard = () => {
    // Create the message card
    const messageCard = document.createElement('div');
    messageCard.className = 'message-card';
    return messageCard;
}

const createDeleteMessageBtn = () => {
    // Create the message delete button
    const messageDeleteBtn = document.createElement('button');
    messageDeleteBtn.type = 'button';
    messageDeleteBtn.textContent = 'Delete Message';
    messageDeleteBtn.className = 'card-btn';

    // Add listeners
    messageDeleteBtn.addEventListener('click',deleteMessage);
    messageDeleteBtn.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            deleteMessage(event);
        }
    });

    return messageDeleteBtn;
}

const deleteMessage = (event) => {
    const messageCard = event.target.parentNode;
    // Not yet finalized, so no need for socket interaction
    if(messageCard.id === 'new-message'){
        messageCard.remove();
        return;
    }

    // Notify the socket
    let sent = false;
    const parentCard = messageCard.parentNode;
    const cards = parentCard.parentNode.querySelectorAll(".card");
    let i,j;
    for(i = 0; i<cards.length; i++){
        if(cards.item(i) === parentCard){
            const messages = parentCard.querySelectorAll(".message-card");
            for(j=0; j<messages.length; j++){
                if(messages.item(j) === messageCard){
                    socket.send(JSON.stringify({"type":"delete-note","card":i,"note":j}));
                    sent = true;
                }
            }
        }
    }
    if(sent === false){
        console.error("Client failed to send command to delete message.");
    }

    messageCard.remove();
};