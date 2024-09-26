const get = async (req,res) => {
    if (!/^[0-9]+$/.test(req.params.post_id)) {
        res.sendStatus(400);
        return;
    }
    const post_id = parseInt(req.params.post_id);
    try{
        let posts = await req.app.db.many('SELECT * FROM posts WHERE post_id = $1',[post_id]);
        const image = posts[0].image;
        res.setHeader("Content-Disposition", "inline")
            .setHeader("Content-Type","image/png")
            .send(image)
    } catch(error){
        if('result' in error && 'rowCount' in error.result && error.result.rowCount === 0){
            res.sendStatus(404);
            return;
        }
        console.log(error)
        res.sendStatus(500);
    }
}
module.exports = { get }