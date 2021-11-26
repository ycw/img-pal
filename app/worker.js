onmessage = (e) => {
  switch (e.data.cmd) {
    case 'groupSimilar':
      postMessage({
        cmd: e.data.cmd,
        result: groupSimilar(e.data.rawRecords, e.data.similarity)
      });
  }
}



function groupSimilar(rawRecords, similarity) {
  return rawRecords
    .reduce((xs, curr) => {
      for (const x of xs) {
        if (isSimilar(x, curr, similarity)) {
          x.count += curr.count;
          return xs;
        }
      }
      xs.push(curr);
      return xs;
    }, [])
    .sort((a, b) => b.count - a.count);
}



function isSimilar(a, b, similarity) {
  return ((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2) < (similarity ** 2 * 3);
}