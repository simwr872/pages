window.addEventListener('load', () => {
    navigator.serviceWorker.register('./worker.js').then(
        function (registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        },
        function (err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        }
    );
});

import App from './components/App.svelte';
export default new App({ target: document.body });
