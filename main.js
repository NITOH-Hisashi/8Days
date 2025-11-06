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
    // Replace non-url compatible chars with base64 standard chars
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if it's missing
    while (str.length % 4 !== 0) {
        str += '=';
    }
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
    console.log({ base64 });
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function formatDate(date, separator = "") {
    const yyyy = date.getFullYear();
    const mm = ('00' + (date.getMonth() + 1)).slice(-2);
    const dd = ('00' + date.getDate()).slice(-2);

    return `${yyyy}${separator}${mm}${separator}${dd}`;
}

/**
 * 日付をフォーマットして、ラベルとして使用します。
 * @param {string|Date} date - 日付文字列またはDateオブジェクト
 * @returns {string} フォーマットされた日付ラベル
 */
function formatDateLabel(date) {
    const d = new Date(date);
    return d.toLocaleDateString("ja-JP", { weekday: "short", day: "numeric" });
}

/**
 * 
 * @param {*} date 
 * @returns 
 */
function formatDateKey(date) {
    return formatDate(date, "-");
}

/**
 * 日付をフォーマットして、入力フィールド用に使用します。
 * @param {*} date
 * @returns
 */
function formatDateInput(date) {
    return formatDate(date, "-");
}

/**
 * 今日の日付判定
 * @param {*} date 
 * @returns 
 */
function isToday(date) {
    const today = new Date().toISOString().split("T")[0];
    return date === today;
}

/**
 * イベントのスタイルを計算します。
 * @param {Object} event - イベントオブジェクト
 * @returns {Object} スタイルオブジェクト
 */
function styleForEvent(event) {
    const startHour = parseInt(event.startTime.split(":")[0])
        + parseInt(event.startTime.split(":")[1]) / 60;
    const endHour = parseInt(event.endTime.split(":")[0])
        + parseInt(event.endTime.split(":")[1]) / 60;
    return {
        top: `${(startHour - 0) * 20}px`,
        height: `${(endHour - startHour) * 20}px`
    };
}

/** エラー状態をより詳細に管理
 * @param {'SESSION_EXPIRED'|'LOAD_ERROR'|'API_ERROR'|'AUTH_ERROR'} type - エラーの種類
 * @param {string} message - エラーメッセージ
 * @param {string|null} details - 詳細なエラー情報（オプション）
 * @returns {Object} エラー状態オブジェクト
 */
function createErrorState(type, message, details = null) {
    return {
        type,
        message,
        timestamp: new Date().toISOString(),
        details,
        statusCode: null
    };
}

const App = {
    setup() {

        // watchの初期化
        //Object.values(watchDeps).forEach(init => init());
    }
};
