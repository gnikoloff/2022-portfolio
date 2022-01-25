vec4 blendNormal(vec4 base, vec4 blend, float opacity) {
	return (blend * opacity + base * (1.0 - opacity));
}
