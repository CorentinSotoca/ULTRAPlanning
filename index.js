const ics = require("icalendar");
let request = require("request");
let fs = require("fs");

//----------------------------Traitement d'ical---------------------------------------
function update(){
	request('https://calendar.google.com/calendar/ical/5jfc2090l0mh0rigmvnmd0k7j1dbnrve%40import.calendar.google.com/public/basic.ics', function(err, res, body) {
		if(err!=null){
			console.log("Ca a crash !")
			return -1;
		}
	
		let source = ics.parse_calendar(body); // On le parse
		
		// On crée les var de resultat
		let auto = new ics.iCalendar(); // Celle ci contient toutes les autonomies
		let resWoAuto = new ics.iCalendar(); // Et celle ci contient toutes les autres heures
		
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
		
			if (text.search("Autonomie") != -1) {
				auto.addComponent(event);
			} else {
				resWoAuto.addComponent(event);
			}
		}
		console.log(resWoAuto)
		try {
			const data = fs.writeFileSync("result/resWoAuto.ics", resWoAuto);
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
	});
}
update();
setInterval(update,3600000)