extends Node2D

const Gestes := preload("res://gestes.gd")
const PARTS := preload("res://art/archer-articule.webp")
const PAINTED := preload("res://art/tir-brune.webp")
const CLOTH := preload("res://art/textile-details.webp")
const INK := Color("#352829")
const LEATHER := Color("#8d5c38")
const BRASS := Color("#d1a159")
const LINEN := Color("#d7c9a3")

var phase := 0.0
var step_strength := 0.0
var breath := 0.0
var velocity := Vector2.ZERO
var trail := Vector2(-13, 0)
var actor
var hood_and_cape: Texture2D
var action := Gestes.Action.REST

func _ready() -> void:
	# Relever dans le dessin de Brune les plis carmin et la capuche. Les bras
	# et l’arme restent libres de passer derrière ou devant cette pièce.
	var source := PAINTED.get_image().get_region(Rect2i(0,0,128,128))
	for y in 128:
		for x in 128:
			var pigment := source.get_pixel(x,y)
			if pigment.a < 0.02:
				continue
			var cloth := x < 74 and x > 21 and y > 35 and y < 94 and pigment.r > pigment.g*1.32 and pigment.b > pigment.g*0.69
			var head := pow((x-63.5)/15.2,2) + pow((y-58.5)/16.0,2) < 1.0
			if not cloth and not head:
				source.set_pixel(x,y,Color.TRANSPARENT)
	hood_and_cape = ImageTexture.create_from_image(source)

# Le col et le crâne suivent le buste. Les sommets de l’ourlet peuvent
# rester en arrière dans un virage sans étirer l’arc ou les chaussures.
func painted_upper(texture: Texture2D, origin: Vector2, rotation_angle: float, squash: float, swing: float, fold: float) -> void:
	var tex_size := texture.get_size()
	for col in range(1,7):
		var x0 := col*16.0
		var x1 := x0+16.0
		var y0 := 24.0
		var y1 := 104.0
		var pts := PackedVector2Array()
		var uv := PackedVector2Array()
		for point in [Vector2(x0,y0),Vector2(x1,y0),Vector2(x1,y1),Vector2(x0,y1)]:
			var p: Vector2 = (point-Vector2(61,60))*0.52
			var hem_weight := smoothstep(0.0,1.0,(61.0-point.x)/36.0)
			var grip_weight := smoothstep(0.0,1.0,(point.x-65.0)/25.0)
			p += hem_weight * Vector2(clampf(trail.x+13,-9,6)*0.62+fold*9.0,clampf(trail.y,-13,13)*0.57+fold*2)
			p.x += swing*grip_weight
			p.x *= squash
			pts.append(origin + p.rotated(rotation_angle))
			uv.append(point/tex_size)
		draw_polygon(pts,PackedColorArray([Color.WHITE]),uv,texture)

func update_pose(hero, actual: Vector2, local_hem: Vector2, dt: float) -> void:
	actor = hero
	phase = actor.gait.cycle
	step_strength = move_toward(step_strength, minf(actual.length()/78.0, 1.0), dt*12.0)
	breath = fposmod(breath + dt/2.65, 1.0)
	velocity = actual
	trail = local_hem
	if actor.roll_left > 0:
		action = Gestes.Action.ROLL
	elif actor.slashing:
		action = Gestes.Action.HEAVY if actor.heavy else Gestes.Action.LIGHT
	elif actor.charging or actor.release_left > 0:
		action = Gestes.Action.BOW
	elif actual.length() > 2:
		action = Gestes.Action.RUN if actor.gait.running else Gestes.Action.WALK
	else:
		action = Gestes.Action.REST
	queue_redraw()

func pose_label() -> String:
	var names := ["Repos","Marche","Course","Arc","Coup rapide","Coup lourd","Roulade"]
	var counts := [4,8,8,8,6,10,8]
	var number := 0
	match action:
		Gestes.Action.REST:
			number = int(breath*4)
		Gestes.Action.WALK, Gestes.Action.RUN:
			number = pose_index()
		Gestes.Action.BOW:
			number = roundi(Gestes.bow_index(actor.draw_weight,actor.release_left))
		Gestes.Action.LIGHT, Gestes.Action.HEAVY:
			var times := Gestes.HEAVY_TIMES if actor.heavy else Gestes.LIGHT_TIMES
			for i in range(1,times.size()):
				if actor.attack_phase < (times[i-1]+times[i])*0.5:
					break
				number = i
		Gestes.Action.ROLL:
			number = roundi(7.0*(1.0-actor.roll_left/actor.ROLL_TIME))
	return "%s · %d/%d" % [names[action],number+1,counts[action]]

func pose_index() -> int:
	return int(phase * 8.0) % 8

func arrow_tip(power: float) -> Vector2:
	var pose := Gestes.bow_pose(power, 0.0)
	return Gestes.bow_grip(pose) + Gestes.string_offset(pose) + Vector2(31,0)

func poly(points: PackedVector2Array, color: Color) -> void:
	draw_colored_polygon(points, color)
	var edge := points.duplicate()
	edge.append(edge[0])
	draw_polyline(edge, INK, 1.15, true)

# Un quadrilatère texturé permet de poser une pièce peinte entre deux articulations.
func piece(tex: Texture2D, region: Rect2, points: PackedVector2Array, tint := Color.WHITE) -> void:
	var uv := PackedVector2Array([region.position, Vector2(region.end.x,region.position.y),
		region.end, Vector2(region.position.x,region.end.y)])
	for i in 4:
		uv[i] /= tex.get_size()
	draw_polygon(points, PackedColorArray([tint]), uv, tex)

func leather_piece(a: Vector2, b: Vector2, width: float, rect: Rect2, tint := Color.WHITE) -> void:
	var axis := a.direction_to(b)
	if axis == Vector2.ZERO:
		axis = Vector2.RIGHT
	var n := axis.orthogonal() * width * 0.5
	var root := a - axis * 2.0
	var tip := b + axis * 2.0
	piece(PARTS, rect, PackedVector2Array([root-n,tip-n,tip+n,root+n]), tint)

func leg(index: int, tucked: float, roll_progress: float) -> void:
	var sign_y := -1.0 if index == 0 else 1.0
	var hip := Vector2(-3.2,sign_y*5.1).rotated(actor.gait.heading-global_rotation)
	var toe: Vector2 = to_local(actor.gait.feet[index])
	var angle: float = actor.gait.soles[index] - global_rotation
	var lift: float = actor.gait.lifts[index]
	if action == Gestes.Action.ROLL:
		var reach := cos(roll_progress * TAU + index * 0.8)
		toe = toe.lerp(Vector2(-1.0 + reach*8.0, sign_y*(7.5 + 4.0*absf(reach))), tucked)
		angle = lerp_angle(angle, sign_y*0.28, tucked)
		lift = maxf(lift, tucked)
	var shin := Vector2.from_angle(angle)
	var heel := toe - shin * 7.35
	var knee := hip.lerp(heel, 0.45) + Vector2(1.5,sign_y*(1.0+lift*2.6))
	if lift > 0.18 and action != Gestes.Action.ROLL:
		draw_line(heel+Vector2(1.4,2.3),toe+Vector2(1.4,2.3),Color("#30231b37"),5.5,true)
	draw_line(hip, knee, Color("#474138"), 6.0, true)
	leather_piece(knee, heel, 6.6, Rect2(417,46,58,35))
	leather_piece(heel, toe, 7.5 + lift, Rect2(666,45,70,39), Color(1,0.98,0.95))
	draw_line(heel + shin.orthogonal()*2, heel + shin*3.8 + shin.orthogonal()*1.8, BRASS.darkened(0.22), 1.0, true)

func arm(shoulder: Vector2, elbow: Vector2, hand: Vector2) -> void:
	draw_line(shoulder,elbow,INK,7.8,true)
	draw_line(shoulder,elbow,LINEN,5.9,true)
	draw_circle(shoulder,3.1,LINEN,true,-1.0,true)
	leather_piece(elbow, hand, 6.2, Rect2(417,46,58,35))
	var wrist := elbow.lerp(hand,0.70)
	draw_circle(wrist,2.8,BRASS,true,-1.0,true)
	draw_texture_rect_region(PARTS,Rect2(hand-Vector2(3.8,3.8),Vector2(7.6,7.6)),Rect2(552,48,43,36))

func bow(grip: Vector2, angle: float, pull: Vector2, arrow: bool) -> void:
	var bow_top := grip+Vector2(-7,-16).rotated(angle)
	var bow_bottom := grip+Vector2(-7,16).rotated(angle)
	var curve := PackedVector2Array([bow_top,grip+Vector2(-2,-11).rotated(angle),grip,grip+Vector2(-2,11).rotated(angle),bow_bottom])
	draw_polyline(curve, INK, 3.4, true)
	draw_polyline(curve, BRASS, 1.65, true)
	draw_polyline(PackedVector2Array([bow_top,pull,bow_bottom]),Color("#eee0b9"),0.95,true)
	if arrow:
		var tip := pull+Vector2(31,0)
		draw_line(pull,tip,Color("#dcb979"),1.45,true)
		draw_colored_polygon(PackedVector2Array([tip,tip+Vector2(-4,-1.8),tip+Vector2(-4,1.8)]),Color("#dbe2d5"))
		draw_line(pull-Vector2(1,2),pull+Vector2(4,0),Color("#f5e4c8"),1.5,true)

func sword(grip: Vector2, angle: float, heavy: bool) -> void:
	var axis := Vector2.from_angle(angle)
	var n := axis.orthogonal()
	var length := 31.0 if heavy else 27.0
	var base := grip + axis*4.0
	var tip := grip + axis*length
	var width := 2.8 if heavy else 2.1
	poly(PackedVector2Array([base-n*width,tip-axis*4.2-n*1.6,tip,tip-axis*4.2+n*1.6,base+n*width]),Color("#a4b2ae"))
	draw_line(base,tip-axis*1.3,Color("#eaf0de"),1.0,true)
	draw_line(base-n*4.2,base+n*4.2,BRASS,2.3,true)
	draw_line(grip-axis*4,base,LEATHER,2.3,true)
	draw_circle(grip-axis*4.5,1.6,BRASS,true,-1.0,true)

func _draw() -> void:
	if actor == null:
		return
	draw_set_transform(Vector2(1.4,2.9),0.0,Vector2(1.18,0.72))
	draw_circle(Vector2.ZERO,13.3,Color("#30221f52"),true,-1.0,true)
	draw_set_transform(Vector2.ZERO)
	var breath_amount := Gestes.breathing(breath)
	var gait := Gestes.gait(phase,actor.gait.running) * step_strength
	var bowing := action == Gestes.Action.BOW
	var slashing := action == Gestes.Action.LIGHT or action == Gestes.Action.HEAVY
	var strike := Vector3.ZERO
	var roll_progress := 0.0
	var tumble := Vector3(0,1,0)
	if action == Gestes.Action.ROLL:
		roll_progress = clampf(1.0 - actor.roll_left/actor.ROLL_TIME,0,1)
		tumble = Gestes.pair(Gestes.ROLL_KEYS,roll_progress*7.0)
	if slashing:
		strike = Gestes.strike(actor.heavy,actor.attack_phase)
	var tuck := 1.0 - tumble.y
	leg(0,clampf(tuck*2.2,0,1),roll_progress)
	leg(1,clampf(tuck*2.2,0,1),roll_progress)
	var direction := velocity.rotated(-global_rotation).normalized()
	var origin := direction*(gait.y*0.65 + (2.0*step_strength if actor.gait.running else 0.0))
	origin += Vector2(tumble.x, gait.z*0.76)
	var twist: float = gait.x*(0.07 if bowing else 0.16) + strike.z + tumble.z
	if action in [Gestes.Action.REST, Gestes.Action.WALK, Gestes.Action.RUN]:
		painted_upper(PAINTED,origin+Vector2(0.60*breath_amount,0),twist,1.0+0.020*breath_amount,gait.x*(2.3 if actor.gait.running else 1.4),0.0)
		return
	draw_set_transform(origin,twist,Vector2(tumble.y,1+0.18*tuck))
	draw_texture_rect_region(PARTS,Rect2(-8.8,-11.3,18.0,22.6),Rect2(158,1,67,125),Color("#c1a68c"))
	draw_set_transform(Vector2.ZERO)
	var left := origin + Vector2(1.4,-8.0).rotated(twist)
	var right := origin + Vector2(1.4,8.0).rotated(twist)
	var elbow_l: Vector2
	var elbow_r: Vector2
	var hand_l: Vector2
	var hand_r: Vector2
	var bow_angle := -0.85
	var string := Vector2.ZERO
	if bowing:
		var bp := Gestes.bow_pose(actor.draw_weight,actor.release_left)
		hand_l = Gestes.bow_grip(bp)
		string = hand_l + Gestes.string_offset(bp)
		bow_angle = bp.z
		hand_r = string if actor.charging else Vector2(-5+12*(1-actor.release_left/0.20),6.5)
		elbow_l = left.lerp(hand_l,0.50) + Vector2(0,-2)
		elbow_r = Vector2(-3-bp.y*8,13.5)
	elif slashing:
		hand_r = Gestes.sword_hand(strike)
		elbow_r = right.lerp(hand_r,0.48)+Vector2(-1.5,5.0)
		hand_l = hand_r - Vector2.from_angle(strike.x)*4.8 if actor.heavy else origin+Vector2(4,-12).rotated(twist)
		elbow_l = left.lerp(hand_l,0.45)+Vector2(-2,-3)
	else:
		var swing := gait.x*(7.0 if actor.gait.running else 4.3)
		hand_l = origin+Vector2(4+swing+3*tuck,-12+6*tuck).rotated(twist)
		hand_r = origin+Vector2(4-swing+3*tuck,12-6*tuck).rotated(twist)
		elbow_l = left.lerp(hand_l,0.5)+Vector2(-2,-2)
		elbow_r = right.lerp(hand_r,0.5)+Vector2(-2,2)
		string = hand_l + Vector2(-7,0).rotated(bow_angle)
	arm(left,elbow_l,hand_l)
	painted_upper(hood_and_cape,origin,twist,tumble.y,0.0,clampf(tuck*2,0,1))
	if slashing:
		sword(hand_r,strike.x,actor.heavy)
	elif action != Gestes.Action.ROLL:
		bow(hand_l,bow_angle,string,bowing and actor.charging)
	arm(right,elbow_r,hand_r)
	if slashing or action == Gestes.Action.ROLL:
		# L’arc passe en bandoulière, sa branche dépasse de chaque épaule.
		var limb_a := origin+Vector2(-11,-11).rotated(twist)
		var limb_b := origin+Vector2(-3,12).rotated(twist)
		var back_bow := PackedVector2Array([limb_a,origin+Vector2(-4,-7).rotated(twist),origin+Vector2(-0.5,2).rotated(twist),limb_b])
		draw_polyline(back_bow,INK,2.8,true)
		draw_polyline(back_bow,BRASS,1.3,true)
		draw_line(limb_a,limb_b,Color("#c2b589"),0.8,true)
	if action == Gestes.Action.ROLL and roll_progress > 0.29 and roll_progress < 0.77:
		# La cape passe par-dessus la nuque, puis les semelles franchissent
		# l’épaule. Le dessin retrouve son sens quand le pied avant se déplie.
		var turn := sin(PI*(roll_progress-0.29)/0.48)
		var shoulder := origin+Vector2(1.7,-1.4)
		draw_set_transform(shoulder,tumble.z*0.55,Vector2.ONE)
		piece(CLOTH,Rect2(261,3,27,47),PackedVector2Array([
			Vector2(-8,-8),Vector2(3+7*turn,-6),Vector2(6+6*turn,5),Vector2(-8,9)]))
		for i in 2:
			var x := -4.0+sin((roll_progress*1.8+i*0.22)*PI)*10.0
			var shoe := Vector2(x,(-1.0 if i==0 else 1.0)*(5.0+turn))
			leather_piece(shoe-Vector2(3,0),shoe+Vector2(3,0),5.2,Rect2(666,45,70,39))
		draw_set_transform(Vector2.ZERO)
