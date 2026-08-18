import { APIRequestContext, expect } from "@playwright/test";

export type CreateLessonParams = {
  studentId: string;
  tutorId: string;
  timeStart: string;
  timeEnd: string;
};

export type CreatedLesson = {
  id: string;
  type: string;
  attributes: Record<string, any>;
  relationships?: Record<string, any>;
};

export class LessonsApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly accessToken: string,
  ) {}

  async createTrialLesson(params: CreateLessonParams): Promise<CreatedLesson> {
    const { studentId, tutorId, timeStart, timeEnd } = params;

    const response = await this.request.post("/api/v1/lessons", {
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${this.accessToken}`,
        "x-request-id": studentId,
      },

      data: {
        data: {
          type: "lessons",

          attributes: {
            "time-start": timeStart,
            "time-end": timeEnd,

            "created-at": null,
            "created-by-user-id": null,

            "tutor-id": Number(tutorId),
            "student-id": Number(studentId),

            "lesson-type-id": null,

            "is-paid": 0,
            state: 1,

            "enabled-slot": null,

            "finished-by-user-id": null,
            "finished-result": null,

            "compensation-amount": null,
            "compensation-currency": null,
            "compensation-time": null,
            "compensation-comment": null,

            mark: null,
            "connection-quality-mark": null,
            "educational-materials-mark": null,
            "general-mark": null,

            "student-review": null,
            "student-review-time": null,

            "is-visible-student-review": true,
            "is-visible-admin-review": true,

            "admin-mark": null,
            "admin-review": null,
            "admin-review-time": null,

            "canceled-reason": null,
            "canceled-comment": null,
            "canceled-by-user-id": null,

            "is-send-cancel-details-to-student": false,

            "package-qty": null,
            "package-interval": null,

            "group-lesson-id": null,
            "english-level": null,
            theme: null,

            "is-short-review": true,
            "is-first": false,

            "actual-duration": null,
            "real-duration": null,

            "compensation-amount-before": null,

            "penalty-type": null,
            "penalty-coefficient": null,

            "canceled-qty": null,

            "tutor-spoke": null,
            "student-spoke": null,

            "book-next-after-pay": false,

            "video-record-created-at": null,
            "audio-record-created-at": null,

            "can-record": false,
            "is-record": false,

            "lesson-in-zoom": false,

            "technical-issue-comment": null,
            "transaction-id": null,

            "booking-type": null,

            "is-blended": false,
            "is-main-speaking": false,

            subject: null,

            "materials-review": null,
            "materials-mark": null,

            "is-parent-present": null,
            difficulty: null,

            "is-teacher-kept-attention": null,
            "is-like-materials-quality": null,
            "is-student-skip-rating": null,

            "teacher-connected-at": null,
            "teacher-disconnected-at": null,
          },
        },
      },
    });

    const body = await response.json();

    expect(
      response.ok(),
      [
        `Create trial lesson failed.`,
        `Status: ${response.status()}`,
        `Response: ${JSON.stringify(body)}`,
      ].join(" "),
    ).toBeTruthy();

    expect(
      body?.data,
      `Lesson response does not contain data: ${JSON.stringify(body)}`,
    ).toBeDefined();

    const lesson = body.data;

    expect(
      lesson.id,
      `Lesson response does not contain id: ${JSON.stringify(body)}`,
    ).toBeTruthy();

    expect(
      lesson.type,
      `Lesson response does not contain type: ${JSON.stringify(body)}`,
    ).toBe("lessons");

    expect(
      lesson.attributes,
      `Lesson response does not contain attributes: ${JSON.stringify(body)}`,
    ).toBeDefined();

    // Verify that backend created lesson for the expected student.
    expect(
      Number(lesson.attributes["student-id"]),
      `Unexpected student-id in created lesson`,
    ).toBe(Number(studentId));

    // Verify tutor.
    expect(
      Number(lesson.attributes["tutor-id"]),
      `Unexpected tutor-id in created lesson`,
    ).toBe(Number(tutorId));

    // Verify booking time.
    expect(
      lesson.attributes["time-start"],
      `Unexpected time-start in created lesson`,
    ).toBe(timeStart);

    expect(
      lesson.attributes["time-end"],
      `Unexpected time-end in created lesson`,
    ).toBe(timeEnd);

    return lesson;
  }
}
