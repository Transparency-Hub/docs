const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const WIDTH = 1200;
const HEIGHT = 780;

// Common elements
const browserChrome = (title) => `
  <!-- Browser chrome -->
  <rect width="${WIDTH}" height="${HEIGHT}" rx="12" fill="#1a1a2e" />
  <rect x="0" y="0" width="${WIDTH}" height="44" rx="12" fill="#2d2d44"/>
  <rect x="0" y="32" width="${WIDTH}" height="12" fill="#2d2d44"/>
  <!-- Window controls -->
  <circle cx="24" cy="22" r="6" fill="#ff5f57"/>
  <circle cx="44" cy="22" r="6" fill="#febc2e"/>
  <circle cx="64" cy="22" r="6" fill="#28c840"/>
  <!-- URL bar -->
  <rect x="90" y="10" width="400" height="24" rx="4" fill="#1a1a2e"/>
  <text x="104" y="27" font-family="monospace" font-size="12" fill="#8888aa">app.transparencyhubnetwork.ai${title ? '/' + title : ''}</text>
  <!-- Content area -->
  <rect x="0" y="44" width="${WIDTH}" height="${HEIGHT - 44}" fill="#f5f7fa"/>
`;

const sidebar = `
  <!-- Sidebar -->
  <rect x="0" y="44" width="240" height="${HEIGHT - 44}" fill="#006699"/>
  <!-- Logo area -->
  <rect x="20" y="60" width="200" height="40" rx="4" fill="rgba(255,255,255,0.1)"/>
  <text x="40" y="86" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white">Transparency Hub</text>
  <!-- Nav items -->
  <rect x="12" y="120" width="216" height="38" rx="6" fill="rgba(255,255,255,0.08)"/>
  <text x="48" y="144" font-family="Arial, sans-serif" font-size="13" fill="rgba(255,255,255,0.7)">📊  Dashboard</text>
  <text x="48" y="182" font-family="Arial, sans-serif" font-size="13" fill="rgba(255,255,255,0.5)">👥  Members</text>
  <text x="48" y="218" font-family="Arial, sans-serif" font-size="13" fill="rgba(255,255,255,0.5)">📅  Events</text>
  <text x="48" y="254" font-family="Arial, sans-serif" font-size="13" fill="rgba(255,255,255,0.5)">💰  Dues & Payments</text>
  <text x="48" y="290" font-family="Arial, sans-serif" font-size="13" fill="rgba(255,255,255,0.5)">📝  Meeting Minutes</text>
  <text x="48" y="326" font-family="Arial, sans-serif" font-size="13" fill="rgba(255,255,255,0.5)">⚙️  Settings</text>
`;

const sidebarActive = (active) => {
  const items = {
    'Dashboard': 120,
    'Members': 158,
    'Events': 194,
    'Dues': 230,
    'Minutes': 266,
    'Settings': 302,
  };
  const y = items[active] || 120;
  return `
  <!-- Sidebar -->
  <rect x="0" y="44" width="240" height="${HEIGHT - 44}" fill="#006699"/>
  <rect x="20" y="60" width="200" height="40" rx="4" fill="rgba(255,255,255,0.1)"/>
  <text x="40" y="86" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white">Transparency Hub</text>
  ${active === 'Dashboard' ? `<rect x="12" y="${y}" width="216" height="38" rx="6" fill="rgba(255,255,255,0.15)"/>` : ''}
  ${active === 'Members' ? `<rect x="12" y="${y}" width="216" height="38" rx="6" fill="rgba(255,255,255,0.15)"/>` : ''}
  ${active === 'Events' ? `<rect x="12" y="${y}" width="216" height="38" rx="6" fill="rgba(255,255,255,0.15)"/>` : ''}
  ${active === 'Dues' ? `<rect x="12" y="${y}" width="216" height="38" rx="6" fill="rgba(255,255,255,0.15)"/>` : ''}
  ${active === 'Minutes' ? `<rect x="12" y="${y}" width="216" height="38" rx="6" fill="rgba(255,255,255,0.15)"/>` : ''}
  ${active === 'Settings' ? `<rect x="12" y="${y}" width="216" height="38" rx="6" fill="rgba(255,255,255,0.15)"/>` : ''}
  <text x="48" y="144" font-family="Arial, sans-serif" font-size="13" fill="${active === 'Dashboard' ? 'white' : 'rgba(255,255,255,0.5)'}">📊  Dashboard</text>
  <text x="48" y="182" font-family="Arial, sans-serif" font-size="13" fill="${active === 'Members' ? 'white' : 'rgba(255,255,255,0.5)'}">👥  Members</text>
  <text x="48" y="218" font-family="Arial, sans-serif" font-size="13" fill="${active === 'Events' ? 'white' : 'rgba(255,255,255,0.5)'}">📅  Events</text>
  <text x="48" y="254" font-family="Arial, sans-serif" font-size="13" fill="${active === 'Dues' ? 'white' : 'rgba(255,255,255,0.5)'}">💰  Dues &amp; Payments</text>
  <text x="48" y="290" font-family="Arial, sans-serif" font-size="13" fill="${active === 'Minutes' ? 'white' : 'rgba(255,255,255,0.5)'}">📝  Meeting Minutes</text>
  <text x="48" y="326" font-family="Arial, sans-serif" font-size="13" fill="${active === 'Settings' ? 'white' : 'rgba(255,255,255,0.5)'}">⚙️  Settings</text>
  `;
};

const badge = (x, y, text, color) => `
  <rect x="${x}" y="${y}" width="${text.length * 8 + 16}" height="24" rx="12" fill="${color}" opacity="0.15"/>
  <text x="${x + text.length * 4 + 8}" y="${y + 16}" font-family="Arial, sans-serif" font-size="11" fill="${color}" text-anchor="middle">${text}</text>
`;

// ============ IMAGE 1: Meeting Provider Settings ============
function image1_providers() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
    ${browserChrome('settings')}
    ${sidebarActive('Settings')}
    
    <!-- Content -->
    <text x="280" y="90" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1a1a2e">Meeting Integrations</text>
    <text x="280" y="115" font-family="Arial, sans-serif" font-size="14" fill="#666">Connect your meeting providers to enable automatic recording and AI-powered minutes</text>
    
    <!-- Google Meet Card -->
    <rect x="280" y="145" width="270" height="280" rx="12" fill="white" stroke="#e0e0e0" stroke-width="1"/>
    <!-- Google icon -->
    <rect x="310" y="170" width="48" height="48" rx="8" fill="#4285f4" opacity="0.1"/>
    <text x="322" y="202" font-family="Arial, sans-serif" font-size="24">🎥</text>
    <text x="370" y="192" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#1a1a2e">Google Meet</text>
    <text x="370" y="210" font-family="Arial, sans-serif" font-size="12" fill="#28a745">● Connected</text>
    <line x1="300" y1="230" x2="530" y2="230" stroke="#f0f0f0" stroke-width="1"/>
    <text x="310" y="255" font-family="Arial, sans-serif" font-size="12" fill="#666">User ID</text>
    <text x="310" y="275" font-family="Arial, sans-serif" font-size="13" fill="#333">user@association.org</text>
    <text x="310" y="305" font-family="Arial, sans-serif" font-size="12" fill="#666">Status</text>
    ${badge(310, 315, 'Active', '#28a745')}
    <text x="310" y="360" font-family="Arial, sans-serif" font-size="12" fill="#666">Connected on</text>
    <text x="310" y="380" font-family="Arial, sans-serif" font-size="13" fill="#333">Mar 1, 2026</text>
    <rect x="310" y="395" width="100" height="32" rx="6" fill="#dc3545" opacity="0.1"/>
    <text x="330" y="416" font-family="Arial, sans-serif" font-size="12" fill="#dc3545">Disconnect</text>
    
    <!-- Zoom Card -->
    <rect x="570" y="145" width="270" height="280" rx="12" fill="white" stroke="#e0e0e0" stroke-width="1"/>
    <rect x="600" y="170" width="48" height="48" rx="8" fill="#2d8cff" opacity="0.1"/>
    <text x="612" y="202" font-family="Arial, sans-serif" font-size="24">📹</text>
    <text x="660" y="192" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#1a1a2e">Zoom</text>
    <text x="660" y="210" font-family="Arial, sans-serif" font-size="12" fill="#28a745">● Connected</text>
    <line x1="590" y1="230" x2="820" y2="230" stroke="#f0f0f0" stroke-width="1"/>
    <text x="600" y="255" font-family="Arial, sans-serif" font-size="12" fill="#666">User ID</text>
    <text x="600" y="275" font-family="Arial, sans-serif" font-size="13" fill="#333">admin@association.org</text>
    <text x="600" y="305" font-family="Arial, sans-serif" font-size="12" fill="#666">Status</text>
    ${badge(600, 315, 'Active', '#28a745')}
    <text x="600" y="360" font-family="Arial, sans-serif" font-size="12" fill="#666">Connected on</text>
    <text x="600" y="380" font-family="Arial, sans-serif" font-size="13" fill="#333">Mar 3, 2026</text>
    <rect x="600" y="395" width="100" height="32" rx="6" fill="#dc3545" opacity="0.1"/>
    <text x="620" y="416" font-family="Arial, sans-serif" font-size="12" fill="#dc3545">Disconnect</text>
    
    <!-- Teams Card -->
    <rect x="860" y="145" width="270" height="280" rx="12" fill="white" stroke="#e0e0e0" stroke-width="1"/>
    <rect x="890" y="170" width="48" height="48" rx="8" fill="#6264a7" opacity="0.1"/>
    <text x="902" y="202" font-family="Arial, sans-serif" font-size="24">💬</text>
    <text x="950" y="192" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#1a1a2e">Microsoft Teams</text>
    <text x="950" y="210" font-family="Arial, sans-serif" font-size="12" fill="#999">● Not Connected</text>
    <line x1="880" y1="230" x2="1110" y2="230" stroke="#f0f0f0" stroke-width="1"/>
    <text x="890" y="275" font-family="Arial, sans-serif" font-size="13" fill="#666" text-anchor="start">Connect your Microsoft Teams</text>
    <text x="890" y="295" font-family="Arial, sans-serif" font-size="13" fill="#666" text-anchor="start">account to enable recording</text>
    <text x="890" y="315" font-family="Arial, sans-serif" font-size="13" fill="#666" text-anchor="start">for Teams meetings.</text>
    <rect x="890" y="345" width="110" height="36" rx="8" fill="#006699"/>
    <text x="918" y="368" font-family="Arial, sans-serif" font-size="13" fill="white">Connect</text>
    
    <!-- Bottom label -->
    <rect x="280" y="460" width="880" height="52" rx="10" fill="#006699" opacity="0.06"/>
    <text x="300" y="492" font-family="Arial, sans-serif" font-size="14" fill="#006699">🔒  Your credentials are securely managed. OAuth tokens are never stored in our database.</text>
    
    <!-- Feature label overlay -->
    <rect x="280" y="700" width="280" height="44" rx="22" fill="#006699"/>
    <text x="310" y="728" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white">Multi-Provider Integration</text>
  </svg>`;
}

// ============ IMAGE 2: Event Creation with Recording ============
function image2_event() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
    ${browserChrome('events')}
    ${sidebarActive('Events')}
    
    <!-- Dimmed background content -->
    <rect x="240" y="44" width="${WIDTH - 240}" height="${HEIGHT - 44}" fill="#f5f7fa"/>
    <text x="280" y="90" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1a1a2e" opacity="0.3">Events</text>
    
    <!-- Modal overlay -->
    <rect x="240" y="44" width="${WIDTH - 240}" height="${HEIGHT - 44}" fill="black" opacity="0.4"/>
    
    <!-- Modal -->
    <rect x="320" y="70" width="680" height="660" rx="16" fill="white"/>
    <text x="360" y="115" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#1a1a2e">Create Event</text>
    
    <!-- Close button -->
    <text x="960" y="105" font-family="Arial, sans-serif" font-size="24" fill="#999">✕</text>
    
    <!-- Form fields -->
    <text x="360" y="155" font-family="Arial, sans-serif" font-size="13" fill="#555">Event Title *</text>
    <rect x="360" y="162" width="600" height="40" rx="6" fill="#f8f9fa" stroke="#ddd" stroke-width="1"/>
    <text x="375" y="188" font-family="Arial, sans-serif" font-size="14" fill="#333">Q1 2026 Board Meeting</text>
    
    <text x="360" y="225" font-family="Arial, sans-serif" font-size="13" fill="#555">Description</text>
    <rect x="360" y="232" width="600" height="60" rx="6" fill="#f8f9fa" stroke="#ddd" stroke-width="1"/>
    <text x="375" y="258" font-family="Arial, sans-serif" font-size="13" fill="#333">Quarterly review of association activities,</text>
    <text x="375" y="276" font-family="Arial, sans-serif" font-size="13" fill="#333">financial reports, and upcoming initiatives.</text>
    
    <!-- Date and Time row -->
    <text x="360" y="320" font-family="Arial, sans-serif" font-size="13" fill="#555">Start Date &amp; Time *</text>
    <rect x="360" y="327" width="200" height="40" rx="6" fill="#f8f9fa" stroke="#ddd" stroke-width="1"/>
    <text x="375" y="353" font-family="Arial, sans-serif" font-size="14" fill="#333">Mar 15, 2026</text>
    <rect x="570" y="327" width="130" height="40" rx="6" fill="#f8f9fa" stroke="#ddd" stroke-width="1"/>
    <text x="585" y="353" font-family="Arial, sans-serif" font-size="14" fill="#333">10:00 AM</text>
    
    <!-- Timezone -->
    <text x="720" y="320" font-family="Arial, sans-serif" font-size="13" fill="#555">Timezone</text>
    <rect x="720" y="327" width="240" height="40" rx="6" fill="#f8f9fa" stroke="#ddd" stroke-width="1"/>
    <text x="735" y="353" font-family="Arial, sans-serif" font-size="14" fill="#333">🌍  Africa/Lagos (GMT+1)</text>
    
    <!-- Meeting Link -->
    <text x="360" y="395" font-family="Arial, sans-serif" font-size="13" fill="#555">Meeting Link</text>
    <rect x="360" y="402" width="600" height="40" rx="6" fill="#f8f9fa" stroke="#ddd" stroke-width="1"/>
    <text x="375" y="428" font-family="Arial, sans-serif" font-size="13" fill="#2d8cff">https://us06web.zoom.us/j/84312567890</text>
    
    <!-- Recording toggle - highlighted -->
    <rect x="345" y="460" width="630" height="70" rx="10" fill="#006699" opacity="0.06" stroke="#006699" stroke-width="2"/>
    <text x="375" y="490" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#1a1a2e">🤖 Enable AI Notetaker</text>
    <text x="375" y="512" font-family="Arial, sans-serif" font-size="12" fill="#666">Transparencyhub Notetaker will join, record, transcribe, and generate AI minutes</text>
    <!-- Toggle switch ON -->
    <rect x="910" y="480" width="48" height="26" rx="13" fill="#006699"/>
    <circle cx="934" cy="493" r="10" fill="white"/>
    
    <!-- Chapter -->
    <text x="360" y="560" font-family="Arial, sans-serif" font-size="13" fill="#555">Chapter</text>
    <rect x="360" y="567" width="290" height="40" rx="6" fill="#f8f9fa" stroke="#ddd" stroke-width="1"/>
    <text x="375" y="593" font-family="Arial, sans-serif" font-size="14" fill="#333">Lagos Chapter</text>
    
    <text x="670" y="560" font-family="Arial, sans-serif" font-size="13" fill="#555">Event Type</text>
    <rect x="670" y="567" width="290" height="40" rx="6" fill="#f8f9fa" stroke="#ddd" stroke-width="1"/>
    <text x="685" y="593" font-family="Arial, sans-serif" font-size="14" fill="#333">Board Meeting</text>
    
    <!-- Submit button -->
    <rect x="360" y="630" width="600" height="46" rx="8" fill="#006699"/>
    <text x="610" y="659" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">Create Event</text>
    
    <!-- Feature label -->
    <rect x="320" y="700" width="350" height="44" rx="22" fill="#006699"/>
    <text x="350" y="728" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white">Schedule Recording with One Toggle</text>
  </svg>`;
}

// ============ IMAGE 3: AI Meeting Minutes ============
function image3_minutes() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
    ${browserChrome('meeting-minutes')}
    ${sidebarActive('Minutes')}
    
    <text x="280" y="90" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1a1a2e">Meeting Minutes</text>
    <text x="280" y="115" font-family="Arial, sans-serif" font-size="14" fill="#666">AI-generated minutes from your recorded meetings</text>
    
    <!-- Minutes card -->
    <rect x="280" y="135" width="860" height="580" rx="12" fill="white" stroke="#e0e0e0" stroke-width="1"/>
    
    <!-- Header -->
    <rect x="280" y="135" width="860" height="70" rx="12" fill="#fafbfc"/>
    <rect x="280" y="193" width="860" height="12" fill="#fafbfc"/>
    <text x="310" y="168" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1a1a2e">Q1 2026 Board Meeting</text>
    <text x="310" y="192" font-family="Arial, sans-serif" font-size="12" fill="#888">Mar 15, 2026 • 10:00 AM WAT • Zoom • Lagos Chapter</text>
    
    ${badge(820, 152, 'AI Generated', '#006699')}
    
    <!-- Edit button -->
    <rect x="1020" y="150" width="80" height="32" rx="6" fill="#006699"/>
    <text x="1043" y="171" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">✏️ Edit</text>
    
    <!-- Minutes content -->
    <text x="310" y="240" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#006699">Meeting Summary</text>
    <text x="310" y="265" font-family="Arial, sans-serif" font-size="13" fill="#444">The Q1 2026 Board Meeting covered financial reports, membership growth,</text>
    <text x="310" y="285" font-family="Arial, sans-serif" font-size="13" fill="#444">and upcoming community initiatives. Key decisions were made regarding</text>
    <text x="310" y="305" font-family="Arial, sans-serif" font-size="13" fill="#444">the annual conference and chapter expansion plans.</text>
    
    <text x="310" y="340" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#006699">Key Discussion Points</text>
    <text x="330" y="365" font-family="Arial, sans-serif" font-size="13" fill="#444">1. Financial Report — Revenue up 23% QoQ, dues collection at 87%</text>
    <text x="330" y="388" font-family="Arial, sans-serif" font-size="13" fill="#444">2. Membership Growth — 142 new members in Q1 (18% increase)</text>
    <text x="330" y="411" font-family="Arial, sans-serif" font-size="13" fill="#444">3. Annual Conference — Approved budget of ₦5.2M for Sept 2026</text>
    <text x="330" y="434" font-family="Arial, sans-serif" font-size="13" fill="#444">4. Chapter Expansion — Two new chapters approved (Abuja, Port Harcourt)</text>
    
    <text x="310" y="470" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#006699">Action Items</text>
    <rect x="310" y="482" width="800" height="36" rx="4" fill="#f0faf0"/>
    <text x="330" y="505" font-family="Arial, sans-serif" font-size="13" fill="#28a745">☐  Finance team to prepare detailed Q1 report by March 25</text>
    <rect x="310" y="524" width="800" height="36" rx="4" fill="#f0faf0"/>
    <text x="330" y="547" font-family="Arial, sans-serif" font-size="13" fill="#28a745">☐  Events committee to finalize conference venue by April 15</text>
    <rect x="310" y="566" width="800" height="36" rx="4" fill="#f0faf0"/>
    <text x="330" y="589" font-family="Arial, sans-serif" font-size="13" fill="#28a745">☐  Secretary to draft chapter establishment letters</text>
    
    <text x="310" y="630" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#006699">Decisions Made</text>
    <text x="330" y="655" font-family="Arial, sans-serif" font-size="13" fill="#444">• Annual conference budget approved unanimously</text>
    <text x="330" y="678" font-family="Arial, sans-serif" font-size="13" fill="#444">• Membership dues to remain unchanged for 2026</text>
    
    <!-- Feature label -->
    <rect x="280" y="700" width="330" height="44" rx="22" fill="#006699"/>
    <text x="310" y="728" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white">AI-Generated Meeting Minutes</text>
  </svg>`;
}

// ============ IMAGE 4: Dashboard ============
function image4_dashboard() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
    ${browserChrome('dashboard')}
    ${sidebarActive('Dashboard')}
    
    <text x="280" y="90" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1a1a2e">Dashboard</text>
    
    <!-- Stats cards row -->
    <!-- Card 1 -->
    <rect x="280" y="110" width="200" height="100" rx="12" fill="white" stroke="#e0e0e0" stroke-width="1"/>
    <text x="300" y="142" font-family="Arial, sans-serif" font-size="12" fill="#888">Total Members</text>
    <text x="300" y="178" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#006699">1,247</text>
    <text x="410" y="178" font-family="Arial, sans-serif" font-size="12" fill="#28a745">↑ 18%</text>
    
    <!-- Card 2 -->
    <rect x="500" y="110" width="200" height="100" rx="12" fill="white" stroke="#e0e0e0" stroke-width="1"/>
    <text x="520" y="142" font-family="Arial, sans-serif" font-size="12" fill="#888">Active Chapters</text>
    <text x="520" y="178" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#990066">12</text>
    <text x="570" y="178" font-family="Arial, sans-serif" font-size="12" fill="#28a745">↑ 2 new</text>
    
    <!-- Card 3 -->
    <rect x="720" y="110" width="200" height="100" rx="12" fill="white" stroke="#e0e0e0" stroke-width="1"/>
    <text x="740" y="142" font-family="Arial, sans-serif" font-size="12" fill="#888">Dues Collected</text>
    <text x="740" y="178" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#006699">₦4.2M</text>
    <text x="860" y="178" font-family="Arial, sans-serif" font-size="12" fill="#28a745">87%</text>
    
    <!-- Card 4 -->
    <rect x="940" y="110" width="200" height="100" rx="12" fill="white" stroke="#e0e0e0" stroke-width="1"/>
    <text x="960" y="142" font-family="Arial, sans-serif" font-size="12" fill="#888">Meetings Recorded</text>
    <text x="960" y="178" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#990066">34</text>
    <text x="1010" y="178" font-family="Arial, sans-serif" font-size="12" fill="#28a745">↑ 12 this month</text>
    
    <!-- Upcoming Events -->
    <rect x="280" y="230" width="440" height="340" rx="12" fill="white" stroke="#e0e0e0" stroke-width="1"/>
    <text x="310" y="265" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#1a1a2e">Upcoming Events</text>
    
    <!-- Event items -->
    <rect x="300" y="285" width="400" height="60" rx="8" fill="#f8f9fa"/>
    <text x="320" y="310" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#333">Q1 Board Meeting</text>
    <text x="320" y="330" font-family="Arial, sans-serif" font-size="11" fill="#888">Mar 15, 10:00 AM • Zoom</text>
    ${badge(580, 297, '🤖 Recording', '#006699')}
    
    <rect x="300" y="355" width="400" height="60" rx="8" fill="#f8f9fa"/>
    <text x="320" y="380" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#333">New Member Orientation</text>
    <text x="320" y="400" font-family="Arial, sans-serif" font-size="11" fill="#888">Mar 20, 2:00 PM • Google Meet</text>
    ${badge(580, 367, '🤖 Recording', '#006699')}
    
    <rect x="300" y="425" width="400" height="60" rx="8" fill="#f8f9fa"/>
    <text x="320" y="450" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#333">Finance Committee</text>
    <text x="320" y="470" font-family="Arial, sans-serif" font-size="11" fill="#888">Mar 25, 11:00 AM • Teams</text>
    
    <rect x="300" y="495" width="400" height="60" rx="8" fill="#f8f9fa"/>
    <text x="320" y="520" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#333">Annual Planning Session</text>
    <text x="320" y="540" font-family="Arial, sans-serif" font-size="11" fill="#888">Apr 2, 9:00 AM • Zoom</text>
    ${badge(580, 507, '🤖 Recording', '#006699')}
    
    <!-- Recent Minutes -->
    <rect x="740" y="230" width="400" height="340" rx="12" fill="white" stroke="#e0e0e0" stroke-width="1"/>
    <text x="770" y="265" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#1a1a2e">Recent Meeting Minutes</text>
    
    <rect x="760" y="285" width="360" height="68" rx="8" fill="#f8f9fa"/>
    <text x="780" y="310" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#333">Q4 Board Meeting</text>
    <text x="780" y="330" font-family="Arial, sans-serif" font-size="11" fill="#888">Dec 15, 2025 • 45 min • Zoom</text>
    ${badge(1010, 297, 'AI Generated', '#006699')}
    
    <rect x="760" y="363" width="360" height="68" rx="8" fill="#f8f9fa"/>
    <text x="780" y="388" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#333">Year-End Review</text>
    <text x="780" y="408" font-family="Arial, sans-serif" font-size="11" fill="#888">Dec 20, 2025 • 62 min • Meet</text>
    ${badge(1010, 375, 'AI Generated', '#006699')}
    
    <rect x="760" y="441" width="360" height="68" rx="8" fill="#f8f9fa"/>
    <text x="780" y="466" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#333">Budget Planning</text>
    <text x="780" y="486" font-family="Arial, sans-serif" font-size="11" fill="#888">Jan 10, 2026 • 38 min • Teams</text>
    ${badge(1010, 453, 'AI Generated', '#006699')}
    
    <!-- Member chart area -->
    <rect x="280" y="590" width="860" height="140" rx="12" fill="white" stroke="#e0e0e0" stroke-width="1"/>
    <text x="310" y="625" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#1a1a2e">Membership Growth</text>
    <!-- Simple bar chart -->
    <g transform="translate(310, 640)">
      ${['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((m, i) => `
        <rect x="${i * 130 + 20}" y="${70 - [40, 45, 48, 52, 58, 65][i]}" width="80" height="${[40, 45, 48, 52, 58, 65][i]}" rx="4" fill="#006699" opacity="${0.4 + i * 0.1}"/>
        <text x="${i * 130 + 60}" y="82" font-family="Arial, sans-serif" font-size="11" fill="#888" text-anchor="middle">${m}</text>
      `).join('')}
    </g>
    
    <!-- Feature label -->
    <rect x="280" y="700" width="380" height="44" rx="22" fill="#006699"/>
    <text x="310" y="728" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white">Complete Association Dashboard</text>
  </svg>`;
}

// ============ IMAGE 5: Dues & Financial Transparency ============
function image5_dues() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
    ${browserChrome('dues')}
    ${sidebarActive('Dues')}
    
    <text x="280" y="90" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1a1a2e">Dues &amp; Payments</text>
    <text x="280" y="115" font-family="Arial, sans-serif" font-size="14" fill="#666">Track membership dues, payments, and financial transparency</text>
    
    <!-- Summary cards -->
    <rect x="280" y="135" width="280" height="90" rx="12" fill="white" stroke="#e0e0e0" stroke-width="1"/>
    <text x="300" y="165" font-family="Arial, sans-serif" font-size="12" fill="#888">Total Collected (Q1)</text>
    <text x="300" y="200" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#28a745">₦4,230,000</text>
    
    <rect x="580" y="135" width="280" height="90" rx="12" fill="white" stroke="#e0e0e0" stroke-width="1"/>
    <text x="600" y="165" font-family="Arial, sans-serif" font-size="12" fill="#888">Outstanding</text>
    <text x="600" y="200" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#dc3545">₦630,000</text>
    
    <rect x="880" y="135" width="260" height="90" rx="12" fill="white" stroke="#e0e0e0" stroke-width="1"/>
    <text x="900" y="165" font-family="Arial, sans-serif" font-size="12" fill="#888">Collection Rate</text>
    <text x="900" y="200" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#006699">87.0%</text>
    
    <!-- Transaction table -->
    <rect x="280" y="245" width="860" height="480" rx="12" fill="white" stroke="#e0e0e0" stroke-width="1"/>
    <text x="310" y="280" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#1a1a2e">Recent Transactions</text>
    
    <!-- Table header -->
    <rect x="280" y="295" width="860" height="36" fill="#f8f9fa"/>
    <text x="310" y="318" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#555">Member</text>
    <text x="530" y="318" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#555">Type</text>
    <text x="700" y="318" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#555">Amount</text>
    <text x="850" y="318" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#555">Date</text>
    <text x="1000" y="318" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#555">Status</text>
    
    <!-- Table rows -->
    ${[
      ['Adebayo Johnson', 'Annual Dues', '₦50,000', 'Mar 5, 2026', 'Paid', '#28a745'],
      ['Fatima Ahmed', 'Annual Dues', '₦50,000', 'Mar 4, 2026', 'Paid', '#28a745'],
      ['Chidi Okonkwo', 'Monthly Dues', '₦5,000', 'Mar 3, 2026', 'Paid', '#28a745'],
      ['Ngozi Eze', 'Annual Dues', '₦50,000', 'Mar 2, 2026', 'Pending', '#f0ad4e'],
      ['Emeka Nwosu', 'Event Fee', '₦10,000', 'Mar 1, 2026', 'Paid', '#28a745'],
      ['Amina Bello', 'Annual Dues', '₦50,000', 'Feb 28, 2026', 'Paid', '#28a745'],
      ['David Osei', 'Monthly Dues', '₦5,000', 'Feb 27, 2026', 'Overdue', '#dc3545'],
      ['Grace Mensah', 'Annual Dues', '₦50,000', 'Feb 26, 2026', 'Paid', '#28a745'],
    ].map(([name, type, amount, date, status, color], i) => `
      <line x1="300" y1="${335 + i * 45}" x2="1120" y2="${335 + i * 45}" stroke="#f0f0f0" stroke-width="1"/>
      <text x="310" y="${360 + i * 45}" font-family="Arial, sans-serif" font-size="13" fill="#333">${name}</text>
      <text x="530" y="${360 + i * 45}" font-family="Arial, sans-serif" font-size="13" fill="#666">${type}</text>
      <text x="700" y="${360 + i * 45}" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#333">${amount}</text>
      <text x="850" y="${360 + i * 45}" font-family="Arial, sans-serif" font-size="13" fill="#888">${date}</text>
      ${badge(990, 345 + i * 45, status, color)}
    `).join('')}
    
    <!-- Feature label -->
    <rect x="280" y="700" width="300" height="44" rx="22" fill="#006699"/>
    <text x="310" y="728" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white">Financial Transparency</text>
  </svg>`;
}

async function generateAll() {
  const images = [
    { fn: image1_providers, name: 'gallery-1-meeting-providers.png' },
    { fn: image2_event, name: 'gallery-2-schedule-recording.png' },
    { fn: image3_minutes, name: 'gallery-3-ai-minutes.png' },
    { fn: image4_dashboard, name: 'gallery-4-dashboard.png' },
    { fn: image5_dues, name: 'gallery-5-dues-payments.png' },
  ];
  
  for (const { fn, name } of images) {
    const svg = fn();
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(__dirname, name));
    
    // Also copy to media for sending
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.resolve(`C:\\Users\\VERGIO\\.openclaw\\media\\${name}`));
    
    const stats = fs.statSync(path.join(__dirname, name));
    console.log(`✅ ${name} — ${Math.round(stats.size / 1024)}KB`);
  }
  
  console.log('\nAll gallery images generated!');
}

generateAll().catch(console.error);
