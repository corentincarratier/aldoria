extends SceneTree
func _initialize() -> void:
	var index: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://regions/index.json"))
	var result := {}
	for id in index:
		var scene = load(index[id]).instantiate()
		result[id] = scene.definition()
		scene.free()
	var output := FileAccess.open(OS.get_cmdline_user_args()[0],FileAccess.WRITE)
	output.store_string(JSON.stringify(result))
	output.close()
	print("Régions exportées : ", result.size())
	quit()
