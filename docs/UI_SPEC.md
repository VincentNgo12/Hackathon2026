# MONOGRAPH dashboard implementation specification

## Status and purpose

MONOGRAPH is the selected visual direction for the T'Work It supervisor
dashboard. This document is the authoritative design and implementation brief
for the next frontend milestone.

The next milestone is a **static interactive dashboard prototype**. In this
document, “static” means that the interface may use a fixed local fixture and
client-side preview interactions; it does not mean a flat screenshot. The
prototype should prove the composition, visual system, 3D art direction,
responsive behavior, and key interaction states before the complete telemetry
contract and hardware controls exist.

Every mocked or looping value must be visibly labelled `SIMULATED`. The static
prototype must not imply that hardware actions succeeded, that unavailable
signals are live, or that other workers are monitored.

## Product intent

MONOGRAPH presents the worker as a precision industrial subject in a quiet
observation bay. The screen should feel deliberate, expensive, technical, calm,
and trustworthy. It should suggest premium industrial biomechanics and aerospace
telemetry without becoming a science-fiction HUD.

The primary visual story is the relationship between:

1. four measured orientation anchors;
2. the visually interpolated current posture;
3. the captured neutral/reference posture; and
4. localized contextual risk.

The defining demonstration moment is:

> Neutral calibration establishes a restrained ghost reference. The worker bends,
> the current posture separates visibly from that ghost, and a localized lumbar
> advisory explains the change without turning the entire dashboard red.

The 3D observation bay should command approximately 60–65% of visual attention.
Supporting information should read as one edited instrument column rather than a
wall of interchangeable cards.

## Truthfulness rules

These rules override decorative choices:

- The visualization is a **3D posture approximation**, not measured anatomical
  spinal curvature.
- Four anchors are measured: pelvis, lumbar, thoracic, and upper thoracic. Any
  form between them is visual interpolation.
- The frontend renders backend interpretations. It does not invent safety
  thresholds or derive clinical conclusions from raw values.
- The neutral ghost appears only after calibration is confirmed. In the static
  prototype, a successful countdown must say that it is a design preview and no
  hardware command was sent.
- `RE-CENTER` refers to the posture reference. `RESET VIEW` refers to the camera.
  They must never share an icon or ambiguous label.
- Only `T'Worker 1` is functional. `T'Worker 2` and `T'Worker 3` are visibly
  disabled and labelled `FUTURE`.
- Live, replayed, simulated, stale, and unavailable states must remain visually
  distinguishable.
- Relative noise is not a certified sound-level measurement. EEG alertness is
  experimental and non-diagnostic. Heart rate may be unavailable.
- No decorative waveform, heart trace, sensor reading, or status dot may be
  presented as live unless the active source supplies it.

## Design principles

### One dominant object

The torso/posture visualization is the page's focal point. Supporting panels use
lower contrast, smaller typography, and less motion.

### Calm surfaces, precise information

Use matte surfaces, fine dividers, controlled contrast, and generous negative
space. Depth should come from tonal layering and light, not stacks of floating
glass cards.

### Color carries meaning

Mineral teal identifies current posture, selection, and healthy connectivity.
Amber, orange, and red appear only when their semantic state requires them.

### Explain the measurement model

The four anchors should be identifiable without making the display resemble a
development debugger. A user may reveal more technical labels through an overlay
control.

### Preserve the stage

Alerts, connection changes, and panel updates should not resize or displace the
3D hero during a demonstration.

## Reference viewport and layout system

Design and review the first static implementation at these sizes:

| Viewport | Purpose |
| --- | --- |
| `1440 × 900` | Primary reference and likely demo laptop composition |
| `1280 × 720` | Minimum laptop demo check |
| `1920 × 1080` | Large display check; content must not become excessively sparse |
| `1024 × 768` | Compact/tablet landscape behavior |
| `390 × 844` | Small-screen status fallback, not a full worker application |

Use a fluid app shell with a maximum content width near `1600px`, centered on
larger displays. At the primary viewport, use approximately `24px` outer padding,
`16px` major gaps, and a twelve-column grid.

The main workspace uses an asymmetric split:

- observation bay: eight grid columns, approximately two-thirds of the width;
- instrument rail: four grid columns, approximately one-third of the width; and
- event ledger: below the observation bay, aligned to its width.

The primary desktop composition is:

```text
+--------------------------------------------------------------------------+
| Brand   Worker selector      System/source status             Overall risk|
+--------------------------------------------------+-----------------------+
|                                                  | POSTURE               |
|                                                  | State                 |
|              3D OBSERVATION BAY                  | Flexion / lateral     |
|                                                  | Sustained / impact    |
|        neutral ghost        current posture      +-----------------------+
|              :                   /               | ENVIRONMENT           |
|              :                 [o] shoulder      | Climate               |
|              :                [o] thoracic       | Air                   |
|              :               [o] lumbar          | Workplace             |
|              :              [o] pelvis           +-----------------------+
|                                                  | PHYSIOLOGY + SYSTEM   |
|  Approximation · 4 measured anchors              | Heart · devices       |
|  [Front] [Side] [Orbit] [Reset view] [Overlays] +-----------------------+
|  [CALIBRATE POSTURE]  Re-center                  | EEG · EXPERIMENTAL    |
+--------------------------------------------------+ waveform / quality    |
| RECENT EVENTS                                    | artifact / alertness  |
| time  severity  event  source                    |                       |
+--------------------------------------------------+-----------------------+
| Prototype status and data provenance                                     |
+--------------------------------------------------------------------------+
```

Avoid placing information over the moving torso. Controls may occupy a dedicated
bottom region inside the observation bay, but their contrast and pointer targets
must remain independent of the WebGL canvas.

## Page anatomy

### 1. Application header

The header is a single calm horizontal band, approximately `64–72px` tall on
desktop. It has four semantic groups:

1. brand and prototype context;
2. worker selector;
3. system/source status; and
4. overall risk.

#### Brand block

- Primary label: `T'WORK IT`
- Secondary label: `NATHACKS 2026 · SUPERVISOR CONSOLE`
- Keep the brand compact. It should not compete with the worker identity or 3D
  hero.

#### Worker selector

Use a segmented text control rather than large tabs:

- `T'Worker 1` — selected, keyboard focusable, with a restrained accent underline;
- `T'Worker 2` — disabled, label `FUTURE`;
- `T'Worker 3` — disabled, label `FUTURE`.

Disabled workers must not show status dots, live timestamps, hover affordance, or
fake metrics. Their accessible label should include `planned, unavailable`.

#### System/source summary

Show a compact summary such as:

`SIMULATED · SYSTEM NOMINAL · UPDATED NOW`

The source label must have greater persistence than a temporary toast. On compact
screens, source and system state may wrap beneath the worker selector.

#### Overall risk

Use a label/value lockup:

```text
OVERALL RISK
MODERATE
```

The classification is `LOW`, `MODERATE`, `ELEVATED`, or `HIGH`. Do not show a
decimal score. The risk block should use text and an indicator shape in addition
to color.

### 2. Observation bay

The observation bay is a single uninterrupted visual stage. It should not look
like a conventional dashboard card.

#### Surface

- Use the darkest raised surface in the interface, one tonal step above the page
  background.
- Prefer a subtle `1px` keyline and a modest `12px` corner radius.
- Do not use blurred glass, frosted panels, reflected gradients, or strong drop
  shadows.
- A gentle radial lift behind the torso may help silhouette readability. It must
  be nearly imperceptible.

#### Observation label

Top-left copy inside the bay:

```text
POSTURE OBSERVATION
T'Worker 1 · four measured anchors
```

Top-right may carry a small `SIMULATED` source tag and the current camera view.

#### Canvas allocation

At `1440 × 900`, the canvas region should be approximately `560–620px` tall. The
torso should occupy roughly 65–75% of canvas height with enough breathing room for
side labels and orbit.

Keep HTML controls and text outside the canvas when practical. This improves
accessibility, reduces raycasting complexity, and keeps the rendering layer
focused on geometry.

### 3. Camera and inspection controls

Place view controls along the lower-left edge of the bay, above the calibration
actions:

- `FRONT`
- `SIDE`
- `ORBIT`
- `RESET VIEW`
- `OVERLAYS`
- optional `INSPECT` for the compact side-projection inset

Use small rectangular buttons with visible selected state. Avoid unlabeled icon
buttons for these controls.

Behavior for the static prototype:

- `FRONT` and `SIDE` move between fixed presets;
- `ORBIT` enables constrained manual orbit;
- `RESET VIEW` returns to the default rear three-quarter preset;
- `OVERLAYS` toggles anchor names and selected posture annotation;
- `INSPECT` opens a compact side-projection inset, closed by default.

Camera transitions should take about `350–450ms` and use smooth deterministic
easing. Alerts must never force a camera transition.

### 4. Calibration actions

Place these below the view controls:

- primary action: `CALIBRATE POSTURE`;
- secondary text action: `RE-CENTER`.

For the static prototype, calibration is a visual interaction preview:

1. user selects `CALIBRATE POSTURE`;
2. an in-bay modal says `Stand naturally upright`;
3. a large `3`, `2`, `1` countdown appears;
4. status changes to `Preview complete`;
5. supporting copy says `Static design preview — no hardware command sent`;
6. the neutral ghost resolves into view; and
7. an event is appended locally as `Neutral reference previewed` with source
   `SIMULATED`.

The production interaction must wait for backend confirmation and use the copy
`Neutral posture captured`. Do not use that success language in a disconnected
static prototype.

`RE-CENTER` in the static prototype may repeat the preview flow. It must not reset
the camera.

### 5. Instrument rail

The right rail is one continuous instrument surface divided into four sections:

1. posture and movement;
2. environment;
3. physiology and system;
4. EEG.

Each section uses a thin internal divider rather than its own floating card.
Section headings should align to one shared left edge. Use consistent label/value
rows and intentional group spacing.

At the primary viewport, the rail should be close in height to the observation
bay plus event ledger. It should feel edited rather than densely packed.

### 6. Event ledger

Place a concise event ledger immediately below the observation bay. It should
contain three to five events and must not become a general telemetry log.

Desktop row structure:

```text
14:34:16  ADVISORY  Sustained lumbar flexion  00:42  SIMULATED
```

Show:

- timestamp;
- severity;
- short event label;
- optional duration or context; and
- source/provenance.

The newest active event appears first. Cleared events are quieter but remain
readable. Critical events may remain pinned until acknowledged in a later
functional milestone; the static prototype only needs to demonstrate the visual
state.

### 7. Provenance footer

Use a short, quiet footer:

`Prototype telemetry · simulated data · posture visualization is an approximation`

Do not hide this in a tooltip.

## Detailed 3D art direction

### Visual model

The first implementation should use procedural or repository-local geometry so
the design does not depend on an external model download or uncertain licensing.
The body is a stylized observation object, not a realistic human avatar.

Build the visual in five layers:

1. grounding field;
2. torso shell;
3. neutral/reference path;
4. current posture path and risk sleeves;
5. measured anchors and optional annotations.

### Grounding field

Use a soft elliptical shadow or low-contrast floor ring beneath the pelvis. This
gives scale without creating a full 3D room. Avoid grids extending to the horizon,
particles, fog banks, stars, or animated scanning effects.

### Torso shell

The shell should imply a shoulder-to-pelvis back volume:

- symmetrical at neutral;
- wider near the shoulders and ribcage;
- narrower at the waist;
- subtly tapered into a pelvis/root form;
- abstract enough that visual interpolation does not look anatomically exact.

A practical procedural direction is a low-poly loft or a set of smoothed
elliptical cross-sections. A simple sculpted local model is also acceptable if it
remains lightweight and license-safe.

Material intent:

- smoked graphite or dark ceramic;
- roughness high enough to avoid a glossy game asset;
- low metallic value;
- limited opacity only where needed to reveal the path;
- depth-tested, with no additive glow through the whole body.

Prefer a mostly opaque silhouette with a narrow translucent spinal channel or a
subtle back cutaway. A fully transparent torso creates clutter and makes the
spine harder to read.

The shell may respond to the four anchor transforms through a lightweight
segment/ring deformation. It does not need production-quality skinning for the
static milestone. The priority is a clean silhouette during forward and lateral
bending.

### Current posture path

The current path is the most legible 3D line in the scene:

- continuous from pelvis to upper thoracic;
- mineral teal in normal/moderate conditions;
- visually thicker than the neutral ghost;
- smoothly interpolated through the four measured anchor positions;
- no individual vertebra geometry;
- no pulsing emissive effect during ordinary operation.

For future telemetry, quaternion interpolation may smooth render motion between
samples. The interpolation is visual only and must not create additional measured
anchors or feed back into posture classification.

For the static fixture, use a mild forward flexion with a small lateral offset so
the current path is visibly different from neutral without looking extreme.

### Neutral/reference ghost

The reference should remain visible when enabled and be distinguishable without
color:

- cool gray;
- thinner than the current path;
- dashed, segmented, or intermittently marked;
- lower opacity;
- registered to the same pelvis/root origin; and
- labelled `NEUTRAL REFERENCE` in the legend.

Do not apply bloom to the neutral path. The user should immediately understand
that it is a reference, not a second live worker.

### Measured IMU anchors

Show four anchors as compact collars or faceted nodes along the current path.
Avoid large glowing spheres.

Anchor order and labels:

1. `PELVIS / ROOT`
2. `LUMBAR`
3. `THORACIC`
4. `UPPER THORACIC`

Default state:

- all four anchors are visible;
- markers are small and solid;
- labels are hidden to preserve the hero silhouette.

Overlay or selection state:

- selected marker gains a thin outer ring;
- its name appears through a short leader;
- corresponding posture row highlights in the right rail; and
- other anchors remain visible at lower emphasis.

Anchor selection is the main borrowed interaction from the DATUM concept. It
should communicate that the visualization is grounded in four sensors.

### Localized risk treatment

Risk belongs to the affected segment, not the entire body.

- advisory: a restrained amber sleeve around the relevant path segment;
- warning: a stronger orange sleeve plus one concise annotation;
- critical impact/fall: a red incident marker at the event location when known,
  paired with the persistent incident strip; and
- normal: no green halo around the entire worker.

Use a semi-transparent outer tube or short bracket rather than recoloring the
whole torso. A lumbar posture advisory should leave thoracic and environmental
regions visually calm.

### Lighting

Use a restrained three-light setup:

- broad soft key from upper front/side;
- dim fill to preserve dark-surface detail;
- narrow cool rim from the opposite side to separate the torso from background.

The scene should remain readable with bloom disabled. If subtle postprocessing is
later added, it must not be required for comprehension or introduce a dependency
during the static milestone.

### Camera

Default view: rear three-quarter, slightly above pelvis height, aimed toward the
thoracic center. Avoid dramatic wide-angle distortion.

Suggested behavior:

- perspective camera in the approximate `35–45°` field-of-view range;
- constrained orbit and zoom;
- no pan in normal mode;
- no automatic rotation while telemetry moves;
- front and side presets preserve subject scale; and
- reset returns to the exact default framing.

The side view should make forward flexion and the neutral/current separation
especially clear. The optional `INSPECT` inset may show a fixed orthographic side
projection, but it must remain closed by default.

### Performance targets

For the static milestone:

- target a stable `60fps` on the demo laptop and remain usable at `30fps`;
- keep geometry and materials simple;
- avoid real-time shadows if they create instability;
- cap device pixel ratio around `1.5–2` when necessary;
- pause or reduce rendering when the tab is hidden; and
- do not require physics, skeletal simulation, or continuous scene allocation.

## Instrument rail content

### Posture and movement

The posture section should have the strongest hierarchy in the rail.

Header:

```text
POSTURE
ADVISORY · sustained lumbar flexion
```

Recommended rows:

| Label | Static fixture | Presentation |
| --- | ---: | --- |
| Lumbar flexion | `18.4°` | primary posture number |
| Thoracic flexion | `12.7°` | supporting value |
| Lateral bend | `5.2° L` | supporting value; direction included |
| Sustained | `00:42` | monospaced duration |
| Impact / fall | `NORMAL` | explicit state, no decorative alarm |

If a field is not present in the current telemetry contract, the static view
model may supply it as simulated fixture content. It must remain visibly within a
simulated prototype and must not be added to the production telemetry interface
implicitly.

Clicking a posture row may select the corresponding 3D segment. Use highlight,
underline, or a small side marker; do not animate the entire row.

### Environment

Use three semantic groups, not seven equal cards.

#### Climate

- `22.4 °C`
- `42% RH`

Present these as a paired line with shared `CLIMATE` label.

#### Air

- `AQI 2 · GOOD` as a visual fixture representing the intended ENS160 category;
- `eCO₂ 510 ppm`;
- `TVOC 38 ppb`.

The current backend uses placeholder AQI values with a different scale. Astra
must keep the static fixture inside the mock view model and must not silently
reinterpret the production field. Final ENS160 mapping remains a data-contract
task.

#### Workplace

- `61 dB rel.` for relative noise trend;
- `320 lux` for ambient light.

Use the exact qualifier `RELATIVE` or `rel.` with noise. A short sparkline is
acceptable if it is visibly simulated. Avoid a microphone waveform that resembles
stored speech.

### Physiology and system

Use one compact section split by a vertical or horizontal divider.

Physiology fixture:

- heart rate: `76 bpm`;
- no ECG line;
- no SpO2 in the default static design.

System fixture:

- `ESP32  CONNECTED`;
- `OpenBCI  CONNECTED`;
- `IMUs  4 / 4`;
- `Calibration  PREVIEWED` in the static design or `CAPTURED` only with backend
  confirmation;
- `Battery  —` when unavailable; and
- source tag: `SIMULATED`.

Use small status glyphs with text. Do not depend on red/green dots alone.

### EEG

EEG occupies the lowest section of the rail and should feel alive without
competing with the 3D worker.

Panel content:

- title: `EEG · EXPERIMENTAL`;
- source tag: `SIMULATED` or `REPLAY`;
- one or two fine scrolling traces for the static prototype;
- alertness estimate: `74%`;
- signal quality: `91% · GOOD`;
- artifact status: `CLEAR` or a plainly labelled artifact interval.

Visual treatment:

- use a dark inset surface one tonal step below the rail;
- traces use a desaturated version of the primary accent;
- line width should remain fine and non-luminous;
- horizontal guides may be extremely subtle;
- avoid spectrogram rainbows and medical-monitor styling; and
- stop trace movement and display `STALE` when the source is stale.

The static waveform should be deterministic and loop cleanly. It must be labelled
`SIMULATED`. Do not use random noise generated every frame, which looks unstable
and makes screenshots inconsistent.

## Static fixture and view model

The first design implementation should isolate mock content in one typed fixture
or view-model layer. Visual components should receive display-ready values rather
than import the fixture directly. This allows the same components to consume the
Zustand/WebSocket state later.

Recommended default visual state:

| Group | Value |
| --- | --- |
| Worker | `T'Worker 1` |
| Source | `SIMULATED` |
| System | `NOMINAL` |
| Overall risk | `MODERATE` |
| Active alert | `ADVISORY · sustained lumbar flexion` |
| ESP32 / OpenBCI | `CONNECTED / CONNECTED` |
| IMUs | `4 / 4` |
| Calibration | `PREVIEWED` for static mode |
| Battery | unavailable, display `—` |
| Fall state | `NORMAL` |
| Heart rate | `76 bpm` |
| EEG alertness / quality | `74% / 91%` |

Recommended event rows:

1. `14:34:16 · ADVISORY · Sustained lumbar flexion · 00:42 · SIMULATED`
2. `14:33:34 · NORMAL · Neutral reference previewed · SIMULATED`
3. `14:33:12 · SYSTEM · Four posture anchors available · SIMULATED`

Use a fixed reference time in screenshots rather than the user's local clock.
This makes visual review deterministic. The eventual live implementation may use
real timestamps from `WorkerTelemetry`.

## Alerts and overall risk

Alert severity and overall risk are related but distinct. Do not assume that an
advisory forces overall risk to a particular category; display the values supplied
by the backend/view model.

| Alert state | Local treatment | Page-level treatment |
| --- | --- | --- |
| `NORMAL` | no risk sleeve; ordinary labels | neutral header and event ledger |
| `ADVISORY` | thin amber segment sleeve; one concise explanation | amber severity marker in posture section |
| `WARNING` | stronger orange segment bracket/sleeve | persistent warning row above event ledger |
| `CRITICAL` | red incident marker and affected segment emphasis | fixed incident strip below header; newest event pinned |

For critical state:

- do not flash the background;
- do not shake the viewport;
- do not move the camera;
- do not recolor unrelated environment or EEG values; and
- keep the current worker visible while the incident is read.

Severity copy should state the observed context, for example `Strong impact
detected`, rather than a legal or medical conclusion.

## Color system

The following tokens lock the initial visual direction. Astra may tune individual
values slightly to improve contrast, but should preserve their relationships.

| Token | Suggested value | Use |
| --- | --- | --- |
| `bg-canvas` | `#090D0F` | page background |
| `bg-observation` | `#0D1316` | 3D observation bay |
| `bg-instrument` | `#11181C` | instrument rail |
| `bg-inset` | `#0A1013` | EEG and compact inset areas |
| `line-subtle` | `#243037` | separators and keylines |
| `line-strong` | `#35434A` | selected boundaries and focus support |
| `text-primary` | `#E7ECE9` | main labels and values |
| `text-secondary` | `#9CA9A5` | supporting labels |
| `text-muted` | `#65736F` | inactive and tertiary copy |
| `accent` | `#73CFC1` | current posture, selection, healthy connection |
| `accent-bright` | `#A5E7DC` | selected anchor and limited emphasis |
| `reference` | `#768289` | neutral ghost and reference labels |
| `advisory` | `#D8B35A` | advisory |
| `warning` | `#E58449` | warning |
| `critical` | `#E75B5B` | critical |

Use color proportions roughly as follows:

- 80–85% neutral surfaces and text;
- 10–15% accent/reference information; and
- less than 5% risk color during ordinary/advisory operation.

Do not use saturated green for every normal metric. The accent already carries
healthy/current meaning. Risk colors should remain readable with color-vision
deficiency by pairing them with text, icons, patterns, or line styles.

Verify actual foreground/background combinations during implementation. Tokens
are a starting palette, not a waiver from contrast testing.

## Typography

Use only open-source or system-safe typography. Do not rely on a network font at
demo time.

Preferred combination:

- interface and headings: `Inter`, falling back to `system-ui`, `Segoe UI`, and
  sans-serif;
- numeric values and technical annotations: `IBM Plex Mono`, falling back to
  `ui-monospace`, `SFMono-Regular`, `Consolas`, and monospace.

If font files are added later, self-host them. The initial static implementation
may use the fallbacks without adding a dependency.

Suggested hierarchy:

| Role | Size | Weight / treatment |
| --- | ---: | --- |
| Brand | `22–24px` | 650, tight tracking |
| Overall risk value | `24–30px` | 600, uppercase |
| Observation title | `18–20px` | 550 |
| Section title | `11–12px` | 600, uppercase, `0.12em` tracking |
| Primary metric | `24–30px` | mono, 500–600 |
| Secondary metric | `14–16px` | mono, 500 |
| Body/copy | `13–14px` | 400–500 |
| Technical annotation | `11–12px` | mono, uppercase where helpful |

Avoid body text below `12px`. Use tabular numerals for values and timers. Keep
units visually quieter than numbers but large enough to read during a demo.

## Spacing, shape, and graphic language

Use a `4px` base spacing rhythm with common steps of `8`, `12`, `16`, `24`, `32`,
and `48px`.

- major layout gap: `16px`;
- rail section padding: approximately `18–20px`;
- observation bay padding: approximately `20–24px` around HTML chrome;
- desktop outer padding: approximately `24px`;
- compact outer padding: `16px`;
- small-screen outer padding: `12px`.

Shape:

- primary surfaces: `10–12px` corner radius;
- controls: `6–8px` radius;
- small status tags may use a restrained pill shape;
- avoid making every row and metric a pill or separate rounded rectangle.

Graphic elements:

- use one-pixel dividers;
- avoid double borders and heavy shadows;
- use short rules and alignment to group information;
- keep background grids almost invisible or omit them; and
- icons should be simple line icons or geometric status marks. Do not require a
  new icon package for the static milestone.

## Motion language

Motion should communicate state and preserve orientation.

### Timing

| Interaction | Duration |
| --- | ---: |
| Hover/focus response | `100–140ms` |
| Panel/content transition | `180–240ms` |
| Alert entry | `200–280ms` |
| Camera preset | `350–450ms` |
| Calibration ghost resolve | `450–650ms` |

Use an ease-out curve for UI entrances and a symmetric smooth curve for camera
motion. Avoid spring bounce, elastic overshoot, and sequential animation that
delays access to data.

### Specific behavior

- Page entrance: one short opacity/vertical resolve for the shell and torso; do
  not animate every metric separately.
- Number updates: change in place with tabular width; no slot-machine rolling.
- Alert transitions: one entry motion, then remain still.
- Ambient motion: the camera remains fixed; the static torso may have an almost
  imperceptible breathing/light drift only if it cannot be mistaken for measured
  motion.
- 3D movement: smooth and responsive, with no spring overshoot.
- Hover: increase keyline or label contrast, not scale.
- Click/selection: selected anchor gains a ring and linked row emphasis.
- Reduced motion: remove entrance displacement, camera interpolation, waveform
  scrolling, and decorative drift; preserve immediate state changes.

## Responsive behavior

### Wide desktop: `≥ 1440px`

- centered content with maximum width;
- 8/4 observation/rail split;
- full event ledger under observation bay;
- all system summary items visible in header.

### Laptop: `1280–1439px`

- preserve 8/4 split;
- tighten rail spacing and observation chrome;
- keep canvas at least about `520px` tall where viewport height allows;
- shorten nonessential explanatory copy before reducing metric legibility.

### Compact landscape: `900–1279px`

- use a 7/5 split or stack the rail beneath the hero if usable rail width would
  fall below roughly `320px`;
- worker selector may move to a second header row;
- hide the optional inspect inset by default;
- event ledger may use condensed rows.

### Tablet/portrait: `680–899px`

- stack: header, observation bay, active alert, posture, environment,
  physiology/system, EEG, event ledger, footer;
- hero remains the first major content block;
- camera controls wrap but retain text labels;
- instrument sections remain one continuous rail surface where possible.

### Small screen: `< 680px`

This is a supervisor status fallback, not a complete worker-facing app.

- show worker identity, source, connection, overall risk, active alert, and a
  shorter 3D/status hero;
- stack all details below;
- omit the side-projection inset and detailed anchor labels;
- preserve calibration and reset-view label distinction; and
- allow horizontal waveform clipping within its own region, never at page level.

No supported layout should introduce horizontal page scrolling.

## Loading, stale, and failure states

### Before first sample

- preserve the final layout dimensions;
- render the observation bay with a subdued neutral silhouette or simple anchor
  placeholders;
- show `WAITING FOR TELEMETRY`;
- use em dashes for unavailable values; and
- do not start the EEG waveform.

### Connecting

Show `CONNECTING` with a restrained progress indicator. Do not cycle through
invented metrics.

### Simulated or replay

Show the source in the header, relevant panel, and event provenance. Avoid a
transient-only notification.

### Stale subsystem

- freeze the last value only if accompanied by a visible `STALE` label and age;
- stop related animation;
- dim the affected anchor or panel, not the entire dashboard; and
- preserve other live subsystems.

### Disconnected

- keep the page structure and last event context;
- mark data unavailable/stale rather than current;
- show the reconnection state in the header; and
- keep static fallback switching outside the main visual hierarchy.

### Partial/mixed source

If posture is live and EEG is replayed, each panel must show its own provenance.
Do not summarize the entire page as `LIVE`.

### Missing heart rate or battery

Show `—` and `UNAVAILABLE`; do not show zero. Collapse neither row during the
demo, because layout shifts would distract from the hero.

## Accessibility and input behavior

- Use semantic headings, buttons, lists, and definition lists for non-canvas
  information.
- All controls must be keyboard reachable with a clear focus indicator.
- Disabled worker selectors need an accessible explanation.
- Provide an accessible text summary adjacent to the canvas, for example:
  `Posture approximation: moderate forward lumbar flexion; fall state normal;
  four anchors available.`
- Canvas interaction must not trap keyboard or pointer focus.
- Do not rely on color alone for severity, connection, selection, or reference
  distinction.
- Maintain readable contrast for labels and values.
- Target at least `44 × 44px` pointer areas for primary touch controls, even when
  the visible treatment is smaller.
- Respect `prefers-reduced-motion`.
- Tooltips must not contain information unavailable elsewhere.
- The EEG panel and 3D scene should have concise descriptive labels; avoid trying
  to expose every visual primitive to assistive technology.

## Suggested frontend component boundaries

These names are recommendations, not required source filenames. The important
goal is to prevent one monolithic dashboard component.

```text
AppShell
├── SupervisorHeader
│   ├── BrandBlock
│   ├── WorkerSelector
│   ├── SystemSourceSummary
│   └── OverallRisk
├── MonographWorkspace
│   ├── ObservationBay
│   │   ├── PostureScene3D
│   │   ├── SceneLegend
│   │   ├── ViewControls
│   │   ├── CalibrationControls
│   │   └── CalibrationPreview
│   ├── InstrumentRail
│   │   ├── PostureSection
│   │   ├── EnvironmentSection
│   │   ├── PhysiologySystemSection
│   │   └── EegSection
│   └── EventLedger
└── ProvenanceFooter
```

Inside the 3D scene, separate responsibilities conceptually:

```text
PostureScene3D
├── ObservationLighting
├── GroundingField
├── TorsoShell
├── NeutralReference
├── CurrentPosturePath
├── SegmentRiskSleeves
├── ImuAnchors
└── CameraRig
```

Keep the view-model transformation outside these presentational components.
Eventually it should map `WorkerTelemetry` and UI state into stable display
props. The static fixture should implement the same boundary.

## Implementation constraints for Astra

The current frontend already has Vite, React, TypeScript, Three.js, React Three
Fiber, Drei, and Zustand. The static MONOGRAPH design can be implemented with
those dependencies plus ordinary CSS and SVG.

- Do not migrate to Next.js or add another web framework.
- Do not add a physics engine.
- Do not require Tailwind, shadcn/ui, Framer Motion, Recharts, or uPlot for the
  first static pass.
- Prefer CSS transitions, SVG for the deterministic EEG trace, and R3F/Drei for
  the observation scene.
- Do not fetch remote 3D models, textures, fonts, or runtime assets for the demo.
- Keep static mock data in one explicit fixture/view-model module.
- Preserve the existing WebSocket/Zustand path, even if the MONOGRAPH static
  fixture temporarily supplies display fields the current contract lacks.
- Do not silently change telemetry semantics to satisfy the mock design.
- Reuse the existing four quaternion inputs when wiring the current path and
  anchor orientation.
- Keep heavy posture interpretation outside the frontend.

## Recommended implementation sequence

### Phase 1: static composition

1. Build the app shell, header, 8/4 workspace, rail, event ledger, and footer.
2. Implement design tokens, typography, spacing, and responsive breakpoints.
3. Add deterministic static fixture values and source labels.
4. Verify the composition at all reference viewport sizes.

### Phase 2: observation scene

1. Establish camera, grounding field, lighting, and torso shell.
2. Add neutral and current posture paths.
3. Replace large spheres with compact anchor collars/nodes.
4. Add localized lumbar advisory treatment.
5. Add view presets, reset, constrained orbit, and overlay selection.
6. Add the optional side-projection inset only after the primary view is clear.

### Phase 3: signature interactions

1. Link anchor selection to posture rows.
2. Implement the honest static calibration preview.
3. Add deterministic EEG waveform motion and reduced-motion behavior.
4. Add normal, advisory, warning, and critical visual preview states.

### Phase 4: telemetry integration

1. Map existing `WorkerTelemetry` fields into the view model.
2. Preserve explicit unavailable states for missing target fields.
3. Connect quaternion data to the four measured anchors.
4. Add freshness/provenance when the backend contract supports it.
5. Connect real calibration controls only after a backend command and
   acknowledgement interface exists.

## Static milestone acceptance criteria

### Composition and visual quality

- The 3D worker/posture scene is unmistakably the primary focal point.
- The interface reads as one observation bay plus one instrument rail, not a grid
  of equal cards.
- Current and neutral posture are distinguishable without relying only on color.
- The four measured anchors are visible and can be identified through overlays.
- The torso looks intentional at `1280 × 720` and `1440 × 900`.
- The visual system remains calm in normal and advisory states.

### Product completeness

- Header includes brand, worker selector, persistent source, system state, and
  overall risk.
- Workers 2 and 3 are clearly disabled and labelled future.
- Posture includes flexion, lateral bend, sustained duration, and impact/fall
  state in the static fixture.
- Environment includes temperature, humidity, AQI, eCO2, TVOC, relative noise,
  and light.
- Physiology shows heart rate and an honest unavailable state.
- System shows ESP32, OpenBCI, IMU count, calibration status, and battery if
  available.
- EEG includes deterministic simulated waveform, alertness, signal quality,
  artifact state, and source label.
- Event ledger shows source and severity.

### Interaction

- Front, side, orbit, reset-view, and overlay controls are distinct and usable.
- Selecting an anchor links it to relevant posture information.
- Static calibration preview never claims a hardware capture.
- Re-center and reset-view have distinct behavior and labels.
- Alert states do not move the camera or obscure the worker.
- Keyboard focus and reduced-motion behavior work.

### Responsive and resilient behavior

- No horizontal page scroll appears at supported sizes.
- The hero remains ahead of secondary data when stacked.
- Missing values display `—` or `UNAVAILABLE`, not zero.
- Loading, simulated, stale, and disconnected states preserve layout.
- Source/provenance remains visible in mixed or fallback states.

### Technical quality

- The frontend production build and lint pass.
- The scene remains responsive on the demo laptop.
- Mock content is isolated from presentation components.
- The implementation introduces no medical/anatomical claims or fake live
  workers.

## Explicit exclusions for the static milestone

The static design pass does not need to implement:

- real calibration commands or persistence;
- full target `WorkerTelemetry` evolution;
- BrainFlow or raw EEG acquisition;
- real event persistence or acknowledgement;
- production alert thresholds or risk computation;
- anatomical vertebrae, medical curvature analysis, or accurate yaw;
- working multi-worker switching;
- a physics engine;
- a production-quality skinned human model; or
- a worker-facing mobile application.

## Final visual review questions

Before accepting the static design, reviewers should be able to answer “yes” to
all of the following:

1. Can a judge identify the worker and current risk within three seconds?
2. Does the current posture visibly separate from the neutral reference?
3. Can a judge see that exactly four anchors are measured?
4. Does the torso feel like a premium technical object rather than an anatomical
   claim or game character?
5. Is an advisory localized and calm while a critical event remains unmistakable?
6. Are environment, physiology, EEG, and system health legible without competing
   with the 3D hero?
7. Are simulated/replay/unavailable states impossible to mistake for live data?
8. Are Workers 2 and 3 clearly future affordances rather than fake monitored
   people?
9. Does the dashboard still look composed when heart rate, battery, or EEG is
   unavailable?
10. Would the five-minute demo remain understandable if the presenter stopped
    speaking for ten seconds?
