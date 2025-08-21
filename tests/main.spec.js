import { describe, it, expect, vi } from "vitest";
import { createApp } from "vue";
import "../config.js";
import "../main.js";

describe("Vue App Methods", () => {
    let app;

    beforeEach(() => {
        global.google = {
            accounts: {
                id: {
                    disableAutoSelect: vi.fn(),
                    revoke: vi.fn(),
                    initialize: vi.fn(),
                    prompt: vi.fn(),
                    cancel: vi.fn(),
                    renderButton: vi.fn(),
                },
                oauth2: {
                    initTokenClient: vi.fn(() => ({
                        requestAccessToken: vi.fn(),
                    })),
                },
            },
        };

        global.jwt_decode = vi.fn(() => ({
            name: "Test User",
            email: "test@example.com",
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
        }));
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
        expect(result).toBe("17日(木)");
    });

    it("should logout user", () => {
        app.user = { name: "Test User" };
        app.accessToken = "test-token";
        app.logout();
        expect(app.user).toBeNull();
        expect(app.accessToken).toBeNull();
    });

    it("should load calendar list", async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        items: [{ id: "cal1", summary: "Test Calendar" }]
                    })
            })
        );
        app.__raw.accessToken.value = "test-token";
        await app.loadCalendarList();
        expect(app.__raw.calendars.value).toHaveLength(1);
        expect(app.__raw.calendars.value[0].summary).toBe("Test Calendar");
    });

    it("should load events", async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        items: [
                            {
                                id: "event1",
                                summary: "Test Event",
                                start: { dateTime: "2025-04-17T10:00:00" },
                                end: { dateTime: "2025-04-17T11:00:00" }
                            }
                        ]
                    })
            })
        );
        app.accessToken = "test-token";
        app.startDate = "2025-04-17";
        app.visibleCalendars = ["cal1"];
        await app.loadEvents();
        expect(app.__raw.eventsByDate.value["2025-04-17"]).toHaveLength(1);
        expect(app.__raw.eventsByDate.value["2025-04-17"][0].summary).toBe("Test Event");
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
        expect(app.accessToken).toBe("test-token");
    });
});
