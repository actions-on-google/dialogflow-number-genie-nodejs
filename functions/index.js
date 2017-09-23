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

process.env.DEBUG = 'actions-on-google:*';
const { ApiAiApp } = require('actions-on-google');
const functions = require('firebase-functions');
const strings = require('./strings');
const { Utils } = require('./utils');

/** API.AI Actions {@link https://api.ai/docs/actions-and-parameters#actions} */
const Actions = {
  GENERATE_ANSWER: 'generate_answer',
  CHECK_GUESS: 'check_guess',
  QUIT: 'quit',
  PLAY_AGAIN_YES: 'play_again_yes',
  PLAY_AGAIN_NO: 'play_again_no',
  DEFAULT_FALLBACK: 'input.unknown',
  UNKNOWN_DEEPLINK: 'deeplink.unknown',
  NUMBER_DEEPLINK: 'deeplink.number',
  DONE_YES: 'done_yes',
  DONE_NO: 'done_no',
  REPEAT: 'repeat'
};
/** API.AI Parameters {@link https://api.ai/docs/actions-and-parameters#parameters} */
const Parameters = {
  NUMBER: 'number',
  GUESS: 'guess'
};
/** API.AI Contexts {@link https://api.ai/docs/contexts} */
const Contexts = {
  GAME: 'game',
  YES_NO: 'yes_no',
  DONE_YES_NO: 'done_yes_no'
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
  NONE: 'none'
};

/**
 * A class to process a request from the Assistant
 */
class NumberGenie {
  /**
   * Create a new instance of the app handler
   * @param {AoG.ExpressRequest} req
   * @param {AoG.ExpressResponse} res
   */
  constructor (req, res) {
    console.log(`Headers: ${JSON.stringify(req.headers)}`);
    console.log(`Body: ${JSON.stringify(req.body)}`);
    /** @type {ApiAiApp} */
    this.app = new ApiAiApp({ request: req, response: res });
    /** @type {AppData} */
    this.data = this.app.data;
    this.utils = new Utils(this.app);
  }

  /**
   * Get the API.AI intent and handle it using the appropriate method
   */
  run () {
    strings.setLocale(this.app.getUserLocale());
    /** @type {*} */
    const map = this;
    const action = this.app.getIntent();
    console.log(action);
    if (!action) {
      return this.app.ask(`I didn't hear a number. What's your guess?`);
    }
    map[action]();
  }

  /**
   * Send a developer provided response data using ask
   * @param {SurfacePrompts} prompt
   * @param {Array<(string | number)>} args
   */
  ask (prompt, ...args) {
    this.utils.send(prompt, args);
  }

  /**
   * Send a developer provided response data using tell
   * @param {SurfacePrompts} prompt
   * @param {Array<(string | number)>} args
   */
  tell (prompt, ...args) {
    this.utils.send(prompt, args, true);
  }

  // Below are API.AI intent handlers

  [Actions.GENERATE_ANSWER] () {
    this.data.answer = strings.getRandomNumber(strings.numbers.min, strings.numbers.max);
    this.data.guessCount = 0;
    this.data.fallbackCount = 0;
    this.data.steamSoundCount = 0;
    this.ask(strings.prompts.welcome, strings.numbers.min, strings.numbers.max);
  }

  [Actions.CHECK_GUESS] () {
    const answer = this.data.answer;
    const guess = parseInt(this.app.getArgument(Parameters.GUESS));
    const diff = Math.abs(guess - answer);
    this.data.guessCount++;
    this.data.fallbackCount = 0;
    // Check for duplicate guesses
    if (typeof this.data.previousGuess === 'number' && guess === this.data.previousGuess) {
      this.data.duplicateCount++;
      if (this.data.duplicateCount === 1) {
        if (!this.data.hint || this.data.hint === Hints.NONE) {
          return this.ask(strings.prompts.sameGuess3, guess);
        }
        return this.ask(strings.prompts.sameGuess, guess, this.data.hint);
      }
      return this.tell(strings.prompts.sameGuess2, guess);
    }
    this.data.duplicateCount = 0;
    // Check if user isn't following hints
    if (this.data.hint) {
      if (this.data.hint === Hints.HIGHER && guess <= this.data.previousGuess) {
        return this.ask(strings.prompts.wrongHigher, this.data.previousGuess);
      }
      if (this.data.hint === Hints.LOWER && guess >= this.data.previousGuess) {
        return this.ask(strings.prompts.wrongLower, this.data.previousGuess);
      }
    }
    // Handle boundaries with special prompts
    if (answer !== guess) {
      if (guess === strings.numbers.min) {
        this.data.hint = Hints.HIGHER;
        this.data.previousGuess = guess;
        return this.ask(strings.prompts.min, strings.numbers.min);
      }
      if (guess === strings.numbers.max) {
        this.data.hint = Hints.LOWER;
        this.data.previousGuess = guess;
        return this.ask(strings.prompts.max, strings.numbers.max);
      }
    }
    // Give different responses based on distance from number
    if (diff > 75) {
      // Guess is far away from number
      if (answer > guess) {
        this.data.hint = Hints.HIGHER;
        this.data.previousGuess = guess;
        return this.ask(strings.prompts.reallyColdHigh, guess);
      }
      this.data.hint = Hints.LOWER;
      this.data.previousGuess = guess;
      return this.ask(strings.prompts.reallyColdLow, guess);
    }
    if (diff === 4) {
      // Guess is getting closer
      if (answer > guess) {
        this.data.hint = Hints.NONE;
        this.data.previousGuess = guess;
        return this.ask(strings.prompts.highClose);
      }
      this.data.hint = Hints.NONE;
      this.data.previousGuess = guess;
      return this.ask(strings.prompts.lowClose);
    }
    if (diff === 3) {
      // Guess is even closer
      if (answer > guess) {
        this.data.hint = Hints.HIGHER;
        this.data.previousGuess = guess;
        if (this.data.steamSoundCount-- <= 0) {
          this.data.steamSoundCount = STEAM_SOUND_GAP;
          return this.ask(strings.prompts.highestSteam);
        }
        return this.ask(strings.prompts.highest);
      }
      this.data.hint = Hints.LOWER;
      this.data.previousGuess = guess;
      if (this.data.steamSoundCount-- <= 0) {
        this.data.steamSoundCount = STEAM_SOUND_GAP;
        return this.ask(strings.prompts.lowestSteam);
      }
      return this.ask(strings.prompts.lowest);
    }
    if (diff <= 10 && diff > 4) {
      // Guess is nearby number
      if (answer > guess) {
        this.data.hint = Hints.HIGHER;
        this.data.previousGuess = guess;
        return this.ask(strings.prompts.higher, guess);
      }
      this.data.hint = Hints.LOWER;
      this.data.previousGuess = guess;
      return this.ask(strings.prompts.lower, guess);
    }
    // Give hints on which direction to go
    if (answer > guess) {
      const previousHint = this.data.hint;
      this.data.hint = Hints.HIGHER;
      this.data.previousGuess = guess;
      if (previousHint && previousHint === Hints.HIGHER && diff <= 2) {
        // Very close to number
        if (this.data.steamSoundCount-- <= 0) {
          this.data.steamSoundCount = STEAM_SOUND_GAP;
          return this.ask(strings.prompts.reallyHotHigh2Steam);
        }
        if (diff <= 1) {
          return this.ask(strings.prompts.reallyHotHigh);
        }
        return this.ask(strings.prompts.reallyHotHigh2);
      }
      return this.ask(strings.prompts.high, guess);
    }
    if (answer < guess) {
      const previousHint = this.data.hint;
      this.data.hint = Hints.LOWER;
      this.data.previousGuess = guess;
      if (previousHint && previousHint === Hints.LOWER && diff <= 2) {
        // Very close to number
        if (this.data.steamSoundCount-- <= 0) {
          this.data.steamSoundCount = STEAM_SOUND_GAP;
          return this.ask(strings.prompts.reallyHotLow2Steam);
        }
        if (diff <= 1) {
          return this.ask(strings.prompts.reallyHotLow);
        }
        return this.ask(strings.prompts.reallyHotLow2);
      }
      return this.ask(strings.prompts.low, guess);
    }
    // Guess is same as number
    const guessCount = this.data.guessCount;
    this.data.hint = Hints.NONE;
    this.data.previousGuess = -1;
    this.app.setContext(Contexts.YES_NO);
    this.data.guessCount = 0;
    if (guessCount >= 10) {
      return this.ask(strings.prompts.winManyTries, answer);
    }
    this.ask(strings.prompts.win, answer);
  }

  [Actions.QUIT] () {
    this.tell(strings.prompts.reveal, this.data.answer);
  }

  [Actions.PLAY_AGAIN_YES] () {
    this.data.answer = strings.getRandomNumber(strings.numbers.min, strings.numbers.max);
    this.data.guessCount = 0;
    this.data.fallbackCount = 0;
    this.data.steamSoundCount = 0;
    this.ask(strings.prompts.re, strings.numbers.min, strings.numbers.max);
  }

  [Actions.PLAY_AGAIN_NO] () {
    this.app.setContext(Contexts.GAME, 1);
    this.tell(strings.prompts.quit);
  }

  [Actions.DEFAULT_FALLBACK] () {
    console.log(this.data.fallbackCount);
    if (typeof this.data.fallbackCount !== 'number') {
      this.data.fallbackCount = 0;
    }
    this.data.fallbackCount++;
    // Provide two prompts before ending game
    if (this.data.fallbackCount === 1) {
      this.app.setContext(Contexts.DONE_YES_NO);
      return this.ask(strings.prompts.fallback);
    }
    this.tell(strings.prompts.fallback2);
  }

  [Actions.UNKNOWN_DEEPLINK] () {
    const answer = strings.getRandomNumber(strings.numbers.min, strings.numbers.max);
    this.data.answer = answer;
    this.data.guessCount = 0;
    this.data.fallbackCount = 0;
    this.data.steamSoundCount = 0;
    this.app.setContext(Contexts.GAME, 1);
    const text = this.app.getRawInput();
    if (!text) {
      /** @type {*} */
      const map = this;
      return map[Actions.DEFAULT_FALLBACK]();
    }
    // Handle "talk to number genie about frogs" by counting
    // number of letters in the word as the guessed number
    const numberOfLetters = text.length;
    if (numberOfLetters < answer) {
      return this.ask(strings.prompts.deeplink, text.toUpperCase(), numberOfLetters, numberOfLetters);
    }
    if (numberOfLetters > answer) {
      return this.ask(strings.prompts.deeplink2, text.toUpperCase(), numberOfLetters, numberOfLetters);
    }
    this.data.hint = Hints.NONE;
    this.data.previousGuess = -1;
    this.app.setContext(Contexts.YES_NO);
    this.ask(strings.prompts.deeplink3, text.toUpperCase(), numberOfLetters, answer);
  }

  [Actions.NUMBER_DEEPLINK] () {
    this.data.guessCount = 0;
    this.data.fallbackCount = 0;
    this.data.steamSoundCount = 0;
    this.app.setContext(Contexts.GAME, 1);
    // Easter egg to set the answer for demos
    // Handle "talk to number genie about 55"
    this.data.answer = parseInt(this.app.getArgument(Parameters.NUMBER));
    this.ask(strings.prompts.welcome, strings.numbers.min, strings.numbers.max);
  }

  [Actions.DONE_YES] () {
    this.app.setContext(Contexts.GAME, 1);
    this.tell(strings.prompts.quit);
  }

  [Actions.DONE_NO] () {
    this.data.fallbackCount = 0;
    this.ask(strings.prompts.reAnother);
  }

  [Actions.REPEAT] () {
    const lastResponse = this.data.lastResponse;
    if (lastResponse) {
      return this.utils.sendCompiled(lastResponse); // Currently does not use repeat prompt
    }
    this.ask(strings.prompts.another);
  }
}

// HTTP Cloud Function for Firebase handler
exports.numberGenie = functions.https.onRequest(
  /** @param {*} res */ (req, res) => new NumberGenie(req, res).run()
);
