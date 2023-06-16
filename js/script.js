document.querySelector('#toggle').onclick = (e) =>  {
    const state = 'toggle';
    const button_topic = document.querySelector('#toggle');
    const topic = button_topic.value;

    payload = {
        'topic': topic,
        'feature': {'state': state } };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify( payload )
    };
    
    fetch('http://192.168.0.100:8000/api/set', options)
};

document.querySelector('#colour').onclick = (e) =>  {
    const button_topic = document.querySelector('#colour');
    const topic = button_topic.value;
    let colorValue = document.querySelector('#wheelvalue').value

    payload = {
        'topic': topic,
        'feature': {'color': {"hex": '#'+colorValue} } };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify( payload )
    };
    
    fetch('http://192.168.0.100:8000/api/set', options)
};

document.querySelector('#rainbow').onclick = (e) => {
    const button_topic = document.querySelector('#rainbow');
    const topic = button_topic.value;
  
    const rainbowColors = ['#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#4B0082', '#EE82EE'];
  
    function logColorWithDelay(color, delay) {
      setTimeout(function() {
        const payload = {
          'topic': topic,
          'feature': {'color': {"hex": color}}
        };
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        };
  
        fetch('http://192.168.0.100:8000/api/set', options)
          .then(response => response.json())
          .then(data => {
            // Handle the response data if needed
          })
          .catch(error => {
            // Handle any errors that occurred during the request
          });
  
        const nextColorIndex = (rainbowColors.indexOf(color) + 1) % rainbowColors.length;
        const nextColor = rainbowColors[nextColorIndex];
        const nextDelay = delay + 300;
  
        logColorWithDelay(nextColor, nextDelay);
      }, delay);
    }
  
    const initialColor = rainbowColors[0];
    const initialDelay = 0;
    logColorWithDelay(initialColor, initialDelay);
  };