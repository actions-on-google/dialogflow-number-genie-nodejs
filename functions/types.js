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

/**
 * The Number Genie conv.data properties within a conversation context
 * @typedef {Object} ConvData
 * @prop {Hint} hint Current Hint direction (higher, lower, none)
 *     that would be given to the user
 * @prop {Array<PromptElement>} lastPrompts RichElements and strings sent
 *     last time app responded
 * @prop {CompiledSurfacePrompts} lastResponse The last compiled response
 *     given to the user
 * @prop {number} answer The actual number answer
 * @prop {number} guessCount Number of guesses made by the user so far
 * @prop {number} fallbackCount How many not understandable answers
 *     the user has given
 * @prop {number} steamSoundCount Times the steam sound was used
 *     before so it's not repeated
 * @prop {number} previousGuess The number guess the user gave previously
 * @prop {number} duplicateCount Times the user has given the same number guess
 */

/**
 * Possible Hint directions
 * @typedef {'higher' | 'lower' | 'none'} Hint
 */

/**
 * A variant that was randomly selected from Variants
 * @typedef {RichElement | string} PromptElement
 */

/**
 * The compiled response saved for future repeating
 * @typedef {Object} CompiledSurfacePrompts
 * @prop {CompiledPrompt} visual Visual surface compiled responses
 * @prop {CompiledPrompt=} audio Audio surface compiled responses
 */

/**
 * The compiled surface response data
 * @typedef {Object} CompiledPrompt
 * @prop {Array<(Array<RichElementSpeech> | StrictImageElement)>} elements
 *   The array of compiler simplified elements for easier processing
 * @prop {Array<string>=} suggestions The compiled static list of suggestions
 */

/**
 * Developer provided complex element
 * that is like a client library SimpleResponse
 * @typedef {RichElementSpeech | RichElementCardText} RichElement
 */

/**
 * Speech required only RichElement
 * @typedef {Object} RichElementSpeech
 * @prop {string} speech Speech to be spoken to user. SSML allowed.
 * @prop {string=} displayText Optional text to be shown to user
 * @prop {string=} cardText Optional body text to show on the next image card.
 */

/**
 * CardText required only RichElement
 * Meant as a variant to just provide the next image card text
 * @typedef {Object} RichElementCardText
 * @prop {string=} speech Optional Speech to be spoken to user. SSML allowed.
 * @prop {string=} displayText Optional text to be shown to user
 * @prop {string} cardText Body text to show on the next image card.
 */

/**
 * Developer provided Image Card Data
 * Ignored on non-visual surfaces
 * @typedef {Object} ImageElement
 * @prop {string} url Url of the image
 * @prop {string} altText Hover alt text of the image
 * @prop {(string | SimpleVariants)=} cardText The text that goes on the
 *   bottom of the image card
 *   Can possibly be Variants for the compiler to choose a string from
 */

/**
 * Developer provided string only Variants
 * @typedef {Array<string>} SimpleVariants
 */

/**
 * A stricter Image object to allow the compiler function handle easier
 * Generated from an ImageElement by the compiler function
 * @typedef {Object} StrictImageElement
 * @prop {string} url Url of the image
 * @prop {string} altText Hover alt text of the image
 * @prop {string} cardText The text that goes on the bottom of the image card
 */

/**
 * Developer provided response that
 * contains both visual and audio surface responses
 * @typedef {Object} SurfacePrompts
 * @prop {Prompt} visual Visual surface Prompt
 * @prop {Prompt=} audio Optional Audio surface Prompt:
 *     uses Visual prompts if not provided
 */

/**
 * Developer provided response data for a surface
 * @typedef {Object} Prompt
 * @prop {Elements} elements The array of developer provided elements
 *     for the compiler to process
 * @prop {(Array<string> | function(ConvData): Array<string>)=} suggestions
 *     Array of strings or a function accepting conv.data that returns
 *     an array of strings that are the suggestions for the response
 */

/**
 * The array of developer provided elements for the compiler to process
 * Each Element represents a RichResponse component
 * like a SimpleResponse or a Card
 * @typedef {Array<(TextElement | ImageElement)>} Elements
 */

/**
 * An Element that represents a RichResponse SimpleResponse component
 * Different types that it can be:
 * PromptElement: A single extended data structure SimpleResponse
 *     or a string that is converted
 * ElementVariants: An array of PromptElements that has one variant
 *     randomly selected and saved by the compiler for future repeat usage
 * Array<ElementVariants>: An array of ElementVariants that is processed
 *     by the compiler to first randomly select a variant
 *     then concatenated together to form one single SimpleResponse
 * @typedef {PromptElement|ElementVariants|Array<ElementVariants>} TextElement
 */

/**
 * An array of PromptElements that has one variant randomly selected and saved
 *   by the compiler for future repeat usage
 * @typedef {Array<PromptElement>} ElementVariants
 */
