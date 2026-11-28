extends SceneTree

var partie
var delai := 0.0
var demande := false

func _initialize() -> void:
	call_deferred("charger")

func charger() -> void:
	partie = load("res://jeu.tscn").instantiate()
	root.add_child(partie)
	if partie.desktop == null:
		push_error("Le projet extrait ne charge pas Godot WRY.")
		quit(1)

func _process(delta: float) -> bool:
	delai += delta
	if partie != null and partie.region_id == "2,6" and not demande:
		demande = true
		partie.desktop.eval("window.__aldoria.enterZone('g11',{x:740,y:500})")
	if partie != null and partie.region_id == "g11" and partie.region != null:
		print("MACOS_V1_JOUABLE")
		quit(0)
	if delai >= 50.0:
		push_error("Le hameau et la grotte doivent s'afficher dans la fenêtre native.")
		quit(1)
	return false
