extends Node2D

@export var save_file := "user://aldoria_v1_godot.json"
const SOURCE := "res://v1/"
var region_paths: Dictionary
var slots: Dictionary = {}
var region_id := ""
var region: Node2D
var web
var web_save
var desktop
var awaiting_frame := false
var elapsed := 0.0
var bow_active := false
var capture_pending := false
var acteur
var etait_en_visee := false
var last_pos := Vector2.INF
var outfit_time := 0.0

func _ready() -> void:
	var portrait: SubViewport = $PortraitArcher
	portrait.world_2d = World2D.new()
	acteur = preload("res://archer/brune/archer.tscn").instantiate()
	portrait.add_child(acteur)
	acteur.set_physics_process(false)
	acteur.collision_layer = 0
	acteur.collision_mask = 0
	region_paths = JSON.parse_string(FileAccess.get_file_as_string("res://regions/index.json"))
	if FileAccess.file_exists(save_file):
		var saved = JSON.parse_string(FileAccess.get_file_as_string(save_file))
		if saved is Dictionary:
			slots = saved
	var definitions := {}
	for id in region_paths:
		var model = load(region_paths[id]).instantiate()
		definitions[id] = model.definition()
		model.free()
	var settings := {"regions":definitions, "saves":slots, "moderator":true}
	var html := FileAccess.get_file_as_string(SOURCE + "interface.html")
	html = html.replace("/*ALDORIA_PLANCHES*/", "window.aldoriaPlanches=" + FileAccess.get_file_as_string(SOURCE + "planches.json") + ";")
	var scenario := SOURCE + "scenario.js"
	if FileAccess.file_exists(scenario):
		html = html.replace("/*ALDORIA_SCENARIO*/", FileAccess.get_file_as_string(scenario))
	var includes := {"CSS":"interface.css","HOST":"hote.js","SKILLS":"competences.js","ILLUSTRATIONS":"illustrations.js","ART":"personnages.js","GAME":"regles.js"}
	for key in includes:
		html = html.replace("/*ALDORIA_" + key + "*/", FileAccess.get_file_as_string(SOURCE + includes[key]))
	html = html.replace("/*ALDORIA_SETTINGS*/", "window.aldoriaSettings=" + JSON.stringify(settings).replace("<", "\\u003c") + ";")
	if OS.has_feature("web"):
		JavaScriptBridge.eval(FileAccess.get_file_as_string("res://surface_web.js"), true)
		web = JavaScriptBridge.get_interface("AldoriaGodot")
		web_save = JavaScriptBridge.create_callback(_on_web_save)
		web.mount(html, web_save)
	elif ClassDB.class_exists("WebView"):
		desktop = ClassDB.instantiate("WebView")
		desktop.full_window_size = true
		desktop.transparent = true
		desktop.forward_input_events = false
		desktop.url = ""
		desktop.html = html
		desktop.ipc_message.connect(receive)
		add_child(desktop)
	else:
		var message := Label.new()
		message.text = "Pour jouer dans cet éditeur, ouvre le projet de bureau avec Godot WRY inclus.\nLa copie en ligne est aussi jouable sur la page d’Aldoria."
		add_child(message)
		set_process(false)

func _on_web_save(args: Array) -> void:
	receive(str(args[0]))

func receive(message: String) -> void:
	var packet = JSON.parse_string(message)
	if not packet is Dictionary:
		return
	if packet.get("type") == "frame":
		awaiting_frame = false
		apply_frame(packet.state, packet.dt)
	elif packet.get("type") == "save" and packet.get("key") in ["aldoria-v2","aldoria-test","aldoria-audio-muted"]:
		slots[packet.key] = packet.value
		var temp := save_file + ".tmp"
		var file := FileAccess.open(temp, FileAccess.WRITE)
		if file == null:
			push_warning("Sauvegarde indisponible.")
			return
		file.store_string(JSON.stringify(slots))
		file.close()
		if DirAccess.rename_absolute(temp, save_file) != OK:
			push_warning("Écriture de la sauvegarde impossible.")
		elif OS.has_feature("web") and JavaScriptBridge.has_method("force_fs_sync"):
			JavaScriptBridge.call("force_fs_sync")

func _process(delta: float) -> void:
	if web != null:
		var result = web.tick(delta)
		if result is String and not result.is_empty():
			var state = JSON.parse_string(result)
			if state is Dictionary:
				apply_frame(state, delta)
	elif desktop != null:
		elapsed += delta
		if not awaiting_frame or elapsed > 0.30:
			var dt := minf(elapsed,0.05)
			elapsed = 0.0
			awaiting_frame = true
			desktop.eval("if(window.aldoriaHost?.advance)ipc.postMessage(JSON.stringify({type:'frame',dt:%s,state:aldoriaHost.tick(%s)}))" % [dt,dt])

func apply_frame(state: Dictionary, dt: float) -> void:
	$Monde.visible = state.get("active", false)
	if not $Monde.visible or float(state.get("w",0)) <= 0 or float(state.get("h",0)) <= 0:
		return
	var next_id := str(state.zone)
	if next_id != region_id:
		if not region_paths.has(next_id):
			return
		if region != null:
			$Monde.remove_child(region)
			region.queue_free()
		region_id = next_id
		region = load(region_paths[region_id]).instantiate()
		$Monde.add_child(region)
		transmettre_sol()
		last_pos = Vector2.INF
	var ratio := get_viewport_rect().size / Vector2(state.w,state.h)
	$Monde.position = Vector2(state.x,state.y) * ratio
	$Monde.scale = Vector2(state.zoom,state.zoom) * ratio
	update_archer(state, dt)

func transmettre_sol() -> void:
	var sol: Sprite2D = region.get_node("Sol")
	if sol.texture == null:
		return
	var donnees := PackedByteArray()
	var format_image := "image/webp"
	# Dans le projet source, transmettre directement le fichier choisi dans la scène.
	if FileAccess.file_exists(region.image_du_sol):
		donnees = FileAccess.get_file_as_bytes(region.image_du_sol)
	# L’export Godot peut contenir uniquement la texture importée.
	if donnees.is_empty():
		var image := sol.texture.get_image()
		if image == null:
			return
		if image.is_compressed() and image.decompress() != OK:
			return
		donnees = image.save_png_to_buffer()
		format_image = "image/png"
	if donnees.is_empty():
		return
	var t := sol.transform
	var rect := sol.get_rect()
	var parametres := [t.x.x, t.x.y, t.y.x, t.y.y, t.origin.x, t.origin.y, rect.position.x, rect.position.y, rect.size.x, rect.size.y]
	var source := "data:" + format_image + ";base64," + Marshalls.raw_to_base64(donnees)
	if web != null:
		web.terrain(region_id, source, JSON.stringify(parametres))
	elif desktop != null:
		desktop.eval("window.aldoriaHost?.terrain(%s,%s,%s)" % [JSON.stringify(region_id),JSON.stringify(source),JSON.stringify(parametres)])
	sol.hide()

func update_archer(state: Dictionary, dt: float) -> void:
	var pos := Vector2(state.px, state.py) * 0.60
	var distance := Vector2.ZERO
	if last_pos.is_finite() and last_pos.distance_to(pos) < 45.0:
		distance = pos - last_pos
	elif acteur.has_method("reset_pose"):
		acteur.position = pos
		acteur.reset_pose()
	last_pos = pos
	bow_active = true
	acteur.body.equipped_bow = state.bow
	acteur.slashing = not state.bow and state.get("swing", 0.0) > 0.0
	acteur.heavy = state.get("heavy", false)
	acteur.attack_phase = float(state.get("swing", 0.0))
	if dt <= 0.0 or state.paused:
		etait_en_visee = false
		return
	acteur.position = pos
	acteur.facing = state.face
	acteur.charging = state.aiming
	acteur.draw_weight = state.pull
	acteur.roll_left = state.roll * acteur.ROLL_TIME
	acteur.release_left = 0.16 if etait_en_visee and not acteur.charging else maxf(0.0, acteur.release_left - dt)
	etait_en_visee = acteur.charging
	acteur.update_pose(dt, distance / dt)
	var viewport_transform := Transform2D(-acteur.facing, Vector2.ZERO)
	viewport_transform.origin = Vector2(48,48) - viewport_transform * pos
	$PortraitArcher.canvas_transform = viewport_transform
	outfit_time += dt
	if outfit_time >= 1.0 / 24.0 and not capture_pending:
		outfit_time = 0.0
		capture_pending = true
		$PortraitArcher.render_target_update_mode = SubViewport.UPDATE_ONCE
		RenderingServer.frame_post_draw.connect(send_archer, CONNECT_ONE_SHOT)

func send_archer() -> void:
	capture_pending = false
	if not bow_active:
		return
	var pixels: Image = $PortraitArcher.get_texture().get_image()
	if pixels == null:
		return
	if pixels.get_format() != Image.FORMAT_RGBA8:
		pixels.convert(Image.FORMAT_RGBA8)
	var data := Marshalls.raw_to_base64(pixels.get_data())
	if web != null:
		web.outfit(data)
	elif desktop != null:
		desktop.eval("window.aldoriaHost?.outfit('%s')" % data)

func _exit_tree() -> void:
	if web != null:
		web.close()
