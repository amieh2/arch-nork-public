var net = require('net');
var world = require('.././common/world.json');
var constants = require("./constants");

var Current ={
    Room:[],
    inventory :[]
};
Current.Room = world.rooms[0];

var server = net.createServer(function(socket) {

    socket.setEncoding('utf8');
    sendClientMessage({current: Current, msg: Current.Room.description});
    /**
     * Handles JSON data received from client
     */
    socket.on('data', function(message) {
        message = JSON.parse(message);
        var returnMessage = Process(message.data);
        sendClientMessage({current: Current, msg: returnMessage});

    });

    /**
     * Sends JSON data to client
     * @param data
     */
    function sendClientMessage(data) {
        socket.write(JSON.stringify({ data: data}));
    }
});


console.log("Server: Started");
server.listen(constants.TCP_PORT, constants.HOST);

/** Function that processes the answer from the four commands the user can input, if its not one of the valid commands
 * @return {string}
 */
function Process(answer) {
    if(answer.substr(0,3) === 'GO ') { //if the user types go, calls the process go method
        return ProcessGo(answer.substr(3).toLowerCase());
    } else if(answer.substr(0,5) === 'TAKE ') { //if the user types take, calls the process take method
        return ProcessTake(answer.substr(5).toLowerCase());
    } else if(answer.substr(0,4) === 'USE ') { //if the user types use, calls the process use method
        return ProcessUse(answer.substr(4).toLowerCase());
    } else if(answer.substr(0,10) === 'INVENTORY') { //if the user types inventory, calls the process go method
        return ProcessInventory();
    } else {
        Current = null;
        return 'Sorry, not valid. You died, Game Over!'; // if the user types anything other than the commands
    }
}


/** Function to process when the user types the command go
 * @return {string}
 */
function ProcessGo(direction) {
    if (Current.Room.exits[direction]) {
        var NewRoomName = Current.Room.exits[direction];
        for (var i = 0; i < world.rooms.length; i++) { //checks the rooms that are the world
            if (world.rooms[i].id === NewRoomName.id) { // if it matches, then current room changes
                Current.Room = world.rooms[i];
                return '\n' + 'You moved ' + direction + ', now you are in the ' + Current.Room.id + '.'
                    + Current.Room.description + '\n';
            }
        }
    }
    else {
        return "Not a valid direction";
    }
}



/** Function to process when the user types the command take
 * @return {string}
 */
function ProcessTake(itemName){
    for(var i = 0; i < Current.Room.items.length; i++) {
        if(Current.Room.items[i] === itemName) {
            Current.Room.items.splice(i, 1);  //removes the item from the room
            Current.inventory.push(itemName); //adds the item the user picked up to the inventory
            return 'You picked up: ' + itemName;
        }
    }
    return 'Could not find ' + itemName;
}


/** Function to process when the user types use
 * @return {string}
 */
function ProcessUse(itemName) {
    var inInventory = false;
    for (var i = 0; i < Current.inventory.length; i++) { //checks the list of current inventory
        if (Current.inventory[i] === itemName) { //If the current inventory contains the item the user typed
            inInventory = true;
        }
    }
    if (inInventory) {
        if(!Current.Room.uses) {
            return "No items can be used in this room";
        }
        for (var i = 0; i < Current.Room.uses.length; i++) {
            if (Current.Room.uses[i].item === itemName) {
                Current.inventory.splice(itemName, 1);  //if you use the item, remove it from inventory
                for (var j = 0; j < world.rooms.length; j++) {
                    if( Current.Room.uses[i].effect.consumed) { // if item has been consumed.
                        return "This item has already been consumed and cannot be used again";
                    }
                    if (Current.Room.uses[i].effect.goto === world.rooms[j].id) { //update location with goto effect
                        Current.Room.uses[i].effect.consumed = true;
                        var msg = Current.Room.uses[i].description;
                        Current.Room = world.rooms[j];
                        return msg + '\n' + Current.Room.description;
                    }
                }
            }
        }
        return "This item cannot be used in this room."
    } else {
        return 'Sorry you dont have that item!';
    }
}

/** Function to process when the user types inventory
 * @return {string}
 */
function ProcessInventory() {
    return 'Current inventory: ' + '' + Current.inventory;  //prints out the current inventory
}
