/* MISORAA — inline SVG sprite (logo marks + watch illustrations).
   Injected synchronously so <use> references resolve during first paint.     */
(function () {
  var sprite = `
<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);pointer-events:none" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#8C6522"/>
      <stop offset="22%"  stop-color="#D4AF62"/>
      <stop offset="44%"  stop-color="#FBF3DA"/>
      <stop offset="62%"  stop-color="#D4AF62"/>
      <stop offset="80%"  stop-color="#A2782F"/>
      <stop offset="100%" stop-color="#E6C786"/>
    </linearGradient>
    <linearGradient id="gGoldV" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#FBF3DA"/>
      <stop offset="40%"  stop-color="#D4AF62"/>
      <stop offset="70%"  stop-color="#8C6522"/>
      <stop offset="100%" stop-color="#E6C786"/>
    </linearGradient>
    <linearGradient id="gCase" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0%"   stop-color="#FBF3DA"/>
      <stop offset="18%"  stop-color="#C19843"/>
      <stop offset="48%"  stop-color="#6E4E1B"/>
      <stop offset="72%"  stop-color="#E6C786"/>
      <stop offset="100%" stop-color="#8C6522"/>
    </linearGradient>
    <linearGradient id="gStrap" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#0A0A0B"/>
      <stop offset="35%"  stop-color="#232326"/>
      <stop offset="65%"  stop-color="#141416"/>
      <stop offset="100%" stop-color="#050506"/>
    </linearGradient>
    <radialGradient id="gDial" cx="0.42" cy="0.34" r="0.78">
      <stop offset="0%"   stop-color="#1D1D20"/>
      <stop offset="55%"  stop-color="#0C0C0E"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    <radialGradient id="gDialGold" cx="0.42" cy="0.34" r="0.8">
      <stop offset="0%"   stop-color="#3A2C12"/>
      <stop offset="55%"  stop-color="#171106"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    <linearGradient id="gGlass" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity=".16"/>
      <stop offset="45%"  stop-color="#ffffff" stop-opacity=".02"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- ============ BRAND MARK (circular badge) ============ -->
  <symbol id="logo-mark" viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="99" fill="#000"/>
    <circle cx="100" cy="100" r="96" fill="none" stroke="url(#gGold)" stroke-width="1.1" opacity=".55"/>
    <!-- watch crown -->
    <path d="M96 30h8v9h-8z" fill="url(#gGoldV)"/>
    <path d="M92.5 39h15v6h-15z" fill="url(#gGoldV)"/>
    <circle cx="100" cy="27" r="4.4" fill="none" stroke="url(#gGoldV)" stroke-width="2.2"/>
    <!-- case ring around the M -->
    <circle cx="100" cy="108" r="58" fill="none" stroke="url(#gGold)" stroke-width="1.6" opacity=".9"/>
    <circle cx="100" cy="108" r="63" fill="none" stroke="url(#gGold)" stroke-width=".7" opacity=".4"/>
    <!-- index ticks -->
    <g stroke="url(#gGoldV)" stroke-width="1.6" opacity=".75">
      <line x1="100" y1="50" x2="100" y2="57"/>
      <line x1="100" y1="159" x2="100" y2="166"/>
      <line x1="42" y1="108" x2="49" y2="108"/>
      <line x1="151" y1="108" x2="158" y2="108"/>
    </g>
    <!-- the M -->
    <path d="M60 140V76h20l20 32 20-32h20v64h-14V97l-20 32h-12L74 97v43z" fill="url(#gGold)"/>
  </symbol>

  <!-- ============ HORIZONTAL LOCKUP (nav) ============ -->
  <symbol id="logo-lockup" viewBox="0 0 560 180">
    <g transform="translate(0,0)"><use href="#logo-mark" x="0" y="0" width="180" height="180"/></g>
    <text x="206" y="112" font-family="Cormorant Garamond, Georgia, serif" font-size="62"
          letter-spacing="7" fill="url(#gGold)">MISORAA</text>
  </symbol>

  <!-- ============ STACKED LOCKUP (loader / footer) ============ -->
  <symbol id="logo-stack" viewBox="0 0 380 320">
    <use href="#logo-mark" x="90" y="0" width="200" height="200"/>
    <text x="190" y="256" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif"
          font-size="60" letter-spacing="7" fill="url(#gGold)">MISORAA</text>
    <line x1="52" y1="282" x2="118" y2="282" stroke="#A2782F" stroke-width="1"/>
    <line x1="262" y1="282" x2="328" y2="282" stroke="#A2782F" stroke-width="1"/>
    <text x="190" y="287" text-anchor="middle" font-family="Jost, Helvetica Neue, Arial, sans-serif"
          font-size="14" letter-spacing="5.6" fill="#C19843">TIMELESS ELEGANCE</text>
  </symbol>

  <!-- ============ WATCH BASE (strap + case + dial) ============ -->
  <symbol id="w-base" viewBox="0 0 300 440">
    <path d="M118 16h64l12 132h-88z" fill="url(#gStrap)"/>
    <path d="M106 292h88l-12 132h-64z" fill="url(#gStrap)"/>
    <g opacity=".5" stroke="#000" stroke-width="1">
      <line x1="124" y1="40" x2="176" y2="40"/><line x1="125" y1="66" x2="175" y2="66"/>
      <line x1="126" y1="92" x2="174" y2="92"/><line x1="127" y1="118" x2="173" y2="118"/>
      <line x1="127" y1="322" x2="173" y2="322"/><line x1="126" y1="348" x2="174" y2="348"/>
      <line x1="125" y1="374" x2="175" y2="374"/><line x1="124" y1="400" x2="176" y2="400"/>
    </g>
    <rect x="244" y="206" width="18" height="28" rx="4" fill="url(#gCase)"/>
    <rect x="258" y="213" width="7" height="14" rx="2" fill="url(#gGoldV)"/>
    <circle cx="150" cy="220" r="100" fill="url(#gCase)"/>
    <circle cx="150" cy="220" r="90" fill="#08080A"/>
    <circle cx="150" cy="220" r="84" fill="none" stroke="url(#gGold)" stroke-width="1.4" opacity=".7"/>
  </symbol>

  <!-- shared dial furniture -->
  <symbol id="w-hands" viewBox="0 0 300 440">
    <g stroke-linecap="round">
      <line x1="150" y1="220" x2="150" y2="156" stroke="url(#gGoldV)" stroke-width="6"/>
      <line x1="150" y1="220" x2="196" y2="252" stroke="url(#gGoldV)" stroke-width="4.5"/>
      <g>
        <line x1="150" y1="220" x2="112" y2="268" stroke="#C0392B" stroke-width="1.8"/>
        <animateTransform attributeName="transform" type="rotate"
          from="0 150 220" to="360 150 220" dur="60s" repeatCount="indefinite"/>
      </g>
    </g>
    <circle cx="150" cy="220" r="6" fill="url(#gGold)"/>
    <circle cx="150" cy="220" r="2.2" fill="#000"/>
  </symbol>

  <!-- ============ 01 · CHRONOGRAPH ============ -->
  <symbol id="w-chrono" viewBox="0 0 300 440">
    <use href="#w-base"/>
    <rect x="234" y="166" width="22" height="15" rx="4" fill="url(#gCase)" transform="rotate(28 245 173)"/>
    <rect x="234" y="259" width="22" height="15" rx="4" fill="url(#gCase)" transform="rotate(-28 245 266)"/>
    <circle cx="150" cy="220" r="80" fill="url(#gDial)"/>
    <g stroke="url(#gGoldV)" stroke-width="2.4" opacity=".9">
      <line x1="150" y1="148" x2="150" y2="162"/><line x1="222" y1="220" x2="208" y2="220"/>
      <line x1="150" y1="292" x2="150" y2="278"/><line x1="78" y1="220" x2="92" y2="220"/>
      <line x1="201" y1="158" x2="194" y2="169"/><line x1="212" y1="271" x2="201" y2="264"/>
      <line x1="99" y1="282" x2="106" y2="271"/><line x1="88" y1="169" x2="99" y2="176"/>
    </g>
    <g fill="none" stroke="#6B675F" stroke-width="1" opacity=".8">
      <circle cx="113" cy="220" r="21"/><circle cx="187" cy="220" r="21"/><circle cx="150" cy="257" r="21"/>
    </g>
    <g stroke="#C19843" stroke-width="1.6" stroke-linecap="round">
      <line x1="113" y1="220" x2="124" y2="212"/><line x1="187" y1="220" x2="180" y2="234"/>
      <line x1="150" y1="257" x2="160" y2="250"/>
    </g>
    <text x="150" y="196" text-anchor="middle" font-family="Jost, Arial, sans-serif" font-size="9"
          letter-spacing="2.6" fill="#C19843">MISORAA</text>
    <use href="#w-hands"/>
    <circle cx="150" cy="220" r="80" fill="url(#gGlass)"/>
  </symbol>

  <!-- ============ 02 · CLASSIC AUTOMATIC ============ -->
  <symbol id="w-classic" viewBox="0 0 300 440">
    <use href="#w-base"/>
    <circle cx="150" cy="220" r="80" fill="url(#gDial)"/>
    <g stroke="url(#gGoldV)" stroke-width="2" opacity=".85">
      <line x1="150" y1="148" x2="150" y2="164"/><line x1="222" y1="220" x2="206" y2="220"/>
      <line x1="150" y1="292" x2="150" y2="276"/><line x1="78" y1="220" x2="94" y2="220"/>
    </g>
    <g fill="#9A958C">
      <circle cx="186" cy="156" r="2.4"/><circle cx="214" cy="184" r="2.4"/>
      <circle cx="214" cy="256" r="2.4"/><circle cx="186" cy="284" r="2.4"/>
      <circle cx="114" cy="284" r="2.4"/><circle cx="86" cy="256" r="2.4"/>
      <circle cx="86" cy="184" r="2.4"/><circle cx="114" cy="156" r="2.4"/>
    </g>
    <rect x="186" y="212" width="30" height="17" rx="2" fill="none" stroke="#6B675F" stroke-width="1"/>
    <text x="201" y="225" text-anchor="middle" font-family="Jost, Arial, sans-serif" font-size="10" fill="#EDE8DF">16</text>
    <text x="150" y="194" text-anchor="middle" font-family="Jost, Arial, sans-serif" font-size="9"
          letter-spacing="2.6" fill="#C19843">MISORAA</text>
    <text x="150" y="268" text-anchor="middle" font-family="Jost, Arial, sans-serif" font-size="6.5"
          letter-spacing="2.2" fill="#9A958C">AUTOMATIC</text>
    <use href="#w-hands"/>
    <circle cx="150" cy="220" r="80" fill="url(#gGlass)"/>
  </symbol>

  <!-- ============ 03 · DIVER ============ -->
  <symbol id="w-diver" viewBox="0 0 300 440">
    <use href="#w-base"/>
    <circle cx="150" cy="220" r="90" fill="#101013"/>
    <circle cx="150" cy="220" r="90" fill="none" stroke="url(#gGold)" stroke-width="2"/>
    <g stroke="url(#gGoldV)" stroke-width="2" opacity=".9">
      <line x1="150" y1="134" x2="150" y2="146"/><line x1="236" y1="220" x2="224" y2="220"/>
      <line x1="150" y1="306" x2="150" y2="294"/><line x1="64" y1="220" x2="76" y2="220"/>
      <line x1="211" y1="159" x2="203" y2="168"/><line x1="211" y1="281" x2="203" y2="272"/>
      <line x1="89" y1="281" x2="97" y2="272"/><line x1="89" y1="159" x2="97" y2="168"/>
    </g>
    <circle cx="150" cy="144" r="5" fill="url(#gGold)"/>
    <circle cx="150" cy="220" r="76" fill="url(#gDial)"/>
    <g fill="#EDE8DF" opacity=".92">
      <rect x="146" y="154" width="8" height="18" rx="2"/>
      <rect x="146" y="268" width="8" height="18" rx="2"/>
      <rect x="198" y="216" width="18" height="8" rx="2"/>
      <rect x="84" y="216" width="18" height="8" rx="2"/>
      <circle cx="190" cy="178" r="4.5"/><circle cx="190" cy="262" r="4.5"/>
      <circle cx="110" cy="262" r="4.5"/><circle cx="110" cy="178" r="4.5"/>
    </g>
    <text x="150" y="200" text-anchor="middle" font-family="Jost, Arial, sans-serif" font-size="9"
          letter-spacing="2.6" fill="#C19843">MISORAA</text>
    <text x="150" y="252" text-anchor="middle" font-family="Jost, Arial, sans-serif" font-size="6.5"
          letter-spacing="2" fill="#9A958C">300M · 1000FT</text>
    <use href="#w-hands"/>
    <circle cx="150" cy="220" r="76" fill="url(#gGlass)"/>
  </symbol>

  <!-- ============ 04 · SKELETON ============ -->
  <symbol id="w-skeleton" viewBox="0 0 300 440">
    <use href="#w-base"/>
    <circle cx="150" cy="220" r="80" fill="url(#gDialGold)"/>
    <g fill="none" stroke="url(#gGold)" stroke-width="1.6" opacity=".95">
      <circle cx="150" cy="220" r="34"/>
      <circle cx="116" cy="188" r="20"/>
      <circle cx="186" cy="192" r="16"/>
      <circle cx="176" cy="258" r="24"/>
      <circle cx="116" cy="262" r="13"/>
    </g>
    <g stroke="url(#gGoldV)" stroke-width="1" opacity=".6">
      <line x1="150" y1="186" x2="150" y2="254"/><line x1="116" y1="220" x2="184" y2="220"/>
      <line x1="126" y1="196" x2="174" y2="244"/><line x1="174" y1="196" x2="126" y2="244"/>
      <line x1="156" y1="238" x2="196" y2="278"/><line x1="196" y1="238" x2="156" y2="278"/>
    </g>
    <g stroke="url(#gGoldV)" stroke-width="2.2" opacity=".9">
      <line x1="150" y1="148" x2="150" y2="162"/><line x1="222" y1="220" x2="208" y2="220"/>
      <line x1="150" y1="292" x2="150" y2="278"/><line x1="78" y1="220" x2="92" y2="220"/>
    </g>
    <circle cx="150" cy="220" r="80" fill="none" stroke="#7E5B21" stroke-width="1"/>
    <use href="#w-hands"/>
    <circle cx="150" cy="220" r="80" fill="url(#gGlass)"/>
  </symbol>

  <!-- ============ 05 · TONNEAU (rectangular case) ============ -->
  <symbol id="w-tonneau" viewBox="0 0 300 440">
    <path d="M120 16h60l10 114h-80z" fill="url(#gStrap)"/>
    <path d="M110 310h80l-10 114h-60z" fill="url(#gStrap)"/>
    <g opacity=".5" stroke="#000" stroke-width="1">
      <line x1="126" y1="44" x2="174" y2="44"/><line x1="127" y1="74" x2="173" y2="74"/>
      <line x1="128" y1="104" x2="172" y2="104"/>
      <line x1="128" y1="336" x2="172" y2="336"/><line x1="127" y1="366" x2="173" y2="366"/>
      <line x1="126" y1="396" x2="174" y2="396"/>
    </g>
    <rect x="228" y="206" width="18" height="28" rx="4" fill="url(#gCase)"/>
    <rect x="64" y="120" width="172" height="200" rx="34" fill="url(#gCase)"/>
    <rect x="76" y="132" width="148" height="176" rx="27" fill="#08080A"/>
    <rect x="84" y="140" width="132" height="160" rx="22" fill="url(#gDial)"/>
    <rect x="84" y="140" width="132" height="160" rx="22" fill="none" stroke="url(#gGold)" stroke-width="1" opacity=".7"/>
    <g stroke="url(#gGoldV)" stroke-width="2.2" opacity=".9">
      <line x1="150" y1="152" x2="150" y2="166"/><line x1="204" y1="220" x2="190" y2="220"/>
      <line x1="150" y1="288" x2="150" y2="274"/><line x1="96" y1="220" x2="110" y2="220"/>
      <line x1="186" y1="172" x2="178" y2="180"/><line x1="186" y1="268" x2="178" y2="260"/>
      <line x1="114" y1="268" x2="122" y2="260"/><line x1="114" y1="172" x2="122" y2="180"/>
    </g>
    <text x="150" y="198" text-anchor="middle" font-family="Jost, Arial, sans-serif" font-size="8.5"
          letter-spacing="2.6" fill="#C19843">MISORAA</text>
    <use href="#w-hands"/>
    <rect x="84" y="140" width="132" height="160" rx="22" fill="url(#gGlass)"/>
  </symbol>

  <!-- ============ 06 · MOONPHASE ============ -->
  <symbol id="w-moon" viewBox="0 0 300 440">
    <use href="#w-base"/>
    <circle cx="150" cy="220" r="80" fill="url(#gDial)"/>
    <circle cx="150" cy="220" r="68" fill="none" stroke="#6B675F" stroke-width=".8" opacity=".6"/>
    <g stroke="url(#gGoldV)" stroke-width="2.2" opacity=".9">
      <line x1="150" y1="148" x2="150" y2="164"/><line x1="222" y1="220" x2="206" y2="220"/>
      <line x1="150" y1="292" x2="150" y2="276"/><line x1="78" y1="220" x2="94" y2="220"/>
      <line x1="201" y1="158" x2="194" y2="169"/><line x1="212" y1="271" x2="201" y2="264"/>
      <line x1="99" y1="282" x2="106" y2="271"/><line x1="88" y1="169" x2="99" y2="176"/>
    </g>
    <path d="M118 256a32 32 0 0 1 64 0z" transform="rotate(180 150 256)" fill="#0A0A0C" stroke="url(#gGold)" stroke-width="1"/>
    <g clip-path="url(#moonClip)">
      <circle cx="136" cy="268" r="9" fill="url(#gGoldV)"/>
      <circle cx="168" cy="272" r="7" fill="#E6C786" opacity=".5"/>
    </g>
    <clipPath id="moonClip"><path d="M118 256a32 32 0 0 0 64 0z"/></clipPath>
    <g fill="#E6C786" opacity=".7">
      <circle cx="128" cy="252" r="1.2"/><circle cx="150" cy="248" r="1"/><circle cx="172" cy="253" r="1.2"/>
    </g>
    <text x="150" y="196" text-anchor="middle" font-family="Jost, Arial, sans-serif" font-size="9"
          letter-spacing="2.6" fill="#C19843">MISORAA</text>
    <text x="150" y="208" text-anchor="middle" font-family="Jost, Arial, sans-serif" font-size="6"
          letter-spacing="2" fill="#9A958C">LUNAIRE</text>
    <use href="#w-hands"/>
    <circle cx="150" cy="220" r="80" fill="url(#gGlass)"/>
  </symbol>

  <!-- ============ ICONS ============ -->
  <symbol id="i-search" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></g></symbol>
  <symbol id="i-user" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></g></symbol>
  <symbol id="i-bag" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 7h14l-1.2 13.5H6.2z"/><path d="M8.8 7V5.6A3.2 3.2 0 0 1 12 2.4a3.2 3.2 0 0 1 3.2 3.2V7"/></g></symbol>
  <symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20.5 3.8 12.6a5 5 0 1 1 7.1-7l1.1 1.1 1.1-1.1a5 5 0 1 1 7.1 7z" fill="none" stroke="currentColor" stroke-width="1.4"/></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 12h15"/><path d="m13 6 6 6-6 6"/></g></symbol>
  <symbol id="i-gear" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="3.4"/><path d="M12 1.8v3M12 19.2v3M1.8 12h3M19.2 12h3M4.8 4.8l2.1 2.1M17.1 17.1l2.1 2.1M19.2 4.8l-2.1 2.1M6.9 17.1l-2.1 2.1"/></g></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.2"><path d="M12 2.2 20 5.4v6.2c0 5-3.4 8.9-8 10.2-4.6-1.3-8-5.2-8-10.2V5.4z"/><path d="m8.6 12 2.4 2.4 4.4-4.6"/></g></symbol>
  <symbol id="i-diamond" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.2"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M8.5 9 12 21M15.5 9 12 21M8.5 9 6 3M15.5 9 18 3"/></g></symbol>
  <symbol id="i-water" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.2"><path d="M12 2.5s7 7.6 7 12a7 7 0 1 1-14 0c0-4.4 7-12 7-12z"/><path d="M8.5 14.5a3.5 3.5 0 0 0 3.5 3.5"/></g></symbol>
  <symbol id="i-ig" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5"/><circle cx="12" cy="12" r="4.1"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></g></symbol>
  <symbol id="i-fb" viewBox="0 0 24 24"><path d="M13.6 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.3 0-1.3-.1-2.45-.1-2.4 0-4.05 1.5-4.05 4.2v2.2H7.6V13h2.7v8z" fill="currentColor"/></symbol>
  <symbol id="i-x" viewBox="0 0 24 24"><path d="M17.5 3h3.1l-6.8 7.8L21.8 21h-6.2l-4.9-6.4L5.1 21H2l7.3-8.3L2.4 3h6.4l4.4 5.8zM16.4 19.2h1.7L7.7 4.7H5.9z" fill="currentColor"/></symbol>
  <symbol id="i-wa" viewBox="0 0 24 24"><path d="M12 2.6a9.3 9.3 0 0 0-8 14.1L2.6 21.4l4.9-1.3A9.3 9.3 0 1 0 12 2.6zm5.4 13.2c-.23.65-1.34 1.24-1.85 1.29-.5.05-.96.23-3.23-.67-2.72-1.07-4.45-3.84-4.58-4.02-.13-.18-1.1-1.46-1.1-2.79s.7-1.98.95-2.25a1 1 0 0 1 .72-.34h.52c.17 0 .4-.06.62.48.23.55.78 1.9.85 2.04.07.13.11.29.02.47-.09.18-.13.29-.27.44l-.4.47c-.13.13-.27.28-.11.55.15.27.68 1.13 1.47 1.83 1.01.9 1.86 1.18 2.13 1.32.27.13.42.11.58-.07.16-.18.67-.78.85-1.05.18-.27.36-.22.6-.13.25.09 1.58.75 1.85.88.27.14.45.2.52.32.07.11.07.64-.16 1.29z" fill="currentColor"/></symbol>
</svg>`;
  var host = document.getElementById('sprite');
  if (host) host.innerHTML = sprite;
})();
