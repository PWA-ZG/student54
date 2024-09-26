const webpush = require('web-push');

async function sendPushNotifications(db){
    const publicKey = process.env.WEBPUSH_PUBLIC_KEY;
    const privateKey = process.env.WEBPUSH_PRIVATE_KEY;
    const ownerEmail = process.env.OWNER_EMAIL;
    try {
        webpush.setVapidDetails(
            `mailto:${ownerEmail}`,
            publicKey,
            privateKey
        )
        let subs = await db.many("SELECT sub_json FROM subscriptions;");
        subs = subs.map((obj) => JSON.parse(obj.sub_json));
        for (let sub of subs) {
            webpush.sendNotification(sub, JSON.stringify({
                title: "New post",
                body: "Somebody just posted a new post",
                redirectUrl: '/index.html'
            }))
                .then((r) => console.log("Notification sent"))
                .catch((e) => console.log("Failed to send notification"));
        }
    } catch(e) {
        console.log("Notification sending error");
    }
}

const get = async (req,res) => {
    const skip = parseInt(req.query.skip) ? parseInt(req.query.skip) : 0;
    const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
    try {
        let posts = await req.app.db.any('SELECT post_id, posted_at  FROM posts ORDER BY post_id DESC OFFSET $1 LIMIT $2;',[skip,limit]);
        posts = posts.map((post) => {
            return {...post,
                photo_url: `/api/posts/${post.post_id}/photo`};
        });
        res.json(posts);
    } catch(error){
        res.sendStatus(500);
    }
}

const post = async (req,res) => {
    try {
        const imageData = req.body;
        console.log(imageData);
        // check if data less than 5MB
        if(imageData.length > 5 * 1024 * 1024){
            res.status(400).json({error: 'Image must be less than 5MB'});
            return;
        }
        const {post_id} = await req.app.db.one('INSERT INTO posts (image) VALUES ($1) RETURNING post_id', [imageData]);
        // send push notification
        sendPushNotifications(req.app.db)
        //    .then(r => console.log("Notifications sent"))
        //    .catch(e => console.log("Notification sending failed"))
        res.setHeader('Location', `/api/posts/${post_id}`).status(201).end();
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}

const del = async (req,res) => {
    try{
        await req.app.db.any('DELETE FROM posts',);
        res.sendStatus(200);
    } catch(error){
        console.log(error);
        res.sendStatus(500);
    }
}

module.exports = { get, del, post }