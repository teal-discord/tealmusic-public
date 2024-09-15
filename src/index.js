const mongoose = require("mongoose");
require("dotenv").config();
const fetch = require("isomorphic-unfetch");
const UsersDB = require("@models/premium-users");
const config = require("./config");

module.exports = (client) => {
  require("@extends/GuildChannel");
  require("@extends/Message");
  require("@extends/playerExtends");

  client.loadEvents("./src/events/client");
  client.loadCommands("./src/commands");

  const dbOptions = {
    useNewUrlParser: true,
    autoIndex: false,
    connectTimeoutMS: 3000,
    socketTimeoutMS: 3000,
    maxTimeMS: 2400,
    family: 4,
    useUnifiedTopology: true,
  };

  client.sp = require("spotify-url-info")(fetch);

  // credentials are optional
  var SpotifyWebApi = require("spotify-web-api-node");

  // credentials are optional
  client.spotifyApi = new SpotifyWebApi({
    clientId: config.SPOTIFY.CLIENT_ID,
    clientSecret: config.SPOTIFY.CLIENT_SECRET,
  });

  client.spotifyApi.clientCredentialsGrant().then(
    function (data) {
      // console.log('The access token is ' + data.body['access_token']);
      client.spotifyApi.setAccessToken(data.body["access_token"]);
    },
    function (err) {
      console.log("Something went wrong!", err);
    }
  );

  setInterval(async () => {
    try {
      client.spotifyApi.clientCredentialsGrant().then((data) => { client.spotifyApi.setAccessToken(data.body['access_token']) })
    } catch (error) {
      console.error(error);
    }
  }, 1000 * 60 * 58);

  setInterval(async () => {
    try {
      let doc = await UsersDB.findOne();
      client.premiumUsers = doc.Ids;
    } catch (error) {
      console.error(error);
    }
  }, 1000 * 60 * 5);

  mongoose.set("strictQuery", false);
  mongoose
    .connect(process.env.DATABASE_URL, dbOptions)
    .then(() => {
      client.logger.log(`Database Connected to cluster #${client.shard.clusterId}`.brightCyan);
    })
    .catch((e) => console.error(new Error(`Could not connect to MongoDB:\n${e.message}`)));

  //client.connect(process.env.BOT_TOKEN);

  // client error handling
  process.on("unhandledRejection", (err) => {
    console.log(err);
    client.logger.error(`Unhandled exception`, err);
  });
  process.on("uncaughtException", (err) => {
    client.logger.error(`Uncaught exception`, err);
  });

  const Dokdo = require("dokdo");

  const DokdoHandler = new Dokdo(client, {
    aliases: ["dev", "dok"],
    owners: client.config.OWNER_IDS,
    prefix: `<@${client.config.IDs[client.config.BOT_EMOJI]}>`,
  });

  client.on("messageCreate", async (message) => {
    DokdoHandler.run(message).catch(() => {});
  });
};
