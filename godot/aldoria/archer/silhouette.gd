extends Node2D

const Atlas = preload("res://texture_aldoria.gd")
@onready var parties: Texture2D = Atlas.charger("res://archer/art/archer-articule.webp")
@onready var textile: Texture2D = Atlas.charger("res://archer/art/textile-details.webp")
const INK := Color("#332827")
const BRASS := Color("#dba34f")
const LIGHT := Color("#f1ca78")
const LEATHER := Color("#855337")
const GLOVE := Color("#bf8753")
const WOOL := Color("#496260")
const BOOT := Color("#4d3a32")

var phase := 0.0
var step_strength := 0.0
var travel := Vector2.RIGHT
var tail := Vector2(-13, 0)
var aiming := false
var tension := 0.0
var recoil := 0.0
var roll := 0.0

func update_gait(cycle: float, local_velocity: Vector2, local_hem: Vector2,
		aim: bool, pull: float, snap: float, tumble: float, delta: float) -> void:
	phase = cycle
	if local_velocity.length() > 1.0:
		travel = local_velocity.normalized()
	step_strength = move_toward(step_strength, minf(local_velocity.length() / 80.0, 1.0), delta * 11.0)
	tail = local_hem
	aiming = aim
	tension = pull
	recoil = snap / 0.16
	roll = sin(PI * clampf(tumble, 0.0, 1.0))
	queue_redraw()

# Pendant la moitié du cycle, la botte recule à la vitesse du sol.
func foot_offset(cycle: float) -> float:
	var u := fposmod(cycle, 1.0)
	if u < 0.5:
		return 13.5 - 54.0 * u
	return lerpf(-13.5, 13.5, smoothstep(0.5, 1.0, u))

func shape(points: PackedVector2Array, color: Color) -> void:
	draw_colored_polygon(points, color)
	var outline := points.duplicate()
	outline.append(points[0])
	draw_polyline(outline, INK, 1.15, true)

func limb(a: Vector2, b: Vector2, width: float, color: Color) -> void:
	draw_line(a, b, INK, width + 1.9, true)
	draw_line(a, b, color, width, true)
	draw_circle(a, width * 0.5, color, true, -1.0, true)
	draw_circle(b, width * 0.5, color, true, -1.0, true)

func leg(side: float, cycle: float) -> void:
	var offset := travel * foot_offset(cycle) * step_strength * (1.0 - roll * 0.7)
	var lift := maxf(0.0, -sin(TAU * cycle)) * step_strength
	var hip := Vector2(-4, side * 5.5)
	var knee := hip + offset * 0.50 + Vector2(2, side * (1.2 + lift * 2.0))
	var ankle := hip + offset + Vector2(-1.5, side * 2.0)
	var toe := ankle + Vector2(5.5 + lift, 0).rotated(travel.angle() * step_strength)
	limb(hip, knee, 6.6, Color("#49463b"))
	limb(knee, ankle, 5.5, LEATHER)
	limb(ankle, toe, 6.4 + lift, BOOT)
	draw_line(ankle + Vector2(0, -2), toe + Vector2(0, -2), Color("#b68a5e"), 1.6, true)

func mantle(sway: float) -> void:
	var left := Vector2(1.8 + sway, -10.0)
	var right := Vector2(1.8 - sway, 10.0)
	var middle := Vector2(minf(-5.5, tail.x), tail.y * 0.68)
	var a := middle + Vector2(2.5, -9.0)
	var b := middle + Vector2(-2.5, -3.5)
	var c := middle + Vector2(-1.4, 2.8)
	var d := middle + Vector2(2.5, 9.0)
	shape(PackedVector2Array([left, right, d, c, b, a]), Color("#682b40"))
	# Déformer les plis et la broderie de la cape peinte, attachée aux deux épaules.
	var texture_size := textile.get_size()
	for i in 8:
		var u := i / 8.0
		var v := (i + 1) / 8.0
		var near_l := left.lerp(a, u)
		var near_r := right.lerp(d, u)
		var far_l := left.lerp(a, v)
		var far_r := right.lerp(d, v)
		var curve_u := Vector2(0, middle.y * (u*u-u))
		var curve_v := Vector2(0, middle.y * (v*v-v))
		var coords := PackedVector2Array([near_l+curve_u, near_r+curve_u, far_r+curve_v, far_l+curve_v])
		var tx1 := 288.0 - 28.0*u
		var tx2 := 288.0 - 28.0*v
		var uv := PackedVector2Array([Vector2(tx1,1)/texture_size, Vector2(tx1,51)/texture_size, Vector2(tx2,51)/texture_size, Vector2(tx2,1)/texture_size])
		draw_polygon(coords, PackedColorArray([Color.WHITE]), uv, textile)
	draw_polyline(PackedVector2Array([a + Vector2(1,0), b + Vector2(1,0), c + Vector2(1,0), d + Vector2(1,0)]), BRASS, 1.05, true)

func arm(shoulder: Vector2, elbow: Vector2, hand: Vector2) -> void:
	limb(shoulder, elbow, 7.0, WOOL)
	limb(elbow, hand, 5.0, LEATHER)
	var wrist := elbow.lerp(hand, 0.68)
	draw_circle(wrist, 3.1, BRASS, true, -1.0, true)
	draw_circle(hand, 3.6, INK, true, -1.0, true)
	draw_circle(hand, 2.8, GLOVE, true, -1.0, true)

func nock(power: float) -> Vector2:
	return Vector2(15.0 - power * 16.0, 1.0)

func arrow_tip(power: float) -> Vector2:
	return nock(power) + Vector2(34, 0)

func bow(grip: Vector2, string_center: Vector2, show_arrow: bool) -> void:
	var top := grip + Vector2(-10,-19)
	var bottom := grip + Vector2(-10,19)
	var curve := PackedVector2Array([top, grip + Vector2(-3,-13), grip + Vector2(1,-5), grip, grip + Vector2(1,5), grip + Vector2(-3,13), bottom])
	draw_polyline(curve, INK, 3.8, true)
	draw_polyline(curve, Color("#c18b49"), 2.1, true)
	draw_polyline(PackedVector2Array([top, string_center, bottom]), Color("#e3d5a8"), 1.05, true)
	limb(grip + Vector2(0,-3), grip + Vector2(0,3), 2.8, LEATHER)
	if show_arrow:
		var tip := string_center + Vector2(34, 0)
		draw_line(string_center, tip, Color("#ecce87"), 1.75, true)
		draw_colored_polygon(PackedVector2Array([tip + Vector2(2,0), tip + Vector2(-3,-2), tip + Vector2(-3,2)]), Color("#d3e6d7"))
		draw_line(string_center + Vector2(-1,-2), string_center + Vector2(5,0), Color("#fff5d6"), 1.5, true)

func _draw() -> void:
	draw_set_transform(Vector2(1.4, 2.8), 0.0, Vector2(1.26, 0.79))
	draw_circle(Vector2.ZERO, 13.0, Color("#35282555"), true, -1.0, true)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	leg(-1.0, phase)
	leg(1.0, phase + 0.5)
	var twist := sin(TAU * phase + PI * 0.5) * step_strength
	var sway := twist * (1.5 if aiming else 3.6)
	var shoulder_l := Vector2(1 + sway,-9.5)
	var shoulder_r := Vector2(1 - sway,9.5)
	draw_set_transform(Vector2.ZERO, twist * 0.13, Vector2(1.0 - roll * 0.18, 1.0))
	draw_texture_rect_region(parties, Rect2(-8,-12,17,24), Rect2(157,1,69,126))
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	mantle(sway)
	var grip: Vector2
	var hand: Vector2
	if aiming or recoil > 0.0:
		grip = Vector2(20.0 + 3.0 * tension, 1.0)
		hand = nock(tension) if aiming else Vector2(-4.0 - 5.5 * recoil, 6.0)
		arm(shoulder_l, Vector2(10,-9.0), grip)
		bow(grip, hand if aiming else grip - Vector2(10,0), aiming)
		arm(shoulder_r, Vector2(-4.0 - tension * 8.0, 14), hand)
	else:
		grip = Vector2(4.5 + twist * 7.5, -13)
		hand = Vector2(5 - twist * 8.5, 13.5)
		arm(shoulder_l, Vector2(-2.5 + twist * 5,-13.0), grip)
		draw_set_transform(grip, -0.85, Vector2(0.83,0.83))
		bow(Vector2.ZERO, Vector2(-10,0), false)
		draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
		arm(shoulder_r, Vector2(-3.5 - twist * 4,13), hand)
	var head := Vector2(3.7 + roll * 2.0, twist * 0.9)
	draw_circle(head - Vector2(2,0), 8.3, Color("#73303b"), true, -1.0, true)
	draw_texture_rect_region(textile, Rect2(head - Vector2(10.5,10.5),Vector2(21,21)), Rect2(24,15,27,27))
	draw_circle(Vector2(0.4,7.2), 2.5, INK, true, -1.0, true)
	draw_circle(Vector2(0.4,7.2), 1.85, LIGHT, true, -1.0, true)
