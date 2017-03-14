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
let sprintf = require('sprintf-js').sprintf;

function getRandomNumber (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const MIN = 0;
const MAX = 100;
const STEAM_SOUND_GAP = 5;
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
const REPEAT_ACTION = 'repeat';

const HIGHER_HINT = 'higher';
const LOWER_HINT = 'lower';
const NO_HINT = 'none';

const SSML_SPEAK_START = '<speak>';
const SSML_SPEAK_END = '</speak>';
const COLD_WIND_AUDIO = '<audio src="https://xxxxxx/numbergeniesounds/NumberGenieEarcon_ColdWind.wav">cold wind sound</audio>';
const STEAM_ONLY_AUDIO = '<audio src="https://xxxxxx/numbergeniesounds/NumberGenieEarcon_SteamOnly.wav">steam sound</audio>';
const STEAM_AUDIO = '<audio src="https://xxxxxx/numbergeniesounds/NumberGenieEarcons_Steam.wav">steam sound</audio>';
const YOU_WIN_AUDIO = '<audio src="https://xxxxxx/numbergeniesounds/NumberGenieEarcons_YouWin.wav">winning sound</audio>';

const ANOTHER_GUESS_PROMPTS = ['What\'s your next guess?', 'Have another guess?', 'Try another.'];
const LOW_PROMPTS = ['It\'s lower than %s.'];
const HIGH_PROMPTS = ['It\'s higher than %s.'];
const LOW_CLOSE_PROMPTS = ['Close, but not quite!'];
const HIGH_CLOSE_PROMPTS = ['Close, but not quite!'];
const LOWER_PROMPTS = ['You\'re getting warm.  It\'s lower than %s. Have another guess?',
    'Warmer. Take another guess that\'s lower than %s.', 'Close, but it\'s lower than %s.'];
const HIGHER_PROMPTS = ['You\'re getting warm. It\'s higher than %s. Have another guess?',
    'Warmer. It\'s also higher than %s. Take another guess.', 'Close, but it\'s higher than %s.'];
const LOWEST_PROMPTS = ['You\'re piping hot! But it\'s still lower.',
    'You\'re hot as lava! Go lower.', 'Almost there! A bit lower.'];
const HIGHEST_PROMPTS = ['You\'re piping hot! But it\'s still higher.',
    'You\'re hot as lava! Go higher.', 'Almost there! A bit higher.'];

const CORRECT_GUESS_PROMPTS = ['Well done! It is indeed %s.', 'Congratulations, that\'s it! I was thinking of %s.',
    'You got it! It\'s %s.' ];
const PLAY_AGAIN_QUESTION_PROMPTS = ['Wanna play again?', 'Want to try again?', 'Hey, should we do that again?'];

const QUIT_REVEAL_PROMPTS = ['Ok, I was thinking of %s.', 'Sure, I\'ll tell you the number anyway. It was %s.'];
const QUIT_REVEAL_BYE = ['See you later.', 'Talk to you later.'];
const QUIT_PROMPTS = ['Alright, talk to you later then.', 'OK, till next time.',
    'See you later.', 'OK, I\'m already thinking of a number for next time.'];

const GREETING_PROMPTS = ['Let\'s play Number Genie!', 'Welcome to Number Genie!', 'Hi! This is Number Genie.',
    'Welcome back to Number Genie.'];
const INVOCATION_PROMPT = ['I\'m thinking of a number from %s to %s. What\'s your first guess?'];
const RE_PROMPT = ['Great!', 'Awesome!', 'Cool!', 'Okay, let\'s play again.', 'Okay, here we go again.',
    'Alright, one more time with feeling.'];
const RE_INVOCATION_PROMPT = ['I\'m thinking of a new number from %s to %s. What\'s your guess?'];

const WRONG_DIRECTION_LOWER_PROMPTS = ['Clever, but no. It\'s still lower than %s.',
    'Nice try, but it\'s still lower than %s.'];
const WRONG_DIRECTION_HIGHER_PROMPTS = ['Clever, but no. It\'s still higher than %s.',
    'Nice try, but it\'s still higher than %s.'];

const REALLY_COLD_LOW_PROMPTS = ['You\'re ice cold. It\'s way lower than %s.',
    'You\'re freezing cold. It\'s a lot lower than %s.'];
const REALLY_COLD_HIGH_PROMPTS = ['You\'re ice cold. It’s way higher than %s.',
    'You\'re freezing cold. It\'s a lot higher than %s.'];
const REALLY_HOT_LOW_PROMPTS_1 = ['Almost there.', 'Very close.'];
const REALLY_HOT_LOW_PROMPTS_2 = ['Keep going.', 'So close, you\'re almost there.'];
const REALLY_HOT_HIGH_PROMPTS_1 = ['Almost there.', 'So close.'];
const REALLY_HOT_HIGH_PROMPTS_2 = ['Keep going.', 'Very close, you\'re almost there.'];

const SAME_GUESS_PROMPTS_1 = ['It\'s still not %s. Guess %s.'];
const SAME_GUESS_PROMPTS_2 = ['Maybe it\'ll be %s the next time. Let’s play again soon.'];
const SAME_GUESS_PROMPTS_3 = ['It\'s still not %s. Guess again.'];

const MIN_PROMPTS = ['I see what you did there. But no, it\'s higher than %s.'];
const MAX_PROMPTS = ['Oh, good strategy. Start at the top. But no, it’s lower than %s.'];

const MANY_TRIES_PROMPTS = ['Yes! It\'s %s. Nice job!  How about one more round?'];

const FALLBACK_PROMPT_1 = ['Are you done playing Number Genie?'];
const FALLBACK_PROMPT_2 = ['Since I\'m still having trouble, I\'ll stop here. Let’s play again soon.'];

const DEEPLINK_PROMPT_1 = ['%s has %s letters. The number I\'m thinking of is higher. Have another guess?',
    '%s is a great guess. It has %s letters, but I\'m thinking of a higher number. What\'s your next guess?'];
const DEEPLINK_PROMPT_2 = ['%s has %s letters. The number I\'m thinking of is lower. Have another guess?',
    '%s is a great first guess. It has %s letters, but the number I\'m thinking of is lower. Guess again!'];
const DEEPLINK_PROMPT_3 = ['Wow! You\'re a true Number Genie! %s has %s letters and the number I was thinking of was %s! Well done!',
    'Amazing! You\'re a real Number Genie! %s has %s letters and the number I was thinking of was %s. Great job!'];

const NO_INPUT_PROMPTS = ['I didn\'t hear a number', 'If you\'re still there, what\'s your guess?',
    'We can stop here. Let\'s play again soon.'];

const REPEAT_PROMPTS = ['Sure. %s.', 'OK. %s.'];

// Utility function to pick prompts
function getRandomPrompt (assistant, array) {
  let lastPrompt = assistant.data.lastPrompt;
  let prompt;
  if (lastPrompt) {
    for (let index in array) {
      prompt = array[index];
      if (prompt != lastPrompt) {
        break;
      }
    }
  } else {
    prompt = array[Math.floor(Math.random() * (array.length))];
  }
  return prompt;
}

// HTTP Cloud Function handler
exports.number_genie = function (request, response) {
  console.log('headers: ' + JSON.stringify(request.headers));
  console.log('body: ' + JSON.stringify(request.body));

  const assistant = new ApiAiAssistant({request: request, response: response});

  function generateAnswer (assistant) {
    console.log('generateAnswer');
    let answer = getRandomNumber(MIN, MAX);
    assistant.data.answer = answer;
    assistant.data.guessCount = 0;
    assistant.data.fallbackCount = 0;
    assistant.data.steamSoundCount = 0;
    ask(assistant, printf(getRandomPrompt(assistant, GREETING_PROMPTS) + ' ' +
      getRandomPrompt(assistant, INVOCATION_PROMPT), MIN, MAX));
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
        if (!assistant.data.hint || assistant.data.hint === NO_HINT) {
          ask(assistant, printf(getRandomPrompt(assistant, SAME_GUESS_PROMPTS_3), guess));
        } else {
          ask(assistant, printf(getRandomPrompt(assistant, SAME_GUESS_PROMPTS_1), guess, assistant.data.hint));
        }
        return;
      } else if (assistant.data.duplicateCount === 2) {
        assistant.tell(printf(getRandomPrompt(assistant, SAME_GUESS_PROMPTS_2), guess));
        return;
      }
    }
    assistant.data.duplicateCount = 0;
    // Check if user isn't following hints
    if (assistant.data.hint) {
      if (assistant.data.hint === HIGHER_HINT && guess <= assistant.data.previousGuess) {
        ask(assistant, printf(getRandomPrompt(assistant, WRONG_DIRECTION_HIGHER_PROMPTS), assistant.data.previousGuess));
        return;
      } else if (assistant.data.hint === LOWER_HINT && guess >= assistant.data.previousGuess) {
        ask(assistant, printf(getRandomPrompt(assistant, WRONG_DIRECTION_LOWER_PROMPTS), assistant.data.previousGuess));
        return;
      }
    }
    // Handle boundaries with special prompts
    if (answer !== guess) {
      if (guess === MIN) {
        assistant.data.hint = HIGHER_HINT;
        assistant.data.previousGuess = guess;
        ask(assistant, printf(getRandomPrompt(assistant, MIN_PROMPTS), MIN));
        return;
      } else if (guess === MAX) {
        assistant.data.hint = LOWER_HINT;
        assistant.data.previousGuess = guess;
        ask(assistant, printf(getRandomPrompt(assistant, MAX_PROMPTS), MAX));
        return;
      }
    }
    // Give different responses based on distance from number
    if (diff > 75) {
      // Guess is far away from number
      if (answer > guess) {
        assistant.data.hint = HIGHER_HINT;
        assistant.data.previousGuess = guess;
        ask(assistant, SSML_SPEAK_START + COLD_WIND_AUDIO +
          printf(getRandomPrompt(assistant, REALLY_COLD_HIGH_PROMPTS), guess) + SSML_SPEAK_END);
        return;
      } else if (answer < guess) {
        assistant.data.hint = LOWER_HINT;
        assistant.data.previousGuess = guess;
        ask(assistant, SSML_SPEAK_START + COLD_WIND_AUDIO +
          printf(getRandomPrompt(assistant, REALLY_COLD_LOW_PROMPTS), guess) + SSML_SPEAK_END);
        return;
      }
    } else if (diff === 4) {
      // Guess is getting closer
      if (answer > guess) {
        assistant.data.hint = NO_HINT;
        assistant.data.previousGuess = guess;
        ask(assistant, printf(getRandomPrompt(assistant, HIGH_CLOSE_PROMPTS)));
        return;
      } else if (answer < guess) {
        assistant.data.hint = NO_HINT;
        assistant.data.previousGuess = guess;
        ask(assistant, printf(getRandomPrompt(assistant, LOW_CLOSE_PROMPTS)));
        return;
      }
    } else if (diff === 3) {
      // Guess is even closer
      if (answer > guess) {
        assistant.data.hint = HIGHER_HINT;
        assistant.data.previousGuess = guess;
        if (assistant.data.steamSoundCount-- <= 0) {
          assistant.data.steamSoundCount = STEAM_SOUND_GAP;
          ask(assistant, SSML_SPEAK_START + STEAM_ONLY_AUDIO + printf(getRandomPrompt(assistant, HIGHEST_PROMPTS)) +
            SSML_SPEAK_END);
        } else {
          ask(assistant, getRandomPrompt(assistant, HIGHEST_PROMPTS));
        }
        return;
      } else if (answer < guess) {
        assistant.data.hint = LOWER_HINT;
        assistant.data.previousGuess = guess;
        if (assistant.data.steamSoundCount-- <= 0) {
          assistant.data.steamSoundCount = STEAM_SOUND_GAP;
          ask(assistant, SSML_SPEAK_START + STEAM_ONLY_AUDIO + printf(getRandomPrompt(assistant, LOWEST_PROMPTS)) +
            SSML_SPEAK_END);
        } else {
          ask(assistant, getRandomPrompt(assistant, LOWEST_PROMPTS));
        }
        return;
      }
    } else if (diff <= 10 && diff > 4) {
      // Guess is nearby number
      if (answer > guess) {
        assistant.data.hint = HIGHER_HINT;
        assistant.data.previousGuess = guess;
        ask(assistant, printf(getRandomPrompt(assistant, HIGHER_PROMPTS), guess));
        return;
      } else if (answer < guess) {
        assistant.data.hint = LOWER_HINT;
        assistant.data.previousGuess = guess;
        ask(assistant, printf(getRandomPrompt(assistant, LOWER_PROMPTS), guess));
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
        if (assistant.data.steamSoundCount-- <= 0) {
          assistant.data.steamSoundCount = STEAM_SOUND_GAP;
          ask(assistant, SSML_SPEAK_START + STEAM_AUDIO +
            printf(getRandomPrompt(assistant, REALLY_HOT_HIGH_PROMPTS_2)) + SSML_SPEAK_END);
        } else {
          if (diff <= 1) {
            ask(assistant, getRandomPrompt(assistant, REALLY_HOT_HIGH_PROMPTS_1));
          } else {
            ask(assistant, getRandomPrompt(assistant, REALLY_HOT_HIGH_PROMPTS_2));
          }
        }
        return;
      } else {
        ask(assistant, printf(getRandomPrompt(assistant, HIGH_PROMPTS) + ' ' +
          getRandomPrompt(assistant, ANOTHER_GUESS_PROMPTS), guess));
        return;
      }
    } else if (answer < guess) {
      let previousHint = assistant.data.hint;
      assistant.data.hint = LOWER_HINT;
      assistant.data.previousGuess = guess;
      if (previousHint && previousHint === LOWER_HINT && diff <= 2) {
        // Very close to number
        if (assistant.data.steamSoundCount-- <= 0) {
          assistant.data.steamSoundCount = STEAM_SOUND_GAP;
          ask(assistant, SSML_SPEAK_START + STEAM_AUDIO +
            printf(getRandomPrompt(assistant, REALLY_HOT_LOW_PROMPTS_2)) + SSML_SPEAK_END);
        } else {
          if (diff <= 1) {
            ask(assistant, getRandomPrompt(assistant, REALLY_HOT_LOW_PROMPTS_1));
          } else {
            ask(assistant, getRandomPrompt(assistant, REALLY_HOT_LOW_PROMPTS_2));
          }
        }
        return;
      } else {
        ask(assistant, printf(getRandomPrompt(assistant, LOW_PROMPTS) + ' ' +
          getRandomPrompt(assistant, ANOTHER_GUESS_PROMPTS), guess));
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
        ask(assistant, SSML_SPEAK_START + YOU_WIN_AUDIO +
          printf(getRandomPrompt(assistant, MANY_TRIES_PROMPTS), answer) + SSML_SPEAK_END);
        return;
      } else {
        ask(assistant, SSML_SPEAK_START + YOU_WIN_AUDIO +
          printf(getRandomPrompt(assistant, CORRECT_GUESS_PROMPTS) + ' ' +
          getRandomPrompt(assistant, PLAY_AGAIN_QUESTION_PROMPTS), answer) + SSML_SPEAK_END);
        return;
      }
    }
  }

  function quit (assistant) {
    console.log('quit');
    let answer = assistant.data.answer;
    assistant.tell(printf(getRandomPrompt(assistant, QUIT_REVEAL_PROMPTS) + ' '
      + getRandomPrompt(assistant, QUIT_REVEAL_BYE), answer));
  }

  function playAgainYes (assistant) {
    console.log('playAgainYes');
    let answer = getRandomNumber(MIN, MAX);
    assistant.data.answer = answer;
    assistant.data.guessCount = 0;
    assistant.data.fallbackCount = 0;
    assistant.data.steamSoundCount = 0;
    ask(assistant, printf(getRandomPrompt(assistant, RE_PROMPT) + ' ' +
      getRandomPrompt(assistant, RE_INVOCATION_PROMPT), MIN, MAX));
  }

  function playAgainNo (assistant) {
    console.log('playAgainNo');
    assistant.setContext(GAME_CONTEXT, 1);
    assistant.tell(printf(getRandomPrompt(assistant, QUIT_PROMPTS)));
  }

  function defaultFallback (assistant) {
    console.log('defaultFallback: ' + assistant.data.fallbackCount);
    if (assistant.data.fallbackCount === undefined) {
      assistant.data.fallbackCount = 0;
    }
    assistant.data.fallbackCount++;
    // Provide two prompts before ending game
    if (assistant.data.fallbackCount === 1) {
      assistant.setContext(DONE_YES_NO_CONTEXT);
      ask(assistant, printf(getRandomPrompt(assistant, FALLBACK_PROMPT_1)));
    } else {
      assistant.tell(printf(getRandomPrompt(assistant, FALLBACK_PROMPT_2)));
    }
  }

  function unhandledDeeplinks (assistant) {
    console.log('unhandledDeeplinks');
    let answer = getRandomNumber(MIN, MAX);
    assistant.data.answer = answer;
    assistant.data.guessCount = 0;
    assistant.data.fallbackCount = 0;
    assistant.data.steamSoundCount = 0;
    assistant.setContext(GAME_CONTEXT, 1);
    let text = assistant.getArgument(RAW_TEXT_ARGUMENT);
    if (text) {
      if (isNaN(text)) {
        // Handle "talk to number genie about frogs" by counting
        // number of letters in the word as the guessed number
        let numberOfLetters = text.length;
        if (numberOfLetters < answer) {
          ask(assistant, getRandomPrompt(assistant, GREETING_PROMPTS) + ' ' +
            printf(getRandomPrompt(assistant, DEEPLINK_PROMPT_1), text.toUpperCase(), numberOfLetters, numberOfLetters));
        } else if (numberOfLetters > answer) {
          ask(assistant, getRandomPrompt(assistant, GREETING_PROMPTS) + ' ' +
            printf(getRandomPrompt(assistant, DEEPLINK_PROMPT_2), text.toUpperCase(), numberOfLetters, numberOfLetters));
        } else {
          assistant.data.hint = NO_HINT;
          assistant.data.previousGuess = -1;
          assistant.setContext(YES_NO_CONTEXT);
          ask(assistant, SSML_SPEAK_START + YOU_WIN_AUDIO +
            printf(getRandomPrompt(assistant, DEEPLINK_PROMPT_3) + ' ' +
            getRandomPrompt(assistant, PLAY_AGAIN_QUESTION_PROMPTS), text.toUpperCase(), numberOfLetters, answer) + SSML_SPEAK_END);
        }
      } else {
        // Easter egg to set the answer for demos
        // Handle "talk to number genie about 55"
        assistant.data.answer = parseInt(text);
        assistant.ask(printf(getRandomPrompt(assistant, GREETING_PROMPTS) + ' ' +
          getRandomPrompt(assistant, INVOCATION_PROMPT), MIN, MAX));
      }
    } else {
      defaultFallback(assistant);
    }
  }

  function doneYes (assistant) {
    console.log('doneYes');
    assistant.setContext(GAME_CONTEXT, 1);
    assistant.tell(printf(getRandomPrompt(assistant, QUIT_PROMPTS)));
  }

  function doneNo (assistant) {
    console.log('doneNo');
    assistant.data.fallbackCount = 0;
    ask(assistant, printf(getRandomPrompt(assistant, RE_PROMPT) + ' ' +
      getRandomPrompt(assistant, ANOTHER_GUESS_PROMPTS)));
  }

  function repeat (assistant) {
    console.log('repeat');
    let lastPrompt = assistant.data.lastPrompt;
    if (lastPrompt) {
      ask(assistant, printf(getRandomPrompt(assistant, REPEAT_PROMPTS), lastPrompt), false);
    } else {
      ask(assistant, printf(getRandomPrompt(assistant, ANOTHER_GUESS_PROMPTS)), false);
    }
  }

  function ask (assistant, prompt, persist) {
    console.log('ask: ' + prompt);
    if (persist === undefined || persist) {
      assistant.data.lastPrompt = assistant.data.printed;
    }
    assistant.ask(prompt, NO_INPUT_PROMPTS);
  }

  function printf(prompt) {
    console.log('printf: ' + prompt);
    assistant.data.printed = prompt;
    return sprintf.apply(this, arguments);
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
  actionMap.set(REPEAT_ACTION, repeat);

  assistant.handleRequest(actionMap);
};
