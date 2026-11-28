extends CanvasLayer

signal reset_requested
signal opened

@onready var menu: Panel = $Menu
var frozen := false
var slow := false
var pose_label := ""

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
		if frozen:
			pose_label = get_parent().archer.body.pose_label()
			print("Pose figée · ",pose_label)
		else:
			print("Animation reprise.")
		if not frozen and not Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
			opened.emit()
		update_hints()
		get_viewport().set_input_as_handled()

func toggle_menu() -> void:
	frozen = false
	update_hints()
	menu.visible = not menu.visible
	get_tree().paused = menu.visible
	print("Menu ouvert." if menu.visible else "Menu fermé.")
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
		$Bar/Hints.text = "Pose figée · " + pose_label + "     ·     P reprendre"
	else:
		var hint := "ZQSD courir · Maj marcher · Clic arc · J / K coups · Espace roulade · 2 glace · P figer"
		$Bar/Hints.text = ("Ralenti ×0,4     ·     " if slow else "") + hint

func reset_course() -> void:
	reset_requested.emit()
	print("Cour replacée.")
	toggle_menu()

func show_hits(count: int) -> void:
	$Bar/Hits.text = "%d impact%s" % [count, "s" if count > 1 else ""]
