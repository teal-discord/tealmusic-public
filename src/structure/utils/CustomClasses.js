const config = require("../../config");
const queueDB = require("@models/indexes").queues[config.BOT_EMOJI];
class myCustomStore {
  constructor() {}
  async get(guildId) {
    return await queueDB.findOne({ guild: guildId });
  }
  async set(guildId, stringifiedQueueData) {
    let data = await queueDB.findOne({ guild: guildId });
    if (!data) data = new queueDB({ guild: guildId });
    data.queueData = stringifiedQueueData;
    data.save();
    return data;
  }
  async delete(guildId) {
    return await queueDB.deleteOne({ guild: guildId });
  }
  async parse(stringifiedQueueData) {
    return JSON.parse(stringifiedQueueData);
  }
  async stringify(parsedQueueData) {
    return JSON.stringify(parsedQueueData);
  }
  id(guildId) {
    return `lavalinkqueue_${guildId}`;
  }
}

module.exports = myCustomStore;
