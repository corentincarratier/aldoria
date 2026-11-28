extends CharacterBody2D

const POSES := preload("res://art/pas-brune.webp")
const ICE := preload("res://art/prison-cristaux.webp")

@export_range(1, 2) var costume := 1
@export var destination := Vector2.ZERO
var spawn := Vector2.ZERO
var outward := true
var phase := 0.0
var frozen := 0.0
var pulled := 0.0
var recoil := Vector2.ZERO
var heading := 0.0
var last_frame := 1

func _ready() -> void:
	spawn = position
	reset()

func reset() -> void:
	position = spawn
	heading = spawn.angle_to_point(destination)
	outward = true
	frozen = 0.0
	pulled = 0.0
	recoil = Vector2.ZERO
	velocity = Vector2.ZERO
	phase = 0.0
	last_frame = 1
	queue_redraw()

func freeze_for(seconds: float) -> void:
	frozen = maxf(seconds, frozen)
	recoil = Vector2.ZERO

func draw_in(center: Vector2, dt: float) -> void:
	pulled = 0.09
	move_and_collide((center - position) * minf(1.0, dt * 2.35))

func struck(direction: Vector2) -> void:
	if frozen <= 0.0:
		recoil = direction * 110.0

func _physics_process(dt: float) -> void:
	frozen = maxf(0.0, frozen - dt)
	pulled = maxf(0.0, pulled - dt)
	if frozen <= 0.0 and pulled <= 0.0:
		var goal := destination if outward else spawn
		if position.distance_to(goal) < 4.0:
			outward = not outward
			goal = destination if outward else spawn
		var desired := position.direction_to(goal)
		heading = rotate_toward(heading, desired.angle(), 5.2 * dt)
		var before := position
		velocity = desired * (39.0 if costume == 1 else 47.0) + recoil
		recoil = recoil.move_toward(Vector2.ZERO, 420.0 * dt)
		move_and_slide()
		phase = fposmod(phase + position.distance_to(before) / 38.0, 1.0)
		last_frame = int(phase * 8.0) % 8
	queue_redraw()

func _draw() -> void:
	draw_set_transform(Vector2(1, 3), 0.0, Vector2(1, 0.65))
	draw_circle(Vector2.ZERO, 14.0, Color("#332b2140"))
	draw_set_transform(Vector2.ZERO, heading, Vector2.ONE)
	var frame := Rect2(last_frame * 128, costume * 128, 128, 128)
	var area := Rect2(-33, -33, 66, 66)
	var frost := smoothstep(0.0, 0.30, frozen)
	draw_texture_rect_region(POSES, area, frame, Color.WHITE.lerp(Color(0.62,0.88,1.0), frost * 0.9))
	if frozen > 0.0:
		for i in 3:
			var p := Vector2(-11 + i * 7, 7 - absi(i-1)*4)
			draw_texture_rect_region(ICE, Rect2(p, Vector2(6, 9)), Rect2(i*100,0,100,112), Color(1,1,1,frost*0.95))
	draw_set_transform(Vector2.ZERO)
