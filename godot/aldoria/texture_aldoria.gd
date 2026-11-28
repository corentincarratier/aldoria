extends RefCounted

static func charger(chemin: String) -> Texture2D:
	if ResourceLoader.exists(chemin, "Texture2D"):
		var importe := ResourceLoader.load(chemin, "Texture2D") as Texture2D
		if importe:
			return importe
	if not FileAccess.file_exists(chemin):
		return null
	var donnees := FileAccess.get_file_as_bytes(chemin)
	var image := Image.new()
	var erreur := image.load_webp_from_buffer(donnees) if chemin.ends_with(".webp") else image.load_png_from_buffer(donnees)
	return ImageTexture.create_from_image(image) if erreur == OK else null
