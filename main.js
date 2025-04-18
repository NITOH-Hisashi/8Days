const { createApp } = Vue;

createApp({
  data() {
    return {
      user: null,
      token: null,
      startDate: this.formatDateInput(new Date()),
      eventsByDate: {},
      calendarList: [],
      selectedCalendars: []
    };
  },
  computed: {
    dateRange() {
      const dates = [];
      const start = new Date(this.startDate);
      for (let i = 0; i < 8; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        dates.push(this.formatDateKey(d));
      }
      return dates;
    }
  },
  methods: {
    handleCredentialResponse(response) {
        const data = jwt_decode(response.credential);
        this.user = { name: data.name, email: data.email };
        this.token = response.credential;
        this.loadCalendarList().then(this.loadEvents);
    },
     /*
     getAccessToken() {
        return new Promise((resolve) => {
            google.accounts.oauth2.initTokenClient({
                client_id: CONFIG.CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/calendar.readonly',
                callback: (tokenResponse) => resolve(tokenResponse.access_token)
            }).requestAccessToken()
        })
    },
    */
    formatDateInput(date) {
      return date.toISOString().split("T")[0];
    },
    formatDateKey(date) {
      return date.toISOString().split("T")[0];
    },
    formatDateLabel(dateStr) {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getDate()} (${["日","月","火","水","木","金","土"][date.getDay()]})`;
    },
    async loadCalendarList() {
      const res = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const data = await res.json();
      this.calendarList = data.items;
      this.selectedCalendars = data.items.map(cal => cal.id);
    },
    async loadEvents() {
      if (!this.token || !this.startDate) return;
      this.eventsByDate = {};
      for (const calId of this.selectedCalendars) {
        const timeMin = new Date(this.startDate).toISOString();
        const endDate = new Date(this.startDate);
        endDate.setDate(endDate.getDate() + 7);
        const timeMax = endDate.toISOString();

        const res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
          { headers: { Authorization: `Bearer ${this.token}` } }
        );
        const data = await res.json();
        for (const item of data.items || []) {
          const dateKey = item.start.date || item.start.dateTime.split("T")[0];
          if (!this.eventsByDate[dateKey]) this.eventsByDate[dateKey] = [];
          this.eventsByDate[dateKey].push({
            id: item.id,
            summary: item.summary,
            time: item.start.dateTime ? item.start.dateTime.split("T")[1].substring(0,5) : "終日"
          });
        }
      }
    },
    logout() {
      google.accounts.id.disableAutoSelect();
      this.user = null;
      this.token = null;

    }
  },
  mounted() {
    google.accounts.id.initialize({
      client_id: CONFIG.CLIENT_ID,
      callback: this.handleCredentialResponse
    });
    google.accounts.id.renderButton(
      document.getElementById("g_id_signin"),
      { theme: "outline", size: "large" }
    );
    google.accounts.id.prompt();
  }
}).mount("#app");
