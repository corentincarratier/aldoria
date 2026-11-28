extends Node2D

const SAVE_FILE := "user://aldoria_v1_godot.json"
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
var phase := 0.0
var last_pos := Vector2.INF
var hem := Vector2.ZERO
var hem_velocity := Vector2.ZERO
var outfit_time := 0.0

func _ready() -> void:
	region_paths = JSON.parse_string(FileAccess.get_file_as_string("res://regions/index.json"))
	if FileAccess.file_exists(SAVE_FILE):
		var saved = JSON.parse_string(FileAccess.get_file_as_string(SAVE_FILE))
		if saved is Dictionary:
			slots = saved
	var definitions := {}
	for id in region_paths:
		var model = load(region_paths[id]).instantiate()
		definitions[id] = model.definition()
		model.free()
	var settings := {"regions":definitions, "saves":slots, "moderator":true, "paintGround":OS.has_feature("linux") and not OS.has_feature("web")}
	var html := FileAccess.get_file_as_string(SOURCE + "interface.html")
	var includes := {"CSS":"interface.css","HOST":"hote.js","SKILLS":"competences.js","ART":"personnages.js","GAME":"regles.js"}
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
		var temp := SAVE_FILE + ".tmp"
		var file := FileAccess.open(temp, FileAccess.WRITE)
		if file == null:
			push_warning("Sauvegarde indisponible.")
			return
		file.store_string(JSON.stringify(slots))
		file.close()
		if DirAccess.rename_absolute(temp, SAVE_FILE) != OK:
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
		last_pos = Vector2.INF
	var ratio := get_viewport_rect().size / Vector2(state.w,state.h)
	$Monde.position = Vector2(state.x,state.y) * ratio
	$Monde.scale = Vector2(state.zoom,state.zoom) * ratio
	update_archer(state, dt)

func update_archer(s: Dictionary, dt: float) -> void:
	var pos := Vector2(s.px,s.py)
	var displacement := Vector2.ZERO
	if last_pos.is_finite() and last_pos.distance_to(pos) < 45.0:
		displacement = pos - last_pos
	last_pos = pos
	bow_active = s.bow
	if not bow_active or dt <= 0 or s.paused:
		return
	var velocity := displacement / dt
	var angle := float(s.face)
	var rest := Vector2.LEFT.rotated(angle) * 13.0
	if hem.is_zero_approx():
		hem = rest
	var target := rest - velocity.limit_length(180) * 0.045
	var step := minf(dt, 0.035)
	hem_velocity += ((target-hem)*150.0-hem_velocity*19.0)*step
	hem = (hem + hem_velocity*step).limit_length(25)
	phase = fmod(phase + displacement.length()/54.0, 1.0)
	$PortraitArcher/Silhouette.update_gait(phase,velocity.rotated(-angle),hem.rotated(-angle),s.aiming,s.pull,0.0,s.roll,step)
	outfit_time += dt
	if outfit_time >= 1.0/24 and not capture_pending:
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
