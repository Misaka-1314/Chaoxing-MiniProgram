addEventListener('fetch', async event => {
    event.respondWith(await _fetch(event.request));
});

async function _fetch(request) {
    let url = new URL(request.url);
    if (url.pathname.startsWith('/proxy/')) {
        url.pathname = url.pathname.replace('/proxy', '');
        url.hostname = 'mobilelearn.chaoxing.com';

        let newRequest = new Request(url, {
            method: request.method,
            headers: request.headers,
            body: request.body,
            redirect: 'follow'
        });

        newRequest.headers.set('Host', 'mobilelearn.chaoxing.com');
        newRequest.headers.set('Referer', 'https://mobilelearn.chaoxing.com');
        newRequest.headers.set('Origin', 'https://mobilelearn.chaoxing.com');
        newRequest.headers.set('User-Agent', 'Mozilla/5.0 (iPhone Mac OS X) github.com/misaka-1314');

        return fetch(newRequest);
    } else {
        return new Response('Powered by Misaka! github.com/misaka-1314');
    }
}