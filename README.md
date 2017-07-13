# Screener-Runner [![Build Status](https://circleci.com/gh/screener-io/screener-runner/tree/master.svg?style=shield)](https://circleci.com/gh/screener-io/screener-runner)

Test Runner for [Screener.io](https://screener.io) Visual Testing service.

### Installation

```
$ npm install --save-dev screener-runner
```

Then add a script to your `package.json`:
```javascript
"scripts": {
  "test-screener": "screener-runner --conf screener.config.js"
}
```

Then add a configuration file to your project root. Here is an example:

**screener.config.js**
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

### Run

Run the following command:

```
$ npm run test-screener
```

### Testing Interactions

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

- `click(selector)`: this will click on the first element matching the provided css selector.
- `snapshot(name)`: this will capture a Screener snapshot.
- `hover(selector)`: this will move the mouse over the first element matching the provided css selector.
- `setValue(selector, value)`: this will set the value of the input field matching the provided css selector.
- `executeScript(code)`: this executes custom JS code against the client browser the test is running in.
- `ignore(selector)`: this ignores all elements matching the provided css selector(s).
- `wait(ms)`: this will pause execution for the specified number of ms.
- `wait(selector)`: this will wait until the element matching the provided css selector is present.
- `end()`: this will return the steps to be run.

**Note:** When adding `Steps` using the fluent API, you **must** end the method chain with `end()`.


### Testing Responsive Designs

To test against multiple resolutions or devices, you can add `resolutions` to your screener configuration file, with an array of resolutions.

Each resolution item in the array is either:

- A string in the format: `<width>x<height>`. Example: `1024x768`
- Or an object with Device details: `deviceName` and optional `deviceOrientation`

`deviceName` value can be one of: iPhone 4, iPhone 5, iPhone 6, iPhone 6 Plus, iPad, iPad Pro, Galaxy S5, Nexus 4, Nexus 5, Nexus 5X, Nexus 6P, Nexus 7, Nexus 10


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


### Additional Configuration Options

**Note:** Screener will automatically set `build`, `branch`, and `commit` options if you are using one of the following CI tools: Jenkins, CircleCI, Travis CI, Codeship, GitLab CI, Drone, Bitbucket Pipelines, Semaphore, Buildkite.

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
- **baseBranch:** Optional branch name of your project's base branch (e.g. master). Set this option when developing using feature branches to:
    - automatically compare and accept changes when merging a feature branch into the base branch, or when rebasing a feature branch.
    - automatically pull the initial baseline of UI states for a feature branch from this base branch.
- **initialBaselineBranch:** Optional branch name you would like to pull the initial baseline of UI states from (e.g. master).
- **includeRules:** Optional array of strings or RegExp expressions to filter states by. Rules are matched against state name. All matching states will be kept.
    - Example:
    ```javascript
    includeRules: [
      'State name',
      /^Component/
    ]
    ```
- **excludeRules:** Optional array of strings or RegExp expressions to filter states by. Rules are matched against state name. All matching states will be removed.
    - Example:
    ```javascript
    excludeRules: [
      'State name',
      /^Component/
    ]
    ```
- **tunnel.host:** The internal host to tunnel. If this is set, an encrypted tunnel will be automatically started by screener-runner to the specified host.
    - Example:
    ```javascript
    tunnel: {
      host: 'localhost:3000'
    }
    ```
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
      minLayoutPosition: 10 // Threshold for Layout changes. Defaults to 10 pixels.
    }
    ```
- **failureExitCode:** The exit code to use on failure. Defaults to 1, which will fail a CI build.
    - To NOT fail a CI build on Screener failure, set to 0. Example:
    ```javascript
    failureExitCode: 0
    ```
- **browsers:** Optional array of browsers for Cross Browser Testing. Each item in array is an object with `browserName` and `version` properties.
    - Note: `browsers` is dependent on `sauce` being added to configuration.
    - `browserName` and `version` *must* match one of the supported browsers/versions in the browser table below.
	- Example:
	```javascript
    browsers: [
      {
        browserName: 'safari',
        version: '10.0'
      }
    ]
    ```
- **sauce:** Optional Sauce Labs credentials for Cross Browser Testing.
    - Example:
    ```javascript
    sauce: {
      username: 'sauce_user',
      accessKey: 'sauce_access_key'
    }
    ```

### Sauce Labs Integration for Cross Browser Testing

**Important Notes about Cross Browser Testing:**

- Cross Browser Testing with Sauce Labs will be slower than regular Screener visual regression tests, and so it is not recommended to run on every commit.
- You may want to limit cross browser testing to certain scenarios, such as only when merging into master (see example below).
- Requirements: A valid Sauce Labs account, and access to enough concurrency in your Sauce account to run Screener tests. Each browser/resolution combination will use one concurrent machine.
- Screener's auto-parallelization is disabled when Cross Browser Testing to reduce the number of concurrent browsers required in your Sauce account.

**Overview**

For cross browser testing, Screener integrates with [Sauce Labs](https://saucelabs.com/) to provide access to additional browsers. By default, Screener runs tests against the Chrome browser, which does **not** require a Sauce account. Screener provides Chrome browsers and device emulation out-of-the-box.

To test against multiple browsers, add the `browsers` and `sauce` properties to your screener configuration file. Browsers added *must* match one of the supported browsers/versions in the browser table below.

Here is a CircleCI example that only runs cross browser tests when committing into `master` branch:

```javascript
var config = {
  // regular screener config
};

// only run cross browser tests when merging into ‘master’ branch
if (process.env.CIRCLE_BRANCH === 'master') {
  config.browsers = [
    {
      browserName: 'chrome'
    },
    {
      browserName: 'internet explorer',
      version: '11.103'
    }
  ];
  config.sauce = {
    username: 'sauce_user',
    accessKey: 'sauce_access_key'
  };
}

module.exports = config;
```

**Supported Browsers**

| browserName  | version |
| ------------- | ------------- |
| chrome | *-do not set-* |
| firefox | 54.0 |
| firefox | 53.0 |
| firefox | 52.0 |
| firefox | 51.0 |
| internet explorer | 11.103 |
| microsoftedge | 14.14393 |
| safari | 10.0 |
