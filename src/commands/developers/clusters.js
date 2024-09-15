const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const prettyMs = require("pretty-ms");
const osu = require("node-os-utils");

module.exports = {
  name: "clusters",
  description: "",
  category: "OWNER",
  botPermissions: [],
  command: {
    enabled: true,
    aliases: [],
    usage: "anything",
    minArgsCount: 0,
  },
  slashCommand: {
    enabled: false,
  },
  messageRun: async (client, message, args) => {
    if (!client.config.OWNER_IDS.includes(message.author.id)) return;
    const response = await getClusterMenu(client);
    const sentMsg = await message.safeReply(response);
    return waiter(sentMsg, message.author.id, client);
  },
};

async function getClusterMenu(client) {
  // Buttons Row
  let components = [];
  components.push(
    new ButtonBuilder()
      .setCustomId("firstBtn")
      .setEmoji(client.emoji.backward)
      .setStyle(2)
      .setDisabled(false)
      .setLabel("First"),
    new ButtonBuilder()
      .setCustomId("previousBtn")
      .setEmoji(client.emoji.back)
      .setStyle(2)
      .setDisabled(false)
      .setLabel("Back"),
    new ButtonBuilder()
      .setCustomId("homeBtn")
      .setEmoji(client.emoji.home)
      .setStyle(2)
      .setDisabled(false)
      .setLabel("Home"),
    new ButtonBuilder()
      .setCustomId("nextBtn")
      .setEmoji(client.emoji.next)
      .setStyle(2)
      .setDisabled(false)
      .setLabel("Next"),
    new ButtonBuilder()
      .setCustomId("lastBtn")
      .setEmoji(client.emoji._forward)
      .setStyle(2)
      .setDisabled(false)
      .setLabel("Last")
  );

  let buttonsRow = new ActionRowBuilder().addComponents(components);

  const embed = await GetEmbeds(client).then((x) => x[0]);

  return {
    embeds: [embed],
    components: [buttonsRow],
  };
}

const waiter = async (msg, userId, client) => {
  const collector = msg.channel.createMessageComponentCollector({
    filter: (reactor) => reactor.user.id === userId && msg.id === reactor.message.id,
    idle: 360 * 1000,
    dispose: true,
    time: 5 * 60 * 1000,
  });

  let arrEmbeds = [];
  let currentPage = 0;
  let buttonsRow = msg.components[0];
  arrEmbeds = await GetEmbeds(client);

  collector.on("collect", async (response) => {
    if (!["previousBtn", "nextBtn", "firstBtn", "lastBtn", "homeBtn"].includes(response.customId)) return;
    await response.deferUpdate();
    switch (response.customId) {
      case "previousBtn":
        if (currentPage !== 0) {
          --currentPage;
          msg.editable && (await msg.edit({ embeds: [arrEmbeds[currentPage]], components: [buttonsRow] }));
        }
        break;
      case "homeBtn":
        {
          let embedMsg = await getClusterMenu(client);
          await msg.edit(embedMsg);
        }
        break;
      case "nextBtn":
        if (currentPage < arrEmbeds.length - 1) {
          currentPage++;
          msg.editable && (await msg.edit({ embeds: [arrEmbeds[currentPage]], components: [buttonsRow] }));
        }
        break;
      case "firstBtn":
        currentPage = 0;
        msg.editable && (await msg.edit({ embeds: [arrEmbeds[currentPage]], components: [buttonsRow] }));
        break;
      case "lastBtn":
        currentPage = arrEmbeds.length - 1;
        msg.editable && (await msg.edit({ embeds: [arrEmbeds[currentPage]], components: [buttonsRow] }));
        break;
    }
  });

  collector.on("end", async () => {
    if (!msg.guild || !msg.channel) return;
    let embedMsg = await getClusterMenu(client);
    return msg.editable && msg.edit({ components: [embedMsg.components[0]] });
  });
};

async function GetEmbeds(client) {
  const res = await client.shard.broadcastEval((c) => {
    let i = 0;
    c.manager.players.forEach((e) => {
      i += e.playing ?? 0;
    });
    return {
      clusterId: c.shard.clusterId,
      shardIds: c.shard.shardIds,
      totalGuilds: c.guilds.cache.size,
      totalMembers: c.guilds.cache.map((g) => g.memberCount).reduce((a, b) => a + b, 0),
      ping: c.ws.ping,
      uptime: c.uptime,
      players: c.manager.players.size,
      playing: i,
      memoryUsage: c.utils.formatBytes(process.memoryUsage().rss),
      /*
        allGuildsData: c.guilds.cache.map(guild => {
          return {
            id: guild.id, 
            name: guild.name,
            ownerId: guild.ownerId,
            memberCount: guild.memberCount, 
            channels: guild.channels.cache.map(c => {
                return { id : c.id, name: c.name } // It's important not to return the entire CLASS
            }),
          }
        }), 
        */
      perShardData: c.shard.shardIds.map((shardId) => {
        return {
          shardId: shardId,
          ping: c.ws.shards.get(shardId)?.ping,
          uptime: Date.now() - (c.ws.shards.get(shardId)?.connectedAt || 0),
          guilds: c.guilds.cache.filter((x) => x.shardId === shardId).size,
          members: c.guilds.cache
            .filter((x) => x.shardId === shardId)
            .map((g) => g.memberCount)
            .reduce((a, b) => a + b, 0),
        };
      }),
    };
  });
  const arrSplitted = [];
  const arrEmbeds = [];

  const promises = [
    client.shard
      .broadcastEval(() => process.memoryUsage().rss)
      .then((results) => results.reduce((prev, val) => prev + val, 0)),
    client.shard.broadcastEval((c) => c.guilds.cache.size),
    client.shard.broadcastEval((c) => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
  ];
  await Promise.all(promises).then(async ([ramUsage, guilds, members]) => {
    const feild = {
      name: "<:online:1172100997414387763> overAll Cluster Stats",
      value:
        `\`\`\`yaml` +
        `\nGuilds: ${guilds.reduce((acc, guildCount) => acc + guildCount, 0)}` +
        `\nMembers: ${members.reduce((acc, memberCount) => acc + memberCount, 0)}` +
        `\nmemory: ${formatBytes(ramUsage)}` +
        `\nuptime: ${prettyMs(process.uptime() ? process.uptime() : 0, { colonNotation: false })}` +
        `\n\`\`\``,
    };

    arrSplitted.push(feild);
  });

  while (res.length) {
    let toAdd = res.splice(0, res.length > 18 ? 18 : res.length);
    toAdd = toAdd.map((cluster) => {
      return {
        name: `${
          cluster.uptime < 1000 || cluster.totalMembers < 1 || cluster.guilds < 1
            ? `<:idle:1172100994897813544>`
            : `<:online:1172100997414387763>`
        } Cluster #${cluster.clusterId}${cluster.clusterId === client.shard.clusterId ? ` (Cluster this Guild)` : ``}`,
        value:
          `\`\`\`yaml` +
          `\nShards: ${cluster.shardIds}` +
          `\nGuilds: ${cluster.totalGuilds}` +
          `\nPlayers: ${cluster.players}` +
          `\nPlaying: ${cluster.playing}` +
          `\nMembers: ${cluster.totalMembers}` +
          `\nping: ${cluster.ping}` +
          `\nmemory: ${cluster.memoryUsage}` +
          `\nuptime: ${prettyMs(cluster.uptime ? cluster.uptime : 0, { colonNotation: false })}` +
          `\n\`\`\``,
        inline: true,
      };
    });
    arrSplitted.push(toAdd);
  }

  arrSplitted.forEach((item, index) => {
    const embed = new EmbedBuilder()
      .setColor(client.botcolor)
      .setAuthor({ name: `${client.user.username}`, iconURL: `${client.user.displayAvatarURL()}` })
      .addFields(item)
      .setFooter({
        text: `page ${index + 1} of ${arrSplitted.length}`,
      });
    arrEmbeds.push(embed);
  });

  return arrEmbeds;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) {
    return "0 B";
  }

  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
