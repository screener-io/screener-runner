# Change Log

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
