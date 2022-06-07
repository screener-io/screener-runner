# Change Log

## 0.13.2

Add package-lock

## 0.13.1

- Set correct registry

## 0.13.0
- Update default Sauce Connect version to `4.7.1`
- Add `sauce.scVersion` config
- Update `saucelabs` package to latest, with `tunnelIdentifier` option changed to `tunnelName`

## 0.12.4
- Update screener-ngrok in package-lock.json

## 0.12.3
- Update screener-ngrok in package.json

## 0.12.2
- Increase branch max length

## 0.12.1
- Update screener-ngrok version

## 0.12.0
- Switching to saucelabs package to launch Sauce Connect
- Environment variable to configure sauce connect version SAUCE_CONNECT_VERSION, default is 4.6.2
- Node 10+

## 0.11.10
- Add internal prop

## 0.11.9
- Add github actions support

## 0.11.8
- Add bitbucket build num

## 0.11.7
- Add `disableDiffOnError` option

## 0.11.6
- Increase retries/timeout for Ngrok

## 0.11.5
- Update dependency http-proxy to 1.18.1

## 0.11.4
- Update Sauce Connect version to `4.6.2`

## 0.11.3
- Bug: Fix browser validation issue from 0.11.0.
  - Patch versions will now pass validation, despite Sauce Labs ignoring the patch version when setting up the test browser (NOTE: patch version _will_ remain present in Screener log).

## 0.11.2
- Add handling for Semaphore 2.0, using env vars `SEMAPHORE_WORKFLOW_ID`,  `SEMAPHORE_GIT_BRANCH`, `SEMAPHORE_GIT_PR_SHA`.

## 0.11.1
- Specify the version of Sauce Connect that is being used by screener-runner.

## 0.11.0
- BREAKING BUG (fixed in 0.11.3): Patch browser versions (e.g. `1.1.1`) fail validation.
  - User reported using patch versions historically, resulting in an error when updating to 0.11.0.
- Feature: Automatically download sauce connect client with version `4.5.4`
  - Update sauce object schema to add `launchSauceConnect` flag.
  - Added validation rules for new launchSauceConnect option by using joi 14.3.1.
