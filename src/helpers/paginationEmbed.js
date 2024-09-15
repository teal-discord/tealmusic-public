const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const paginationEmbed = async (interaction, pages, buttonList, timeout = 120000) => {
  let page = 0;

  const row = new ActionRowBuilder().addComponents(buttonList);

  //has the interaction already been deferred? If not, defer the reply.
  if (interaction.deferred === false) {
    await interaction.deferReply();
  }

  const curPage = await interaction.editReply({
    embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
    components: [row],
    fetchReply: true,
  });

  const collector = await curPage.createMessageComponentCollector({
    time: timeout,
  });

  collector.on("collect", async (i) => {
    switch (i.customId) {
      case "previousbtn":
        page = page > 0 ? --page : pages.length - 1;
        break;
      case "nextbtn":
        page = page + 1 < pages.length ? ++page : 0;
        break;
      default:
        break;
    }
    await i.deferUpdate();
    await i.editReply({
      embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
      components: [row],
    });
    collector.resetTimer();
  });

  collector.on("end", () => {
    if (!curPage.deleted) {
      const disabledRow = new ActionRowBuilder().addComponents(
        buttonList[0].setDisabled(true),
        buttonList[1].setDisabled(true)
      );
      curPage.edit({
        embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
        components: [disabledRow],
      });
    }
  });

  return curPage;
};

module.exports = paginationEmbed;
