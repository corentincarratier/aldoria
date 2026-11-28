extends CharacterBody2D

signal shot(tip: Vector2, direction: Vector2, power: float)

const WALK := 85.0
const RUN := 150.0
const ROLL_TIME := 0.21

@onready var body = $Silhouette
var facing := -0.6
var aim_point := Vector2.ZERO
var charging := false
var draw_weight := 0.0
var release_left := 0.0
var roll_left := 0.0
var roll_cooldown := 0.0
var roll_direction := Vector2.RIGHT
var stride := 0.0
var hem := Vector2.ZERO
var hem_speed := Vector2.ZERO
var last_velocity := Vector2.ZERO

func _ready() -> void:
	hem = Vector2.LEFT.rotated(facing) * 13.0
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
	if roll_left > 0.0:
		return
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
	release_left = 0.16
	cancel_aim()

func roll() -> void:
	if roll_cooldown > 0.0:
		return
	cancel_aim()
	roll_direction = movement_input()
	if roll_direction.is_zero_approx():
		roll_direction = Vector2.from_angle(facing)
	roll_left = ROLL_TIME
	roll_cooldown = 0.65

func _physics_process(delta: float) -> void:
	var move := movement_input()
	var speed := WALK if Input.is_key_pressed(KEY_SHIFT) else RUN
	if roll_left > 0.0:
		velocity = roll_direction * 325.0
		facing = roll_direction.angle()
	else:
		velocity = move * speed
		if charging:
			draw_weight = minf(1.0, draw_weight + delta / 0.65)
			face_aim()
		elif release_left <= 0.0 and not move.is_zero_approx():
			facing = rotate_toward(facing, move.angle(), 13.0 * delta)
	var before := position
	move_and_slide()
	var actual := (position - before) / maxf(delta, 0.0001)
	update_pose(delta, actual)
	roll_left = maxf(0.0, roll_left - delta)
	roll_cooldown = maxf(0.0, roll_cooldown - delta)
	release_left = maxf(0.0, release_left - delta)

func update_pose(delta: float, actual: Vector2) -> void:
	var speed := actual.length()
	if speed > 1.0:
		stride = fmod(stride + speed * delta / lerpf(54.0, 74.0, smoothstep(WALK, RUN, speed)), 1.0)
	var rest := Vector2.LEFT.rotated(facing) * 13.0
	var target := rest - actual.limit_length(RUN) * 0.047
	# L’ourlet reste dans le repère du monde lorsque les épaules tournent.
	if delta > 0.0:
		hem_speed += (last_velocity - actual).limit_length(170.0) * 0.075
		hem_speed += ((target - hem) * 150.0 - hem_speed * 19.0) * delta
		hem = (hem + hem_speed * delta).limit_length(25.0)
	last_velocity = actual
	body.rotation = facing
	body.update_gait(stride, actual.rotated(-facing), hem.rotated(-facing),
		charging, draw_weight, release_left, roll_left / ROLL_TIME, delta)
