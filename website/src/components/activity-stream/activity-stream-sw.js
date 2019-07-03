importScripts('https://www.gstatic.com/firebasejs/4.1.3/firebase.js')
importScripts('https://www.gstatic.com/firebasejs/4.1.3/firebase-messaging.js')
import config from '../../config/config'
firebase.initializeApp({
  messagingSenderId: config(self).messagingSenderId
})
import entityLink from './activity-stream-entity-link'

self.addEventListener('notificationclick', event => {
  let data = event.notification.data

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })
  .then(windowClients => {
    let matchingClient = null

    const link = entityLink(data)
    if (link) {
      const urlToOpen = new URL(link, self.location.origin).href

      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i]
        if (windowClient.url === urlToOpen) {
          matchingClient = windowClient
          break
        }
      }

      if (matchingClient) {
        return matchingClient.focus()
      } else {
        return clients.openWindow(urlToOpen)
      }
    }
  })

  event.waitUntil(promiseChain)
})

self.addEventListener('push', event => {
  self.initState()
  let data = event.data.json()

  let id = "data" in data ? String(data.data.id) : 0
  if ("data" in data && self.noInState(id)) {
    self.addToState(id)
    const promiseChain = clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(windowClients => {
      let clientExists = false
      let clientFocusedExists = false
      windowClients.forEach(windowClient => {
        windowClient.postMessage({
          message: 'Received a push message.',
          notification: data
        })
        clientFocusedExists = clientFocusedExists || windowClient.focused
        clientExists = true
      })
      if (!clientFocusedExists && clientExists) {
        self.registration.showNotification(data.data.title, {
          body: data.data.message,
          data: data.data
        })
      }
    })

    event.waitUntil(promiseChain)
  }
})

self.addEventListener('message', function(event){
  self.initState()
  var data = JSON.parse(event.data);
  data.forEach(it => {
    if (self.noInState(it)) {
      self.addToState(it)
    }
  })
});

const messaging = firebase.messaging()
messaging.setBackgroundMessageHandler(payload => {
})

self.initState = () => {
  if (!self.activity_stream) {
    self.activity_stream = {ids:[]}
  }
  let maxCount = 1000
  if (self.activity_stream.ids.length > maxCount) {
    self.activity_stream.ids = self.activity_stream.ids.slice(maxCount/2, self.activity_stream.ids.length)
  }
}

self.noInState = it => self.activity_stream.ids.indexOf(it) == -1
self.addToState = it => self.activity_stream.ids.push(it)
