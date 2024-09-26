import { set } from 'idb-keyval';
import { initPush } from './push.js';

function showOnly(id){
    let articles = document.getElementsByTagName('article');
    for(let article of articles){
        article.setAttribute("hidden", "true");
    }
    document.getElementById(id).removeAttribute("hidden");
}

async function uploadPhoto(type){
    let blob;
    if(type === 'canvas'){
        let canvas = document.getElementById('taken-photo');
        let arr = canvas.toDataURL('image/png').split(',');
        let mime = arr[0].match(/:(.*?);/)[1];
        let bstring = atob(arr[1]);
        let u8arr = new Uint8Array(bstring.length);
        for(let i=0;i<bstring.length;i++){
            u8arr[i] = bstring.charCodeAt(i);
        }
        blob = new Blob([u8arr], { type: mime });
        console.log(blob);
    } else if (type === 'file') {
        blob = document.getElementById('file').files[0];
    }

    try{
        if(!'serviceWorker' in navigator){
            throw new Error("Service worker not in navigator");
        }
        const id = new Date().toISOString();
        await set(id, {id, blob});
        let swRegistration = await navigator.serviceWorker.ready;
        await swRegistration.sync.register("sync-photos");
    } catch(e) {
        console.log("You can not use sync option!");
        let response = await fetch('/api/posts', {
            method: 'POST',
            body: blob
        })

        if(!response.ok){
            alert('Post failed');
        }
    }
    showOnly('video-article');
}

function initPost() {
    document.getElementById('btn-post').addEventListener("click", async (e) => {
        await uploadPhoto("canvas");
    });

    document.getElementById('btn-upload').addEventListener("click", async (e) => {
        await uploadPhoto("file");
    });

    document.getElementById('btn-discard').addEventListener("click", (e) => {
        showOnly('video-article');
    });

    document.getElementById('btn-take').addEventListener("click", (e) => {
        let player = document.getElementById('player');
        let canvas = document.getElementById('taken-photo');
        let width = player.videoWidth;
        let height = player.videoHeight;
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')
            .drawImage(player, 0, 0, width, height);
        showOnly('canvas-article');
    });

    if ('mediaDevices' in navigator) {
        navigator.mediaDevices.getUserMedia({video: true, audio: false})
            .then(function (stream) {
                let player = document.getElementById('player');
                player.srcObject = stream;
                showOnly('video-article');
            })
            .catch(function (err) {
                console.log(err);
                showOnly('upload-article');
            });
        navigator.serviceWorker.ready.then((swRegistration) => {
            return swRegistration.sync.register("sync-photos");
        }).then((r) => {
            console.log('Sync done')
        })

    } else {
        showOnly('upload-article');
    }
}

initPost();
initPush();