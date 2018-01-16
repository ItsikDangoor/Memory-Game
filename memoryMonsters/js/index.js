var log = console.log;

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
	color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function setRandomColor(id) {
	document.querySelector(id).style.backgroundColor = getRandomColor();
}

function randomizeColors(id) {
	log(id);
	var numOfElements = document.getElementById(id).children.length;
	log(numOfElements);

	var elements = document.getElementById(id).children;
	log(elements);

	for(let i = 0; i < numOfElements; i += 1) {
		log(elements[i]);
		log("#" + elements[i].id);
		setRandomColor("#" + elements[i].id);
	}
}