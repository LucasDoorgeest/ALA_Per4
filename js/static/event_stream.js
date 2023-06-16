const host = "http://192.168.0.100:8000/stream"; //data source, you might want to change this to 192.168.0.100

let evtSource;
let reconnectFrequency = 1 // in seconds;


/** 
 * this function tries to build the SSE connection
 * this may or may not be a first try or a retry (f.i. when the server is down)
 * in case of failure it will double the time between a retry
 * starting at reconnectFrequency in seconds and max 64 seconds
 */ 
let tryToSetupStream = function() {
    console.log('trying to connect to SSE stream')
    setupEventSource();
    reconnectFrequency *= 2;
    if (reconnectFrequency >= 64) {
        reconnectFrequency = 64;
    }
};

/**
 * in case of a broken SSE stream a reconnect is scheduled
 * the longer a server is down, the long the time it will probably take
 * for the server to get back up, that is why the reconnectfrequency
 * keeps growing. The alternative would be thousands of clients spamming
 * the server for a reconnect every microsecond. This does not help anyone
 */ 

let reconnectToStream = function() { 
  setTimeout(tryToSetupStream, (reconnectFrequency * 1000))
};

/**
 * setup the SSE and add handlers
 * the onmessage handler gets called when a message is received over the stream
 * the onopen handler gets called the first time a SSE connection is made
 * the onerror handler gets called when an error occurs in the event stream.
 */
function setupEventSource() {
    evtSource = new EventSource(host); 

    evtSource.onmessage = (e) => {
        /**
         * 'e' contains the message which is reverted to a js object
         * within the message there is a 'topic' which is 'the device'
         * and a 'payload' which holds the data that comes with the device
         * for instance:
         * woonkamer/klimaat: {
         *      "battery":83,
         *      "humidity":69.77,
         *      "linkquality":255,
         *      "power_outage_count":8696,"pressure":1013.4,
         *      "temperature":18.05,"voltage":2975}
         * 
         * every topic is the name of the device in two parts:
         *      location/device -> woonkamer/schemerlamp
         * there is one special topic: 'devices'
         * this topic holds all information on all devices and their 
         * and is send as the first message after the SSE connects
         */
        const message = JSON.parse(e.data)
        const msgTopic = message.topic;
        const msgPayload = message.payload;
        console.log('@onmessage')
      
        if (msgTopic == 'devices') {
          // received info on all devices on the network, handle with care
          // just logging here
          console.log(msgPayload);
        } else {
          // received device update, handle with care
          // just loggin here
          console.log('msgTopic = ' + msgTopic)
        }
        // add the data to the html-console so you can see what happens
        let textarea = document.querySelector('#message-history')
        textarea.value += (
          msgTopic + ': ' + JSON.stringify(msgPayload) + '\n');
        textarea.scrollTop = 99999;
      };

    evtSource.onopen = function(e) {
      console.log('connected to stream');
      // in case this was a retry, preemptively set back to 1
      reconnectFrequency = 1;
    };

    evtSource.onerror = function(e) {
      evtSource.close();
      console.log('an error occured, the server might be down');
      reconnectToStream();
    };
}

/* let's go! */
setupEventSource();