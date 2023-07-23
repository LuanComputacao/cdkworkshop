
const hello = async (event) => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: `Hello, brother! We are using CDK! You've hit ${event.path}\n`
    }
}

module.exports = {
    handler: hello
}