---
layout: demo
title: "Time Reversal Clock"
categories: Zzz
description: "Freeze! Reverse!"
tags: Tech Zzz
---
<script>
function SetSize() {
    $('#demo').height('' + 720 + 'px');
    $('#demo').width('' + 1280 + 'px');
}

$(document).ready(function() {
  SetSize();
});
</script>
<script src="{{ site.url }}/code/clock/matter.js"></script>
<script src="{{ site.url }}/code/clock/lodash.min.js"></script>
<script src="{{ site.url }}/code/clock/leds.js"></script>
<script src="{{ site.url }}/code/clock/demo.js"></script>
