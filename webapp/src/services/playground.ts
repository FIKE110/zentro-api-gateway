
export const onTest = async (method: string, url: string, headers: any, body: string | null) => {
    const requestOptions: RequestInit = {
        method: method,
        headers: new Headers(headers),
        body: body,
    };

    if (method === 'GET' || method === 'HEAD') {
        delete requestOptions.body;
    }

    const response = await fetch(url, requestOptions);
    const responseHeaders: any = {};
    response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
    });

    console.log(response)

    const responseData = await response.text();

    return {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseData,
    };
}
