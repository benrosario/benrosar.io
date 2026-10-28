// Entry point: load the content bundle, migrate saved state, then start the UI.
import { st } from './state.js';
import { load, saver } from './store.js';
import { resolveCollection } from './model.js';
import { initEvents } from './events.js';
import { initTheme, initChrome, applyZoom } from './chrome.js';
import { render } from './practice.js';
import { initTimed } from './timed.js';
import { initSelector, select, fromURL } from './selector.js';
import { $ } from './util.js';
import { initSort } from './sort.js';

const TAG = document.currentScript || document.querySelector('script[data-content]'), CONTENT = TAG.dataset.content;
st.gleam = { worker: TAG.dataset.gleamWorker, base: TAG.dataset.gleamBase };

async function boot() {
  const bank = await fetch(CONTENT).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  const ids = bank.collections.map(c => c.id);
  st.bank = bank;
  st.S = load({ legacyOrder: bank.legacyOrder, defaultCollection: bank.defaultCollection, collections: ids });
  st.save = saver(st.S);
  for (const id of ids) st.views[id] = resolveCollection(bank, id);
  initEvents(); initTheme();
  // A URL that names a collection wins; otherwise the last one used (Midterm 3 for people with schema-2 data).
  select(fromURL() || st.S._c, { initial: true });
  initSelector(); initChrome(); initSort();
  render(); applyZoom(true);
  initTimed();
}
boot().catch(err => {
  console.error(err);
  $('#m').innerHTML = `<div class="note"><b>Couldn’t load the questions.</b> Check your connection and reload the page. <span class="mut">(${String(err.message || err).replace(/[<>&]/g, '')})</span></div>`;
});
