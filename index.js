let WIDTH = document.body.clientWidth //Ширина браузера
let HEIGHT = document.body.clientHeight //Высота браузера
let CENTER = [WIDTH / 2, HEIGHT / 2] // 0.9 - размер области с планетами
console.log(WIDTH, HEIGHT)
const T_coeff = 0.05 //Регулировка скорости
const G_coeff = 10000
let outputCoordinates = document.getElementsByClassName("coordinates")[0] // Вывод координат в div
let paused = false

// Настраиваем canvas
window.onload = function() {
	// Определение контекста рисования
	space = document.getElementById("space")
	context = space.getContext("2d")
	space.width = WIDTH
	space.height = HEIGHT
	requestAnimationFrame(drawFrame)
}

// Массив с планетами
var planets = [];
var futurePlanet = []

// Тип данных для планеты
function Planet(x, y, v, angle, radius, mass, color) {
    this.x = x;
	this.y = y;
	this.angle = angle + 180;
	this.vx = v * Math.cos(Math.PI/180*this.angle);
	this.vy = - v * Math.sin(Math.PI/180*this.angle);
	this.radius = radius;
	this.mass = mass
    this.color = color;
}

// Объявляем первые планеты (x, y, v, angle, radius, mass, color)
var sun = new Planet(CENTER[0], CENTER[1], 0, 0, 8, 100, "yellow")
planets.push(sun)
var mercury = new Planet(CENTER[0] + 100, CENTER[1], 90, 90, 2, 1, "red")
planets.push(mercury)
var earth = new Planet(CENTER[0] -200, CENTER[1], 75, 270, 4, 2, "blue")
planets.push(earth)

function addPlanet(array = planets) {
	var planet = new Planet(
		CENTER[0] + Number(document.getElementsByName("x")[0].value),
		CENTER[1] - Number(document.getElementsByName("y")[0].value),
		Number(document.getElementsByName("v")[0].value),
		180 + Number(document.getElementsByName("angle")[0].value),
		Number(document.getElementsByName("radius")[0].value),
		Number(document.getElementsByName("mass")[0].value),
		document.getElementsByName("color")[0].value,
		)
	array.push(planet)
	if (paused) {
		drawFrame()
	}
	if (array != futurePlanet) { futurePlanet = [] }
}

function deletePlanet(index) {
	outputCoordinates.innerHTML = ""
	planets.splice(index, 1)
	for (let i = 0; i < planets.length; i++) {
		let planet = planets[i]
		let v = Math.sqrt(Math.pow(planet.vx, 2) + Math.pow(planet.vy, 2))
		outputCoordinates.innerHTML += `${i}. x = ${Math.round(planet.x) - CENTER[0]},
			y = ${CENTER[1] - Math.round(planet.y)}, V = ${Math.round(v)}, mass = ${planet.mass}. 
			<span onclick="deletePlanet(${i})">delete</span> <br>`
	}
	drawFrame()
}

// Проходим циклом, делаем расчёты, рисуем, выводим список
function drawFrame() {
	context.clearRect(0, 0, space.width, space.height)
	outputCoordinates.innerHTML = ""
	for (let i = 0; i < planets.length; i++) {
		context.beginPath()
		let planet = planets[i]
		context.arc(planet.x, planet.y, planet.radius, 0, 7);
		context.fillStyle = planet.color
		context.shadowColor = '#ffffff'
        context.shadowBlur = 30 //Свечение
		context.fill();
		// Вывести координаты на экран
		let v = Math.sqrt(Math.pow(planet.vx, 2) + Math.pow(planet.vy, 2))
		outputCoordinates.innerHTML += `${i}. x = ${Math.round(planet.x) - CENTER[0]},
			y = ${CENTER[1] - Math.round(planet.y)}, V = ${Math.round(v)}, mass = ${planet.mass}.
			<span onclick="deletePlanet(${i})">delete</span> <br>`	
	}
	if ( futurePlanet.length > 0 ) {
		let planet = futurePlanet[0]
		context.arc(planet.x, planet.y, planet.radius, 0, 7); // Рисуем будущую планету
		context.fillStyle = 'rgba(225,225,225,0.5)'
		context.shadowColor = '#ffffff'
		context.shadowBlur = 30 //Свечение
		context.fill();
		context.beginPath();
		drawArrow(planet.x, planet.y, 
			planet.x + 40 * Math.cos(Math.PI/180*planet.angle),
			planet.y - 40 * Math.sin(Math.PI/180*planet.angle));
			debugger
		context.strokeStyle = 'rgba(225,225,225,0.5)'
		context.stroke();
	}
	if(!paused) {
		requestAnimationFrame(drawFrame);
	}
	for (let i = 0; i < planets.length; i++) {
		getNewCoords(planets[i])	
	}
}

// Расчёт расстояния
function getDistance(planet1, planet2) {
	let distance = Math.sqrt( Math.pow((planet1.x - planet2.x),2) + Math.pow((planet1.y - planet2.y),2) );
	return distance
}

// Рассчёт ускорения ВТОРОГО к ПЕРВОМУ
function getAccelerate(planet) {
	let otherPlanets = planets.filter( (plnt) => { if (plnt!==planet) return plnt } )
	let acc_x = 0
	let acc_y = 0
	for (let i = 0; i < otherPlanets.length; i++) {
		const otherPlanet = otherPlanets[i];
		let distance = getDistance(planet, otherPlanet)
		acc_x += G_coeff * otherPlanet.mass * (otherPlanet.x - planet.x) / Math.pow(distance, 3)
		acc_y += G_coeff * otherPlanet.mass * (otherPlanet.y - planet.y) / Math.pow(distance, 3)
	}
	return [acc_x, acc_y]
}

// Расчёт изменения координат планеты (после подсчёта всех ускорений)
function getNewCoords(planet) {
	let [acc_x, acc_y] = getAccelerate(planet);
	planet.vx += acc_x * T_coeff;
	planet.vy += acc_y * T_coeff;
	planet.x += planet.vx * T_coeff
	planet.y += planet.vy * T_coeff
}

// Очистить пространство
function clearPlanets() {
	// Удаляем все планеты
	planets = [];
}

// Вкл-выкл паузы
function togglePaused() {
	paused = !paused
	if (!paused) drawFrame()
}

// Расчёт для отрисовки стрелки
function drawArrow(fromx, fromy, tox, toy) {
	let headlen = 10; // length of head in pixels
	let dx = tox - fromx;
	let dy = toy - fromy;
	let angle = Math.atan2(dy, dx);
	context.moveTo(fromx, fromy);
	context.lineTo(tox, toy);
	context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
	context.moveTo(tox, toy);
	context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}

// Движения по экрану
function moveUp() {
	for (let i = 0; i < planets.length; i++) {
		planets[i].y += 10
	}
}
function moveDown() {
	for (let i = 0; i < planets.length; i++) {
		planets[i].y -= 10
	}
}
function moveLeft() {
	for (let i = 0; i < planets.length; i++) {
		planets[i].x += 10
	}
}
function moveRight() {
	for (let i = 0; i < planets.length; i++) {
		planets[i].x -= 10
	}
}

// Управление клавишами
addEventListener("keydown", function(event) {
    if (event.keyCode === 38) {moveUp()}
    if (event.keyCode === 40) {moveDown()}
    if (event.keyCode === 37) {moveLeft()}
    if (event.keyCode === 39) {moveRight()}
    if (event.keyCode === 32) {togglePaused()}
});

// Добавляем "будущую" планету
addEventListener("click", function (event) {
	if (event.clientX < WIDTH * 0.28 && event.clientY > HEIGHT * 0.72) {
		return false
	} else if (futurePlanet.length == 0) {
		sliderX.value = event.pageX - CENTER[0]
		outputX.innerHTML = sliderX.value; 
		sliderY.value = CENTER[1] - event.pageY
		outputY.innerHTML = sliderY.value;
		addPlanet(futurePlanet)
	} else if (futurePlanet.length == 1) {
		let tox = event.pageX
		let toy = event.pageY
		let dx = tox - futurePlanet[0].x;
		let dy = futurePlanet[0].y - toy;
		let angle = Math.atan2(dy, dx);
		if (angle < 0) {angle += 2 * Math.PI}
		sliderAngle.value = (180*angle/Math.PI); 
		outputAngle.innerHTML = sliderAngle.value;
		futurePlanet[0].angle = (180*angle/Math.PI)
	}
})

// Управление ползунками
var sliderX = document.getElementsByName("x")[0]
var outputX = document.getElementById("x");
outputX.innerHTML = sliderX.value; 
sliderX.oninput = function() {
    outputX.innerHTML = this.value;
}

var sliderY = document.getElementsByName("y")[0]
var outputY = document.getElementById("y");
outputY.innerHTML = sliderY.value; 
sliderY.oninput = function() {
    outputY.innerHTML = this.value;
}

var sliderV = document.getElementsByName("v")[0]
var outputV = document.getElementById("v");
outputV.innerHTML = sliderV.value; 
sliderV.oninput = function() {
    outputV.innerHTML = this.value;
}

var sliderAngle = document.getElementsByName("angle")[0]
var outputAngle = document.getElementById("angle");
outputAngle.innerHTML = sliderAngle.value; 
sliderAngle.oninput = function() {
    outputAngle.innerHTML = this.value;
}

var sliderRadius = document.getElementsByName("radius")[0]
var outputRadius = document.getElementById("radius");
outputRadius.innerHTML = sliderRadius.value; 
sliderRadius.oninput = function() {
    outputRadius.innerHTML = this.value;
}

var sliderMass = document.getElementsByName("mass")[0]
var outputMass = document.getElementById("mass");
outputMass.innerHTML = sliderMass.value; 
sliderMass.oninput = function() {
    outputMass.innerHTML = this.value;
}

