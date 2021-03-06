process.env.NTBA_FIX_319 = 1;
const TelegramBot = require("node-telegram-bot-api");
const os = require("os");
const ics = require("icalendar");
const config = require("./config");
let request = require("request");
let fs = require("fs");

let telegramBotToken = config.telegramBotToken;
let telegramChatId = config.telegramChatId;
const icsLinks = [
	config.icsLink[0],
	config.icsLink[1],
	config.icsLink[2],
	config.icsLink[3],
	config.icsLink[4],
	config.icsLink[5],
	config.icsLink[6],
	config.icsLink[7],
	config.icsLink[8],
	config.icsLink[9],
	config.icsLink[10],
	config.icsLink[11],
];

// --------------- Telegram Bot ---------------

let telegram = new TelegramBot(telegramBotToken, { polling: true });
function logToTelegram() {
	const msg = Object.values(arguments)
		.map((msg) => {
			if (typeof msg === "object") {
				return msg.stack ? msg.stack : JSON.stringify(msg);
			} else {
				return String(msg);
			}
		})
		.join(" ");
	return telegram.sendMessage(telegramChatId, msg);
}

console.notify = function () {
	try {
		console.log(arguments);
		logToTelegram(arguments).catch(console.error);
	} catch (e) {
		console.error(e);
	}
};

const standardErrorLog = console.error.bind(console);
console.error = function () {
	try {
		console.log("Une erreur a été envoyée sur telegram !");
		logToTelegram("⚠️", arguments).catch(console.error);
	} catch (e) {
		console.error(e);
	}
};

//-----------------------------Commande-----------------------------------------------

telegram.on("message", (msg) => {
	if (msg.text == "/status") {
		var uptime = process.uptime() + 60;
		const date = new Date(uptime * 1000);
		const days = date.getUTCDate() - 1,
			hours = date.getUTCHours(),
			minutes = date.getUTCMinutes();

		let segments = [];

		if (days > 0) segments.push(days + " day" + (days == 1 ? "" : "s"));
		if (hours > 0) segments.push(hours + " hour" + (hours == 1 ? "" : "s"));
		if (minutes > 0)
			segments.push(minutes + " minute" + (minutes == 1 ? "" : "s"));

		const dateString = segments.join(", ");

		logToTelegram("🤖 ULTRAPlanning est UP depuis", dateString);
	} else if (msg.text == "/update") {
		update();
		logToTelegram("🤖 Les ICALs ont bien été mis à jour !");
	}
});

//----------------------------Traitement d'ical---------------------------------------
function update() {
	for (let i = 0; i < 11; i++) {
		request(icsLinks[i], function (err, res, body) {
			let dirName;
			switch (i) {
				case 0:
					dirName = "A1";
					break;
				case 1:
					dirName = "B1";
					break;
				case 2:
					dirName = "C1";
					break;
				case 3:
					dirName = "D1";
					break;
				case 4:
					dirName = "E1";
					break;
				case 5:
					dirName = "F1";
					break;
				case 6:
					dirName = "A2";
					break;
				case 7:
					dirName = "B2";
					break;
				case 8:
					dirName = "C2";
					break;
				case 9:
					dirName = "D2";
					break;
				case 10:
					dirName = "E2";
					break;
				case 11:
					dirName = "F2";
					break;
				default:
					dirName = "A1";
			}

			if (err != null) {
				console.error(err);
				return -1;
			}

			let source;


			try {
				source = ics.parse_calendar(body); // On le parse
			} catch (error) {
				console.error(error);
				return;
			}

			// On crée les var de resultat
			let auto = new ics.iCalendar(); // Celle ci contient toutes les autonomies
			let controle = new ics.iCalendar(); // DS, CTP et interro
			let amphi = new ics.iCalendar(); // Amphi
			let tdTp = new ics.iCalendar(); // Et celle ci contient toutes les autres heures

			for (let i = 0; i < source.components.VEVENT.length; i++) {
				let event = source.components.VEVENT[i]; // Creation d'une variable event ou on copie la valeur de l'ics
				let text = event.properties.SUMMARY[0].value;

				let tiret = text.search("-");
				if (tiret != -1) {
					let location = event.properties.LOCATION[0].value;
					event.properties.SUMMARY[0].value = location + " - " +text.substring(
						tiret + 2,
						text.length
					);
					text = event.properties.SUMMARY[0].value;
				}

				if (text.search("Autonomie") != -1) {
					auto.addComponent(event);
				} else if (
					event.properties.LOCATION[0].value.includes("1A02")
				) {
					controle.addComponent(event);
				} else if (
					event.properties.LOCATION[0].value.includes("1A") ||
					event.properties.LOCATION[0].value.includes("Amphis")
				) {
					amphi.addComponent(event);
				} else {
					tdTp.addComponent(event);
				}
			}

			try {
				const data = fs.writeFileSync(
					"result/" + dirName + "/tdTp.ics",
					tdTp
				);
				//file written successfully
			} catch (err) {
				console.error(err);
			}

			try {
				const data = fs.writeFileSync(
					"result/" + dirName + "/auto.ics",
					auto
				);
				//file written successfully
			} catch (err) {
				console.error(err);
			}

			try {
				const data = fs.writeFileSync(
					"result/" + dirName + "/amphi.ics",
					amphi
				);
				//file written successfully
			} catch (err) {
				console.error(err);
			}

			try {
				const data = fs.writeFileSync(
					"result/" + dirName + "/controle.ics",
					controle
				);
				//file written successfully
			} catch (err) {
				console.error(err);
			}
		});
	}
}

logToTelegram("🤖 UltraPlanning viens de demarrer depuis", os.hostname(), " !");
update();
setInterval(update, 3600000);
