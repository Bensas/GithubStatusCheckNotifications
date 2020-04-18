const STATUS_RUNNING = 'running';
const STATUS_FAILED = 'failed';
const STATUS_PASSED = 'passed';

window.onload = function(){
  checkForNotificationSupport();

  var currentStatus;
  var prNumber;
  var statusMessageElements = Array.from(document.getElementsByClassName('status-heading'));
  prNumber = window.location.href.split('/pull/')[1];

  currentStatus = getStatus(statusMessageElements);
  setInterval(function() {
    prevStatus = currentStatus;
    currentStatus = getStatus(statusMessageElements);
    if (currentStatus !== prevStatus && currentStatus !== STATUS_RUNNING){
      sendNotification(currentStatus, prNumber);
    }
  },  10000); //Called every 5 seconds
};

sendNotification = function(status, prNumber){
  var notification;
  if (status === STATUS_PASSED){
    notification = new Notification('All checks have passed for PR ' + prNumber, {
      icon: chrome.runtime.getURL("parrot.gif"),
      body: 'It\'s review time!',
    });
  }
  else if (status === STATUS_FAILED){
    notification = new Notification('Some checks have failed for PR ' + prNumber, {
      icon: chrome.runtime.getURL("sadparrot.gif"),
      body: 'It\'s whitespace-fixing time!',
     });
  }
  else {
    return;
  }
  notification.onclick = function() {
   window.open(window.location.href);
  };
}

getStatus = function(statusElements){
  for (var i = 0; i < statusElements.length; i++){
    if (elemContainsText(statusElements[i], 'Some checks were not successful') ||
        elemContainsText(statusElements[i],'All checks have failed')){
      return STATUS_FAILED;
    }
    else if (elemContainsText(statusElements[i],'Some checks haven\'t completed yet')){
      return STATUS_RUNNING;
    }
    else if (elemContainsText(statusElements[i], 'All checks have passed')){
      return STATUS_PASSED;
    }
  }
}

elemContainsText = function(elem, text){
  return elem.innerHTML.indexOf(text) !== -1;
}

checkForNotificationSupport = function(){
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.');
    return;
   }
  if (Notification.permission !== 'granted')
    Notification.requestPermission();
}