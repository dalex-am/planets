function delta(progress, x) {
    return Math.pow(progress, 2) * ((x + 1) * progress - x);
}

function animate(div) {
	let from = 5; // Начальная координата X
	let to = -600; // Конечная координата X
	let duration = 100; // Длительность - 0.1 секунда
	let start = new Date().getTime(); // Время старта
	setTimeout(function() {
		let now = (new Date().getTime()) - start; // Текущее время
		let progress = now / duration; // Прогресс анимации
		let result = (to - from) * delta(progress, 1.5) + from;
		div.style.left = result + "px";
		if (progress < 1) {// Если анимация не закончилась, продолжаем
			setTimeout(arguments.callee, 10);
		}
	}, 10);
}

function closeAlert(index) {
	let alertWindow = document.getElementsByClassName("alerts")[index]
	animate(alertWindow)
}

function nextAlert(index) {
	let alertWindow = document.getElementsByClassName("alerts")[index]
	let newAlert = document.getElementsByClassName("alerts")[index + 1]
	newAlert.style.left = "5px"
	animate(alertWindow)
}