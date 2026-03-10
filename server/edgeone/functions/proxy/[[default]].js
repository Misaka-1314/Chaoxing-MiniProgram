const onRequest = async ({ request }) => {
    const url = new URL(request.url.replace("/proxy", ""));
    const proxyRequest = new Request(url, request);

    proxyRequest.headers.set('Host', "mobilelearn.chaoxing.com");
    proxyRequest.headers.set('Referer', "https://mobilelearn.chaoxing.com");
    proxyRequest.headers.set('Origin', "https://mobilelearn.chaoxing.com");
    proxyRequest.headers.set('User-Agent', "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3");

    const response = await fetch(proxyRequest);
    response.headers.set('Access-Control-Allow-Origin', 'https://cx.micono.eu.org');

    return response;
};

export default onRequest;