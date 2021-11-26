self.onmessage = (e) => {
  const { abRecords, similarity } = e.data;
  const abGroupedRecords = group(abRecords, similarity);
  self.postMessage({ abRecords, abGroupedRecords }, [abRecords, abGroupedRecords]);
};



function group(abRecords, similarity) {
  const arr = new Uint32Array(abRecords);
  const grouped = [];
  for (let i = 0, I = arr.length; i < I; i += 4) {
    const r0 = arr.subarray(i, i + 4);
    let handled = false;
    for (let j = 0, J = grouped.length; j < J; j += 4) {
      const r1 = grouped.slice(j, j + 4);
      if (isSimilar(r0, r1, similarity)) {
        grouped[j + 3] += r0[3];
        handled = true;
        break;
      }
    }
    if (!handled) grouped.push.apply(grouped, r0);
  }
  return new Uint32Array(grouped).buffer;
}



function isSimilar(a, b, similarity) {
  return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) < (similarity ** 2 * 3);
}