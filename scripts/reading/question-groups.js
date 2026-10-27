// Reading content parser only. Submission, identity and draft logic stay unchanged.
function Zt(text, passage) {
  const headings = [...text.matchAll(/^\s*Questions?\s+(\d{1,2}(?:(?:\s*[-–—]\s*|\s+(?:and|&)\s+|\s*,\s*)\d{1,2})*)[^\n]*/gim)];
  if (!headings.length) return [{start: passage.questionStart, end: passage.questionEnd,
    title: `Questions ${passage.questionStart}-${passage.questionEnd}`, body: text}];
  return headings.map((heading, index) => {
    const ids = heading[1].match(/\d+/g).map(Number);
    const start = ids[0], end = ids[ids.length - 1];
    if (start < passage.questionStart || end > passage.questionEnd || end < start)
      throw new Error('Question heading outside its passage: ' + heading[1]);
    return {start, end, title: start === end ? `Question ${start}` : `Questions ${start}-${end}`,
      body: text.slice(heading.index + heading[0].length, headings[index + 1]?.index ?? text.length)};
  });
}
