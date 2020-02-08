# Change Log

## 0.11.2
- Add handling for Semaphore 2.0, using env vars SEMAPHORE_WORKFLOW_ID,  SEMAPHORE_GIT_BRANCH, SEMAPHORE_GIT_PR_SHA.

## 0.11.1

- Specify the version of Sauce Connect that is being used by screener-runner.

## 0.11.0

- Feature: Automatically download sauce connect client with version `4.5.4`
  - Update sauce object schema to add `launchSauceConnect` flag
  - Added validation rules for new launchSauceConnect option by using joi 14.3.1
