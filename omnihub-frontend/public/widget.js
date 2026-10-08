(function loadOmniHubWidget() {
  'use strict';

  var currentScript = document.currentScript;
  if (!currentScript) {
    console.error('OmniHub widget: the embed script must be loaded with a script tag.');
    return;
  }
  if (document.getElementById('omnihub-website-chat-frame')) return;

  var config = window.OmniHubConfig || {};
  if (typeof config.apiKey !== 'string' || !/^ohw_[a-f0-9]{48}$/.test(config.apiKey)) {
    console.error('OmniHub widget: configure a valid apiKey using window.OmniHubConfig.');
    return;
  }

  var scriptUrl = new URL(currentScript.src, window.location.href);
  var hostOrigin = scriptUrl.origin;
  var frameUrl = new URL('/widget?embed=1', hostOrigin);
  frameUrl.searchParams.set('parentOrigin', window.location.origin);
  var frame = document.createElement('iframe');
  frame.id = 'omnihub-website-chat-frame';
  frame.title = 'OmniHub customer support chat';
  frame.setAttribute('aria-label', 'OmniHub customer support chat');
  frame.setAttribute('allow', 'clipboard-write');
  frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  frame.setAttribute('scrolling', 'no');
  frame.style.cssText = [
    'position:fixed',
    'z-index:2147483000',
    'bottom:0',
    config.position === 'bottom-left' ? 'left:0' : 'right:0',
    'width:80px',
    'height:80px',
    'max-width:100vw',
    'max-height:100dvh',
    'border:0',
    'background:transparent',
    'overflow:hidden',
    'color-scheme:normal',
    'transition:width .2s ease,height .2s ease',
  ].join(';');
  frame.src = frameUrl.href;
  (document.body || document.documentElement).appendChild(frame);

  function sendConfig() {
    if (!frame.contentWindow) return;
    frame.contentWindow.postMessage({
      source: 'omnihub-embed',
      type: 'configure',
      config: {
        apiKey: config.apiKey,
        primaryColor: config.primaryColor || '#3478e5',
        secondaryColor: config.secondaryColor || '#f1f5ff',
        textColor: config.textColor || '#1f2e44',
        position: config.position === 'bottom-left' ? 'bottom-left' : 'bottom-right',
        size: ['small', 'medium', 'large'].indexOf(config.size) >= 0 ? config.size : 'medium',
        language: ['English', 'Hindi', 'Hinglish'].indexOf(config.language) >= 0 ? config.language : 'English',
        welcomeMessage: typeof config.welcomeMessage === 'string' ? config.welcomeMessage : 'Hi! How can we help you today?',
        offlineMessage: typeof config.offlineMessage === 'string' ? config.offlineMessage : "We're offline right now. Leave a message and our team will get back to you.",
        avatarUrl: typeof config.avatarUrl === 'string' ? config.avatarUrl : '',
        soundNotification: Boolean(config.soundNotification),
        offlineMode: Boolean(config.offlineMode),
        businessHours: config.businessHours || null,
      },
    }, hostOrigin);
  }

  function resize(open, size) {
    var compact = {
      small: { width: 320, height: 510 },
      medium: { width: 370, height: 590 },
      large: { width: 420, height: 660 },
    }[size] || { width: 370, height: 590 };
    if (!open) {
      frame.style.width = '80px';
      frame.style.height = '80px';
      frame.style.bottom = '0';
      frame.style.left = config.position === 'bottom-left' ? '0' : 'auto';
      frame.style.right = config.position === 'bottom-left' ? 'auto' : '0';
      return;
    }
    if (window.innerWidth < 520 || window.innerHeight < 560) {
      frame.style.width = '100vw';
      frame.style.height = '100dvh';
      frame.style.bottom = '0';
      frame.style.right = '0';
      frame.style.left = '0';
      return;
    }
    frame.style.width = Math.min(compact.width, window.innerWidth - 24) + 'px';
    frame.style.height = Math.min(compact.height, window.innerHeight - 24) + 'px';
    frame.style.bottom = '12px';
    frame.style.left = config.position === 'bottom-left' ? '12px' : 'auto';
    frame.style.right = config.position === 'bottom-left' ? 'auto' : '12px';
  }

  window.addEventListener('message', function onWidgetMessage(event) {
    if (event.source !== frame.contentWindow || event.origin !== hostOrigin) return;
    var message = event.data;
    if (!message || message.source !== 'omnihub-widget') return;
    if (message.type === 'ready') sendConfig();
    if (message.type === 'resize') resize(Boolean(message.open), message.size);
    if (message.type === 'notify' && config.soundNotification) {
      try {
        var AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextConstructor) return;
        var audio = new AudioContextConstructor();
        var oscillator = audio.createOscillator();
        var gain = audio.createGain();
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.frequency.value = 740;
        gain.gain.setValueAtTime(0.08, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.18);
        oscillator.start();
        oscillator.stop(audio.currentTime + 0.18);
        oscillator.onended = function closeAudio() { audio.close(); };
      } catch (error) {
        console.warn('OmniHub widget: sound notification could not be played.', error);
      }
    }
  });

  window.addEventListener('resize', function resizeOpenWidget() {
    if (frame.style.width !== '80px') resize(true, config.size);
  });
}());
