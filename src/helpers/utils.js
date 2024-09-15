const { readdirSync, lstatSync } = require("fs");
const permissions = require("./permissions");
const { join, extname } = require("path");
module.exports = class Utils {
  static parseTime(string) {
    const time = string.match(/([0-9]+[d,h,m,s])/g);
    if (!time) return 0;
    let ms = 0;
    for (const t of time) {
      const unit = t[t.length - 1];
      const amount = Number(t.slice(0, -1));
      if (unit === "d") ms += amount * 24 * 60 * 60 * 1000;
      else if (unit === "h") ms += amount * 60 * 60 * 1000;
      else if (unit === "m") ms += amount * 60 * 1000;
      else if (unit === "s") ms += amount * 1000;
    }
    return ms;
  }

  static capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  static formatBytes(bytes, decimals = 2) {
    if (bytes === 0) {
      return "0 B";
    }

    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  static async createBar(client, player) {
    let { size } = client.emoji.progress_bar;

    try {
      if (!player.queue.current)
        return `**${client.emoji.progress_bar.empty_left}${
          client.emoji.progress_bar.filledframe
        }${client.emoji.progress_bar.emptyframe.repeat(size - 1)}${
          client.emoji.progress_bar.empty_right
        }**\n**00:00:00 / 00:00:00**`;
      let current = player.queue.current.info.duration !== 0 ? player.position : player.queue.current.info.duration;
      let total = player.queue.current.info.duration;
      size -= 10;
      let rightside = size - Math.round(size * (current / total));
      let leftside = Math.round(size * (current / total));
      let bar;
      if (leftside < 1)
        bar =
          String(client.emoji.progress_bar.empty_left) +
          String(client.emoji.progress_bar.emptyframe).repeat(rightside) +
          String(client.emoji.progress_bar.empty_right);
      else
        bar =
          String(client.emoji.progress_bar.filled_left) +
          String(client.emoji.progress_bar.filledframe).repeat(leftside) +
          String(client.emoji.progress_bar.emptyframe).repeat(rightside) +
          String(
            size - rightside !== 1 ? client.emoji.progress_bar.empty_right : client.emoji.progress_bar.filled_right
          );
      return `**${bar}**\n**${
        new Date(player.position).toISOString().substr(11, 8) +
        " / " +
        (player.queue.current.info.duration == 0
          ? " ◉ LIVE"
          : new Date(player.queue.current.info.duration).toISOString().substr(11, 8))
      }**`;
    } catch (e) {
      console.log(e);
    }
  }
  static async autoplay(player, client) {
    if(!player.queue || !player.queue.previous.length) return;

    if (player.queue.previous[0].info.sourceName === "spotify") {
      const filtered = player.queue.previous.filter((v) => v.info.sourceName === "spotify").slice(0, 5);
const ids = filtered.map(
        (v) =>{ if(!v.info && !v.info.identifier ) return; else return v.info.identifier || v.info.uri.split("/")?.reverse()?.[0] || v.info.uri.split("/")?.reverse()?.[1]}
      );
      if (ids.length >= 1) {
        const res = await player
          .search(
            {
              query: `seed_tracks=${ids.join(",")}`, //`seed_artists=${artistIds.join(",")}&seed_genres=${genre.join(",")}&seed_tracks=${trackIds.join(",")}`;
              source: "sprec",
            },
            client.user
          )
          .then((response) => {
            response.tracks = response.tracks.filter(
              (v) => v.info.identifier !== player.queue.previous[0].info.identifier
            ); // remove the lastPlayed track if it's in there..
            return response;
          })
          .catch(() => {});
        if (res && res.tracks.length)
          await player.queue.add(
            res.tracks.slice(0, 4).map((track) => {
              // transform the track plugininfo so you can figure out if the track is from autoplay or not.
              track.pluginInfo.clientData = { ...(track.pluginInfo.clientData || {}), fromAutoplay: true };
              return track;
            })
          );
        await player.play();
      }
      return;
    } else {
      const searched = `https://www.youtube.com/watch?v=${player.get("autoplaytrack")}&list=RD${player.get(
        "autoplaytrack"
      )}`;
      const { tracks } = await client.searchTrack(
        searched,
        {
          requester: client.user,
        },
        player
      );
      if (!tracks.length || tracks.length === 0) return;
      await player.queue.add(tracks[Math.floor(Math.random() * Math.floor(tracks.length))]);
      return player.play().catch(() => {
        player.set("autoplay", !player.get("autoplay"));
      });
    }
  }

  /**
   * @param {string} title
   */
  static trimTitle(title) {
    const trimed = title
      .toLowerCase()
      .replace(
        /youtube|official video|video|\[official video\]|\(official video\)|4k|\[official music video\]|\(official music video\)/gi,
        ""
      )
      .slice(0, 50);
    return trimed;
  }

  /**
   * @param string
   */
  static capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  /**
   * @param {import("discord.js").PermissionResolvable[]} perms
   */
  static parsePermissions(perms) {
    const permissionWord = `permission${perms.length > 1 ? "s" : ""}`;
    return "`" + perms.map((perm) => permissions[perm]).join(", ") + "` " + permissionWord;
  }
  /**
   * Returns remaining time in days, hours, minutes and seconds
   * @param {number} timeInSeconds
   */
  static timeformat(timeInSeconds) {
    const days = Math.floor((timeInSeconds % 31536000) / 86400);
    const hours = Math.floor((timeInSeconds % 86400) / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return (
      (days > 0 ? `${days} days, ` : "") +
      (hours > 0 ? `${hours} hours, ` : "") +
      (minutes > 0 ? `${minutes} minutes, ` : "") +
      (seconds > 0 ? `${seconds} seconds` : "1 seconds")
    );
  }
  /**
   * Recursively searches for a file in a directory
   * @param {string} dir
   * @param {string[]} allowedExtensions
   */
  static recursiveReadDirSync(dir, allowedExtensions = [".js"]) {
    const filePaths = [];
    const readCommands = (dir) => {
      const files = readdirSync(join(process.cwd(), dir));
      files.forEach((file) => {
        const stat = lstatSync(join(process.cwd(), dir, file));
        if (stat.isDirectory()) {
          readCommands(join(dir, file));
        } else {
          const extension = extname(file);
          if (!allowedExtensions.includes(extension)) return;
          const filePath = join(process.cwd(), dir, file);
          filePaths.push(filePath);
        }
      });
    };
    readCommands(dir);
    return filePaths;
  }

  /**
   * @param {import('@structures/Command')} cmd
   */
  static validateCommand(cmd) {
    if (typeof cmd !== "object") {
      throw new TypeError("Command data must be an Object.");
    }
    if (typeof cmd.name !== "string" || cmd.name !== cmd.name.toLowerCase()) {
      throw new Error("Command name must be a lowercase string.");
    }
    if (typeof cmd.description !== "string") {
      throw new TypeError("Command description must be a string.");
    }
    if (cmd.cooldown && typeof cmd.cooldown !== "number") {
      throw new TypeError("Command cooldown must be a number");
    }
    if (cmd.userPermissions) {
      if (!Array.isArray(cmd.userPermissions)) {
        throw new TypeError("Command userPermissions must be an Array of permission key strings.");
      }
      for (const perm of cmd.userPermissions) {
        if (!permissions[perm]) throw new RangeError(`Invalid command userPermission: ${perm}`);
      }
    }
    if (cmd.botPermissions) {
      if (!Array.isArray(cmd.botPermissions)) {
        throw new TypeError("Command botPermissions must be an Array of permission key strings.");
      }
      for (const perm of cmd.botPermissions) {
        if (!permissions[perm]) throw new RangeError(`Invalid command botPermission: ${perm}`);
      }
    }
    // Validate Command Details
    if (cmd.command) {
      if (typeof cmd.command !== "object") {
        throw new TypeError("Command.command must be an object");
      }
      if (Object.prototype.hasOwnProperty.call(cmd.command, "enabled") && typeof cmd.command.enabled !== "boolean") {
        throw new TypeError("Command.command enabled must be a boolean value");
      }
      if (
        cmd.command.aliases &&
        (!Array.isArray(cmd.command.aliases) ||
          cmd.command.aliases.some((ali) => typeof ali !== "string" || ali !== ali.toLowerCase()))
      ) {
        throw new TypeError("Command.command aliases must be an Array of lowercase strings.");
      }
      if (cmd.command.usage && typeof cmd.command.usage !== "string") {
        throw new TypeError("Command.command usage must be a string");
      }
      if (cmd.command.minArgsCount && typeof cmd.command.minArgsCount !== "number") {
        throw new TypeError("Command.command minArgsCount must be a number");
      }
      if (cmd.command.subcommands && !Array.isArray(cmd.command.subcommands)) {
        throw new TypeError("Command.command subcommands must be an array");
      }
      if (cmd.command.subcommands) {
        for (const sub of cmd.command.subcommands) {
          if (typeof sub !== "object") {
            throw new TypeError("Command.command subcommands must be an array of objects");
          }
          if (typeof sub.trigger !== "string") {
            throw new TypeError("Command.command subcommand trigger must be a string");
          }
          if (typeof sub.description !== "string") {
            throw new TypeError("Command.command subcommand description must be a string");
          }
        }
      }
      if (cmd.command.enabled && typeof cmd.messageRun !== "function") {
        throw new TypeError("Missing 'messageRun' function");
      }
    }
    // Validate Slash Command Details
    if (cmd.slashCommand) {
      if (typeof cmd.slashCommand !== "object") {
        throw new TypeError("Command.slashCommand must be an object");
      }
      if (
        Object.prototype.hasOwnProperty.call(cmd.slashCommand, "enabled") &&
        typeof cmd.slashCommand.enabled !== "boolean"
      ) {
        throw new TypeError("Command.slashCommand enabled must be a boolean value");
      }
      if (
        Object.prototype.hasOwnProperty.call(cmd.slashCommand, "ephemeral") &&
        typeof cmd.slashCommand.ephemeral !== "boolean"
      ) {
        throw new TypeError("Command.slashCommand ephemeral must be a boolean value");
      }
      if (cmd.slashCommand.options && !Array.isArray(cmd.slashCommand.options)) {
        throw new TypeError("Command.slashCommand must be a array");
      }
      if (cmd.slashCommand.enabled && typeof cmd.interactionRun !== "function") {
        throw new TypeError("Missing 'interactionRun' function");
      }
    }
  }
};
