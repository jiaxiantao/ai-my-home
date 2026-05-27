function matmul(size) {
  const a = new Float32Array(size * size);
  const b = new Float32Array(size * size);
  const out = new Float32Array(size * size);

  for (let index = 0; index < a.length; index += 1) {
    a[index] = (index % 17) / 17;
    b[index] = (index % 13) / 13;
  }

  const started = performance.now();

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      let sum = 0;

      for (let k = 0; k < size; k += 1) {
        sum += a[row * size + k] * b[k * size + col];
      }

      out[row * size + col] = sum;
    }
  }

  return {
    ms: Math.round(performance.now() - started),
    checksum: Math.round(out[0] + out[out.length - 1]),
  };
}

self.onmessage = (event) => {
  const size = Number(event.data?.size) || 96;
  self.postMessage(matmul(size));
};
