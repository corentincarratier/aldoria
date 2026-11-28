extends "res://jeu.gd"

var acteur
var etait_en_visee := false

func _ready() -> void:
	var portrait: SubViewport = $PortraitArcher
	var ancien := $PortraitArcher/Silhouette
	portrait.remove_child(ancien)
	ancien.queue_free()
	portrait.world_2d = World2D.new()
	acteur = preload("res://archer.tscn").instantiate()
	portrait.add_child(acteur)
	acteur.set_physics_process(false)
	acteur.collision_layer = 0
	acteur.collision_mask = 0
	super._ready()

func update_archer(state: Dictionary, dt: float) -> void:
	var pos := Vector2(state.px, state.py) * 0.60
	var distance := Vector2.ZERO
	if last_pos.is_finite() and last_pos.distance_to(pos) < 45.0:
		distance = pos - last_pos
	elif acteur.has_method("reset_pose"):
		acteur.position = pos
		acteur.reset_pose()
	last_pos = pos
	bow_active = state.bow
	if not bow_active or dt <= 0.0 or state.paused:
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
	if not capture_pending:
		capture_pending = true
		$PortraitArcher.render_target_update_mode = SubViewport.UPDATE_ONCE
		RenderingServer.frame_post_draw.connect(send_archer, CONNECT_ONE_SHOT)
