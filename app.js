const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const database = require('./lib/database');
const app = express();

app.listen(3000);

database.mongoose.connect('mongodb://localhost/blog');

//middleware compression/favicon/urlencode/bodyParser
app.use(compression());
app.use(favicon(path.join(__dirname, 'public', 'img/fav.ico'), 0));
app.use(bodyParser.json());       // for get param in POST and GET method
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.set('trust proxy', 1); // trust first proxy
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}));

//defined jade as view engine by default
app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));

app.get('/', function(req, res) {
        var sess = req.session;
        if (sess.login) {
            console.log(sess.login);
        } else {
            sess.login = 'admiaaaan';
        }
        
        database.article.find(null, function (err, articles) {
            if (err) { throw err; }

            res.render('index', {articles: articles});
        });
    })
    .post('/login', function(req, res) {
        var sess = req.session;
        if (req.body.login == 'admin' && req.body.password == 'azerty') {
            sess.pseudo = 'admin';
            console.log(sess.pseudo);
            res.setHeader('Content-Type', 'text/html');
            res.end('Page contact');
        } else {
            req.sess
        }
    })
    .get('/contact', function(req, res) {
        res.setHeader('Content-Type', 'text/plain');
        res.end('Page contact');
    })
    .get('/article/:article_slug/', function(req, res) {
        res.setHeader('Content-Type', 'text/html');

        database.article.find({slug: req.params.article_slug}, function (err, article) {
            if (err) { throw err; }

            res.render('article', {article: article[0] });
        });
    })
    .get('/chat', function(req, res) {
        res.setHeader('Content-Type', 'text/html');

        res.render('chat', { });
    })
    .post('/', function(req, res) {
        if (req.body.title.length == 0 || req.body.content.length == 0) {
            console.log("#####ERROR#####")
        } else {
            var title = req.body.title;
            var content = req.body.content;
            database.createArticle(title, content);
        }

        res.redirect('/');
    })
    .get('/article-remove/:article_slug/', function(req, res) {

        database.article.remove({slug: req.params.article_slug}, function (err) {

            res.redirect('/');
        });
    })
;

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Lost !');
});
