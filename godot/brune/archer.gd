extends CharacterBody2D

const Gestes := preload("res://gestes.gd")
const Appuis := preload("res://appuis.gd")

signal swing_started
signal sweep(heavy: bool, from_phase: float, to_phase: float, previous: Vector2)
signal shot(tip: Vector2, direction: Vector2, power: float)

const WALK := 85.0
const RUN := 150.0
const ROLL_TIME := 0.30

@onready var body = $Silhouette
var facing := -0.6
var aim_point := Vector2.ZERO
var charging := false
var draw_weight := 0.0
var release_left := 0.0
var roll_left := 0.0
var roll_cooldown := 0.0
var roll_direction := Vector2.RIGHT
var gait := Appuis.new()
var stride := 0.0
var slashing := false
var heavy := false
var attack_phase := 0.0
var hem := Vector2.ZERO
var hem_speed := Vector2.ZERO
var last_velocity := Vector2.ZERO

func _ready() -> void:
	hem = Vector2.LEFT.rotated(facing) * 13.0
	gait.reset(position,facing,body.scale.x)
	update_pose(0.0, Vector2.ZERO)

func axis(positive: Array, negative: Array) -> float:
	var value := 0.0
	for key in positive:
		if Input.is_key_pressed(key):
			value += 1.0
			break
	for key in negative:
		if Input.is_key_pressed(key):
			value -= 1.0
			break
	return value

func movement_input() -> Vector2:
	return Vector2(axis([KEY_D, KEY_RIGHT], [KEY_Q, KEY_A, KEY_LEFT]),
		axis([KEY_S, KEY_DOWN], [KEY_Z, KEY_W, KEY_UP])).normalized()

func begin_aim(point: Vector2) -> void:
	if roll_left > 0.0 or slashing:
		return
	release_left = 0.0
	aim_point = point
	charging = true
	draw_weight = 0.0
	face_aim()

func face_aim() -> void:
	if position.distance_squared_to(aim_point) > 1.0:
		facing = position.angle_to_point(aim_point)

func cancel_aim() -> void:
	charging = false
	draw_weight = 0.0

func loose(point: Vector2) -> void:
	if not charging:
		return
	aim_point = point
	face_aim()
	var direction := Vector2.from_angle(facing)
	var tip: Vector2 = position + body.arrow_tip(draw_weight).rotated(facing) * body.scale.x
	shot.emit(tip, direction, draw_weight)
	release_left = 0.20
	cancel_aim()

func swing(is_heavy: bool, point: Vector2) -> void:
	if slashing or roll_left > 0.0:
		return
	cancel_aim()
	release_left = 0.0
	aim_point = point
	face_aim()
	heavy = is_heavy
	slashing = true
	swing_started.emit()
	attack_phase = 0.0

func reset_pose() -> void:
	cancel_aim()
	slashing = false
	heavy = false
	attack_phase = 0.0
	roll_left = 0.0
	release_left = 0.0
	roll_cooldown = 0.0
	facing = -0.6
	velocity = Vector2.ZERO
	hem = Vector2.LEFT.rotated(facing) * 13.0
	hem_speed = Vector2.ZERO
	last_velocity = Vector2.ZERO
	gait.reset(position, facing, body.scale.x)
	body.step_strength = 0.0
	update_pose(0.0, Vector2.ZERO)

func roll() -> void:
	if roll_cooldown > 0.0:
		return
	cancel_aim()
	slashing = false
	release_left = 0.0
	roll_direction = movement_input()
	if roll_direction.is_zero_approx():
		roll_direction = Vector2.from_angle(facing)
	roll_left = ROLL_TIME
	roll_cooldown = 1.0

func _physics_process(delta: float) -> void:
	var move := movement_input()
	var speed := WALK if Input.is_key_pressed(KEY_SHIFT) else RUN
	if roll_left > 0.0:
		velocity = roll_direction * (68.0 / ROLL_TIME)
		facing = roll_direction.angle()
	else:
		velocity = move * speed
		if charging:
			draw_weight = minf(1.0, draw_weight + delta / 0.65)
			face_aim()
		elif not slashing and release_left <= 0.0 and not move.is_zero_approx():
			facing = rotate_toward(facing, move.angle(), 13.0 * delta)
	var before := position
	move_and_slide()
	var actual := (position - before) / maxf(delta, 0.0001)
	if slashing:
		var previous_phase := attack_phase
		attack_phase = minf(1.0, attack_phase + delta / Gestes.duration(heavy))
		var start := 0.46 if heavy else 0.33
		var finish := 0.78 if heavy else 0.75
		if attack_phase > start and previous_phase < finish:
			sweep.emit(heavy, maxf(start,previous_phase), minf(finish,attack_phase), before)
		if attack_phase >= 1.0:
			slashing = false
	update_pose(delta, actual)
	if roll_left > 0.0 and roll_left <= delta:
		gait.reset(position,facing,body.scale.x)
	roll_left = maxf(0.0, roll_left - delta)
	roll_cooldown = maxf(0.0, roll_cooldown - delta)
	release_left = maxf(0.0, release_left - delta)

func update_pose(delta: float, actual: Vector2) -> void:
	if roll_left <= 0.0:
		gait.advance(position,actual,facing,body.scale.x,delta)
	else:
		# Les pieds suivent le centre pendant le seul mouvement aérien de la roulade.
		for i in 2:
			gait.feet[i] += actual * delta
	stride = gait.cycle
	var rest := Vector2.LEFT.rotated(facing) * 13.0
	var target := rest - actual.limit_length(RUN) * 0.047
	# L’ourlet reste dans le repère du monde lorsque les épaules tournent.
	if delta > 0.0:
		hem_speed += (last_velocity - actual).limit_length(170.0) * 0.075
		hem_speed += ((target - hem) * 150.0 - hem_speed * 19.0) * delta
		hem = (hem + hem_speed * delta).limit_length(25.0)
	last_velocity = actual
	body.rotation = facing
	body.update_pose(self,actual,hem.rotated(-facing),delta)
