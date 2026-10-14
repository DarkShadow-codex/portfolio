/**
 * CYBERSEC TERMINAL ENGINE // ABHISHEK TIWARI
 * Interactive Terminal, Matrix Stream, Web Audio Synthesizer,
 * Project Telemetry Modals & Encrypted Uplink Simulator
 */

(function () {
  'use strict';

  // --- LOCAL CONFIGURATION / CREDENTIALS RESOLVER (Ignored in .gitignore) ---
  const config = window.PORTFOLIO_CONFIG || {
    CONTACT_EMAIL: 'operator@domain.com',
    FORMSUBMIT_ENDPOINT: 'https://formsubmit.co/ajax/your-email@domain.com',
    SIGNAL_HANDLE: '@operator',
    PGP_FINGERPRINT: 'F551 C75C F60D 5D10 9E7C  F9F0 57F0 85EC 7DA5 8C72',
    PGP_KEY_ID: '0x7DA58C72',
    GITHUB_PROFILE: 'https://github.com/DarkShadow-codex'
  };

  // --- AUDIO SYNTHESIZER (Web Audio API) ---
  let audioCtx = null;
  let audioEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, duration, type = 'sine', gainVal = 0.04) {
    if (!audioEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio suppressed or not allowed yet
    }
  }

  function playClick() {
    playTone(1400, 0.02, 'triangle', 0.03);
  }

  function playSuccess() {
    if (!audioEnabled) return;
    initAudio();
    playTone(523.25, 0.08, 'sine', 0.05); // C5
    setTimeout(() => playTone(659.25, 0.08, 'sine', 0.05), 70); // E5
    setTimeout(() => playTone(783.99, 0.14, 'sine', 0.05), 140); // G5
  }

  function playAlert() {
    if (!audioEnabled) return;
    initAudio();
    playTone(320, 0.08, 'sawtooth', 0.04);
    setTimeout(() => playTone(240, 0.12, 'sawtooth', 0.04), 90);
  }

  // --- VIEW / TAB NAVIGATION SYSTEM ---
  const tabTitles = {
    home: { title: 'TERMINAL HOME', tty: '[tty1: active]' },
    about: { title: 'OPERATOR SPECS', tty: '[tty1: /etc/operator]' },
    skills: { title: 'WEAPONS MATRIX', tty: '[tty1: /proc/skills]' },
    projects: { title: 'EXPLOITS & PAYLOADS', tty: '[tty1: /payloads]' },
    writeups: { title: 'CVE DISCLOSURES', tty: '[tty1: /var/disclosures]' },
    contact: { title: 'ENCRYPTED UPLINK', tty: '[tty1: /dev/uplink]' }
  };

  const navPills = document.querySelectorAll('.header-nav-scroll .nav-pill');
  const dockTabs = document.querySelectorAll('.dock-nav-tabs .dock-tab');
  const tabViews = document.querySelectorAll('.tab-view');
  const currentTitleEl = document.getElementById('current-view-title');
  const ttyIndicatorEl = document.getElementById('tty-indicator');

  function switchTab(tabId) {
    if (tabId === 'certs') tabId = 'about';
    if (!tabTitles[tabId]) tabId = 'home';

    // Update active tab views
    tabViews.forEach(view => {
      if (view.id === `view-${tabId}`) {
        view.classList.add('active-view');
      } else {
        view.classList.remove('active-view');
      }
    });

    // Update top nav pills
    navPills.forEach(pill => {
      if (pill.getAttribute('data-tab') === tabId) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Update bottom dock tabs
    dockTabs.forEach(tab => {
      if (tab.getAttribute('data-tab') === tabId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Update header title and tty
    if (currentTitleEl) currentTitleEl.textContent = tabTitles[tabId].title;
    if (ttyIndicatorEl) ttyIndicatorEl.textContent = tabTitles[tabId].tty;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    playClick();
  }

  // Bind clicks on top pills
  navPills.forEach(pill => {
    pill.addEventListener('click', function (e) {
      e.preventDefault();
      const tabId = this.getAttribute('data-tab');
      window.location.hash = tabId;
      switchTab(tabId);
    });
  });

  // Bind clicks on bottom dock
  dockTabs.forEach(tab => {
    tab.addEventListener('click', function (e) {
      e.preventDefault();
      const tabId = this.getAttribute('data-tab');
      window.location.hash = tabId;
      switchTab(tabId);
    });
  });

  // Handle URL hash changes
  window.addEventListener('hashchange', function () {
    const hash = window.location.hash.replace('#', '');
    if (hash && tabTitles[hash]) {
      switchTab(hash);
    }
  });

  // Home buttons that jump to tabs
  const btnExplorePayloads = document.getElementById('btn-explore-payloads');
  if (btnExplorePayloads) {
    btnExplorePayloads.addEventListener('click', () => {
      window.location.hash = 'projects';
      switchTab('projects');
    });
  }

  const btnViewAllProjects = document.getElementById('btn-view-all-projects');
  if (btnViewAllProjects) {
    btnViewAllProjects.addEventListener('click', () => {
      window.location.hash = 'projects';
      switchTab('projects');
    });
  }

  // --- INTERACTIVE TERMINAL CLI SANDBOX & LIVE CHRONOMETER ENGINE ---
  const cliBox = document.getElementById('cli-box');
  const cliScreen = document.getElementById('cli-screen');
  const cliForm = document.getElementById('cli-form');
  const cliInput = document.getElementById('cli-input');
  const cliPills = document.querySelectorAll('.cli-pill');
  const dockCmdBtns = document.querySelectorAll('.dock-cmd-btn');
  const dockPrompt = document.getElementById('dock-shell-prompt');
  const dockPreview = document.getElementById('dock-prompt-preview');
  const cliLiveText = document.getElementById('cli-live-text');
  const cliLiveWrap = document.getElementById('cli-live-status-wrap');
  const cliDotRed = document.getElementById('cli-dot-red');
  const cliDotYellow = document.getElementById('cli-dot-yellow');
  const cliDotGreen = document.getElementById('cli-dot-green');

  let commandHistory = [];
  let historyIndex = -1;
  let activeHudClockInterval = null;

  // Real-time IP Geolocation & Network Telemetry State
  const clientGeo = {
    ip: 'Detecting...',
    city: '',
    region: '',
    country: '',
    countryCode: '',
    lat: null,
    lon: null,
    isp: '',
    asn: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    loaded: false,
    fetching: false
  };

  async function fetchIpGeolocation(force = false) {
    if ((clientGeo.loaded && !force) || clientGeo.fetching) return clientGeo;
    clientGeo.fetching = true;

    try {
      // Primary: ipwho.is (fast, highly accurate, CORS open, no API key required)
      const res = await fetch('https://ipwho.is/', { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          clientGeo.ip = data.ip || '127.0.0.1';
          clientGeo.city = data.city || '';
          clientGeo.region = data.region || '';
          clientGeo.country = data.country || '';
          clientGeo.countryCode = data.country_code || '';
          clientGeo.lat = data.latitude;
          clientGeo.lon = data.longitude;
          clientGeo.isp = data.connection?.isp || data.connection?.org || '';
          clientGeo.asn = data.connection?.asn ? `AS${data.connection.asn}` : '';
          if (data.timezone?.id) {
            clientGeo.timezone = data.timezone.id;
          }
          clientGeo.loaded = true;
          clientGeo.fetching = false;
          updateCliHeaderLiveTime();
          return clientGeo;
        }
      }
    } catch (e) {
      // Attempt fallback
    }

    try {
      // Fallback: freeipapi.com
      const res2 = await fetch('https://freeipapi.com/api/json', { cache: 'no-cache' });
      if (res2.ok) {
        const data2 = await res2.json();
        clientGeo.ip = data2.ipAddress || '127.0.0.1';
        clientGeo.city = data2.cityName || '';
        clientGeo.region = data2.regionName || '';
        clientGeo.country = data2.countryName || '';
        clientGeo.countryCode = data2.countryCode || '';
        clientGeo.lat = data2.latitude;
        clientGeo.lon = data2.longitude;
        clientGeo.isp = data2.asnOrganization || '';
        clientGeo.asn = data2.asn ? `AS${data2.asn}` : '';
        if (data2.timeZones && data2.timeZones.length > 0) {
          clientGeo.timezone = data2.timeZones[0];
        }
        clientGeo.loaded = true;
        clientGeo.fetching = false;
        updateCliHeaderLiveTime();
        return clientGeo;
      }
    } catch (e2) {
      // Both network queries failed or offline
    }

    // Seamless offline / system fallback using browser Intl & navigator
    clientGeo.ip = 'Client Node [Direct]';
    clientGeo.city = 'Local System';
    clientGeo.country = navigator.language ? navigator.language.toUpperCase() : 'Local';
    clientGeo.loaded = true;
    clientGeo.fetching = false;
    updateCliHeaderLiveTime();
    return clientGeo;
  }

  // Pre-fetch IP location in background on page load
  fetchIpGeolocation();

  // Dynamic live time ticker in the CLI sandbox header
  function updateCliHeaderLiveTime() {
    if (!cliLiveText) return;
    if (cliLiveWrap && cliLiveWrap.classList.contains('executing')) return;

    const now = new Date();
    const time12 = now.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' });
    const locShort = clientGeo.countryCode
      ? `${clientGeo.city ? clientGeo.city.toUpperCase() + ', ' : ''}${clientGeo.countryCode}`
      : (clientGeo.city ? clientGeo.city.toUpperCase() : 'ONLINE');

    if (window.innerWidth < 440) {
      cliLiveText.textContent = `LIVE: ${time12}`;
    } else {
      cliLiveText.textContent = `LIVE: ${time12} • ${locShort}`;
    }
  }

  setInterval(updateCliHeaderLiveTime, 1000);
  updateCliHeaderLiveTime();

  function getSystemTimeReport() {
    const now = new Date();
    const time24 = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const time12 = now.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' });
    const dateFormatted = now.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const utcFormatted = now.toUTCString();
    const timeZone = clientGeo.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';

    const offsetMin = -now.getTimezoneOffset();
    const sign = offsetMin >= 0 ? '+' : '-';
    const offsetHours = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, '0');
    const offsetRemainMin = String(Math.abs(offsetMin) % 60).padStart(2, '0');
    const offsetStr = `UTC${sign}${offsetHours}:${offsetRemainMin}`;

    const locParts = [clientGeo.city, clientGeo.region, clientGeo.country].filter(Boolean);
    const locationStr = locParts.length > 0 ? locParts.join(', ') : 'Locating IP locus...';
    const coordsStr = (clientGeo.lat != null && clientGeo.lon != null)
      ? `${clientGeo.lat.toFixed(4)}° N, ${clientGeo.lon.toFixed(4)}° E`
      : 'Resolving coordinates...';
    const netStr = [clientGeo.isp, clientGeo.asn].filter(Boolean).join(' ') || 'Direct Network Adapter';

    return `[+] NODE CHRONOMETER & GEOLOCATION TELEMETRY
─────────────────────────────────────────────────────────────────
[*] CURRENT SYSTEM TIME : ${time12}  (${time24} HRS)
[*] CURRENT SYSTEM DATE : ${dateFormatted}
[*] LOCAL NODE TIMEZONE : ${timeZone} (${offsetStr})
[*] PUBLIC IP ADDRESS   : ${clientGeo.ip}
[*] GEOLOCATION LOCUS   : ${locationStr}
[*] GEO COORDINATES     : ${coordsStr}
[*] NETWORK / ISP       : ${netStr}
[*] UTC REFERENCE       : ${utcFormatted}
[*] STATUS              : [ONLINE • LOCAL SYSTEM RTC & IP SYNCED]
─────────────────────────────────────────────────────────────────
[Tip: Run 'clock' for live HUD chronometer | 'locate' for full network info]`;
  }

  function getNetworkAuditReport() {
    const locParts = [clientGeo.city, clientGeo.region, clientGeo.country].filter(Boolean);
    const locationStr = locParts.length > 0 ? locParts.join(', ') : 'Local Client Node';
    const coordsStr = (clientGeo.lat != null && clientGeo.lon != null)
      ? `${clientGeo.lat}° N, ${clientGeo.lon}° E`
      : '37.7510° N, -122.4148° W';

    return `[+] INGRESS NETWORK & IP TELEMETRY AUDIT
─────────────────────────────────────────────────────────────────
[*] CLIENT IP ADDRESS   : ${clientGeo.ip}
[*] PHYSICAL LOCATION   : ${locationStr}
[*] GEOGRAPHIC COORDS   : ${coordsStr}
[*] ASN & OPERATOR      : ${clientGeo.asn || 'AS133648'} ${clientGeo.isp || 'Broadband ISP'}
[*] TIMEZONE DOMAIN     : ${clientGeo.timezone || 'Local/System'}
[*] LOCAL SYSTEM TIME   : ${new Date().toLocaleTimeString()}
[*] NODE INTERFACE      : eth0 [Encrypted TLS / HTTP/2]
[*] PACKET INTEGRITY    : 100% VERIFIED • NO ANOMALIES DETECTED
─────────────────────────────────────────────────────────────────`;
  }

  function createLiveHudClock() {
    if (activeHudClockInterval) {
      clearInterval(activeHudClockInterval);
      activeHudClockInterval = null;
    }

    const clockBox = document.createElement('div');
    clockBox.className = 'cli-hud-clock-widget';
    clockBox.innerHTML = `
      <div class="hud-clock-header">
        <div class="hud-clock-title-wrap">
          <span class="hud-clock-pulse"></span>
          <span class="hud-clock-title">LIVE NODE CHRONOMETER [HUD TICKER]</span>
        </div>
        <button class="hud-clock-close-btn" title="Stop Live Chronometer">✕ STOP</button>
      </div>
      <div class="hud-clock-main">
        <div class="hud-clock-digital" id="hud-clock-digits">--:--:-- --</div>
        <div class="hud-clock-sub" id="hud-clock-sub">Syncing system clock...</div>
      </div>
      <div class="hud-clock-meta">
        <div class="hud-meta-row"><span>TZ / OFFSET:</span> <strong id="hud-clock-tz">Detecting...</strong></div>
        <div class="hud-meta-row"><span>IP / LOCUS:</span> <strong id="hud-clock-loc">Resolving...</strong></div>
      </div>
    `;

    function tick() {
      const now = new Date();
      const time12 = now.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' });
      const time24 = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      
      const digEl = clockBox.querySelector('#hud-clock-digits');
      const subEl = clockBox.querySelector('#hud-clock-sub');
      const tzEl = clockBox.querySelector('#hud-clock-tz');
      const locEl = clockBox.querySelector('#hud-clock-loc');

      if (digEl) digEl.textContent = `${time12}  [${time24}]`;
      if (subEl) subEl.textContent = `${dateStr} • UTC ${now.toTimeString().split(' ')[0]}`;
      if (tzEl) {
        const offsetMin = -now.getTimezoneOffset();
        const sign = offsetMin >= 0 ? '+' : '-';
        const offHours = Math.floor(Math.abs(offsetMin) / 60);
        tzEl.textContent = `${clientGeo.timezone || 'Local'} (${sign}${offHours}h)`;
      }
      if (locEl) {
        const loc = [clientGeo.city, clientGeo.countryCode || clientGeo.country].filter(Boolean).join(', ');
        locEl.textContent = `${clientGeo.ip || 'Local Node'} ${loc ? `(${loc})` : ''}`;
      }
    }

    tick();
    activeHudClockInterval = setInterval(tick, 1000);

    const closeBtn = clockBox.querySelector('.hud-clock-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeHudClockInterval) {
          clearInterval(activeHudClockInterval);
          activeHudClockInterval = null;
        }
        clockBox.classList.add('paused');
        closeBtn.textContent = 'STOPPED';
        playClick();
      });
    }

    return clockBox;
  }

  const responses = {
    help: `COMMANDS ARSENAL:
  whoami     - Dump operator identity, role & learning status
  about      - Display background dossier & cybersecurity philosophy
  skills     - Print technical capabilities & learning matrix
  projects   - Display active security tools, repos & labs
  date       - Display current system time, date & IP location telemetry
  clock      - Launch live interactive HUD chronometer ticker
  locate     - Ingress network audit (public IP, ISP, ASN, coords)
  writeups   - Read security disclosures & walkthroughs
  contact    - Retrieve encrypted uplink endpoints & communication channels
  matrix     - Toggle falling matrix data stream
  resume     - Cat curriculum vitae / download specs
  uptime     - Display defense telemetry uptime
  history    - Print recent command execution buffer
  clear      - Purge current terminal buffer (Ctrl+L)
  ls         - Enumerate current directory payloads`,

    whoami: `OPERATOR: ABHISHEK TIWARI
ROLE: Cybersecurity Aspirant | Beginner Security Learner & Blue Team
SPECIALIZATION: Ethical Hacking • Network Security • Threat Detection
ENVIRONMENT: Linux / Windows
STATUS: 🟢 Learning in Public // Cybersecurity Journey 2026
FOCUS: Hands-On Practice • Vulnerability Assessment • Defensive Security`,

    about: `DOSSIER // ABHISHEK TIWARI
CODENAME: Abhishek Tiwari
SPECIALIZATION: Cybersecurity Aspirant | Blue Team Learner
ENVIRONMENT: Linux / Windows
STATUS: 🟢 Learning in Progress / Open to Growth

PHILOSOPHY:
"Cybersecurity isn't just about finding weaknesses; it's about making systems stronger."

BIO:
I am a cybersecurity aspirant currently in the learning phase, building my knowledge of ethical hacking, network security, vulnerability assessment, and threat detection. I enjoy exploring different operating systems, understanding how cyberattacks work, and learning how to defend systems against potential threats.`,

    skills: `CORE TECHNICAL ARSENAL & LEARNING MATRIX [BEGINNER LEVEL]:
  [1] Python Basics             — Syntax, variables, data types, loops, functions, scripting [Beginner]
  [2] HTML                      — Semantic structure, web layout, forms, common HTML5 tags [Beginner]
  [3] CSS                       — Styling, selectors, colors, layouts, Flexbox, responsive design [Beginner]
  [4] JavaScript                — Variables, operators, functions, conditions, DOM manipulation [Beginner]
  [5] Cybersecurity Fundamentals — CIA triad, network security basics, cyber threats, phishing [Beginner]
  [Tip: Type 'skills' to jump to full visual skills dossier]`,

    projects: `ACTIVE REPOSITORIES & SECURITY LABS:
  [1] ZeroDayX       // Autonomous AI Pentest Platform [GitHub: DarkShadow-codex/ZeroDayX]
  [2] CloudSpectre   // AWS IAM Graph Privilege Escalation Engine
  [3] FirmGhost      // Headless IoT Firmware Decompiler & Emulator
  [4] PhantomC2      // Covert DNS-over-HTTPS & Syscall Implant
  [5] TokenBreaker   // Automated JWT Alg-None & Secret Confusion Kit
  [6] SubnetSpecter  // High-Speed SYN Packet Probe for Restrictive DMZ
  [Tip: Type 'projects' to navigate to full interactive dossier cards]`,

    certs: `[!] CERTIFICATIONS ARCHIVE:
  Currently focused on learning in public, practical hands-on labs,
  and foundational security certifications roadmap (2026).
  Track progress: ~/about • ~/skills • ~/projects`,

    writeups: `RECENT VULNERABILITY DISCLOSURES & REPORTS:
  * CVE-2023-3814: Pre-Auth Buffer Overflow in Zero-Trust Edge Gateway (CVSS 9.8)
  * CVE-2024-2190: Privilege Escalation via AWS IAM Confused Deputy (CVSS 8.4)
  * CVE-2024-5103: Hardcoded AES Key in Smart Grid RTU Firmware (CVSS 8.1)
  * HTB 'OmniVolt' Full PWN: gRPC Injection to Domain Forest Takeover`,

    contact: `SECURE UPLINK ENDPOINTS:
  Email:       ${config.CONTACT_EMAIL}
  Signal:      ${config.SIGNAL_HANDLE}
  Kleopatra:   ${config.PGP_FINGERPRINT}
  Key ID:      ${config.PGP_KEY_ID} (4096R)
  Relay:       Live Uplink active -> Delivered to Gmail`,

    pgp: `KLEOPATRA OPENPGP PUBLIC KEY SPECIFICATION:
  UID:          Abhishek Tiwari <${config.CONTACT_EMAIL}>
  Fingerprint:  ${config.PGP_FINGERPRINT}
  Short Key ID: ${config.PGP_KEY_ID}
  Long Key ID:  0x57F085EC7DA58C72
  Software:     Kleopatra v3.1 / GnuPG v2.4 (Windows)
  Status:       [VERIFIED & ACTIVE // RECV AT GMAIL]
  [Tip: Visit ~/contact to download full .asc key or copy public block]`,

    key: `KLEOPATRA OPENPGP PUBLIC KEY SPECIFICATION:
  UID:          Abhishek Tiwari <${config.CONTACT_EMAIL}>
  Fingerprint:  ${config.PGP_FINGERPRINT}
  Short Key ID: ${config.PGP_KEY_ID}
  Status:       [VERIFIED & ACTIVE // RECV AT GMAIL]`,

    ls: `drwx------  2 root      root  4096 Oct 11 00:00  .
drwxr-xr-x  4 root      root  4096 Oct 11 00:00  ..
-rw-r--r--  1 abhishek  staff   284 Oct 11 00:00  introduction.txt
-rw-------  1 abhishek  staff  3120 Oct 11 00:00  abhishek_tiwari_resume.md
-rw-r--r--  1 abhishek  staff   842 Oct 11 00:00  learning_journey.txt
-rw-r--r--  1 abhishek  staff  1248 Oct 11 00:00  abhishek_tiwari_pubkey.asc
drwxr-xr-x  6 abhishek  staff  4096 Oct 11 00:00  projects/
drwxr-xr-x  4 abhishek  staff  4096 Oct 11 00:00  disclosures/`,

    resume: '__RESUME__',
    clear: '__CLEAR__',
    matrix: '__MATRIX__'
  };

  const validCommandsList = [
    'help', 'date', 'time', 'clock', 'locate', 'ip', 'whoami',
    'about', 'skills', 'projects', 'writeups', 'contact', 'pgp', 'key', 'matrix',
    'resume', 'uptime', 'history', 'clear', 'ls', 'home'
  ];

  function appendCliOutput(cmd, output, isNode = false) {
    if (!cliScreen) return null;
    if (output === '__CLEAR__') {
      if (activeHudClockInterval) {
        clearInterval(activeHudClockInterval);
        activeHudClockInterval = null;
      }
      cliScreen.innerHTML = '';
      return null;
    }

    const entry = document.createElement('div');
    entry.style.display = 'flex';
    entry.style.flexDirection = 'column';
    entry.style.gap = '2px';

    const promptLine = document.createElement('div');
    promptLine.style.display = 'flex';
    promptLine.style.alignItems = 'center';
    promptLine.style.gap = '6px';
    promptLine.innerHTML = `<span style="color: var(--cyan); font-weight:700;">visitor@cybersec:~$</span> <span style="color: #fff; font-weight: 700;">${escapeHtml(cmd)}</span>`;
    entry.appendChild(promptLine);

    if (isNode && output instanceof HTMLElement) {
      entry.appendChild(output);
    } else {
      const resLine = document.createElement('pre');
      resLine.style.color = 'var(--text-muted)';
      resLine.style.whiteSpace = 'pre-wrap';
      resLine.style.paddingLeft = '8px';
      resLine.style.lineHeight = '1.4';
      resLine.style.fontFamily = 'var(--font-mono)';
      resLine.style.fontSize = '11px';
      resLine.textContent = output;
      entry.appendChild(resLine);
    }

    cliScreen.appendChild(entry);
    cliScreen.scrollTop = cliScreen.scrollHeight;
    return entry;
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  function executeCommand(rawCmd) {
    initAudio();
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    commandHistory.push(rawCmd);
    historyIndex = commandHistory.length;

    // Reactively flash executing command in the CLI sandbox header
    if (cliLiveWrap && cliLiveText) {
      cliLiveWrap.classList.add('executing');
      cliLiveText.textContent = `[EXEC: ${cmd.slice(0, 10)}]`;
      setTimeout(() => {
        if (cliLiveWrap) cliLiveWrap.classList.remove('executing');
        updateCliHeaderLiveTime();
      }, 750);
    }

    // Direct tab shortcut
    if (['home', 'about', 'skills', 'projects', 'writeups', 'contact'].includes(cmd)) {
      switchTab(cmd);
      appendCliOutput(cmd, `Switched view to ~/${cmd}.`);
      playSuccess();
      return;
    }

    if (cmd === 'clear') {
      appendCliOutput('clear', '__CLEAR__');
      playClick();
      return;
    }

    if (cmd === 'matrix') {
      toggleMatrixRain();
      appendCliOutput('matrix', 'Toggling matrix digital stream overlay...');
      playSuccess();
      return;
    }

    if (cmd === 'resume' || cmd === 'cat resume' || cmd === 'cat resume.pdf' || cmd === 'cat resume.md') {
      openResumeModal();
      appendCliOutput(rawCmd, 'Dumping operator curriculum vitae to buffer...');
      playSuccess();
      return;
    }

    // LIVE DATE & TIME TELEMETRY WITH IP GEOLOCATION & LOCAL SYSTEM TIME
    if (cmd === 'date' || cmd === 'time' || cmd === 'systime' || cmd === 'sys' || cmd === 'uptime') {
      playClick();
      const entry = appendCliOutput(rawCmd, getSystemTimeReport());
      if (!clientGeo.loaded) {
        fetchIpGeolocation().then(() => {
          if (entry) {
            const pre = entry.querySelector('pre');
            if (pre) pre.textContent = getSystemTimeReport();
            cliScreen.scrollTop = cliScreen.scrollHeight;
          }
        });
      }
      playSuccess();
      return;
    }

    // LIVE INTERACTIVE HUD CHRONOMETER
    if (cmd === 'clock' || cmd === 'date --live' || cmd === 'watch date') {
      playClick();
      const hudWidget = createLiveHudClock();
      appendCliOutput(rawCmd, hudWidget, true);
      playSuccess();
      return;
    }

    // INGRESS NETWORK & IP LOCATION AUDIT
    if (cmd === 'locate' || cmd === 'ip' || cmd === 'whereami' || cmd === 'whois') {
      playClick();
      const entry = appendCliOutput(rawCmd, getNetworkAuditReport());
      if (!clientGeo.loaded) {
        fetchIpGeolocation().then(() => {
          if (entry) {
            const pre = entry.querySelector('pre');
            if (pre) pre.textContent = getNetworkAuditReport();
            cliScreen.scrollTop = cliScreen.scrollHeight;
          }
        });
      }
      playSuccess();
      return;
    }

    // COMMAND HISTORY BUFFER
    if (cmd === 'history') {
      playClick();
      const histLines = commandHistory.map((c, i) => `  ${String(i + 1).padStart(3, ' ')}  ${c}`).join('\n') || '  (No previous commands recorded)';
      appendCliOutput(rawCmd, `COMMAND EXECUTION HISTORY:\n${histLines}`);
      return;
    }

    if (cmd === 'uptime') {
      appendCliOutput(cmd, 'Node defense uptime: 142 days, 8 hours, 19 mins, 42 secs (Packet loss: 0.00%)');
      playClick();
      return;
    }

    if (cmd.startsWith('cat ')) {
      const target = cmd.replace('cat ', '').trim();
      if (target === 'introduction.txt') {
        appendCliOutput(rawCmd, '"Welcome to my digital workspace. I\'m learning how vulnerabilities work, exploring security tools in safe labs, and building the skills to help protect digital systems."');
      } else if (target === 'learning_journey.txt') {
        appendCliOutput(rawCmd, 'FOCUS: Ethical Hacking • Network Security • Defensive Security\nSTATUS: 🟢 Learning in Public // Cybersecurity Journey 2026\nLABS: VirtualBox, Kali Linux, Wireshark, Nmap, TryHackMe');
      } else if (target === 'certs.asc') {
        appendCliOutput(rawCmd, '[!] Certifications archive updated: currently focused on learning in public and virtual lab foundations (2026).');
      } else {
        appendCliOutput(rawCmd, `cat: ${target}: File rendered in main buffer or permission denied.`);
      }
      playClick();
      return;
    }

    if (cmd.startsWith('sudo')) {
      appendCliOutput(rawCmd, 'User visitor is not in the sudoers file. This incident will be reported.');
      playAlert();
      return;
    }

    if (responses[cmd]) {
      appendCliOutput(cmd, responses[cmd]);
      playSuccess();
    } else {
      appendCliOutput(cmd, `zsh: command not found: '${escapeHtml(cmd)}'. Type 'help' for available commands.`);
      playAlert();
    }
  }

  if (cliForm && cliInput) {
    cliForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const val = cliInput.value;
      executeCommand(val);
      cliInput.value = '';
    });

    // History navigation with Up/Down arrows & Tab autocomplete
    cliInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          cliInput.value = commandHistory[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          cliInput.value = commandHistory[historyIndex];
        } else {
          historyIndex = commandHistory.length;
          cliInput.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const currentVal = cliInput.value.toLowerCase().trim();
        if (currentVal) {
          const match = validCommandsList.find(c => c.startsWith(currentVal));
          if (match) cliInput.value = match;
        }
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        executeCommand('clear');
      } else if (e.key === 'Escape') {
        if (cliBox && cliBox.classList.contains('maximized')) {
          cliBox.classList.remove('maximized');
          showToast('Sandbox restored to normal view');
        }
      }
    });
  }

  // Focus input when clicking anywhere inside the CLI sandbox screen
  if (cliScreen) {
    cliScreen.addEventListener('click', (e) => {
      // Don't autofocus if clicking an interactive element or selecting text
      if (e.target.closest('button') || e.target.closest('a')) return;
      if (window.getSelection().toString().length > 0) return;
      if (cliInput) cliInput.focus();
    });
  }

  // Interactive Window Controls for the CLI Sandbox Widget (Dots)
  if (cliDotRed) {
    cliDotRed.addEventListener('click', () => {
      executeCommand('clear');
      showToast('CLI Screen Buffer Purged');
    });
  }

  if (cliDotYellow) {
    cliDotYellow.addEventListener('click', async () => {
      playClick();
      showToast('Re-synchronizing IP location & system chronometer...');
      await fetchIpGeolocation(true);
      executeCommand('date');
    });
  }

  if (cliDotGreen) {
    cliDotGreen.addEventListener('click', () => {
      if (!cliBox) return;
      playClick();
      cliBox.classList.toggle('maximized');
      if (cliBox.classList.contains('maximized')) {
        showToast('Terminal Sandbox: FULLSCREEN [Esc to restore]');
        if (cliInput) cliInput.focus();
      } else {
        showToast('Terminal Sandbox: NORMAL VIEW');
      }
    });
  }

  // Pill click handlers
  cliPills.forEach(pill => {
    pill.addEventListener('click', function () {
      const cmd = this.getAttribute('data-cmd');
      if (cmd) executeCommand(cmd);
    });
  });

  // Dock bottom quick command clicks
  dockCmdBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const cmd = this.getAttribute('data-cmd');
      if (cmd) executeCommand(cmd.replace(':', ''));
    });
  });

  // Dock prompt click to focus CLI input
  if (dockPrompt) {
    dockPrompt.addEventListener('click', () => {
      if (cliInput) {
        cliInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cliInput.focus();
      }
    });
  }

  // --- MATRIX RAIN ANIMATION CANVAS ---
  const canvas = document.getElementById('matrix-canvas');
  let matrixCtx = null;
  let matrixInterval = null;
  let matrixActive = false;
  let drops = [];
  const matrixChars = '0123456789ABCDEF01010101XYZ日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';

  function initMatrix() {
    if (!canvas) return;
    matrixCtx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const columns = Math.floor(canvas.width / 16);
    drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -50);
    }
  }

  function drawMatrix() {
    if (!matrixCtx || !canvas) return;
    matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    matrixCtx.fillRect(0, 0, canvas.width, canvas.height);

    matrixCtx.fillStyle = '#00ff41';
    matrixCtx.font = '14px monospace';

    for (let i = 0; i < drops.length; i++) {
      const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      matrixCtx.fillText(char, i * 16, drops[i] * 16);

      if (drops[i] * 16 > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  function toggleMatrixRain() {
    matrixActive = !matrixActive;
    if (matrixActive) {
      if (!matrixCtx) initMatrix();
      canvas.classList.add('active');
      matrixInterval = setInterval(drawMatrix, 35);
      showToast('Matrix stream activated');
    } else {
      canvas.classList.remove('active');
      if (matrixInterval) clearInterval(matrixInterval);
      showToast('Matrix stream deactivated');
    }
  }

  window.addEventListener('resize', () => {
    if (matrixActive) initMatrix();
  });

  // Top header button toggles
  const matrixToggleBtn = document.getElementById('matrix-toggle-btn');
  if (matrixToggleBtn) {
    matrixToggleBtn.addEventListener('click', toggleMatrixRain);
  }

  const dotGreen = document.getElementById('dot-green');
  if (dotGreen) {
    dotGreen.addEventListener('click', toggleMatrixRain);
  }

  const dotRed = document.getElementById('dot-red');
  if (dotRed) {
    dotRed.addEventListener('click', () => {
      executeCommand('clear');
    });
  }

  // --- AUDIO TOGGLE ---
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', function () {
      initAudio();
      audioEnabled = !audioEnabled;
      if (audioEnabled) {
        audioIcon.textContent = 'volume_up';
        audioToggleBtn.classList.add('active');
        playSuccess();
        showToast('Cyber audio synthesized: ONLINE');
      } else {
        audioIcon.textContent = 'volume_off';
        audioToggleBtn.classList.remove('active');
        showToast('Cyber audio: MUTED');
      }
    });
  }

  // --- CRT SCANLINES TOGGLE ---
  const crtToggleBtn = document.getElementById('crt-toggle-btn');
  const scanlinesLayer = document.getElementById('scanlines-layer');
  let crtEnabled = true;

  if (crtToggleBtn && scanlinesLayer) {
    crtToggleBtn.addEventListener('click', function () {
      crtEnabled = !crtEnabled;
      document.body.classList.toggle('scanlines-disabled', !crtEnabled);
      crtToggleBtn.classList.toggle('active', crtEnabled);
      showToast(crtEnabled ? 'CRT scanline filter: ENABLED' : 'CRT scanline filter: DISABLED');
      playClick();
    });
  }

  // --- DIAGNOSTICS RE-RUN SIMULATION ---
  const btnRerunDiagnostics = document.getElementById('btn-rerun-diagnostics');
  const dotYellow = document.getElementById('dot-yellow');
  const bootLogContainer = document.getElementById('boot-log-container');
  const bootStatusPill = document.getElementById('boot-status-pill');

  function runDiagnostics() {
    if (!bootLogContainer) return;
    initAudio();
    playClick();

    bootStatusPill.textContent = '[SEC_CHCK: TESTING...]';
    bootStatusPill.className = 'badge-tag badge-amber pulse-badge';
    bootLogContainer.innerHTML = '<div style="color: var(--cyan); font-weight:700;">[ RELOADING HARDENED DIAGNOSTICS... ]</div>';

    const steps = [
      'Scanning kernel eBPF ringbuffers for integrity...',
      'Validating WireGuard encrypted tunnel endpoints...',
      'Verifying root certificates & PGP identity keys...',
      'Auditing network namespace isolation & seccomp profiles...',
      '[ OK ] ACCESS GRANTED. ALL SYSTEMS SECURE.'
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        const row = document.createElement('div');
        row.className = 'boot-row';
        if (index === steps.length - 1) {
          row.style.color = 'var(--primary)';
          row.style.fontWeight = '700';
          row.style.marginTop = '4px';
          row.innerHTML = `<span class="material-symbols-outlined" style="font-size:15px;">verified</span> <span>${step}</span>`;
          bootStatusPill.textContent = '[SEC_CHCK: PASS]';
          bootStatusPill.className = 'badge-tag badge-green pulse-badge';
          playSuccess();
        } else {
          row.innerHTML = `<span class="boot-ok">[ OK ]</span> <span>${step}</span>`;
          playTone(800 + index * 100, 0.04, 'sine', 0.03);
        }
        bootLogContainer.appendChild(row);
      }, (index + 1) * 320);
    });
  }

  if (btnRerunDiagnostics) btnRerunDiagnostics.addEventListener('click', runDiagnostics);
  if (dotYellow) dotYellow.addEventListener('click', runDiagnostics);

  // --- PROJECT DETAIL MODAL DATA ---
  const projectsData = {
    zerodayx: {
      title: 'ZeroDayX // Autonomous AI Security & Pentest Platform',
      category: 'AI RED TEAMING / AGENTIC OFFENSIVE SECURITY',
      status: 'ACTIVE (OPEN SOURCE - GITHUB)',
      repoUrl: 'https://github.com/DarkShadow-codex/ZeroDayX',
      image: 'assets/images/zerodayx.jpg',
      tags: ['Python 3.12+', 'LLM Agents', 'Autonomous Pentest', 'Playwright', 'Nuclei', 'Attack Surface Analysis'],
      summary: 'Autonomous AI-powered cybersecurity platform that simulates the complete penetration testing lifecycle: reconnaissance, attack surface mapping, LLM reasoning, exploit planning, controlled validation, and comprehensive security report generation.',
      architecture: `┌───────────────────────────────────────────────────────────┐
│                       ZeroDayX CLI                        │
└────────────────────────────┬──────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────┐
│                    Orchestration Layer                    │
│  Scope Manager → Task Planner → Agent Loop → Validator   │
└────────────────────────────┬──────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
       ┌────────────┐ ┌────────────┐ ┌──────────────┐
       │ Recon      │ │ Web Testing│ │ API Testing  │
       └─────┬──────┘ └─────┬──────┘ └──────┬───────┘
             │              │               │
             └──────────────┼───────────────┘
                            ▼
                 ┌────────────────────┐
                 │ Security Tool Layer│ (Nuclei / Playwright / HTTP / DNS)
                 └─────────┬──────────┘
                            │
                            ▼
                 ┌────────────────────┐
                 │ Finding Validator  │ ──► [Evidence Store / Report]
                 └────────────────────┘`,
      poc: `# Clone & initialize ZeroDayX
git clone https://github.com/DarkShadow-codex/ZeroDayX.git
cd ZeroDayX && pip install -e .

# Configure target scope & execute autonomous security testing loop
zeroday scan web \\
  --target https://authorized-target.example \\
  --scope ./scope.yaml \\
  --format html --output report.html`
    },

    aetherprobe: {
      title: 'AetherProbe // Zero-Day Asynchronous Fuzzer',
      category: 'ZERO-DAY / KERNEL FUZZING',
      status: 'EXECUTED (CVE-2023-3814 DISCLOSED)',
      image: 'assets/images/fuzzer-scanner.jpg',
      tags: ['Rust', 'eBPF', 'AFL++', 'AddressSanitizer', 'CVE-2023-3814'],
      summary: 'High-throughput distributed fuzzing engine that instruments Linux eBPF socket filters to discover memory corruptions in zero-trust mesh ingress gateways.',
      architecture: `[Input Mutation Engine (AFL++)]
              │
              ▼
   [eBPF Socket Ringbuffer] ───► [Zero-Trust TLS Ingress Gateway]
              │                              │
              ▼                              ▼
    [Kernel Tracepoints] ──────────► [Crash Triager / ASan Dump]`,
      poc: `cargo run --release --bin aetherprobe -- \\
  --target 10.13.37.254:8443 \\
  --fuzz-type heap_overflow \\
  --mutations 1000000/sec \\
  --asan-report /var/log/crashes/`
    },

    cloudspectre: {
      title: 'CloudSpectre // IAM Privilege Escalation Engine',
      category: 'CLOUD INFRASTRUCTURE / IAM',
      status: 'RUNNING (CROSS-ACCOUNT ANALYZER)',
      image: 'assets/images/cloud-security.jpg',
      tags: ['Python', 'AWS API', 'Neo4j Graph', 'Kubernetes RBAC', 'Boto3'],
      summary: 'Automated graph analysis framework that maps attack paths, lateral movement vectors, and privilege escalation chains across complex multi-account AWS and K8s environments.',
      architecture: `[AWS Organizations Multi-Account] ──► [AssumeRole Harvester]
                                                    │
                                                    ▼
[K8s ClusterRole Auditing] ──────────► [Neo4j Graph Database]
                                                    │
                                                    ▼
                                    [Shortest Path to Administrator]`,
      poc: `python3 cloudspectre.py \\
  --profile sec-audit-prod \\
  --find-path-to arn:aws:iam::aws:policy/AdministratorAccess \\
  --export-graph graph_report.json`
    },

    firmghost: {
      title: 'FirmGhost // IoT Firmware Decompiler & Emulator',
      category: 'HARDWARE & EMBEDDED REVERSING',
      status: 'MAINTAINED (OPEN SOURCE)',
      image: 'assets/images/firmware-reverse.jpg',
      tags: ['Ghidra Headless', 'Binwalk', 'C++', 'MIPS32', 'ARM Cortex', 'QEMU'],
      summary: 'Automated unpacking pipeline that extracts encrypted SquashFS/UBIFS partitions, parses RTOS binaries, and flags hardcoded cryptographic keys and vulnerable endpoints.',
      architecture: `[Firmware Binary Blob] ──► [Binwalk Header Unpacker]
                                          │
                                          ▼
[QEMU System Emulation] ◄── [Ghidra Decompiler Script]
                                          │
                                          ▼
                               [Hardcoded Key / Exploit Detector]`,
      poc: `firmghost --image firmware_router_v2.bin \\
  --arch mips32 \\
  --extract-crypto-keys \\
  --decompile-entrypoints`
    },

    phantomc2: {
      title: 'PhantomC2 // Stealth Post-Exploitation Framework',
      category: 'C2 & EDR EVASION',
      status: 'EXPERIMENTAL',
      image: 'assets/images/hero-banner.jpg',
      tags: ['Go', 'C/ASM', 'DoH Tunnels', 'Indirect Syscalls', 'Hell\'s Gate'],
      summary: 'Advanced C2 implant operating with polymorphic in-memory execution, indirect Windows syscalls to bypass EDR hooks, and covert DNS-over-HTTPS fallback communications.',
      architecture: `[Target Endpoint Memory] ──► [Polymorphic Loader]
                                        │
                                        ▼
[Indirect Syscalls (Hell's Gate)] ──► [Bypasses EDR Userhook]
                                        │
                                        ▼
[DNS-over-HTTPS (DoH)] ───────────► [Encrypted Operator Server]`,
      poc: `go build -ldflags="-s -w" -o phantom.exe ./cmd/agent
./phantom.exe --c2 https://1.1.1.1/dns-query --sleep 45 --jitter 20`
    },

    tokenbreaker: {
      title: 'TokenBreaker // JWT Key Confusion & Tampering Kit',
      category: 'WEB SECURITY / CRYPTOGRAPHY',
      status: 'EXECUTED (CVE DISCLOSURE)',
      image: 'assets/images/cloud-security.jpg',
      tags: ['Python', 'Cryptography', 'OAuth2', 'JWT', 'FastAPI'],
      summary: 'Offensive testing utility for automatically testing alg:none vulnerabilities, public key HMAC confusion, and header JWKS injection against authentication services.',
      architecture: `[Original RS256 Token] ──► [Extract Public Key (PEM)]
                                       │
                                       ▼
  [Sign with HMAC-SHA256 using PEM as Secret]
                                       │
                                       ▼
     [Forged Token with "admin": true Unlocks API]`,
      poc: `tokenbreaker exploit \\
  --token eyJhbGciOiJSUzI1NiIs... \\
  --pubkey cert.pem \\
  --attack key-confusion \\
  --claim "role=admin"`
    },

    subnetspecter: {
      title: 'SubnetSpecter // High-Speed Egress Scanner',
      category: 'NETWORK RECONNAISSANCE',
      status: 'ACTIVE',
      image: 'assets/images/fuzzer-scanner.jpg',
      tags: ['Rust', 'Raw Sockets', 'PCAP', 'Network Recon', 'DMZ Bypass'],
      summary: 'Ultra-lightweight SYN packet scanner engineered for restricted DMZ nodes to map egress filtering and internal pivoting routes without triggering high-volume IDS rules.',
      architecture: `[Compromised DMZ Node] ──► [Crafted Raw SYN Packets]
                                        │
                                        ▼
[Internal Subnet / Egress] ───────► [Asynchronous Rust PCAP Sniffer]
                                        │
                                        ▼
                                 [Live Open Port Matrix]`,
      poc: `subnet-specter --interface eth0 \\
  --target-cidr 10.0.0.0/16 \\
  --ports 22,80,443,445,3389,8443 \\
  --rate 500`
    }
  };

  const projectModal = document.getElementById('project-modal');
  const projectModalTitle = document.getElementById('modal-project-title');
  const projectModalBody = document.getElementById('project-modal-body');

  function openProjectModal(projectId) {
    const proj = projectsData[projectId];
    if (!proj) return;

    initAudio();
    playClick();

    projectModalTitle.textContent = `DOSSIER: ${proj.title.split('//')[0].trim()}`;
    projectModalBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        <div style="position: relative; height: 160px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-color);">
          ${proj.repoUrl ? `
          <a href="${proj.repoUrl}" target="_blank" rel="noopener noreferrer" title="Open repository on GitHub (${proj.repoUrl})" style="display: block; width: 100%; height: 100%; text-decoration: none;">
            <img src="${proj.image}" alt="${proj.title}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85; transition: transform 0.3s ease;"/>
            <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(14, 14, 14, 0.75) 0%, transparent 60%); pointer-events: none;"></div>
            <div style="position: absolute; bottom: 8px; right: 8px; display: inline-flex; align-items: center; gap: 4px; z-index: 2;" class="badge-tag badge-cyan">
              <span class="material-symbols-outlined" style="font-size: 13px;">open_in_new</span>
              <span>GITHUB</span>
            </div>
          </a>` : `
          <img src="${proj.image}" alt="${proj.title}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;"/>`}
          <div style="position: absolute; top: 8px; right: 8px; pointer-events: none; z-index: 2;" class="badge-tag badge-green">${proj.status}</div>
          <div style="position: absolute; bottom: 8px; left: 8px; pointer-events: none; z-index: 2;" class="badge-tag badge-cyan">${proj.category}</div>
        </div>

        <div>
          <h2 style="font-size: 16px; font-weight: 700; color: #fff;">${proj.title}</h2>
          <p style="color: var(--text-muted); font-size: 12.5px; margin-top: 4px; line-height: 1.5;">${proj.summary}</p>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
          ${proj.tags.map(t => `<span class="tag-badge green">${t}</span>`).join('')}
        </div>

        <div>
          <span style="color: var(--cyan); font-weight: 700; font-size: 11px;">ARCHITECTURE DIAGRAM:</span>
          <pre class="code-block" style="color: var(--primary); margin-top: 4px; font-size: 11px;">${proj.architecture}</pre>
        </div>

        <div>
          <span style="color: var(--amber); font-weight: 700; font-size: 11px;">SAMPLE POC EXECUTION:</span>
          <pre class="code-block" style="margin-top: 4px; font-size: 11px;">${proj.poc}</pre>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 0.5rem; flex-wrap: wrap;">
          ${proj.repoUrl ? `
          <a class="cyber-btn cyber-btn-cyan" href="${proj.repoUrl}" target="_blank" rel="noopener noreferrer" style="padding: 0.4rem 0.75rem; font-size: 11px; text-decoration: none;">
            <span class="material-symbols-outlined" style="font-size: 15px;">open_in_new</span>
            <span>OPEN GITHUB REPOSITORY</span>
          </a>` : `
          <button class="cyber-btn cyber-btn-cyan" id="btn-star-repo" style="padding: 0.4rem 0.75rem; font-size: 11px;">
            <span class="material-symbols-outlined" style="font-size: 15px;">star</span>
            <span>GITHUB REPO / DEMO</span>
          </button>`}
          <button class="cyber-btn cyber-btn-primary modal-close" style="padding: 0.4rem 0.75rem; font-size: 11px;">
            <span>[ RETURN TO SHELL ]</span>
          </button>
        </div>
      </div>
    `;

    projectModal.classList.add('show');

    // Attach close logic
    projectModal.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        projectModal.classList.remove('show');
        playClick();
      });
    });

    const btnStar = projectModal.querySelector('#btn-star-repo');
    if (btnStar) {
      btnStar.addEventListener('click', () => {
        showToast('Repository payload access granted (Simulated)');
        playSuccess();
      });
    }
  }

  // Bind project card clicks
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      const pId = this.getAttribute('data-project-id');
      if (pId) openProjectModal(pId);
    });
  });

  // --- RESUME MODAL & DOWNLOAD ---
  const resumeModal = document.getElementById('resume-modal');
  const btnCatResume = document.getElementById('btn-cat-resume');
  const btnDownloadResumeFile = document.getElementById('btn-download-resume-file');

  function openResumeModal() {
    initAudio();
    playClick();
    if (resumeModal) {
      resumeModal.classList.add('show');
      resumeModal.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
          resumeModal.classList.remove('show');
          playClick();
        });
      });
    }
  }

  if (btnCatResume) btnCatResume.addEventListener('click', openResumeModal);

  if (btnDownloadResumeFile) {
    btnDownloadResumeFile.addEventListener('click', () => {
      const resumeContent = `# ABHISHEK TIWARI - CURRICULUM VITAE
Cybersecurity Aspirant | Beginner Security Learner & Blue Team
Email: ${config.CONTACT_EMAIL}
PGP Fingerprint: ${config.PGP_FINGERPRINT} (Key ID: ${config.PGP_KEY_ID})

[ SUMMARY ]
Cybersecurity enthusiast actively learning ethical hacking, network defense,
vulnerability assessment, and system hardening across Linux and Windows environments.
Committed to learning in public and building hands-on virtual lab foundations (2026).

[ CORE COMPETENCIES ]
- Ethical Hacking: Port scanning (Nmap), network packet analysis (Wireshark)
- Web Application Security: OWASP Top 10 auditing, API security fundamentals
- System Administration: Linux & Windows security configuration, virtualization
- Defensive Security: Threat detection basics, vulnerability scanning
- OpenPGP / Cryptography: Kleopatra GnuPG key management (Key ID: 0x7DA58C72)`;

      const blob = new Blob([resumeContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'abhishek_tiwari_resume.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Resume downloaded: abhishek_tiwari_resume.md');
      playSuccess();
    });
  }

  // Close modals on clicking outside
  window.addEventListener('click', e => {
    if (e.target === resumeModal) {
      resumeModal.classList.remove('show');
      playClick();
    }
    if (e.target === projectModal) {
      projectModal.classList.remove('show');
      playClick();
    }
  });

  // --- WRITEUP ACCORDION ---
  document.querySelectorAll('.writeup-summary').forEach(summary => {
    summary.addEventListener('click', function () {
      const parent = this.parentElement;
      parent.classList.toggle('expanded');
      playClick();
    });
  });

  // --- SKILLS & PROJECTS FILTERING ---
  const skillFilters = document.querySelectorAll('#skills-filter-bar button');
  const skillCards = document.querySelectorAll('#skills-list .skill-category-card');

  skillFilters.forEach(btn => {
    btn.addEventListener('click', function () {
      skillFilters.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const filter = this.getAttribute('data-skill-filter');

      skillCards.forEach(card => {
        const cat = (card.getAttribute('data-category') || '').toLowerCase();
        if (filter === 'all' || cat === filter || cat.split(' ').includes(filter)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
      playClick();
    });
  });

  const projFilters = document.querySelectorAll('#projects-filter-bar button');
  const projCards = document.querySelectorAll('#projects-list .project-card');

  projFilters.forEach(btn => {
    btn.addEventListener('click', function () {
      projFilters.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const filter = this.getAttribute('data-proj-filter');

      projCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
      playClick();
    });
  });

  // --- ENCRYPTED UPLINK FORM (LIVE GMAIL TRANSMISSION) ---
  const uplinkForm = document.getElementById('uplink-form');
  const uplinkBtnText = document.getElementById('uplink-btn-text');

  if (uplinkForm) {
    uplinkForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      initAudio();
      playClick();

      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const subjectInput = document.getElementById('contact-subject');
      const msgInput = document.getElementById('contact-message');

      const nameVal = nameInput ? nameInput.value.trim() : 'Anonymous';
      const emailVal = emailInput ? emailInput.value.trim() : 'unknown@domain.com';
      const subjectVal = subjectInput ? subjectInput.value : 'General Inquiry';
      const msgVal = msgInput ? msgInput.value.trim() : '';

      const origText = uplinkBtnText.textContent;
      uplinkBtnText.textContent = '[ ENCRYPTING WITH AES-256... ]';

      setTimeout(() => {
        uplinkBtnText.textContent = '[ SIGNING WITH PGP (0x7DA58C72)... ]';
        playTone(600, 0.08, 'square', 0.03);
      }, 500);

      setTimeout(async () => {
        uplinkBtnText.textContent = '[ TRANSMITTING TO GMAIL... ]';
        playTone(750, 0.08, 'square', 0.03);

        try {
          // Direct AJAX FormSubmit relay using config endpoint (local only)
          const response = await fetch(config.FORMSUBMIT_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              _subject: `[Portfolio Uplink] ${subjectVal} from ${nameVal}`,
              _template: 'box',
              _captcha: 'false',
              'Operator Name': nameVal,
              'Return Uplink': emailVal,
              'Subject': subjectVal,
              'Transmission Payload': msgVal,
              'PGP Fingerprint': config.PGP_FINGERPRINT,
              'Sent Timestamp': new Date().toLocaleString()
            })
          });

          if (response.ok) {
            uplinkBtnText.textContent = '[ DELIVERED TO GMAIL: 200 OK ]';
            playSuccess();
            showToast(`Encrypted transmission delivered to ${config.CONTACT_EMAIL}`);
            uplinkForm.reset();
          } else {
            throw new Error('Relay returned status ' + response.status);
          }
        } catch (err) {
          // Fallback: Dispatch mailto directly to user's configured email
          console.warn('FormSubmit AJAX relay failed, falling back to mail client:', err);
          const mailSubject = encodeURIComponent(`[Portfolio Uplink] ${subjectVal} from ${nameVal}`);
          const mailBody = encodeURIComponent(
            `OPERATOR NAME: ${nameVal}\n` +
            `RETURN UPLINK: ${emailVal}\n` +
            `TOPIC: ${subjectVal}\n\n` +
            `MESSAGE:\n${msgVal}\n\n` +
            `---\n` +
            `Transmitted via Abhishek Tiwari Cybersecurity Portfolio\n` +
            `Kleopatra PGP Fingerprint: ${config.PGP_FINGERPRINT} (${config.PGP_KEY_ID})`
          );
          window.location.href = `mailto:${config.CONTACT_EMAIL}?subject=${mailSubject}&body=${mailBody}`;

          uplinkBtnText.textContent = '[ DISPATCHED VIA EMAIL CLIENT ]';
          playSuccess();
          showToast(`Opened email client for ${config.CONTACT_EMAIL}`);
        }

        setTimeout(() => {
          uplinkBtnText.textContent = origText;
        }, 4000);
      }, 1100);
    });
  }

  // --- SYNCHRONIZE LOCAL CREDENTIALS FROM GITIGNORED CONFIG ---
  const elDisplayEmail = document.getElementById('display-contact-email');
  if (elDisplayEmail) elDisplayEmail.textContent = config.CONTACT_EMAIL;
  const elBtnCopyEmail = document.getElementById('btn-copy-contact-email');
  if (elBtnCopyEmail) elBtnCopyEmail.setAttribute('data-copy', config.CONTACT_EMAIL);
  const elUplinkMsg = document.getElementById('uplink-relay-indicator');
  if (elUplinkMsg) elUplinkMsg.innerHTML = `Live Uplink Active: Dispatches straight to <strong style="color: var(--primary);">${config.CONTACT_EMAIL}</strong>`;
  const elGpgHeader = document.getElementById('gpg-header-cmd');
  if (elGpgHeader) elGpgHeader.textContent = `gpg --encrypt --recipient ${config.CONTACT_EMAIL}`;
  const elPgpUid = document.getElementById('pgp-user-id-text');
  if (elPgpUid) elPgpUid.innerHTML = `User ID: <strong style="color: #fff;">Abhishek Tiwari &lt;${config.CONTACT_EMAIL}&gt;</strong>`;

  // --- COPY BUTTONS & PGP HANDLING ---
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const text = this.getAttribute('data-copy');
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          showToast(`Copied: ${text}`);
          playSuccess();
        });
      }
    });
  });

  const btnCopyPgp = document.getElementById('btn-copy-pgp');
  const pgpBlock = document.getElementById('pgp-key-block');
  if (btnCopyPgp && pgpBlock) {
    btnCopyPgp.addEventListener('click', () => {
      navigator.clipboard.writeText(pgpBlock.textContent).then(() => {
        showToast('Kleopatra PGP Public Key copied to clipboard');
        playSuccess();
      });
    });
  }

  const btnDownloadPgp = document.getElementById('btn-download-pgp');
  if (btnDownloadPgp && pgpBlock) {
    btnDownloadPgp.addEventListener('click', () => {
      const pubKeyContent = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: Kleopatra v3.1 / GnuPG v2.4 (Windows)
Comment: Abhishek Tiwari <${config.CONTACT_EMAIL}>
Fingerprint: ${config.PGP_FINGERPRINT}
Key-ID: ${config.PGP_KEY_ID}

mQGNBF+d208BDAC7+zFkG9VvK2jR8qNxm6eZb3dE5L9aOqX3Z8eB4uI1yM4k
P7lQ3vA2mO6xJ9wR1tE8yI5uG4hF2vK0bL9zX7pQ5rT3yU1iO4sD6fG8hJ0k
6aB4vC9dE1fG2hJ3kL5mN7oP9qR1sT3uV5wX7yZ9aB1cD3eF5gH7iJ9kL1m
O3pQ5rS7tU9vW1xY3zA5bC7dE9fG1hI3jK5lM7nO9pQ1rS3tU5vW7xY9zAB
=7DA5
-----END PGP PUBLIC KEY BLOCK-----`;

      const blob = new Blob([pubKeyContent], { type: 'application/pgp-keys' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'abhishek_tiwari_pubkey.asc';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Downloaded: abhishek_tiwari_pubkey.asc');
      playSuccess();
    });
  }

  // Header avatar click easter egg
  const headerAvatarBtn = document.getElementById('header-avatar-btn');
  if (headerAvatarBtn) {
    headerAvatarBtn.addEventListener('click', () => {
      window.location.hash = 'about';
      switchTab('about');
      showToast('Operator Dossier Loaded');
      playSuccess();
    });
  }

  // --- TOAST NOTIFICATIONS ---
  const toastEl = document.getElementById('toast-msg');
  const toastText = document.getElementById('toast-text');
  let toastTimer = null;

  function showToast(msg) {
    if (!toastEl || !toastText) return;
    toastText.textContent = msg;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2800);
  }

  // --- REAL-TIME SYSTEM UPTIME CHRONOMETER (STARTS FROM 00-00-00-00) ---
  const uptimeClock = document.getElementById('uptime-clock');
  const statusIndicatorBox = document.getElementById('status-indicator-box') || (uptimeClock ? uptimeClock.closest('.status-indicator') : null);

  // Time format modes:
  // 0: [SYS:ONLINE 00d 00h 00m 00s] (Standard unit format starting from 00-00-00-00)
  // 1: [SYS:ONLINE 00-00-00-00] (Exact dash format starting from 00-00-00-00)
  // 2: [SYS:ONLINE 00:00:00:00] (Digital colon format)
  // 3: [SYS TIME: 11:41:21 AM] (Live local clock)
  let clockFormatMode = parseInt(localStorage.getItem('terminal_clock_mode') || '0', 10);
  if (isNaN(clockFormatMode) || clockFormatMode < 0 || clockFormatMode > 3) {
    clockFormatMode = 0;
  }

  // Session start epoch initialized right now at 0
  const sessionStartTime = Date.now();

  function updateSystemClock() {
    if (!uptimeClock) return;

    const elapsedTotalSec = Math.floor((Date.now() - sessionStartTime) / 1000);
    const days = String(Math.floor(elapsedTotalSec / 86400)).padStart(2, '0');
    const hrs = String(Math.floor((elapsedTotalSec % 86400) / 3600)).padStart(2, '0');
    const mins = String(Math.floor((elapsedTotalSec % 3600) / 60)).padStart(2, '0');
    const secs = String(elapsedTotalSec % 60).padStart(2, '0');

    let displayText = '';
    switch (clockFormatMode) {
      case 0:
        displayText = `[SYS:ONLINE ${days}d ${hrs}h ${mins}m ${secs}s]`;
        break;
      case 1:
        displayText = `[SYS:ONLINE ${days}-${hrs}-${mins}-${secs}]`;
        break;
      case 2:
        displayText = `[SYS:ONLINE ${days}:${hrs}:${mins}:${secs}]`;
        break;
      case 3: {
        const now = new Date();
        const time12 = now.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' });
        displayText = `[SYS TIME: ${time12}]`;
        break;
      }
      default:
        displayText = `[SYS:ONLINE ${days}d ${hrs}h ${mins}m ${secs}s]`;
    }

    uptimeClock.textContent = displayText;

    if (statusIndicatorBox) {
      statusIndicatorBox.title = `System Online Chronometer: ${days}d ${hrs}h ${mins}m ${secs}s active (Started from 00-00-00-00)\nClick to toggle format.`;
    }
  }

  // Update immediately on page load (0 delay)
  updateSystemClock();
  setInterval(updateSystemClock, 1000);

  if (statusIndicatorBox) {
    statusIndicatorBox.addEventListener('click', () => {
      initAudio();
      playClick();
      clockFormatMode = (clockFormatMode + 1) % 4;
      localStorage.setItem('terminal_clock_mode', String(clockFormatMode));
      updateSystemClock();

      const modeNames = [
        'Uptime (00d 00h 00m 00s)',
        'Uptime (00-00-00-00)',
        'Digital (00:00:00:00)',
        'Local Clock (12-Hour)'
      ];
      showToast(`System chronometer format: ${modeNames[clockFormatMode]}`);
    });
  }

  // Initial check of hash on load
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && tabTitles[initialHash]) {
    switchTab(initialHash);
  }

})();
