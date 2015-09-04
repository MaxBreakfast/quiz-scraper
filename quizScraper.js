var fs = require('fs');

var casper = require('casper').create({
    retryTimeout: 200,
});

var returnedSet;

var grabAllData = function(){
  var headingDiv = $('h1');
  var headingText = headingDiv.text();
  var instructionDiv = $('.instructions')
  var instructions = instructionDiv.text();
  instructions = instructions.replace(/\s+/g, " ");
  var set = {};
  set.title = headingText;
  set.description = instructions;
  set.difficulty = -1;
  set.categories = [];
  set.questions = [];

  $('.stat-table').children().each(function(index){
    if(index !== 0){
      var questionObj = {};
      questionObj.question = $(this).children()[0].innerHTML;
      questionObj.answer = $(this).children()[1].innerHTML;
      questionObj.category = set.title;
      set.questions.push(questionObj);
    }
  });
  return set;
};

var quizUrlArray = [
'http://www.jetpunk.com/quizzes/nfl-coaches-quiz.php',
'http://www.jetpunk.com/quizzes/who-wrote-that-book-quiz.php',
'http://www.jetpunk.com/quizzes/former-spouses-quiz.php',
'http://www.jetpunk.com/quizzes/former-countries',
'http://www.jetpunk.com/quizzes/fairy-tale-characters',
'http://www.jetpunk.com/quizzes/2000s-music-trivia',
'http://www.jetpunk.com/user-quizzes/26045/basic-harry-potter-quiz',
'http://www.jetpunk.com/quizzes/fresh-prince-lyrics-quiz.php',
'http://www.jetpunk.com/quizzes/name-us-presidents.php',
'http://www.jetpunk.com/quizzes/history-general-knowledge-10',
'http://www.jetpunk.com/quizzes/movie-cameos-quiz',
'http://www.jetpunk.com/quizzes/european-capitals-quiz.php',
'http://www.jetpunk.com/quizzes/mythical-creatures-quiz.php',
'http://www.jetpunk.com/quizzes/name-state-capitals.php',
'http://www.jetpunk.com/quizzes/40-historical-people-everyone-should-know-quiz',
'http://www.jetpunk.com/quizzes/states-by-governor-quiz.php',
'http://www.jetpunk.com/quizzes/sports-terms-quiz.php',
'http://www.jetpunk.com/quizzes/map-quiz-nfl-cities.php',
'http://www.jetpunk.com/quizzes/word-scramble-countries',
'http://www.jetpunk.com/quizzes/fast-math-multiplication-quiz.php',
'http://www.jetpunk.com/quizzes/answers-contain-four-quiz.php',
'http://www.jetpunk.com/quizzes/asian-capitals-quiz.php',
'http://www.jetpunk.com/quizzes/sports-equipment-quiz',
'http://www.jetpunk.com/quizzes/famous-animals-quiz.php',
'http://www.jetpunk.com/quizzes/name-the-olympian-gods.php',
'http://www.jetpunk.com/quizzes/sports-by-athlete-quiz.php',
'http://www.jetpunk.com/quizzes/o-vocabulary-words-quiz.php',
'http://www.jetpunk.com/quizzes/which-country-are-they-from-quiz.php',
'http://www.jetpunk.com/quizzes/video-games-quotes',
'http://www.jetpunk.com/user-quizzes/23997/harry-potter-name-game',
'http://www.jetpunk.com/user-quizzes/30947/actors-by-recurring-role',
'http://www.jetpunk.com/quizzes/cartoon-villains-quiz.php',
'http://www.jetpunk.com/quizzes/general-knowledge-quiz-9.php',
'http://www.jetpunk.com/quizzes/who-starred-in-that-movie-quiz-12.php',
'http://www.jetpunk.com/quizzes/british-words-quiz.php',
'http://www.jetpunk.com/quizzes/science-fiction-characters',
'http://www.jetpunk.com/quizzes/mythical-creatures-quiz-2.php',
'http://www.jetpunk.com/quizzes/deadly-animals-quiz',
'http://www.jetpunk.com/user-quizzes/23069/people-named-patrick-quiz',
'http://www.jetpunk.com/quizzes/car-brands-quiz.php',
'http://www.jetpunk.com/user-quizzes/33027/religion-a-to-z',
'http://www.jetpunk.com/user-quizzes/73833/movies-based-on-a-true-story',
'http://www.jetpunk.com/quizzes/city-nicknames-quiz.php',
'http://www.jetpunk.com/quizzes/animals-that-start-with-g',
'http://www.jetpunk.com/quizzes/1990s-music-trivia-2',
'http://www.jetpunk.com/quizzes/countries-with-most-tourists-quiz.php',
'http://www.jetpunk.com/quizzes/who-did-that-2000s-song-quiz.php',
'http://www.jetpunk.com/quizzes/cities-by-stadium-quiz.php',
'http://www.jetpunk.com/user-quizzes/23069/pixar-characters-quiz',
'http://www.jetpunk.com/user-quizzes/24769/landmarks-of-countries-2',
'http://www.jetpunk.com/quizzes/1970s-music-trivia',
'http://www.jetpunk.com/quizzes/1970s-movie-trivia',
'http://www.jetpunk.com/user-quizzes/13441/top-100-movie-quotes',
'http://www.jetpunk.com/quizzes/who-did-that-eighties-song-quiz.php',
'http://www.jetpunk.com/quizzes/f-vocabulary-words-quiz-2.php',
'http://www.jetpunk.com/quizzes/1980s-music-trivia-2',
'http://www.jetpunk.com/quizzes/50-states-50-cities-quiz.php',
'http://www.jetpunk.com/user-quizzes/24787/disney-feature-films-by-character'
];

casper.start(function() {
  console.log("I'm starting");
});

casper.then(function(){
  quizUrlArray.forEach(function(url){
    casper.thenOpen(url)
    casper.then(function() {
      console.log("Starting quiz: ", url);
      if(this.evaluate(function(){
        return !!$('#start-button')[0];
      })){
        this.click('#start-button');
        console.log('  | Clicked Start Button.');

        casper.waitForSelector('.give-up', function() {
          this.click('.give-up');
          console.log('  | Clicked Give up.');
        });

        casper.waitForSelector('.stat-table', function(){
          console.log(' [O] Grabbing data...');
          returnedSet = this.evaluate(grabAllData);
          var stringifiedSet = JSON.stringify(returnedSet);
          fs.write('./quizzes/' + returnedSet.title + '.json', stringifiedSet);
        });

      } else {
        console.log(' [X] No Start Button Found');
      }
    });
  });
});

casper.run(function() {
  this.echo("Scraping complete!").exit();
});