# Screener-Runner [![Build Status](https://circleci.com/gh/screener-io/screener-runner/tree/master.svg?style=shield)](https://circleci.com/gh/screener-io/screener-runner)

Test Runner for [Screener.io](https://screener.io) Visual Testing service.

### Installation

```
$ npm install --save-dev screener-runner
```

Then add a script to your `package.json`:
```
"scripts": {
  "test-screener": "screener-runner --conf screener.conf.js"
}
```

Then add a configuration file to your project root. Here is an example:

**screener.conf.js**
```
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

```
var Steps = require('screener-runner').Steps;

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


### Additional Configuration Options

**Note:** Screener will automatically set `build` and `branch` options if you are using one of the following CI tools: Jenkins, CircleCI, Travis CI, Codeship, Drone, Bitbucket Pipelines, Semaphore.

- **build:** Build number from your CI tool. Screener will auto-generate a Build number if not provided.
- **branch:** Current branch name for your repo
- **resolution:** Screen resolution to use. Defaults to `1024x768`
- **ignore:** Comma-delimited string of CSS Selectors that represent areas to be ignored. Example: `.qa-ignore-date, .qa-ignore-ad`
- **includeRules:** Optional array of strings or RegExp expressions to filter states by. Rules are matched against state name. All matching states will be kept.
    - Example:
    ```
    includeRules: [
      'State name',
      /^Component/
    ]
    ```
- **excludeRules:** Optional array of strings or RegExp expressions to filter states by. Rules are matched against state name. All matching states will be removed.
    - Example:
    ```
    excludeRules: [
      'State name',
      /^Component/
    ]
    ```
- **tunnel.host:** The internal host to tunnel. If this is set, an encrypted tunnel will be automatically started by screener-runner to the specified host.
    - Example:
    ```
    tunnel: {
      host: 'localhost:3000'
    }
    ```
- **diffOptions:** Visual diff options to control validations.
    - Example:
    ```
    diffOptions: {
      structure: true,
      layout: true,
      style: true,
      content: true
    }
    ```
