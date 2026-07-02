const DEFAULTS = {
  DeadlinesEnabled: true,
  LookAheadDays: 30,
  MaxDeadlines: 6,
  DisableUI: false,
};

(function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels  = document.querySelectorAll('.panel');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      panels.forEach(p  => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
    });
  });
})();

//toggle 
function setToggleState(toggle, isOn) {
  toggle.setAttribute('aria-checked', isOn ? 'true' : 'false');
}

function applyDeadlineDimming(isEnabled) {
  const group = document.getElementById('sliders-group');
  group.classList.toggle('disabled', !isEnabled);
}

(function initToggles() {
  document.querySelectorAll('.toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const isOn = toggle.getAttribute('aria-checked') === 'true';
      const next = !isOn;
      setToggleState(toggle, next);
      chrome.storage.sync.set({ [toggle.dataset.key]: next });

      if (toggle.dataset.key === 'DeadlinesEnabled') {
        applyDeadlineDimming(next);
      }
    });
  });
})();

(function initSliders() {
  document.querySelectorAll('.slider').forEach(slider => {
    const valueDisplay = document.getElementById('val-' + (
      slider.dataset.key === 'LookAheadDays' ? 'days'        :
      slider.dataset.key === 'MaxDeadlines'  ? 'per-subject' : ''
    ));

    slider.addEventListener('input', () => {
      if (valueDisplay) valueDisplay.textContent = slider.value;
      chrome.storage.sync.set({ [slider.dataset.key]: Number(slider.value) });
    });
  });
})();

(function restoreState() {
  chrome.storage.sync.get(DEFAULTS, stored => {
    // toggles
    document.querySelectorAll('.toggle').forEach(toggle => {
      const key = toggle.dataset.key;
      if (key in stored) {
        setToggleState(toggle, stored[key]);
      }
    });

    applyDeadlineDimming(stored.DeadlinesEnabled);

    //sliders
    const daysSlider = document.getElementById('slider-days');
    daysSlider.value = stored.LookAheadDays;
    document.getElementById('val-days').textContent = stored.LookAheadDays;

    const perSubjectSlider = document.getElementById('slider-per-subject');
    perSubjectSlider.value = stored.MaxDeadlines;
    document.getElementById('val-per-subject').textContent = stored.MaxDeadlines;
  });
})();
