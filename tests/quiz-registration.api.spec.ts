import { test, expect } from "@playwright/test";

import { UsersApi } from "../api/users.api";
import { LessonsApi } from "../api/lessons.api";
import { TimeslotsApi } from "../api/timeslots.api";

import { createUserData } from "../data/createUser";

test.describe.serial("Quiz Registration API Test Flow", () => {
  const userData = createUserData();

  let userId: string;
  let accessToken: string;
  let selectedTime: string;

  let trialTutor: {
    tutorId: string;
    freeSlot: string;
  };

  let slot: {
    tutorId: string;
    timeStart: string;
    timeEnd: string;
  };

  test("POST /users creates a new account", async ({ request }) => {
    const usersApi = new UsersApi(request);

    const user = await usersApi.create(userData);

    expect(
      user.id,
      "User id should be returned after account creation",
    ).toBeTruthy();

    userId = user.id;
  });

  test("POST /oauth/token authenticates created user", async ({ request }) => {
    const usersApi = new UsersApi(request);

    const token = await usersApi.getToken(userData.phone, userData.password);

    expect(token.access_token, "Access token should be returned").toBeTruthy();

    expect(token.token_type.toLowerCase()).toBe("bearer");

    expect(
      token.expires_in,
      "Token expiration should be greater than zero",
    ).toBeGreaterThan(0);

    accessToken = token.access_token;
  });

  test("GET /users?me=true returns current user", async ({ request }) => {
    const usersApi = createAuthorizedUsersApi(request, accessToken);

    const currentUser = await usersApi.getCurrentUser();

    expect(
      currentUser?.data?.id,
      "Current user id should match created user id",
    ).toBe(userId);
  });

  test("PATCH /users/:id saves initial quiz answers", async ({ request }) => {
    const usersApi = createAuthorizedUsersApi(request, accessToken);

    await usersApi.updateQuizAnswers(userId, null);

    const currentUser = await usersApi.getCurrentUser();

    const userMeta = currentUser.included?.find(
      (item: { type: string }) => item.type === "user-meta",
    );

    expect(userMeta, "User metadata should be returned").toBeDefined();

    expect(
      userMeta?.attributes?.["tutor-type-wishes"],
      "Tutor type wishes should be saved",
    ).toBeTruthy();

  });

  test("GET /available-timeslots returns available lesson time", async ({
    request,
  }) => {
    const timeslotsApi = new TimeslotsApi(request, accessToken);

    selectedTime = await timeslotsApi.findAvailableTime(userId);

    expect(
      selectedTime,
      "Available lesson time should be returned",
    ).toBeTruthy();

    expect(
      new Date(selectedTime).getTime(),
      "Available lesson time should contain a valid date",
    ).not.toBeNaN();

    expect(
      new Date(selectedTime).getTime(),
      "Available lesson time should be in the future",
    ).toBeGreaterThan(Date.now());

  });

  test("PATCH /users/:id saves selected lesson time", async ({ request }) => {
    const usersApi = createAuthorizedUsersApi(request, accessToken);

    await usersApi.updateQuizAnswers(userId, selectedTime, true);

    const currentUser = await usersApi.getCurrentUser();

    const userMeta = currentUser.included?.find(
      (item: { type: string }) => item.type === "user-meta",
    );

    expect(
      userMeta?.attributes?.["lesson-date-wishes"],
      "Selected lesson time should be saved",
    ).toBe(selectedTime);

  });

  test("GET /users?filter[get-tutor-for-trial]=true returns tutor", async ({
    request,
  }) => {
    const usersApi = createAuthorizedUsersApi(request, accessToken);

    trialTutor = await usersApi.getTutorForTrial();

    expect(
      trialTutor.tutorId,
      "Trial tutor id should be returned",
    ).toBeTruthy();

    expect(
      trialTutor.freeSlot,
      "Tutor free slot should be returned",
    ).toBeTruthy();

    const timeStart = new Date(trialTutor.freeSlot);

    expect(
      timeStart.getTime(),
      "Tutor free slot should contain a valid date",
    ).not.toBeNaN();

    const timeEnd = new Date(timeStart.getTime() + 29 * 60 * 1000);

    slot = {
      tutorId: trialTutor.tutorId,
      timeStart: timeStart.toISOString(),
      timeEnd: timeEnd.toISOString(),
    };
  });

  test("POST /lessons books trial lesson", async ({ request }) => {
    const lessonsApi = new LessonsApi(request, accessToken);

    const lesson = await lessonsApi.createTrialLesson({
      studentId: userId,
      tutorId: slot.tutorId,
      timeStart: slot.timeStart,
      timeEnd: slot.timeEnd,
    });

    expect(lesson.id, "Created lesson should have id").toBeTruthy();

    expect(lesson.type).toBe("lessons");

    expect(
      Number(lesson.attributes?.["student-id"]),
      "Lesson should belong to created student",
    ).toBe(Number(userId));

    expect(
      Number(lesson.attributes?.["tutor-id"]),
      "Lesson should belong to selected tutor",
    ).toBe(Number(slot.tutorId));

    expect(
      lesson.attributes?.["time-start"],
      "Lesson start time should match selected slot",
    ).toBe(slot.timeStart);

    expect(
      lesson.attributes?.["time-end"],
      "Lesson end time should match selected slot",
    ).toBe(slot.timeEnd);
  });

  test("GET /users/:id/user-balances returns user balance", async ({
    request,
  }) => {
    const usersApi = createAuthorizedUsersApi(request, accessToken);

    const balance = await usersApi.getBalance(userId);

    expect(balance, "User balance response should be returned").toBeDefined();

    expect(
      balance.data,
      "User balance response should contain data",
    ).toBeDefined();

  });
});

function createAuthorizedUsersApi(
  request: ConstructorParameters<typeof UsersApi>[0],
  accessToken: string,
): UsersApi {
  expect(
    accessToken,
    "Access token must be received before calling authorized endpoint",
  ).toBeTruthy();

  const usersApi = new UsersApi(request);
  usersApi.setAccessToken(accessToken);

  return usersApi;
}
