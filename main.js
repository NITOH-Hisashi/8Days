const { createApp, ref, onMounted, onUnmounted, computed, watch } = Vue;

const LOG_CONFIG = {
    ENABLED: window.process.env.NODE_ENV !== 'production',
    LEVEL: window.process.env.LOG_LEVEL || 'INFO',
    PREFIX: '8Days:'
};

function createLogger(config) {
    const LEVELS = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3
    };

    return {
        debug: (...args) => {
            if (config.ENABLED && LEVELS[config.LEVEL] <= LEVELS.DEBUG) {
                console.log(config.PREFIX, '🐛', ...args);
            }
        },
        info: (...args) => {
            if (config.ENABLED && LEVELS[config.LEVEL] <= LEVELS.INFO) {
                console.log(config.PREFIX, 'ℹ️', ...args);
            }
        },
        warn: (...args) => {
            if (config.ENABLED && LEVELS[config.LEVEL] <= LEVELS.WARN) {
                console.warn(config.PREFIX, '⚠️', ...args);
            }
        },
        error: (...args) => {
            if (config.ENABLED && LEVELS[config.LEVEL] <= LEVELS.ERROR) {
                console.error(config.PREFIX, '❌', ...args);
            }
        }
    };
}

const logger = createLogger(LOG_CONFIG);

const DEBUG = window.process.env.NODE_ENV !== 'production';
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};
const LOG_LEVEL = LOG_LEVELS[window.process.env.LOG_LEVEL] || LOG_LEVELS.INFO;
/**
 * ログレベルを設定します。
 * @type {number}
 */
function log(level, ...args) {
    if (DEBUG && level >= currentLogLevel) {
        const prefix = ['🐛 DEBUG:', 'ℹ️ INFO:', '⚠️ WARN:', '❌ ERROR:'][level];
        console.log(prefix, ...args);
    }
}

function log(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

function logError(...args) {
    if (DEBUG) {
        console.error(...args);
    }
}

/**
 * アプリケーションの設定オブジェクトです。
 * このオブジェクトには、Google APIの設定やOAuth 2.0の設定が含まれています。
 * @typedef {Object} ErrorState
 * @property {'SESSION_EXPIRED'|'LOAD_ERROR'|'API_ERROR'|'AUTH_ERROR'} type
 * @property {string} message
 * @property {string} timestamp
 * @property {number} [statusCode] - HTTPステータスコード（オプション）
 * @property {string} [details] - 詳細なエラー情報（オプション）
 */
const error = ref(/** @type {ErrorState|null} */ null);

/**
 * Vue.jsアプリケーションのエントリポイントです。
 * この関数は、Vue.jsのアプリケーションを作成し、コンポーネントのセットアップを行います。
 * @returns {Vue.App} Vue.jsアプリケーションのインスタンス
 * @description
 * この関数は、Vue.jsのアプリケーションを初期化し、
 * 必要なコンポーネントや状態を設定します。
 * アプリケーションの初期化時に、ユーザー情報やトークンの管理、
 * カレンダーの読み込み、イベントの取得などを行います。
 * また、日付範囲の計算やキャッシュの管理を行い、
 * ユーザーが選択したカレンダーのイベントを表示するための準備をします。
 * この関数は、Vue.jsのComposition APIを使用しており、
 * リアクティブなデータを定義するために`ref`を使用しています。
 * また、日付範囲の計算を行うために`computed`を使用し、
 * キャッシュの管理を行います。
 * この関数は、Vue.jsのコンポーネントの初期化時に実行され、
 * コンポーネントの状態を設定します。
 * @typedef {Object} VueApp
 * @property {Function} createApp - Vue.jsアプリケーションを作成する関数
 * @property {Function} setup - Vue.jsコンポーネントのセットアップ関数
 * @property {Object} ref - リアクティブなデータを定義するための関数
 * @property {Object} computed - リアクティブな計算プロパティを定義するための関数
 * @property {Function} onMounted - コンポーネントがマウントされたときに実行される関数
 * @property {Function} log - デバッグ用のログ出力関数
 * @property {Function} logError - デバッグ用のエラーログ出力関数
 * @property {Object} CONFIG - アプリケーションの設定オブジェクト
 * @property {string} CONFIG.GOOGLE_CLIENT_ID - Google OAuth 2.0クライアントID
 * @property {string} CONFIG.GOOGLE_API_KEY - Google APIキー
 * @property {string} CONFIG.GOOGLE_DISCOVERY_DOCS - Google APIのディスカバリードキュメントURL
 * @property {string} CONFIG.GOOGLE_SCOPES - Google APIのスコープ
 * @property {string} CONFIG.GOOGLE_REDIRECT_URI - Google OAuth 2.0のリダイレクトURI
 * @property {string} CONFIG.GOOGLE_AUTH_URL - Google OAuth 2.0の認証URL
 * @property {string} CONFIG.GOOGLE_LOGOUT_URL - Google OAuth 2.0のログアウトURL
 * @property {string} CONFIG.GOOGLE_API_BASE_URL - Google APIのベースURL
 * @property {string} CONFIG.GOOGLE_API_VERSION - Google APIのバージョン
 * @property {string} CONFIG.GOOGLE_API_CALENDAR_LIST - Google Calendar APIのカレンダーリストエンドポイント
 * @property {string} CONFIG.GOOGLE_API_EVENTS - Google Calendar APIのイベントエンドポイント
 * @property {string} CONFIG.GOOGLE_API_CALENDAR_ID - Google Calendar APIのカレンダーID
 * @property {string} CONFIG.GOOGLE_API_EVENT_ID - Google Calendar APIのイベントID
 * @property {string} CONFIG.GOOGLE_API_EVENT_START - Google Calendar APIのイベント開始日時
 * @property {string} CONFIG.GOOGLE_API_EVENT_END - Google Calendar APIのイベント終了日時
 * @property {string} CONFIG.GOOGLE_API_EVENT_TIMEZONE - Google Calendar APIのイベントタイムゾーン
 * @property {string} CONFIG.GOOGLE_API_EVENT_SINGLE_EVENTS - Google Calendar APIの単一イベントフラグ
 * @property {string} CONFIG.GOOGLE_API_EVENT_ORDER_BY - Google Calendar APIのイベント順序
 * @property {string} CONFIG.GOOGLE_API_EVENT_TIME_MIN - Google Calendar APIのイベント最小日時
 * @property {string} CONFIG.GOOGLE_API_EVENT_TIME_MAX - Google Calendar APIのイベント最大日時
 * @property {string} CONFIG.GOOGLE_API_EVENT_MAX_RESULTS - Google Calendar APIの最大結果数
 * @property {string} CONFIG.GOOGLE_API_EVENT_PAGE_TOKEN - Google Calendar APIのページトークン
 * @property {string} CONFIG.GOOGLE_API_EVENT_FIELDS - Google Calendar APIのイベントフィールド
 * @property {string} CONFIG.GOOGLE_API_EVENT_PAGE_SIZE - Google Calendar APIのページサイズ
 * @property {string} CONFIG.GOOGLE_API_EVENT_TIMEZONE - Google Calendar APIのイベントタイムゾーン
 * @property {string} CONFIG.GOOGLE_API_EVENT_SHOW_HIDDEN - Google Calendar APIの非表示イベントフラグ
 * @property {string} CONFIG.GOOGLE_API_EVENT_SHOW_DELETED - Google Calendar APIの削除済みイベントフラグ
 */
createApp({
    /**
     * Vue.jsコンポーネントのセットアップ関数です。
     * この関数は、コンポーネントの状態を初期化し、必要なデータやメソッドを定義します。
     * @returns {void}
     * @description
     * この関数は、Vue.jsのコンポーネントのライフサイクルにおいて、
     * コンポーネントがマウントされる前に実行されます。
     * ここでは、コンポーネントの状態を管理するためのリアクティブな変数を定義し、
     * 必要なメソッドを初期化します。
     * また、日付範囲のキャッシュを管理するためのMapオブジェクトを使用し、
     * 日付範囲の計算やキャッシュのクリアを行います。
     * この関数は、Vue.jsのComposition APIを使用しており、
     * リアクティブなデータを定義するために`ref`を使用しています。
     * また、日付範囲の計算を行うために`computed`を使用し、
     * キャッシュの管理を行います。
     * この関数は、Vue.jsのコンポーネントの初期化時に実行され、
     * コンポーネントの状態を設定します。
     * @typedef {Object} CalendarEvent
     * @property {string} id
     * @property {string} summary
     * @property {boolean} allDay
     * @property {string} time
     * @property {string} startTime
     * @property {string} endTime
     * @typedef {Object} ErrorState
     * @property {'SESSION_EXPIRED'|'LOAD_ERROR'|'API_ERROR'} type
     * @property {string} message
     * @property {string} timestamp
     */
    setup() {
        const user = ref(null);
        const tokenClient = ref(null);
        const accessToken = ref(null);
        const startDate = ref(new Date().toISOString().split("T")[0]);
        const calendars = ref([]);
        const visibleCalendars = ref([]);
        const eventsByDate = ref({});
        const days = ref(8);
        const error = ref(null);
        const loading = ref(false);

        /**
         * 開始日を設定します。
         * @param {string} date - 日付文字列 (YYYY-MM-DD)
         */
        function setStartDate(date) {
            startDate.value = date;
            loadEvents();
        }

        // キャッシュをcomputedの外で定義
        const dateRangeCache = new Map();

        /**
         * 日付範囲を計算します。
         * @returns {Array} 日付の配列 (YYYY-MM-DD形式)
         */
        const dateRange = computed(() => {
            // キャッシュのキーを生成
            const key = `${startDate.value}-${days.value}`;

            // キャッシュチェック
            if (dateRangeCache.has(key)) {
                // キャッシュにデータがあれば、それを返す
                console.log('Cache hit for dateRange:', key);
                return dateRangeCache.get(key);
            }
            console.log('Cache miss for dateRange:', key);

            // 新しい日付配列を生成
            const dates = Array.from({ length: days.value }, (_, i) => {
                const d = new Date(startDate.value);
                d.setDate(d.getDate() + i);
                return d.toISOString().split("T")[0];
            });

            // 生成した日付配列をキャッシュに保存
            dateRangeCache.set(key, dates);
            console.log('Cache updated for dateRange:', key);
            return dates;
        });

        /**
         * キャッシュをクリアします。
         * これにより、日付範囲のキャッシュがリセットされます。
         * @returns {void}
         */
        function clearDateRangeCache() {
            console.log('Clearing dateRange cache');
            const oldSize = dateRangeCache.size;
            dateRangeCache.clear();
            console.log(`Cleared ${oldSize} cache entries`);
        }

        // 状態変更のトラッキング
        const debugWatch = {
            startDate: (val) => console.log('startDate changed:', val),
            visibleCalendars: (val) => console.log('visibleCalendars changed:', val?.length),
            loading: (val) => console.log('loading changed:', val),
            eventsByDate: (val) => console.log('eventsByDate changed:', Object.keys(val).length)
        };

        /**
         * デバッグ用のウォッチャーを設定します。
         * これにより、特定の状態の変更を監視し、
         * 変更があった場合にログを出力します。
         * @returns {void}
         * @description
         * この関数は、特定の状態（startDate、visibleCalendars、loading、eventsByDateなど）の変更を監視します。
         * 変更があった場合、対応するコールバック関数が呼び出され、
         * 変更内容がコンソールにログ出力されます。
         * これにより、アプリケーションの状態の変化を追跡しやすくなります。
         * @example
         * // デバッグウォッチャーの例
         * debugWatch.startDate = (val) => console.log('startDate changed:', val);
         * debugWatch.visibleCalendars = (val) => console.log('visibleCalendars changed:', val?.length);
         * debugWatch.loading = (val) => console.log('loading changed:', val);
         * debugWatch.eventsByDate = (val) => console.log('eventsByDate changed:', Object.keys(val).length);
         * * // ウォッチャーの初期化
         * Object.entries(debugWatch).forEach(([key, callback]) => {
         *   watch(() => eval(key).value, callback, { deep: true });
         * });
         */
        Object.entries(debugWatch).forEach(([key, callback]) => {
            watch(() => eval(key).value, callback, { deep: true });
        });

        const watchDeps = {
            // 日付範囲の変更監視（キャッシュクリア）
            dateRange: () => {
                /**
                 * 日付範囲が変更されたときにキャッシュをクリアします。
                 * これにより、日付範囲が変更された場合にキャッシュがリセットされ、
                 * 新しい日付範囲に基づいてイベントが再ロードされます。
                 * これにより、ユーザーが開始日や表示カレンダーを変更したときに、
                 * 最新のイベントが表示されるようになります。
                 * @returns {void}
                 */
                watch([startDate, days], () => {
                    clearDateRangeCache();
                }, { flush: 'post' });  // flush: 'post'を追加してDOMの更新後に実行
            },
            // イベントの再読み込み
            event: () => {
                /**
                 * 日付範囲の変更を監視し、イベントを再ロードします。
                 * これにより、開始日や表示カレンダーが変更されたときにイベントが更新されます。
                 */
                /* 処理重複確認
                let isLoading = false;  // ローディング状態を追跡
                watch([startDate, visibleCalendars], async () => {
                    if (accessToken.value && !isLoading) {
                        try {
                            isLoading = true;
                            await loadEvents();
                        } finally {
                            isLoading = false;
                        }
                    }
                }, {
                    deep: true,  // ネストされた変更も検知
                    flush: 'post' // DOM更新後に実行
                });
                */
            }
        };

        // watchの初期化
        //Object.values(watchDeps).forEach(init => init());

        /**
         * eventsByDateの変更を監視します。
         * これにより、イベントの変更があった場合にログを出力します。
         * 例えば、日付ごとのイベント数やサンプルイベントの確認などを行います。
         */
        const watchConfig = {
            eventsByDate: (newValue) => ({
                dates: Object.keys(newValue).length,
                totalEvents: Object.values(newValue).flat().length
            }),
            accessToken: (newValue) => newValue ? 'exists' : 'null',
            user: (newValue) => newValue?.email || 'null',
            calendars: (newValue) => newValue.length,
            visibleCalendars: (newValue) => newValue.length
        };
        // watch関数の重複を解消
        Object.entries(watchConfig).forEach(([key, formatter]) => {
            watch([key], (newValue) => {
                console.log(`${key} changed:`, formatter(newValue));
            });
        });

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const tomorrow = (new Date(now.getDate() + 1)).toISOString().split('T')[0];
        /**
        * サンプルイベントデータを定義します。
        * これらのイベントは、Google Calendar APIからのデータが取得できない場合や、
        * ユーザーがまだログインしていない場合に使用されます。
        * サンプルイベントは、異なる日付形式（終日イベント、時間付きイベント、年を跨ぐイベントなど）を含んでいます。
        * これにより、アプリケーションがさまざまなイベント形式に対応できることを確認できます。
        * これらのサンプルイベントは、アプリケーションの初期化時に表示され、ユーザーがログインしていない場合やAPIからのデータが取得できない場合に使用されます。
        * これにより、アプリケーションの動作をテストすることができます。
        * @type {Array}
        * @property {string} id - イベントのID
        * @property {string} summary - イベントのタイトル
        * @property {Object} start - イベントの開始日時
        * @property {Object} end - イベントの終了日時
        * @property {string} start.dateTime - 開始日時（時間付きイベント）
        * @property {string} end.dateTime - 終了日時（時間付きイベント）
        * @property {string} start.date - 開始日（終日イベント）
        * @property {string} end.date - 終了日（終日イベント）
        * @example
        * // サンプルイベントの例
        * const sampleEvents = [
        *     {
        *         id: "sample-1",
        *         summary: "サンプル会議",
        *         start: { dateTime: "2025-06-07T10:00:00+09:00" },
        *         end: { dateTime: "2025-06-07T11:00:00+09:00" },
        *     },
        *     {
        *         id: "sample-2",
        *         summary: "終日サンプルイベント",
        *        start: { date: "2025-06-08" },
        *        end: { date: "2025-06-09" },
        *   },
        *    {
        *        id: "sample-3",
        *       summary: "年跨ぎ",
        *   
        *     start: { dateTime: "2025-12-31T23:00:00+09:00" },
        *       end: { dateTime: "2026-01-01T01:00:00+09:00" },
        *   },
        * ];
        */
        const sampleEvents = [
            {
                id: "sample-1",
                summary: "サンプル会議",
                start: { dateTime: `${today}T15:00:00+09:00` },
                end: { dateTime: `${today}T17:00:00+09:00` },
            },
            {
                id: "sample-2",
                summary: "終日サンプルイベント",
                start: { date: tomorrow },
                end: { date: tomorrow },
            },
            {
                id: "sample-3",
                summary: "年跨ぎ",
                start: { dateTime: "2025-12-31T23:00:00+09:00" },
                end: { dateTime: "2026-01-01T01:00:00+09:00" },
            },
            {
                id: "sample-4",
                summary: "複数日の終日イベント",
                start: { date: today },
                end: { date: tomorrow },
            }
        ];

        /**
         * イベントを日付ごとにパースして、オブジェクトに変換します。
         * @param {Array} events - Google Calendar APIから取得したイベントの配列
         * @returns {Object} 日付をキーとするイベントのオブジェクト
         */
        function parseEvent(events) {
            if (!events || !Array.isArray(events)) {
                console.warn('Invalid events data:', events);
                return {};
            }

            const parsed = {};
            // イベントの日付を現在の日付に基づいて調整
            events.forEach(event => {
                // 年跨ぎイベントの処理
                let startDate = event.start.date || event.start.dateTime.split('T')[0];
                let endDate = event.end.date || event.end.dateTime.split('T')[0];

                if (!startDate || !endDate) {
                    console.warn('Invalid event dates:', event);
                    return;
                }
                const endDateObj = new Date(endDate);

                // 終日イベントの場合、終了日を1日前に調整（Google Calendarの仕様）
                if (event.start.date) {
                    endDateObj.setDate(endDateObj.getDate() - 1);
                    endDate = endDateObj.toISOString().split('T')[0];
                }

                let currentDate = new Date(startDate);
                // 日付範囲内の各日にイベントを追加
                while (currentDate <= endDateObj) {
                    const dateKey = currentDate.toISOString().split('T')[0];
                    if (!parsed[dateKey]) parsed[dateKey] = [];

                    parsed[dateKey].push({
                        id: event.id,
                        summary: event.summary,
                        allDay: !!event.start.date,
                        time: event.start.dateTime ? event.start.dateTime.split('T')[1].slice(0, 5) : "00:00",
                        startTime: event.start.dateTime ? event.start.dateTime.split('T')[1].slice(0, 5) : "00:00",
                        endTime: event.end.dateTime ? event.end.dateTime.split('T')[1].slice(0, 5) : "23:59",
                        isMultiDay: startDate !== endDate
                    });

                    currentDate.setDate(currentDate.getDate() + 1);
                }
            });

            console.log('Parsed events:', parsed);
            return parsed;
        }

        // イベントの重複チェックを効率化
        const processedEvents = new Map();

        /**
         * イベントキャッシュをクリアします。
         * これにより、重複イベントのチェックがリセットされます。
         * @returns {void}
         * @description
         * イベントキャッシュは、イベントの重複を防ぐために使用されます。
         * キャッシュをクリアすることで、次回のイベント読み込み時に
         * 新しいイベントを正しく処理できるようになります。
         * これにより、同じイベントが複数回追加されることを防ぎます。
         */
        function clearEventProcessingCache() {
            processedEvents.clear();
        }

        /**
         * イベントを処理して、日付ごとに整理します。
         * @param {Object} item - Google Calendar APIからのイベントオブジェクト
         * @returns {Object} 日付キーとイベントオブジェクトを含むオブジェクト
         */
        function processEvent(item) {
            if (processedEvents.has(item.id)) {
                return processedEvents.get(item.id);
            }

            const isAllDay = !!item.start.date;
            const dateKey = isAllDay ? item.start.date : item.start.dateTime.split("T")[0];

            // 既に同じイベントが存在するかチェック
            if (eventsByDate.value[dateKey]?.some(event => event.id === item.id)) {
                return null;
            }

            const start = isAllDay ? "00:00" : item.start.dateTime.split("T")[1].slice(0, 5);
            const end = isAllDay ? "23:59" : item.end.dateTime.split("T")[1].slice(0, 5);

            const result = {
                dateKey,
                event: {
                    id: item.id,
                    summary: item.summary,
                    allDay: isAllDay,
                    time: start,
                    startTime: start,
                    endTime: end
                }
            };
            processedEvents.set(item.id, result);
            return result;
        };

        /**
         * Base64 URLエンコードされた文字列をデコードします。
         * @param {string} str - Base64 URLエンコードされた文字列
         * @returns {string} デコードされた文字列
         * @description
         * この関数は、Base64 URLエンコードされた文字列をデコードします。
         * URLエンコードされた文字列は、通常のBase64エンコードとは異なり、
         * `-`と`_`を使用しているため、これらを標準のBase64文字に置き換えます。
         * また、Base64エンコードではパディングが必要な場合があるため、
         * パディング文字`=`を追加してからデコードします。
         * この関数は、JWTトークンのペイロードをデコードするために使用されます。
         * @example
         * // Base64 URLエンコードされた文字列をデコードする例
         * const decoded = base64UrlDecode("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
         * console.log(decoded); // 出力: {"alg":"HS256","typ":"JWT"}
         */
        function base64UrlDecode(str) {
            /*
            // Replace non-url compatible chars with base64 standard chars
            str = str.replace(/-/g, '+').replace(/_/g, '/');
            // Add padding if it's missing
            while (str.length % 4 !== 0) {
                str += '=';
            }
            */
            return atob(str);
        }

        /**
         * JWTトークンをパースして、ペイロードを取得します。
         * @param {string} token - JWTトークン
         * @returns {Object} パースされたペイロード
         */
        function parseJwt(token) {
            // Get the payload part
            const base64Url = token.split('.')[1];
            console.log({ base64Url });
            // Use the new decode function
            /*
            const base64 = base64UrlDecode(base64Url);
            console.log({ base64 });
            const jsonPayload = decodeURIComponent(base64.split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            */
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        }

        /**
         * JWTトークンをパースして、ペイロードを取得します。
         * @param {string} token - JWTトークン
         * @returns {Object} トークンのペイロード
         * @throws {Error} トークンのパースに失敗した場合
         * */
        function isTokenValid(token) {
            if (!token) return false;
            try {
                //const decoded = parseJwt(token);
                const decoded = jwt_decode(token);
                const now = Date.now() / 1000;
                // Assuming decoded has 'exp' and 'iat' properties
                return decoded.exp > now && decoded.iat < now;
            } catch (e) {
                console.error('トークンの検証に失敗しました:', e);
                return false;
            }
        }

        /**
         * 日付をフォーマットして、ラベルとして使用します。
         * @param {string|Date} date - 日付文字列またはDateオブジェクト
         * @returns {string} フォーマットされた日付ラベル
         */
        function formatDateLabel(date) {
            const d = new Date(date);
            return d.toLocaleDateString("ja-JP", { weekday: "short", month: "short", day: "numeric" });
        }

        /**
         * イベントのスタイルを計算します。
         * @param {Object} event - イベントオブジェクト
         * @returns {Object} スタイルオブジェクト
         */
        function styleForEvent(event) {
            const startHour = parseInt(event.startTime.split(":")[0]);
            const endHour = parseInt(event.endTime.split(":")[0]);
            return {
                top: `${(startHour - 0) * 30}px`,
                height: `${(endHour - startHour) * 30}px`
            };
        }

        /**
         * ログアウト処理を行います。
         * Googleアカウントの自動選択を無効化し、トークンを取り消します。
         */
        function logout() {
            google.accounts.id.disableAutoSelect();
            google.accounts.id.revoke(user.value.email, () => { });
            user.value = null;
            accessToken.value = null;
            calendars.value = [];
            visibleCalendars.value = [];
            eventsByDate.value = {};
        }

        // エラー状態をより詳細に管理
        function createErrorState(type, message, details = null) {
            return {
                type,
                message,
                timestamp: new Date().toISOString(),
                details,
                statusCode: null
            };
        }

        /**
         * カレンダーリストをロードします。
         * アクセストークンがない場合は何もしません。
         */
        async function loadCalendarList() {
            if (!accessToken.value) {
                // 未ログイン → 
                return;
            }
            loading.value = true;
            error.value = null;
            try {
                // Google Calendar APIからカレンダーリストを取得
                const responseList = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
                    headers: { Authorization: `Bearer ${accessToken.value}` },
                });
                if (!responseList.ok) {
                    if (responseList.status === 401) {
                        throw new Error('認証が無効になりました。再ログインしてください。');
                    }
                    throw new Error(`カレンダーリストの取得に失敗: ${responseList.status} ${responseList.statusText}`);
                }

                // レスポンスをJSONに変換
                console.log('Fetching calendar list...');
                const data = await responseList.json();
                if (!data.items?.length) {
                    console.warn('カレンダーリストが見つかりませんでした');
                    error.value = 'カレンダーリストが見つかりませんでした';
                    // カレンダーと表示カレンダーを空に設定
                    calendars.value = [];
                    visibleCalendars.value = [];
                    return;
                }
                calendars.value = data.items;

                // カレンダーIDの配列を設定
                visibleCalendars.value = calendars.value.map((cal) => cal.id);
                console.log('カレンダーリスト読み込み完了:', {
                    calendarsCount: calendars.value.length,
                    visibleCalendarsCount: visibleCalendars.value.length
                });
            } catch (err) {
                console.error('カレンダーリストの取得に失敗:', err);
                error.value = err.message;
                if (err.message.includes('認証')) {
                    logout();
                }
                // エラー時はカレンダーと表示カレンダーを空に設定
                accessToken.value = null;
                user.value = null;
                calendars.value = [];
                visibleCalendars.value = [];
            } finally {
                loading.value = false;
            }
            console.log('Loaded calendars:', calendars.value);
            console.log('Visible calendar IDs:', visibleCalendars.value);
        }

        /**
         * カレンダーイベントをロードします。
         * アクセストークンがない場合はサンプルイベントを表示します。
         * それ以外の場合は、Google Calendar APIからイベントを取得し、日付ごとに整理します。
         */
        async function loadEvents() {
            // 既に処理中の場合は早期リターン
            if (loading.value) {
                console.log('既にイベントをロード中です');
                return;
            }
            console.log({ calendars });

            let retryCount = 0;
            try {
                // ロード中の状態を設定
                loading.value = true;
                error.value = null;

                if (!accessToken.value) {
                    // 未ログイン → サンプルイベントを表示
                    console.log('サンプルイベントを処理します:', sampleEvents);
                    const parsedEvents = parseEvent(sampleEvents);
                    // 一括で更新して不要な再レンダリングを防ぐ
                    eventsByDate.value = { ...parsedEvents };
                    console.log('処理済みイベント:', eventsByDate.value);
                    return;
                }

                // 開始日が未設定の場合は、今日の日付を使用
                if (!startDate.value) {
                    console.warn('開始日が設定されていません');
                    startDate.value = new Date().toISOString().split("T")[0];
                }

                if (!isTokenValid(accessToken.value)) {
                    error.value = createErrorState(
                        'SESSION_EXPIRED',
                        'セッションの有効期限が切れました'
                    );
                    logout();
                    return;
                }

                const MAX_RETRIES = 3;

                while (retryCount < MAX_RETRIES) {
                    if (!visibleCalendars.value?.length) {
                        console.warn('表示するカレンダーがありません');
                        eventsByDate.value = {};
                        return;
                    }
                    console.log({ visibleCalendars: visibleCalendars.value });

                    // 開始日からの日付範囲を計算
                    const timeMin = new Date(startDate.value);
                    if (isNaN(timeMin.getTime())) {
                        throw new Error('無効な開始日です');
                    }
                    const timeMax = new Date(timeMin);
                    timeMax.setDate(timeMax.getDate() + days.value);

                    // eventsByDateを初期化
                    eventsByDate.value = dateRange.value.reduce((acc, date) => {
                        acc[date] = [];
                        return acc;
                    }, {});

                    await Promise.all(visibleCalendars.value.map(async (calendarId) => {
                        if (!calendarId) return;
                        console.log(`Fetching events for calendar: ${encodeURIComponent(calendarId)}`);
                        // Google Calendar APIからイベントを取得
                        const url = new URL('https://www.googleapis.com/calendar/v3/calendars/' +
                            encodeURIComponent(calendarId) + '/events');
                        url.searchParams.set('timeMin', timeMin.toISOString());
                        url.searchParams.set('timeMax', timeMax.toISOString());
                        url.searchParams.set('singleEvents', 'true');
                        url.searchParams.set('orderBy', 'startTime');
                        const responseEvents = await fetch(url, {
                            headers: { Authorization: `Bearer ${accessToken.value}` }
                        });

                        if (!responseEvents.ok) {
                            throw new Error(`カレンダーのイベント取得に失敗: ${responseEvents.status}`);
                        }

                        const data = await responseEvents.json();
                        if (!data.items) return;

                        // イベントの処理
                        for (const item of data.items) {
                            const processed = processEvent(item);
                            if (processed && eventsByDate.value[processed.dateKey]) {
                                eventsByDate.value[processed.dateKey].push(processed.event);
                            }
                        }
                    }));
                }

            } catch (err) {
                retryCount++;
                logger.error(`イベント読み込み失敗 (試行 ${retryCount}/${MAX_RETRIES}):`, err);
                console.error(`イベント読み込み失敗 (試行 ${retryCount}/${MAX_RETRIES}):`, err);

                if (retryCount === MAX_RETRIES) {
                    error.value = createErrorState(
                        err.message.includes('セッション') ? 'SESSION_EXPIRED' : 'LOAD_ERROR',
                        err.message,
                        `最大リトライ回数(${MAX_RETRIES})に達しました`
                    );

                    if (error.value.type === 'SESSION_EXPIRED') {
                        logout();
                        return;  // ログアウト後は再試行しない
                    }

                    eventsByDate.value = {}; // エラー時はイベントをクリア
                    accessToken.value = null; // アクセストークンをクリア
                    user.value = null; // ユーザー情報をクリア
                    calendars.value = [];
                    visibleCalendars.value = [];
                    throw err;
                }

                // エクスポネンシャルバックオフを使用
                await new Promise(resolve =>
                    // 再試行前に待機
                    setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 10000))
                );
            } finally {
                loading.value = false;
            }
            console.log({ calendars });
            console.log({ eventsByDate });
        }

        // 定期的なキャッシュクリア
        const CACHE_CLEANUP_INTERVAL = 1000 * 60 * 60; // 1時間

        // キャッシュクリーンアップのインターバル
        /**
         * コンポーネントのアンマウント時に定期的なキャッシュクリアを停止します。
         * これにより、定期的なキャッシュクリアが停止され、
         * メモリリークを防ぎます。
         * @returns {void}
         * @description
         * 定期的なキャッシュクリアは、アプリケーションのパフォーマンスを向上させるために、
         * 一定時間ごとにキャッシュをクリアするために使用されます。
         * しかし、コンポーネントがアンマウントされると、
         * 定期的なキャッシュクリアは不要になるため、
         * clearIntervalを使用して停止します。
         * これにより、メモリリークを防ぎ、アプリケーションのパフォーマンスを維持します。
         * @example
         * // コンポーネントのアンマウント時に定期的なキャッシュクリアを停止します。
         * onUnmounted(() => {
         *     clearInterval(cleanup);
         * });
         * @see https://vuejs.org/api/composition-api.html#onUnmounted
         * @see https://developer.mozilla.org/ja/docs/Web/API/Window/clearInterval
         * @see https://developer.mozilla.org/ja/docs/Web/API/Window/setInterval
         * @see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/clearInterval
         * @see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/setInterval
         * @see https://developer.mozilla.org/ja/docs/Web/API/Window/clearTimeout
         * @see https://developer.mozilla.org/ja/docs/Web/API/Window/setTimeout
         * @see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/clearTimeout
         * @see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/setTimeout
         * @see https://developer.mozilla.org/ja/docs/Web/API/WindowTimers/clearInterval
         * @see https://developer.mozilla.org/ja/docs/Web/API/WindowTimers/setInterval
         * @see https://developer.mozilla.org/ja/docs/Web/API/WindowTimers/clearTimeout
         * @see https://developer.mozilla.org/ja/docs/Web/API/WindowTimers/setTimeout
         */
        const cleanup = setInterval(clearDateRangeCache, CACHE_CLEANUP_INTERVAL);

        // クリーンアップ関数の配列を定義
        const cleanupFunctions = [];

        // コンポーネントのアンマウント時にすべてのクリーンアップを実行
        onUnmounted(() => {
            // 一括クリーンアップ
            cleanupFunctions.forEach(cleanup => {
                try {
                    cleanup();
                } catch (error) {
                    console.error('Cleanup error:', error);
                }
            });
        });

        /**
         * コンポーネントのマウント時にGoogle Sign-Inを初期化します。
         * GoogleアカウントのIDを取得し、トークンをリクエストします。
         */
        onMounted(() => {
            // watchの初期化
            Object.values(watchDeps).forEach(init => init());

            // トークンクライアントを最初に初期化
            tokenClient.value = google.accounts.oauth2.initTokenClient({
                client_id: CONFIG.GOOGLE_CLIENT_ID,
                scope: "https://www.googleapis.com/auth/calendar.readonly",
                callback: async (responseToken) => {
                    try {
                        accessToken.value = responseToken.access_token;
                        if (!accessToken.value) {
                            throw new Error('アクセストークンが取得できませんでした');
                        }
                        if (!isTokenValid(accessToken.value)) {
                            console.warn('トークンが期限切れです。再ログインが必要です。');
                            return;
                        }
                        console.log('Access Token:', accessToken.value);
                        // トークンが取得できたら、カレンダーリストとイベントをロード
                        console.log('User info:', user.value);
                        // ロード中の状態を設定
                        loading.value = true;
                        await loadCalendarList();
                        await loadEvents();
                    } catch (error) {
                        console.error('トークン処理エラー:', error);
                        error.value = 'カレンダーの読み込みに失敗しました';
                        accessToken.value = null;
                    } finally {
                        loading.value = false;
                    }
                },
            });

            // Google Sign-Inの初期化
            google.accounts.id.initialize({
                client_id: CONFIG.GOOGLE_CLIENT_ID,
                callback: async (responseId) => {
                    try {
                        //const decoded = parseJwt(responseId.credential);
                        const decoded = jwt_decode(responseId.credential);
                        user.value = { name: decoded.name, email: decoded.email };
                        await tokenClient.value.requestAccessToken({ prompt: '' });
                    } catch (error) {
                        console.error('Google Sign-Inの初期化に失敗:', error);
                        error.value = 'Google Sign-Inの初期化に失敗しました。';
                        return;

                    }
                },
                auto_select: true,
                cancel_on_tap_outside: false,
                login_uri: window.location.href,
                ux_mode: 'popup',
                context: 'signin',
                prompt_parent_id: 'g_id_signin',
                itp_support: 'optional',
                native_callback: true,
                // セキュリティ設定の強化
                nonce: crypto.randomUUID(),  // ランダムなnonceを生成
                state: crypto.randomUUID(),  // ランダムなstateを生成
            });
            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    console.warn('Google Sign-Inのポップアップが表示されませんでした。');
                }
            });

            // クリーンアップ関数を配列に追加
            cleanupFunctions.push(
                () => google.accounts.id.cancel(),
                () => clearInterval(cleanup),
                () => clearDateRangeCache(),
                () => clearEventCache(),
                () => clearEventProcessingCache(),
                () => {
                    // 状態のリセット
                    user.value = null;
                    accessToken.value = null;
                    calendars.value = [];
                    visibleCalendars.value = [];
                    eventsByDate.value = {};
                }
            );

            // Google Sign-Inボタンのレンダリング
            google.accounts.id.renderButton(document.getElementById("g_id_signin"), {
                theme: "outline",
                size: "large",
            });
            console.log('Google Sign-Inボタンをレンダリングしました。');
            // 初回のみ実行されるように条件を追加
            if (!eventsByDate.value || Object.keys(eventsByDate.value).length === 0) {
                console.log('初回読み込み: サンプルデータを表示');
                loadEvents(); // サンプルデータを表示
            }
        });

        return {
            // 状態
            user,
            startDate,
            eventsByDate,
            calendars,
            visibleCalendars,
            error,
            loading,
            days,

            // サンプルイベント
            sampleEvents,

            // リアクティブな値
            accessToken,
            tokenClient,

            // リアクティブな計算プロパティ
            dateRange,

            // リアクティブな関数
            setStartDate,
            loadEvents,
            logout,

            // その他の関数
            styleForEvent,
            formatDateLabel,
        };
    }
}).mount("#app");
