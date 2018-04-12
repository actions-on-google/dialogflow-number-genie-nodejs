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

'use strict';

const {dialogflow} = require('actions-on-google');
const functions = require('firebase-functions');
const strings = require('./strings');
const {Utils} = require('./utils');

/**
 * Dialogflow Parameters
 * {@link https://dialogflow.com/docs/actions-and-parameters#parameters}
 */
const Parameters = {
  NUMBER: 'number',
  GUESS: 'guess',
};
/**
 * Dialogflow Contexts
 * {@link https://dialogflow.com/docs/contexts}
 */
const Contexts = {
  GAME: 'game',
  YES_NO: 'yes_no',
  DONE_YES_NO: 'done_yes_no',
};

const STEAM_SOUND_GAP = 5;

/**
 * @typedef {Object} HintsType
 * @prop {Hint} HIGHER
 * @prop {Hint} LOWER
 * @prop {Hint} NONE
 */
/** @type {HintsType} */
const Hints = {
  HIGHER: 'higher',
  LOWER: 'lower',
  NONE: 'none',
};

const app = dialogflow({debug: true});

app.middleware((conv) => {
  strings.setLocale(conv.user.locale);
  conv.utils = new Utils(conv);
});

app.intent('start_game', (conv) => {
  conv.data.answer =
    strings.getRandomNumber(strings.numbers.min, strings.numbers.max);
  conv.data.guessCount = 0;
  conv.data.fallbackCount = 0;
  conv.data.steamSoundCount = 0;
  conv.utils
    .ask(strings.prompts.welcome, strings.numbers.min, strings.numbers.max);
});

app.intent('provide_guess', (conv, params) => {
  const answer = conv.data.answer;
  const guess = parseInt(conv.parameters[Parameters.GUESS]);
  const diff = Math.abs(guess - answer);
  conv.data.guessCount++;
  conv.data.fallbackCount = 0;
  // Check for duplicate guesses
  if (typeof conv.data.previousGuess === 'number' &&
    guess === conv.data.previousGuess) {
    conv.data.duplicateCount++;
    if (conv.data.duplicateCount === 1) {
      if (!conv.data.hint || conv.data.hint === Hints.NONE) {
        return conv.utils.ask(strings.prompts.sameGuess3, guess);
      }
      return conv.utils.ask(strings.prompts.sameGuess, guess, conv.data.hint);
    }
    return conv.utils.close(strings.prompts.sameGuess2, guess);
  }
  conv.data.duplicateCount = 0;
  // Check if user isn't following hints
  if (conv.data.hint) {
    if (conv.data.hint === Hints.HIGHER && guess <= conv.data.previousGuess) {
      return conv.utils
        .ask(strings.prompts.wrongHigher, conv.data.previousGuess);
    }
    if (conv.data.hint === Hints.LOWER && guess >= conv.data.previousGuess) {
      return conv.utils
        .ask(strings.prompts.wrongLower, conv.data.previousGuess);
    }
  }
  // Handle boundaries with special prompts
  if (answer !== guess) {
    if (guess === strings.numbers.min) {
      conv.data.hint = Hints.HIGHER;
      conv.data.previousGuess = guess;
      return conv.utils.ask(strings.prompts.min, strings.numbers.min);
    }
    if (guess === strings.numbers.max) {
      conv.data.hint = Hints.LOWER;
      conv.data.previousGuess = guess;
      return conv.utils.ask(strings.prompts.max, strings.numbers.max);
    }
  }
  // Give different responses based on distance from number
  if (diff > 75) {
    // Guess is far away from number
    if (answer > guess) {
      conv.data.hint = Hints.HIGHER;
      conv.data.previousGuess = guess;
      return conv.utils.ask(strings.prompts.reallyColdHigh, guess);
    }
    conv.data.hint = Hints.LOWER;
    conv.data.previousGuess = guess;
    return conv.utils.ask(strings.prompts.reallyColdLow, guess);
  }
  if (diff === 4) {
    // Guess is getting closer
    if (answer > guess) {
      conv.data.hint = Hints.NONE;
      conv.data.previousGuess = guess;
      return conv.utils.ask(strings.prompts.highClose);
    }
    conv.data.hint = Hints.NONE;
    conv.data.previousGuess = guess;
    return conv.utils.ask(strings.prompts.lowClose);
  }
  if (diff === 3) {
    // Guess is even closer
    if (answer > guess) {
      conv.data.hint = Hints.HIGHER;
      conv.data.previousGuess = guess;
      if (conv.data.steamSoundCount-- <= 0) {
        conv.data.steamSoundCount = STEAM_SOUND_GAP;
        return conv.utils.ask(strings.prompts.highestSteam);
      }
      return conv.utils.ask(strings.prompts.highest);
    }
    conv.data.hint = Hints.LOWER;
    conv.data.previousGuess = guess;
    if (conv.data.steamSoundCount-- <= 0) {
      conv.data.steamSoundCount = STEAM_SOUND_GAP;
      return conv.utils.ask(strings.prompts.lowestSteam);
    }
    return conv.utils.ask(strings.prompts.lowest);
  }
  if (diff <= 10 && diff > 4) {
    // Guess is nearby number
    if (answer > guess) {
      conv.data.hint = Hints.HIGHER;
      conv.data.previousGuess = guess;
      return conv.utils.ask(strings.prompts.higher, guess);
    }
    conv.data.hint = Hints.LOWER;
    conv.data.previousGuess = guess;
    return conv.utils.ask(strings.prompts.lower, guess);
  }
  // Give hints on which direction to go
  if (answer > guess) {
    const previousHint = conv.data.hint;
    conv.data.hint = Hints.HIGHER;
    conv.data.previousGuess = guess;
    if (previousHint && previousHint === Hints.HIGHER && diff <= 2) {
      // Very close to number
      if (conv.data.steamSoundCount-- <= 0) {
        conv.data.steamSoundCount = STEAM_SOUND_GAP;
        return conv.utils.ask(strings.prompts.reallyHotHigh2Steam);
      }
      if (diff <= 1) {
        return conv.utils.ask(strings.prompts.reallyHotHigh);
      }
      return conv.utils.ask(strings.prompts.reallyHotHigh2);
    }
    return conv.utils.ask(strings.prompts.high, guess);
  }
  if (answer < guess) {
    const previousHint = conv.data.hint;
    conv.data.hint = Hints.LOWER;
    conv.data.previousGuess = guess;
    if (previousHint && previousHint === Hints.LOWER && diff <= 2) {
      // Very close to number
      if (conv.data.steamSoundCount-- <= 0) {
        conv.data.steamSoundCount = STEAM_SOUND_GAP;
        return conv.utils.ask(strings.prompts.reallyHotLow2Steam);
      }
      if (diff <= 1) {
        return conv.utils.ask(strings.prompts.reallyHotLow);
      }
      return conv.utils.ask(strings.prompts.reallyHotLow2);
    }
    return conv.utils.ask(strings.prompts.low, guess);
  }
  // Guess is same as number
  const guessCount = conv.data.guessCount;
  conv.data.hint = Hints.NONE;
  conv.data.previousGuess = -1;
  conv.contexts.set(Contexts.YES_NO, 5);
  conv.data.guessCount = 0;
  if (guessCount >= 10) {
    return conv.utils.ask(strings.prompts.winManyTries, answer);
  }
  conv.utils.ask(strings.prompts.win, answer);
});

app.intent('quit_game', (conv) => {
  conv.utils.close(strings.prompts.reveal, conv.data.answer);
});

app.intent('play-again-yes', (conv) => {
  conv.data.answer =
    strings.getRandomNumber(strings.numbers.min, strings.numbers.max);
  conv.data.guessCount = 0;
  conv.data.fallbackCount = 0;
  conv.data.steamSoundCount = 0;
  conv.utils.ask(strings.prompts.re, strings.numbers.min, strings.numbers.max);
});

app.intent('play_again_no', (conv) => {
  conv.contexts.set(Contexts.GAME, 1);
  conv.utils.close(strings.prompts.quit);
});

const defaultFallback = (conv) => {
  console.log(conv.data.fallbackCount);
  if (typeof conv.data.fallbackCount !== 'number') {
    conv.data.fallbackCount = 0;
  }
  conv.data.fallbackCount++;
  // Provide two prompts before ending game
  if (conv.data.fallbackCount === 1) {
    conv.contexts.set(Contexts.DONE_YES_NO, 5);
    return conv.utils.ask(strings.prompts.fallback);
  }
  conv.utils.close(strings.prompts.fallback2);
};

app.intent('Default Fallback Intent', defaultFallback);

app.intent('Unknown-deeplink', (conv) => {
  const answer =
    strings.getRandomNumber(strings.numbers.min, strings.numbers.max);
  conv.data.answer = answer;
  conv.data.guessCount = 0;
  conv.data.fallbackCount = 0;
  conv.data.steamSoundCount = 0;
  conv.contexts.set(Contexts.GAME, 1);
  const text = conv.query;
  if (!text) {
    return defaultFallback(conv);
  }
  // Handle "talk to number genie about frogs" by counting
  // number of letters in the word as the guessed number
  const numberOfLetters = text.length;
  if (numberOfLetters < answer) {
    return conv.utils.ask(
      strings.prompts.deeplink,
      text.toUpperCase(),
      numberOfLetters,
      numberOfLetters
    );
  }
  if (numberOfLetters > answer) {
    return conv.utils.ask(
      strings.prompts.deeplink2,
      text.toUpperCase(),
      numberOfLetters,
      numberOfLetters
    );
  }
  conv.data.hint = Hints.NONE;
  conv.data.previousGuess = -1;
  conv.contexts.set(Contexts.YES_NO, 5);
  conv.utils.ask(
    strings.prompts.deeplink3,
    text.toUpperCase(),
    numberOfLetters,
    answer
  );
});

app.intent('deep_link_number', (conv) => {
  conv.data.guessCount = 0;
  conv.data.fallbackCount = 0;
  conv.data.steamSoundCount = 0;
  conv.contexts.set(Contexts.GAME, 1);
  // Easter egg to set the answer for demos
  // Handle "talk to number genie about 55"
  conv.data.answer = parseInt(conv.parameters[Parameters.NUMBER]);
  // Check if answer is in bounds
  if (conv.data.answer >= strings.numbers.min &&
    conv.data.answer <= strings.numbers.max) {
    return conv.utils
      .ask(strings.prompts.welcome, strings.numbers.min, strings.numbers.max);
  }
  // Give a different prompt if answer is out of bounds
  conv.data.answer =
    strings.getRandomNumber(strings.numbers.min, strings.numbers.max);
  conv.utils.ask(
    strings.prompts.outOfBoundsDeeplink,
    strings.numbers.min,
    strings.numbers.max
  );
});

app.intent('done_yes', (conv) => {
  conv.contexts.set(Contexts.GAME, 1);
  conv.utils.close(strings.prompts.quit);
});

app.intent('done_no', (conv) => {
  conv.data.fallbackCount = 0;
  conv.utils.ask(strings.prompts.reAnother);
});

app.intent('repeat', (conv) => {
  const lastResponse = conv.data.lastResponse;
  if (lastResponse) {
    // Currently does not use repeat prompt
    return conv.utils.sendCompiled(lastResponse);
  }
  conv.utils.ask(strings.prompts.another);
});

app.intent('no_input', (conv) => {
  conv.ask(strings.general.noInput[+conv.arguments.get('REPROMPT_COUNT')]);
});

app.fallback((conv) => {
  conv.ask(`I didn't hear a number. What's your guess?`);
});

exports.numberGenie = functions.https.onRequest(app);
