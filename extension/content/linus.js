const LINUS_MOODS = ['none', 'stress', 'cry', 'treat'];
const LINUS_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280" role="img" aria-label="LiNUS the NUS lion">
  <g class="linus-anim">
    <ellipse cx="120" cy="205" rx="58" ry="50" fill="#F5B879"/>
    <ellipse cx="120" cy="212" rx="38" ry="36" fill="#FDEBCB"/>
    <text x="120" y="222" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="800" fill="#2B49D0">NUS</text>

    <g>
      <ellipse cx="86" cy="250" rx="25" ry="17" fill="#F5B879"/>
      <ellipse cx="86" cy="253" rx="13" ry="9" fill="#FDEBCB"/>
      <circle cx="72" cy="243" r="3.4" fill="#FDEBCB"/>
      <circle cx="86" cy="239" r="3.4" fill="#FDEBCB"/>
      <circle cx="100" cy="243" r="3.4" fill="#FDEBCB"/>
    </g>
    <g>
      <ellipse cx="154" cy="250" rx="25" ry="17" fill="#F5B879"/>
      <ellipse cx="154" cy="253" rx="13" ry="9" fill="#FDEBCB"/>
      <circle cx="140" cy="243" r="3.4" fill="#FDEBCB"/>
      <circle cx="154" cy="239" r="3.4" fill="#FDEBCB"/>
      <circle cx="168" cy="243" r="3.4" fill="#FDEBCB"/>
    </g>

    <g fill="#2447E9">
      <circle cx="120" cy="50" r="24"/><circle cx="154" cy="61" r="24"/>
      <circle cx="175" cy="90" r="24"/><circle cx="175" cy="126" r="24"/>
      <circle cx="154" cy="155" r="24"/><circle cx="120" cy="166" r="24"/>
      <circle cx="86" cy="155" r="24"/><circle cx="65" cy="126" r="24"/>
      <circle cx="65" cy="90" r="24"/><circle cx="86" cy="61" r="24"/>
      <circle cx="120" cy="108" r="66"/>
    </g>

    <g><circle cx="76" cy="56" r="15" fill="#F5B879"/><circle cx="76" cy="56" r="8" fill="#E39B55"/></g>
    <g><circle cx="164" cy="56" r="15" fill="#F5B879"/><circle cx="164" cy="56" r="8" fill="#E39B55"/></g>

    <circle cx="120" cy="110" r="50" fill="#F5B879"/>
    <ellipse cx="120" cy="130" rx="30" ry="21" fill="#FDEBCB"/>

    <g class="linus-eye">
      <circle cx="99" cy="104" r="6.5" fill="#1C2B66"/>
      <circle cx="101.4" cy="101.6" r="2.2" fill="#FFFFFF"/>
    </g>
    <g class="linus-eye">
      <circle cx="141" cy="104" r="6.5" fill="#1C2B66"/>
      <circle cx="143.4" cy="101.6" r="2.2" fill="#FFFFFF"/>
    </g>

    <path d="M 109 118 Q 120 112 131 118 Q 132 128 120 131 Q 108 128 109 118 Z" fill="#1C2B66"/>
    <path d="M 120 131 L 120 137" stroke="#1C2B66" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    <path d="M 111 137 Q 120 145 129 137" stroke="#1C2B66" stroke-width="2.4" stroke-linecap="round" fill="none"/>

    <g stroke="#1C2B66" stroke-width="2" stroke-linecap="round" fill="none">
      <path d="M 84 118 L 66 114"/><path d="M 85 126 L 66 126"/><path d="M 84 134 L 66 138"/>
      <path d="M 156 118 L 174 114"/><path d="M 155 126 L 174 126"/><path d="M 156 134 L 174 138"/>
    </g>

    <ellipse cx="72" cy="196" rx="14" ry="24" fill="#F5B879" transform="rotate(22 72 196)"/>
    <ellipse cx="79" cy="214" rx="10" ry="8" fill="#F5B879"/>

    <g class="linus-kit-kat">
      <ellipse cx="170" cy="184" rx="14" ry="27" fill="#F5B879" transform="rotate(-32 170 184)"/>
      <g transform="rotate(-18 190 152)">
        <rect x="178" y="124" width="11" height="20" rx="2.5" fill="#5A3A22"/>
        <rect x="192" y="124" width="11" height="20" rx="2.5" fill="#5A3A22"/>
        <rect x="180.5" y="126" width="6" height="4" rx="2" fill="#7A5233"/>
        <rect x="194.5" y="126" width="6" height="4" rx="2" fill="#7A5233"/>
        <rect x="172" y="140" width="37" height="26" rx="4" fill="#E31837" stroke="#1C2B66" stroke-width="2"/>
        <ellipse cx="190.5" cy="153" rx="13" ry="7" fill="#FFFFFF"/>
      </g>
      <ellipse cx="177" cy="168" rx="11" ry="9" fill="#F5B879"/>
    </g>
    <!-- tears (cry) -->
    <g class="linus-tears" fill="#5FA8F5">
    <ellipse class="linus-tear" cx="97" cy="116" rx="3" ry="5"/>
    <ellipse class="linus-tear" cx="143" cy="116" rx="3" ry="5"/>
  </g>
  <g class="linus-sweat" fill="#7FC4F8">
  <ellipse cx="82" cy="78" rx="3.5" ry="6"/>
  <ellipse cx="160" cy="72" rx="3" ry="5"/>
  </g>
  <g class="linus-brows" stroke="#1C2B66" stroke-width="2.6" stroke-linecap="round" fill="none">
  <path d="M 92 92 Q 100 88 107 92"/>
  <path d="M 133 92 Q 140 88 148 92"/>
  </g>
  </g>
</svg>`;

function injectLinus() {
  if (document.getElementById('next-linus')) return;
  const host = document.createElement('div');
  host.id = 'next-linus';
  host.dataset.mood = 'none';
  host.innerHTML = LINUS_SVG;
  document.body.appendChild(host);
}

// eslint-disable-next-line no-unused-vars
function setLinusMood(mood) {
  const host = document.getElementById('next-linus');
  if (!host) return;
  host.dataset.mood = LINUS_MOODS.includes(mood) ? mood : 'none';
}

function updateLinusMood(deadlineCount, hasOverdue, hasCompleted) {
  if (hasCompleted) return setLinusMood('treat'); //bug cant see treat mood 
  if (hasOverdue)   return setLinusMood('cry');
  if (deadlineCount > 5) return setLinusMood('stress');
  setLinusMood('none');
}
injectLinus();