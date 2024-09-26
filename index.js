require('dotenv').config();
const express = require('express');
const pgp = require('pg-promise')();
const apiRouter = require('./router/router');
const bodyParser = require("body-parser");
const app = express();

app.db = pgp(process.env.DB_URL);
app.use(bodyParser.json());
app.get('/healtz',(req,res) =>{
    res.sendStatus(200);
})
app.use('/api', apiRouter);
app.use('/', express.static('public'));


const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 3000;

if(externalUrl){
    const hostname = '0.0.0.0';
    app.listen(port, hostname, () => {
        console.log(`Server is running locally on http://${hostname}:${port}/ and from outside on ${externalUrl}`);
    });
} else {
    app.listen(port, () => {
        console.log(`Server is running locally on http://localhost:${port}/ `);
    });
}
