const {
  Client,
  Partials,
  GatewayIntentBits,
  ActivityType,
  PresenceUpdateStatus,
  Collection,
  ApplicationCommandType,
  Options,
  WebhookClient,
  LimitedCollection,
} = require("discord.js");
const Logger = require("../helpers/logger");
const Manager = require("./musicClient");
const index = require("../index");
const Utils = require("../helpers/utils");
const path = require("path");
const { Api } = require("@top-gg/sdk");
const GuildModel = require("@models/settings");
const FixedSizeMap = require("fixedsize-map");
const fetch = require("node-fetch");
const { formatOpenURL, parse } = require("spotify-uri");
require("dotenv").config();

const {
  DefaultWebSocketManagerOptions: { identifyProperties },
} = require("@discordjs/ws");
identifyProperties.browser = "Discord Android";

require("dotenv").config();
class DiscordBot extends Client {
  constructor(options) {
    super({
      shards: options.shards,
      shardCount: options.shardCount,
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
          interval: 600,
          filter: () => (member) => !(member.id === member.client.user?.id),
        },
      },

  rest: {
  api: "http://161.97.131.208:10231/api",
  globalRequestsPerSecond: 50,
  invalidRequestWarningInterval: 30,
  timeout: 3_000,
  handlerSweepInterval: 5_000,
  offset: 1_000,
  hashSweepInterval: 15_000
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
    });
    //  this.cluster = new ClusterClient(this);
    this.topgg = new Api(process.env.TOPGG_AUTHKEY, this);
    this.setMaxListeners(25);
    require("events").defaultMaxListeners = 25;
    this.commands = [];
    this.commandIndex = new Collection();
    this.slashCommands = new Collection();
    this.cooldownCache = new Collection();
    this.config = require("../config");
    this.emoji = require("../helpers/emojis")[this.config.BOT_EMOJI];
    this.botcolor = require("../helpers/emojis")[this.config.BOT_EMOJI].hex;
    this.twofoursevenModel = require("../models/indexes").twofourseven[this.config.BOT_EMOJI];
    this.queueModel = require("../models/indexes").queues[this.config.BOT_EMOJI];
    this.botinvite = this.config.INVITE[this.config.BOT_EMOJI];
    this.logger = Logger;
    this.databaseCache = {};
    this.databaseCache.guilds = new FixedSizeMap(50);
    this.manager = Manager(this);
    this.utils = Utils;
    this.index = index(this);
  }

  async searchTrack(query, options, player) {
    let res;
    let regex = /^https:\/\/spotify\.link\/.*$/;
    if (regex.test(query)) query = await fetch(query).then((x) => x.url);
    if (query.includes("open.spotify.com")) {
      // console.log('test | spotify got it');
      const spTracks = await this.sp.getDetails(query).catch((e) => e);

      if (spTracks?.tracks?.length < 90 && player) {
        if (spTracks.preview.type !== "track") {
          const tracks = [];
          const res = await spTracks.tracks.forEach(async (x) => {
            let parsed = parse(x.uri);
            const track = player.LavalinkManager.utils.buildUnresolvedTrack(
              {
                uri: await formatOpenURL(x.uri),
                artworkUrl: spTracks.preview.image,
                author: x.artist,
                title: x.name,
                identifier: parsed.id,
              },
              options?.requester
            );
            tracks.push(track);
          });

          return {
            loadType: "playlist",
            exception: null,
            pluginInfo: {},
            playlist: {
              title: spTracks.preview.title,
              author: spTracks.preview.description,
              thumbnail: spTracks.preview.image,
              uri: spTracks.preview.link,
            },
            tracks: tracks,
          };
        }
      }
    }
    let pattern = /^(spotify:|https:\/\/[a-z]+\.spotify\.com\/)(?:embed)?\/?(track)(?::|\/)([a-zA-Z0-9]+)/;
    if (pattern.test(query) && player) {
      let res = await this.sp.getPreview(query);
      let parsed = parse(query);
      return {
        loadType: "track",
        exception: null,
        pluginInfo: {},
        playlist: null,
        tracks: [
          player.LavalinkManager.utils.buildUnresolvedTrack(
            {
              uri: res.link,
              artworkUrl: res.image,
              author: res.artist,
              title: res.title,
              identifier: parsed.id,
            },
            options?.requester
          ),
        ],
      };
    }

    if (!player) {
      try {
        res = await this.manager.nodeManager.nodes
          .get(this.config.AUDIO_NODES[0].id)
          .search({ query: query, source: options?.engine || "ytm" }, options?.requester);
        return res;
      } catch (e) {}
    }
    res = await player.search({ query: query, source: options?.engine || "ytm" }, options?.requester);

    if (!res.tracks.length)
      res = await player.search({ query: query, source: options?.engine || "ytm" }, options?.requester);
    return res;
  }

  async loadEvents(directory) {
    //if (this.shard.clusterId === 0) this.logger.debug(`Loading events...`);
    let success = 0;
    let failed = 0;
    this.utils.recursiveReadDirSync(directory).forEach((filePath) => {
      const file = path.basename(filePath);
      try {
        const eventName = path.basename(file, ".js");
        const event = require(filePath);
        this.on(eventName, event.bind(null, this));
        delete require.cache[require.resolve(filePath)];
        success += 1;
      } catch (ex) {
        failed += 1;
        this.logger.error(`loadEvent - ${file}`, ex);
      }
    });
    // if (this.shard.clusterId === 0) this.logger.debug(`Loaded ${success + failed} events. Success (${success}) Failed (${failed})`.america);
  }

  loadCommand(cmd) {
    // Prefix Command
    if (cmd.command?.enabled) {
      const index = this.commands.length;
      if (this.commandIndex.has(cmd.name)) {
        throw new Error(`Command ${cmd.name} already registered`);
      }
      if (Array.isArray(cmd.command.aliases)) {
        cmd.command.aliases.forEach((alias) => {
          if (this.commandIndex.has(alias)) throw new Error(`Alias ${alias} already in use`);
          this.commandIndex.set(alias.toLowerCase(), index);
        });
      }
      this.commandIndex.set(cmd.name.toLowerCase(), index);
      this.commands.push(cmd);
    }

    // Slash Command
    if (cmd.slashCommand?.enabled) {
      this.slashCommands.set(cmd.name, cmd);
    }
  }

  loadCommands(directory) {
    // if (this.shard.id === 0) this.logger.debug(`Loading commands...`.america);
    const files = this.utils.recursiveReadDirSync(directory);
    for (const file of files) {
      try {
        const cmd = require(file);
        if (typeof cmd !== "object") continue;
        this.utils.validateCommand(cmd);
        this.loadCommand(cmd);
      } catch (ex) {
        this.logger.error(`Failed to load ${file} Reason: ${ex.message}`);
      }
    }
    // if (this.shard.clusterId === 0) this.logger.debug(`Loaded ${this.commands.length} commands`.america);
    // if (this.shard.clusterId === 0) this.logger.debug(`Loaded ${this.slashCommands.size} slash commands`.america);
  }
  async registerInteractions() {
    const toRegister = [];

    // filter slash commands
    this.slashCommands
      .map((cmd) => ({
        name: cmd.name,
        description: cmd.description,
        type: ApplicationCommandType.ChatInput,
        options: cmd.slashCommand.options,
      }))
      .forEach((s) => toRegister.push(s));

    await this.application.commands.set(toRegister).catch((e) => this.logger.error(e));
    // if (this.shard.clusterId === 0) this.logger.log("Successfully registered interactions");
  }

  getCommand(invoke) {
    const index = this.commandIndex.get(invoke.toLowerCase());
    return index !== undefined ? this.commands[index] : undefined;
  }

  async getGuildData(guild) {
    if (!guild) throw new Error("Guild is undefined");
    if (!guild.id) throw new Error("Guild Id is undefined");

    const cached = this.databaseCache.guilds.get(guild.id);
    if (cached) return cached;

    let guildData = await GuildModel.findOne({ guild: guild.id });
    if (!guildData) {
      guildData = new GuildModel({ guild: guild.id });
      await guildData.save();
    }
    this.databaseCache.guilds.add(guild.id, guildData);
    return guildData;
  }

  async login() {
    return super.login(process.env.BOT_TOKEN);
  }
}

module.exports = DiscordBot;
