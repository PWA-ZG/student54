import { entries, del } from 'idb-keyval';

const filesToCache = [
    '/',
    '/index.html',
    '/post.html',
    '/css/styles.css',
    'manifest.json',
    '/icons/notification.png',
    '/icons/notification-full.png',
    '/error.html',
    '/js/index.min.js',
    '/js/post.min.js'

];

const staticCacheName = 'static-cache-v1';
const dynamicCacheName = 'dynamic-cache-v1';

async function syncPhotos(){
    entries().then((entries)=>{
        entries.forEach((entry) => {
            let { id, blob } = entry[1];
            console.log(id);
            fetch('/api/posts', {
                method: 'POST',
                body: blob
            }).then((response) => {
                if(!response.ok){
                    console.log('syncPhotos: failed response is not ok');
                }
                del(id);
            })
        })
    })

}

import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import {ExpirationPlugin} from 'workbox-expiration';
import {registerRoute} from 'workbox-routing';

registerRoute(
    ({url}) => filesToCache.includes(url.pathname),
    new CacheFirst({
        cacheName: staticCacheName,
        plugins: [
            new ExpirationPlugin({
                maxEntries: 20,
            })]
    })
);

registerRoute(
    ({url}) => !filesToCache.includes(url.pathname),
    new NetworkFirst({
        cacheName: dynamicCacheName,
        plugins: [
            new ExpirationPlugin({
                maxEntries: 100,
            })]
    })
);

self.addEventListener("sync", function(event) {
    console.log('SW: sync')

    if (event.tag === "sync-photos"){
        event.waitUntil(syncPhotos());
    }

})

self.addEventListener("push", function (event) {
    console.log("push")
    let data = {
        title: "title",
        body: "body",
        redirectUrl: "/"
    }

    if(event.data){
        data = JSON.parse(event.data.text());
    }

    let options = {
        body: data.body,
        icon: "/icons/android/android-launchericon-96-96.png",
        badge: "/icons/android/android-launchericon-96-96.png",
        vibrate: [200,100,200,100,200,100,200],
        data: {
            redirectUrl: data.redirectUrl
        }
    }

    event.waitUntil(
        self.registration.showNotification(
            data.title, options
        )
    );

})

self.addEventListener("notificationclick", function(event){
    console.log("notificationclick");
    let notification = event.notification;
    event.waitUntil(
        self.clients.matchAll().then(function (clients){
            clients.forEach(client => {
                client.navigate(notification.data.redirectUrl);
                client.focus();
            })
            notification.close();
        })
    )
})

self.addEventListener("notificationclose", function(event){
    console.log("notification close");
})

