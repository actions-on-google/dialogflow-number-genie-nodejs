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

'use strict';

const {
  SimpleResponse,
  BasicCard,
  Image,
  Suggestions,
} = require('actions-on-google');
const {sprintf} = require('sprintf-js');
const strings = require('./strings');

/**
 * A class to help compile, process, and send developer provided responses
 */
class Utils {
  /**
   * Create a new utils instance to help send responses
   * @param {DialogflowConversation} conv
   */
  constructor(conv) {
    this.conv = conv;
    this.screen =
      this.conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');
  }

  /**
   * Compile the developer provided response data of SurfacePrompt type
   * by passing through each prompt for each surface through compilePrompt
   * @param {SurfacePrompts} prompts The developer defined response data
   * @param {Array<(string | number)>} args Response string formatting arguments
   * @return {CompiledSurfacePrompts}
   */
  compile(prompts, args) {
    /** @type {Map<ElementVariants, RichElementSpeech>} */
    const collapsed = new Map();
    /** @type {Set<PromptElement>} */
    const responses = new Set();
    if (!this.conv.data.lastPrompts) {
      this.conv.data.lastPrompts = [];
    }
    /** @type {CompiledSurfacePrompts} */
    const compiled = {
      visual: this.compilePrompt(prompts.visual, collapsed, responses, args),
    };
    if (prompts.audio) {
      compiled.audio =
        this.compilePrompt(prompts.audio, collapsed, responses, args);
    }
    this.conv.data.lastPrompts = Array.from(responses);
    return compiled;
  }

  /**
   * Compile a developer provided response data Prompt to simplify it and
   * select random responses and store it for later repeating
   * @template T
   * @param {Prompt} prompt Developer provided response data for a surface
   * @param {Map<ElementVariants, RichElementSpeech>} collapsed
   *     Previously selected random responses during the current compile session
   *     to allow for the same chosen response for all surfaces
   * @param {Set<PromptElement>} responses The set of compiled responses to be
   *     later saved in conv.data to ensure that the next time the response
   *     won't be selected again
   * @param {Array<(string | number)>} args Response string formatting arguments
   * @return {CompiledPrompt}
   */
  compilePrompt(prompt, collapsed, responses, args) {
    /** @type {CompiledPrompt} */
    const out = {
      elements: [],
    };
    const lastPrompts =
      new Set(this.conv.data.lastPrompts.map((p) => JSON.stringify(p)));
    for (const line of prompt.elements) {
      if (!Array.isArray(line)) {
        /** @type {*} */
        const lineProxy = line;
        /** @type {ImageElement} */
        const image = lineProxy;
        if (image.url) {
          const cardText = image.cardText;
          if (Array.isArray(cardText)) {
            /** @type {Array<RichElementSpeech>} */
            const lineOut = [];
            const savedPart = collapsed.get(cardText);
            if (savedPart) {
              lineOut.push(savedPart);
            } else {
              const available = cardText.filter(
                (prompt) => !lastPrompts.has(JSON.stringify(prompt))
              );
              const end = available.length - 1;
              const compiled = available[strings.getRandomNumber(0, end)]
                || 'No prompts left';
              /** @type {RichElementSpeech} */
              const printed = {
                speech: '',
                cardText: sprintf(compiled, ...args),
              };
              responses.add(printed);
              collapsed.set(cardText, printed);
              lineOut.push(printed);
            }
            out.elements.push(lineOut);
          }
          out.elements.push(Object.assign({}, image, {
            cardText: !cardText || Array.isArray(cardText) ?
              '' : sprintf(cardText, ...args),
          }));
          continue;
        }
        /** @type {PromptElement} */
        const response = lineProxy;
        out.elements.push(this.simplifyPromptElements([response]));
        continue;
      }
      /** @type {*} */
      const partsProxy = Array.isArray(line[0]) ? line : [line];
      /** @type {Array<Array<PromptElement>>} */
      const acceptedParts = partsProxy;
      const parts = acceptedParts.map((p) => this.simplifyPromptElements(p));
      /** @type {Array<RichElementSpeech>} */
      const lineOut = [];
      for (const part of parts) {
        const savedPart = collapsed.get(part);
        if (savedPart) {
          lineOut.push(savedPart);
          continue;
        }
        const available = part.filter(
          (prompt) => !lastPrompts.has(JSON.stringify(prompt))
        );
        const end = available.length - 1;
        const compiled = available[strings.getRandomNumber(0, end)]
          || 'No prompts left';
        /** @type {RichElementSpeech} */
        const printed = {
          speech: sprintf(compiled.speech, ...args),
        };
        if (typeof compiled.displayText === 'string') {
          printed.displayText = sprintf(compiled.displayText, ...args);
        }
        if (compiled.cardText) {
          printed.cardText = sprintf(compiled.cardText, ...args);
        }
        responses.add(printed);
        collapsed.set(part, printed);
        lineOut.push(printed);
      }
      out.elements.push(lineOut);
    }
    if (prompt.suggestions) {
      out.suggestions = Array.isArray(prompt.suggestions) ?
        prompt.suggestions : prompt.suggestions(this.conv.data);
    }
    return out;
  }

  /**
   * Simplify PromptElement into RichElementSpeech
   * to easier processing by the compiler
   * @param {Array<PromptElement>} elements List of PromptElement
   *     to simplify into RichElementSpeech
   * @return {Array<RichElementSpeech>}
   */
  simplifyPromptElements(elements) {
    return elements.map((response) => {
      if (typeof response !== 'string') {
        return {
          speech: response.speech || '',
          displayText: response.displayText,
          cardText: response.cardText,
        };
      }
      /** @type {RichElementSpeech} */
      const printed = {
        speech: response,
        displayText: response.match(/^<audio src=".+?"\/>$/) ? '' : response,
      };
      return printed;
    });
  }

  /**
   * Send a compiled response generated earlier
   * @param {CompiledSurfacePrompts} compiled Compiled prompts for each surface
   * @param {boolean=} close Whether or not to close the response instead of ask
   * @return {void}
   */
  sendCompiled(compiled, close) {
    const response = [];
    const raw = this.screen ?
      compiled.visual : (compiled.audio || compiled.visual);
    let cardText = '';
    for (const part of raw.elements) {
      if (Array.isArray(part)) {
        const speech = part.map((p) => p.speech).join(' ');
        if (speech.trim()) {
          const printed = {
            speech: `<speak>${speech}</speak>`,
          };
          const first = part[0];
          if (typeof first.displayText === 'string') {
            printed.displayText = part.map((p) => p.displayText).join(' ');
          }
          if (printed.speech) {
            response.push(new SimpleResponse({
              speech: printed.speech,
              text: printed.displayText,
            }));
          }
        }
        const last = part[part.length - 1];
        if (last.cardText) {
          cardText = last.cardText;
        }
        continue;
      }
      const text = cardText || part.cardText;
      cardText = '';
      response.push(new BasicCard({
        text,
        image: new Image({
          url: strings.getImage(part.url),
          alt: part.altText,
        }),
      }));
    }
    if (raw.suggestions) {
      response.push(new Suggestions(
        Array.isArray(raw.suggestions) ? raw.suggestions : raw.suggestions())
      );
    }
    if (close) {
      return this.conv.close(...response);
    }
    this.conv.ask(...response);
  }

  /**
   * Send a developer provided response data
   * @param {SurfacePrompts} prompt Dev provided response data for each surface
   * @param {Array<(string | number)>} args Response string formatting arguments
   * @param {boolean=} close Whether or not to close the response instead of ask
   */
  send(prompt, args, close) {
    const compiled = this.compile(prompt, args);
    this.conv.data.lastResponse = compiled;
    this.sendCompiled(compiled, close);
  }

  /**
   * Send a developer provided response data using ask
   * @param {SurfacePrompts} prompt
   * @param {Array<(string | number)>} args
   */
  ask(prompt, ...args) {
    this.send(prompt, args);
  }

  /**
   * Send a developer provided response data using close
   * @param {SurfacePrompts} prompt
   * @param {Array<(string | number)>} args
   */
  close(prompt, ...args) {
    this.send(prompt, args, true);
  }
}

module.exports = {
  Utils,
};
