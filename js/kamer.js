const kamer = new URLSearchParams(window.location.search).get('kamer');

if(kamer) {
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

    let send = function(device, feature) {
        fetch('http://192.168.0.100:8000/api/set', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'topic': device,
                'feature': feature
            })
        })
    }

    function setupEventSource() {
        evtSource = new EventSource(host+"stream"); 

        evtSource.onmessage = (e) => {
            const message = JSON.parse(e.data)
            const msgTopic = message.topic;
            const msgPayload = message.payload;

            if (msgTopic == 'devices') {
                for(const [key, device] of Object.entries(msgPayload)) {
                    deviceName = device.friendly_name.split("/");
                    if(deviceName[0] == kamer) {
                        if(!document.getElementById(deviceName[1])) {
                            let deviceDiv = document.createElement("div");
                            deviceDiv.id = deviceName[1];
                            
                            let deviceLabel = document.createElement("label")
                            deviceLabel.innerHTML = deviceName[1];
                            deviceDiv.appendChild(deviceLabel);

                            if (device.definition) {
                                if (device.definition.exposes) {
                                    for(const [key2, expose] of Object.entries(device.definition.exposes)) {
                                        if(expose.features) {
                                            for(const [key3, feature] of Object.entries(expose.features)) {
                                                let featureDiv = document.createElement("div"); // Container div met class "feature"
                                                featureDiv.classList.add("feature");

                                                if (feature.type == "binary") {
                                                    let featureLabel = document.createElement("label"); // Maak een header, met class "featureLabel"
                                                    featureLabel.innerHTML = feature.name;
                                                    featureLabel.classList.add("featureLabel");
                                                    featureDiv.appendChild(featureLabel);
                                                    
                                                    let featureButton = document.createElement("input"); // Maak de checkbox, met class "binary"
                                                    featureButton.type = "checkbox";
                                                    featureButton.id = deviceName[1] + "_binary";
                                                    featureButton.classList.add("binary");
                                                    featureButton.addEventListener("click", (e) => {
                                                        let booleanValue;
                                                        if(e.target.checked) {
                                                            booleanValue = "ON";
                                                        } else {
                                                            booleanValue = "OFF"
                                                        }
                                                        send(device.friendly_name, {'state': booleanValue});
                                                    })
                                                    featureDiv.appendChild(featureButton);
                                                }

                                                if (feature.type == "numeric") {
                                                    let featureLabel = document.createElement("label"); // Maak een header, met class "featureLabel"
                                                    featureLabel.innerHTML = feature.name;
                                                    featureLabel.classList.add("featureLabel");
                                                    featureDiv.appendChild(featureLabel);
                                                    
                                                    let featureButton = document.createElement("input"); // Sliders, voor brightness en colortemp, met de class "numeric"
                                                    featureButton.type = "range";
                                                    featureButton.max = feature.value_max;
                                                    featureButton.min = feature.value_min;
                                                    featureButton.id = deviceName[1] + "_numeric";
                                                    featureButton.classList.add("numeric");
                                                    featureButton.addEventListener("input", (event) => {
                                                        if (feature.property == "brightness") {
                                                            send(device.friendly_name, {"brightness": event.target.value});
                                                        } else if (feature.property == "color_temp") {
                                                            send(device.friendly_name, {"color_temp": event.target.value});
                                                        }
                                                    })
                                                    featureDiv.appendChild(featureButton);
                                                }

                                                if (feature.type == "composite") {
                                                    let featureLabel = document.createElement("label"); // Maak een header, met class "featureLabel"
                                                    featureLabel.innerHTML = feature.name;
                                                    featureLabel.classList.add("featureLabel");
                                                    featureDiv.appendChild(featureLabel);

                                                    let featureButton = document.createElement("input"); // Maak een kleur kiezer, met class "composite"
                                                    featureButton.type = "color";
                                                    featureButton.id = deviceName[1] + "_numeric";
                                                    featureButton.classList.add("composite");
                                                    featureButton.addEventListener("input", (event) => {
                                                        if (feature.property == "color") {
                                                            send(device.friendly_name, {"color" : event.target.value});
                                                        }
                                                    })
                                                    featureDiv.appendChild(featureButton);
                                                }

                                                deviceDiv.appendChild(featureDiv);
                                            }
                                        }
                                    }
                                }
                            }

                            document.body.appendChild(deviceDiv);
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
} else {
    window.open("index.html", "_self");
}

