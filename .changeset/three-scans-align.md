---
'@nanisoft/prism-ui': patch
---

Align `PulseSeries`'s scan reticle with the columns it reads

The wash behind the reticle stopped short of the baseline while its own line
crossed it, and the line rode inside the wash at a third of its width rather
than at its centre. The wash is now one column slot wide and the line runs
down its centre, so at every instant the wash covers exactly the column the
line is crossing, and both shapes meet the baseline. The travel is the plot's
own width, so the reticle enters and leaves aligned with the columns' field
and its opacity ramps are spent on the margins beside the end columns.
