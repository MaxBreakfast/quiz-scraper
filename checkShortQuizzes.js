// File dependencies
var fs = require('fs');
var config = require('./config');

console.log('  | Checking quizzes in ' + config.SHORT_QUIZZES_PATH)
var quizzesUpdated = 0;
var quizzesMoved = 0;
//Get list of files in the short quizzes folder
filenames = fs.readdirSync(config.SHORT_QUIZZES_PATH)

filenames.forEach(function(filename) {
  var data = fs.readFileSync(config.SHORT_QUIZZES_PATH + filename, {encoding: "utf-8"})
  console.log('  | Checking ' + filename);
  var quizData = JSON.parse(data);
  //Recount the number of questions in the quiz.
  var oldLength = quizData.quizLength;
  quizData.quizLength = quizData.questions.length;
  if (oldLength !== quizData.quizLength) {
    quizzesUpdated++;
    console.log('    | Updating question count from ' + oldLength + " to " + quizData.quizLength);
    fs.writeFile(config.SHORT_QUIZZES_PATH + filename, JSON.stringify(quizData));
    if (quizData.quizLength >= config.MINIMUM_NUMBER_OF_QUESTIONS) {
      quizzesMoved++;
      console.log('    | New total is above cutoff. Moving to ' + config.GOOD_QUIZZES_PATH);
      fs.rename(config.SHORT_QUIZZES_PATH + filename, config.GOOD_QUIZZES_PATH + filename)
    } else {
      console.log('    | New total is still below cutoff.');
    }
  }
  //If the new total is above the minimum acceptable, move this quiz to the good folder
});

console.log('   ----SCAN COMPLETE----');
console.log('    Quizzes updated: ' + quizzesUpdated);
console.log('    Quizzes moved:   ' + quizzesMoved);

