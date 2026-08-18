import { APIRequestContext, expect } from "@playwright/test";
import { CreateUserData, buildCreateUserPayload } from "../data/createUser";
import { quizAnswers } from "../data/quizAnswers";

export type CreatedUser = CreateUserData & {
  id: string;
};

export type AccessTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};
export type TrialTutor = { tutorId: string; freeSlot: string };

export class UsersApi {
  private accessToken = "";

  constructor(private readonly request: APIRequestContext) {}

  private get authHeaders() {
    return {
      Accept: "application/vnd.api+json",
      Authorization: `Bearer ${this.accessToken}`,
    };
  }

  private get jsonApiHeaders() {
    return {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    };
  }

  async create(user: CreateUserData): Promise<CreatedUser> {
    const response = await this.request.post("/api/v1/users", {
      headers: this.jsonApiHeaders,
      data: buildCreateUserPayload(user),
    });

    const body = await response.json();

    expect(
      response.ok(),
      `Create user failed: ${response.status()} ${JSON.stringify(body)}`,
    ).toBeTruthy();

    const id = String(body?.data?.id ?? "");

    expect(id).toBeTruthy();

    return {
      ...user,
      id,
    };
  }

  async getToken(
    username: string,
    password: string,
  ): Promise<AccessTokenResponse> {
    const clientId = process.env.OAUTH_CLIENT_ID ?? "frontendClient";
    const clientSecret = process.env.OAUTH_CLIENT_SECRET;

    if (!clientSecret) {
      throw new Error(
        "OAUTH_CLIENT_SECRET is not configured. Create .env from .env.example.",
      );
    }

    const normalizedUsername = username.replace(/^\+/, "");
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64",
    );

    const response = await this.request.post("/oauth/token", {
      headers: {
        Accept: "*/*",
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: `${process.env.API_BASE_URL}`,
        Referer:
          `${process.env.API_BASE_URL}/uk/app/sign-up/long/charlie/user-info-phone`,
      },

      form: {
        grant_type: "password",
        username: normalizedUsername,
        password,
        client_id: clientId,
      },
    });

    const responseText = await response.text();

    expect(
      response.ok(),
      `Get token failed: ${response.status()} ${responseText}`,
    ).toBeTruthy();

    let body: AccessTokenResponse;

    try {
      body = JSON.parse(responseText) as AccessTokenResponse;
    } catch {
      throw new Error(`OAuth response is not valid JSON: ${responseText}`);
    }

    expect(body.access_token).toBeTruthy();
    expect(body.token_type.toLowerCase()).toBe("bearer");
    expect(body.expires_in).toBeGreaterThan(0);

    return body;
  }

  setAccessToken(accessToken: string): void {
    this.accessToken = accessToken;

    expect(this.accessToken, "Access token must not be empty").toBeTruthy();
  }
  async getTutorForTrial(): Promise<TrialTutor> {
    const response = await this.request.get("/api/v1/users", {
      params: { "filter[get-tutor-for-trial]": "true" },
      headers: this.authHeaders,
    });
    const body = await response.json();
    expect(
      response.ok(),
      `Get trial tutor failed: ${response.status()} ${JSON.stringify(body)}`,
    ).toBeTruthy();
    const tutorId = String(body?.data?.id ?? "");
    const freeSlot = String(body?.meta?.freeSlot ?? "");
    expect(tutorId, "Trial tutor id should be returned").toBeTruthy();
    expect(freeSlot, "Trial tutor free slot should be returned").toBeTruthy();
    return { tutorId, freeSlot };
  }

  async getCurrentUser() {
    const response = await this.request.get("/api/v1/users", {
      params: {
        include:
          "UserDevices,UserMetum,TutorType,ChildProfiles,UserExperiments",
        me: "true",
      },

      headers: this.authHeaders,
    });

    const body = await response.json();

    expect(
      response.ok(),
      `Get current user failed: ${response.status()} ${JSON.stringify(body)}`,
    ).toBeTruthy();

    expect(body?.data?.id, "Current user id should exist").toBeTruthy();

    return body;
  }

  async updateQuizAnswers(
    userId: string,
    lessonDateWishes: string | null,
    finalStep = false,
  ): Promise<void> {
    const currentUser = await this.getCurrentUser();

    const currentUserData = currentUser?.data;

    expect(
      currentUserData,
      `Current user data is missing: ${JSON.stringify(currentUser)}`,
    ).toBeDefined();

    expect(currentUserData.id, "Current user id should exist").toBe(userId);

    const currentUserMeta = currentUser?.included?.find(
      (item: any) => item.type === "user-meta",
    );

    expect(
      currentUserMeta,
      `user-meta was not found: ${JSON.stringify(currentUser)}`,
    ).toBeDefined();

    const userMetaId = String(currentUserMeta.id);

    const userMetaAttributes = {
      ...currentUserMeta.attributes,

      "user-id": Number(userId),

      "child-name": quizAnswers.child.name,

      "child-name-latin": quizAnswers.child.name,

      "child-age": quizAnswers.child.age,

      "tutor-type-wishes": quizAnswers.tutorTypeWishes,

      "funnel-data": quizAnswers.funnelData,

      "lesson-date-wishes": lessonDateWishes,
      "child-hobby-id": quizAnswers.childHobbyId,

      "operating-timezone": "Europe/Kyiv",

      "operating-time": {
        from: 32400,
        to: 72000,
      },

      "min-working-hours": 15,

      "max-working-hours": 56,

      subject: "en",

      qualifications: [],
    };

    const response = await this.request.patch(`/api/v1/users/${userId}`, {
      headers: {
        Accept: "application/vnd.api+json",

        "Content-Type": "application/vnd.api+json",

        "x-request-id": userId,

        Authorization: `Bearer ${this.accessToken}`,
      },

      data: {
        data: {
          id: userId,
          type: "users",

          attributes: {
            "reg-from": 76,
            "additional-courses": finalStep
              ? [quizAnswers.additionalCourseId]
              : [],

            "utm-source": {
              src: `${process.env.API_BASE_URL}/uk/app/sign-up/long/charlie/age-range`,
              utm_funnel: "sign-up.long.charlie",
              ...(finalStep ? { childHobby: "roblox" } : {}),
            },
          },

          relationships: {
            "user-metum": {
              data: {
                id: userMetaId,

                type: "user-meta",

                attributes: userMetaAttributes,
              },
            },

            "user-experiments": {
              data: [],
            },

            "child-profiles": {
              data: [],
            },

            "tutor-type": {
              data: null,
            },
          },
        },
      },
    });

    const body = await response.json();

    expect(
      response.ok(),
      [
        "Update quiz answers failed.",
        `Status: ${response.status()}`,
        `Response: ${JSON.stringify(body)}`,
      ].join(" "),
    ).toBeTruthy();

    expect(
      body?.data?.id,
      `Updated user id is incorrect: ${JSON.stringify(body)}`,
    ).toBe(userId);

    const updatedMeta = body?.included?.find(
      (item: any) => item.type === "user-meta",
    );

    expect(
      updatedMeta,
      `Updated user-meta is missing: ${JSON.stringify(body)}`,
    ).toBeDefined();

    expect(updatedMeta.id).toBe(userMetaId);

    expect(updatedMeta.attributes?.["tutor-type-wishes"]).toBe(
      quizAnswers.tutorTypeWishes,
    );

    expect(updatedMeta.attributes?.["child-age"]).toBe(quizAnswers.child.age);

    expect(updatedMeta.attributes?.["lesson-date-wishes"]).toBe(
      lessonDateWishes,
    );

    expect(updatedMeta.attributes?.["child-hobby-id"]).toBe(
      quizAnswers.childHobbyId,
    );
  }

  async getBalance(userId: string) {
    const response = await this.request.get(
      `/api/v1/users/${userId}/user-balances`,
      {
        headers: this.authHeaders,
      },
    );

    const body = await response.json();

    expect(
      response.ok(),
      `Get user balance failed: ${response.status()} ${JSON.stringify(body)}`,
    ).toBeTruthy();

    return body;
  }
}
