module.exports = async (client, id) => {
  client.logger.debug(`Shard #${id} is Disconnected`.red);
};
