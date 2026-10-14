import React, { useEffect, useRef } from 'react';
import { api } from '../services/api';

const isInput = (el) => {
  if (!el) return false;
  const t = el.tagName;
  return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || el.isContentEditable;
};

const SecureExamWrapper = ({ sessionId, children, onViolation, onTerminated, isSubmitting }) => {
  const done = useRef(false);
  const sid = useRef(sessionId);
  const sub = useRef(isSubmitting);
  const viol = useRef(onViolation);
  const term = useRef(onTerminated);

  sid.current = sessionId;
  sub.current = isSubmitting;
  viol.current = onViolation;
  term.current = onTerminated;

  useEffect(() => {
    console.log('[ANTI-CHEAT] Mounted, sessionId:', sessionId);
    if (!sessionId) return;

    done.current = false;

    const trigger = async (reason) => {
      console.log('[ANTI-CHEAT] TRIGGERED:', reason, { done: done.current, sid: sid.current });
      if (done.current || !sid.current) return;
      done.current = true;
      viol.current?.(reason);
      try { await api.reportViolation(sid.current, reason); } catch (_) {}
      term.current?.('Fraude : ' + reason);
    };

    const onVis = () => {
      if (document.hidden && !sub.current) {
        console.log('[ANTI-CHEAT] visibilitychange -> hidden');
        trigger('changement onglet');
      }
    };
    document.addEventListener('visibilitychange', onVis);

    const onBlur = () => {
      if (!sub.current) {
        console.log('[ANTI-CHEAT] window blur');
        trigger('perte focus fenetre');
      }
    };
    window.addEventListener('blur', onBlur);

    window.history.pushState(null, '', window.location.href);
    const onPop = () => {
      console.log('[ANTI-CHEAT] popstate');
      if (!sub.current) trigger('navigation navigateur');
    };
    window.addEventListener('popstate', onPop);

    const onClick = (e) => {
      const a = e.target.closest('a');
      if (a && a.href && a.getAttribute('href') !== '#') {
        console.log('[ANTI-CHEAT] link click:', a.href);
        e.preventDefault();
        e.stopPropagation();
        if (!sub.current) trigger('clic lien');
      }
    };
    document.addEventListener('click', onClick, true);

    const onBefore = (e) => {
      if (!sub.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBefore);

    const ctx = (e) => { if (!isInput(e.target)) e.preventDefault(); };
    document.addEventListener('contextmenu', ctx);
    const copy = (e) => { if (!isInput(e.target)) e.preventDefault(); };
    document.addEventListener('copy', copy);
    document.addEventListener('cut', copy);
    const onPaste = (e) => e.preventDefault();
    document.addEventListener('paste', onPaste);
    const onKey = (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.ctrlKey && e.key === 'u')) e.preventDefault();
    };
    document.addEventListener('keydown', onKey);

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    const onFS = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && !sub.current) {
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
      }
    };
    document.addEventListener('fullscreenchange', onFS);
    document.addEventListener('webkitfullscreenchange', onFS);

    return () => {
      console.log('[ANTI-CHEAT] Cleanup');
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('popstate', onPop);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('beforeunload', onBefore);
      document.removeEventListener('contextmenu', ctx);
      document.removeEventListener('copy', copy);
      document.removeEventListener('cut', copy);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFS);
      document.removeEventListener('webkitfullscreenchange', onFS);
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    };
  }, [sessionId]);

  return <div style={{ minHeight: '100vh', position: 'relative' }}>{children}</div>;
};

export default SecureExamWrapper;
