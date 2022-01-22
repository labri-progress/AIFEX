const moment = require("moment");

module.exports.sessionToGravity = function(session) {
    const traces = session.explorationList.map((exploration) => {
        return exploration.interactionList
            .filter(interaction => interaction.concreteType === "Action")
            .map((interaction) => {
                console.log(interaction, interaction.date, moment(interaction.date, 'YYYY-MM-DDT00:00:00.000Z').format("x"))
                const data = {};
                if (interaction.date !== undefined) {
                    data.timestamp = moment(interaction.date, 'YYYY-MM-DDT00:00:00.000Z').format("x")
                }
                if (interaction.value !== undefined) {
                    data.value = interaction.value
                }
                return {
                    action: interaction.kind,
                    data: data
                }
            })
    })
    return {traces}
}