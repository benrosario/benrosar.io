import { esc, PLAYGROUND_ICONS } from './util.js';
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
    panel.innerHTML = `<fieldset class="pgaddfill"><legend>Fill with</legend><div class="pgfilloptions">${[['blanks','Blanks'],['mine','My answers'],['solution','Solution']].map(([value,label])=>`<label><input type="radio" name="fill-${panel.id}" value="${value}"${value==='mine'?' checked':''}><span>${label}</span></label>`).join('')}</div></fieldset><button type="button" data-add="existing" aria-expanded="false" aria-controls="${panel.id}-targets">${PLAYGROUND_ICONS.existing}<span>Add to existing playground</span></button><button type="button" data-add="new">${PLAYGROUND_ICONS.new}<span>Create new playground</span></button><div class="pgaddtargets" id="${panel.id}-targets" hidden></div>`;
    const fill = () => panel.querySelector('.pgaddfill input:checked').value;
    panel.querySelector('[data-add=new]').onclick = () => { const how = fill(); close(); addToPlayground(id,null,how); };
    panel.querySelector('[data-add=existing]').onclick = () => {
      const box = panel.querySelector('.pgaddtargets'), toggle = panel.querySelector('[data-add=existing]');
      if (!box.hidden) { box.hidden = true; toggle.setAttribute('aria-expanded','false'); return; }
      const choices = playgroundDestinations(id); box.hidden = false; toggle.setAttribute('aria-expanded','true');
      box.innerHTML = choices.length ? `<fieldset class="pgdestinations"><legend>Choose a playground</legend><div class="pgdestination-options">${choices.map((f,i)=>`<label><input type="radio" name="destination-${panel.id}" value="${esc(f.id)}"${i===0?' checked':''}><span class="pgdestination-label"><strong>${esc(f.title)}</strong><span>${f.lang==='py'?'Python':'Gleam'}</span></span></label>`).join('')}</div></fieldset><button class="p" type="button" data-add="confirm">Add problem</button><p>Appends to the code already there.</p>` : '<p>No matching playgrounds yet. Create a new one to get started.</p>';
      const confirm = box.querySelector('[data-add=confirm]'); if (confirm) confirm.onclick = () => { const how=fill(),target=box.querySelector('input:checked').value; close(); addToPlayground(id,target,how); };
      box.querySelector('input:checked')?.focus();
    };
  };
}
