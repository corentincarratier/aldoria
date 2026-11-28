extends Area2D

var hits := 0
var lodged := 0
var wobble := 0.0
var impact := Vector2.RIGHT

func struck(direction: Vector2) -> void:
	lodged += 1
	melee_struck(direction)

func melee_struck(direction: Vector2) -> void:
	hits += 1
	impact = direction
	wobble = 1.0
	queue_redraw()

func clear() -> void:
	hits = 0
	lodged = 0
	wobble = 0.0
	queue_redraw()

func _process(delta: float) -> void:
	if wobble > 0.0:
		wobble = maxf(0.0, wobble - delta * 2.4)
		queue_redraw()

func _draw() -> void:
	draw_set_transform(Vector2(3,5), 0.0, Vector2(1,0.75))
	draw_circle(Vector2.ZERO, 15.0, Color("#382b2847"), true, -1.0, true)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	draw_line(Vector2(-14,9), Vector2(14,9), Color("#55382b"), 5.0, true)
	draw_line(Vector2(-10,-9), Vector2(10,12), Color("#876144"), 4.0, true)
	draw_set_transform(impact * wobble * sin(wobble * 13.0) * 3.0, -0.15, Vector2(1,0.93))
	for ring in [[14.0,"#523c2c"],[12.8,"#c49c58"],[10.5,"#ddbd76"],[8.5,"#8e4737"],[6.5,"#e0c788"],[3.6,"#ab513d"]]:
		draw_circle(Vector2.ZERO, ring[0], Color(ring[1]), true, -1.0, true)
	for i in 20:
		var angle := TAU * i / 20.0 + 0.04 * sin(i * 2.0)
		var dir := Vector2.from_angle(angle)
		draw_line(dir * 10.7, dir * 12.6, Color("#805b39"), 0.85, true)
	for i in mini(lodged, 4):
		var head := Vector2.from_angle(i * 2.4) * (i + 1)
		var end := head - impact * (9.0 + i)
		draw_line(head, end, Color("#493a29"), 1.9, true)
		draw_line(end, end - impact * 3.0, Color("#f6efc8"), 2.2, true)
