const publicKey = process.env.WEBPUSH_PUBLIC_KEY;
const btnNotification = document.getElementById("btn-notification");
const imgNotification = btnNotification.getElementsByTagName("img")[0];

async function getSubscription(){
    let reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
}

function urlBase64ToUint8Array(base64String) {
    let padding = '='.repeat((4 - base64String.length % 4) % 4);
    let base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    let rawData = window.atob(base64);
    let outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function registerPushSubscriptions(){
    try{
        let reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();
        if(sub !== null){
            imgNotification.src = "icons/notification.png"
            await sub.unsubscribe();
            console.log("SUBSCRIPTION: removing");
            return;
        }
        imgNotification.src = "icons/notification-full.png"
        sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
        console.log(JSON.stringify(sub));
        let res = await fetch("/api/subscriptions",{
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({sub})
        });
        if(res.ok){
            console.log("SUBSCRIPTION: granted");
        } else {
            console.log("SUBSCRIPTION: failed because res is not ok");
            imgNotification.src = "icons/notification.png"
            await sub.unsubscribe();
        }
    } catch(e){
        console.log(e);
    }
}

export function initPush() {
    if ("Notification" in window && "serviceWorker" in navigator) {
        btnNotification.addEventListener("click", function () {
            Notification.requestPermission(async (res) => {
                if (res === "granted") {
                    await registerPushSubscriptions();
                } else {
                    console.log("PUSH: user denied push notifications")
                }
            })
        })
        // update icon based on state
        navigator.serviceWorker.ready.then((reg) => {
            reg.pushManager.getSubscription().then((sub) => {
                imgNotification.src = sub === null ?
                    "icons/notification.png" :
                    "icons/notification-full.png";
                console.log(`Sub is ${sub}`);
            })
        });
    } else {
        console.log("PUSH: Notifications are not available");
        btnNotification.style.backgroundColor = "#a0c0e0";
    }
}
