import { describe, it, expect, vi } from "vitest";
import { createApp } from "vue";
import App from "../main.js";

describe("Vue App Methods", () => {
    let app;

    beforeEach(() => {
        app = createApp(App).mount(document.createElement("div"));
    });

    it("should format date input correctly", () => {
        const date = new Date("2025-04-17");
        const result = app.formatDateInput(date);
        expect(result).toBe("2025-04-17");
    });

    it("should format date key correctly", () => {
        const date = new Date("2025-04-17");
        const result = app.formatDateKey(date);
        expect(result).toBe("2025-04-17");
    });

    it("should format date label correctly", () => {
        const dateStr = "2025-04-17";
        const result = app.formatDateLabel(dateStr);
        expect(result).toBe("4/17 (–Ø)");
    });

    it("should logout user", () => {
        app.user = { name: "Test User" };
        app.token = "test-token";
        app.logout();
        expect(app.user).toBeNull();
        expect(app.token).toBeNull();
    });

    it("should load calendar list", async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () =>
                    Promise.resolve({
                        items: [{ id: "cal1", summary: "Test Calendar" }]
                    })
            })
        );
        app.token = "test-token";
        await app.loadCalendarList();
        expect(app.calendarList).toHaveLength(1);
        expect(app.calendarList[0].summary).toBe("Test Calendar");
    });

    it("should load events", async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () =>
                    Promise.resolve({
                        items: [
                            {
                                id: "event1",
                                summary: "Test Event",
                                start: { dateTime: "2025-04-17T10:00:00" }
                            }
                        ]
                    })
            })
        );
        app.token = "test-token";
        app.startDate = "2025-04-17";
        app.selectedCalendars = ["cal1"];
        await app.loadEvents();
        expect(app.eventsByDate["2025-04-17"]).toHaveLength(1);
        expect(app.eventsByDate["2025-04-17"][0].summary).toBe("Test Event");
    });

    it("should handle credential response", async () => {
        const mockResponse = {
            credential: "test-token"
        };
        global.jwt_decode = vi.fn(() => ({
            name: "Test User",
            email: "test@example.com"
        }));
        app.handleCredentialResponse(mockResponse);
        expect(app.user.name).toBe("Test User");
        expect(app.token).toBe("test-token");
    });
});
