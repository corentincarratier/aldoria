extends RefCounted

# Les contacts et les chaussures restent en coordonnées de la cour.
# Une rotation du buste ne déplace donc pas le pied d’appui.
var feet: Array[Vector2] = [Vector2.ZERO, Vector2.ZERO]
var soles: Array[float] = [0.0, 0.0]
var lifts: Array[float] = [0.0, 0.0]
var support: Array[bool] = [false, false]
var takeoff: Array[Vector2] = [Vector2.ZERO, Vector2.ZERO]
var heading := 0.0
var cycle := 0.0
var running := false

func lane(index: int, direction: Vector2, scale_factor: float) -> Vector2:
	var side := -1.0 if index == 0 else 1.0
	return (direction * -3.2 + direction.orthogonal() * side * 6.5) * scale_factor

func reset(center: Vector2, facing: float, scale_factor: float) -> void:
	heading = facing
	cycle = 0.0
	for i in 2:
		feet[i] = center + lane(i, Vector2.from_angle(heading), scale_factor)
		takeoff[i] = feet[i]
		soles[i] = heading
		lifts[i] = 0.0
		support[i] = false

func advance(center: Vector2, velocity: Vector2, facing: float, scale_factor: float, dt: float) -> void:
	var speed := velocity.length()
	running = speed > 104.0
	if speed < 2.0:
		for i in 2:
			var neutral := center + lane(i, Vector2.from_angle(facing), scale_factor)
			feet[i] = feet[i].move_toward(neutral, 52.0 * dt)
			soles[i] = rotate_toward(soles[i], facing, 7.0 * dt)
			lifts[i] = move_toward(lifts[i], 0.0, 10.0 * dt)
			support[i] = false
		heading = facing
		return
	var direction := velocity / speed
	var length := (51.0 if running else 35.0) * scale_factor
	var stance := 0.38 if running else 0.57
	cycle = fposmod(cycle + speed * dt / length, 1.0)
	heading = rotate_toward(heading, direction.angle(), 13.0 * dt)
	for i in 2:
		var phase := fposmod(cycle + 0.5 * i, 1.0)
		var neutral := center + lane(i, Vector2.from_angle(heading), scale_factor)
		if phase < stance:
			if not support[i]:
				feet[i] = neutral + direction * length * (stance * 0.5 - phase)
				soles[i] = heading
			support[i] = true
			lifts[i] = 0.0
		else:
			if support[i]:
				takeoff[i] = feet[i]
			support[i] = false
			var swing := (phase - stance) / (1.0 - stance)
			# Le centre avance encore pendant le retour de cette botte.
			var contact := neutral + direction * length * (1.0 - phase + stance * 0.5)
			feet[i] = takeoff[i].lerp(contact, smoothstep(0.0, 1.0, swing))
			soles[i] = rotate_toward(soles[i], heading, 18.0 * dt)
			lifts[i] = sin(PI * swing)
