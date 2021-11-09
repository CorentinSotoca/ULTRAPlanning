process.env.NTBA_FIX_319 = 1;
const TelegramBot = require("node-telegram-bot-api");
const os=require('os')
const ics = require("icalendar");
const config = require("./config");
let request = require("request");
let fs = require("fs");



let telegramBotToken = config.telegramBotToken;
let telegramChatId = config.telegramChatId;
let icsLink = config.icsLink;


// --------------- Telegram Bot ---------------

let telegram = new TelegramBot(telegramBotToken);
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

//----------------------------Traitement d'ical---------------------------------------
function update() {
	request(
		icsLink,
		function (err, res, body) {
			if (err != null) {
				console.error(err);
				return -1;
			}

			let source

			try {
				source = ics.parse_calendar(body); // On le parse
			} catch (error) {
				console.error(error);
				return
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
					event.properties.SUMMARY[0].value = text.substring(
						tiret + 2,
						text.length
					);
					text = event.properties.SUMMARY[0].value;
				}

				// console.log(event.properties.LOCATION[0].value)
				if (text.search("Autonomie") != -1) {
					auto.addComponent(event);
				}else if(event.properties.LOCATION[0].value.includes("1A02")){
					controle.addComponent(event);
				} else if(event.properties.LOCATION[0].value.includes("1A") || event.properties.LOCATION[0].value.includes("Amphis")){
					amphi.addComponent(event);
				}else {
					tdTp.addComponent(event);
				}
			}

			try {
				const data = fs.writeFileSync(
					"result/tdTp.ics",
					tdTp
				);
				//file written successfully
			} catch (err) {
				console.error(err);
			}

			try {
				const data = fs.writeFileSync("result/auto.ics", auto);
				//file written successfully
			} catch (err) {
				console.error(err);
			}

			try {
				const data = fs.writeFileSync(
					"result/amphi.ics",
					amphi
				);
				//file written successfully
			} catch (err) {
				console.error(err);
			}

			try {
				const data = fs.writeFileSync(
					"result/controle.ics",
					controle
				);
				//file written successfully
			} catch (err) {
				console.error(err);
			}
		}
	);
}

logToTelegram("🤖 UltraPlanning viens de demarrer depuis", os.hostname()," !")
update();
setInterval(update, 3600000);