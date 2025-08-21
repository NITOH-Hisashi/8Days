const CONFIG = {
    GOOGLE_CLIENT_ID: "154186872790-h7pgkhai8fb7cs0i076n5n05dvqp9b6e.apps.googleusercontent.com"
};

const ENV = {
    development: {
        NODE_ENV: 'development',
        LOG_LEVEL: 'DEBUG'
    },
    production: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'ERROR'
    }
};

// 現在の環境に基づいて設定を選択
const currentEnv = location.hostname === 'localhost' ? 'development' : 'production';

// Vue.jsのアプリケーションで使用できるように、windowオブジェクトに追加
window.process = { env: ENV[currentEnv] };

// CONFIG をグローバルに公開
window.CONFIG = CONFIG;
