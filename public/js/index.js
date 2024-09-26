import { initPush } from './push.js';

function initIndex() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.min.js')
            .then(function (registration) {
                console.log('Registration successful, scope is:', registration.scope);
            })
            .catch(function (error) {
                console.log('Service worker registration failed, error:', error);
            });
    } else {
        console.log('Service workers are not supported.');
    }

    fetch('/api/posts?limit=20')
        .then(function (response) {
            return response.json();
        })
        .then(function (posts) {
            for (let post of posts) {
                let template = document.querySelector('template');
                let clone = template.content.cloneNode(true);
                const timestamp = new Date(post.posted_at);
                clone.querySelector('#date').innerText = timestamp.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                });
                clone.querySelector('img').src = post.photo_url;
                clone.querySelector('article').setAttribute('post-id', post.post_id);
                document.querySelector('.container').appendChild(clone);
            }
        })
}

initIndex();
initPush();
