# Screener-Runner

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


### Additional Configuration Options

**Note:** Screener will automatically set `build` and `branch` options if you are using one of the following CI tools: Jenkins, CircleCI, Travis CI, Codeship, Drone, Bitbucket Pipelines, Semaphore.

- **build:** Build number from your CI tool. Screener will auto-generate a Build number if not provided.
- **branch:** Current branch name for your repo
- **resolution:** Screen resolution to use. Defaults to `1280x1024`
- **ignore:** Comma-delimited string of CSS Selectors that represent areas to be ignored. Example: `.qa-ignore-date, .qa-ignore-ad`
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
