var port = process.env.PORT || 3000,
app = require('./server/index');

app.listen(port, function() {
  console.log('Express server listening on port ' + port);
});
