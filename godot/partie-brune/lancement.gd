extends Node

func _ready() -> void:
	var atelier := OS.get_cmdline_user_args().has("--atelier")
	if OS.has_feature("web"):
		atelier = JavaScriptBridge.eval("new URLSearchParams(location.search).get('atelier') === '1'")
	get_tree().change_scene_to_file.call_deferred("res://cour.tscn" if atelier else "res://partie.tscn")
