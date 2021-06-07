let db;

const request = indexedDB.open('pizza_hunt, 1');

// this event will emit if the database version changes (non-existant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event){
    //save a reference to the database
    const db = event.target.result;
    // create an object store (table) called 'new_pizza', sset it to have auto increment primary key
    db.createObjectStore('new_pizza', { autoIncrement: true });
    
};

request.onsuccess = function(event) {
    // when db is successfully created with its object store from above or establishes a connection, save referece to db in global variable
    db = event.target.result;

    //check and if app is online, run uploadPizza() and send all loal db data to api
    if(navigator.online){
        uploadPizza();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// Executed if we attempt to submit a new pizza
function saveRecord(record){
    // open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    // access the object store for 'new_pizza'
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    // add record ot your store with add method
    pizzaObjectStore.add(record);
}

// Collect new_pizza from idb object store and POST to server
function uploadPizza(){
    // open a transaction on  your db
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    //access your object store
    const pizzaObjectStore = transaction.objectstore('new_pizza');

    // get all records form store an set to a varaible
    const getAll = pizzaObjectStore.getAll();

    // upon successful getAll()
    getAll.onsuccess = function() {
        // if there was data in indexedDB store, sent it to API server
        if (getAll.result.length > 0) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message){
                    throw new Error(serverResponse);
                }
                //open another transaction
                const transaction = db.transaction(['new_pizza'], 'readwrite');
                // access the new_pizza object store 
                const pizzaObjectStore = transaction.objectStore('new_pizza');
                //clear all items in the store
                pizzaObjectStore.clear();
                alert('All saved pizzas have been submitted')
            })
            .catch(err => {
                console.log(err);
              });
        }
    }
}

// listen for app to come back online
window.addEventListener('online', uploadPizza);