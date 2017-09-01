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

// eslint-disable-next-line quotes
const functions = require('firebase-functions');

/**
 * (Optional) Change this to the url of your custom hosting site
 * By default, it uses the Firebase hosting authDomain as the root url
 */
const hosting = "";

const baseUrl = hosting || `https://${functions.config().firebase.authDomain}`;

/** @param {string} image */
const getImage = image => `${baseUrl}/images/${image}`;

/** @param {string} sound */
const getSound = sound => `<audio src="${baseUrl}/audio/${sound}"/>`;

const numbers = {
  "min": 0,
  "max": 100,
  "suggestions": 4
};

/**
 * @param {number} min
 * @param {number} max
 */
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const images = {
  "cold": {
    "url": "COLD.gif",
    "altText": "cold genie",
    "cardText": [
      "Freezing like an ice cave in Antarctica?",
      "I can't feel my face anymore",
      "Hurry, before I turn into an icicle"
    ]
  },
  "cool": {
    "url": "COOL.gif",
    "altText": "cool genie",
    "cardText": [
      "Colder than a water droplet at 0°C",
      "Did you feel that cold gust of wind?",
      "Let me grab a coat. This may take awhile."
    ]
  },
  "hot": {
    "url": "HOT.gif",
    "altText": "hot genie",
    "cardText": [
      "Hotter than the sun's corona",
      "It's getting hot. Buy me a slushie?",
      "I may melt before you solve this one"
    ]
  },
  "intro": {
    "url": "INTRO.gif",
    "altText": "mystical crystal ball",
    "cardText": [
      "Are you a mind reader?",
      "Can you read my mind?",
      "Few have cracked this one on the first try"
    ]
  },
  "warm": {
    "url": "WARM.gif",
    "altText": "warm genie",
    "cardText": [
      "Warmer than a California summer",
      "It's getting warm. Hand me my shades.",
      "You're hot on the trail, but not quite there"
    ]
  },
  "win": {
    "url": "WIN.gif",
    "altText": "celebrating genie",
    "cardText": [
      "Like an eagle soaring to new heights!",
      "Balloons are for winners!",
      "Ready for another go?"
    ]
  }
};

const sound = {
  "cold": ["NumberGenieEarcon_ColdWind.wav"],
  "steam": ["NumberGenieEarcons_Steam.wav"],
  "steamOnly": ["NumberGenieEarcon_SteamOnly.wav"],
  "win": ["NumberGenieEarcons_YouWin.wav"]
};
/** @type {AoG.Object<string, SimpleVariants>} */
const soundDict = sound;
for (const i in soundDict) {
  soundDict[i] = soundDict[i].map(a => getSound(a));
}

const general = {
  "noInput": [
    "I didn't hear a number",
    "If you're still there, what's your guess?",
    "We can stop here. Let's play again soon."
  ]
};

const suggestions = {
  "confirm": [
    "Yeah",
    "No"
  ],
  "done": [
    "I'm done"
  ]
};

const variants = {
  "reveal": [
    "Ok, I was thinking of %s.",
    "Sure, I'll tell you the number anyway. It was %s."
  ],
  "revealBye": [
    "See you later.",
    "Talk to you later."
  ],
  "quit": [
    "Alright, talk to you later then.",
    "OK, till next time.",
    "See you later.",
    "OK, I'm already thinking of a number for next time."
  ],
  "another": [
    "What's your next guess?",
    "Have another guess?",
    "Try another."
  ],
  "low": [
    "It's lower than %s."
  ],
  "high": [
    "It's higher than %s."
  ],
  "lowClose": [
    "It's so close, but not quite!"
  ],
  "highClose": [
    "It's so close, but not quite!"
  ],
  "lower": [
    "You're getting warm. It's lower than %s.",
    "Take another guess that's lower than %s.",
    "It's so close, but it's lower than %s."
  ],
  "higher": [
    "You're getting warm. It's higher than %s.",
    "Warmer. It's also higher than %s.",
    "It's so close, but it's higher than %s."
  ],
  "lowest": [
    "You're piping hot! But it's still lower.",
    "You're hot as lava! Go lower.",
    "Almost there! A bit lower."
  ],
  "highest": [
    "You're piping hot! But it's still higher.",
    "You're hot as lava! Go higher.",
    "Almost there! A bit higher."
  ],
  "correct": [
    "Well done! It is indeed %s.",
    "Congratulations, that's it! I was thinking of %s.",
    "Well done! It is indeed %s.",
    "You got it! It's %s."
  ],
  "again": [
    "Wanna play again?",
    "Want to try again?",
    "Hey, should we do that again?"
  ],
  "greeting": [
    "Let's play!",
    "Welcome!",
    "Hi!"
  ],
  "invocation": [
    "I'm thinking of a number from %s to %s."
  ],
  "invocationGuess": [
    "What's your first guess?"
  ],
  "re": [
    "Great!",
    "Awesome!",
    "Cool!",
    "Okay, let's play again.",
    "Okay, here we go again.",
    "Alright, one more time with feeling."
  ],
  "reinvocation": [
    "I'm thinking of a new number from %s to %s."
  ],
  "reinvocationAnother": [
    "What's your guess?"
  ],
  "wrongLower": [
    "Clever, but no. It's still lower than %s.",
    "Nice try, but it's still lower than %s."
  ],
  "wrongHigher": [
    "Clever, but no. It's still higher than %s.",
    "Nice try, but it's still higher than %s."
  ],
  "reallyColdLow": [
    "You're ice cold. It's way lower than %s.",
    "You're freezing cold. It's a lot lower than %s."
  ],
  "reallyColdHigh": [
    "You're ice cold. It’s way higher than %s.",
    "You're freezing cold. It's a lot higher than %s."
  ],
  "reallyHotLow": [
    "Almost there.",
    "Very close."
  ],
  "reallyHotLow2": [
    "Keep going.",
    "It's so close, you're almost there."
  ],
  "reallyHotHigh": [
    "Almost there.",
    "It's so close."
  ],
  "reallyHotHigh2": [
    "Keep going.",
    {
      "speech": "Very close, you're almost there.",
      "displayText": "Very close.",
      "cardText": "You're almost there."
    }
  ],
  "sameGuess": [
    "It's still not %s. Guess %s."
  ],
  "sameGuess2": [
    "Maybe it'll be %s the next time. Let’s play again soon."
  ],
  "sameGuess3": [
    "It's still not %s. Guess again."
  ],
  "min": [
    "I see what you did there."
  ],
  "max": [
    "Oh, good strategy. Start at the top."
  ],
  "minFollow": [
    "But no, it's higher than %s."
  ],
  "maxFollow": [
    "But no, it’s lower than %s."
  ],
  "manyTries": [
    {
      "speech": "Yes! It's %s. Nice job!",
      "displayText": "Yes! It's %s.",
      "cardText": "Nice job!"
    }
  ],
  "manyTriesAgain": [
    "How about one more round?"
  ],
  "fallback": [
    "Are you done playing Number Genie?"
  ],
  "fallback2": [
    "Since I'm still having trouble, I'll stop here. Let’s play again soon."
  ],
  "deeplink": [
    "%s has %s letters. The number I'm thinking of is higher. Have another guess?",
    "%s is a great guess. It has %s letters, but I'm thinking of a higher number. What's your next guess?"
  ],
  "deeplink2": [
    "%s has %s letters. The number I'm thinking of is lower. Have another guess?",
    "%s is a great first guess. It has %s letters, but the number I'm thinking of is lower. Guess again!"
  ],
  "deeplink3": [
    "Wow! You're a true Number Genie! %s has %s letters and the number I was thinking of was %s! Well done!",
    "Amazing! You're a real Number Genie! %s has %s letters and the number I was thinking of was %s. Great job!"
  ],
  "repeat": [
    "Sure. %s.",
    "OK. %s."
  ]
};

/* eslint-disable quotes */
/** @param {AppData} data */
const onlyNumberSuggestions = data => {
  const none = !data.hint || data.hint === 'none';
  const min = none || data.hint === 'lower' ? numbers.min : data.previousGuess + 1;
  const max = none || data.hint === 'higher' ? numbers.max : data.previousGuess - 1;
  // Get a list of all possible numbers
  const all = Array.from(Array(max - min + 1).keys()).map(i => i + min);
  // Use the Durstenfeld shuffle to randomly shuffle the list
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = all[i];
    all[i] = all[j];
    all[j] = temp;
  }
  // Return the first N numbers as strings
  return all.slice(0, numbers.suggestions).map(i => i.toString());
};
/* eslint-enable quotes */

/** @param {AppData} data */
const numberSuggestions = data => onlyNumberSuggestions(data).concat(suggestions.done);

const prompts = {
  "welcome": {
    "visual": {
      "elements": [
        [variants.greeting, variants.invocation],
        variants.invocationGuess,
        images.intro
      ],
      "suggestions": onlyNumberSuggestions
    }
  },
  "sameGuess3": {
    "visual": {
      "elements": [
        variants.sameGuess3
      ],
      "suggestions": numberSuggestions
    }
  },
  "sameGuess": {
    "visual": {
      "elements": [
        variants.sameGuess
      ],
      "suggestions": numberSuggestions
    }
  },
  "sameGuess2": {
    "visual": {
      "elements": [
        variants.sameGuess2
      ]
    }
  },
  "wrongHigher": {
    "visual": {
      "elements": [
        variants.wrongHigher,
        images.cool
      ],
      "suggestions": numberSuggestions
    }
  },
  "wrongLower": {
    "visual": {
      "elements": [
        variants.wrongLower,
        images.cool
      ],
      "suggestions": numberSuggestions
    }
  },
  "min": {
    "visual": {
      "elements": [
        variants.min,
        variants.minFollow
      ],
      "suggestions": numberSuggestions
    }
  },
  "max": {
    "visual": {
      "elements": [
        variants.max,
        variants.maxFollow
      ],
      "suggestions": numberSuggestions
    }
  },
  "reallyColdHigh": {
    "visual": {
      "elements": [
        variants.reallyColdHigh,
        images.cold
      ],
      "suggestions": numberSuggestions
    }
  },
  "reallyColdLow": {
    "visual": {
      "elements": [
        variants.reallyColdLow,
        images.cold
      ],
      "suggestions": numberSuggestions
    }
  },
  "highClose": {
    "visual": {
      "elements": [
        variants.highClose,
        images.hot
      ],
      "suggestions": numberSuggestions
    }
  },
  "lowClose": {
    "visual": {
      "elements": [
        variants.lowClose,
        images.hot
      ],
      "suggestions": numberSuggestions
    }
  },
  "highestSteam": {
    "visual": {
      "elements": [
        [sound.steamOnly, variants.highest],
        images.hot
      ],
      "suggestions": numberSuggestions
    }
  },
  "highest": {
    "visual": {
      "elements": [
        variants.highest,
        images.hot
      ],
      "suggestions": numberSuggestions
    }
  },
  "lowestSteam": {
    "visual": {
      "elements": [
        [sound.steamOnly, variants.lowest],
        images.hot
      ],
      "suggestions": numberSuggestions
    }
  },
  "lowest": {
    "visual": {
      "elements": [
        variants.lowest,
        images.hot
      ],
      "suggestions": numberSuggestions
    }
  },
  "higher": {
    "visual": {
      "elements": [
        variants.higher,
        images.warm,
        variants.another
      ],
      "suggestions": numberSuggestions
    }
  },
  "lower": {
    "visual": {
      "elements": [
        variants.lower,
        images.warm,
        variants.another
      ],
      "suggestions": numberSuggestions
    }
  },
  "reallyHotHigh2Steam": {
    "visual": {
      "elements": [
        [sound.steam, variants.reallyHotHigh2],
        images.hot
      ],
      "suggestions": numberSuggestions
    }
  },
  "reallyHotHigh": {
    "visual": {
      "elements": [
        variants.reallyHotHigh,
        images.hot
      ],
      "suggestions": numberSuggestions
    }
  },
  "reallyHotHigh2": {
    "visual": {
      "elements": [
        variants.reallyHotHigh2,
        images.hot
      ],
      "suggestions": numberSuggestions
    }
  },
  "high": {
    "visual": {
      "elements": [
        variants.high,
        variants.another
      ],
      "suggestions": numberSuggestions
    }
  },
  "reallyHotLow2Steam": {
    "visual": {
      "elements": [
        [sound.steam, variants.reallyHotLow2],
        images.hot
      ],
      "suggestions": numberSuggestions
    }
  },
  "reallyHotLow": {
    "visual": {
      "elements": [
        variants.reallyHotLow,
        images.hot
      ],
      "suggestions": numberSuggestions
    }
  },
  "reallyHotLow2": {
    "visual": {
      "elements": [
        variants.reallyHotLow2,
        images.hot
      ],
      "suggestions": numberSuggestions
    }
  },
  "low": {
    "visual": {
      "elements": [
        variants.low,
        variants.another
      ],
      "suggestions": numberSuggestions
    }
  },
  "winManyTries": {
    "visual": {
      "elements": [
        [sound.win, variants.manyTries],
        images.win,
      [variants.manyTriesAgain]
      ],
      "suggestions": suggestions.confirm
    }
  },
  "win": {
    "visual": {
      "elements": [
        [sound.win, variants.correct],
        images.win,
        variants.again
      ],
      "suggestions": suggestions.confirm
    }
  },
  "reveal": {
    "visual": {
      "elements": [
        variants.reveal,
        variants.revealBye
      ]
    }
  },
  "re": {
    "visual": {
      "elements": [
        [variants.re, variants.reinvocation],
        variants.reinvocationAnother
      ],
      "suggestions": numberSuggestions
    }
  },
  "quit": {
    "visual": {
      "elements": [
        variants.quit
      ]
    }
  },
  "fallback": {
    "visual": {
      "elements": [
        variants.fallback
      ],
      "suggestions": suggestions.confirm
    }
  },
  "fallback2": {
    "visual": {
      "elements": [
        variants.fallback2
      ]
    }
  },
  "deeplink": {
    "visual": {
      "elements": [
        variants.greeting,
        variants.deeplink
      ],
      "suggestions": numberSuggestions
    }
  },
  "deeplink2": {
    "visual": {
      "elements": [
        variants.greeting,
        variants.deeplink2
      ],
      "suggestions": numberSuggestions
    }
  },
  "deeplink3": {
    "visual": {
      "elements": [
        [sound.win, variants.deeplink3],
        variants.again
      ],
      "suggestions": suggestions.confirm
    }
  },
  "reAnother": {
    "visual": {
      "elements": [
        variants.re,
        variants.another
      ],
      "suggestions": numberSuggestions
    }
  },
  "another": {
    "visual": {
      "elements": [
        variants.another
      ],
      "suggestions": numberSuggestions
    }
  }
};

module.exports = {
  getRandomNumber,
  getImage,
  numbers,
  general,
  prompts
};
