# Actions on Google: Number Genie Sample

*:warning: Warning: Conversational Actions will be deprecated on June 13, 2023. For more information,
see [Conversational Actions Sunset](https://goo.gle/ca-sunset).*

This sample demonstrates Actions on Google features for use on Google Assistant,
including how to steer conversation in a numeric guessing game through the use
of localization (French and English), deep links, fallbacks, contexts, alongside rich responses -- using the [Node.js client library](https://github.com/actions-on-google/actions-on-google-nodejs)
and deployed on [Cloud Functions for Firebase](https://firebase.google.com/docs/functions/).

This Action uses the [i18n-node](https://github.com/mashpie/i18n-node) library to provide
responses in both French and English, which are listed in the `locales` directory.
In each function execution, the `strings.js` `setLocale()` function is called to
set the i18n-node locale based on the user locale in the incoming request. Prompts are then
selected by i18n-node from the available languages, defaulting to `en` if the
user's language is unavailable.

:warning: This code sample was built using Dialogflow. We now recommend using [Actions Builder or the Actions SDK](https://developers.google.com/assistant/conversational/overview) to develop, test, and deploy Conversational Actions.

## Setup Instructions
### Prerequisites
1. Node.js and NPM
    + We recommend installing using [NVM](https://github.com/creationix/nvm)
1. Install the [Firebase CLI](https://developers.google.com/assistant/actions/dialogflow/deploy-fulfillment)
    + We recommend using version 6.5.0, `npm install -g firebase-tools@6.5.0`
    + Run `firebase login` with your Google account

### Configuration
#### Actions Console
1. From the [Actions on Google Console](https://console.actions.google.com/), New project (this will become your *Project ID*) > **Create project** > under **More options** > **Conversational**
1. From the top menu under **Develop** > **Actions** (left nav) > **Add your first action** > **BUILD** (this will bring you to the Dialogflow console) > Select language and time zone > **CREATE**.
1. In the Dialogflow console, go to **Settings** ⚙ > **Export and Import** > **Restore from zip** using the `agent.zip` in this sample's directory.

#### Firebase Deployment
1. On your local machine, in the `functions` directory, run `npm install`
1. Run `firebase deploy --project {PROJECT_ID}` to deploy the function
    + To find your **Project ID**: In [Dialogflow console](https://console.dialogflow.com/) under **Settings** ⚙ > **General** tab > **Project ID**.

#### Dialogflow Console
1. Return to the [Dialogflow Console](https://console.dialogflow.com) > select **Fulfillment** > **Enable** Webhook > Set **URL** to the **Function URL** that was returned after the deploy command > **SAVE**.
    ```
    Function URL (dialogflowFirebaseFulfillment): https://${REGION}-${PROJECT_ID}.cloudfunctions.net/dialogflowFirebaseFulfillment
    ```
1. From the left navigation menu, click **Integrations** > **Integration Settings** under Google Assistant > Enable **Auto-preview changes** >  **Test** to open the Actions on Google simulator then say or type `Talk to my test app`.

### Running this Sample
+ You can test your Action on any Google Assistant-enabled device on which the Assistant is signed into the same account used to create this project. Just say or type, “OK Google, talk to my test app”.
+ You can also use the Actions on Google Console simulator to test most features and preview on-device behavior.

## References & Issues
+ Questions? Go to [StackOverflow](https://stackoverflow.com/questions/tagged/actions-on-google), [Assistant Developer Community on Reddit](https://www.reddit.com/r/GoogleAssistantDev/) or [Support](https://developers.google.com/assistant/support).
+ For bugs, please report an issue on Github.
+ Actions on Google [Documentation](https://developers.google.com/assistant)
+ Actions on Google [Codelabs](https://codelabs.developers.google.com/?cat=Assistant)
+ [Webhook Boilerplate Template](https://github.com/actions-on-google/dialogflow-webhook-boilerplate-nodejs) for Actions on Google

## Make Contributions
Please read and follow the steps in the [CONTRIBUTING.md](CONTRIBUTING.md).

## License
See [LICENSE](LICENSE).

## Terms
Your use of this sample is subject to, and by using or downloading the sample files you agree to comply with, the [Google APIs Terms of Service](https://developers.google.com/terms/).
