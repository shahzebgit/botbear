require('dotenv').config();
const sql = require('./sql/index.js');

const init = new Promise(async(Resolve) => {
	const sql_opts = {
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
		connectTimeout: 10000,
	};

	await sql.New(sql_opts);
	await sql.Migrate();

	/** @type { Array<SQL.Streamers> } */
	const channels = await sql.Query('SELECT * FROM Streamers');

	const checkOwner = channels.filter(x => x.uid == process.env.TWITCH_OWNERUID);
	if (!checkOwner.length) {
		await sql.Query(`
			INSERT INTO Streamers (username, uid, live_ping, offline_ping, title_ping, game_ping, emote_list, emote_removed, disabled_commands)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			// eslint-disable-next-line
			[process.env.TWITCH_OWNERNAME, process.env.TWITCH_OWNERUID, "['']", "['']", "['']", "['']", '[]', '[]', '[]']);
	}

	// Check if bot channel is in the database.
	if (!channels?.find(({username}) => username === process.env.TWITCH_USER)) {
		const opts = {
			username: process.env.TWITCH_USER,
			uid: process.env.TWITCH_UID
		};
		await require('./tools/tools.js').joinChannel(opts);
	}

	await require('./commands/index.js').Load();
	await require('./connect/connect.js').setupChannels;
    const redis = require('./tools/redis.js').Get();
    await redis.Connect();
    await redis.Subscribe('EventSub');
        
		Resolve();
	});

init.then(() => {
	//require("./tools/logger.js");
	require('./bot.js');
	require('./loops/loops.js');
	console.log('Ready!');
})
	.catch((e) => {
		console.error(`Unable to setup botbear: ${e}`);
		process.exit(1);
	});

