import firebase from "firebase"
import config from '../../config/config'
firebase.initializeApp({
  messagingSenderId: config(window).messagingSenderId
})

let T = {}
export default function(activityStreamActions, onMessage, items) {

  if (!("serviceWorker" in navigator)) {
    console.log('serviceWorker not supported')
    setInterval(function() {
      let state = window.activity_stream.state
      let lastActivityTime = !state || !state.items? 0.0 : Math.max.apply(null, state.items.map(function (it) { return Number(it.time) }))
      activityStreamActions.getActivities(lastActivityTime).then(items => {
        items.forEach(function (it) {
          onMessage(it)
        })
      }).catch(e => {
        console.log(e)
      });
    }, 20000);
    return
  }

  T.onMessage = onMessage;
  const messaging = firebase.messaging()


  function deleteToken() {
    return messaging.getToken()
    .then(currentToken => {
      activityStreamActions.logout(currentToken)
      .then(() => messaging.deleteToken(currentToken))
      .then(() => {
        window.activity_stream.sendDeviceId = false
        console.log('Token deleted.')
      })
      .catch(err => {
        console.log('Unable to delete token. ', err)
      })
    })
    .catch(err => {
      console.log('Error retrieving Instance ID token. ', err)
    })
  }


  if (window.activity_stream && window.activity_stream.initialized) {
    if (!window.activity_stream.sendDeviceId) {
      getToken()
    }
    return deleteToken
  }

  navigator.serviceWorker.register('/dist/gen/activity-stream-sw.js')
  .then(registration => {
    messaging.useServiceWorker(registration)
    waitFor(() => registration.active).then(() => registration.active.postMessage(JSON.stringify(items.map(it => String(it.id)))))
    window.activity_stream.initialized = true
    getToken()
  })

  navigator.serviceWorker.addEventListener('message', event => {
    let data = event.data.notification
    if (data && "data" in data) {
      data = data.data
      T.onMessage(data)
    }
  });

  messaging.onTokenRefresh(() => {
    messaging.getToken()
    .then(refreshedToken => {
      console.log('Token refreshed.')
      getToken()
    })
    .catch(err => {
      console.log('Unable to retrieve refreshed token ', err.message)
    })
  })

  function getToken() {
    return messaging.getToken()
    .then(currentToken => {
      if (currentToken) {
        sendTokenToServer(currentToken)
      } else {
        console.log('No Instance ID token available. Request permission to generate one.')
        requestPermission()
      }
    })
    .catch(err => {
      console.log('An error occurred while retrieving token. ', err.message)
    })
  }

  function sendTokenToServer(currentToken) {
    activityStreamActions.sendDeviceId(currentToken, 'web')
    .then(() => {
      window.activity_stream.sendDeviceId = true
    })
  }

  function requestPermission() {
    messaging.requestPermission()
    .then(() => {
      console.log('Notification permission granted.')
      getToken()
    })
    .catch(err => {
      console.log('Unable to get permission to notify.', err.message)
    })
  }

  function waitFor(obj) {
    return new Promise(resolve => {
      let f = () => {
        if(!obj()) {
          setTimeout(f,  100);
        }
        else resolve()
      }
      f()
    })
  }

  return deleteToken
}
