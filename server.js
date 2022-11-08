// Load the modules
var express = require('express'); //Express - a web application framework that provides useful utility functions like 'http'
var app = express();
var bodyParser = require('body-parser'); // Body-parser -- a library that provides functions for parsing incoming requests
app.use(bodyParser.json());              // Support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // Support encoded bodies
const axios = require('axios');
const qs = require('query-string');

var pgp = require('pg-promise')();

const dbConfig = {
	host: 'db',
	port: 5432,
	database: 'reviews_db',
	user: 'postgres',
	password: 'pwd'
};

var db = pgp(dbConfig);

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));// Set the relative path; makes accessing the resource directory easier



app.get('/', function(req, res) {
    res.render('pages/main', {
        my_title: "iTunes search",
        tracks: '',
        error: false,
        message: '',
    });
});

app.get('/main', function(req, res) {
    res.render('pages/main', {
        my_title: "iTunes search",
        tracks: '',
        error: false,
        message: '',
    });
});

app.post('/get_song', function(req, res){
    var title = req.body.title;
    var songName = req.body.title;
    if(title) {
        axios({
            url: `https://itunes.apple.com/search?term=${songName}&media=music`,
            method: 'GET',
            dataType: 'json',
        })
        .then(tracks => {
            console.log("items", tracks);
            res.render('pages/main',{
                my_title: "iTunes search",
                tracks: tracks.data.results,
                error: false
            });
        })
        .catch(error => {
            console.log(error);
            res.render('pages/main',{
                tracks: '',
                error: true,
                message: error
            })
        });
    }
    else {
        res.render('pages/main', {
            my_title: "iTunes search",
            tracks: '',
            error: true,
            messgae: "Please enter a song name"
        })
    }
});

app.post('/main/review', function(req, res) {
    var songName = req.body.songName;
    var review = req.body.review;
    var date = req.body.date
    var insert = "INSERT INTO reviews(song, review, review_date) VALUES('" + songName + "','" + review + "', NOW());";
    console.log("insert", insert);

    db.task('get-everything', task => {
        return task.batch([
            task.any(insert)
        ]);
    })
    .then(info => {
        res.render('pages/reviews', {
            my_title: "Reviews",
            reviews: info,
            songName: songName,
            review: review,
            date: date
        })
    })
    .catch(err => {
        console.log("error", err);
        res.render('pages/reviews', {
            my_title: "Reviews",
            reviews: '',
            songName: '',
            review: '',
            date: ''
        })
    })
})

app.get('/reviews', function(req, res) {
    var query = `SELECT * FROM reviews;`;
    db.task('get-everything', task => {
        return task.batch([
            task.any(query)
        ]);
    })
    .then(data => {
        console.log("data", data);
        res.render('pages/reviews', {
            my_title: "iTunes reviews",
            reviews: data[0],
            filtered: ''
        });
    })
    .catch(err => {
        console.log("error", err);
        res.render('pages/reviews', {
            my_title: "iTunes reviews",
            reviews: '',
            filtered: ''
        });
    })
});

app.post('/reviews/filter', function(req, res) {
    var songName = req.body.song;
    var query = `SELECT * FROM reviews WHERE song = '${songName}';`;
    var query2 = `SELECT * FROM reviews;`;
    db.task('get-everything', task => {
        return task.batch([
            task.any(query),
            task.any(query2)
        ]);
    })
    .then(data => {
        console.log("dataaaaa", data);
        res.render('pages/reviews', {
            my_title: "iTunes reviews",
            reviews: data[1],
            filtered: data[0]
        });
    })
    .catch(err => {
        console.log("error", err);
        res.render('pages/reviews', {
            my_title: "iTunes reviews",
            reviews: '',
            filtered: ''
        });
    })
});

app.listen(3000);
console.log('3000 is the magic port');