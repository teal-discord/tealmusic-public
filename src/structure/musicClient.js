const ascii = require("ascii-table");
const ptable = new ascii("Player Events");
const { readdirSync } = require("fs");
const colors = require("colors");
const { LavalinkManager } = require("lavalink-client");
const myCustomStore = require("./utils/CustomClasses");
module.exports = (client) => {
  const Manager = new LavalinkManager({
    nodes: client.config.AUDIO_NODES,
    autoSkip: true,
    client: {
      // client: client.user
      id: client.config.IDs[client.config.BOT_EMOJI], // REQUIRED! (at least after the .init)
      username: client.config.BOT_EMOJI,
    },
    playerOptions: {
      applyVolumeAsFilter: false,
      clientBasedPositionUpdateInterval: 150, // in ms to up-calc player.position
      defaultSearchPlatform: "ytmsearch",
      volumeDecrementer: 0.75, // on client 100% == on lavalink 75%
      //      requesterTransformer: requesterTransformer,
      onDisconnect: {
        autoReconnect: false, // automatically attempts a reconnect, if the bot disconnects from the voice channel, if it fails, it get's destroyed
        destroyPlayer: true, // overrides autoReconnect and directly destroys the player if the bot disconnects from the vc
      },
      useUnresolvedData: true,
    },
    sendToShard: (guildId, payload) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild) guild.shard.send(payload);
    },
    queueOptions: {
      maxPreviousTracks: 7,
    },
    debugOptions: {
      noAudio: false,
      playerDestroy: {
        dontThrowError: false,
        debugLog: false,
      },
    },
  });

  Manager.nodeManager
    .on("raw", (node, payload) => {
      // console.log(node.id, " :: RAW :: ", payload);
    })
    .on("disconnect", (node, reason) => {
      client.logger.error(`[LAVALINK NODE] | ${node.id}: Disconnected, ${reason}`);
    })
    .on("connect", (node) => {
      client.logger.log(`Lavalink ${node.id}: Connected!`.cyan);
    })
    .on("reconnecting", (node) => {
      client.logger.log(`Lavalink ${node.id}: Reconnecting!`.green);
    })
    .on("create", (node) => {
      client.logger.log(`Lavalink ${node.id}: Created!`.green);
    })
    .on("destroy", (node) => {
      client.logger.log(`Lavalink ${node.id}: DESTROYED`.red);
    })
    .on("error", (node, error, payload) => {
      client.logger.error(`[LAVALINK NODE] | ${node.id}: Error Caught, ${error} :: payload: ${payload}`);
    });

  ptable.setHeading("Events", "Load status");
  readdirSync(`${process.cwd()}/src/events/music/`).forEach((file) => {
    const event = require(`${process.cwd()}/src/events/music/${file}`);
    let eventName = file.split(".")[0];
    Manager.on(event.name, (...args) => event.execute(client, ...args));
    ptable.addRow(eventName, "Ready");
  });
  //  if (client.shard.id == 0) console.log(`${ptable.toString()}`.cyan.bold);

  return Manager;
};
