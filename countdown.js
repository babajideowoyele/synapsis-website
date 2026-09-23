// SYNAPSIS event countdown
//
// Drives any element carrying data-countdown, using the start/end instants on
// that element. It is phase-aware on purpose: it counts down beforehand, says
// the event is running while it runs, and reports it as past afterwards. That
// means nobody has to remember to edit the page on the morning of the event,
// and the site can never show a negative countdown.
//
// Markup contract:
//   <span data-countdown
//         data-start="2026-10-19T09:00:00+02:00"
//         data-end="2026-10-19T17:30:00+02:00"
//         data-compact>19 October 2026</span>
//
// The text inside the element is the no-JS fallback — write a sensible date
// there, because that is what a reader sees if this script never runs.
//
// Anything marked data-countdown-when="upcoming|live|past" is shown only in
// that phase, so a Register button can retire itself once the day has passed.
(function () {
    'use strict';

    var MINUTE = 60000;

    function instant(el, name) {
        var raw = el.getAttribute(name);
        if (!raw) return null;
        var t = Date.parse(raw);
        return isNaN(t) ? null : t;
    }

    function count(n, word) {
        return n + ' ' + word + (n === 1 ? '' : 's');
    }

    // Whole units only. "3 days" reads better than "2 days 23 hours" for a date
    // weeks away; the detail matters only as the event gets close.
    function remaining(ms, compact) {
        var minutes = Math.floor(ms / MINUTE);
        var days = Math.floor(minutes / 1440);
        var hours = Math.floor((minutes % 1440) / 60);
        var mins = minutes % 60;

        if (days >= 7 || (days >= 1 && compact)) return count(days, 'day') + ' to go';
        if (days >= 1) return count(days, 'day') + ', ' + count(hours, 'hour') + ' to go';
        if (hours >= 1) return count(hours, 'hour') + ', ' + count(mins, 'minute') + ' to go';
        if (minutes >= 1) return count(minutes, 'minute') + ' to go';
        return 'Starting now';
    }

    function phaseOf(now, start, end) {
        if (now < start) return 'upcoming';
        if (end && now < end) return 'live';
        return 'past';
    }

    function longDate(t) {
        var d = new Date(t);
        try {
            return d.toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam'
            });
        } catch (e) {
            return d.getUTCDate() + '/' + (d.getUTCMonth() + 1) + '/' + d.getUTCFullYear();
        }
    }

    function applyVisibility(phase) {
        var gated = document.querySelectorAll('[data-countdown-when]');
        for (var i = 0; i < gated.length; i++) {
            var wanted = gated[i].getAttribute('data-countdown-when').split(/\s+/);
            var show = wanted.indexOf(phase) !== -1;
            gated[i].hidden = !show;
        }
    }

    function render(els, now) {
        var soonest = Infinity;
        var phase = 'past';

        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var start = instant(el, 'data-start');
            if (start === null) continue;
            var end = instant(el, 'data-end');
            var compact = el.hasAttribute('data-compact');
            var p = phaseOf(now, start, end);

            if (p === 'upcoming') {
                el.textContent = remaining(start - now, compact);
                soonest = Math.min(soonest, start - now);
                phase = 'upcoming';
            } else if (p === 'live') {
                el.textContent = compact ? 'Happening today' : 'Happening now';
                soonest = Math.min(soonest, MINUTE);
                phase = 'live';
            } else {
                el.textContent = 'Took place on ' + longDate(start);
            }
        }
        applyVisibility(phase);
        return soonest;
    }

    function start() {
        var els = document.querySelectorAll('[data-countdown]');
        if (!els.length) return;

        // Screen readers should not announce every tick; the surrounding copy
        // already carries the date.
        for (var i = 0; i < els.length; i++) {
            els[i].setAttribute('aria-live', 'off');
            els[i].style.fontVariantNumeric = 'tabular-nums';
        }

        (function tick() {
            var left = render(els, Date.now());
            if (left === Infinity) return;               // nothing left to count
            // Tick per second only in the last hour, otherwise on the minute.
            var every = left <= 60 * MINUTE ? 1000 : MINUTE;
            setTimeout(tick, every);
        })();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
