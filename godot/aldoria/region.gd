@tool
extends Node2D

@export var identifiant: String
@export var donnees: Dictionary
@export_file("*.webp") var image_du_sol: String

func _ready() -> void:
	if ResourceLoader.exists(image_du_sol):
		$Sol.texture = load(image_du_sol)

func definition() -> Dictionary:
	var result := donnees.duplicate(true)
	for point in $Emplacements.get_children():
		var field: String = point.get_meta("champ")
		var index: int = point.get_meta("index", -1)
		var entry: Dictionary = result[field] if index < 0 else result[field][index]
		entry.x = point.position.x
		entry.y = point.position.y
	return result
