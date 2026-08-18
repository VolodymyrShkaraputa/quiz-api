import { APIRequestContext, expect } from "@playwright/test";
import { isValidFutureSlot } from "../utils/slot";

export class TimeslotsApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly accessToken: string,
  ) {}

  async getAvailableSlots(userId: string, from: Date, to: Date) {
    const response = await this.request.get("/api/v1/available-timeslots", {
      params: {
        attributes: "timeStart",

        "filter[time][from]": "09:00",
        "filter[time][to]": "21:00",

        "filter[timeZone]": "Europe/Kyiv",

        "filter[groupedByDays]": "true",

        "filter[timeStart][from]": from.toISOString(),

        "filter[timeStart][to]": to.toISOString(),
      },

      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${this.accessToken}`,
        "x-request-id": userId,
      },
    });

    const body = await response.json();

    expect(
      response.ok(),
      [
        "Failed to get available slots.",
        `Status: ${response.status()}`,
        `Response: ${JSON.stringify(body)}`,
      ].join(" "),
    ).toBeTruthy();

    return body;
  }

  async findAvailableTime(userId: string): Promise<string> {
    const now = new Date();

    const from = now;

    const to = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const body = await this.getAvailableSlots(userId, from, to);

    const slots = Array.isArray(body?.data) ? body.data : [];

    expect(
      slots.length,
      `No available slots returned: ${JSON.stringify(body)}`,
    ).toBeGreaterThan(0);

    const slot = slots.find((item: any) => {
      const timeStart =
        item?.attributes?.["time-start"] ?? item?.attributes?.timeStart;

      return typeof timeStart === "string" && isValidFutureSlot(timeStart);
    });

    expect(
      slot,
      `No future trial slot found: ${JSON.stringify(slots)}`,
    ).toBeDefined();

    const timeStart =
      slot.attributes?.["time-start"] ?? slot.attributes?.timeStart;

    return new Date(timeStart).toISOString();
  }
}
