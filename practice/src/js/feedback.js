// The "Send feedback" dialog. The message is posted to /f, which emails it to Ben (see ../../worker.js); neither side's
// email address is ever in the page. A typed message survives Cancel and failed sends, and is cleared once it's sent.
import { st } from './state.js';
import { $ } from './util.js';

export function initFeedback() {
  const d = $('#fbd'), f = $('#fbf'), msg = $('#fbm'), s = $('#fbs'), go = $('#fbgo');
  const say = (t, cls = '') => { s.textContent = t; s.className = 'fbs ' + cls; };
  $('#fbb').onclick = () => { say(''); d.showModal(); msg.focus(); };
  $('#fbx').onclick = () => d.close();
  d.onclick = e => { if (e.target == d) d.close(); }; // the backdrop: the form fills the dialog itself
  f.onsubmit = async e => {
    e.preventDefault(); const m = msg.value.trim();
    if (!m) { say('Type a message first.', 'bad'); msg.focus(); return; }
    go.disabled = true; say('Sending…');
    try {
      const r = await fetch('/f', { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ m, p: location.pathname + location.search + location.hash, c: st.cid, hp: f.website.value }) });
      if (!r.ok) throw r.status;
      msg.value = ''; say('Sent. Thank you!', 'ok'); setTimeout(() => { if (d.open && !msg.value) d.close(); }, 1500);
    } catch (err) {
      say(err == 429 ? 'That’s a lot of messages at once. Try again in a minute.' : 'Couldn’t send it. Your message is still here; try again in a moment.', 'bad');
    }
    go.disabled = false;
  };
}
