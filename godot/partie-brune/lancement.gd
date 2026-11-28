extends Node

func _ready() -> void:
	var atelier := OS.get_cmdline_user_args().has("--atelier")
	if OS.has_feature("web"):
		atelier = JavaScriptBridge.eval("new URLSearchParams(location.search).get('atelier') === '1'")
	if atelier:
		get_window().content_scale_size = Vector2i(896,560)
		get_window().content_scale_mode = Window.CONTENT_SCALE_MODE_CANVAS_ITEMS
		get_window().content_scale_aspect = Window.CONTENT_SCALE_ASPECT_KEEP
	get_tree().change_scene_to_file.call_deferred("res://cour.tscn" if atelier else "res://partie.tscn")
