import demo from './demo';
declare var process: { env: { DEMO: boolean } };
if (process.env.DEMO) demo();

import App from './components/App.svelte';
export default new App({ target: document.body });
