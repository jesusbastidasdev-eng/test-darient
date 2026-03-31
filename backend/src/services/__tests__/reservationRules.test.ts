import { describe, expect, it } from "vitest";

import { assertNoOverlap, assertWeeklyLimit, weekRange } from "../reservationRules.js";

describe("reservationRules", () => {
  it("detects overlapping reservations", () => {
    expect(() =>
      assertNoOverlap(
        {
          reservationDate: new Date("2026-03-31T00:00:00.000Z"),
          startTime: "10:00",
          endTime: "11:00"
        },
        [
          {
            id: "r1",
            clientEmail: "a@test.com",
            reservationDate: new Date("2026-03-31T00:00:00.000Z"),
            startTime: "10:30",
            endTime: "11:30"
          }
        ]
      )
    ).toThrowError(/conflicts/i);
  });

  it("allows non-overlapping reservations", () => {
    expect(() =>
      assertNoOverlap(
        {
          reservationDate: new Date("2026-03-31T00:00:00.000Z"),
          startTime: "08:00",
          endTime: "09:00"
        },
        [
          {
            id: "r1",
            clientEmail: "a@test.com",
            reservationDate: new Date("2026-03-31T00:00:00.000Z"),
            startTime: "09:00",
            endTime: "10:00"
          }
        ]
      )
    ).not.toThrow();
  });

  it("enforces max 3 reservations per week", () => {
    expect(() => assertWeeklyLimit(3)).toThrowError(/weekly booking limit/i);
    expect(() => assertWeeklyLimit(2)).not.toThrow();
  });

  it("computes week range boundaries", () => {
    const { weekStart, weekEnd } = weekRange(new Date("2026-03-31T10:00:00.000Z"));
    expect(weekStart.toISOString()).toContain("2026-03-30");
    expect(weekEnd.toISOString()).toContain("2026-04-05");
  });
});
