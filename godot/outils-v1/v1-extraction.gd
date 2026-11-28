extends SceneTree
func _initialize() -> void:
	var index: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://regions/index.json"))
	var result := {}
	for id in index:
		var scene = load(index[id]).instantiate()
		if id == "2,6":
			var maison = scene.get_node("Emplacements/houses_0_long")
			var depart: Vector2 = maison.position
			var visuel := Image.create(8,8,false,Image.FORMAT_RGBA8)
			visuel.fill(Color.CORNFLOWER_BLUE)
			maison.apparence = ImageTexture.create_from_image(visuel)
			maison.position += Vector2(10,10)
			var modif: Dictionary = scene.definition().houses[0]
			if modif.x != maison.position.x or not modif.apparenceGodot.src.begins_with("data:image/png;base64,"):
				push_error("Le changement de position et de texture doit parvenir au jeu.")
				quit(1)
				return
			maison.position = depart
			maison.apparence = null
		result[id] = scene.definition()
		scene.free()
	var output := FileAccess.open(OS.get_cmdline_user_args()[0],FileAccess.WRITE)
	output.store_string(JSON.stringify(result))
	output.close()
	print("Régions exportées : ", result.size())
	quit()
