// load environment varialbes
var dotenv = require('dotenv');
dotenv.load();

var path = require('path');
// start express server
var schema = require('./config/schema');
var express = require('express');
var engine  = require('ejs-locals');
var app = express(); 

var bodyParser = require('body-parser')
var methodOverride = require('method-override')
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({extended: false}) );

app.use( methodOverride() )


app.set('views', path.normalize(__dirname)+ '/views/')
app.use(express.static(path.normalize(__dirname) + '/public'))
app.engine('ejs', engine);
app.set('view engine','ejs');

app.use(function (req, res, next) {
  console.log(req.method +" "+ req.url)
  res.locals.req = req;
  res.locals.res = res;
    
  if (typeof(process.env.CLOUDINARY_URL)=='undefined'){
    throw new Error('Missing CLOUDINARY_URL environment variable')
  }else{
    next()
  }
})

var photosController = require('./controllers/photos_controller');
photosController.wire(app);

app.use(function(err, req, res, next){
  if (err.message && (~err.message.indexOf('not found') || (~err.message.indexOf('Cast to ObjectId failed')))) {
    return next()
  }
  console.log('error (500) '+err.message)
  console.log(err.stack);
  if (~err.message.indexOf('CLOUDINARY_URL')){
    res.status(500).render('errors/dotenv', { error: err})
  }else{
    res.status(500).render('errors/500', { error: err})
  }
})

// assume 404 since no middleware responded
app.use(function(req, res, next){
  console.log('error (404)')
  res.status(404).render('errors/404', {
    url: req.url,
    error: 'Not found'
  })
})

var server = app.listen(process.env.PORT || 9000, function() {
    console.log('Listening on port %d', server.address().port);
});
