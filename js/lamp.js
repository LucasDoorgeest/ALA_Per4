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
                if(!document.getElementById(value.friendly_name)) {
                    let object = document.createElement("div")
                    object.classList.add("object");
                    object.id = value.friendly_name;

                    let label = document.createElement("label");
                    label.classList.add("labelLamp")
                    label.innerHTML = value.friendly_name;
                    object.appendChild(label);

                    if(value.definition) {
                        if(value.definition.exposes) {
                            for(const [object2, value2] of Object.entries(value.definition.exposes)) {
                                if(value2.features) {
                                    for(const [object3, value3] of Object.entries(value2.features)) {
                                        console.log(value3);

                                        if(value3.type == "binary") {
                                            let button = document.createElement("button");
                                            button.innerHTML = "Toggle";
                                            button.classList.add("toggleButton")
                                            object.appendChild(button);
                                            button.onclick = (e) => {
                                                fetch('http://192.168.0.100:8000/api/set', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({
                                                        'topic': value.friendly_name,
                                                        'feature': {'state': 'toggle'}
                                                    })
                                                })
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }   

                    document.body.appendChild(object);
                }
            }
        } else {
            // console.log(msgTopic, msgPayload);
            if(msgPayload.state == "ON") {
                document.getElementById(msgTopic).style.color = "green";
            } else if(msgPayload.state == "OFF") {
                document.getElementById(msgTopic).style.color = "red";
            }

            if(msgPayload.occupancy == true) {
                document.getElementById(msgTopic).style.color = "green";
            } else if(msgPayload.occupancy == false) {
                document.getElementById(msgTopic).style.color = "red";
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