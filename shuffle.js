// SYNAPSIS — rotate the order within co-facilitator pairs
//
// People who share a session are listed as a pair. Whoever is written first in
// the HTML would otherwise be first for ever, which quietly implies a ranking
// that does not exist. This rotates the order within each group marked
// data-pair="<key>", leaving the surrounding structure — keynotes, hosts,
// sessions A to D, synthesis — exactly where it is, because that order is how
// a visitor finds their own session.
//
// The order is seeded by the date, not by chance: it is stable for a whole day
// and changes overnight. Reloading the page does not reshuffle it under the
// reader, and two people looking on the same day see the same page.
(function () {
    'use strict';

    // Deterministic 32-bit hash, so a given (key, day) always gives one answer.
    function hash(str) {
        var h = 2166136261;
        for (var i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;   // imul: plain * loses the low bits past 2^53
        }
        return h;
    }

    function dayNumber() {
        return Math.floor(Date.now() / 86400000);
    }

    function rotate() {
        var cards = document.querySelectorAll('[data-pair]');
        if (!cards.length) return;

        // Collect the members of each group, in document order.
        var groups = {};
        for (var i = 0; i < cards.length; i++) {
            var key = cards[i].getAttribute('data-pair');
            (groups[key] = groups[key] || []).push(cards[i]);
        }

        var day = dayNumber();

        Object.keys(groups).forEach(function (key) {
            var members = groups[key];
            if (members.length < 2) return;
            var parent = members[0].parentNode;
            for (var i = 1; i < members.length; i++) {
                if (members[i].parentNode !== parent) return;   // never reorder across containers
            }

            // Seeded Fisher-Yates. Two-member groups reduce to a coin flip,
            // but this keeps working if a session ever gains a third person.
            var seed = hash(key + ':' + day);
            var order = members.slice();
            for (var j = order.length - 1; j > 0; j--) {
                seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
                var k = (seed >>> 16) % (j + 1);   // high bits: the LCG's low bit just alternates
                var tmp = order[j]; order[j] = order[k]; order[k] = tmp;
            }

            // Re-append in the new order. Appending an existing node moves it,
            // so this is a reorder, not a duplication.
            var anchor = members[members.length - 1].nextSibling;
            for (var m = 0; m < order.length; m++) {
                parent.insertBefore(order[m], anchor);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', rotate);
    } else {
        rotate();
    }
})();
