## Quiz Registration API Test Flow

1. Create a new user account (`POST /users`).
2. Authenticate the created user (`POST /oauth/token`).
3. Verify that the current user is returned (`GET /users?me=true`).
4. Save the initial quiz answers (`PATCH /users/:id`).
5. Get an available trial lesson time (`GET /available-timeslots`).
6. Save the selected lesson time (`PATCH /users/:id`).
7. Get a matching tutor for the trial lesson (`GET /users?filter[get-tutor-for-trial]=true`).
8. Book and verify the trial lesson (`POST /lessons`).
9. Verify the user balance (`GET /users/:id/user-balances`).

## Setup

- Node.js 18 or later
- Install dependencies `npm ci`
- Add environment settings `.env`
  API_BASE_URL=https://stage.allright.com
  OAUTH_CLIENT_ID=**********
  OAUTH_CLIENT_SECRET=******

## Run

```bash
npm run
```

## Structure

```text
tests/
  quiz-registration.api.spec.ts

api/
  users.api.ts
  lessons.api.ts
  timeslots.api.ts

data/
  createUser.ts
  quizAnswers.ts

utils/
  slot.ts

playwright.config.ts
```