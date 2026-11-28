extends CanvasLayer

signal reset_requested
signal opened

@onready var menu: Panel = $Menu

func _ready() -> void:
	$Pause.pressed.connect(toggle_menu)
	$Menu/Resume.pressed.connect(toggle_menu)
	$Menu/Slow.toggled.connect(set_slow)
	$Menu/Reset.pressed.connect(reset_course)
	$Menu.hide()

func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.keycode == KEY_ESCAPE and event.pressed and not event.echo:
		toggle_menu()
		get_viewport().set_input_as_handled()

func toggle_menu() -> void:
	menu.visible = not menu.visible
	get_tree().paused = menu.visible
	if menu.visible:
		opened.emit()
		$Menu/Resume.grab_focus()
	else:
		$Pause.release_focus()
		$Menu/Resume.release_focus()

func set_slow(enabled: bool) -> void:
	Engine.time_scale = 0.4 if enabled else 1.0
	$Menu/Slow.text = "Ralenti   ×0,4   ✓" if enabled else "Ralenti   ×0,4"
	$Bar/Hints.text = "Ralenti ×0,4     ·     " + hints() if enabled else hints()

func hints() -> String:
	return "ZQSD  Déplacer     ·     Maj  Marcher     ·     Clic maintenu  Bander l’arc"

func reset_course() -> void:
	reset_requested.emit()
	toggle_menu()

func show_hits(count: int) -> void:
	$Bar/Hits.text = "%d impact%s" % [count, "s" if count > 1 else ""]
