const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "filter",
  description: "add filter to the current queue",
  cooldown: 6,
  category: "FILTER",
  botPermissions: [],
  SameVoiceChannel: true,
  InVoiceChannel: true,
  InBotVC: true,
  Player: true,
  ActivePlayer: true,
  command: {
    enabled: false,
    aliases: [],
    usage: "",
    minArgsCount: 0,
    subcommands: [],
    aliases: [],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "vibrato",
        description: "vibrato filter",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "value",
            description: "enable or disable the vibrato filter",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "enable",
                value: "enable",
              },
              {
                name: "disable",
                value: "disable",
              },
            ],
          },
        ],
      },

      {
        name: "karaoke",
        description: "karaoke filter",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "value",
            description: "enable or disable the karaoke filter",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "enable",
                value: "enable",
              },
              {
                name: "disable",
                value: "disable",
              },
            ],
          },
        ],
      },
      {
        name: "rock",
        description: "rock filter",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "value",
            description: "enable or disable the rock filter",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "enable",
                value: "enable",
              },
              {
                name: "disable",
                value: "disable",
              },
            ],
          },
        ],
      },
      {
        name: "electrocic",
        description: "electrocic filter",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "value",
            description: "enable or disable the electrocic filter",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "enable",
                value: "enable",
              },
              {
                name: "disable",
                value: "disable",
              },
            ],
          },
        ],
      },
      {
        name: "radio",
        description: "radio filter",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "value",
            description: "enable or disable the radio filter",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "enable",
                value: "enable",
              },
              {
                name: "disable",
                value: "disable",
              },
            ],
          },
        ],
      },
      {
        name: "bass",
        description: "bass filter",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "value",
            description: "enable or disable the bass filter",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "enable",
                value: "enable",
              },
              {
                name: "disable",
                value: "disable",
              },
            ],
          },
        ],
      },
      {
        name: "pitch",
        description: "pitch filter",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "value",
            description: "enable or disable the earrape filter",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "level 1",
                value: "1",
              },
              {
                name: "level 2",
                value: "2",
              },
              {
                name: "level 3",
                value: "3",
              },
              {
                name: "level 4",
                value: "4",
              },
            ],
          },
        ],
      },
      {
        name: "earrape",
        description: "earrape filter",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "value",
            description: "enable or disable the earrape filter",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "enable",
                value: "enable",
              },
              {
                name: "disable",
                value: "disable",
              },
            ],
          },
        ],
      },
      {
        name: "soft",
        description: "soft filter",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "value",
            description: "enable or disable the soft filter",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "enable",
                value: "enable",
              },
              {
                name: "disable",
                value: "disable",
              },
            ],
          },
        ],
      },
      {
        name: "8d",
        description: "8d filter",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "value",
            description: "enable or disable the 8d filter",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "enable",
                value: "enable",
              },
              {
                name: "disable",
                value: "disable",
              },
            ],
          },
        ],
      },
      {
        name: "bassboost",
        description: "bassboost filter",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "level",
            description: "level of the bass",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "disable",
                value: "none",
              },
              {
                name: "low",
                value: "low",
              },
              {
                name: "medium",
                value: "medium",
              },
              {
                name: "high",
                value: "high",
              },
              {
                name: "max",
                value: "max",
              },
            ],
          },
        ],
      },
      {
        name: "party",
        description: "party mode filter",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "value",
            description: "enable or disable the party mode filter",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "enable",
                value: "enable",
              },
              {
                name: "disable",
                value: "disable",
              },
            ],
          },
        ],
      },
      {
        name: "speed",
        description: "changes the speed of the current song",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "value",
            description: "speed of the song",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "0.25x",
                value: "0.25",
              },
              {
                name: "0.5x",
                value: "0.5",
              },

              {
                name: "0.75x",
                value: "0.75",
              },
              {
                name: "1x (NORMAL)",
                value: "1",
              },
              {
                name: "1.25x",
                value: "1.25",
              },
              {
                name: "1.5x",
                value: "1.5",
              },
              {
                name: "1.75x",
                value: "1.75",
              },
              {
                name: "2x",
                value: "2",
              },
            ],
          },
        ],
      },
      {
        name: "nightcore",
        description: "nightcore filter",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "value",
            description: "enable or disable the nightcore filter",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "enable",
                value: "enable",
              },
              {
                name: "disable",
                value: "disable",
              },
            ],
          },
        ],
      },
      {
        name: "vaporwave",
        description: "vaporwave filter",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "value",
            description: "enable or disable the vaporwave filter",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "enable",
                value: "enable",
              },
              {
                name: "disable",
                value: "disable",
              },
            ],
          },
        ],
      },
      {
        name: "pop",
        description: "pop filter",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "value",
            description: "enable or disable the pop filter",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "enable",
                value: "enable",
              },
              {
                name: "disable",
                value: "disable",
              },
            ],
          },
        ],
      },
      {
        name: "clear",
        description: "clear all the filters",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "list",
        description: "list all the filters",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
  messageRun: async (client, message, args, player, data) => {},
  interactionRun: async (client, interaction, player, data) => {
    const Sub = interaction.options.getSubcommand();
    switch (Sub) {
      case "8d": {
        const value = interaction.options.getString("value");
        if (value === "enable") player.set8D(true);
        else if (value === "disable") player.clearfilter();
        else return interaction.followUp({ content: "Invalid value. Please try again." });
        return interaction.followUp({ content: `8D filter has been ${value === "enable" ? "enabled" : "disabled"}.` });
      }
      case "bassboost": {
        const level = interaction.options.getString("level");
        if (level === "disable") player.clearfilter();
        player.setBassboost(level);
        return interaction.followUp({ content: `Bassboost filter has been set to ${level}.` });
      }
      case "party": {
        const value = interaction.options.getString("value");
        if (value === "enable") player.setParty(true);
        else if (value === "disable") player.clearfilter();
        else return interaction.followUp({ content: "Invalid value. Please try again." });
        return interaction.followUp({
          content: `Party filter has been ${value === "enable" ? "enabled" : "disabled"}.`,
        });
      }
      case "speed": {
        const value = interaction.options.getString("value");
        if (value === "enable") player.setSpeed(value);
        else if (value === "disable") player.clearfilter();
        return interaction.followUp({ content: `Speed filter has been set to ${value}.` });
      }
      case "nightcore": {
        const value = interaction.options.getString("value");
        if (value === "enable") player.setNightCore(value);
        else if (value === "disable") player.clearfilter();
        return interaction.followUp({
          content: `Nightcore filter has been ${value === "enable" ? "enabled" : "disabled"}.`,
        });
      }
      case "vaporwave": {
        const value = interaction.options.getString("value");
        if (value === "enable") player.setVaporwave(value);
        else if (value === "disable") player.clearfilter();
        return interaction.followUp({
          content: `Vaporwave filter has been ${value === "enable" ? "enabled" : "disabled"}.`,
        });
      }
      case "pop": {
        const value = interaction.options.getString("value");
        if (value === "enable") player.setPop(value);
        else if (value === "disable") player.clearfilter();
        return interaction.followUp({ content: `Pop filter has been ${value === "enable" ? "enabled" : "disabled"}.` });
      }
      case "clear": {
        player.clearfilter();
        return interaction.followUp({ content: `All filters have been cleared.` });
      }
      case "list": {
        const embed = new EmbedBuilder().setColor(client.botcolor).setDescription(
          `${await client.application.commands.fetch().then((x) =>
            x
              .filter((e) => e.name === "filter")
              .first()
              .options.map((c) => `**${c.name}** - ${c.description}`)
              .join("\n")
          )}`
        );
        return interaction.followUp({ embeds: [embed] });
      }
      case "vibrato": {
        const value = interaction.options.getString("value");
        if (value === "enable") player.setPop(value);
        else if (value === "disable") player.clearfilter();
        return interaction.followUp({
          content: `Vibrato filter has been ${value === "enable" ? "enabled" : "disabled"}.`,
        });
      }
      case "karaoke": {
        const value = interaction.options.getString("value");
        if (value === "enable") player.setKaraoke(value);
        else if (value === "disable") player.clearfilter();
        return interaction.followUp({
          content: `Karaoke filter has been ${value === "enable" ? "enabled" : "disabled"}.`,
        });
      }
      case "rock": {
        const value = interaction.options.getString("value");
        if (value === "enable") player.setRock(value);
        else if (value === "disable") player.clearfilter();
        return interaction.followUp({
          content: `Rock filter has been ${value === "enable" ? "enabled" : "disabled"}.`,
        });
      }
      case "electrocic": {
        const value = interaction.options.getString("value");
        if (value === "enable") player.setElectronic(value);
        else if (value === "disable") player.clearfilter();
        return interaction.followUp({
          content: `Electronic filter has been ${value === "enable" ? "enabled" : "disabled"}.`,
        });
      }
      case "radio": {
        const value = interaction.options.getString("value");
        if (value === "enable") player.setRadio(value);
        else if (value === "disable") player.clearfilter();
        return interaction.followUp({
          content: `Radio filter has been ${value === "enable" ? "enabled" : "disabled"}.`,
        });
      }
      case "bass": {
        const value = interaction.options.getString("value");
        if (value === "enable") player.setBass(value);
        else if (value === "disable") player.clearfilter();
        return interaction.followUp({
          content: `Bass filter has been ${value === "enable" ? "enabled" : "disabled"}.`,
        });
      }
      case "earrape": {
        const value = interaction.options.getString("value");
        if (value === "enable") player.setEarrape(value);
        else if (value === "disable") player.clearfilter();
        return interaction.followUp({
          content: `Earrape filter has been ${value === "enable" ? "enabled" : "disabled"}.`,
        });
      }
      case "pitch": {
        const value = interaction.options.getString("value");
        player.setPitch(value);
        return interaction.followUp({
          content: `Pitch filter level has been set to \`${value}\`.`,
        });
      }
      case "soft": {
        const value = interaction.options.getString("value");
        if (value === "enable") player.setSoft(value);
        else if (value === "disable") player.clearfilter();
        return interaction.followUp({
          content: `Soft filter has been ${value === "enable" ? "enabled" : "disabled"}.`,
        });
      }
    }
  },
};
