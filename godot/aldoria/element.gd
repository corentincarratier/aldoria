@tool
extends Marker2D

## Image de remplacement du personnage ou du bâtiment, centrée sur le repère.
@export var apparence: Texture2D:
	set(value):
		apparence = value
		if is_inside_tree() and Engine.is_editor_hint():
			actualiser()
@export var decalage := Vector2.ZERO:
	set(value):
		decalage = value
		if is_inside_tree() and Engine.is_editor_hint():
			actualiser()
@export var echelle := Vector2.ONE:
	set(value):
		echelle = value
		if is_inside_tree() and Engine.is_editor_hint():
			actualiser()

var apercu: Sprite2D

func _ready() -> void:
	if Engine.is_editor_hint():
		actualiser()

func actualiser() -> void:
	if not is_instance_valid(apercu):
		apercu = Sprite2D.new()
		add_child(apercu, false, Node.INTERNAL_MODE_BACK)
	var zone: String = get_parent().get_parent().identifiant
	var nom := "%s_%s_%s.png" % [zone.replace(",", "_"), get_meta("champ"), get_meta("index")]
	var chemin := "res://apercus/" + nom
	apercu.texture = apparence if apparence else (load(chemin) if ResourceLoader.exists(chemin) else null)
	apercu.position = decalage if apparence else Vector2.ZERO
	apercu.scale = echelle if apparence else Vector2.ONE

func appliquer(donnees: Dictionary) -> void:
	if apparence == null:
		return
	var image := apparence.get_image()
	if image == null:
		return
	donnees["apparenceGodot"] = {
		"src": "data:image/png;base64," + Marshalls.raw_to_base64(image.save_png_to_buffer()),
		"x": decalage.x, "y": decalage.y, "sx": echelle.x, "sy": echelle.y
	}
