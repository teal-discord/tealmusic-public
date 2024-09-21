const {
  Partials,
  GatewayIntentBits,
  ActivityType,
  PresenceUpdateStatus,
  Collection,
  Options,
  LimitedCollection,
} = require("discord.js");
const { Indomitable } = require("indomitable");
require("dotenv").config();
require("module-alias/register");
require("./src/index");

const TealClient = require("./src/structure/client");

const customClientOptions = {
  partials: [Partials.User, Partials.Message, Partials.Reaction],
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
  presence: {
    activities: [{ name: `Booting up`, type: ActivityType.Playing }],
    status: PresenceUpdateStatus.DoNotDisturb,
  },
  failIfNotExists: false,
  allowedMentions: { repliedUser: false },
  sweepers: {
    ...Options.DefaultSweeperSettings,
    guildMembers: {
      interval: 1800,
      filter: () => (member) => !(member.id === member.client.user?.id),
    },
  },
 
  makeCache: (manager) => {
    switch (manager.name) {
      case "GuildTextThreadManager":
      case "GuildMessageManager":
      case "GuildForumThreadManager":
      case "ReactionManager":
      case "DMMessageManager":
      case "GuildScheduledEventManager":
      case "ApplicationCommandManager":
      case "AutoModerationRuleManager":
      case "GuildApplicationCommandManager":
      case "ApplicationCommandPermissionsManager":
      case "ThreadMemberManager":
      case "BaseGuildEmojiManager":
      case "GuildEmojiManager":
      case "GuildEmojiRoleManager":
      case "GuildInviteManager":
      case "GuildStickerManager":
      case "StageInstanceManager":
      case "PresenceManager":
      case "MessageManager":
      case "GuildBanManager":
      case "ThreadManager":
      case "ReactionUserManager":
        return new LimitedCollection({ maxSize: 0 });
      case "GuildMemberManager":
        return new LimitedCollection({
          maxSize: 20000,
          keepOverLimit: (member) => member.id === member.client.user.id,
        });
      case "UserManager":
        return new LimitedCollection({
          maxSize: 0,
          keepOverLimit: (user) => user.id === user.client.user.id,
        });
      default:
        return new Collection();
    }
  },
};

const sharderOptions = {
  clientOptions: { ...customClientOptions },
  client: TealClient,
  autoRestart: true,
  token: process.env.BOT_TOKEN,
  clusterCount: 9,
  shardCount: 144,
  clusterSettings: { execArgv: ["--enable-source-maps"] },
  autoRestart: true,
  handleConcurrency: true,
  spawnTimeout: 60000,
  waitForReady: true,
};

const manager = new Indomitable({ ...sharderOptions }).on("error", console.error);

manager
  .on("debug", (d) => {
    if (d.includes("eval")) return;
    console.log(`[ClusterHandler] :`.blue.dim + d.blue);
  })
  .on("error", (err) => {
    console.log(`[ClusterHandler] :`.blue.dim + { err }, "Couldn't start shards");
  })
  .on("workerReady", (cluster) => {
    console.log({ worker_id: cluster.id }, "Worker ready");
  })
  .on("workerExit", (code, signal, cluster) => {
    console.log({ worker_id: cluster.id, code, signal }, "Worker exit");
  })
  .on("shardReady", (event) => {
    console.log({ worker_id: event.clusterId, shard_id: event.shardId }, "Shard ready");
  })
  .on("shardDisconnect", (event) => {
    console.log({ worker_id: event.clusterId, shard_id: event.shardId }, "Shard disconnect");
  })
  .on("shardReconnect", (event) => {
    console.log({ worker_id: event.clusterId, shard_id: event.shardId }, "Shard reconnect");
  });

manager.spawn();

/*
manager.on("workerReady", (cluster) => {
  console.log(
    `[SHARDING-MANAGER] `.america +
      `[Teal Music]: `.blue +
      `Launched Cluster #${cluster.id} | ${cluster.id + 1}/${cluster.manager.totalClusters} [${
        cluster.manager.shardsPerClusters
      }/${cluster.manager.totalShards} Shards]`.yellow
  );

  cluster.on("death", function () {
    console.log(`[Teal Music]: `.blue + `${colors.red.bold(`Cluster ${cluster.id} died..`)}`);
  });

  cluster.on("error", (e) => {
    console.log(`[Teal Music]: `.blue + `${colors.red.bold(`Cluster ${cluster.id} errored ..`)}`);
    console.error(e);
  });

  cluster.on("disconnect", function () {
    console.log(`[Teal Music]: `.blue + `${colors.red.bold(`Cluster ${cluster.id} disconnected..`)}`);
  });

  cluster.on("reconnecting", function () {
    console.log(`[Teal Music]: `.blue + `${colors.yellow.bold(`Cluster ${cluster.id} reconnecting..`)}`);
  });

  cluster.on("close", function (code) {
    console.log(`[Teal Music]: `.blue + `${colors.red.bold(`Cluster ${cluster.id} close with code ${code}`)}`);
  });

  cluster.on("exit", function (code) {
    console.log(`[Teal Music]: `.blue + `${colors.red.bold(`Cluster ${cluster.id} exited with code ${code}`)}`);
  });

  cluster.on("message", async (msg) => {
    if (msg.log) {
      console.log(`[Teal Music]: `.blue + msg.log);
    }
  });
});

manager.once("debug", (d) =>
  d.includes("[CM => Manager] [Spawning Clusters]") ? console.log(`Teal Music: `.yellow + d) : ""
);

manager.spawn({ timeout: -1, delay: 7000 }).then(() => {
  setInterval(async () => {
     await manager.broadcastEval(`this.ws.status && this.isReady() ? this.ws.reconnect() : 0`);
  }, 360000);
 }).catch((reason) => console.error("Shard spawn has occured a error", reason));
*/
