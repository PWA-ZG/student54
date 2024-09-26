const post = async (req, res) => {
    try{
        let {sub} = req.body;
        await req.app.db.none("INSERT INTO subscriptions(sub_json) VALUES ($1)", [JSON.stringify(sub)]);
        console.log(sub);
        res.sendStatus(201);
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
}

module.exports = {post};