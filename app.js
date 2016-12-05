// Copyright 2016, Google, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START app]
'use strict';

process.env.DEBUG = 'actions-on-google:*';
let ApiAiAssistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');
let sprintf = require('sprintf-js').sprintf;

let app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({type: 'application/json'}));

function getRandomNumber (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const MIN = 0;
const MAX = 100;
const GAME_CONTEXT = 'game';
const GENERATE_ANSWER_ACTION = 'generate_answer';
const CHECK_GUESS_ACTION = 'check_guess';
const QUIT_ACTION = 'quit';
const PLAY_AGAIN_YES_ACTION = 'play_again_yes';
const PLAY_AGAIN_NO_ACTION = 'play_again_no';
const DEFAULT_FALLBACK_ACTION = 'input.unknown';
const UNKNOWN_DEEPLINK_ACTION = 'deeplink.unknown';
const YES_NO_CONTEXT = 'yes_no';
const DONE_YES_NO_CONTEXT = 'done_yes_no';
const DONE_YES_ACTION = 'done_yes';
const DONE_NO_ACTION = 'done_no';
const GUESS_ARGUMENT = 'guess';
const RAW_TEXT_ARGUMENT = 'raw_text';

const HIGHER_HINT = 'higher';
const LOWER_HINT = 'lower';
const NO_HINT = 'none';

const ANOTHER_GUESS_PROMPT = [' What\'s your next guess?', 'Have another guess?', 'Try another.'];
const LOW_PROMPTS = ['It\'s lower than %s.'];
const HIGH_PROMPTS = ['It\'s higher than %s.'];
const LOW_CLOSE_PROMPTS = ['Close, but not quite!'];
const HIGH_CLOSE_PROMPTS = ['Close, but not quite!'];
const LOWER_PROMPTS = ['You\'re getting warm. Have another guess? It\'s lower than %s.',
    'Warmer. Take another guess that\'s lower than %s.', 'Close, but it\'s lower than %s.'];
const HIGHER_PROMPTS = ['You\'re getting warm. Have another guess? It\'s higher than %s.',
    'Warmer. Take another guess that\'s higher than %s.', 'Close, but it\'s higher than %s.'];
const LOWEST_PROMPTS = ['You\'re piping hot! But it\'s still lower.',
    'You\'re hot as lava! Go lower.', 'Almost there! A bit lower.'];
const HIGHEST_PROMPTS = ['You\'re piping hot! But it\'s still higher.',
    'You\'re hot as lava! Go higher.', 'Almost there! A bit higher.'];

const CORRECT_GUESS_PROMPTS = ['Well done! It is indeed %s.', 'Congratulations, that\'s it! I was thinking of %s.',
    'You got it! It\'s %s.' ];
const PLAY_AGAIN_QUESTION_PROMPTS = ['Wanna play again?', 'Want to try again?', 'Hey, should we do that again?'];

const QUIT_REVEAL_PROMPTS = ['Ok, I was thinking of %s.', 'Sure, I\'ll tell you the number anyway. It was %s.'];
const QUIT_PROMPTS = ['Alright, talk to you later then.',
    'See you later.', 'OK, I\'m already thinking of a number for next time. Bye.'];

const GREETING_PROMPTS = ['Let\'s play Number Genie!', 'Welcome to Number Genie!'];
const INVOCATION_PROMPT = ['I\'m thinking of a number from %s to %s. What\'s your first guess?'];
const RE_PROMPT = ['Great!', 'Awesome!', 'Cool!', 'Okay, let\'s play again.', 'Okay, here we go again',
    'Alright, one more time with feeling.'];
const RE_INVOCATION_PROMPT = ['I\'m thinking of a number from %s to %s. What\'s your guess?'];

const WRONG_DIRECTION_LOWER_PROMPTS = ['Clever, but no. It\'s still lower than %s.',
    'Nice try, but it\'s still lower than %s.'];
const WRONG_DIRECTION_HIGHER_PROMPTS = ['Clever, but no. It\'s still higher than %s.',
    'Nice try, but it\'s still higher than %s.'];

const REALLY_COLD_LOW_PROMPTS = ['You\'re ice cold. It\'s way lower than %s.',
    'You\'re freezing cold. It\'s a lot lower than %s.'];
const REALLY_COLD_HIGH_PROMPTS = ['You\'re ice cold. It’s way higher than %s.',
    'You\'re freezing cold. It\'s a lot higher than %.'];
const REALLY_HOT_LOW_PROMPTS = ['Keep going.', 'So close, you\'re almost there.'];
const REALLY_HOT_HIGH_PROMPTS = ['Keep going.', 'So close, you\'re almost there.'];

const SAME_GUESS_PROMPTS_1 = ['It\'s still not %s. Guess %s.'];
const SAME_GUESS_PROMPTS_2 = ['Maybe it\'ll be %s. the next time. Let’s play again soon.'];

const MIN_PROMPTS = ['I see what you did there. But no, it\'s higher than %s.'];
const MAX_PROMPTS = ['Oh, good strategy. Start at the top. But no, it’s lower than a %s.'];

const MANY_TRIES_PROMPTS = ['Yes! It\'s %s. Nice job!  How about one more round?'];

const FALLBACK_PROMPT_1 = ['Are you done playing Number Genie?'];
const FALLBACK_PROMPT_2 = ['We can stop here. Let’s play again soon.'];

const DEEPLINK_PROMPT_1 = ['%s has %s letters. It\'s higher than %s.', '%s has %s letters, but the number is higher than %s.'];
const DEEPLINK_PROMPT_2 = ['%s has %s letters. It\'s lower than %s.', '%s has %s letters, but the number is lower than %s.'];
const DEEPLINK_PROMPT_3 = ['%s has %s letters. Wow! The number I was thinking of was %s!', '%s has %s letters. Amazing! The number I was thinking of was %s!'];

// Utility function to pick prompts
function getRandomPrompt (array) {
  return array[Math.floor(Math.random() * (array.length))];
}

// HTTP POST request handler
app.post('/', function (request, response) {
  console.log('headers: ' + JSON.stringify(request.headers));
  console.log('body: ' + JSON.stringify(request.body));

  const assistant = new ApiAiAssistant({request: request, response: response});

  function generateAnswer (assistant) {
    console.log('generateAnswer');
    let answer = getRandomNumber(MIN, MAX);
    assistant.data.answer = answer;
    assistant.data.guessCount = 0;
    assistant.data.fallbackCount = 0;
    assistant.ask(sprintf(sprintf(getRandomPrompt(GREETING_PROMPTS)) + ' ' +
      getRandomPrompt(INVOCATION_PROMPT), MIN, MAX));
  }

  function checkGuess (assistant) {
    console.log('checkGuess');
    let answer = assistant.data.answer;
    let guess = parseInt(assistant.getArgument(GUESS_ARGUMENT));
    let diff = Math.abs(guess - answer);
    assistant.data.guessCount++;
    assistant.data.fallbackCount = 0;
    // Check for duplicate guesses
    if (assistant.data.previousGuess && guess === assistant.data.previousGuess) {
      assistant.data.duplicateCount++;
      if (assistant.data.duplicateCount === 1) {
        assistant.ask(sprintf(getRandomPrompt(SAME_GUESS_PROMPTS_1), guess, assistant.data.hint));
        return;
      } else if (assistant.data.duplicateCount === 2) {
        assistant.tell(sprintf(getRandomPrompt(SAME_GUESS_PROMPTS_2), guess));
        return;
      }
    }
    assistant.data.duplicateCount = 0;
    // Check if user isn't following hints
    if (assistant.data.hint) {
      if (assistant.data.hint === HIGHER_HINT && guess <= assistant.data.previousGuess) {
        assistant.ask(sprintf(getRandomPrompt(WRONG_DIRECTION_HIGHER_PROMPTS), assistant.data.previousGuess));
        return;
      } else if (assistant.data.hint === LOWER_HINT && guess >= assistant.data.previousGuess) {
        assistant.ask(sprintf(getRandomPrompt(WRONG_DIRECTION_LOWER_PROMPTS), assistant.data.previousGuess));
        return;
      }
    }
    // Handle boundaries with special prompts
    if (answer !== guess) {
      if (guess === MIN) {
        assistant.data.hint = HIGHER_HINT;
        assistant.data.previousGuess = guess;
        assistant.ask(sprintf(getRandomPrompt(MIN_PROMPTS), MIN));
        return;
      } else if (guess === MAX) {
        assistant.data.hint = LOWER_HINT;
        assistant.data.previousGuess = guess;
        assistant.ask(sprintf(getRandomPrompt(MAX_PROMPTS), MAX));
        return;
      }
    }
    // Give different responses based on distance from number
    if (diff > 75) {
      // Guess is far away from number
      if (answer > guess) {
        assistant.data.hint = HIGHER_HINT;
        assistant.data.previousGuess = guess;
        assistant.ask(sprintf(getRandomPrompt(REALLY_COLD_HIGH_PROMPTS), guess));
        return;
      } else if (answer < guess) {
        assistant.data.hint = LOWER_HINT;
        assistant.data.previousGuess = guess;
        assistant.ask(sprintf(getRandomPrompt(REALLY_COLD_LOW_PROMPTS), guess));
        return;
      }
    } else if (diff === 4) {
      // Guess is getting closer
      if (answer > guess) {
        assistant.data.hint = NO_HINT;
        assistant.data.previousGuess = guess;
        assistant.ask(sprintf(getRandomPrompt(HIGH_CLOSE_PROMPTS)));
        return;
      } else if (answer < guess) {
        assistant.data.hint = NO_HINT;
        assistant.data.previousGuess = guess;
        assistant.ask(sprintf(getRandomPrompt(LOW_CLOSE_PROMPTS)));
        return;
      }
    } else if (diff === 3) {
      // Guess is even closer
      if (answer > guess) {
        assistant.data.hint = HIGHER_HINT;
        assistant.data.previousGuess = guess;
        assistant.ask(sprintf(getRandomPrompt(HIGHEST_PROMPTS)));
        return;
      } else if (answer < guess) {
        assistant.data.hint = LOWER_HINT;
        assistant.data.previousGuess = guess;
        assistant.ask(sprintf(getRandomPrompt(LOWEST_PROMPTS)));
        return;
      }
    } else if (diff <= 10 && diff > 4) {
      // Guess is nearby number
      if (answer > guess) {
        assistant.data.hint = HIGHER_HINT;
        assistant.data.previousGuess = guess;
        assistant.ask(sprintf(getRandomPrompt(HIGHER_PROMPTS), guess));
        return;
      } else if (answer < guess) {
        assistant.data.hint = LOWER_HINT;
        assistant.data.previousGuess = guess;
        assistant.ask(sprintf(getRandomPrompt(LOWER_PROMPTS), guess));
        return;
      }
    }
    // Give hints on which direction to go
    if (answer > guess) {
      let previousHint = assistant.data.hint;
      assistant.data.hint = HIGHER_HINT;
      assistant.data.previousGuess = guess;
      if (previousHint && previousHint === HIGHER_HINT && diff <= 2) {
        // Very close to number
        assistant.ask(sprintf(getRandomPrompt(REALLY_HOT_HIGH_PROMPTS)));
        return;
      } else {
        assistant.ask(sprintf(getRandomPrompt(HIGH_PROMPTS), guess) + ' ' + getRandomPrompt(ANOTHER_GUESS_PROMPT));
        return;
      }
    } else if (answer < guess) {
      let previousHint = assistant.data.hint;
      assistant.data.hint = LOWER_HINT;
      assistant.data.previousGuess = guess;
      if (previousHint && previousHint === LOWER_HINT && diff <= 2) {
        // Very close to number
        assistant.ask(sprintf(getRandomPrompt(REALLY_HOT_LOW_PROMPTS)));
        return;
      } else {
        assistant.ask(sprintf(getRandomPrompt(LOW_PROMPTS), guess) + ' ' + getRandomPrompt(ANOTHER_GUESS_PROMPT));
        return;
      }
    } else {
      // Guess is same as number
      let guessCount = assistant.data.guessCount;
      assistant.data.hint = NO_HINT;
      assistant.data.previousGuess = -1;
      assistant.setContext(YES_NO_CONTEXT);
      assistant.data.guessCount = 0;
      if (guessCount >= 10) {
        assistant.ask(sprintf(getRandomPrompt(MANY_TRIES_PROMPTS), answer));
        return;
      } else {
        assistant.ask(sprintf(getRandomPrompt(CORRECT_GUESS_PROMPTS), answer) + ' ' + sprintf(getRandomPrompt(PLAY_AGAIN_QUESTION_PROMPTS)));
        return;
      }
    }
  }

  function quit (assistant) {
    console.log('quit');
    let answer = assistant.data.answer;
    assistant.tell(sprintf(getRandomPrompt(QUIT_REVEAL_PROMPTS), answer));
  }

  function playAgainYes (assistant) {
    console.log('playAgainYes');
    let answer = getRandomNumber(MIN, MAX);
    assistant.data.answer = answer;
    assistant.data.guessCount = 0;
    assistant.data.fallbackCount = 0;
    assistant.ask(sprintf(getRandomPrompt(RE_PROMPT)) + ' ' + sprintf(getRandomPrompt(RE_INVOCATION_PROMPT), MIN, MAX));
  }

  function playAgainNo (assistant) {
    console.log('playAgainNo');
    assistant.setContext(GAME_CONTEXT, 1);
    assistant.tell(sprintf(getRandomPrompt(QUIT_PROMPTS)));
  }

  function defaultFallback (assistant) {
    console.log('defaultFallback');
    assistant.data.fallbackCount++;
    // Provide two prompts before ending game
    if (assistant.data.fallbackCount === 1) {
      assistant.setContext(DONE_YES_NO_CONTEXT);
      assistant.ask(sprintf(getRandomPrompt(FALLBACK_PROMPT_1)));
    } else {
      assistant.tell(sprintf(getRandomPrompt(FALLBACK_PROMPT_2)));
    }
  }

  function unhandledDeeplinks (assistant) {
    console.log('unhandledDeeplinks');
    let answer = getRandomNumber(MIN, MAX);
    assistant.data.answer = answer;
    assistant.data.guessCount = 0;
    assistant.data.fallbackCount = 0;
    let text = assistant.getArgument(RAW_TEXT_ARGUMENT);
    if (text) {
      let numberOfLetters = text.length;
      if (numberOfLetters < answer) {
        assistant.ask(sprintf(getRandomPrompt(DEEPLINK_PROMPT_1), text, numberOfLetters, numberOfLetters));
      } else if (numberOfLetters > answer) {
        assistant.ask(sprintf(getRandomPrompt(DEEPLINK_PROMPT_2), text, numberOfLetters, numberOfLetters));
      } else {
        assistant.data.hint = NO_HINT;
        assistant.data.previousGuess = -1;
        assistant.setContext(YES_NO_CONTEXT);
        assistant.ask(sprintf(getRandomPrompt(DEEPLINK_PROMPT_3), text, numberOfLetters, answer) +
          ' ' + sprintf(getRandomPrompt(PLAY_AGAIN_QUESTION_PROMPTS)));
      }
    } else {
      defaultFallback(assistant);
    }
  }

  function doneYes (assistant) {
    console.log('doneYes');
    assistant.setContext(GAME_CONTEXT, 1);
    assistant.tell(sprintf(getRandomPrompt(QUIT_PROMPTS)));
  }

  function doneNo (assistant) {
    console.log('doneNo');
    assistant.data.fallbackCount = 0;
    assistant.ask(sprintf(getRandomPrompt(RE_PROMPT)) + ' ' + sprintf(getRandomPrompt(ANOTHER_GUESS_PROMPT)));
  }

  let actionMap = new Map();
  actionMap.set(GENERATE_ANSWER_ACTION, generateAnswer);
  actionMap.set(CHECK_GUESS_ACTION, checkGuess);
  actionMap.set(QUIT_ACTION, quit);
  actionMap.set(PLAY_AGAIN_YES_ACTION, playAgainYes);
  actionMap.set(PLAY_AGAIN_NO_ACTION, playAgainNo);
  actionMap.set(DEFAULT_FALLBACK_ACTION, defaultFallback);
  actionMap.set(UNKNOWN_DEEPLINK_ACTION, unhandledDeeplinks);
  actionMap.set(DONE_YES_ACTION, doneYes);
  actionMap.set(DONE_NO_ACTION, doneNo);

  assistant.handleRequest(actionMap);
});

// Start the web server
let server = app.listen(app.get('port'), function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
