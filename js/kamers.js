const host = "http://192.168.0.100:8000/";

let evtSource;
let reconnectFrequency = 1

let tryToSetupStream = function() {
    console.log('trying to connect to SSE stream')
    setupEventSource();
    reconnectFrequency *= 2;
    if (reconnectFrequency >= 64) {
        reconnectFrequency = 64;
    }
};

let reconnectToStream = function() { 
    setTimeout(tryToSetupStream, (reconnectFrequency * 1000))
};

function setupEventSource() {
    evtSource = new EventSource(host+"stream"); 

    evtSource.onmessage = (e) => {
        const message = JSON.parse(e.data)
        const msgTopic = message.topic;
        const msgPayload = message.payload;

        if (msgTopic == 'devices') {
            for(const [key, value] of Object.entries(msgPayload)) {
                if (value.friendly_name === "Coordinator") {
                    
                } else {
                    let strings = value.friendly_name.split("/");
                    if(!document.getElementById(strings[0])) {
                        let kamer_button = document.createElement("button");
                        kamer_button.id = strings[0];
                        kamer_button.innerHTML = strings[0];
                        document.body.appendChild(kamer_button);
                        
                        kamer_button.addEventListener("click", function() {
                            window.open("kamer.html?kamer=" + strings[0] , "_self");
                        });
                    }
                }
            }
        }
    }

    evtSource.onopen = function(e) {
        console.log('connected to stream');
        reconnectFrequency = 1;
    };
  
    evtSource.onerror = function(e) {
        evtSource.close();
        console.log('an error occured, the server might be down');
        reconnectToStream();
    };
}

setupEventSource();