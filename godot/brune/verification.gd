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
	check(absf(hero.body.foot_offset(0.0) - hero.body.foot_offset(0.5)) > 24.0, "Amplitude des appuis insuffisante.")
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
	print("BRUNE_OK" if failures.is_empty() else "ÉCHEC DU PARCOURS")
	quit(0 if failures.is_empty() else 1)
