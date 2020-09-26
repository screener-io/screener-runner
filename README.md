# Screener-Runner [![Build Status](https://circleci.com/gh/screener-io/screener-runner/tree/master.svg?style=shield)](https://circleci.com/gh/screener-io/screener-runner)

Test Runner for [Screener.io](https://screener.io) Visual Testing service.

## Installation

```bash
npm install --save-dev screener-runner
```

Then add a script to your `package.json`:

```javascript
"scripts": {
  "test-screener": "screener-runner --conf screener.config.js"
}
```

Then add a configuration file to your project root. Here is an example:

### screener.config.js

```javascript
module.exports = {
  // full repository name for your project:
  projectRepo: 'user/my-project-repo',

  // this example assumes Environment Variables listed below exist on your system:
  apiKey: process.env.SCREENER_API_KEY,

  // array of UI states to capture visual snapshots of.
  // each state consists of a url and a name.
  states: [
    {
      url: 'http://some-url.com',
      name: 'Name of UI State'
    },
    {
      ...
    }
  ]
};
```

## Run

Run the following command:

```bash
npm run test-screener
```

## Testing Interactions

To test interactions, you can add `Steps` to each state to interact with the UI. This is useful for clicking buttons, filling out forms, and getting the UI into the proper visual state to test.

Here is an example:

```javascript
var Steps = require('screener-runner/src/steps');

module.exports = {
  ...

  states: [
    {
      url: 'http://some-url.com',
      name: 'Name of UI State',
      steps: new Steps()
        .click('.btn-demo')
        .snapshot('Open Dialog')
        .end()
    }
  ]
};
```

Screener-Runner provides a fluent API for adding steps. Methods with selectors have built-in waits to simplify test flow creation.

The following methods are currently available:

- `url(url)`: this will load a new url.
- `click(selector)`: this will click on the first element matching the provided css selector.
  - When selector is not found, will automatically retry. Default timeout is 15 seconds.
  - Optional `options` param can contain a `maxTime` option (in ms):

    ```javascript
    .click('.selector', {maxTime: 30000})
    ```

- `snapshot(name, [options])`: this will capture a visual snapshot.
  - Optional `options` param can contain a `cropTo` option:

    ```javascript
    .snapshot('open', {cropTo: '.selector'})
    ```

- `hover(selector)`: this will move the mouse over the first element matching the provided css selector.
- `mouseDown(selector)`: this will press and hold the mouse button over the first element matching the provided css selector.
- `mouseUp(selector)`: this will release the mouse button. `selector` is optional.
- `focus(selector)`: this will set cursor focus on the first element matching the provided css selector.
- `setValue(selector, value, [options])`: this will set the value of the input field matching the provided css selector.
  - Optional `options` param can contain an `isPassword` option:

    ```javascript
    .setValue('.selector', 'text', {isPassword: true})
    ```

- `clearValue(selector)`: this will clear the value of the input field matching the provided css selector.
- `keys(selector, keys)`: this will send the provided keys to the first element matching the provided css selector.
- `executeScript(code)`: this executes custom JS code against the client browser the test is running in. The `code` parameter is a **string**.
- `ignore(selector)`: this ignores all elements matching the provided css selector(s).
- `clearIgnores()`: this resets all ignores added using the ignore(selector) step.
- `wait(ms)`: this will pause execution for the specified number of ms.
- `wait(selector)`: this will wait until the element matching the provided css selector is present. Default timeout is 60 seconds.
  - Optional `options` param can contain a `maxTime` option (in ms):

    ```javascript
    .wait('.selector', {maxTime: 90000})
    ```

- `waitForNotFound(selector)`: this will wait until the element matching the provided css selector is Not present.
- `cssAnimations(isEnabled)`: this will override the global cssAnimations option for the current UI state. Set to `true` to enable CSS Animations, and set to `false` to disable.
- `rtl()`: this will set the current UI state to right-to-left direction.
- `ltr()`: this will set the current UI state to left-to-right direction.
- `end()`: this will return the steps to be run.

**Note:** When adding `Steps` using the fluent API, you **must** end the method chain with `end()`.

## Testing Responsive Designs

To test against multiple resolutions or devices, you can add `resolutions` to your screener configuration file, with an array of resolutions.

Each resolution item in the array is either:

- A string in the format: `<width>x<height>`. Example: `1024x768`
- Or an object with Device details: `deviceName` and optional `deviceOrientation`

Here is an example:

```javascript
module.exports = {
  ...

  resolutions: [
    '1024x768',
    {
      deviceName: 'iPhone 6'
    },
    {
      deviceName: 'iPhone 6 Plus',
      deviceOrientation: 'landscape'
    }
  ]
};
```

### Available Devices

`deviceName` can be one of the following values:

|   |  |  |  |
| ------------- | ------------- | ------------- | ------------- |
| iPad     | iPhone 4      | Galaxy S6 | Nexus 4  |
| iPad Pro | iPhone 5      | Galaxy S7 | Nexus 5  |
|          | iPhone 6      | Galaxy S8 | Nexus 5X |
|          | iPhone 6 Plus |           | Nexus 6P |
|          | iPhone 7      |           | Nexus 7  |
|          | iPhone 7 Plus |           | Nexus 10 |
|          | iPhone 8      |           |
|          | iPhone 8 Plus |           |
|          | iPhone X      |           |

## Cross Browser Testing

### Overview

For Cross Browser Testing, Screener provides cloud browsers and device emulators. The following browsers are available:

- Chrome
- Firefox
- Internet Explorer 11

To test against additional browsers, Screener provides integrations with [Sauce Labs](https://saucelabs.com/) to provide access to Safari and Edge browsers. For more information, view the [Sauce Labs Integration](https://screener.io/v2/docs/sauce) documentation.

Cross Browser Testing is available through Screener's Perform plan. By default, Screener runs tests against the Chrome browser.

### Adding Browsers

To test against multiple browsers, add the `browsers` option to your `screener.config.js` file:

```javascript
// screener.config.js
module.exports = {
  ...

  browsers: [
    {
      browserName: 'chrome'
    },
    {
      browserName: 'firefox'
    },
    {
      browserName: 'internet explorer',
      version: '11'
    }
  ]
};
```

### Supported Browsers

| browserName  | version | |
| ------------- | ------------- | ------------- |
| chrome | *-do not set-* | |
| firefox | *-do not set-* | |
| internet explorer | 11 | |
| microsoftedge | 17.17134 | requires [Sauce Labs](https://screener.io/v2/docs/sauce) Integration |
| safari | 11.1 | requires [Sauce Labs](https://screener.io/v2/docs/sauce) Integration |

### Sauce Connect Integration

When using Sauce Labs browsers, you have the option to use the Sauce Connect tunnel by setting the flag `launchSauceConnect: true`. When enabled, Sauce Connect will be launched and managed by this module, and assigned a unique tunnel identifier.

  ```javascript
  sauce: {
    username: 'sauce_user',
    accessKey: 'sauce_access_key',
    maxConcurrent: 10, // optional available concurrency you have from Sauce Labs
    launchSauceConnect: true // optional,
  }
  ```

#### Important Notes on Sauce Connect

- Using Sauce Connect version `4.6.2`.

- Sauce Connect Integration requires all browsers to be Sauce Labs Browsers. An error is thrown when using non-Sauce browsers.

- Logs for Sauce Connect are saved in the root of your project under `sauce-connect.log` for debugging purposes.

- Sauce Connect tunnel cannot be used together with the `tunnel` option.

- A unique `tunnelIdentifier` is automatically generated for you when using the Sauce Connect Integration. An error is thrown when `tunnelIdentifier` is set manually.

- When running Sauce Connect tunnel on your localhost, please note that Sauce Connect only supports a limited set of [valid ports](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy+FAQS#SauceConnectProxyFAQs-CanIAccessApplicationsonlocalhost?).

- For additional information on Sauce Connect please refer to the [Sauce Connect FAQ](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy+FAQS) and [Sauce Connect Troubleshooting](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy+Troubleshooting) documentation.

## Additional Configuration Options

**Note:** Screener will automatically set `build`, `branch`, and `commit` options if you are using one of the following CI tools: Jenkins, CircleCI, Travis CI, Visual Studio Team Services, Codeship, GitLab CI, Drone, Bitbucket Pipelines, Semaphore, Buildkite.

- **build:** Build number from your CI tool (see note above). Screener will auto-generate a Build number if not provided.
- **branch:** Branch name being built (see note above).
- **commit:** Commit hash of the build (see note above).
- **resolution:** Screen resolution to use. Defaults to `1024x768`
  - Accepts a string in the format: `<width>x<height>`. Example: `1024x768`
  - Or accepts an object for Device Emulation. Example:

    ```javascript
    resolution: {
      deviceName: 'iPhone 6'
    }
    ```

  - deviceOrientation option also available. Can be `portrait` or `landscape`. Defaults to `portrait`.
- **resolutions:** Array of resolutions for Responsive Design Testing. Each item in array is a `resolution`, either string or object format.
  - See "Testing Responsive Designs" above for an example
  - Note: `resolution` and `resolutions` are mutually exclusive. Only one can exist.
- **cssAnimations:** Screener disables CSS Animations by default to help ensure consistent results in your visual tests. If you do not want this, and would like to __enable__ CSS Animations, then set this option to `true`.
- **ignore:** Comma-delimited string of CSS Selectors that represent areas to be ignored. Example: `.qa-ignore-date, .qa-ignore-ad`
- **hide:** Comma-delimited string of CSS Selectors that represent areas to hide before capturing screenshots. Example: `.hide-addon-widget, .hide-ad`
- **baseBranch:** Optional branch name of your project's base branch (e.g. master). Set this option when developing using feature branches to:
  - automatically compare and accept changes when merging a feature branch into the base branch, or when rebasing a feature branch.
  - automatically pull the initial baseline of UI states for a feature branch from this base branch.
- **includeRules:** Optional array of RegExp expressions to filter states by. Rules are matched against state name. All matching states will be kept.
  - Example:

    ```javascript
    includeRules: [
      /^Component/
    ]
    ```

  - Note: `includeRules` can be added as a property to objects in `browsers` or `resolutions` in order to filter states specifically by a browser or resolution.
- **excludeRules:** Optional array of RegExp expressions to filter states by. Rules are matched against state name. All matching states will be removed.
  - Example:

    ```javascript
    excludeRules: [
      /^Component/
    ]
    ```

  - Note: `excludeRules` can be added as a property to objects in `browsers` or `resolutions` in order to filter states specifically by a browser or resolution.
- **tunnel.host:** The internal host to tunnel. If this is set, an encrypted tunnel will be automatically started by screener-runner to the specified host.
  - Example:

    ```javascript
    tunnel: {
      host: 'localhost:3000'
    }
    ```

  - Note: for HTTPS, add the protocol when setting the host: `https://localhost`
  - `gzip` and `cache` options are also available to improve tunnel performance. Example:

    ```javascript
    tunnel: {
      host: 'localhost:3000',
      gzip: true, // gzip compress all content being served from tunnel host
      cache: true // sets cache-control header for all content being served from tunnel host. Must be used with gzip option
    }
    ```

- **diffOptions:** Visual diff options to control validations.
  - Example:

    ```javascript
    diffOptions: {
      structure: true,
      layout: true,
      style: true,
      content: true,
      minLayoutPosition: 4, // Optional threshold for Layout changes. Defaults to 4 pixels.
      minLayoutDimension: 10, // Optional threshold for Layout changes. Defaults to 10 pixels.
      minShiftGraphic: 2, // Optional threshold for pixel shifts in graphics.
      compareSVGDOM: false // Pass if SVG DOM is the same. Defaults to false.
    }
    ```

- **failOnNewStates:** Option to set build to failure when `new` states are found, and to disable using `new` states as a baseline. Defaults to true.
- **alwaysAcceptBaseBranch:** Option to automatically accept `new` and `changed` states in base branch. Assumes base branch should always be correct.
- **disableAutoSnapshots:** Option to disable initial visual snapshots automatically captured for each state. Defaults to false.
- **disableBranchBaseline:** Option to disable independent baseline for each feature branch, and only use base branch as baseline. Must be used with `baseBranch` option. Defaults to false.
- **disableConcurrency:** Option to disable running tests concurrently. This may be useful when test flows run concurrently may cause data conflicts or inconsistencies. Defaults to false.
- **disableDiffOnError:** Option to disable performing diff on snapshots when underlying test session(s) had an error. Defaults to false.
- **newSessionForEachState:** Option to start a new test session for each state. Defaults to false.
- **failureExitCode:** The exit code to use on failure. Defaults to 1, which will fail a CI build.
  - To NOT fail a CI build on Screener failure, set to 0. Example:

    ```javascript
    failureExitCode: 0
    ```

- **browsers:** Optional array of browsers for Cross Browser Testing. Each item in array is an object with `browserName` and `version` properties.
  - `browserName` and `version` *must* match one of the supported browsers/versions in the browser table above.
  - Example:

    ```javascript
      browsers: [
        {
          browserName: 'chrome'
        },
        {
          browserName: 'safari',
          version: '11.1'
        }
      ]
      ```

- **ieNativeEvents:** Option to enable native events in Internet Explorer browser. Defaults to false.
- **sauce:** Optional Sauce Labs credentials for Cross Browser Testing.
  - Example:

    ```javascript
    sauce: {
      username: 'sauce_user',
      accessKey: 'sauce_access_key',
      maxConcurrent: 10, // optional available concurrency you have from Sauce Labs
      extendedDebugging: true, // optional
      tunnelIdentifier: 'MyTunnel01', // optional
      launchSauceConnect: true // optional, view "Sauce Connect" for more information
    }
    ```

- **vsts:** Optional configuration for integrating with Visual Studio Team Services.
  - Example:

    ```javascript
    vsts: {
      instance: 'myproject.visualstudio.com'
    }
    ```
