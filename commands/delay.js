module.exports = {
    name: "delay",
    ping: true,
    description: "Test the delay of commands",
    permission: 2000,
    execute: async (channel, user, input, perm) => {
        try {
            if (this.permission > perm) {
                return;
            }
            const commands = requireDir("./commands");

            if (typeof commands[input[2]] === "undefined") {
                console.log("undefined");
                return;
            }

            let result = await commands[input[2]].execute(channel, user, input, perm);


            if (!result) {
                return;
            }

            return result;

        } catch (err) {
            console.log(err);
            return ` Error FeelsBadMan `;
        }
    }
}