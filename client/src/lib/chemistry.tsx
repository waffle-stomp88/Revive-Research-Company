const CHEM_SUB: Record<string, string> = {
  '\u2080': '0', '\u2081': '1', '\u2082': '2', '\u2083': '3', '\u2084': '4',
  '\u2085': '5', '\u2086': '6', '\u2087': '7', '\u2088': '8', '\u2089': '9',
};
const CHEM_SUP: Record<string, string> = {
  '\u207a': '+', '\u207b': '-',
};

export function renderChemicalFormula(formula: string): JSX.Element {
  const nodes: (string | JSX.Element)[] = [];
  let i = 0;
  while (i < formula.length) {
    const ch = formula[i];
    if (CHEM_SUB[ch] !== undefined) {
      let digits = '';
      while (i < formula.length && CHEM_SUB[formula[i]] !== undefined) {
        digits += CHEM_SUB[formula[i]];
        i++;
      }
      nodes.push(<sub key={`sub-${i}`}>{digits}</sub>);
    } else if (CHEM_SUP[ch] !== undefined) {
      nodes.push(<sup key={`sup-${i}`}>{CHEM_SUP[ch]}</sup>);
      i++;
    } else {
      nodes.push(ch);
      i++;
    }
  }
  return <>{nodes}</>;
}
