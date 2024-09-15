/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "testcmd",
  description: "something",
  category: "OWNER",
  botPermissions: [],
  command: {
    enabled: false,
    usage: "anything",
    minArgsCount: 0,
  },
  slashCommand: {
    enabled: false,
  },
  messageRun: async (client, message, args) => {},
};
