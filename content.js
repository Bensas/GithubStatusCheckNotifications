const STATUS_RUNNING = 'running';
const STATUS_FAILED = 'failed';
const STATUS_PASSED = 'passed';
const STATUS_EMPTY = 'empty';

window.onload = function(){
    checkForNotificationSupport();

    let latestStatus = {"status": STATUS_EMPTY, "time": new Date()}
    
    var interval = setInterval(function() {
        let currentStatus = determineCurrentStatus()
        if (latestStatus.status !== currentStatus) {
            if (latestStatus.status === STATUS_EMPTY && (currentStatus === STATUS_FAILED || currentStatus === STATUS_PASSED)) {
                return
            }
            latestStatus.status = currentStatus;
            latestStatus.time = new Date()
        }
        
        if (currentStatus === STATUS_FAILED || currentStatus === STATUS_PASSED) {
            let currentTime = new Date()
            if (currentTime - latestStatus.time > 3000) {
                sendNotification(latestStatus.status, window.location.href.split('/pull/')[1])
                clearInterval(interval)
            }
        }

    },  1000); // Called every second
  };

function sendNotification(status, prNumber) {
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

function checkForNotificationSupport() {
    if (!Notification) {
        alert('Desktop notifications not available in your browser. Try Chromium.');
        return;
        }
    if (Notification.permission !== 'granted')
        Notification.requestPermission();
}
  

function determineCurrentStatus() {
    let statusMessageElements = Array.from(document.getElementsByClassName('status-heading'));
    for (var i = 0; i < statusMessageElements.length; i++){
        if (elemContainsText(statusMessageElements[i], 'Some checks were not successful') ||
            elemContainsText(statusMessageElements[i],'All checks have failed')){
          return STATUS_FAILED;
        }
        else if (elemContainsText(statusMessageElements[i],'Some checks haven’t completed yet')){
          return STATUS_RUNNING;
        }
        else if (elemContainsText(statusMessageElements[i], 'All checks have passed')){
          return STATUS_PASSED;
        }
      }
      return STATUS_EMPTY;
}

function elemContainsText(elem, text) {
    return elem.innerHTML.indexOf(text) !== -1;
}