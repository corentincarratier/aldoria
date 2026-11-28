extends RefCounted

enum Action { REST, WALK, RUN, BOW, LIGHT, HEAVY, ROLL }

# Chaque ligne fixe les instants des poses du geste, en fraction de sa durée.
const LIGHT_TIMES := [0.0, 0.18, 0.33, 0.49, 0.72, 1.0]
const HEAVY_TIMES := [0.0, 0.11, 0.23, 0.35, 0.46, 0.56, 0.65, 0.73, 0.86, 1.0]
# x = angle de lame ; y = projection de la main ; z = rotation des épaules.
const LIGHT_KEYS := [
	Vector3(0.22, 8, 0), Vector3(-0.94, 3, -0.27), Vector3(-1.52, 2, -0.42),
	Vector3(-0.10, 15, 0.13), Vector3(0.95, 10, 0.38), Vector3(0.42, 6, 0.03)]
const HEAVY_KEYS := [
	Vector3(0.32, 7, 0), Vector3(-0.39, 4, -0.15), Vector3(-1.28, 0, -0.36),
	Vector3(-2.04, -3, -0.58), Vector3(-2.26, -4, -0.70), Vector3(-1.55, 3, -0.53),
	Vector3(-0.14, 16, 0.18), Vector3(1.19, 14, 0.51), Vector3(1.63, 8, 0.62),
	Vector3(0.42, 6, 0.04)]
# Une respiration complète, puis le contact, la compression, le passage et
# l’extension de chaque appui. La course allonge le vol et incline les épaules.
const BREATH := [0.0, 0.35, 1.0, 0.62]
const WALK_KEYS := [
	Vector3(1, 0, 0), Vector3(0.80, -0.75, 0.8), Vector3(0, 0.15, 1),
	Vector3(-0.70, 0.85, 0.55), Vector3(-1, 0, 0), Vector3(-0.80, -0.75, -0.8),
	Vector3(0, 0.15, -1), Vector3(0.70, 0.85, -0.55)]
const RUN_KEYS := [
	Vector3(1, 0.20, 0), Vector3(0.60, -1.60, 1.0), Vector3(-0.12, -0.40, 0.8),
	Vector3(-0.87, 1.85, 0.25), Vector3(-1, 0.20, 0), Vector3(-0.60, -1.60, -1.0),
	Vector3(0.12, -0.40, -0.8), Vector3(0.87, 1.85, -0.25)]
# Prise, encoche, levée, armement, ancrage. Puis lâcher, recul et retour.
# x = avance de la poignée ; y = recul de la corde ; z = angle de l’arc.
const BOW_KEYS := [
	Vector3(6, 0, -0.85), Vector3(10, 0.05, -0.58), Vector3(15, 0.22, -0.24),
	Vector3(19, 0.65, -0.075), Vector3(21, 1, 0), Vector3(21, 0, 0.035),
	Vector3(17, 0, 0.12), Vector3(6, 0, -0.85)]
# Extension, impulsion, rentrée de la tête, dos rond, passage sur l’épaule,
# sortie du pied avant, réception et redressement.
const ROLL_KEYS := [
	Vector3(-3, 1.03, -0.10), Vector3(2, 1.16, -0.22), Vector3(4, 0.80, -0.42),
	Vector3(0, 0.55, -0.68), Vector3(-3, 0.51, -0.88), Vector3(-4, 0.72, -0.58),
	Vector3(-1, 0.88, -0.24), Vector3(0, 1, 0)]

static func pair(keys: Array, index: float, looped := false) -> Vector3:
	var a := int(floor(index))
	var b := (a + 1) % keys.size() if looped else mini(a + 1, keys.size() - 1)
	return (keys[a] as Vector3).lerp(keys[b], index - floor(index))

static func breathing(phase: float) -> float:
	var n := fposmod(phase, 1.0) * 4.0
	var a := int(n)
	return lerpf(BREATH[a], BREATH[(a+1) % 4], smoothstep(0.0, 1.0, n-a))

static func gait(phase: float, running: bool) -> Vector3:
	return pair(RUN_KEYS if running else WALK_KEYS, fposmod(phase, 1.0) * 8.0, true)

static func duration(heavy: bool) -> float:
	return 0.78 if heavy else 0.36

static func strike(heavy: bool, progress: float) -> Vector3:
	var times := HEAVY_TIMES if heavy else LIGHT_TIMES
	var keys := HEAVY_KEYS if heavy else LIGHT_KEYS
	for i in range(1, times.size()):
		if progress <= times[i]:
			var blend := smoothstep(times[i-1], times[i], progress)
			return (keys[i-1] as Vector3).lerp(keys[i], blend)
	return keys.back()

static func sword_hand(pose: Vector3) -> Vector2:
	return Vector2(pose.y + 2.0, 5.8 + sin(pose.x) * 6.0).rotated(pose.z)

static func blade(heavy: bool, progress: float) -> PackedVector2Array:
	var pose := strike(heavy, progress)
	var grip := sword_hand(pose)
	var axis := Vector2.from_angle(pose.x)
	return PackedVector2Array([grip + axis * 3.0, grip + axis * (31.0 if heavy else 27.0)])

static func bow_index(tension: float, release_left: float) -> float:
	if release_left > 0.0:
		return 5.0 + 2.0 * (1.0 - clampf(release_left / 0.20, 0.0, 1.0))
	return clampf(tension * 4.0, 0.0, 4.0)

static func bow_pose(tension: float, release_left: float) -> Vector3:
	return pair(BOW_KEYS, bow_index(tension, release_left))

static func bow_grip(pose: Vector3) -> Vector2:
	return Vector2(pose.x, lerpf(-12, -1.0, inverse_lerp(6.0, 21.0, pose.x)))

static func string_offset(pose: Vector3) -> Vector2:
	return Vector2(-7.0 - 13.0 * pose.y, 0).rotated(pose.z)
