#version 300 es

-- DEFINES_HOOK --

uniform Camera {
  mat4 projectionViewMatrix;
};

uniform mat4 u_modelMatrix;
uniform float time;

in vec4 aPosition;
in vec2 aUv;

#ifdef USE_UV_TRANSFORM
  in vec4 aInstanceUvOffsets;
  in vec2 aImageSize;
  
  out vec4 vInstanceUvOffsets;
  out vec2 vImageSize;
#endif

#ifdef USE_SHADING
  in vec4 aNormal;
  out vec4 vNormal;
#endif

#ifdef USE_INSTANCING
  in mat4 aInstanceMatrix;
#endif

#ifdef USE_TEXTURE
  uniform sampler2D diffuse;
#endif

#ifdef USE_DEFORM
  uniform float deformAngle;
#endif

out vec2 vUv;

// https://www.ozone3d.net/tutorials/mesh_deformer_p3.php
vec4 doTwist(vec4 pos, float t) {
	float st = sin(t);
	float ct = cos(t);
	vec4 new_pos;
	
	new_pos.y = pos.y*ct - pos.z*st;
	new_pos.z = pos.y*st + pos.z*ct;
	
	new_pos.x = pos.x;
	new_pos.w = pos.w;

	return new_pos;
}

void main () {
  mat4 worldMatrix = mat4(1.0);
  
  #ifdef USE_INSTANCING
    worldMatrix = aInstanceMatrix;
  #endif

  #ifdef USE_MODEL_MATRIX
    worldMatrix *= u_modelMatrix;
  #endif


  vec4 position = aPosition;

  #ifdef USE_DEFORM
    float timeS = time / 1000.0;
    float ang = (position.x + 0.5) * sin(deformAngle);
    position = doTwist(position, ang);
  #endif

  gl_Position = projectionViewMatrix * worldMatrix * position;

  #ifdef USE_SHADING
    vec4 normal = aNormal;
    #ifdef USE_DEFORM
      normal = doTwist(normal, ang);
    #endif
    vNormal = normal;
  #endif

  vUv = aUv;
  
  #ifdef USE_UV_TRANSFORM
    vInstanceUvOffsets = aInstanceUvOffsets;
    vImageSize = aImageSize;
  #endif
}
