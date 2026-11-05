/* Ms Trang Trieu Education — IELTS READING: Cô giáo Titi result card + filler-answer guard.
   Presentation only. It reads the score the app already shows after the server has graded
   the attempt, and never changes answers, scores or submissions.
   Must load BEFORE the app bundle so window.TTFiller exists when the answered-counter runs. */
(function () {
  'use strict';
  if (window.__ttReading) return; window.__ttReading = true;

  /* ---- Filler answers ("...", "???", "xxx", "k biết") count as blank ---- */
  var FILL_WORDS = ['k biet', 'ko biet', 'kh biet', 'khong biet', 'kbiet', 'kb', 'chiu', 'bo qua', 'idk', 'dunno', 'no idea', 'skip', 'pass', 'asdf', 'qwerty', 'abcd', 'xyz', 'blank', 'null', 'undefined'];
  var ROMAN = /^(i{1,3}|iv|vi{0,3}|ix|xi{0,2})$/i;
  function flat(v) { return String(v).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function isFiller(v) {
    var t = String(v == null ? '' : v).trim();
    if (!t) return false;
    if (!/[\p{L}\p{N}]/u.test(t)) return true;
    if (ROMAN.test(t)) return false;
    var p = flat(t);
    if (FILL_WORDS.indexOf(p) >= 0) return true;
    return /^(.)\1{2,}$/.test(p.replace(/ /g, ''));
  }
  window.TTFiller = window.TTFiller || { isFiller: isFiller };

  var TITI = '/ielts-full-test/assets/titi/';
  var BAND = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [0, 0]];
  function band(s) { for (var i = 0; i < BAND.length; i++) if (s >= BAND[i][0]) return BAND[i][1]; return 0; }
  function fb(b) { return b % 1 ? b.toFixed(1) : b + '.0'; }
  function mood(p) {
    return p >= 0.8 ? ['top', 'Xuất sắc! Em đọc rất chắc tay — cô Titi tự hào lắm!']
      : p >= 0.6 ? ['good', 'Làm tốt lắm! Xem lại câu sai để lên band tiếp nào.']
      : p >= 0.4 ? ['good', 'Cố lên nhé! Đọc kỹ trích đoạn ở câu sai, em sẽ tiến bộ nhanh.']
      : ['calm', 'Không sao đâu! Đọc lại bằng chứng từng câu, lần sau sẽ khác.'];
  }

  var css = '' +
    '.tt-card{display:grid;grid-template-columns:minmax(140px,190px) 1fr;margin:0 0 18px;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 10px 30px -12px rgba(7,21,53,.35);border:1px solid #e3e6ee;text-align:left;color:#0b1238}' +
    '.tt-side{background:linear-gradient(160deg,#141c52,#0b1238 70%);color:#fff;padding:14px 12px 0;display:flex;flex-direction:column;align-items:center}' +
    '.tt-bubble{background:#fff;color:#0b1238;font-weight:800;font-size:13px;line-height:1.35;padding:8px 11px;border-radius:14px;text-align:center;position:relative}' +
    '.tt-bubble:after{content:"";position:absolute;left:50%;bottom:-7px;margin-left:-7px;border:7px solid transparent;border-bottom:0;border-top-color:#fff}' +
    '.tt-titi{height:200px;max-width:100%;object-fit:contain;margin-top:8px;filter:drop-shadow(0 8px 10px rgba(0,0,0,.35))}' +
    '.tt-name{font-size:11px;letter-spacing:.16em;color:#f2b51c;font-weight:800;margin:4px 0 10px}' +
    '.tt-main{padding:18px 20px;display:flex;flex-direction:column;gap:14px}' +
    '.tt-head{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:baseline}' +
    '.tt-title{font-size:13px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#5f6877;margin:0}' +
    '.tt-band{font-size:13px;font-weight:800;background:#fff6dc;border:1px solid #f4d983;border-radius:999px;padding:4px 12px}.tt-band b{font-size:18px}' +
    '.tt-body{display:flex;align-items:center;gap:24px;flex-wrap:wrap}' +
    '.tt-ring{position:relative;width:150px;height:150px;flex:none}.tt-ring svg{width:100%;height:100%;transform:rotate(-90deg)}.tt-ring circle{fill:none;stroke-width:13}' +
    '.tt-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}' +
    '.tt-center b{font-size:30px;font-weight:900;line-height:1}.tt-center span{font-size:12px;font-weight:700;color:#5f6877;margin-top:4px}' +
    '.tt-legend{list-style:none;margin:0;padding:0;display:grid;gap:10px;min-width:150px}' +
    '.tt-legend li{display:flex;align-items:center;gap:10px;font-size:14px;color:#3b4660}.tt-legend i{width:12px;height:12px;border-radius:50%}.tt-legend strong{margin-left:auto;color:#0b1238}' +
    '.tt-tip{margin:0;font-size:13.5px;line-height:1.5;color:#3b4660;background:#f6f8fc;border-radius:12px;padding:10px 12px}' +
    '.tt-filler-input{outline:2px solid #e0533d!important;background:#fff4f1!important}' +
    '.tt-filler-bar{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:9999;background:#0b1238;color:#fff;font-weight:700;font-size:14px;padding:10px 16px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.3);pointer-events:none;max-width:calc(100vw - 32px);text-align:center}' +
    '.tt-filler-bar b{color:#f2b51c}' +
    '@media (max-width:640px){.tt-card{grid-template-columns:1fr}.tt-side{flex-direction:row;gap:10px;padding:12px 12px 0}.tt-titi{height:120px}.tt-name{display:none}.tt-bubble{flex:1}.tt-bubble:after{display:none}}';

  function ring(c, w) {
    var R = 62, C = 2 * Math.PI * R, tot = Math.max(1, c + w), off = 0, out = '<circle cx="75" cy="75" r="' + R + '" stroke="#eef1f6"/>';
    [[c, '#1f9d6b'], [w, '#e0533d']].forEach(function (x) {
      if (!x[0]) return; var len = C * x[0] / tot, gap = tot > x[0] ? 2.5 : 0;
      out += '<circle cx="75" cy="75" r="' + R + '" stroke="' + x[1] + '" stroke-dasharray="' + Math.max(0, len - gap) + ' ' + C + '" stroke-dashoffset="' + (-off) + '"/>'; off += len;
    });
    return '<svg viewBox="0 0 150 150" aria-hidden="true">' + out + '</svg>';
  }

  function card(right, total, isFull) {
    var wrong = Math.max(0, total - right), m = mood(right / Math.max(1, total));
    var el = document.createElement('section');
    el.className = 'tt-card'; el.setAttribute('aria-label', 'Kết quả cùng cô Titi');
    el.innerHTML =
      '<div class="tt-side"><div class="tt-bubble">' + m[1] + '</div>' +
      '<img class="tt-titi" alt="Cô giáo Titi" src="' + TITI + 'titi-' + m[0] + '.webp"><div class="tt-name">Cô giáo Titi</div></div>' +
      '<div class="tt-main"><div class="tt-head"><p class="tt-title">Kết quả Reading' + (isFull ? ' · Full test' : '') + '</p>' +
      (total === 40 ? '<span class="tt-band">Band ước tính <b>' + fb(band(right)) + '</b></span>' : '') + '</div>' +
      '<div class="tt-body"><div class="tt-ring">' + ring(right, wrong) + '<div class="tt-center"><b>' + right + '/' + total + '</b><span>câu đúng</span></div></div>' +
      '<ul class="tt-legend"><li><i style="background:#1f9d6b"></i>Đúng<strong>' + right + ' câu</strong></li>' +
      '<li><i style="background:#e0533d"></i>Chưa đúng<strong>' + wrong + ' câu</strong></li></ul></div>' +
      '<p class="tt-tip">' + (wrong ? 'Cô Titi gợi ý: mở từng câu <b>chưa đúng</b>, đọc trích đoạn chứa thông tin rồi tự tìm lại từ khoá trong bài trước khi xem giải thích.' : 'Trọn điểm! Em vẫn nên đọc lại giải thích để chắc mình đúng nhờ hiểu, không phải nhờ may mắn.') + '</p></div>';
    return el;
  }

  function score(text) { var m = String(text || '').match(/(\d+)\s*\/\s*(\d+)/); return m ? [+m[1], +m[2]] : null; }

  function tick() {
    // Passage lesson: <div class="result-summary"><h2>N/K</h2>
    var sum = document.querySelector('.result-summary');
    if (sum && !sum.previousElementSibling?.classList?.contains('tt-card')) {
      var s = score(sum.querySelector('h2') && sum.querySelector('h2').textContent);
      if (s) sum.parentNode.insertBefore(card(s[0], s[1], false), sum);
    }
    // Full test: after grading the toolbar timer shows "KẾT QUẢ N/40" and a reflection box appears.
    var refl = document.querySelector('.full-reflection');
    if (refl && !refl.previousElementSibling?.classList?.contains('tt-card')) {
      var t = document.querySelector('.full-test-toolbar .timer');
      var s2 = t && /KẾT QUẢ/i.test(t.textContent) ? score(t.querySelector('b') && t.querySelector('b').textContent) : null;
      if (s2) refl.parentNode.insertBefore(card(s2[0], s2[1], true), refl);
    }
  }

  var bar = null;
  function onInput(e) {
    var el = e.target; if (!el || el.tagName !== 'INPUT' || el.type === 'hidden') return;
    var bad = isFiller(el.value); el.classList.toggle('tt-filler-input', bad);
    var any = document.querySelector('.tt-filler-input');
    if (any && !bar) { bar = document.createElement('div'); bar.className = 'tt-filler-bar'; bar.innerHTML = 'Câu trả lời kiểu <b>"…", "???", "xxx"</b> được tính là <b>bỏ trống</b> — em chưa nộp được bài.'; document.body.appendChild(bar); }
    if (!any && bar) { bar.remove(); bar = null; }
  }

  function start() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    document.addEventListener('input', onInput, true);
    new MutationObserver(tick).observe(document.body, { childList: true, subtree: true, characterData: true });
    tick();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
