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

const HOSTING_URL = 'https://<YOUR_PROJECT_ID>.firebaseapp.com';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').ApiAiApp;
const sprintf = require('sprintf-js').sprintf;
const functions = require('firebase-functions');

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
const NUMBER_DEEPLINK_ACTION = 'deeplink.number';
const NUMBER_ARGUMENT = 'number';
const YES_NO_CONTEXT = 'yes_no';
const DONE_YES_NO_CONTEXT = 'done_yes_no';
const DONE_YES_ACTION = 'done_yes';
const DONE_NO_ACTION = 'done_no';
const GUESS_ARGUMENT = 'guess';
const REPEAT_ACTION = 'repeat';

const HIGHER_HINT = 'higher';
const LOWER_HINT = 'lower';
const NO_HINT = 'none';

const SSML_SPEAK_START = '<speak>';
const SSML_SPEAK_END = '</speak>';

const AUDIO_BASE_URL = HOSTING_URL + '/audio';

const COLD_WIND_AUDIO = '<audio src="' + AUDIO_BASE_URL + '/NumberGenieEarcon_ColdWind.wav"/>';
const STEAM_ONLY_AUDIO = '<audio src="' + AUDIO_BASE_URL + '/NumberGenieEarcon_SteamOnly.wav"/>';
const STEAM_AUDIO = '<audio src="' + AUDIO_BASE_URL + '/NumberGenieEarcons_Steam.wav"/>';
const YOU_WIN_AUDIO = '<audio src="' + AUDIO_BASE_URL + '/NumberGenieEarcons_YouWin.wav"/>';

const ANOTHER_GUESS_PROMPTS = ['What\'s your next guess?', 'Have another guess?', 'Try another.'];
const LOW_PROMPTS = ['It\'s lower than %s.'];
const HIGH_PROMPTS = ['It\'s higher than %s.'];
const LOW_CLOSE_PROMPTS = ['It\'s so close, but not quite!'];
const HIGH_CLOSE_PROMPTS = ['It\'s so close, but not quite!'];
const LOWER_PROMPTS = ['You\'re getting warm.  It\'s lower than %s. Have another guess?',
  'Warmer. Take another guess that\'s lower than %s.', 'It\'s so close, but it\'s lower than %s.'];
const HIGHER_PROMPTS = ['You\'re getting warm. It\'s higher than %s. Have another guess?',
  'Warmer. It\'s also higher than %s. Take another guess.', 'It\'s so close, but it\'s higher than %s.'];
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
const REALLY_HOT_LOW_PROMPTS_2 = ['Keep going.', 'It\'s so close, you\'re almost there.'];
const REALLY_HOT_HIGH_PROMPTS_1 = ['Almost there.', 'It\'s so close.'];
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

const IMAGE_BASE_URL = HOSTING_URL + '/images';

const IMAGE = {
  COLD: {url: IMAGE_BASE_URL + '/COLD.gif', altText: 'cold genie', description: 'You\'re really far off!'},
  COOL: {url: IMAGE_BASE_URL + '/COOL.gif', altText: 'cool genie', description: 'Try again!'},
  HOT: {url: IMAGE_BASE_URL + '/HOT.gif', altText: 'hot genie', description: 'You\'re so close!'},
  INTRO: {url: IMAGE_BASE_URL + '/INTRO.gif', altText: 'Mystical crystal ball', description: 'Welcome to Number Genie!'},
  WARM: {url: IMAGE_BASE_URL + '/WARM.gif', altText: 'warm genie', description: 'You\'re getting closer!'},
  WIN: {url: IMAGE_BASE_URL + '/WIN.gif', altText: 'celebrating genie', description: '🎉 Congratulations! 🎉'}
};

// Utility function to pick prompts
function getRandomPrompt (app, array) {
  let lastPrompt = app.data.lastPrompt;
  let prompt;
  if (lastPrompt) {
    for (let index in array) {
      prompt = array[index];
      if (prompt !== lastPrompt) {
        break;
      }
    }
  } else {
    prompt = array[Math.floor(Math.random() * (array.length))];
  }
  return prompt;
}

// HTTP Cloud Function for Firebase handler
exports.numberGenie = functions.https.onRequest((request, response) => {
  console.log('headers: ' + JSON.stringify(request.headers));
  console.log('body: ' + JSON.stringify(request.body));

  const app = new App({request, response});

  function generateAnswer (app) {
    console.log('generateAnswer');
    let answer = getRandomNumber(MIN, MAX);
    app.data.answer = answer;
    app.data.guessCount = 0;
    app.data.fallbackCount = 0;
    app.data.steamSoundCount = 0;

    let title = getRandomPrompt(app, GREETING_PROMPTS);
    let prompt = printf(title + ' ' +
      getRandomPrompt(app, INVOCATION_PROMPT), MIN, MAX);
    if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
      let basicCard = app.buildBasicCard(IMAGE.INTRO.description)
        .setImage(IMAGE.INTRO.url, IMAGE.INTRO.altText);
      let richResponse = app.buildRichResponse()
        .addSimpleResponse(prompt)
        .addBasicCard(basicCard);
      ask(app, richResponse);
    } else {
      ask(app, prompt);
    }
  }

  function checkGuess (app) {
    console.log('checkGuess');
    let answer = app.data.answer;
    let guess = parseInt(app.getArgument(GUESS_ARGUMENT));
    let diff = Math.abs(guess - answer);
    app.data.guessCount++;
    app.data.fallbackCount = 0;
    // Check for duplicate guesses
    if (app.data.previousGuess && guess === app.data.previousGuess) {
      app.data.duplicateCount++;
      if (app.data.duplicateCount === 1) {
        if (!app.data.hint || app.data.hint === NO_HINT) {
          ask(app, printf(getRandomPrompt(app, SAME_GUESS_PROMPTS_3), guess));
        } else {
          ask(app, printf(getRandomPrompt(app, SAME_GUESS_PROMPTS_1), guess, app.data.hint));
        }
        return;
      } else if (app.data.duplicateCount === 2) {
        app.tell(printf(getRandomPrompt(app, SAME_GUESS_PROMPTS_2), guess));
        return;
      }
    }
    app.data.duplicateCount = 0;
    // Check if user isn't following hints
    if (app.data.hint) {
      if (app.data.hint === HIGHER_HINT && guess <= app.data.previousGuess) {
        let prompt = printf(getRandomPrompt(app, WRONG_DIRECTION_HIGHER_PROMPTS), app.data.previousGuess);
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
          let basicCard = app.buildBasicCard(IMAGE.COOL.description)
            .setImage(IMAGE.COOL.url, IMAGE.COOL.altText);
          let richResponse = app.buildRichResponse()
            .addSimpleResponse(prompt)
            .addBasicCard(basicCard);
          ask(app, richResponse);
        } else {
          ask(app, prompt);
        }
        return;
      } else if (app.data.hint === LOWER_HINT && guess >= app.data.previousGuess) {
        let prompt = printf(getRandomPrompt(app, WRONG_DIRECTION_LOWER_PROMPTS), app.data.previousGuess);
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
          let basicCard = app.buildBasicCard(IMAGE.COOL.description)
            .setImage(IMAGE.COOL.url, IMAGE.COOL.altText);
          let richResponse = app.buildRichResponse()
            .addSimpleResponse(prompt)
            .addBasicCard(basicCard);
          ask(app, richResponse);
        } else {
          ask(app, prompt);
        }
        return;
      }
    }
    // Handle boundaries with special prompts
    if (answer !== guess) {
      if (guess === MIN) {
        app.data.hint = HIGHER_HINT;
        app.data.previousGuess = guess;
        ask(app, printf(getRandomPrompt(app, MIN_PROMPTS), MIN));
        return;
      } else if (guess === MAX) {
        app.data.hint = LOWER_HINT;
        app.data.previousGuess = guess;
        ask(app, printf(getRandomPrompt(app, MAX_PROMPTS), MAX));
        return;
      }
    }
    // Give different responses based on distance from number
    if (diff > 75) {
      // Guess is far away from number
      if (answer > guess) {
        app.data.hint = HIGHER_HINT;
        app.data.previousGuess = guess;
        let prompt = SSML_SPEAK_START + COLD_WIND_AUDIO +
          printf(getRandomPrompt(app, REALLY_COLD_HIGH_PROMPTS), guess) +
          SSML_SPEAK_END;
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
          let basicCard = app.buildBasicCard(IMAGE.COLD.description)
            .setImage(IMAGE.COLD.url, IMAGE.COLD.altText);
          let richResponse = app.buildRichResponse()
            .addSimpleResponse(prompt)
            .addBasicCard(basicCard);
          ask(app, richResponse);
        } else {
          ask(app, prompt);
        }
        return;
      } else if (answer < guess) {
        app.data.hint = LOWER_HINT;
        app.data.previousGuess = guess;
        let prompt = SSML_SPEAK_START + COLD_WIND_AUDIO +
          printf(getRandomPrompt(app, REALLY_COLD_LOW_PROMPTS), guess) +
          SSML_SPEAK_END;
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
          let basicCard = app.buildBasicCard(IMAGE.COLD.description)
            .setImage(IMAGE.COLD.url, IMAGE.COLD.altText);
          let richResponse = app.buildRichResponse()
            .addSimpleResponse(prompt)
            .addBasicCard(basicCard);
          ask(app, richResponse);
        } else {
          ask(app, prompt);
        }
        return;
      }
    } else if (diff === 4) {
      // Guess is getting closer
      if (answer > guess) {
        app.data.hint = NO_HINT;
        app.data.previousGuess = guess;
        let prompt = getRandomPrompt(app, HIGH_CLOSE_PROMPTS);
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
          let basicCard = app.buildBasicCard(IMAGE.HOT.description)
            .setImage(IMAGE.HOT.url, IMAGE.HOT.altText);
          let richResponse = app.buildRichResponse()
            .addSimpleResponse(prompt)
            .addBasicCard(basicCard);
          ask(app, richResponse);
        } else {
          ask(app, prompt);
        }
        return;
      } else if (answer < guess) {
        app.data.hint = NO_HINT;
        app.data.previousGuess = guess;
        let prompt = getRandomPrompt(app, LOW_CLOSE_PROMPTS);
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
          let basicCard = app.buildBasicCard(IMAGE.HOT.description)
            .setImage(IMAGE.HOT.url, IMAGE.HOT.altText);
          let richResponse = app.buildRichResponse()
            .addSimpleResponse(prompt)
            .addBasicCard(basicCard);
          ask(app, richResponse);
        } else {
          ask(app, prompt);
        }
        return;
      }
    } else if (diff === 3) {
      // Guess is even closer
      if (answer > guess) {
        app.data.hint = HIGHER_HINT;
        app.data.previousGuess = guess;
        if (app.data.steamSoundCount-- <= 0) {
          app.data.steamSoundCount = STEAM_SOUND_GAP;
          let prompt = SSML_SPEAK_START + STEAM_ONLY_AUDIO +
            printf(getRandomPrompt(app, HIGHEST_PROMPTS)) + SSML_SPEAK_END;
          if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
            let basicCard = app.buildBasicCard(IMAGE.HOT.description)
              .setImage(IMAGE.HOT.url, IMAGE.HOT.altText);
            let richResponse = app.buildRichResponse()
              .addSimpleResponse(prompt)
              .addBasicCard(basicCard);
            ask(app, richResponse);
          } else {
            ask(app, prompt);
          }
        } else {
          let prompt = getRandomPrompt(app, HIGHEST_PROMPTS);
          if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
            let basicCard = app.buildBasicCard(IMAGE.HOT.description)
              .setImage(IMAGE.HOT.url, IMAGE.HOT.altText);
            let richResponse = app.buildRichResponse()
              .addSimpleResponse(prompt)
              .addBasicCard(basicCard);
            ask(app, richResponse);
          } else {
            ask(app, prompt);
          }
        }
        return;
      } else if (answer < guess) {
        app.data.hint = LOWER_HINT;
        app.data.previousGuess = guess;
        if (app.data.steamSoundCount-- <= 0) {
          app.data.steamSoundCount = STEAM_SOUND_GAP;
          let prompt = SSML_SPEAK_START + STEAM_ONLY_AUDIO +
            printf(getRandomPrompt(app, LOWEST_PROMPTS)) + SSML_SPEAK_END;
          if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
            let basicCard = app.buildBasicCard(IMAGE.HOT.description)
              .setImage(IMAGE.HOT.url, IMAGE.HOT.altText);
            let richResponse = app.buildRichResponse()
              .addSimpleResponse(prompt)
              .addBasicCard(basicCard);
            ask(app, richResponse);
          } else {
            ask(app, prompt);
          }
        } else {
          let prompt = getRandomPrompt(app, LOWEST_PROMPTS);
          if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
            let basicCard = app.buildBasicCard(IMAGE.HOT.description)
              .setImage(IMAGE.HOT.url, IMAGE.HOT.altText);
            let richResponse = app.buildRichResponse()
              .addSimpleResponse(prompt)
              .addBasicCard(basicCard);
            ask(app, richResponse);
          } else {
            ask(app, prompt);
          }
        }
        return;
      }
    } else if (diff <= 10 && diff > 4) {
      // Guess is nearby number
      if (answer > guess) {
        app.data.hint = HIGHER_HINT;
        app.data.previousGuess = guess;
        let prompt = printf(getRandomPrompt(app, HIGHER_PROMPTS), guess);
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
          let basicCard = app.buildBasicCard(IMAGE.WARM.description)
            .setImage(IMAGE.WARM.url, IMAGE.WARM.altText);
          let richResponse = app.buildRichResponse()
            .addSimpleResponse(prompt)
            .addBasicCard(basicCard);
          ask(app, richResponse);
        } else {
          ask(app, prompt);
        }
        return;
      } else if (answer < guess) {
        app.data.hint = LOWER_HINT;
        app.data.previousGuess = guess;
        let prompt = printf(getRandomPrompt(app, LOWER_PROMPTS), guess);
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
          let basicCard = app.buildBasicCard(IMAGE.WARM.description)
            .setImage(IMAGE.WARM.url, IMAGE.WARM.altText);
          let richResponse = app.buildRichResponse()
            .addSimpleResponse(prompt)
            .addBasicCard(basicCard);
          ask(app, richResponse);
        } else {
          ask(app, prompt);
        }
        return;
      }
    }
    // Give hints on which direction to go
    if (answer > guess) {
      let previousHint = app.data.hint;
      app.data.hint = HIGHER_HINT;
      app.data.previousGuess = guess;
      if (previousHint && previousHint === HIGHER_HINT && diff <= 2) {
        // Very close to number
        if (app.data.steamSoundCount-- <= 0) {
          app.data.steamSoundCount = STEAM_SOUND_GAP;
          let prompt = SSML_SPEAK_START + STEAM_AUDIO +
            printf(getRandomPrompt(app, REALLY_HOT_HIGH_PROMPTS_2)) +
            SSML_SPEAK_END;
          if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
            let basicCard = app.buildBasicCard(IMAGE.HOT.description)
              .setImage(IMAGE.HOT.url, IMAGE.HOT.altText);
            let richResponse = app.buildRichResponse()
              .addSimpleResponse(prompt)
              .addBasicCard(basicCard);
            ask(app, richResponse);
          } else {
            ask(app, prompt);
          }
        } else {
          if (diff <= 1) {
            let prompt = getRandomPrompt(app, REALLY_HOT_HIGH_PROMPTS_1);
            if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
              let basicCard = app.buildBasicCard(IMAGE.HOT.description)
                .setImage(IMAGE.HOT.url, IMAGE.HOT.altText);
              let richResponse = app.buildRichResponse()
                .addSimpleResponse(prompt)
                .addBasicCard(basicCard);
              ask(app, richResponse);
            } else {
              ask(app, prompt);
            }
          } else {
            let prompt = getRandomPrompt(app, REALLY_HOT_HIGH_PROMPTS_2);
            if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
              let basicCard = app.buildBasicCard(IMAGE.HOT.description)
                .setImage(IMAGE.HOT.url, IMAGE.HOT.altText);
              let richResponse = app.buildRichResponse()
                .addSimpleResponse(prompt)
                .addBasicCard(basicCard);
              ask(app, richResponse);
            } else {
              ask(app, prompt);
            }
          }
        }
      } else {
        ask(app, printf(getRandomPrompt(app, HIGH_PROMPTS) + ' ' +
          getRandomPrompt(app, ANOTHER_GUESS_PROMPTS), guess));
      }
    } else if (answer < guess) {
      let previousHint = app.data.hint;
      app.data.hint = LOWER_HINT;
      app.data.previousGuess = guess;
      if (previousHint && previousHint === LOWER_HINT && diff <= 2) {
        // Very close to number
        if (app.data.steamSoundCount-- <= 0) {
          app.data.steamSoundCount = STEAM_SOUND_GAP;
          let prompt = SSML_SPEAK_START + STEAM_AUDIO +
            printf(getRandomPrompt(app, REALLY_HOT_LOW_PROMPTS_2)) + SSML_SPEAK_END;
          if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
            let basicCard = app.buildBasicCard(IMAGE.HOT.description)
              .setImage(IMAGE.HOT.url, IMAGE.HOT.altText);
            let richResponse = app.buildRichResponse()
              .addSimpleResponse(prompt)
              .addBasicCard(basicCard);
            ask(app, richResponse);
          } else {
            ask(app, prompt);
          }
        } else {
          if (diff <= 1) {
            let prompt = getRandomPrompt(app, REALLY_HOT_LOW_PROMPTS_1);
            if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
              let basicCard = app.buildBasicCard(IMAGE.HOT.description)
                .setImage(IMAGE.HOT.url, IMAGE.HOT.altText);
              let richResponse = app.buildRichResponse()
                .addSimpleResponse(prompt)
                .addBasicCard(basicCard);
              ask(app, richResponse);
            } else {
              ask(app, prompt);
            }
          } else {
            let prompt = getRandomPrompt(app, REALLY_HOT_LOW_PROMPTS_2);
            if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
              let basicCard = app.buildBasicCard(IMAGE.HOT.description)
                .setImage(IMAGE.HOT.url, IMAGE.HOT.altText);
              let richResponse = app.buildRichResponse()
                .addSimpleResponse(prompt)
                .addBasicCard(basicCard);
              ask(app, richResponse);
            } else {
              ask(app, prompt);
            }
          }
        }
      } else {
        ask(app, printf(getRandomPrompt(app, LOW_PROMPTS) + ' ' +
          getRandomPrompt(app, ANOTHER_GUESS_PROMPTS), guess));
      }
    } else {
      // Guess is same as number
      let guessCount = app.data.guessCount;
      app.data.hint = NO_HINT;
      app.data.previousGuess = -1;
      app.setContext(YES_NO_CONTEXT);
      app.data.guessCount = 0;
      if (guessCount >= 10) {
        let prompt = SSML_SPEAK_START + YOU_WIN_AUDIO +
          printf(getRandomPrompt(app, MANY_TRIES_PROMPTS), answer) +
          SSML_SPEAK_END;
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
          let basicCard = app.buildBasicCard(IMAGE.WIN.description)
            .setImage(IMAGE.WIN.url, IMAGE.WIN.altText);
          let richResponse = app.buildRichResponse()
            .addSimpleResponse(prompt)
            .addBasicCard(basicCard);
          ask(app, richResponse);
        } else {
          ask(app, prompt);
        }
      } else {
        let prompt = SSML_SPEAK_START + YOU_WIN_AUDIO +
          printf(getRandomPrompt(app, CORRECT_GUESS_PROMPTS) + ' ' +
          getRandomPrompt(app, PLAY_AGAIN_QUESTION_PROMPTS), answer) +
          SSML_SPEAK_END;
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
          let basicCard = app.buildBasicCard(IMAGE.WIN.description)
            .setImage(IMAGE.WIN.url, IMAGE.WIN.altText);
          let richResponse = app.buildRichResponse()
            .addSimpleResponse(prompt)
            .addBasicCard(basicCard);
          ask(app, richResponse);
        } else {
          ask(app, prompt);
        }
      }
    }
  }

  function quit (app) {
    console.log('quit');
    let answer = app.data.answer;
    app.tell(printf(getRandomPrompt(app, QUIT_REVEAL_PROMPTS) + ' ' +
      getRandomPrompt(app, QUIT_REVEAL_BYE), answer));
  }

  function playAgainYes (app) {
    console.log('playAgainYes');
    let answer = getRandomNumber(MIN, MAX);
    app.data.answer = answer;
    app.data.guessCount = 0;
    app.data.fallbackCount = 0;
    app.data.steamSoundCount = 0;
    ask(app, printf(getRandomPrompt(app, RE_PROMPT) + ' ' +
      getRandomPrompt(app, RE_INVOCATION_PROMPT), MIN, MAX));
  }

  function playAgainNo (app) {
    console.log('playAgainNo');
    app.setContext(GAME_CONTEXT, 1);
    app.tell(printf(getRandomPrompt(app, QUIT_PROMPTS)));
  }

  function defaultFallback (app) {
    console.log('defaultFallback: ' + app.data.fallbackCount);
    if (app.data.fallbackCount === undefined) {
      app.data.fallbackCount = 0;
    }
    app.data.fallbackCount++;
    // Provide two prompts before ending game
    if (app.data.fallbackCount === 1) {
      app.setContext(DONE_YES_NO_CONTEXT);
      ask(app, printf(getRandomPrompt(app, FALLBACK_PROMPT_1)));
    } else {
      app.tell(printf(getRandomPrompt(app, FALLBACK_PROMPT_2)));
    }
  }

  function unhandledDeeplinks (app) {
    console.log('unhandledDeeplinks');
    let answer = getRandomNumber(MIN, MAX);
    app.data.answer = answer;
    app.data.guessCount = 0;
    app.data.fallbackCount = 0;
    app.data.steamSoundCount = 0;
    app.setContext(GAME_CONTEXT, 1);
    let text = app.getRawInput();

    if (text) {
      if (isNaN(text)) {
        // Handle "talk to number genie about frogs" by counting
        // number of letters in the word as the guessed number
        let numberOfLetters = text.length;
        if (numberOfLetters < answer) {
          ask(app, getRandomPrompt(app, GREETING_PROMPTS) + ' ' +
            printf(getRandomPrompt(app, DEEPLINK_PROMPT_1), text.toUpperCase(), numberOfLetters, numberOfLetters));
        } else if (numberOfLetters > answer) {
          ask(app, getRandomPrompt(app, GREETING_PROMPTS) + ' ' +
            printf(getRandomPrompt(app, DEEPLINK_PROMPT_2), text.toUpperCase(), numberOfLetters, numberOfLetters));
        } else {
          app.data.hint = NO_HINT;
          app.data.previousGuess = -1;
          app.setContext(YES_NO_CONTEXT);
          ask(app, SSML_SPEAK_START + YOU_WIN_AUDIO +
            printf(getRandomPrompt(app, DEEPLINK_PROMPT_3) + ' ' +
            getRandomPrompt(app, PLAY_AGAIN_QUESTION_PROMPTS), text.toUpperCase(), numberOfLetters, answer) + SSML_SPEAK_END);
        }
      } else {
        // Easter egg to set the answer for demos
        // Handle "talk to number genie about 55"
        app.data.answer = parseInt(text);
        app.ask(printf(getRandomPrompt(app, GREETING_PROMPTS) + ' ' +
          getRandomPrompt(app, INVOCATION_PROMPT), MIN, MAX));
      }
    } else {
      defaultFallback(app);
    }
  }

  function numberDeeplinks (assistant) {
    console.log('numberDeeplinks');
    assistant.data.guessCount = 0;
    assistant.data.fallbackCount = 0;
    assistant.data.steamSoundCount = 0;
    assistant.setContext(GAME_CONTEXT, 1);
    let number = parseInt(assistant.getArgument(NUMBER_ARGUMENT));
    // Easter egg to set the answer for demos
    // Handle "talk to number genie about 55"
    assistant.data.answer = number;
    assistant.ask(printf(getRandomPrompt(assistant, GREETING_PROMPTS) + ' ' +
      getRandomPrompt(assistant, INVOCATION_PROMPT), MIN, MAX));
  }

  function doneYes (app) {
    console.log('doneYes');
    app.setContext(GAME_CONTEXT, 1);
    app.tell(printf(getRandomPrompt(app, QUIT_PROMPTS)));
  }

  function doneNo (app) {
    console.log('doneNo');
    app.data.fallbackCount = 0;
    ask(app, printf(getRandomPrompt(app, RE_PROMPT) + ' ' +
      getRandomPrompt(app, ANOTHER_GUESS_PROMPTS)));
  }

  function repeat (app) {
    console.log('repeat');
    let lastPrompt = app.data.lastPrompt;
    if (lastPrompt) {
      ask(app, printf(getRandomPrompt(app, REPEAT_PROMPTS), lastPrompt), false);
    } else {
      ask(app, printf(getRandomPrompt(app, ANOTHER_GUESS_PROMPTS)), false);
    }
  }

  function doPersist (persist) {
    if (persist === undefined || persist) {
      app.data.lastPrompt = app.data.printed;
    }
  }

  function ask (app, prompt, persist) {
    console.log('ask: ' + prompt);
    doPersist(persist);
    app.ask(prompt, NO_INPUT_PROMPTS);
  }

  function printf (prompt) {
    console.log('printf: ' + prompt);
    app.data.printed = prompt;
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
  actionMap.set(NUMBER_DEEPLINK_ACTION, numberDeeplinks);
  actionMap.set(DONE_YES_ACTION, doneYes);
  actionMap.set(DONE_NO_ACTION, doneNo);
  actionMap.set(REPEAT_ACTION, repeat);

  app.handleRequest(actionMap);
});
