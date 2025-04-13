const { createApp } = Vue

createApp({
  data() {
    return {
      user: null,
      events: []
    }
  },
  methods: {
    handleCredentialResponse(response) {
      const data = this.parseJwt(response.credential)
      this.user = data

      this.getAccessToken().then(token => {
        if (token) this.fetchUpcomingEvents(token)
      })
    },
    getAccessToken() {
      return new Promise((resolve) => {
        google.accounts.oauth2.initTokenClient({
          client_id: CONFIG.CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/calendar.readonly',
          callback: (tokenResponse) => resolve(tokenResponse.access_token)
        }).requestAccessToken()
      })
    },
    fetchUpcomingEvents(token) {
      const now = new Date().toISOString()
      const eightDaysLater = new Date(Date.now() + 8 * 86400000).toISOString()

      fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&timeMax=${eightDaysLater}&singleEvents=true&orderBy=startTime`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.items) {
            this.events = data.items.map(event => ({
              id: event.id,
              start: event.start.dateTime || event.start.date,
              summary: event.summary || '(無題)'
            }))
          }
        })
    },
    parseJwt(token) {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''))

      return JSON.parse(jsonPayload)
    }
  },
  mounted() {
    google.accounts.id.initialize({
      client_id: CONFIG.CLIENT_ID,
      callback: this.handleCredentialResponse
    })
    google.accounts.id.renderButton(
      document.getElementById("g_id_signin"),
      { theme: "outline", size: "large", text: "sign_in_with" }
    )
  }
}).mount('#app')
