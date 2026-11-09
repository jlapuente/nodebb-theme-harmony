WNO Alyx theme for NodeBB
====================

WNO Alyx is an independent NodeBB theme with a technical HUD aesthetic inspired
by Half-Life: Alyx. It is a fork of
[Harmony 3.3.15](https://github.com/NodeBB/nodebb-theme-harmony), originally
developed by Julian Lam, Baris Soner Usakli and the NodeBB contributors, under
the MIT license. Original contributor metadata is retained in the package.

- Package and theme ID: `nodebb-theme-wno-alyx`
- Display name: **WNO Alyx**
- Independent version: **1.0.0**
- NodeBB compatibility: **^4.16.0**

Harmony is not a runtime dependency. Both packages may be installed, but only
one theme should be active. Official Harmony updates do not replace WNO Alyx.
This fork must be maintained separately when NodeBB or Harmony changes.

## Alyx-inspired interface

The default (no Bootswatch skin) appearance uses a technical HUD aesthetic inspired
by Half-Life: Alyx: graphite panels in dark mode, warm paper surfaces in light
mode, amber highlights, cyan details, a subtle grid and compact navigation.
It uses the bundled fonts and CSS only; no game assets or external requests are
required. Existing translations, category colours and forum controls are retained.

Select the default skin in the skin switcher to use the Alyx appearance.
It starts in dark mode. Use the Light/Dark buttons in the desktop skin switcher
or the mobile navigation menu to choose a mode explicitly. The choice is saved
in a first-party `wno-alyx-color-mode` cookie for one year, scoped to this NodeBB
installation, and restored before the page is painted. The preference is local
to the browser, not synchronised to a user account.

Alternate Bootswatch skins remain available and keep their own appearance;
the colour-mode buttons are hidden while one is selected. Choosing a dark
Bootswatch skin is not equivalent to selecting the Alyx dark palette.
Keyboard focus indicators and reduced-motion preferences are supported.

After installing or updating the theme in a NodeBB installation, run
`./nodebb build` from the **NodeBB root**, then restart NodeBB and refresh the
browser to load the rebuilt assets. This repository is a theme, not a standalone
forum application.

## Packaging and deployment

From this repository on Windows:

```powershell
npm.cmd pack
```

Upload `nodebb-theme-wno-alyx-1.0.0.tgz` to the server. From the **NodeBB root**,
install that file using the NodeBB service account:

```text
npm install <absolute-path-to-nodebb-theme-wno-alyx-1.0.0.tgz>
```

In the admin control panel, open Appearance > Themes and activate **WNO Alyx**,
not Harmony. Build with `node nodebb build`, restart NodeBB with your usual
service manager, and hard-refresh the browser. The repository folder itself
does not need to be renamed. Do not copy this theme over Harmony's directory.

The package is marked `private` to prevent accidental npm publication;
`npm pack` and installation from the resulting archive still work.
Old `.tgz` archives are excluded from new packages.
For subsequent releases, increment the version with `npm.cmd version patch --no-git-tag-version`,
then pack, upload, install, rebuild and restart again.

Run `npm.cmd test` for package identity, routes, settings isolation and
colour-mode namespace regression checks, and `npm.cmd run lint` for JavaScript
linting. A complete forum build must still run in the target NodeBB installation.

## Settings and migration from the customised Harmony package

- Admin page and settings namespace: `wno-alyx` (`/admin/plugins/wno-alyx`).
- User theme preferences: `/user/<userslug>/wno-alyx`, stored as
  `wnoAlyx_<setting>` rather than Harmony's unprefixed user keys.
- Light/dark preference: `wno-alyx-color-mode` cookie, separate from the
  earlier customised Harmony cookie.
- Fonts are served from `plugins/nodebb-theme-wno-alyx`.

This is a new theme, not an in-place Harmony settings migration. Existing
Harmony settings and its cookie are not modified or automatically copied.
Review your settings in WNO Alyx after activation; its defaults include dark
mode and collapsed sidebars. Existing forum content is not changed.
Generic `themes/harmony:*` translation keys are intentionally reused from
NodeBB core, not from an installed Harmony package.

If Harmony was previously replaced by the customised archive, it can remain
installed alongside WNO Alyx. Restore the official Harmony package separately
if you want an unmodified fallback; do not uninstall it as part of this migration.

The screenshots below show the original Harmony appearance, not WNO Alyx.

## Issues

Issues for this fork are tracked in
[this repository](https://github.com/jlapuente/nodebb-theme-harmony/issues).

## Screenshots

### Categories

_The cards in the header are added by the recent cards plugin. https://github.com/NodeBB-Community/nodebb-plugin-recent-cards_

<img height="450" src="screenshots/categories.png">

### Category

<img height="450" src="screenshots/category.png">

### Recent
<img height="450" src="screenshots/recent.png">

### Topic
<img height="450" src="screenshots/topic.png">
