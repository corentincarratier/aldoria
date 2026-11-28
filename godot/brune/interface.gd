extends CanvasLayer

signal reset_requested
signal opened

@onready var menu: Panel = $Menu
var frozen := false
var slow := false

func _ready() -> void:
	$Pause.pressed.connect(toggle_menu)
	$Menu/Resume.pressed.connect(toggle_menu)
	$Menu/Slow.toggled.connect(set_slow)
	$Menu/Reset.pressed.connect(reset_course)
	$Menu.hide()

func _input(event: InputEvent) -> void:
	if not (event is InputEventKey and event.pressed and not event.echo):
		return
	if event.keycode == KEY_ESCAPE:
		toggle_menu()
		get_viewport().set_input_as_handled()
	elif event.keycode == KEY_P and not menu.visible:
		frozen = not frozen
		get_tree().paused = frozen
		if not frozen and not Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
			opened.emit()
		update_hints()
		get_viewport().set_input_as_handled()

func toggle_menu() -> void:
	frozen = false
	update_hints()
	menu.visible = not menu.visible
	get_tree().paused = menu.visible
	if menu.visible:
		opened.emit()
		$Menu/Resume.grab_focus()
	else:
		$Pause.release_focus()
		$Menu/Resume.release_focus()

func set_slow(enabled: bool) -> void:
	slow = enabled
	Engine.time_scale = 0.4 if enabled else 1.0
	$Menu/Slow.text = "Ralenti   ×0,4   ✓" if enabled else "Ralenti   ×0,4"
	update_hints()

func update_hints() -> void:
	if frozen:
		$Bar/Hints.text = "Pose figée     ·     P  Reprendre"
	else:
		var hint := "ZQSD  Courir   ·   Maj  Marcher   ·   Clic  Arc   ·   2  Prison de glace   ·   P  Figer"
		$Bar/Hints.text = ("Ralenti ×0,4     ·     " if slow else "") + hint

func reset_course() -> void:
	reset_requested.emit()
	toggle_menu()

func show_hits(count: int) -> void:
	$Bar/Hits.text = "%d impact%s" % [count, "s" if count > 1 else ""]
