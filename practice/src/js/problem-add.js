import { esc } from './util.js';
import { playgroundDestinations, addToPlayground } from './playground.js';

// The destination menu keeps the student in practice until they choose where to add the problem.
let active;
function close(focus = false) {
  if (!active) return;
  const {button,panel} = active; panel.hidden = true; button.setAttribute('aria-expanded','false');
  active = null; if (focus) button.focus();
}
document.addEventListener('pointerdown', e => { if (active && !active.root.contains(e.target)) close(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && active) { e.preventDefault(); close(true); } });
export function wireProblemAdd(root,id) {
  const button = root.querySelector('button'), panel = root.querySelector('.pgaddmenu');
  button.onclick = () => {
    if (active?.root === root) return close();
    close(); active = {root,button,panel}; panel.hidden = false; button.setAttribute('aria-expanded','true');
    panel.setAttribute('role','group'); panel.setAttribute('aria-label','Add problem to playground');
    panel.innerHTML = `<label>Fill with<select class="pgaddfill" aria-label="Fill problem with"><option value="mine">My answers</option><option value="blanks">Blanks</option><option value="solution">Solution</option></select></label><button type="button" data-add="existing">Add to existing playground</button><button type="button" data-add="new">Create new playground</button><div class="pgaddtargets" hidden></div>`;
    const fill = () => panel.querySelector('.pgaddfill').value;
    panel.querySelector('[data-add=new]').onclick = () => { const how = fill(); close(); addToPlayground(id,null,how); };
    panel.querySelector('[data-add=existing]').onclick = () => {
      const box = panel.querySelector('.pgaddtargets'), choices = playgroundDestinations(id); box.hidden = false;
      box.innerHTML = choices.length ? `<label>Playground<select aria-label="Existing playground">${choices.map(f=>`<option value="${esc(f.id)}">${esc(f.title)} · ${f.lang==='py'?'Python':'Gleam'}</option>`).join('')}</select></label><button class="p" type="button" data-add="confirm">Add problem</button><p>Appends to the code already there.</p>` : '<p>No matching playgrounds yet. Create a new one to get started.</p>';
      const confirm = box.querySelector('button'); if (confirm) confirm.onclick = () => { const how=fill(),target=box.querySelector('select').value; close(); addToPlayground(id,target,how); };
      box.querySelector('select')?.focus();
    };
  };
}
