module.exports = async (client, error, shardId) => {
  client.logger.error(`shardError: ${error} | ${shardId}`);
};
