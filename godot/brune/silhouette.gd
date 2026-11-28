extends Node2D

const POSES := preload("res://art/pas-brune.webp")
const AIM := preload("res://art/tir-brune.webp")
const TILE := 128.0
const DISPLAY := 58.0

var phase := 0.0
var step_strength := 0.0
var speed := 0.0
var tail := Vector2(-13, 0)
var aiming := false
var tension := 0.0
var recoil := 0.0
var roll := 0.0
var travel := Vector2.RIGHT

func update_gait(cycle: float, local_velocity: Vector2, local_hem: Vector2,
		aim: bool, pull: float, snap: float, tumble: float, delta: float) -> void:
	phase = cycle
	speed = local_velocity.length()
	if speed > 1.0:
		travel = local_velocity.normalized()
	step_strength = move_toward(step_strength, minf(speed / 80.0, 1.0), delta * 12.0)
	tail = local_hem
	aiming = aim
	tension = pull
	recoil = snap
	roll = sin(PI * clampf(tumble, 0.0, 1.0))
	queue_redraw()

func pose_index() -> int:
	if step_strength < 0.1:
		return 2
	return int(fposmod(phase, 1.0) * 8.0)

func arrow_tip(power: float) -> Vector2:
	return Vector2(25.0 + 2.0 * power, 0.0)

# Les bandes partagent leurs sommets. Seul le pan derrière les épaules
# prend du retard au virage et revient contre le dos après l’arrêt.
func painted_body(texture: Texture2D, frame: int, size: float, anchor: Vector2) -> void:
	var area := texture.get_size()
	var coords := PackedVector2Array()
	var uv := PackedVector2Array()
	for i in 4:
		var from := i / 4.0
		var to := (i + 1) / 4.0
		coords.clear()
		uv.clear()
		for point in [Vector2(from,0), Vector2(to,0), Vector2(to,1), Vector2(from,1)]:
			var weight := pow(clampf((0.50 - point.x) * 2.0, 0.0, 1.0), 1.65)
			var drag := Vector2(clampf(tail.x + 13.0, -3.0, 3.0), clampf(tail.y, -11.0, 11.0) * 0.55)
			coords.append((point - anchor) * size + drag * weight)
			uv.append(Vector2((frame + point.x) * TILE, point.y * TILE) / area)
		draw_polygon(coords, PackedColorArray([Color.WHITE]), uv, texture)

func _draw() -> void:
	draw_set_transform(Vector2(1.5, 2.8), 0.0, Vector2(1.20, 0.72))
	draw_circle(Vector2.ZERO, 13.0, Color("#35282555"), true, -1.0, true)
	var index := pose_index()
	var fast := smoothstep(86.0, 150.0, speed)
	var lift := (1.0 - cos(phase * TAU * 2.0)) * 0.5 * step_strength
	draw_set_transform(Vector2(lift * fast * 0.85, 0), 0, Vector2(1.0 + fast * 0.06 + roll * 0.12, 1.0 - roll * 0.20))
	if aiming or recoil > 0.0:
		var foot_index := (8-index) % 8 if travel.x < -0.35 else index
		draw_set_transform(Vector2.ZERO, travel.angle() if speed > 1.0 else 0.0)
		draw_texture_rect_region(POSES, Rect2(-29,-29,58,58), Rect2(foot_index*128,384,128,128))
		draw_set_transform(Vector2.ZERO)
		var bow_pose := 3 if recoil > 0.0 else mini(2, int(tension * 3.0))
		painted_body(AIM, bow_pose, 68.0, Vector2(0.50,0.46))
	else:
		painted_body(POSES, index, DISPLAY, Vector2(0.50,0.50))
