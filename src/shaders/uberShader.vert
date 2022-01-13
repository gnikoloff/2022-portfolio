#version 300 es

-- DEFINES_HOOK --

uniform Camera {
  mat4 projectionViewMatrix;
};

uniform T {
  int a;
};

uniform mat4 modelMatrix;
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

out vec2 vUv;

float mapNumberToRange(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main () {
  vec4 position = aPosition;
  
  #ifdef USE_INSTANCING
    position = aInstanceMatrix * position;
  #endif

  #ifdef USE_MODEL_MATRIX
    position = modelMatrix * position;
  #endif

  gl_Position = projectionViewMatrix * position;

  #ifdef USE_SHADING
    vNormal = aNormal;
  #endif

  vUv = aUv;
  
  #ifdef USE_UV_TRANSFORM
    vInstanceUvOffsets = aInstanceUvOffsets;
    vImageSize = aImageSize;
  #endif
}
