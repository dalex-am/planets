let WIDTH = document.body.clientWidth // Ширина браузера
let HEIGHT = document.body.clientHeight // Высота браузера
let CENTER = [WIDTH / 2, HEIGHT / 2] 
let T_coeff = 0.02 //Регулировка скорости
const G_coeff = 10000
let outputCoordinates = document.getElementsByClassName("coordinates")[0] // Вывод координат в div
let paused = false
let pinned = false
let drawTails = false
let oldX = 0 // Для закрашивания будущей планеты
let oldY = 0

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
var sun = new Planet(CENTER[0], CENTER[1], 0, 0, 5, 100, "yellow")
planets.push(sun)
var mercury = new Planet(CENTER[0] + 100, CENTER[1], 90, 90, 2, 1, "red")
planets.push(mercury)
var earth = new Planet(CENTER[0], CENTER[1] -200, 75, 180, 4, 2, "blue")
planets.push(earth)
// Заготовка для планеты
let futurePlanet = new Planet(260 + CENTER[0], CENTER[1], 65, 90, 2, 2, "rgba(225,225,225,0.5)")


function addPlanet() {
	var planet = new Planet(
		futurePlanet.x, futurePlanet.y,
		Number(document.getElementsByName("v")[0].value),
		180 + Number(document.getElementsByName("angle")[0].value),
		Number(document.getElementsByName("radius")[0].value),
		Number(document.getElementsByName("mass")[0].value),
		document.getElementsByName("color")[0].value,
		)
	planets.push(planet)
	if (paused) {
		drawFrame()
	}
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
	// Смотрим, нужен ли след
	{drawTails
		? context.save() 
		: context.clearRect(-space.width * 10, -space.height * 10, space.width * 20, space.height * 20)}
	outputCoordinates.innerHTML = ""
	for (let i = 0; i < planets.length; i++) {
		context.beginPath()
		let planet = planets[i]
		context.arc(planet.x, planet.y, planet.radius, 0, 7);
		context.fillStyle = planet.color
		context.fill();
		// Вывести координаты на экран
		let v = Math.sqrt(Math.pow(planet.vx, 2) + Math.pow(planet.vy, 2))
		outputCoordinates.innerHTML += `${i}. x = ${Math.round(planet.x - CENTER[0])},
			y = ${Math.round(CENTER[1] - planet.y)}, V = ${Math.round(v)}, mass = ${planet.mass}.
			<span onclick="deletePlanet(${i})">delete</span> <br>`	
	}
	// Рисуем будущую планету
	drawFuturePlanet(oldX, oldY, 'rgba(0,0,0,1)')
	drawFuturePlanet(oldX, oldY, 'rgba(0,0,0,1)')
	if (futurePlanet.x !== oldX || futurePlanet.y !== oldY) {
		oldX = futurePlanet.x
		oldY = futurePlanet.y
	}
	drawFuturePlanet()
	{drawTails && context.restore() }  // Если рисуем след

	if(!paused) {
		requestAnimationFrame(drawFrame);
	}
	if (pinned) {
		for (let i = 1; i < planets.length; i++) {
			getNewCoords(planets[i])	
		}
	} else {
		for (let i = 0; i < planets.length; i++) {
			getNewCoords(planets[i])	
		}
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

function drawFuturePlanet(x = futurePlanet.x, y=futurePlanet.y, color=futurePlanet.color) {
	context.beginPath();
	context.arc(x, y, futurePlanet.radius, 0, 7); 
	context.fillStyle = color
	context.fill();
	context.beginPath();
	drawArrow(x, y, 
		x + 40 * Math.cos(Math.PI/180*futurePlanet.angle),
		y - 40 * Math.sin(Math.PI/180*futurePlanet.angle))
	context.strokeStyle = color
	context.stroke();
	context.closePath()
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
	context.clearRect(-space.width * 10, -space.height * 10, space.width * 20, space.height * 20)
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
	context.clearRect(-space.width * 10, -space.height * 10, space.width * 20, space.height * 20)
	for (let i = 0; i < planets.length; i++) {
		planets[i].y += 10
	}
}
function moveDown() {
	context.clearRect(-space.width * 10, -space.height * 10, space.width * 20, space.height * 20)
	for (let i = 0; i < planets.length; i++) {
		planets[i].y -= 10
	}
}
function moveLeft() {
	context.clearRect(-space.width * 10, -space.height * 10, space.width * 20, space.height * 20)
	for (let i = 0; i < planets.length; i++) {
		planets[i].x += 10
	}
}
function moveRight() {
	context.clearRect(-space.width * 10, -space.height * 10, space.width * 20, space.height * 20)
	for (let i = 0; i < planets.length; i++) {
		planets[i].x -= 10
	}
}

// Pin first planet
function togglePin() {
	pin = document.getElementsByName("pin")[0].checked
	pinned = pin
}

// draw tails
function toggleTails() {
	tails = document.getElementsByName("tails")[0].checked
	drawTails = tails
}

// Zoom
function zoomMinus() {
	context.clearRect(-space.width * 10, -space.height * 10, space.width * 20, space.height * 20)
	context.scale(0.9, 0.9)
	context.translate(WIDTH / 0.9 * 0.05, HEIGHT / 0.9 * 0.05)
}

function zoomPlus() {
	context.clearRect(-space.width * 10, -space.height * 10, space.width * 20, space.height * 20)
	context.scale(1.1, 1.1)
	context.translate(- WIDTH / 1.1 * 0.05, -HEIGHT / 1.1 * 0.05)
}

// Speed
function speedMinus() {
	T_coeff *= 0.9
}

function speedPlus() {
	T_coeff /= 0.8
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
	} else {
		futurePlanet.x = event.pageX
		futurePlanet.y = event.pageY
	}
})

// Управление ползунками
var sliderV = document.getElementsByName("v")[0]
var outputV = document.getElementById("v");
outputV.innerHTML = sliderV.value; 
sliderV.oninput = function() {
	outputV.innerHTML = this.value;
	futurePlanet.v = Number(this.value)
}

var sliderAngle = document.getElementsByName("angle")[0]
var outputAngle = document.getElementById("angle");
outputAngle.innerHTML = sliderAngle.value; 
sliderAngle.oninput = function() {
    outputAngle.innerHTML = this.value;
	futurePlanet.angle = Number(this.value)
}

var sliderRadius = document.getElementsByName("radius")[0]
var outputRadius = document.getElementById("radius");
outputRadius.innerHTML = sliderRadius.value; 
sliderRadius.oninput = function() {
    outputRadius.innerHTML = this.value;
	futurePlanet.radius = Number(this.value)
}

var sliderMass = document.getElementsByName("mass")[0]
var outputMass = document.getElementById("mass");
outputMass.innerHTML = sliderMass.value; 
sliderMass.oninput = function() {
    outputMass.innerHTML = this.value;
	futurePlanet.mass = Number(this.value)
}

