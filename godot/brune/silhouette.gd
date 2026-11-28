extends Node2D

const Gestes := preload("res://gestes.gd")
const PARTS := preload("res://art/archer-articule.webp")
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
var action := Gestes.Action.REST

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
	var hip := Vector2(-3.2,sign_y*5.1)
	var toe: Vector2 = to_local(actor.gait.feet[index])
	var angle: float = actor.gait.soles[index] - global_rotation
	var lift: float = actor.gait.lifts[index]
	if action == Gestes.Action.ROLL:
		var reach := cos(roll_progress * TAU + index * 0.8)
		toe = toe.lerp(Vector2(-1.0 + reach*8.0, sign_y*(7.5 + 4.0*absf(reach))), tucked)
		angle = lerp_angle(angle, sign_y*0.28, tucked)
		lift = maxf(lift, tucked)
	var shin := Vector2.from_angle(angle)
	var heel := toe - shin * 5.4
	var knee := hip.lerp(heel, 0.45) + Vector2(1.5,sign_y*(1.0+lift*2.6))
	draw_line(hip, knee, Color("#474138"), 6.0, true)
	leather_piece(knee, heel, 6.6, Rect2(417,46,58,35))
	leather_piece(heel, toe, 7.5 + lift, Rect2(666,45,70,39), Color(1,0.98,0.95))
	draw_line(heel + shin.orthogonal()*2, heel + shin*3.8 + shin.orthogonal()*1.8, BRASS.darkened(0.22), 1.0, true)

func mantle(origin: Vector2, twist: float, fold: float, breathing: float) -> void:
	var near_a := origin + Vector2(2.8,-9.8-breathing*0.45).rotated(twist)
	var near_b := origin + Vector2(2.8,9.8+breathing*0.45).rotated(twist)
	var back := origin + Vector2(clampf(trail.x,-21.0,-7.5) + fold*5, clampf(trail.y*0.57,-9,9))
	var far_a := back + Vector2(0,-10)
	var far_b := back + Vector2(-1.7,9.5)
	poly(PackedVector2Array([near_a,near_b,far_b,back+Vector2(-3,5),back+Vector2(-2,-2),far_a]), Color("#70283b"))
	var dims := CLOTH.get_size()
	for i in 6:
		var u := float(i)/6.0
		var v := float(i+1)/6.0
		var pts := PackedVector2Array([near_a.lerp(far_a,u),near_b.lerp(far_b,u),near_b.lerp(far_b,v),near_a.lerp(far_a,v)])
		var x0 := 288.0 - 27*u
		var x1 := 288.0 - 27*v
		var uv := PackedVector2Array([Vector2(x0,2)/dims,Vector2(x0,50)/dims,Vector2(x1,50)/dims,Vector2(x1,2)/dims])
		draw_polygon(pts, PackedColorArray([Color.WHITE]), uv, CLOTH)
	draw_polyline(PackedVector2Array([far_a+Vector2(2,1),back+Vector2(0,-2),back+Vector2(-0.5,4),far_b+Vector2(1,-1)]), BRASS, 1.1, true)

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
	mantle(origin,twist,clampf(tuck*2,0,1),breath_amount)
	if slashing:
		sword(hand_r,strike.x,actor.heavy)
	elif action != Gestes.Action.ROLL:
		bow(hand_l,bow_angle,string,bowing and actor.charging)
	arm(right,elbow_r,hand_r)
	var head := origin + Vector2(4.1+0.6*breath_amount - tuck*10,gait.z*0.37).rotated(twist*0.65)
	draw_set_transform(head,twist*0.68,Vector2(1.0-tuck*0.55,1.0))
	draw_texture_rect_region(CLOTH,Rect2(-9,-9,18,18),Rect2(23,14,29,30))
	draw_set_transform(Vector2.ZERO)
	draw_circle(origin+Vector2(-0.3,7.4).rotated(twist),1.8,BRASS,true,-1.0,true)
