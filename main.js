const { createApp } = Vue;

const app = createApp({
  data() {
    return {
      startDate: new Date().toISOString().split("T")[0],
      user: null,
      token: null,
      calendars: [],
      visibleCalendars: [],
      eventsByDate: {},
    };
  },
  computed: {
    dateRange() {
      const dates = [];
      const start = new Date(this.startDate);
      for (let i = 0; i < 8; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        dates.push(d.toISOString().split("T")[0]);
      }
      return dates;
    },
  },
  methods: {
    formatDateLabel(dateStr) {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getDate()} (${["日", "月", "火", "水", "木", "金", "土"][date.getDay()]})`;
    },
    logout() {
      this.user = null;
      this.token = null;
      this.calendars = [];
      this.visibleCalendars = [];
      this.eventsByDate = {};
      google.accounts.id.disableAutoSelect();
      location.reload();
    },
    async loadCalendarList() {
      const res = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      const data = await res.json();
      this.calendars = data.items;
      this.visibleCalendars = data.items.map((cal) => cal.id);
    },
    async loadEvents() {
      if (!this.token || !this.visibleCalendars.length) return;
      const eventsByDate = {};
      const timeMin = new Date(this.startDate).toISOString();
      const timeMax = new Date(new Date(this.startDate).getTime() + 8 * 24 * 60 * 60 * 1000).toISOString();

      for (const calendarId of this.visibleCalendars) {
        const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
        url.searchParams.set("timeMin", timeMin);
        url.searchParams.set("timeMax", timeMax);
        url.searchParams.set("singleEvents", "true");
        url.searchParams.set("orderBy", "startTime");

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        const data = await res.json();
        if (!data.items) continue;

        for (const item of data.items) {
          const start = item.start.dateTime || item.start.date;
          const date = start.split("T")[0];
          if (!eventsByDate[date]) eventsByDate[date] = [];
          eventsByDate[date].push({
            id: item.id,
            summary: item.summary || "(無題)",
            time: item.start.dateTime ? new Date(item.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "終日",
          });
        }
      }

      this.eventsByDate = eventsByDate;
    },
    handleCredentialResponse(response) {
      const decoded = jwt_decode(response.credential);
      this.user = { name: decoded.name, email: decoded.email };

      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.CLIENT_ID,
        scope: "https://www.googleapis.com/auth/calendar.readonly",
        callback: (tokenResponse) => {
          this.token = tokenResponse.access_token;
          this.loadCalendarList().then(this.loadEvents);
        },
      });
      tokenClient.requestAccessToken();
    },
  },
  mounted() {
    google.accounts.id.initialize({
        client_id: CONFIG.CLIENT_ID,
        callback: this.handleCredentialResponse,
    });
    google.accounts.id.renderButton(
      document.getElementById("g_id_signin"),
      { theme: "outline", size: "large" }
    );
    google.accounts.id.prompt();
  },
});

app.mount("#app");
