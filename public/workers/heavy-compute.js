self.onmessage = (event) => {
  const iterations = Number(event.data?.iterations ?? 8_000_000);
  const started = performance.now();
  let checksum = 0;

  for (let index = 0; index < iterations; index += 1) {
    checksum += Math.sqrt(index % 997) * Math.sin(index / 128);
  }

  self.postMessage({
    checksum: Math.round(checksum),
    iterations,
    durationMs: Math.round(performance.now() - started),
  });
};
