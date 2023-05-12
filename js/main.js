/* you can do better for sure!
 * choose your own solution, do not take above suggestion
 * for id and value for granted, think for yourself.
 * The button example is probably just there to show you how not to do it.
 * check out the ieee, exposed features ('exposes')
 * and what 'topic' can offer you! */
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
        