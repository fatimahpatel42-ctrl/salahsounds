import { h, render, Component } from './vendor/preact.module.js';
import htm from './vendor/htm.module.js';
const html = htm.bind(h);

class DCLogic extends Component {
  render() {
    const v = this.renderVals() || {};
    return view(v);
  }
}


class Site extends DCLogic {
  constructor(props) {
    super(props);
    var saved = null;
    try { saved = window.localStorage.getItem('ss-theme'); } catch (e) {}
    var prefersDark = false;
    try { prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) {}
    this.state = { mode: 'after', space: 'masjid', cap: 250, open: 0, dark: saved ? saved === 'dark' : prefersDark };
  }
  renderVals() {
    var themes = {
      'Indigo & White': { bg: '#F6F7FB', bg2: '#ECEEF7', surface: '#FFFFFF', line: '#DCE0EE', ink: '#141B2D', muted: '#525C72', accent: '#5A55D6', accentText: '#4A45C4', accentInk: '#FFFFFF', grad: 'linear-gradient(180deg, #4F7FE0, #7A4FC0)' },
      'Lavender Mist': { bg: '#F5F3FC', bg2: '#ECE8F8', surface: '#FFFFFF', line: '#DDD6F0', ink: '#1A1530', muted: '#5A5470', accent: '#6E4BC4', accentText: '#5B3AAE', accentInk: '#FFFFFF', grad: 'linear-gradient(180deg, #5C7BE0, #7A4FC0)' },
      'Night': { bg: '#0B0F1E', bg2: '#10152A', surface: '#161C33', line: '#283152', ink: '#EEF1F8', muted: '#A7AFC6', accent: '#6C66E8', accentText: '#A9B4FF', accentInk: '#FFFFFF', grad: 'linear-gradient(180deg, #5B8BEA, #8A5FD0)' },
      'Cool Slate': { bg: '#F4F6F8', bg2: '#E8ECF0', surface: '#FFFFFF', line: '#D6DCE3', ink: '#1E2B38', muted: '#4F5D6B', accent: '#3E5468', accentText: '#3E5468', accentInk: '#FFFFFF', grad: 'linear-gradient(180deg, #4F7FE0, #7A4FC0)' }
    };
    var dark = !!this.state.dark;
    var t = dark ? themes['Night'] : (themes[this.props.theme] || themes['Indigo & White']);
    try { document.documentElement.style.colorScheme = dark ? 'dark' : 'light'; document.body.style.background = t.bg; } catch (e) {}
    var fam = this.props.font || 'Plus Jakarta Sans';
    var fontD = "'" + fam + "', system-ui, sans-serif";
    var fontB = "'" + fam + "', system-ui, sans-serif";
    var self = this;
    var s = this.state;

    // Before / after console (real York Mosque recordings)
    var after = s.mode === 'after';
    var playing = !!s.playing;
    var getEl = function (m) { return document.getElementById(m === 'after' ? 'ss-after' : 'ss-before'); };
    var stopAll = function () { ['before', 'after'].forEach(function (m) { var el = getEl(m); if (el) { el.pause(); } }); };
    var playMode = function (m) { stopAll(); var el = getEl(m); if (el) { el.currentTime = 0; var pr = el.play(); if (pr && pr.catch) pr.catch(function () {}); } };
    var abBtns = [['before', 'Before'], ['after', 'After Salah Sounds']].map(function (p) {
      var on = s.mode === p[0];
      return {
        label: p[1], on: on,
        pick: function () { if (self.state.playing) playMode(p[0]); self.setState({ mode: p[0] }); },
        style: 'min-height: 46px; padding: 0 16px; border-radius: 999px; border: 0; font: inherit; font-size: 15px; font-weight: 600; cursor: pointer; background: ' + (on ? t.accent : 'transparent') + '; color: ' + (on ? t.accentInk : t.muted)
      };
    });
    var togglePlay = function () {
      if (self.state.playing) { stopAll(); self.setState({ playing: false }); }
      else { playMode(self.state.mode); self.setState({ playing: true }); }
    };
    var onEnded = function () { self.setState({ playing: false }); };
    var bars = [];
    for (var i = 0; i < 36; i++) {
      var h, col, dur;
      if (after) {
        h = Math.round(22 + 56 * Math.pow(Math.sin(Math.PI * (i + 0.5) / 36), 1.4));
        col = t.grad; dur = 1.2 + (i % 5) * 0.12;
      } else {
        var r = (i * 37 + 11) % 13;
        h = 12 + r * 5;
        col = h > 64 ? '#E2665C' : t.muted; dur = 0.35 + (i % 4) * 0.08;
      }
      if (!playing) h = Math.max(8, Math.round(h * 0.35));
      bars.push({ style: 'flex: 1; min-width: 3px; height: ' + h + 'px; border-radius: 3px 3px 0 0; background: ' + col + '; opacity: ' + (after ? 1 : 0.75) + '; animation-duration: ' + dur + 's; animation-delay: ' + ((i % 9) * 0.09) + 's; animation-play-state: ' + (playing ? 'running' : 'paused') + '; transition: height .3s' });
    }
    var chipBase = 'font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 9px; border-radius: 999px; ';
    var read = after
      ? { chipLabel: 'After', chip: chipBase + 'background: ' + t.accent + '; color: ' + t.accentInk, note: 'After: new digital mixer, our 3-tier mic system and Haramain EQ. Clear, warm and even across the hall.' }
      : { chipLabel: 'Before', chip: chipBase + 'background: #FFFFFF; color: #B4423A', note: 'Before: the masjid’s original setup. Press play, then switch to After to hear the difference.' };

    // Estimator
    var space = s.space, cap = s.cap;
    var spaceOpts = [['masjid', 'Masjid / musalla'], ['event', 'An event'], ['video', 'Filming a talk']].map(function (p) {
      var on = space === p[0];
      return {
        label: p[1], on: on,
        pick: function () { self.setState({ space: p[0] }); },
        style: 'min-height: 48px; padding: 0 20px; border-radius: 999px; font: inherit; font-size: 15px; font-weight: 600; cursor: pointer; border: 1px solid ' + (on ? t.accent : t.line) + '; background: ' + (on ? t.accent : 'transparent') + '; color: ' + (on ? t.accentInk : t.ink)
      };
    });
    var pk = {
      masjid: { name: 'Mosque Sound System', from: '£750', base: ['Digital mixer', 'Speakers & amplifier', 'Microphone', 'Installation & tuning'] },
      event: { name: 'Event Audio & Video', from: '£999', base: ['Digital mixer', 'Speakers & amplifiers', 'Microphones', 'Production crew'] },
      video: { name: 'Video & Editing', from: '£1,099', base: ['Cameras', 'Lighting', 'Production', 'Editing'] }
    }[space];
    var add = [];
    if (space === 'masjid') {
      if (cap > 150) add.push('Sisters’ area / upstairs zone');
      if (cap > 400) add.push('Overflow hall & courtyard feed');
      if (cap > 800) add.push('Column arrays, multi-zone processing');
      add.push('Volunteer training');
    } else if (space === 'event') {
      if (cap > 200) add.push('Extra PA coverage');
      if (cap > 500) add.push('Big-screen relay');
      add.push('Live stream to YouTube / Facebook');
    } else {
      if (cap > 200) add.push('Multi-camera coverage');
      add.push('Live stream option');
    }
    var sizeLabel = space === 'masjid'
      ? (cap <= 150 ? 'Small musalla' : cap <= 400 ? 'Medium hall' : cap <= 800 ? 'Large masjid' : 'Jāmiʿ masjid')
      : (cap <= 150 ? 'Intimate' : cap <= 500 ? 'Mid-size venue' : 'Large venue');
    var est = {
      name: pk.name, from: pk.from,
      base: pk.base.map(function (x) { return { label: x }; }),
      addons: add.map(function (x) { return { label: x }; })
    };

    // Reviews (real Google reviews, from salahsounds.co.uk)
    var rv = [
      ['Parvaz Arshad', 'Masjid in Cumbernauld, Scotland', 'I recently contacted Br. Joynul from Salah Sounds to upgrade the mixer at our masjid in Cumbernauld, Scotland. From our very first conversation, it was clear that Joynul is truly an expert in his field, Ma Sha Allah. He upgraded our analogue mixer to a digital one, installed a monitor speaker, and provided new mic stands. We are extremely happy with the end result. The sound quality is now crisp and clear, and the equalisation is outstanding. I highly recommend Salah Sounds for any audio installations and setup needs.'],
      ['Shakeel Ahmad', 'Masjid in the USA', 'I saw Salah Sounds’ work on social media and got the idea to upgrade our masjid’s sound system with the equipment they recommended. It turned out to be one of the best decisions we made. The quality of the system is excellent. I was in a panic when I couldn’t tune it myself, especially knowing I am in USA and Salah Sounds is a UK based company. Brother Joynul stepped in right away and helped me remotely until everything was perfectly set. Amazing service, great support, and a highly knowledgeable team. I truly appreciate their dedication. Highly recommended for any masjid or community center looking to improve their audio system!'],
      ['Idris Jangda', 'Australia', 'Salah Sounds is amazing. We had a consult with him even though we are based in Australia he was able to guide us and help us upgrade our system to something more efficient and reliable that will have longevity. Highly recommend the brother for all his advice and work. Cannot go wrong using Salah sounds'],
      ['Ahmed Abukar', 'Temporary prayer hall', 'Excellent service, may Allah reward the team for their outstanding efforts. I called to ask about a portable system for a temporary prayer hall, and they didn’t hesitate to guide me to suitable and affordable options that met our needs. They are Quick with responses and also do a follow up to make sure everything is OK after sometime. Would definitely recommend this service to anyone looking to update or install sound systems'],
      ['Mizanur Rahman', 'Chingford Mosque', 'We are thrilled with the new sound system that Salah Sounds installed at Chingford Mosque. From start to finish, Joynul was incredibly professional and meticulous in their work. The planning process was smooth, ensuring all our specific requirements were met, and the installation was executed perfectly. One thing that really stood out was Joynul’s honesty and transparency when it came to costs. He was so candid that he even listed petrol costs on the invoice just to show us exactly where our money was going. On top of that, he offers a price match guarantee, proving not only his integrity but also how competitive his pricing is. A key part of the system’s success was Joynul’s help with fine-tuning the setup using specialised tuning software. This allowed us to make several improvements to the system, ensuring that the sound quality is optimised throughout the mosque. The clarity and balance are incredible. We highly recommend Salah Sounds for anyone looking to enhance their sound system. The difference in quality and performance is clear, and the results speak for themselves.'],
      ['Nadim Khan', 'Jamia Masjid Sultania, Nottingham', 'What can I say, the brothers are very humble and helpful, they listened to exactly what I needed for our masjid and supplied exactly that, fantastic service, I definitely recommend everyone to use their service. Thank you once again.'],
      ['Azuary Ibrahim', 'Google review', 'Amazing people and service on earth. May Allah bless you all and give eternal happiness.']
    ];
    var openRv = s.openRv || {};
    var avCols = ['#5A55D6', '#4F7FE0', '#7A4FC0'];
    var reviews = rv.map(function (r, i) {
      var long = r[2].length > 260;
      var open = !!openRv[i];
      var ini = r[0].split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2);
      return {
        name: r[0], where: r[1], text: r[2], initials: ini, long: long, open: open,
        more: open ? 'Show less' : 'Read full review',
        toggle: function () { var o = Object.assign({}, self.state.openRv || {}); o[i] = !o[i]; self.setState({ openRv: o }); },
        avatar: 'flex-shrink: 0; width: 44px; height: 44px; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; color: #FFFFFF; background: ' + avCols[i % 3],
        textStyle: 'margin: 0; font-size: 16px; line-height: 1.6; color: ' + t.ink + (long && !open ? '; display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden' : '')
      };
    });

    // Quote & enquiry: carry answers through, nothing to retype
    var WA = 'https://wa.me/442038177858?text=';
    var quoteLines = [
      'Assalamu alaikum, I’d like a quote.',
      'For: ' + (spaceOpts.filter(function (o) { return o.on; })[0] || {}).label,
      'Number of people: ' + cap + ' (' + sizeLabel + ')',
      'Recommended: ' + est.name + ' (from ' + est.from + ')',
      'Interested in: ' + add.join(', ')
    ];
    var waQuote = WA + encodeURIComponent(quoteLines.join('\n'));
    var spaceToNeed = { masjid: 'Mosque sound system', event: 'Event AV / live stream', video: 'Video production' };
    var f = s.form || { name: '', phone: '', org: '', msg: '' };
    var setF = function (k) { return function (e) { var n = Object.assign({}, self.state.form || { name: '', phone: '', org: '', msg: '' }); n[k] = e.target.value; self.setState({ form: n }); }; };
    var form = { name: f.name, phone: f.phone, org: f.org, msg: f.msg, setName: setF('name'), setPhone: setF('phone'), setOrg: setF('org'), setMsg: setF('msg') };
    var useForm = function () {
      var n = Object.assign({}, self.state.form || { name: '', phone: '', org: '', msg: '' });
      n.msg = quoteLines.slice(1).join('\n') + (n.msg ? '\n\n' + n.msg : '');
      self.setState({ form: n, need: spaceToNeed[self.state.space] || 'Mosque sound system' });
      var el = document.getElementById('enquiry'); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    // Contact form chips
    var chip = function (on) { return 'min-height: 44px; padding: 0 16px; border-radius: 999px; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; border: 1px solid ' + (on ? '#5A55D6' : '#D5DAE8') + '; background: ' + (on ? '#5A55D6' : '#FFFFFF') + '; color: ' + (on ? '#FFFFFF' : '#141B2D'); };
    var need = s.need || 'Mosque sound system';
    var needOpts = ['Mosque sound system', 'Event AV / live stream', 'Video production', 'Support / tuning'].map(function (x) { return { label: x, on: need === x, style: chip(need === x), pick: function () { self.setState({ need: x }); } }; });
    var pref = s.pref || 'WhatsApp';
    var prefOpts = ['WhatsApp', 'Phone call', 'Email'].map(function (x) { return { label: x, on: pref === x, style: chip(pref === x), pick: function () { self.setState({ pref: x }); } }; });

    var enquiryLines = function () {
      var st = self.state, ff = st.form || {};
      return ['Assalamu alaikum, new enquiry from the website.',
        'Need: ' + (st.need || 'Mosque sound system'),
        ff.name ? 'Name: ' + ff.name : null,
        ff.phone ? 'Phone / WhatsApp: ' + ff.phone : null,
        ff.org ? 'Masjid / organisation: ' + ff.org : null,
        'Best way to reach me: ' + (st.pref || 'WhatsApp'),
        ff.msg ? '\n' + ff.msg : null].filter(Boolean).join('\n');
    };
    var sendLabel = pref === 'Email' ? 'Send by email' : pref === 'Phone call' ? 'Request a call back' : 'Send on WhatsApp';
    var sendEnquiry = function () {
      var body = enquiryLines();
      var url = (self.state.pref === 'Email')
        ? 'mailto:sales@salahsounds.co.uk?subject=' + encodeURIComponent('Website enquiry: ' + (self.state.need || 'Mosque sound system')) + '&body=' + encodeURIComponent(body)
        : WA + encodeURIComponent(body);
      window.open(url, '_blank', 'noopener');
    };

    // FAQ
    var qa = [
      ['Do you work outside London?', 'Yes. We’ve installed systems across the UK and support masjids abroad, including the USA and Australia, with remote tuning.'],
      ['Will you match another quote?', 'Yes. Send us a like-for-like quote and we’ll match it.'],
      ['Will our volunteers be able to use it?', 'Training is part of every install. We set simple presets for adhan, khutbah and tarawih so anyone can run it.'],
      ['Can you help with a temporary or Ramadan prayer hall?', 'Yes, we provide portable systems for temporary prayer spaces.'],
      ['Can you live stream our fundraising dinner?', 'Yes. Event packages cover sound, cameras and streaming for dinners, launches, talks and conferences.']
    ];
    var faqs = qa.map(function (p, idx) {
      var open = s.open === idx;
      return { q: p[0], a: p[1], open: open, icon: open ? '−' : '+', toggle: function () { self.setState({ open: open ? -1 : idx }); } };
    });

    return {
      logoHeader: 'height: 56px; width: auto; display: block' + (dark ? '; background: #FFFFFF; padding: 6px 12px; border-radius: 14px; box-sizing: content-box' : ''),
      logoFooter: 'height: 44px; width: auto; display: block' + (dark ? '; background: #FFFFFF; padding: 5px 10px; border-radius: 12px; box-sizing: content-box' : ''),
      logoSplash: dark ? 'background: #FFFFFF; padding: 14px 22px; border-radius: 20px' : '',
      dark: dark, light: !dark, darkLabel: dark ? 'Switch to light mode' : 'Switch to dark mode',
      toggleDark: function () { var d = !self.state.dark; try { window.localStorage.setItem('ss-theme', d ? 'dark' : 'light'); } catch (e) {} self.setState({ dark: d }); },
      t: t, fontD: fontD, fontB: fontB, abBtns: abBtns, bars: bars, read: read, playing: playing, notPlaying: !playing, togglePlay: togglePlay, onEnded: onEnded, playLabel: playing ? 'Pause' : 'Play recording',
      spaceOpts: spaceOpts, cap: cap, sizeLabel: sizeLabel, est: est,
      onCap: function (e) { self.setState({ cap: parseInt(e.target.value, 10) }); },
      faqs: faqs, reviews: reviews, needOpts: needOpts, prefOpts: prefOpts, waQuote: waQuote, useForm: useForm, form: form, sendEnquiry: sendEnquiry, sendLabel: sendLabel
    };
  }
}


function view(v) {
  const { abBtns, bars, cap, dark, darkLabel, est, faqs, fontB, fontD, form, light, logoFooter, logoHeader, logoSplash, needOpts, notPlaying, onCap, onEnded, playLabel, playing, prefOpts, read, reviews, sendEnquiry, sendLabel, sizeLabel, spaceOpts, t, toggleDark, togglePlay, useForm, waQuote } = v;
  return html`<div style="width: 100%; transition: background-color .4s, color .4s; background: ${t.bg}; color: ${t.ink}; font-family: ${fontB}; font-size: 17px; line-height: 1.6; overflow: hidden">


<div class="splash" aria-hidden="true" style="background: ${t.bg}">
<img src="img/salah-sounds-logo.png" alt="" style=${logoSplash} />
<div class="wv"><span style="animation-delay: 0.00s"></span><span style="animation-delay: 0.12s"></span><span style="animation-delay: 0.24s"></span><span style="animation-delay: 0.36s"></span><span style="animation-delay: 0.48s"></span><span style="animation-delay: 0.36s"></span><span style="animation-delay: 0.24s"></span><span style="animation-delay: 0.12s"></span><span style="animation-delay: 0.00s"></span><span style="animation-delay: 0.12s"></span><span style="animation-delay: 0.24s"></span><span style="animation-delay: 0.36s"></span><span style="animation-delay: 0.48s"></span></div>
<div class="ld"><i></i></div>
</div>

<a href="#giveaway" style="display: block; text-decoration: none; background: ${t.accent}; color: ${t.accentInk}; text-align: center; padding: 10px 20px; font-size: 14px; font-weight: 600">The £10,000 Mosque Audio Giveaway is open. Nominate your masjid →</a>


<header style="max-width: 1320px; margin: 0 auto; padding: 22px 32px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 18px">
<a href="#top" aria-label="Salah Sounds home" style="display: flex; align-items: center; text-decoration: none"><img src="img/salah-sounds-logo.png" alt="Salah Sounds Audio Visual" style=${logoHeader} /></a>
<nav aria-label="Main" style="display: flex; flex-wrap: wrap; gap: 6px 30px; font-size: 15px; font-weight: 500; color: ${t.muted}">
<a href="#services" style="text-decoration: none">Services</a>
<a href="#estimate" style="text-decoration: none">Price my system</a>
<a href="#packages" style="text-decoration: none">Packages</a>
<a href="#reviews" style="text-decoration: none">Reviews</a>
<a href="#academy" style="text-decoration: none">Academy</a>
<a href="#faq" style="text-decoration: none">FAQ</a>
</nav>
<div style="display: flex; align-items: center; gap: 10px">
<button type="button" onClick=${toggleDark} aria-label=${darkLabel} title=${darkLabel} style="width: 46px; height: 46px; border-radius: 999px; border: 1px solid ${t.line}; background: ${t.surface}; color: ${t.ink}; display: flex; align-items: center; justify-content: center; cursor: pointer">
${dark ? html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.9 4.9l1.4 1.4"></path><path d="M17.7 17.7l1.4 1.4"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M4.9 19.1l1.4-1.4"></path><path d="M17.7 6.3l1.4-1.4"></path></svg>` : null}
${light ? html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path></svg>` : null}
</button>
<a href="#contact" style="min-height: 46px; display: inline-flex; align-items: center; padding: 0 22px; border-radius: 999px; background: ${t.ink}; color: ${t.bg}; text-decoration: none; font-size: 15px; font-weight: 600">Book a site visit</a>
</div>
</header>


<section id="top" style="position: relative; padding: 24px 32px 64px">
<div style="max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 520px), 1fr)); gap: 40px; align-items: center">
<div style="display: flex; flex-direction: column; gap: 28px">
<div class="in1" style="display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; color: ${t.accentText}; letter-spacing: 0.14em; text-transform: uppercase">
<span class="pulse" style="width: 8px; height: 8px; border-radius: 999px; background: ${t.accent}"></span>Mosque sound · Event AV · Live streaming
</div>
<h1 class="in2" style="margin: 0; font-family: ${fontD}; font-weight: 800; font-size: clamp(44px, 5.4vw, 82px); line-height: 0.98; letter-spacing: -0.035em">The Haramain sound. <span style="color: ${t.accent}">In your masjid.</span></h1>
<p class="in3" style="margin: 0; font-size: 20px; line-height: 1.55; color: ${t.muted}; max-width: 560px">Every āyah, every khutbah, every row — heard clearly. We design, install and tune sound and video systems for mosques and events across the UK and around the world.</p>
<div class="in4" style="display: flex; flex-wrap: wrap; gap: 12px">
<a href="#estimate" style="min-height: 56px; display: inline-flex; align-items: center; gap: 10px; padding: 0 28px; border-radius: 999px; background: ${t.accent}; color: ${t.accentInk}; text-decoration: none; font-weight: 600; font-size: 16px">Price my system in 30 seconds
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="M13 6l6 6-6 6"></path></svg></a>
<a href="https://wa.me/442038177858" style="min-height: 56px; display: inline-flex; align-items: center; gap: 10px; padding: 0 24px; border-radius: 999px; border: 1px solid ${t.line}; text-decoration: none; font-weight: 500; font-size: 16px">
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5z"></path></svg>WhatsApp an engineer</a>
</div>
<div class="in4" style="display: flex; flex-wrap: wrap; align-items: center; gap: 14px 32px; padding-top: 8px; border-top: 1px solid ${t.line}">
<a href="https://www.google.com/search?q=Salah+Sounds+East+Ham+reviews" target="_blank" rel="noopener" style="text-decoration: none; display: flex; align-items: center; gap: 10px; padding-top: 18px">
<span style="font-family: ${fontD}; font-weight: 800; font-size: 34px; line-height: 1">5★</span>
<span style="font-size: 14px; line-height: 1.35; color: ${t.muted}">Rated Excellent<br />67 Google reviews</span>
</a>
<div style="display: flex; align-items: center; gap: 10px; padding-top: 18px">
<span style="font-family: ${fontD}; font-weight: 800; font-size: 34px; line-height: 1">£</span>
<span style="font-size: 14px; line-height: 1.35; color: ${t.muted}">Price-match<br />guarantee</span>
</div>
<div style="display: flex; align-items: center; gap: 10px; padding-top: 18px">
<span style="font-family: ${fontD}; font-weight: 800; font-size: 34px; line-height: 1">UK+</span>
<span style="font-size: 14px; line-height: 1.35; color: ${t.muted}">Remote tuning<br />worldwide</span>
</div>
</div>
</div>


<div class="in5" style="background: ${t.surface}; border: 1px solid ${t.line}; border-radius: 28px; padding: 18px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 30px 60px rgba(30,35,80,0.12)">
<div style="border-radius: 18px; background: #141B2D; color: #FFFFFF; padding: 14px 14px 14px 18px; display: flex; align-items: center; gap: 14px">
<span style="display: flex; flex-direction: column; gap: 4px; line-height: 1.2; flex-grow: 1; min-width: 0">
<span style="display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase">Hear the difference <span style=${read.chip}>${read.chipLabel}</span></span>
</span>
<button type="button" class="playbtn" onClick=${togglePlay} aria-label=${playLabel} style="flex-shrink: 0; width: 52px; height: 52px; border-radius: 999px; border: 0; background: #FFFFFF; color: #141B2D; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 10px 24px rgba(0,0,0,0.3)">
${playing ? html`<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"></rect><rect x="14" y="5" width="4" height="14" rx="1"></rect></svg>` : null}
${notPlaying ? html`<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="margin-left: 3px"><path d="M7 4.5v15l13-7.5z"></path></svg>` : null}
</button>
</div>
<div role="group" aria-label="Compare before and after" style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); background: ${t.bg}; border-radius: 999px; padding: 4px; gap: 4px">
${(abBtns||[]).map((b, $index) => html`
<button type="button" onClick=${b.pick} aria-pressed=${b.on} style=${b.style}>${b.label}</button>
`)}
</div>
<div style="height: 80px; display: flex; align-items: flex-end; gap: 4px; padding: 0 2px" aria-hidden="true">
${(bars||[]).map((bar, $index) => html`
<span class="bar" style=${bar.style}></span>
`)}
</div>
<p style="margin: 0; font-size: 15px; color: ${t.muted}">${read.note}</p>
<div style="display: flex; flex-wrap: wrap; gap: 8px">
<span style="font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 999px; background: ${t.bg2}">Digital mixer</span>
<span style="font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 999px; background: ${t.bg2}">3-tier mic system</span>
<span style="font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 999px; background: ${t.bg2}">Haramain EQ tuning</span>
<span style="font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 999px; background: ${t.bg2}">Feedback eliminated</span>
</div>
<audio id="ss-before" src="audio/york-before.mp4" preload="auto" onEnded=${onEnded}></audio>
<audio id="ss-after" src="audio/york-after.mp4" preload="auto" onEnded=${onEnded}></audio>
</div>
</div>
</section>


<section aria-label="Trusted by" style="padding: 56px 0 64px; background: ${t.bg2}; border-top: 1px solid ${t.line}; border-bottom: 1px solid ${t.line}">
<div style="max-width: 1320px; margin: 0 auto 32px; padding: 0 32px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px">
<p style="margin: 0; font-family: ${fontD}; font-weight: 700; font-size: 22px; letter-spacing: -0.01em">Trusted by masjids, charities and event organisers</p>
<a href="https://www.google.com/search?q=Salah+Sounds+East+Ham+reviews" target="_blank" rel="noopener" style="text-decoration: none; display: inline-flex; align-items: center; gap: 10px; background: ${t.surface}; border: 1px solid ${t.line}; border-radius: 999px; padding: 8px 16px; min-height: 44px; font-size: 14px; font-weight: 600">
<span style="color: #F2B01E; letter-spacing: 2px" aria-hidden="true">★★★★★</span>Excellent · 67 Google reviews<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7"></path><path d="M8 7h9v9"></path></svg></a>
</div>
<div style="overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)">
<div class="marq" style="gap: 20px; padding: 4px 0">
<div style="flex-shrink: 0; width: 220px; height: 150px; background: #FFFFFF; border: 1px solid ${t.line}; border-radius: 22px; display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 10px 24px rgba(30,35,80,0.05)"><img src="img/clients/abdullah-aid.jpg" alt="Abdullah Aid" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block" /></div>
<div style="flex-shrink: 0; width: 220px; height: 150px; background: #FFFFFF; border: 1px solid ${t.line}; border-radius: 22px; display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 10px 24px rgba(30,35,80,0.05)"><img src="img/clients/an-noor.jpg" alt="An-Noor Cultural & Educational Trust" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block" /></div>
<div style="flex-shrink: 0; width: 220px; height: 150px; background: #FFFFFF; border: 1px solid ${t.line}; border-radius: 22px; display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 10px 24px rgba(30,35,80,0.05)"><img src="img/clients/baitul-aman.jpg" alt="Baitul Aman Mosque & Cultural Centre" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block" /></div>
<div style="flex-shrink: 0; width: 220px; height: 150px; background: #FFFFFF; border: 1px solid ${t.line}; border-radius: 22px; display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 10px 24px rgba(30,35,80,0.05)"><img src="img/clients/mhbay.jpg" alt="MHBay Islamic Centre" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block" /></div>
<div style="flex-shrink: 0; width: 220px; height: 150px; background: #FFFFFF; border: 1px solid ${t.line}; border-radius: 22px; display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 10px 24px rgba(30,35,80,0.05)"><img src="img/clients/quwwatul-islam.jpg" alt="Quwwat-ul-Islam Society" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block" /></div>
<div style="flex-shrink: 0; width: 220px; height: 150px; background: #FFFFFF; border: 1px solid ${t.line}; border-radius: 22px; display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 10px 24px rgba(30,35,80,0.05)"><img src="img/clients/seven-kings.jpg" alt="Seven Kings Muslim Educational Trust" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block" /></div>
<div style="flex-shrink: 0; width: 220px; height: 150px; background: #FFFFFF; border: 1px solid ${t.line}; border-radius: 22px; display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 10px 24px rgba(30,35,80,0.05)"><img src="img/clients/simply-nikah.jpg" alt="Simply Nikah" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block" /></div>
<div style="flex-shrink: 0; width: 220px; height: 150px; background: #FFFFFF; border: 1px solid ${t.line}; border-radius: 22px; display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 10px 24px rgba(30,35,80,0.05)"><img src="img/clients/masjid-ayesha.jpg" alt="Masjid Ayesha" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block" /></div>
<div style="flex-shrink: 0; width: 220px; height: 150px; background: #FFFFFF; border: 1px solid ${t.line}; border-radius: 22px; display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 10px 24px rgba(30,35,80,0.05)"><img src="img/clients/abdullah-aid.jpg" alt="Abdullah Aid" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block" /></div>
<div style="flex-shrink: 0; width: 220px; height: 150px; background: #FFFFFF; border: 1px solid ${t.line}; border-radius: 22px; display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 10px 24px rgba(30,35,80,0.05)"><img src="img/clients/an-noor.jpg" alt="An-Noor Cultural & Educational Trust" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block" /></div>
<div style="flex-shrink: 0; width: 220px; height: 150px; background: #FFFFFF; border: 1px solid ${t.line}; border-radius: 22px; display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 10px 24px rgba(30,35,80,0.05)"><img src="img/clients/baitul-aman.jpg" alt="Baitul Aman Mosque & Cultural Centre" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block" /></div>
<div style="flex-shrink: 0; width: 220px; height: 150px; background: #FFFFFF; border: 1px solid ${t.line}; border-radius: 22px; display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 10px 24px rgba(30,35,80,0.05)"><img src="img/clients/mhbay.jpg" alt="MHBay Islamic Centre" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block" /></div>
<div style="flex-shrink: 0; width: 220px; height: 150px; background: #FFFFFF; border: 1px solid ${t.line}; border-radius: 22px; display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 10px 24px rgba(30,35,80,0.05)"><img src="img/clients/quwwatul-islam.jpg" alt="Quwwat-ul-Islam Society" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block" /></div>
<div style="flex-shrink: 0; width: 220px; height: 150px; background: #FFFFFF; border: 1px solid ${t.line}; border-radius: 22px; display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 10px 24px rgba(30,35,80,0.05)"><img src="img/clients/seven-kings.jpg" alt="Seven Kings Muslim Educational Trust" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block" /></div>
<div style="flex-shrink: 0; width: 220px; height: 150px; background: #FFFFFF; border: 1px solid ${t.line}; border-radius: 22px; display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 10px 24px rgba(30,35,80,0.05)"><img src="img/clients/simply-nikah.jpg" alt="Simply Nikah" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block" /></div>
<div style="flex-shrink: 0; width: 220px; height: 150px; background: #FFFFFF; border: 1px solid ${t.line}; border-radius: 22px; display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 10px 24px rgba(30,35,80,0.05)"><img src="img/clients/masjid-ayesha.jpg" alt="Masjid Ayesha" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block" /></div>
</div>
</div>
</section>


<section style="padding: 72px 32px">
<div style="max-width: 1320px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px">
<div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 16px">
<span style="font-size: 14px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: ${t.accentText}">Why masjids call us</span>
<h2 style="margin: 0; font-family: ${fontD}; font-weight: 800; font-size: clamp(34px, 4vw, 56px); line-height: 1.05; letter-spacing: -0.03em; max-width: 820px">Bad sound is rarely the speakers. <span style="color: ${t.accent}">It's the design.</span></h2>
<p style="margin: 0; color: ${t.muted}; font-size: 18px; max-width: 620px">Domes, tiled floors and bare walls fight every word. We engineer the system around your building, not the other way round.</p>
</div>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap: 24px">

<article style="background: ${t.surface}; border: 1px solid ${t.line}; border-radius: 28px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(30,35,80,0.06)">
<div style="padding: 32px 32px 28px; display: flex; flex-direction: column; gap: 18px">
<div style="display: flex; justify-content: space-between; align-items: center">
<span style="width: 56px; height: 56px; border-radius: 18px; background: ${t.bg2}; display: flex; align-items: center; justify-content: center"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke=${t.accent} stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4z"></path><path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M18.5 5.5a9 9 0 0 1 0 13"></path></svg></span>
<span style="font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #B4423A; background: #FBE9E7; padding: 6px 12px; border-radius: 999px">Echo</span>
</div>
<h3 style="margin: 0; font-family: ${fontD}; font-weight: 700; font-size: 24px; line-height: 1.2; letter-spacing: -0.015em">"The imam's voice echoes and blurs."</h3>
</div>
<div style="margin-top: auto; background: ${t.bg2}; padding: 26px 32px 30px; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid ${t.line}">
<span style="display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${t.accentText}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"></path></svg>Our fix</span>
<p style="margin: 0; font-size: 16px; color: ${t.ink}">Directional column speakers aimed at people, not walls, tuned to your hall's reverb.</p>
</div>
</article>

<article style="background: ${t.surface}; border: 1px solid ${t.line}; border-radius: 28px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(30,35,80,0.06)">
<div style="padding: 32px 32px 28px; display: flex; flex-direction: column; gap: 18px">
<div style="display: flex; justify-content: space-between; align-items: center">
<span style="width: 56px; height: 56px; border-radius: 18px; background: ${t.bg2}; display: flex; align-items: center; justify-content: center"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke=${t.accent} stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"></rect><path d="M5 10a7 7 0 0 0 14 0"></path><path d="M12 17v4"></path><path d="M3 3l18 18"></path></svg></span>
<span style="font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #B4423A; background: #FBE9E7; padding: 6px 12px; border-radius: 999px">Feedback</span>
</div>
<h3 style="margin: 0; font-family: ${fontD}; font-weight: 700; font-size: 24px; line-height: 1.2; letter-spacing: -0.015em">"It screeches right in the middle of the khutbah."</h3>
</div>
<div style="margin-top: auto; background: ${t.bg2}; padding: 26px 32px 30px; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid ${t.line}">
<span style="display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${t.accentText}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"></path></svg>Our fix</span>
<p style="margin: 0; font-size: 16px; color: ${t.ink}">Digital mixing with saved presets for adhan, khutbah and tarawih. One button, no guesswork.</p>
</div>
</article>

<article style="background: ${t.surface}; border: 1px solid ${t.line}; border-radius: 28px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(30,35,80,0.06)">
<div style="padding: 32px 32px 28px; display: flex; flex-direction: column; gap: 18px">
<div style="display: flex; justify-content: space-between; align-items: center">
<span style="width: 56px; height: 56px; border-radius: 18px; background: ${t.bg2}; display: flex; align-items: center; justify-content: center"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke=${t.accent} stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18"></path><path d="M5 21V10l7-6 7 6v11"></path><path d="M9 21v-5h6v5"></path><path d="M9 11h6"></path></svg></span>
<span style="font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #B4423A; background: #FBE9E7; padding: 6px 12px; border-radius: 999px">Coverage</span>
</div>
<h3 style="margin: 0; font-family: ${fontD}; font-weight: 700; font-size: 24px; line-height: 1.2; letter-spacing: -0.015em">"The sisters' area upstairs can't hear a thing."</h3>
</div>
<div style="margin-top: auto; background: ${t.bg2}; padding: 26px 32px 30px; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid ${t.line}">
<span style="display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${t.accentText}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"></path></svg>Our fix</span>
<p style="margin: 0; font-size: 16px; color: ${t.ink}">Separate zones with their own level and video relay, so every floor and overflow room is covered.</p>
</div>
</article>

</div>
<div style="display: flex; justify-content: center">
<a href="#contact" style="min-height: 52px; display: inline-flex; align-items: center; gap: 10px; padding: 0 26px; border-radius: 999px; background: ${t.ink}; color: ${t.bg}; text-decoration: none; font-weight: 600">Sound familiar? Talk to an engineer →</a>
</div>
</div>
</section>


<section id="services" style="padding: 72px 32px">
<div style="max-width: 1320px; margin: 0 auto; display: flex; flex-direction: column; gap: 36px">
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); gap: 24px; align-items: end">
<div style="display: flex; flex-direction: column; gap: 14px">
<span style="font-size: 14px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: ${t.accentText}">What we do</span>
<h2 style="margin: 0; font-family: ${fontD}; font-weight: 800; font-size: clamp(34px, 4vw, 56px); line-height: 1.05; letter-spacing: -0.03em">Everything your masjid needs to sound its best.</h2>
</div>
<p style="margin: 0; color: ${t.muted}; font-size: 18px; max-width: 520px; justify-self: end">One team for design, supply, installation, tuning and aftercare, so nothing gets lost between contractors.</p>
</div>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap: 20px; align-items: stretch">
<article style="background: #141B2D; color: #F3F5FA; border: 1px solid #2E3A5C; border-radius: 28px; padding: 32px; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 20px 40px rgba(30,35,80,0.06)">
<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px">
<span style="width: 60px; height: 60px; border-radius: 18px; background: linear-gradient(135deg, #4F7FE0, #7A4FC0); display: flex; align-items: center; justify-content: center"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18"></path><path d="M5 21V11a7 7 0 0 1 14 0v10"></path><path d="M12 4V2"></path><path d="M10 21v-4a2 2 0 0 1 4 0v4"></path></svg></span>
<span style="font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #141B2D; background: #A9B4FF; padding: 5px 10px; border-radius: 999px">Most requested</span>
</div>
<div style="display: flex; flex-direction: column; gap: 10px">
<h3 style="margin: 0; font-family: ${fontD}; font-weight: 700; font-size: 26px; line-height: 1.15; letter-spacing: -0.02em">Mosque sound & video systems</h3>
<p style="margin: 0; color: #B8C0D4; font-size: 16px">Designed around your hall — from a small musalla to a large jāmiʿ masjid.</p>
</div>
<ul style="margin: 0; padding: 18px 0 0; border-top: 1px solid #2E3A5C; list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 15px"><li style="display: flex; gap: 10px; align-items: flex-start"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A9B4FF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px"><path d="M20 6L9 17l-5-5"></path></svg>Acoustic assessment & system design</li><li style="display: flex; gap: 10px; align-items: flex-start"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A9B4FF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px"><path d="M20 6L9 17l-5-5"></path></svg>Digital mixer & 3-tier mic system</li><li style="display: flex; gap: 10px; align-items: flex-start"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A9B4FF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px"><path d="M20 6L9 17l-5-5"></path></svg>Column speakers, sisters’ & overflow zones</li><li style="display: flex; gap: 10px; align-items: flex-start"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A9B4FF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px"><path d="M20 6L9 17l-5-5"></path></svg>Haramain EQ tuning</li></ul>
<a href="services/mosque-sound-systems.html" style="margin-top: auto; min-height: 48px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 15px; background: #A9B4FF; color: #141B2D">Explore mosque systems →</a>
</article>
<article style="background: ${t.surface}; color: ${t.ink}; border: 1px solid ${t.line}; border-radius: 28px; padding: 32px; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 20px 40px rgba(30,35,80,0.06)">
<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px">
<span style="width: 60px; height: 60px; border-radius: 18px; background: linear-gradient(135deg, #4F7FE0, #7A4FC0); display: flex; align-items: center; justify-content: center"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="14" height="12" rx="2"></rect><path d="M16 10l6-3v10l-6-3"></path></svg></span>
<span style="font-family: ${fontD}; font-weight: 800; font-size: 15px; color: ${t.muted}">02</span>
</div>
<div style="display: flex; flex-direction: column; gap: 10px">
<h3 style="margin: 0; font-family: ${fontD}; font-weight: 700; font-size: 26px; line-height: 1.15; letter-spacing: -0.02em">Event AV & live streaming</h3>
<p style="margin: 0; color: ${t.muted}; font-size: 16px">Conferences, charity dinners, launches, talks and seminars, handled end to end.</p>
</div>
<ul style="margin: 0; padding: 18px 0 0; border-top: 1px solid ${t.line}; list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 15px"><li style="display: flex; gap: 10px; align-items: flex-start"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke=${t.accentText} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px"><path d="M20 6L9 17l-5-5"></path></svg>PA, microphones & stage monitoring</li><li style="display: flex; gap: 10px; align-items: flex-start"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke=${t.accentText} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px"><path d="M20 6L9 17l-5-5"></path></svg>Cameras, screens & lighting</li><li style="display: flex; gap: 10px; align-items: flex-start"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke=${t.accentText} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px"><path d="M20 6L9 17l-5-5"></path></svg>Live stream to YouTube & Facebook</li><li style="display: flex; gap: 10px; align-items: flex-start"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke=${t.accentText} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px"><path d="M20 6L9 17l-5-5"></path></svg>On-the-day production crew</li></ul>
<a href="services/event-av-live-streaming.html" style="margin-top: auto; min-height: 48px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 15px; border: 1px solid ${t.line}; color: ${t.ink}">Explore event AV →</a>
</article>
<article style="background: ${t.surface}; color: ${t.ink}; border: 1px solid ${t.line}; border-radius: 28px; padding: 32px; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 20px 40px rgba(30,35,80,0.06)">
<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px">
<span style="width: 60px; height: 60px; border-radius: 18px; background: linear-gradient(135deg, #4F7FE0, #7A4FC0); display: flex; align-items: center; justify-content: center"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21v-7"></path><path d="M4 10V3"></path><path d="M12 21v-9"></path><path d="M12 8V3"></path><path d="M20 21v-5"></path><path d="M20 12V3"></path><path d="M1 14h6"></path><path d="M9 8h6"></path><path d="M17 16h6"></path></svg></span>
<span style="font-family: ${fontD}; font-weight: 800; font-size: 15px; color: ${t.muted}">03</span>
</div>
<div style="display: flex; flex-direction: column; gap: 10px">
<h3 style="margin: 0; font-family: ${fontD}; font-weight: 700; font-size: 26px; line-height: 1.15; letter-spacing: -0.02em">Training, tuning & support</h3>
<p style="margin: 0; color: ${t.muted}; font-size: 16px">We train your team, then stay on hand — in person or remotely, wherever you are.</p>
</div>
<ul style="margin: 0; padding: 18px 0 0; border-top: 1px solid ${t.line}; list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 15px"><li style="display: flex; gap: 10px; align-items: flex-start"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke=${t.accentText} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px"><path d="M20 6L9 17l-5-5"></path></svg>Volunteer & imam training</li><li style="display: flex; gap: 10px; align-items: flex-start"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke=${t.accentText} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px"><path d="M20 6L9 17l-5-5"></path></svg>Remote tuning, UK & worldwide</li><li style="display: flex; gap: 10px; align-items: flex-start"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke=${t.accentText} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px"><path d="M20 6L9 17l-5-5"></path></svg>Maintenance & upgrades</li><li style="display: flex; gap: 10px; align-items: flex-start"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke=${t.accentText} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px"><path d="M20 6L9 17l-5-5"></path></svg>Portable systems for Eid & Ramadan</li></ul>
<a href="services/training-tuning-support.html" style="margin-top: auto; min-height: 48px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 15px; border: 1px solid ${t.line}; color: ${t.ink}">Explore training & support →</a>
</article>
</div>
<div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; background: ${t.bg2}; border-radius: 22px; padding: 20px 26px">
<span style="display: flex; flex-wrap: wrap; gap: 8px 24px; font-size: 15px; font-weight: 600">
<span>Also: video & editing</span><span style="color: ${t.muted}">·</span><span>Minaret speaker upgrades</span><span style="color: ${t.muted}">·</span><span>Portable PA hire</span><span style="color: ${t.muted}">·</span><span>Commercial & residential AV</span>
</span>
<a href="#contact" style="font-weight: 600; color: ${t.accentText}; text-decoration: none; min-height: 44px; display: inline-flex; align-items: center">Ask about something else →</a>
</div>
</div>
</section>


<section id="estimate" style="padding: 72px 32px; background: ${t.bg2}">
<div style="max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 500px), 1fr)); gap: 48px; align-items: start">
<div style="display: flex; flex-direction: column; gap: 32px">
<div style="display: flex; flex-direction: column; gap: 16px">
<span style="font-size: 14px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: ${t.accentText}">System builder</span>
<h2 style="margin: 0; font-family: ${fontD}; font-weight: 800; font-size: clamp(38px, 4.6vw, 68px); line-height: 0.98; letter-spacing: -0.035em">What would your system cost?</h2>
<p style="margin: 0; color: ${t.muted}; font-size: 18px">Two questions. Instant starting price. No email needed.</p>
</div>
<fieldset style="border: 0; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px">
<legend style="font-weight: 600; font-size: 16px; margin-bottom: 14px">1. What's it for?</legend>
<div style="display: flex; flex-wrap: wrap; gap: 10px">
${(spaceOpts||[]).map((o, $index) => html`
<button type="button" onClick=${o.pick} aria-pressed=${o.on} style=${o.style}>${o.label}</button>
`)}
</div>
</fieldset>
<div style="display: flex; flex-direction: column; gap: 14px">
<label for="cap" style="font-weight: 600; font-size: 16px; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap"><span>2. How many people?</span><span style="font-family: ${fontD}; font-weight: 800; font-size: 28px; color: ${t.accentText}">${cap}</span></label>
<input id="cap" type="range" min="20" max="2000" step="10" value=${cap} onInput=${onCap} style="width: 100%; height: 44px" />
<div style="display: flex; justify-content: space-between; font-size: 13px; color: ${t.muted}"><span>20</span><span>${sizeLabel}</span><span>2,000+</span></div>
</div>
</div>

<div style="background: ${t.surface}; border: 1px solid ${t.line}; border-radius: 28px; padding: 36px; display: flex; flex-direction: column; gap: 22px">
<span style="font-size: 13px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: ${t.muted}">We'd recommend</span>
<div>
<h3 style="margin: 0; font-family: ${fontD}; font-weight: 700; font-size: 28px; letter-spacing: -0.02em">${est.name}</h3>
<div style="display: flex; align-items: baseline; gap: 10px; margin-top: 10px"><span style="color: ${t.muted}">from</span><span style="font-family: ${fontD}; font-weight: 800; font-size: 72px; line-height: 1; letter-spacing: -0.03em; color: ${t.accent}">${est.from}</span></div>
</div>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px">
<div>
<div style="font-size: 13px; font-weight: 600; color: ${t.muted}; margin-bottom: 8px">Included</div>
<ul style="margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 6px; font-size: 15px">
${(est.base||[]).map((x, $index) => html`<li>✓ ${x.label}</li>`)}
</ul>
</div>
<div>
<div style="font-size: 13px; font-weight: 600; color: ${t.muted}; margin-bottom: 8px">For your size, ask about</div>
<ul style="margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 6px; font-size: 15px; color: ${t.accentText}">
${(est.addons||[]).map((x, $index) => html`<li>+ ${x.label}</li>`)}
</ul>
</div>
</div>
<p style="margin: 0; font-size: 14px; color: ${t.muted}; border-top: 1px solid ${t.line}; padding-top: 18px">Starting price only. Your final quote depends on the building, and we'll price-match any like-for-like quote.</p>
<div style="display: flex; flex-direction: column; gap: 10px">
<a href=${waQuote} target="_blank" rel="noopener" style="min-height: 56px; display: flex; align-items: center; justify-content: center; gap: 10px; border-radius: 999px; background: ${t.accent}; color: ${t.accentInk}; text-decoration: none; font-weight: 600; font-size: 16px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5z"></path></svg>Send this to us on WhatsApp</a>
<button type="button" onClick=${useForm} style="min-height: 48px; border-radius: 999px; border: 1px solid ${t.line}; background: transparent; color: ${t.ink}; font: inherit; font-weight: 600; font-size: 15px; cursor: pointer">Or add it to the enquiry form</button>
<p style="margin: 0; text-align: center; font-size: 13px; color: ${t.muted}">Your answers are filled in for you, so there's nothing to retype.</p>
</div>
</div>
</div>
</section>


<section style="padding: 72px 32px">
<div style="max-width: 1320px; margin: 0 auto; display: flex; flex-direction: column; gap: 36px">
<h2 style="margin: 0; font-family: ${fontD}; font-weight: 800; font-size: clamp(38px, 4.6vw, 68px); line-height: 0.98; letter-spacing: -0.035em; max-width: 900px">From first call to first salah.</h2>
<ol style="margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 0">
<li style="padding: 28px 24px 28px 0; border-top: 3px solid ${t.accent}; display: flex; flex-direction: column; gap: 10px"><span style="font-family: ${fontD}; font-weight: 800; font-size: 56px; line-height: 1; color: ${t.accent}">01</span><h3 style="margin: 0; font-family: ${fontD}; font-size: 22px; font-weight: 700">Assess</h3><p style="margin: 0; font-size: 15px; color: ${t.muted}">Site visit or video call to map your space and acoustics.</p></li>
<li style="padding: 28px 24px 28px 0; border-top: 3px solid ${t.line}; display: flex; flex-direction: column; gap: 10px"><span style="font-family: ${fontD}; font-weight: 800; font-size: 56px; line-height: 1; color: ${t.muted}">02</span><h3 style="margin: 0; font-family: ${fontD}; font-size: 22px; font-weight: 700">Plan</h3><p style="margin: 0; font-size: 15px; color: ${t.muted}">A clear design and an honest, itemised quote.</p></li>
<li style="padding: 28px 24px 28px 0; border-top: 3px solid ${t.line}; display: flex; flex-direction: column; gap: 10px"><span style="font-family: ${fontD}; font-weight: 800; font-size: 56px; line-height: 1; color: ${t.muted}">03</span><h3 style="margin: 0; font-family: ${fontD}; font-size: 22px; font-weight: 700">Supply</h3><p style="margin: 0; font-size: 15px; color: ${t.muted}">Proven equipment, matched to your budget.</p></li>
<li style="padding: 28px 24px 28px 0; border-top: 3px solid ${t.line}; display: flex; flex-direction: column; gap: 10px"><span style="font-family: ${fontD}; font-weight: 800; font-size: 56px; line-height: 1; color: ${t.muted}">04</span><h3 style="margin: 0; font-family: ${fontD}; font-size: 22px; font-weight: 700">Install</h3><p style="margin: 0; font-size: 15px; color: ${t.muted}">Neat, safe work scheduled around prayer times.</p></li>
<li style="padding: 28px 24px 28px 0; border-top: 3px solid ${t.line}; display: flex; flex-direction: column; gap: 10px"><span style="font-family: ${fontD}; font-weight: 800; font-size: 56px; line-height: 1; color: ${t.muted}">05</span><h3 style="margin: 0; font-family: ${fontD}; font-size: 22px; font-weight: 700">Train</h3><p style="margin: 0; font-size: 15px; color: ${t.muted}">We tune it, train your team and stay on call.</p></li>
</ol>
</div>
</section>


<section id="packages" style="padding: 0 32px 72px">
<div style="max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap: 20px">
<div style="border-radius: 28px; border: 1px solid ${t.line}; padding: 32px; display: flex; flex-direction: column; gap: 14px">
<span style="font-size: 13px; color: ${t.muted}; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase">Mosque sound</span>
<span style="font-family: ${fontD}; font-weight: 800; font-size: 56px; line-height: 1; letter-spacing: -0.03em">£750<span style="font-size: 16px; font-family: ${fontB}; font-weight: 500; color: ${t.muted}"> from</span></span>
<p style="margin: 0; color: ${t.muted}; font-size: 15px">Digital mixer · speakers · amplifier · microphone · installation</p>
<a href="#contact" style="margin-top: auto; min-height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 999px; border: 1px solid ${t.line}; text-decoration: none; font-weight: 600">Get a quote</a>
</div>
<div style="border-radius: 28px; border: 2px solid ${t.accent}; padding: 32px; display: flex; flex-direction: column; gap: 14px; background: ${t.surface}">
<span style="font-size: 13px; color: ${t.accentText}; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase">Event audio & video</span>
<span style="font-family: ${fontD}; font-weight: 800; font-size: 56px; line-height: 1; letter-spacing: -0.03em">£999<span style="font-size: 16px; font-family: ${fontB}; font-weight: 500; color: ${t.muted}"> from</span></span>
<p style="margin: 0; color: ${t.muted}; font-size: 15px">Digital mixer · speakers · amplifiers · microphones · production</p>
<a href="#contact" style="margin-top: auto; min-height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 999px; background: ${t.accent}; color: ${t.accentInk}; text-decoration: none; font-weight: 600">Check my date</a>
</div>
<div style="border-radius: 28px; border: 1px solid ${t.line}; padding: 32px; display: flex; flex-direction: column; gap: 14px">
<span style="font-size: 13px; color: ${t.muted}; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase">Video & editing</span>
<span style="font-family: ${fontD}; font-weight: 800; font-size: 56px; line-height: 1; letter-spacing: -0.03em">£1,099<span style="font-size: 16px; font-family: ${fontB}; font-weight: 500; color: ${t.muted}"> from</span></span>
<p style="margin: 0; color: ${t.muted}; font-size: 15px">Cameras · lighting · production · editing</p>
<a href="#contact" style="margin-top: auto; min-height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 999px; border: 1px solid ${t.line}; text-decoration: none; font-weight: 600">Get a quote</a>
</div>
</div>
</section>


<section id="reviews" style="padding: 72px 32px; background: ${t.bg2}">
<div style="max-width: 1320px; margin: 0 auto; display: flex; flex-direction: column; gap: 36px">

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); gap: 40px; align-items: center">
<div style="display: flex; flex-direction: column; gap: 16px">
<span style="font-size: 14px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: ${t.accentText}">Google reviews</span>
<h2 style="margin: 0; font-family: ${fontD}; font-weight: 800; font-size: clamp(34px, 4vw, 56px); line-height: 1.05; letter-spacing: -0.03em">Masjids from Scotland to Australia trust us.</h2>
</div>
<div style="background: ${t.surface}; border: 1px solid ${t.line}; border-radius: 28px; padding: 28px 32px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px; box-shadow: 0 20px 40px rgba(30,35,80,0.06)">
<div style="display: flex; align-items: center; gap: 20px">
<div style="font-family: ${fontD}; font-weight: 800; font-size: 64px; line-height: 1; letter-spacing: -0.04em">67</div>
<div style="display: flex; flex-direction: column; gap: 4px">
<span style="color: #F2B01E; font-size: 22px; letter-spacing: 3px" role="img" aria-label="5 out of 5 stars">★★★★★</span>
<span style="font-weight: 700; font-size: 16px">Excellent</span>
<span style="font-size: 14px; color: ${t.muted}">Google reviews</span>
</div>
</div>
<div style="display: flex; flex-direction: column; gap: 10px">
<a href="https://www.google.com/search?q=Salah+Sounds+East+Ham+reviews" target="_blank" rel="noopener" style="min-height: 46px; display: inline-flex; align-items: center; justify-content: center; padding: 0 22px; border-radius: 999px; background: ${t.accent}; color: ${t.accentInk}; text-decoration: none; font-weight: 600; font-size: 15px">Read all on Google</a>
<a href="https://www.google.com/search?q=Salah+Sounds+East+Ham+reviews" target="_blank" rel="noopener" style="min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0 22px; border-radius: 999px; border: 1px solid ${t.line}; text-decoration: none; font-weight: 600; font-size: 15px">Leave a review</a>
</div>
</div>
</div>

<figure style="margin: 0; background: ${t.accent}; color: ${t.accentInk}; border-radius: 32px; padding: clamp(32px, 5vw, 56px); display: flex; flex-direction: column; gap: 20px">
<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="opacity: 0.5"><path d="M9.5 6C6.5 6 4 8.6 4 11.8V18h6v-6H7.1c.2-1.9 1.3-3.3 2.4-3.6zM19.5 6C16.5 6 14 8.6 14 11.8V18h6v-6h-2.9c.2-1.9 1.3-3.3 2.4-3.6z"></path></svg>
<blockquote style="margin: 0; font-family: ${fontD}; font-weight: 700; font-size: clamp(24px, 3vw, 40px); line-height: 1.2; letter-spacing: -0.02em; max-width: 1000px">He was so candid that he even listed petrol costs on the invoice just to show us exactly where our money was going.</blockquote>
<figcaption style="display: flex; align-items: center; gap: 14px; font-size: 16px">
<span style="width: 48px; height: 48px; border-radius: 999px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-weight: 700">MR</span>
<span style="line-height: 1.35"><strong>Mizanur Rahman</strong><br /><span style="opacity: 0.85">Chingford Mosque · ★★★★★ on Google</span></span>
</figcaption>
</figure>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr)); gap: 20px; align-items: start">
${(reviews||[]).map((r, $index) => html`
<figure style="margin: 0; background: ${t.surface}; border: 1px solid ${t.line}; border-radius: 24px; padding: 28px; display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; align-items: center; justify-content: space-between; gap: 12px">
<div style="display: flex; align-items: center; gap: 12px">
<span style=${r.avatar}>${r.initials}</span>
<span style="display: flex; flex-direction: column; line-height: 1.3">
<strong style="font-size: 16px">${r.name}</strong>
<span style="font-size: 13px; color: ${t.muted}">${r.where}</span>
</span>
</div>
<span style="font-size: 12px; font-weight: 600; color: ${t.muted}; border: 1px solid ${t.line}; border-radius: 999px; padding: 4px 10px">Google</span>
</div>
<span style="color: #F2B01E; font-size: 17px; letter-spacing: 2px" role="img" aria-label="5 out of 5 stars">★★★★★</span>
<blockquote style=${r.textStyle}>${r.text}</blockquote>
${r.long ? html`
<button type="button" onClick=${r.toggle} aria-expanded=${r.open} style="align-self: flex-start; min-height: 44px; background: none; border: 0; padding: 0; font: inherit; font-weight: 600; font-size: 15px; color: ${t.accentText}; cursor: pointer">${r.more}</button>
` : null}
</figure>
`)}
</div>

</div>
</section>


<section id="giveaway" style="padding: 64px 32px 0">
<div style="max-width: 1320px; margin: 0 auto; border-radius: 36px; background: ${t.accent}; color: ${t.accentInk}; padding: clamp(36px, 6vw, 80px); display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); gap: 32px; align-items: center">
<div style="display: flex; flex-direction: column; gap: 14px">
<span style="font-size: 14px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase">Giveaway · Now open</span>
<h2 style="margin: 0; font-family: ${fontD}; font-weight: 800; font-size: clamp(44px, 6vw, 96px); line-height: 0.92; letter-spacing: -0.04em">Win £10,000 of mosque audio.</h2>
</div>
<div style="display: flex; flex-direction: column; gap: 20px">
<p style="margin: 0; font-size: 19px">One UK masjid will receive a complete professional sound system for Qur'an recitation, khutbah and prayer, installed free of charge.</p>
<div style="display: flex; flex-wrap: wrap; gap: 8px"><span style="font-size: 14px; font-weight: 600; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,0.18)">Free to enter</span><span style="font-size: 14px; font-weight: 600; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,0.18)">No purchase required</span><span style="font-size: 14px; font-weight: 600; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,0.18)">Open to UK mosques</span><span style="font-size: 14px; font-weight: 600; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,0.18)">Winner announced publicly</span></div>
<a href="https://salahsounds.co.uk/10k-mosque-sound-system-giveaway/" style="align-self: flex-start; min-height: 56px; display: inline-flex; align-items: center; padding: 0 30px; border-radius: 999px; background: ${t.accentInk}; color: ${t.accent}; text-decoration: none; font-weight: 700">Nominate your masjid</a>
</div>
</div>
</section>


<section id="work" style="padding: 72px 32px">
<div style="max-width: 1320px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px">
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); gap: 32px; align-items: end">
<div style="display: flex; flex-direction: column; gap: 14px">
<span style="font-size: 14px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: ${t.accentText}">Our work</span>
<h2 style="margin: 0; font-family: ${fontD}; font-weight: 800; font-size: clamp(34px, 4vw, 56px); line-height: 1.05; letter-spacing: -0.03em">Masjids we've transformed</h2>
<p style="margin: 0; color: ${t.muted}; font-size: 18px">Every install is filmed and shared on Instagram, so you can see and hear the difference for yourself.</p>
</div>
<a href="https://www.instagram.com/salahsounds/" style="justify-self: end; text-decoration: none; background: ${t.surface}; border: 1px solid ${t.line}; border-radius: 24px; padding: 20px 24px; display: flex; align-items: center; gap: 18px; flex-wrap: wrap">
<span style="width: 52px; height: 52px; border-radius: 16px; background: linear-gradient(135deg, #4F7FE0, #7A4FC0); display: flex; align-items: center; justify-content: center; flex-shrink: 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="0.6"></circle></svg></span>
<span style="display: flex; flex-direction: column; line-height: 1.3"><strong style="font-family: ${fontD}; font-size: 22px; color: ${t.ink}">15k followers</strong><span style="font-size: 14px; color: ${t.muted}">Our before & after reel: 22K likes</span></span>
<span style="min-height: 44px; display: inline-flex; align-items: center; padding: 0 18px; border-radius: 999px; background: ${t.accent}; color: ${t.accentInk}; font-weight: 600; font-size: 15px">Follow @salahsounds</span>
</a>
</div>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 16px">
<a href="https://www.tiktok.com/@salahsounds/video/7639750724204743958" style="text-decoration: none; background: ${t.surface}; border: 1px solid ${t.line}; border-radius: 24px; padding: 26px 16px 22px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center"><span style="padding: 3px; border-radius: 999px; background: linear-gradient(135deg, #4F7FE0, #7A4FC0); display: block"><img src="img/masjids/york-mosque.jpg" alt="York Mosque install" style="width: 116px; height: 116px; border-radius: 999px; object-fit: cover; display: block; border: 4px solid ${t.surface}" /></span><span style="display: flex; flex-direction: column; gap: 2px"><strong style="font-family: ${fontD}; font-size: 17px; color: ${t.ink}">York Mosque</strong><span style="font-size: 13px; color: ${t.accentText}; font-weight: 600">Hear the before & after →</span></span></a>
<a href="https://www.instagram.com/salahsounds/" style="text-decoration: none; background: ${t.surface}; border: 1px solid ${t.line}; border-radius: 24px; padding: 26px 16px 22px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center"><span style="padding: 3px; border-radius: 999px; background: linear-gradient(135deg, #4F7FE0, #7A4FC0); display: block"><img src="img/masjids/shahjalal.jpg" alt="Shahjalal install" style="width: 116px; height: 116px; border-radius: 999px; object-fit: cover; display: block; border: 4px solid ${t.surface}" /></span><span style="display: flex; flex-direction: column; gap: 2px"><strong style="font-family: ${fontD}; font-size: 17px; color: ${t.ink}">Shahjalal</strong><span style="font-size: 13px; color: ${t.accentText}; font-weight: 600">Watch the install →</span></span></a>
<a href="https://www.instagram.com/salahsounds/" style="text-decoration: none; background: ${t.surface}; border: 1px solid ${t.line}; border-radius: 24px; padding: 26px 16px 22px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center"><span style="padding: 3px; border-radius: 999px; background: linear-gradient(135deg, #4F7FE0, #7A4FC0); display: block"><img src="img/masjids/ukim-medina.jpg" alt="UKIM Medina Masjid install" style="width: 116px; height: 116px; border-radius: 999px; object-fit: cover; display: block; border: 4px solid ${t.surface}" /></span><span style="display: flex; flex-direction: column; gap: 2px"><strong style="font-family: ${fontD}; font-size: 17px; color: ${t.ink}">UKIM Medina Masjid</strong><span style="font-size: 13px; color: ${t.accentText}; font-weight: 600">Watch the install →</span></span></a>
<a href="https://www.instagram.com/salahsounds/" style="text-decoration: none; background: ${t.surface}; border: 1px solid ${t.line}; border-radius: 24px; padding: 26px 16px 22px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center"><span style="padding: 3px; border-radius: 999px; background: linear-gradient(135deg, #4F7FE0, #7A4FC0); display: block"><img src="img/masjids/samr-centre.jpg" alt="Samr Centre install" style="width: 116px; height: 116px; border-radius: 999px; object-fit: cover; display: block; border: 4px solid ${t.surface}" /></span><span style="display: flex; flex-direction: column; gap: 2px"><strong style="font-family: ${fontD}; font-size: 17px; color: ${t.ink}">Samr Centre</strong><span style="font-size: 13px; color: ${t.accentText}; font-weight: 600">Watch the install →</span></span></a>
<a href="https://www.instagram.com/salahsounds/" style="text-decoration: none; background: ${t.surface}; border: 1px solid ${t.line}; border-radius: 24px; padding: 26px 16px 22px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center"><span style="padding: 3px; border-radius: 999px; background: linear-gradient(135deg, #4F7FE0, #7A4FC0); display: block"><img src="img/masjids/nusratul-islam.jpg" alt="Nusratul Islam install" style="width: 116px; height: 116px; border-radius: 999px; object-fit: cover; display: block; border: 4px solid ${t.surface}" /></span><span style="display: flex; flex-direction: column; gap: 2px"><strong style="font-family: ${fontD}; font-size: 17px; color: ${t.ink}">Nusratul Islam</strong><span style="font-size: 13px; color: ${t.accentText}; font-weight: 600">Watch the install →</span></span></a>
<a href="https://www.instagram.com/salahsounds/" style="text-decoration: none; background: ${t.surface}; border: 1px solid ${t.line}; border-radius: 24px; padding: 26px 16px 22px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center"><span style="padding: 3px; border-radius: 999px; background: linear-gradient(135deg, #4F7FE0, #7A4FC0); display: block"><img src="img/masjids/cann-hall.jpg" alt="Cann Hall install" style="width: 116px; height: 116px; border-radius: 999px; object-fit: cover; display: block; border: 4px solid ${t.surface}" /></span><span style="display: flex; flex-direction: column; gap: 2px"><strong style="font-family: ${fontD}; font-size: 17px; color: ${t.ink}">Cann Hall</strong><span style="font-size: 13px; color: ${t.accentText}; font-weight: 600">Watch the install →</span></span></a>
<a href="https://www.instagram.com/salahsounds/" style="text-decoration: none; background: ${t.surface}; border: 1px solid ${t.line}; border-radius: 24px; padding: 26px 16px 22px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center"><span style="padding: 3px; border-radius: 999px; background: linear-gradient(135deg, #4F7FE0, #7A4FC0); display: block"><img src="img/masjids/du-groesbrook.jpg" alt="DU Groesbrook install" style="width: 116px; height: 116px; border-radius: 999px; object-fit: cover; display: block; border: 4px solid ${t.surface}" /></span><span style="display: flex; flex-direction: column; gap: 2px"><strong style="font-family: ${fontD}; font-size: 17px; color: ${t.ink}">DU Groesbrook</strong><span style="font-size: 13px; color: ${t.accentText}; font-weight: 600">Watch the install →</span></span></a>
<a href="https://www.instagram.com/salahsounds/" style="text-decoration: none; background: ${t.surface}; border: 1px solid ${t.line}; border-radius: 24px; padding: 26px 16px 22px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center"><span style="padding: 3px; border-radius: 999px; background: linear-gradient(135deg, #4F7FE0, #7A4FC0); display: block"><img src="img/masjids/high-wycombe.jpg" alt="High Wycombe install" style="width: 116px; height: 116px; border-radius: 999px; object-fit: cover; display: block; border: 4px solid ${t.surface}" /></span><span style="display: flex; flex-direction: column; gap: 2px"><strong style="font-family: ${fontD}; font-size: 17px; color: ${t.ink}">High Wycombe</strong><span style="font-size: 13px; color: ${t.accentText}; font-weight: 600">Watch the install →</span></span></a>
<a href="https://www.instagram.com/salahsounds/" style="text-decoration: none; background: ${t.surface}; border: 1px solid ${t.line}; border-radius: 24px; padding: 26px 16px 22px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center"><span style="padding: 3px; border-radius: 999px; background: linear-gradient(135deg, #4F7FE0, #7A4FC0); display: block"><img src="img/masjids/nottingham.jpg" alt="Nottingham install" style="width: 116px; height: 116px; border-radius: 999px; object-fit: cover; display: block; border: 4px solid ${t.surface}" /></span><span style="display: flex; flex-direction: column; gap: 2px"><strong style="font-family: ${fontD}; font-size: 17px; color: ${t.ink}">Nottingham</strong><span style="font-size: 13px; color: ${t.accentText}; font-weight: 600">Watch the install →</span></span></a>
<a href="https://www.instagram.com/salahsounds/" style="text-decoration: none; background: ${t.surface}; border: 1px solid ${t.line}; border-radius: 24px; padding: 26px 16px 22px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center"><span style="padding: 3px; border-radius: 999px; background: linear-gradient(135deg, #4F7FE0, #7A4FC0); display: block"><span style="width: 116px; height: 116px; border-radius: 999px; border: 4px solid ${t.surface}; background: ${t.bg2}; display: flex; align-items: center; justify-content: center"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke=${t.accent} stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18"></path><path d="M5 21V10l7-6 7 6v11"></path><path d="M9 21v-5h6v5"></path></svg></span></span><span style="display: flex; flex-direction: column; gap: 2px"><strong style="font-family: ${fontD}; font-size: 17px; color: ${t.ink}">Muad Ibn Jabal</strong><span style="font-size: 13px; color: ${t.accentText}; font-weight: 600">Watch the install →</span></span></a>
</div>
<p style="margin: 0; text-align: center; font-size: 15px; color: ${t.muted}">Plus Chingford Mosque, Jamia Masjid Sultania in Nottingham, and masjids in Cumbernauld, the USA and Australia.</p>
<div id="academy" style="border-radius: 28px; border: 1px solid ${t.line}; padding: 36px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 24px">
<div style="max-width: 720px">
<span style="font-size: 13px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: ${t.accentText}">Salah Sounds Academy</span>
<h3 style="margin: 6px 0 6px; font-family: ${fontD}; font-weight: 700; font-size: 30px; letter-spacing: -0.02em">Learn from real installs.</h3>
<p style="margin: 0; color: ${t.muted}">Step-by-step breakdowns of our projects, like the Edmonton Islamic Centre multi-zone audio upgrade, so committees can see how great masjid sound is planned, built and tuned.</p>
</div>
<a href="https://salahsounds.co.uk/academy/" style="min-height: 52px; display: inline-flex; align-items: center; padding: 0 26px; border-radius: 999px; background: ${t.ink}; color: ${t.bg}; text-decoration: none; font-weight: 600">Read the Edmonton case study</a>
</div>
</div>
</section>


<section id="faq" style="padding: 0 32px 72px">
<div style="max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr)); gap: 48px">
<h2 style="margin: 0; font-family: ${fontD}; font-weight: 800; font-size: clamp(38px, 4.6vw, 68px); line-height: 0.98; letter-spacing: -0.035em">Questions committees ask us</h2>
<div style="display: flex; flex-direction: column">
${(faqs||[]).map((f, $index) => html`
<div style="border-top: 1px solid ${t.line}">
<button type="button" onClick=${f.toggle} aria-expanded=${f.open} style="width: 100%; min-height: 72px; display: flex; justify-content: space-between; align-items: center; gap: 16px; background: none; border: 0; color: inherit; font: inherit; font-family: ${fontD}; font-weight: 700; font-size: 21px; text-align: left; cursor: pointer; padding: 18px 0">${f.q}<span style="font-size: 28px; color: ${t.accent}; flex-shrink: 0">${f.icon}</span></button>
${f.open ? html`<p style="margin: 0 0 24px; color: ${t.muted}; max-width: 620px">${f.a}</p>` : null}
</div>
`)}
</div>
</div>
</section>


<section id="contact" style="padding: 0 32px 72px">
<div style="max-width: 1320px; margin: 0 auto; background: #141B2D; color: #F3F5FA; border-radius: 40px; padding: clamp(28px, 5vw, 64px); display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 460px), 1fr)); gap: clamp(32px, 5vw, 64px); position: relative; overflow: hidden">
<div class="stripe" style="position: absolute; left: 0; top: 0; right: 0; height: 6px; background: linear-gradient(90deg, #4F7FE0, #7A4FC0, #4F7FE0)" aria-hidden="true"></div>

<div style="display: flex; flex-direction: column; gap: 28px">
<div style="display: flex; flex-direction: column; gap: 16px">
<span style="font-size: 14px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #A9B4FF">Start your project</span>
<h2 style="margin: 0; font-family: ${fontD}; font-weight: 800; font-size: clamp(38px, 4.6vw, 64px); line-height: 1; letter-spacing: -0.035em">Let's make your masjid <span style="color: #A9B4FF">heard.</span></h2>
<p style="margin: 0; color: #B8C0D4; font-size: 18px; max-width: 480px">Tell us about your space or event. We'll come back with next steps and a ballpark price.</p>
</div>

<div style="display: flex; flex-direction: column; gap: 12px">
<a href="https://wa.me/442038177858" style="text-decoration: none; color: #F3F5FA; background: #1F2840; border: 1px solid #2E3A5C; border-radius: 20px; padding: 18px 20px; display: flex; align-items: center; gap: 16px">
<span style="width: 48px; height: 48px; border-radius: 14px; background: #25D366; display: flex; align-items: center; justify-content: center; flex-shrink: 0"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B2E17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5z"></path></svg></span>
<span style="display: flex; flex-direction: column; line-height: 1.3; flex-grow: 1"><strong style="font-size: 17px">WhatsApp an engineer</strong><span style="font-size: 14px; color: #B8C0D4">Send photos or a video of your current setup</span></span>
<span style="font-size: 12px; font-weight: 700; color: #0B2E17; background: #8FF0B4; padding: 4px 10px; border-radius: 999px; white-space: nowrap">Fastest</span>
</a>
<a href="tel:02038177858" style="text-decoration: none; color: #F3F5FA; background: #1F2840; border: 1px solid #2E3A5C; border-radius: 20px; padding: 18px 20px; display: flex; align-items: center; gap: 16px">
<span style="width: 48px; height: 48px; border-radius: 14px; background: #2E3A5C; display: flex; align-items: center; justify-content: center; flex-shrink: 0"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A9B4FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"></path></svg></span>
<span style="display: flex; flex-direction: column; line-height: 1.3"><strong style="font-family: ${fontD}; font-size: 20px">020 3817 7858</strong><span style="font-size: 14px; color: #B8C0D4">Call the office</span></span>
</a>
<a href="mailto:sales@salahsounds.co.uk" style="text-decoration: none; color: #F3F5FA; background: #1F2840; border: 1px solid #2E3A5C; border-radius: 20px; padding: 18px 20px; display: flex; align-items: center; gap: 16px">
<span style="width: 48px; height: 48px; border-radius: 14px; background: #2E3A5C; display: flex; align-items: center; justify-content: center; flex-shrink: 0"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A9B4FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 7l9 6 9-6"></path></svg></span>
<span style="display: flex; flex-direction: column; line-height: 1.3"><strong style="font-size: 17px">sales@salahsounds.co.uk</strong><span style="font-size: 14px; color: #B8C0D4">Email us plans or drawings</span></span>
</a>
</div>

<div style="display: flex; flex-direction: column; gap: 14px; border-top: 1px solid #2E3A5C; padding-top: 24px">
<span style="font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #B8C0D4">What happens next</span>
<ol style="margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px">
<li style="display: flex; flex-direction: column; gap: 6px"><span style="width: 32px; height: 32px; border-radius: 999px; background: #5A55D6; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px">1</span><span style="font-size: 15px">We reply with a few questions</span></li>
<li style="display: flex; flex-direction: column; gap: 6px"><span style="width: 32px; height: 32px; border-radius: 999px; background: #5A55D6; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px">2</span><span style="font-size: 15px">Site visit or video call</span></li>
<li style="display: flex; flex-direction: column; gap: 6px"><span style="width: 32px; height: 32px; border-radius: 999px; background: #5A55D6; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px">3</span><span style="font-size: 15px">An honest, itemised quote</span></li>
</ol>
<span style="font-size: 14px; color: #8C96AE">Office 6706, 182–184 High Street North, East Ham, London E6 2JA</span>
</div>
</div>

<form id="enquiry" style="background: #FFFFFF; color: #141B2D; border-radius: 28px; padding: clamp(24px, 3.5vw, 40px); display: flex; flex-direction: column; gap: 20px; align-self: start">
<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap">
<h3 style="margin: 0; font-family: ${fontD}; font-weight: 800; font-size: 28px; letter-spacing: -0.02em">Get a free quote</h3>
<span style="font-size: 13px; font-weight: 600; color: #4A45C4; background: #ECEEF7; padding: 6px 12px; border-radius: 999px">No obligation</span>
</div>
<fieldset style="border: 0; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px">
<legend style="font-size: 14px; font-weight: 600; margin-bottom: 10px">What do you need?</legend>
<div style="display: flex; flex-wrap: wrap; gap: 8px">
${(needOpts||[]).map((o, $index) => html`
<button type="button" onClick=${o.pick} aria-pressed=${o.on} style=${o.style}>${o.label}</button>
`)}
</div>
</fieldset>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px">
<label style="display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 600">Your name<input type="text" autocomplete="name" value=${form.name} onInput=${form.setName} placeholder="Yusuf Ahmed" style="min-height: 52px; border-radius: 14px; border: 1px solid #D5DAE8; background: #F6F7FB; color: #141B2D; padding: 0 16px; font: inherit; font-weight: 400" /></label>
<label style="display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 600">Phone / WhatsApp<input type="tel" autocomplete="tel" value=${form.phone} onInput=${form.setPhone} placeholder="07…" style="min-height: 52px; border-radius: 14px; border: 1px solid #D5DAE8; background: #F6F7FB; color: #141B2D; padding: 0 16px; font: inherit; font-weight: 400" /></label>
</div>
<label style="display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 600">Masjid / organisation & town<input type="text" value=${form.org} onInput=${form.setOrg} placeholder="e.g. Baitul Aman, Leicester" style="min-height: 52px; border-radius: 14px; border: 1px solid #D5DAE8; background: #F6F7FB; color: #141B2D; padding: 0 16px; font: inherit; font-weight: 400" /></label>
<label style="display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 600">What's going on with your sound?<textarea rows="5" value=${form.msg} onInput=${form.setMsg} placeholder="Hall size, capacity, current problems, event date…" style="border-radius: 14px; border: 1px solid #D5DAE8; background: #F6F7FB; color: #141B2D; padding: 14px 16px; font: inherit; font-weight: 400; resize: vertical"></textarea></label>
<fieldset style="border: 0; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px">
<legend style="font-size: 14px; font-weight: 600; margin-bottom: 10px">Best way to reach you</legend>
<div style="display: flex; flex-wrap: wrap; gap: 8px">
${(prefOpts||[]).map((o, $index) => html`
<button type="button" onClick=${o.pick} aria-pressed=${o.on} style=${o.style}>${o.label}</button>
`)}
</div>
</fieldset>
<button type="button" onClick=${sendEnquiry} style="min-height: 58px; border-radius: 999px; border: 0; background: #5A55D6; color: #FFFFFF; font: inherit; font-weight: 700; font-size: 17px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px">${sendLabel}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="M13 6l6 6-6 6"></path></svg></button>
<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 18px; font-size: 13px; color: #525C72">
<span>✓ Price-match guarantee</span><span>✓ Rated Excellent on Google</span><span>✓ UK-wide & remote support</span>
</div>
</form>

</div>
</section>


<footer style="padding: 40px 32px; font-size: 14px; color: ${t.muted}">
<div style="max-width: 1320px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 20px">
<img src="img/salah-sounds-logo.png" alt="Salah Sounds Audio Visual" style=${logoFooter} />
<div style="display: flex; gap: 22px; flex-wrap: wrap">
<a href="https://facebook.com" style="text-decoration: none; min-height: 44px; display: inline-flex; align-items: center">Facebook</a>
<a href="https://instagram.com" style="text-decoration: none; min-height: 44px; display: inline-flex; align-items: center">Instagram</a>
<a href="https://tiktok.com" style="text-decoration: none; min-height: 44px; display: inline-flex; align-items: center">TikTok</a>
</div>
<span>© 2026 Salah Sounds Ltd · Company no. 14782349 · <a href="#top">Privacy</a></span>
</div>
</footer>


<a href="https://wa.me/442038177858" aria-label="Chat on WhatsApp" style="position: fixed; right: 24px; bottom: 24px; width: 60px; height: 60px; border-radius: 999px; background: ${t.accent}; color: ${t.accentInk}; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 30px rgba(30,35,80,0.25); z-index: 10">
<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5z"></path></svg>
</a>

</div>`;
}

render(h(Site, {"theme": "Indigo & White", "font": "Plus Jakarta Sans"}), document.getElementById('app'));
