self.onmessage = (e) => {
  const { abRecords, similarity } = e.data;
  const abGroupedRecords = group(abRecords, similarity);
  self.postMessage({ abRecords, abGroupedRecords }, [abRecords, abGroupedRecords]);
};



function group(abRecords, similarity) {
  const arr = new Uint32Array(abRecords);
  const groupedArr = []; // Array<[r,g,b,count]>
  for (let i = 0, I = arr.length; i < I; i += 4) {
    const r0 = arr.subarray(i, i + 4);
    let handled = false;
    for (const r1 of groupedArr) {
      if (isSimilar(r0, r1, similarity)) {
        r1[3] += r0[3];
        handled = true;
        break;
      }
    }
    if (!handled) groupedArr.push([...r0]);
  }
  groupedArr.sort((a, b) => b[3] - a[3]);
  return new Uint32Array(groupedArr.flat()).buffer;
}



function isSimilar(a, b, similarity) {
  return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) < (similarity ** 2 * 3);
}