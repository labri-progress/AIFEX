module.exports = {

    buildInvitation: function (modelId, sessionId) {
        return `${process.env.PROTOCOL}://${process.env.HOST_ADDR}/join?sessionId=${sessionId}&modelId=${modelId}`;
    }

};
