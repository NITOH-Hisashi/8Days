const { createApp } = Vue

createApp({
  data() {
    const today = new Date().toISOString().split('T')[0]
    return {
      user: null,
      eventsByDate: {},
      startDate: today,
      dateRange: [],
      accessToken: null
    }
  },
  methods: {
    handleCredentialResponse(response) {
      const data = this.parseJwt(response.credential)
      this.user = data
      this.loadEvents()
    },
    getAccessToken() {
      return new Promise((resolve) => {
        if (this.accessToken) {
          resolve(this.accessToken)
        } else {
          google.accounts.oauth2.initTokenClient({
            client_id: CONFIG.CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/calendar.readonly',
            callback: (tokenResponse) => {
              this.accessToken = tokenResponse.access_token
              resolve(this.accessToken)
            }
          }).requestAccessToken()
        }
      })
    },
    async loadEvents() {
      this.dateRange = this.generateDateRange(this.startDate)
      const token = await this.getAccessToken()
      const timeMin = new Date(this.startDate).toISOString()
      const timeMax = new Date(new Date(this.startDate).getTime() + 7 * 86400000).toISOString()

      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      this.eventsByDate = {}

      if (data.items) {
        for (const event of data.items) {
          const start = event.start.dateTime || event.start.date
          const date = start.split('T')[0]
          const time = event.start.dateTime ? new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '終日'
          if (!this.eventsByDate[date]) this.eventsByDate[date] = []
          this.eventsByDate[date].push({
            id: event.id,
            time: time,
            summary: event.summary || '(無題)'
          })
        }
      }
    },
    generateDateRange(start) {
      const dates = []
      const startDate = new Date(start)
      for (let i = 0; i < 8; i++) {
        const d = new Date(startDate)
        d.setDate(d.getDate() + i)
        dates.push(d.toISOString().split('T')[0])
      }
      return dates
    },
    formatDateLabel(dateStr) {
      const date = new Date(dateStr)
      const options = { month: 'short', day: 'numeric', weekday: 'short' }
      return date.toLocaleDateString('ja-JP', options)
    },
    parseJwt(token) {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''))
      return JSON.parse(jsonPayload)
    },
    logout() {
      this.user = null
      this.accessToken = null
      google.accounts.id.disableAutoSelect()
      document.getElementById('g_id_signin').innerHTML = ''
      google.accounts.id.renderButton(
        document.getElementById('g_id_signin'),
        { theme: 'outline', size: 'large', text: 'sign_in_with' }
      )
    }
  },
  mounted() {
    google.accounts.id.initialize({
      client_id: CONFIG.CLIENT_ID,
      callback: this.handleCredentialResponse,
      auto_select: true
    })
    google.accounts.id.renderButton(
      document.getElementById("g_id_signin"),
      { theme: "outline", size: "large", text: "sign_in_with" }
    )
  }
}).mount('#app')
