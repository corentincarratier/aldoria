extends "res://jeu.gd"

func _ready() -> void:
	inclinee = OS.get_cmdline_user_args().has("--inclinee")
	if OS.has_feature("web"):
		inclinee = JavaScriptBridge.eval("new URLSearchParams(location.search).get('vue') === 'inclinee'")
	if inclinee:
		save_file = "user://aldoria_brune_inclinee.json"
	super._ready()
