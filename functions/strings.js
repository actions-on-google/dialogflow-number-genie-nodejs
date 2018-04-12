// Copyright 2017, Google, Inc.
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

/* eslint quote-props: ["error", "always"] */
/* eslint quotes: ["error", "double"] */

"use strict";

// eslint-disable-next-line quotes
const i18n = require("i18n");
const path = require("path");

i18n.configure({
  "directory": path.join(__dirname, "/locales"),
  "objectNotation": true,
  "fallbacks": {
    "fr-FR": "fr",
    "fr-CA": "fr",
  },
});

/** @param {string} locale */
const setLocale = (locale) => {
  i18n.setLocale(locale);
};

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);

/**
 * (Optional) Change this to the url of your custom hosting site
 * By default, it uses the Firebase hosting authDomain as the root url
 */
const hosting = "";

const baseUrl = hosting || `https://${firebaseConfig.projectId}.firebaseapp.com`;

/**
 * @param {string} image
 * @return {string}
 */
const getImage = (image) => `${baseUrl}/images/${image}`;

/**
 * @param {string} sound
 * @return {string}
 */
const getSound = (sound) => `<audio src="${baseUrl}/audio/${sound}"/>`;

const numbers = {
  "min": 0,
  "max": 100,
  "suggestions": 4,
};

/**
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
const getRandomNumber =
  (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const sound = {
  "cold": ["NumberGenieEarcon_ColdWind.wav"],
  "steam": ["NumberGenieEarcons_Steam.wav"],
  "steamOnly": ["NumberGenieEarcon_SteamOnly.wav"],
  "win": ["NumberGenieEarcons_YouWin.wav"],
};
/** @type {AoG.Object<string, SimpleVariants>} */
const soundDict = sound;
for (const i of Object.keys(soundDict)) {
  soundDict[i] = soundDict[i].map((a) => getSound(a));
}

/* eslint-disable quotes */
/**
 * @param {ConvData} data
 * @return {Array<string>}
 */
const onlyNumberSuggestions = (data) => {
  // eslint-disable-next-line quotes
  const none = !data.hint || data.hint === 'none';
  // eslint-disable-next-line quotes
  const min = none || data.hint === 'lower' ?
    numbers.min : data.previousGuess + 1;
  // eslint-disable-next-line quotes
  const max = none || data.hint === 'higher' ?
    numbers.max : data.previousGuess - 1;
  // Get a list of all possible numbers
  const all = Array.from(Array(max - min + 1).keys()).map((i) => i + min);
  // Use the Durstenfeld shuffle to randomly shuffle the list
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = all[i];
    all[i] = all[j];
    all[j] = temp;
  }
  // Return the first N numbers as strings
  return all.slice(0, numbers.suggestions).map((i) => i.toString());
};
/* eslint-enable quotes */

/**
 * @param {ConvData} data
 * @return {Array<string>}
 */
const numberSuggestions =
  (data) => onlyNumberSuggestions(data).concat(i18n.__("suggestions.done"));

/**
 * @typedef {Array<(string | Image | Variation | Array<Variation>)>} PromptType
 */
/**
 * @typedef {Object} Prompt
 * @prop {PromptType} rich
 * @prop {PromptType=} basic
 * @prop {(Array<string> | function(ConvData): Array<string>)=} suggestions
 */

const prompts = () => ({
  "welcome": {
    "visual": {
      "elements": [
        [i18n.__("variants.greeting"), i18n.__("variants.invocation")],
        i18n.__("variants.invocationGuess"),
        i18n.__("images.intro"),
      ],
      "suggestions": onlyNumberSuggestions,
    },
  },
  "sameGuess3": {
    "visual": {
      "elements": [
        i18n.__("variants.sameGuess3"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "sameGuess": {
    "visual": {
      "elements": [
        i18n.__("variants.sameGuess"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "sameGuess2": {
    "visual": {
      "elements": [
        i18n.__("variants.sameGuess2"),
      ],
    },
  },
  "wrongHigher": {
    "visual": {
      "elements": [
        i18n.__("variants.wrongHigher"),
        i18n.__("images.cool"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "wrongLower": {
    "visual": {
      "elements": [
        i18n.__("variants.wrongLower"),
        i18n.__("images.cool"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "min": {
    "visual": {
      "elements": [
        i18n.__("variants.min"),
        i18n.__("variants.minFollow"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "max": {
    "visual": {
      "elements": [
        i18n.__("variants.max"),
        i18n.__("variants.maxFollow"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "reallyColdHigh": {
    "visual": {
      "elements": [
        i18n.__("variants.reallyColdHigh"),
        i18n.__("images.cold"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "reallyColdLow": {
    "visual": {
      "elements": [
        i18n.__("variants.reallyColdLow"),
        i18n.__("images.cold"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "highClose": {
    "visual": {
      "elements": [
        i18n.__("variants.highClose"),
        i18n.__("images.hot"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "lowClose": {
    "visual": {
      "elements": [
        i18n.__("variants.lowClose"),
        i18n.__("images.hot"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "highestSteam": {
    "visual": {
      "elements": [
        [sound.steamOnly, i18n.__("variants.highest")],
        i18n.__("images.hot"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "highest": {
    "visual": {
      "elements": [
        i18n.__("variants.highest"),
        i18n.__("images.hot"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "lowestSteam": {
    "visual": {
      "elements": [
        [sound.steamOnly, i18n.__("variants.lowest")],
        i18n.__("images.hot"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "lowest": {
    "visual": {
      "elements": [
        i18n.__("variants.lowest"),
        i18n.__("images.hot"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "higher": {
    "visual": {
      "elements": [
        i18n.__("variants.higher"),
        i18n.__("images.warm"),
        i18n.__("variants.another"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "lower": {
    "visual": {
      "elements": [
        i18n.__("variants.lower"),
        i18n.__("images.warm"),
        i18n.__("variants.another"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "reallyHotHigh2Steam": {
    "visual": {
      "elements": [
        [sound.steam, i18n.__("variants.reallyHotHigh2")],
        i18n.__("images.hot"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "reallyHotHigh": {
    "visual": {
      "elements": [
        i18n.__("variants.reallyHotHigh"),
        i18n.__("images.hot"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "reallyHotHigh2": {
    "visual": {
      "elements": [
        i18n.__("variants.reallyHotHigh2"),
        i18n.__("images.hot"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "high": {
    "visual": {
      "elements": [
        i18n.__("variants.high"),
        i18n.__("variants.another"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "reallyHotLow2Steam": {
    "visual": {
      "elements": [
        [sound.steam, i18n.__("variants.reallyHotLow2")],
        i18n.__("images.hot"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "reallyHotLow": {
    "visual": {
      "elements": [
        i18n.__("variants.reallyHotLow"),
        i18n.__("images.hot"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "reallyHotLow2": {
    "visual": {
      "elements": [
        i18n.__("variants.reallyHotLow2"),
        i18n.__("images.hot"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "low": {
    "visual": {
      "elements": [
        i18n.__("variants.low"),
        i18n.__("variants.another"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "winManyTries": {
    "visual": {
      "elements": [
        [sound.win, i18n.__("variants.manyTries")],
        i18n.__("images.win"),
        i18n.__("variants.manyTriesAgain"),
      ],
      "suggestions": i18n.__("suggestions.confirm"),
    },
  },
  "win": {
    "visual": {
      "elements": [
        [sound.win, i18n.__("variants.correct")],
        i18n.__("images.win"),
        i18n.__("variants.again"),
      ],
      "suggestions": i18n.__("suggestions.confirm"),
    },
  },
  "reveal": {
    "visual": {
      "elements": [
        i18n.__("variants.reveal"),
        i18n.__("variants.revealBye"),
      ],
    },
  },
  "re": {
    "visual": {
      "elements": [
        [i18n.__("variants.re"), i18n.__("variants.reinvocation")],
        i18n.__("variants.reinvocationAnother"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "quit": {
    "visual": {
      "elements": [
        i18n.__("variants.quit"),
      ],
    },
  },
  "fallback": {
    "visual": {
      "elements": [
        i18n.__("variants.fallback"),
      ],
      "suggestions": i18n.__("suggestions.confirm"),
    },
  },
  "fallback2": {
    "visual": {
      "elements": [
        i18n.__("variants.fallback2"),
      ],
    },
  },
  "deeplink": {
    "visual": {
      "elements": [
        i18n.__("variants.greeting"),
        i18n.__("variants.deeplink"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "deeplink2": {
    "visual": {
      "elements": [
        i18n.__("variants.greeting"),
        i18n.__("variants.deeplink2"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "deeplink3": {
    "visual": {
      "elements": [
        [sound.win, i18n.__("variants.deeplink3")],
        i18n.__("variants.again"),
      ],
      "suggestions": i18n.__("suggestions.confirm"),
    },
  },
  "reAnother": {
    "visual": {
      "elements": [
        i18n.__("variants.re"),
        i18n.__("variants.another"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "another": {
    "visual": {
      "elements": [
        i18n.__("variants.another"),
      ],
      "suggestions": numberSuggestions,
    },
  },
  "outOfBoundsDeeplink": {
    "visual": {
      "elements": [
        [
          i18n.__("variants.outOfBoundsDeeplink"),
          i18n.__("variants.invocation"),
        ],
        i18n.__("variants.invocationGuess"),
        i18n.__("images.intro"),
      ],
      "suggestions": numberSuggestions,
    },
  },
});

module.exports = {
  getRandomNumber,
  getImage,
  numbers,
  get "general"() {
    return i18n.__("general");
  },
  get "prompts"() {
    return prompts();
  },
  setLocale,
};
