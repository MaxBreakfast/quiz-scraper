// File dependencies
var fs = require('fs');

// File paths
var URLS_FILE_PATH = './urls.list';
var BAD_URLS_FILE_PATH = './badurls.list';
var GOOD_URLS_FILE_PATH = './goodurls.list';

// Casper logic
var casper = require('casper').create({
    retryTimeout: 200,
});

var questionDatabase = [];

var grabAllData = function(){
  var headingDiv = $('h1');
  var headingText = headingDiv.text();
  var instructionDiv = $('.instructions')
  var instructions = instructionDiv.text();
  instructions = instructions.replace(/\s+/g, " ");
  
  var set = {
    quizLength: 0, 
    title: headingText,
    description: instructions,
    difficulty: -1,
    categories: [],
    questions: []  
  };

  $('.stat-table').children().each(function(index){
    if (index !== 0){
      var questionObj = {};
      // Concatenate columns 1 and 2 when there are two-part questions
      if ($(this).children().length === 5) {
        questionObj.question = $($(this).children()[0]).text() + ' - ' + $($(this).children()[1]).text();
        questionObj.answer = $($(this).children()[2]).text();
        questionObj.category = set.title;
        set.questions.push(questionObj);  
      } else {
        questionObj.question = $($(this).children()[0]).text();
        questionObj.answer = $($(this).children()[1]).text();
        questionObj.category = set.title;
        set.questions.push(questionObj);  
      }
    }
  });
  set.quizLength = set.questions.length;
  return set;
};

var addToBadUrlsList = function (url) {
  var badUrls = fs.read(BAD_URLS_FILE_PATH).split('\n');
  if (badUrls.indexOf(url) === -1) {
    fs.write(BAD_URLS_FILE_PATH, url + '\n', 'a');
    console.log('  | Add to bad URLs list.');              
  }
  console.log(' ');
};

var addToGoodUrlsList = function (url) {
  var goodUrls = fs.read(GOOD_URLS_FILE_PATH).split('\n');
  if (goodUrls.indexOf(url) === -1) {
    fs.write(GOOD_URLS_FILE_PATH, url + '\n', 'a');
    console.log('  | Add to good URLs list.');
  }
  console.log(' ');
}

// Read urls from url list and save to array
// Note: this uses the phantomJS filesystem module, NOT node's
var quizUrlArray = fs.read(URLS_FILE_PATH).split('\n');

casper.start(function(){});

casper.then(function(){
  quizUrlArray.forEach(function(url){
    casper.thenOpen(url)
    casper.then(function() {
      console.log('Starting quiz: ', url);

      if( this.evaluate(function(){ return !!$('#start-button')[0] }) ) {
        this.click('#start-button');
        console.log('  | Clicked Start Button.');

        casper.waitForSelector('.give-up', function() {
          this.click('.give-up');
          console.log('  | Clicked Give up.');
        });

        casper.waitUntilVisible('.stat-table', 
          function(){
            console.log('  | Grabbing data...');
            var returnedSet = this.evaluate(grabAllData);
            returnedSet.url = url;
            var path;
            if (returnedSet.questions.length >= 24) {
              path = './quizzes/' + returnedSet.title + '.json';
              questionDatabase.push(returnedSet);
            } else {
              path = './shortQuizzes/' + returnedSet.title + '.json';
            }
            var stringifiedSet = JSON.stringify(returnedSet);
            fs.write(path, stringifiedSet);
            addToGoodUrlsList(url);
          }, 
          // if .stat-table isnt found, casper will timeout and invoke the following
          function() {
            console.log('  | ".stat-table" selector not found...');
            addToBadUrlsList(url);
          });

      } else {
        console.log('  | No start Button Found');
        addToBadUrlsList(url);
      }
    });
  });
});

casper.run(function() {
  // Empty URLs file after scraping is complete
  fs.write(URLS_FILE_PATH, '', 'w');

  var trivia = { sets: questionDatabase };
  var totalQuestions = 0;
  for (var i = 0; i < trivia.sets.length; i++) {
    totalQuestions += trivia.sets[i].questions.length;
  }
  console.log('Number of good sets: ', trivia.sets.length);
  console.log('    Total questions: ', totalQuestions);
  console.log('----------------------------');
  var fullSet = JSON.stringify(trivia);
  fs.write('trivia.json', fullSet);
  this.echo('Scraping complete!').exit();
});
