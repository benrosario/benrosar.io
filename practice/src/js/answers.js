// Token boundaries, string contents and Python/Gleam case carry meaning. Never erase them.
export function tokens(source, lang = 'py', skipComments = true) {
  const comments = !skipComments ? '(?!)' : lang === 'gleam' ? String.raw`\/\/[^\n]*` : lang === 'sql' ? String.raw`--[^\n]*|\/\*[\s\S]*?\*\/` : String.raw`#[^\n]*`;
  const re = new RegExp(String.raw`("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(${comments})|([A-Za-z_][\w]*)|(\d+(?:\.\d+)?)|(==|!=|<=|>=|->|\|>|&&|\|\||\*\*|\/\/|:=)|([^\s])`, 'g');
  const out = [];
  for (const m of String(source).matchAll(re)) {
    if (m[2]) continue;
    let token = m[1] || m[3] || m[4] || m[5] || m[6];
    if (m[1] && lang === 'py' && !m[1].includes('\\') && !/^['"]{3}/.test(m[1])) token = 'string:' + m[1].slice(1,-1);
    if (m[3] && lang === 'sql') token = token.toLowerCase();
    out.push(token);
  }
  return out;
}
export const norm = s => String(s).trim().replace(/;$/, '');
export function matchesAnswer(answer, expected, lang, runnable = false) {
  // Runnable Python must preserve indentation; alternate formatting is checked by execution.
  if (lang === 'py' && runnable) return norm(answer) === norm(expected);
  return JSON.stringify(tokens(answer, lang, runnable)) === JSON.stringify(tokens(expected, lang, runnable));
}
export function restrictionError(q, p, answer) {
  const ts = tokens(answer, p.run?.lang === 'gleam' ? 'gleam' : q.sql ? 'sql' : 'py');
  for (const rule of [...p.rules || [], ...q.rules || []]) {
    if (rule.forbid?.some(word => ts.includes(word))) return rule.message;
    if (rule.require && !rule.require.every(word => ts.includes(word))) return rule.message;
    if (rule.treeEquality) {
      const flat = ts.filter(t => t !== '(' && t !== ')').join(' ');
      if (/\bt[01] (?:==|!=) t[01]\b/.test(flat)) return rule.message;
    }
  }
  return '';
}
