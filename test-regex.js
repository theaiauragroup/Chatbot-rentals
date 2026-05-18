const input = "Here's the BMW we have available:\n \n 1\n \n Model - BMW 3 Series \n Year - 2023 \n \n 2) Model - Some other \n Year - 2024";
let numbered = input.replace(/(^|\n)[ \t]*\d+(?:[\.\)]|(?:\s*\n\s*))*(?=[ \t]*(?:\*\*)*Model(?:\*\*)*\s*[:-]?)/gi, '$1');
let n = 1;
numbered = numbered.replace(
  /(^|\n\n?)([ \t]*(?:\*\*)*Model(?:\*\*)*\s*[:-]?)/gi,
  (_m, sep, label) => `${sep}**${n++})** ${label}`
);
console.log(numbered);
