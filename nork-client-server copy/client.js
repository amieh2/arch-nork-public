var net = require('net');
var readline = require('readline');
var constants = require("./constants");

var io = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var client = new net.Socket();

/**
 * Connects client to server
 */
client.connect(constants.TCP_PORT, constants.HOST, function() {
    console.log('Welcome to the game of Nork! \n');
});

/**
 * Handles incoming JSON data from Server
 */
client.on('data', function(message) {
    message = JSON.parse(message);
    var current = message.data.current;
    console.log(message.data.msg);
    if(current && !current.Room.status) { //status defined as win or lost
        io.question('What would you like to do?', askQuestion);
    } else {
        io.close();
        client.destroy(); //close tcp connection
    }
});

/**
 * Sends response to server over TCP socket
 * @param answer
 */
var askQuestion = function(answer) {
    client.write(JSON.stringify({data: answer.toUpperCase()}));
};

/**
 * Handles Errors
 */
client.on('error', function(e) {
    if(e.code == 'ECONNREFUSED') {
        console.log('Client: Could not connect to server, retrying...');
        client.setTimeout(2000, function() {
            client.connect(constants.TCP_PORT, constants.HOST);
        });
    }   
});
