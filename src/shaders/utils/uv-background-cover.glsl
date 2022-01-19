vec2 uvTransformBackgroundCover (vec2 uv, vec2 imageSize, vec2 displaySize) {
  float rs = displaySize.x / displaySize.y;
  float ri = imageSize.x / imageSize.y;
  vec2 new = rs < ri ? vec2(imageSize.x * displaySize.y / imageSize.y, displaySize.y) : vec2(displaySize.x, imageSize.y * displaySize.x / imageSize.x);
  vec2 offset = (rs < ri ? vec2((new.x - displaySize.x) / 2.0, 0.0) : vec2(0.0, (new.y - displaySize.y) / 2.0)) / new;
  return uv * displaySize / new + offset;
}