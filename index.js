let WIDTH = document.body.clientWidth //Ширина браузера
let HEIGHT = document.body.clientHeight //Высота браузера
let CENTER = [WIDTH / 2, HEIGHT / 2] // 0.9 - размер области с планетами
console.log(WIDTH, HEIGHT)
const T_coeff = 0.05 //Регулировка скорости
const G_coeff = 10000
let outputCoordinates = document.getElementsByClassName("coordinates")[0]
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

// Тип данных для планеты
function Planet(x, y, v, angle, radius, mass, color) {
    this.x = x;
	this.y = y;
	this.vx = v * Math.cos(Math.PI/180*angle)
	this.vy = v * Math.sin(Math.PI/180*angle)
	this.radius = radius;
	this.mass = mass
    this.color = color;
}

// Объявляем первые планеты (x, y, v, angle, radius, mass, color)
var sun = new Planet(CENTER[0], CENTER[1], 0, 0, 10, 100, "yellow")
planets.push(sun)
var mercury = new Planet(CENTER[0] + 100, CENTER[1], 100, 90, 5, 1, "red")
planets.push(mercury)
var venus = new Planet(CENTER[0] - 300, CENTER[1], 50, 270, 5, 2, "brown")
planets.push(venus)

function addPlanet() {
	var planet = new Planet(
		CENTER[0] + Number(document.getElementsByName("x")[0].value),
		CENTER[1] - Number(document.getElementsByName("y")[0].value),
		Number(document.getElementsByName("v")[0].value),
		180 + Number(document.getElementsByName("angle")[0].value),
		Number(document.getElementsByName("radius")[0].value),
		Number(document.getElementsByName("mass")[0].value),
		document.getElementsByName("color")[0].value,
		)
	planets.push(planet)
}

function deletePlanet(index) {
	outputCoordinates.innerHTML = ""
	planets.splice(index, 1)
	for (let i = 0; i < planets.length; i++) {
		let planet = planets[i]
		let v = Math.sqrt(Math.pow(planet.vx, 2) + Math.pow(planet.vy, 2))
		outputCoordinates.innerHTML += `<span onclick="deletePlanet(${i})">del</span> 
			${i}. x = ${Math.round(planet.x) - CENTER[0]},
			y = ${CENTER[1] - Math.round(planet.y)}, V = ${Math.round(v)}, mass = ${planet.mass}<br>`
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
		context.fill();
		// Вывести координаты на экран
		let v = Math.sqrt(Math.pow(planet.vx, 2) + Math.pow(planet.vy, 2))
		outputCoordinates.innerHTML += `<span onclick="deletePlanet(${i})">del</span> ${i}. x = ${Math.round(planet.x) - CENTER[0]},
			 y = ${CENTER[1] - Math.round(planet.y)}, V = ${Math.round(v)}, mass = ${planet.mass}<br>`	
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

function togglePaused() {
	paused = !paused
	if (!paused) drawFrame()
}
