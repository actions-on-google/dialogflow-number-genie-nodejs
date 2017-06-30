# Actions on Google: Number Genie Sample using Node.js and Cloud Functions for Firebase

This guess a number game, called Number Genie, is an action for the Google Assistant.

## Setup Instructions

See the developer guide and release notes at [https://developers.google.com/actions/](https://developers.google.com/actions/) for more details.

### Steps
1. Use the [Actions on Google Console](https://console.actions.google.com) to add a new project with a name of your choosing.
1. Click *Use API.AI* and then *Create Actions on API.AI* to open the API.AI console.
1. Click *Save* to save the project.
1. Click on the gear icon to see the project settings.
1. Select *Export and Import*.
1. Select *Restore from zip*. Follow the directions to restore from the `NumberGenie.zip` file in this repo.
1. Deploy the fulfillment webhook provided in the `functions` folder using [Google Cloud Functions for Firebase](https://firebase.google.com/docs/functions/) and the static resources needed by the project using [Firebase Hosting](https://firebase.google.com/docs/hosting/):
    1. Open the file `functions/index.js` and find the declaration of the `HOSTING_URL` constant at the top. Replace the '<YOUR_HOSTING_URL>' placeholder with the Project ID of the Firebase project, that you can find in the general settings page in the Firebase Console. The final value of `HOSTING_URL` should look like `https://numbergenie-12345.firebaseapp.com`.  
    1. Follow the instructions to [install the Firebase CLI](https://firebase.google.com/docs/hosting/quickstart#install-the-firebase-cli).
    1. Run `firebase init`, and select to configure `Hosting` and `Functions`. Select the project you've previously created in the Actions on Google Console as default project. In the configuration wizard, accept all the default choices.
    1. Run `firebase deploy` and take note of the endpoint where the fulfillment webhook has been published. It should look like `Function URL (numberGenie): https://us-central1-YOUR_PROJECT.cloudfunctions.net/numberGenie`. The command will also deploy the static assets at `https://us-central1-YOUR_PROJECT.cloudfunctions.net/`.
1. Go back to the API.AI console and select *Fulfillment* from the left navigation menu. Enable *Webhook*, set the value of *URL* to the `Function URL` from the previous step, then click *Save*.
1. Select *Integrations* from the left navigation menu and open the *Settings* menu for Actions on Google.
1. Click *Test*.
1. Click *View* to open the Actions on Google simulator.
1. Type "Talk to my test app" in the simulator, or say "OK Google, talk to my test app" to any Actions on Google enabled device signed into your developer account.

For more detailed information on deployment, see the [documentation](https://developers.google.com/actions/samples/).

## References and How to report bugs
* Actions on Google documentation: [https://developers.google.com/actions/](https://developers.google.com/actions/).
* If you find any issues, please open a bug here on GitHub.
* Questions are answered on [StackOverflow](https://stackoverflow.com/questions/tagged/actions-on-google).

## How to make contributions?
Please read and follow the steps in the [CONTRIBUTING.md](CONTRIBUTING.md).

## License
See [LICENSE](LICENSE).

## Terms
Your use of this sample is subject to, and by using or downloading the sample files you agree to comply with, the [Google APIs Terms of Service](https://developers.google.com/terms/).

## Google+
Actions on Google Developers Community on Google+ [https://g.co/actionsdev](https://g.co/actionsdev).
