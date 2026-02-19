module.exports = async function (context, req) {
    context.res = {
        headers: {
            'Access-Control-Allow-Origin': "*",
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        // status: 200, /* Defaults to 200 */
        body: { "data": "Hello World from Azure Static Web Apps API!" }
    };
};