extends SceneTree

var failures: Array[String] = []

func _initialize() -> void:
	call_deferred("verify")

func check(condition: bool, message: String) -> void:
	if not condition:
		failures.append(message)
		printerr(message)

func key(code: Key, down: bool) -> void:
	var event := InputEventKey.new()
	event.keycode = code
	event.pressed = down
	Input.parse_input_event(event)
	Input.flush_buffered_events()

func frames(count: int) -> void:
	for i in count:
		await physics_frame

func verify() -> void:
	var game = load("res://cour.tscn").instantiate()
	root.add_child(game)
	await frames(3)
	game.restart()
	var hero = game.archer
	var spawn: Vector2 = hero.position
	var straw = game.get_node("Cibles/Paille")
	key(KEY_D, true)
	await frames(9)
	var middle: Vector2 = hero.position
	var phase_a: float = hero.stride
	hero.begin_aim(straw.position)
	await frames(12)
	check(hero.position.x > middle.x + 20.0 and hero.charging, "Viser doit permettre de courir.")
	check(not is_equal_approx(hero.stride, phase_a), "Les appuis doivent alterner.")
	var seen := {}
	for i in 26:
		seen[hero.body.pose_index()] = true
		await frames(1)
	check(seen.size() == 8, "Les huit phases du pas doivent se succéder en mouvement.")
	middle = hero.position - Vector2(26, 0)
	key(KEY_D, false)
	key(KEY_Q, true)
	await frames(6)
	check(hero.position.x < middle.x + 27.0, "Le changement de direction doit être immédiat.")
	hero.loose(straw.position)
	check(game.arrows.size() == 1, "Une flèche doit partir au relâchement.")
	var released: Vector2 = hero.position
	await frames(8)
	check(hero.position.x < released.x - 12.0, "Le tir doit préserver le déplacement.")
	key(KEY_Q, false)
	await frames(80)
	check(straw.hits == 1 and game.hits == 1, "La cible doit enregistrer l’impact.")
	var rest: Vector2 = Vector2.LEFT.rotated(hero.facing) * 13.0
	check(hero.hem.distance_to(rest) < 0.5, "La cape doit retomber après l’arrêt.")
	hero.position = Vector2(98,208)
	key(KEY_Z, true)
	await frames(40)
	key(KEY_Z, false)
	check(hero.position.y >= 182.0 and hero.position.y <= 185.0, "La margelle doit arrêter l’archer.")
	for point in [Vector2(190,99),Vector2(98,12),Vector2(12,99),Vector2(98,189)]:
		check(game.valid_position(point), "Un passage autour du puits est bloqué.")
	hero.begin_aim(straw.position)
	hero.cancel_aim()
	hero.loose(straw.position)
	check(game.arrows.is_empty(), "Annuler la visée ne doit pas tirer.")
	game.hud.toggle_menu()
	check(paused, "Le menu doit suspendre le jeu.")
	game.hud.set_slow(true)
	check(is_equal_approx(Engine.time_scale,0.4), "Le ralenti doit fonctionner.")
	game.hud.set_slow(false)
	game.hud.reset_course()
	check(not paused and hero.position == spawn and straw.hits == 0, "Retour modérateur incomplet.")
	check(Engine.max_fps == 30, "La présentation doit viser 30 images/s.")
	var guards: Array = game.get_node("Gardes").get_children()
	var guard_start: Vector2 = guards[0].position
	await frames(14)
	check(guards[0].position.distance_to(guard_start) > 4.0, "Les gardes doivent se déplacer.")
	check(game.target_ice(spawn + Vector2(600,0)).distance_to(spawn) < 366.0, "Portée de la prison dépassée.")
	var center: Vector2 = (guards[0].position + guards[1].position) * 0.5
	game.cast_ice(center)
	var effect = game.get_node("Prisons").get_child(0)
	check(effect.COUNT == 14 and effect.CRYSTALS.get_size() == Vector2(400,112), "La couronne historique doit compter quatorze cristaux.")
	check(not effect.is_paving(Vector2(98,99)) and not effect.is_paving(Vector2(870,530)), "Le gel des pavés doit épargner la source et le toit.")
	await frames(32)
	check(effect.victims.size() == 2 and not effect.chips.is_empty(), "Les deux gardes doivent entrer dans la prison.")
	var distance: float = guards[0].position.distance_to(center)
	await frames(40)
	check(guards[0].position.distance_to(center) < distance * 0.40, "Les cristaux doivent rapprocher les cibles.")
	await frames(7)
	check(guards[0].frozen > 1.6 and guards[1].frozen > 1.6, "Les gardes doivent geler ensemble.")
	var held: Vector2 = guards[0].position
	await frames(64)
	check(held.is_equal_approx(guards[0].position), "Un garde gelé doit conserver ses appuis.")
	await frames(60)
	check(game.get_node("Prisons").get_child_count() == 0 and guards[0].frozen <= 0.0, "Les pavés et la mobilité doivent revenir à la normale.")
	game.cast_ice(Vector2(98,99))
	game.restart()
	check(game.get_node("Prisons").get_child_count() == 0 and guards[0].position == guards[0].spawn, "La remise en place doit libérer la cour.")
	print("BRUNE_OK" if failures.is_empty() else "ÉCHEC DU PARCOURS")
	quit(0 if failures.is_empty() else 1)
