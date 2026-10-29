// Keep a save error visible across question renders and timed exams. Never diagnose a network error here.
export function initSaveNotice(retry) {
  const notice = document.createElement('section');
  notice.className = 'save-notice'; notice.id = 'save-notice'; notice.hidden = true;
  notice.setAttribute('role','status'); notice.setAttribute('aria-live','polite'); notice.setAttribute('aria-atomic','true');
  notice.innerHTML = '<div><strong></strong><p class="save-detail"></p><p class="save-action"></p></div><div class="save-buttons"><button type="button" class="save-retry">Retry saving</button><button type="button" class="save-dismiss" hidden>Dismiss</button></div>';
  document.querySelector('header').after(notice);
  const title=notice.querySelector('strong'),detail=notice.querySelector('.save-detail'),action=notice.querySelector('.save-action');
  const retryButton=notice.querySelector('.save-retry'),dismiss=notice.querySelector('.save-dismiss');
  const measure=()=>document.documentElement.style.setProperty('--save-h',notice.hidden ? '0px' : notice.getBoundingClientRect().height+'px');
  const hide=()=>{notice.hidden=true;document.body.classList.remove('has-save-notice');measure();};
  new ResizeObserver(measure).observe(notice);
  dismiss.onclick=hide;
  retryButton.onclick=()=>retry();
  let failed=false,last='';
  return status=>{
    if(status.ok && !failed) return;
    if(!status.ok) failed=true;
    const state=status.ok ? 'saved' : status.reason;
    // Saving on each keystroke must not repeatedly announce the same error.
    const key=state+':'+(status.operation || ''); if(key===last) return; last=key;
    notice.dataset.state=state; notice.hidden=false; document.body.classList.add('has-save-notice');
    title.textContent=status.ok ? 'Progress saved on this device' : status.title;
    detail.textContent=status.ok ? 'Your current answers and progress have been saved successfully.' : status.detail;
    action.textContent=status.ok ? '' : status.reason==='recovery' ? 'Your current work is still on this page.' : status.operation==='read' ? 'Earlier progress could not be loaded. New work stays on this page; keep it open while you resolve storage access.' : 'Keep this page open. Your latest changes are only on this page and may be lost if you close or reload it.';
    action.hidden=status.ok; retryButton.hidden=status.ok || status.reason==='recovery'; dismiss.hidden=!status.ok;
    if(status.ok) failed=false;
    measure();
  };
}
