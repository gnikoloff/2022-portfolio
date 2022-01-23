// https://www.ozone3d.net/tutorials/mesh_deformer_p3.php
vec4 doBoxTwist(vec4 pos, float t) {
	float st = sin(t);
	float ct = cos(t);
	vec4 new_pos;
	
	new_pos.y = pos.y * ct - pos.z * st;
	new_pos.z = pos.y * st + pos.z * ct;
	
	new_pos.x = pos.x;
	new_pos.w = pos.w;

	return new_pos;
}
