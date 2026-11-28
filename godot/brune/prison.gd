extends Node2D

const CRYSTALS := preload("res://art/prison-cristaux.webp")
const GROUND := preload("res://art/cour-textile.webp")
const RADIUS := 84.0
const WINDUP := 0.4
const TRAVEL := 0.76
const DURATION := 2.4
const REACH := 365.4
const COUNT := 14

var elapsed := -WINDUP
var victims: Array[CharacterBody2D] = []
var chips: Array[Dictionary] = []
var front := Node2D.new()

func _ready() -> void:
	front.z_index = 5
	add_child(front)
	front.draw.connect(draw_crystals.bind(front, true))
	for i in COUNT:
		var ray := direction(i)
		for j in 3:
			var distance := RADIUS * (0.96 - 0.17 * j)
			var base := ray * distance + ray.orthogonal() * sin(i * 2.4 + j) * 3.0
			var points := PackedVector2Array()
			var uv := PackedVector2Array()
			var span := 4.6 + (i + j) % 4
			var allowed := true
			for corner in [Vector2(-0.95, -0.26), Vector2(-0.33, -0.59), Vector2(0.91, -0.34), Vector2(0.68, 0.32), Vector2(-0.40, 0.55)]:
				var p: Vector2 = base + (corner * span).rotated(sin(i + j) * 0.6)
				var world := global_position + p
				allowed = allowed and is_paving(world)
				points.append(p)
				uv.append(world / Vector2(896, 560))
			if allowed:
				chips.append({"face": points, "uv": uv, "distance": distance, "lift": Vector2(ray.x * 1.2, -2.2 - j * 0.35)})

static func is_paving(p: Vector2) -> bool:
	return Rect2(0, 0, 896, 560).has_point(p) and p.distance_to(Vector2(98, 99)) > 77.0 and not (p.x > 671.0 and p.y > 539.0 - (p.x - 674.0) * 0.73)

static func direction(index: int) -> Vector2:
	return Vector2.from_angle((index + 0.22) * TAU / COUNT)

func radius_now() -> float:
	return RADIUS * (1.0 - 0.46 * smoothstep(0.17, TRAVEL, elapsed))

func _physics_process(delta: float) -> void:
	var previous := elapsed
	elapsed += delta
	if elapsed < 0.0:
		return
	if previous < 0.0:
		for guard in get_tree().get_nodes_in_group("gardes_brune"):
			if global_position.distance_to(guard.global_position) <= RADIUS:
				victims.append(guard)
		previous = 0.0
	for guard in victims:
		if not is_instance_valid(guard):
			continue
		if previous < TRAVEL:
			guard.draw_in(global_position, minf(delta, TRAVEL - previous))
			if elapsed >= TRAVEL:
				guard.freeze_for(2.0)
	queue_redraw()
	front.queue_redraw()
	if elapsed >= DURATION:
		queue_free()

func _draw() -> void:
	var opacity := clampf((DURATION - elapsed) / 0.44, 0.0, 1.0)
	var radius := radius_now()
	for chip in chips:
		var lift := smoothstep(0.0, 5.0, float(chip.distance) - radius + 3.0) * opacity
		if lift <= 0.01:
			continue
		draw_colored_polygon(chip.face, Color(0.23, 0.24, 0.23, lift * 0.8))
		draw_set_transform(chip.lift * lift)
		draw_polygon(chip.face, PackedColorArray([Color(1, 1, 1, lift)]), chip.uv, GROUND)
		var face: PackedVector2Array = chip.face
		draw_line(face[0], face[1], Color(0.78, 0.89, 0.88, lift * 0.85), 1.15, true)
		draw_set_transform(Vector2.ZERO)
	draw_crystals(self, false)

func draw_crystals(layer: Node2D, foreground: bool) -> void:
	var radius := radius_now()
	var fade := clampf((DURATION - elapsed) / 0.37, 0.0, 1.0)
	var tint := Color(1, 1, 1, fade)
	for i in COUNT:
		var ray := direction(i)
		if (ray.y > 0.0) != foreground:
			continue
		var rise := clampf((elapsed - 0.019 * (i % 5)) / 0.19, 0.0, 1.0)
		if rise <= 0.0:
			continue
		var w := (17 + i * 7 % 9) * rise
		var h := (23 + i * 11 % 17) * rise
		var base := ray * radius
		layer.draw_set_transform(base + Vector2.ONE, 0.0, Vector2(1.0, 0.326))
		layer.draw_circle(Vector2.ZERO, w * 0.46, Color(0.12, 0.30, 0.37, 0.23 * fade))
		layer.draw_set_transform(base, -ray.x * 0.25, Vector2.ONE)
		layer.draw_texture_rect_region(CRYSTALS, Rect2(-w/2, -h, w, h), Rect2(i%4*100, 0, 100, 112), tint)
		layer.draw_texture_rect_region(CRYSTALS, Rect2(w*0.27, -h*0.31, w*0.36, h*0.33), Rect2((i+1)%4*100, 0, 100, 112), tint)
	layer.draw_set_transform(Vector2.ZERO)
