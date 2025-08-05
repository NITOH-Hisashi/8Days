const { createApp, ref, onMounted, computed } = Vue;

createApp({
    setup() {
        const user = ref(null);
        const tokenClient = ref(null);
        const accessToken = ref(null);
        const startDate = ref(new Date().toISOString().split("T")[0]);
        const calendars = [];
        const visibleCalendars = [];
        const eventsByDate = ref({});

        const dateRange = computed(() => {
            const dates = [];
            const start = new Date(startDate.value);
            for (let i = 0; i < 8; i++) {
                const d = new Date(start);
                d.setDate(d.getDate() + i);
                dates.push(d.toISOString().split("T")[0]);
            }
            return dates;
        });

        const sampleEvents = [
            {
                id: "sample-1",
                summary: "サンプル会議",
                start: { dateTime: "2025-06-07T10:00:00+09:00" },
                end: { dateTime: "2025-06-07T11:00:00+09:00" },
            },
            {
                id: "sample-2",
                summary: "終日サンプルイベント",
                start: { date: "2025-06-08" },
                end: { date: "2025-06-09" },
            },
            {
                id: "sample-3",
                summary: "年跨ぎ",
                start: { dateTime: "2025-12-31T23:00:00+09:00" },
                end: { dateTime: "2026-01-01T01:00:00+09:00" },
            },
        ];


        function formatDateLabel(date) {
            const d = new Date(date);
            return d.toLocaleDateString("ja-JP", { weekday: "short", month: "short", day: "numeric" });
        }

        function styleForEvent(event) {
            const startHour = parseInt(event.startTime.split(":")[0]);
            const endHour = parseInt(event.endTime.split(":")[0]);
            return {
                top: `${(startHour - 6) * 40}px`,
                height: `${(endHour - startHour) * 40}px`
            };
        }

        function logout() {
            user.value = null;
            accessToken.value = null;
            calendars.value = [];
            visibleCalendars.value = [];
            eventsByDate.value = {};
            google.accounts.id.disableAutoSelect();
            google.accounts.id.revoke(user.value.email, () => { });
        }

        async function loadCalendarList() {
            const res = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
                headers: { Authorization: `Bearer ${this.token}` },
            });
            const data = await res.json();
            return data;
        }

        async function loadEvents() {
            console.log({ data });
            calendars.value = data.items;
            visibleCalendars.value = data.items.map((cal) => cal.id);
            if (!accessToken.value) {
                // 未ログイン → サンプルイベントを表示
                eventsByDate.value = parseEvents(sampleEvents);
                return;
            }
            const timeMin = new Date(startDate.value);
            const timeMax = new Date(timeMin);
            timeMax.setDate(timeMax.getDate() + 8);
            const calendarId = "primary";

            const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${accessToken.value}` },
            });
            const data = await res.json();

            const grouped = {};
            for (const date of dateRange.value) grouped[date] = [];

            for (const item of data.items || []) {
                const isAllDay = !!item.start.date;
                const dateKey = isAllDay ? item.start.date : item.start.dateTime.split("T")[0];
                const start = isAllDay ? "00:00" : item.start.dateTime.split("T")[1].slice(0, 5);
                const end = isAllDay ? "23:59" : item.end.dateTime.split("T")[1].slice(0, 5);
                if (!grouped[dateKey]) grouped[dateKey] = [];
                grouped[dateKey].push({
                    id: item.id,
                    summary: item.summary,
                    allDay: isAllDay,
                    time: start,
                    startTime: start,
                    endTime: end,
                });
            }
            eventsByDate.value = grouped;
        }

        onMounted(() => {
            google.accounts.id.initialize({
                client_id: CONFIG.GOOGLE_CLIENT_ID,
                callback: async (response) => {
                    const decoded = parseJwt(response.credential);
                    user.value = decoded;
                    const tokenRes = await tokenClient.value.requestAccessToken({ prompt: '' });
                },
            });
            google.accounts.id.renderButton(document.getElementById("g_id_signin"), {
                theme: "outline",
                size: "large",
            });
            tokenClient.value = google.accounts.oauth2.initTokenClient({
                client_id: CONFIG.GOOGLE_CLIENT_ID,
                scope: "https://www.googleapis.com/auth/calendar.readonly",
                callback: (resp) => {
                    accessToken.value = resp.access_token;
                    loadCalendarList().then(loadEvents());
                },
            });
        });

        function parseJwt(token) {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        }

        return { user, startDate, eventsByDate, formatDateLabel, logout, styleForEvent };
    }
}).mount("#app");
