window.addEventListener('message', function(event) {
  // Only accept messages from the same frame
  if (event.source !== window) {
    return;
  }

  var message = event.data;

  // Only accept messages that we know are ours
  if (typeof message !== 'object' || message === null ||
      message.source !== 'olik-devtools-extension') {
    return;
  }

  chrome.runtime.sendMessage(message);

});


// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log('message', request);
//     if (request.fromOlikDevtoolsInspector) {
//       window.postMessage({
//         fromOlikDevtools: true,
//         data: request.state
//       }, '*');
//     }
//   }
// );
