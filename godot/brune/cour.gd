extends Node2D

const Gestes := preload("res://gestes.gd")
var struck_this_swing := {}

const PRISON := preload("res://prison.gd")
var aiming_ice := false

const SPAWN := Vector2(273,341)
const SAVE := "user://cour.cfg"

@onready var archer = $Archer
@onready var hud = $Interface
var arrows: Array[Dictionary] = []
var water_time := 0.0
var hits := 0
var last_saved := Vector2.INF
var save_time := 0.0

func _ready() -> void:
	archer.shot.connect(shoot)
	archer.swing_started.connect(func(): struck_this_swing.clear())
	archer.sweep.connect(sweep_sword)
	$Projectiles.draw.connect(draw_arrows)
	hud.reset_requested.connect(restart)
	hud.opened.connect(cancel_targeting)
	var file := ConfigFile.new()
	if file.load(SAVE) == OK:
		var value = file.get_value("moderateur", "position", SPAWN)
		if value is Vector2 and valid_position(value):
			archer.position = value
			archer.reset_pose()
	print("Cour de Brune prête.")

func valid_position(p: Vector2) -> bool:
	return p.is_finite() and Rect2(10,10,876,540).has_point(p) and p.distance_to(Vector2(98,99)) > 84.1 and not (p.x > 664 and p.y > 534 - (p.x-674) * 0.73)

func save_position() -> void:
	if archer.position.is_equal_approx(last_saved) or not valid_position(archer.position):
		return
	var file := ConfigFile.new()
	file.set_value("moderateur", "position", archer.position)
	if file.save(SAVE) == OK:
		last_saved = archer.position

func cancel_targeting() -> void:
	aiming_ice = false
	archer.cancel_aim()

func target_ice(point: Vector2) -> Vector2:
	return archer.position + (point - archer.position).limit_length(PRISON.REACH)

func cast_ice(point: Vector2) -> void:
	var ice := PRISON.new()
	ice.position = target_ice(point)
	$Prisons.add_child(ice)

func restart() -> void:
	cancel_targeting()
	for effect in $Prisons.get_children():
		$Prisons.remove_child(effect)
		effect.queue_free()
	for guard in $Gardes.get_children():
		guard.reset()
	archer.position = SPAWN
	archer.reset_pose()
	struck_this_swing.clear()
	arrows.clear()
	hits = 0
	for target in $Cibles.get_children():
		target.clear()
	hud.show_hits(hits)
	save_position()
	$Projectiles.queue_redraw()

func _input(event: InputEvent) -> void:
	# Une visée engagée sur le terrain peut se terminer au-dessus d’une commande.
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and not event.pressed and archer.charging:
		archer.loose(get_global_mouse_position())
		get_viewport().set_input_as_handled()

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion:
		archer.aim_point = get_global_mouse_position()
	elif event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			if event.pressed and not aiming_ice:
				archer.begin_aim(get_global_mouse_position())
		elif event.button_index == MOUSE_BUTTON_RIGHT and event.pressed:
			cancel_targeting()
	elif event is InputEventKey and not event.echo:
		if event.keycode == KEY_2 or event.physical_keycode == KEY_2 or event.keycode == KEY_KP_2:
			if event.pressed and archer.roll_left <= 0.0 and not archer.slashing:
				archer.cancel_aim()
				aiming_ice = true
			elif not event.pressed and aiming_ice:
				cast_ice(get_global_mouse_position())
				aiming_ice = false
			get_viewport().set_input_as_handled()
		if not event.pressed:
			return
		if event.keycode in [KEY_J, KEY_K] and not aiming_ice:
			archer.swing(event.keycode == KEY_K, get_global_mouse_position())
			get_viewport().set_input_as_handled()
		elif event.keycode == KEY_SPACE:
			aiming_ice = false
			archer.roll()

func _notification(what: int) -> void:
	if what == NOTIFICATION_APPLICATION_FOCUS_OUT and is_node_ready():
		cancel_targeting()
		save_position()

func shoot(tip: Vector2, direction: Vector2, power: float) -> void:
	arrows.append({"p":archer.position, "dir":direction, "speed":355.0 + 150.0 * power,
		"range":250.0 + 270.0 * power, "launch":tip})
	$Projectiles.queue_redraw()

func sweep_sword(heavy: bool, start: float, finish: float, previous: Vector2) -> void:
	var targets := $Cibles.get_children() + $Gardes.get_children()
	# Échantillonner l’arc pendant la traversée rapide, même entre deux ticks.
	var steps := maxi(1, ceili((finish-start)*140.0))
	for i in range(steps+1):
		var fraction := float(i)/steps
		var center := previous.lerp(archer.position,fraction)
		var blade := Gestes.blade(heavy,lerpf(start,finish,fraction))
		var hilt: Vector2 = center + blade[0].rotated(archer.facing)*archer.body.scale.x
		var tip: Vector2 = center + blade[1].rotated(archer.facing)*archer.body.scale.x
		for target in targets:
			if struck_this_swing.has(target):
				continue
			var closest := Geometry2D.get_closest_point_to_segment(target.position,hilt,tip)
			var radius := 14.0 if target is Area2D else 10.0
			if closest.distance_squared_to(target.position) > radius*radius:
				continue
			var wall := PhysicsRayQueryParameters2D.create(center,closest,1)
			wall.hit_from_inside = true
			if not get_world_2d().direct_space_state.intersect_ray(wall).is_empty():
				continue
			struck_this_swing[target] = true
			var direction := center.direction_to(target.position)
			if target.has_method("melee_struck"):
				target.melee_struck(direction)
			else:
				target.struck(direction*(1.25 if heavy else 0.80))
			hits += 1
			hud.show_hits(hits)

func hit_segment(start: Vector2, end: Vector2) -> Dictionary:
	var query := PhysicsRayQueryParameters2D.create(start, end, 5)
	query.collide_with_areas = true
	query.hit_from_inside = true
	return get_world_2d().direct_space_state.intersect_ray(query)

func _physics_process(delta: float) -> void:
	water_time = fmod(water_time + delta, 4.0)
	$Eau.frame = mini(119, int(water_time * 30.0))
	save_time += delta
	if save_time >= 0.8:
		save_time = 0.0
		save_position()
	for i in range(arrows.size()-1, -1, -1):
		var arrow := arrows[i]
		var from: Vector2 = arrow.p
		var dir: Vector2 = arrow.dir
		var distance := minf(arrow.range, arrow.speed * delta)
		var to: Vector2 = arrow.get("launch", from) + dir * distance
		arrow.erase("launch")
		var hit := hit_segment(from, to)
		if not hit.is_empty():
			if hit.collider.has_method("struck"):
				hit.collider.struck(dir)
				hits += 1
				hud.show_hits(hits)
			arrows.remove_at(i)
		else:
			arrow.p = to
			arrow.range -= distance
			if arrow.range <= 0.0:
				arrows.remove_at(i)
	$Projectiles.queue_redraw()

func draw_arrows() -> void:
	var ink: Node2D = $Projectiles
	if aiming_ice:
		var point := target_ice(get_global_mouse_position())
		ink.draw_arc(archer.position, PRISON.REACH, 0, TAU, 110, Color(0.72,0.90,0.95,0.42), 1.0, true)
		ink.draw_circle(point, PRISON.RADIUS, Color(0.61,0.87,0.95,0.13))
		ink.draw_arc(point, PRISON.RADIUS, 0, TAU, 70, Color(0.70,0.93,1.0,0.90), 1.6, true)
	if archer.charging:
		var dir := Vector2.from_angle(archer.facing)
		var start: Vector2 = archer.position + archer.body.arrow_tip(archer.draw_weight).rotated(archer.facing) * archer.body.scale.x
		var reach: float = 250.0 + archer.draw_weight * 270.0
		for d in range(6, int(reach), 15):
			ink.draw_line(start + dir*d, start + dir*(d+5), Color(1,0.95,0.73,0.52), 1.0, true)
	for arrow in arrows:
		var tip: Vector2 = arrow.get("launch", arrow.p)
		var dir: Vector2 = arrow.dir
		var n := dir.orthogonal() * 1.9
		ink.draw_line(tip-dir*28.0, tip, Color("#4d3829"), 2.4, true)
		ink.draw_line(tip-dir*28.0, tip, Color("#cfaa69"), 1.2, true)
		ink.draw_colored_polygon(PackedVector2Array([tip + dir*2.0,tip-dir*4.0+n,tip-dir*4.0-n]), Color("#deebe2"))
		ink.draw_line(tip-dir*29.0+n, tip-dir*24.0, Color("#fff2ce"), 1.6, true)
