'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const readJSON = file => JSON.parse(read(file));
const userTemplate = read('templates/account/wno-alyx.tpl');
const userKeys = [...userTemplate.matchAll(/name="(wnoAlyx_[^"]+)"/g)].map(match => match[1]);

function loadLibrary({ themeSettings = {}, userSettings = {} } = {}) {
	const calls = { namespaces: [], routes: [] };
	const controllers = { renderAdminPage() {}, renderThemeSettings() {} };
	const dependencies = {
		os: { cpus: () => [] },
		nconf: { get: () => false },
		'./src/meta': {
			settings: {
				get: async (namespace) => {
					calls.namespaces.push(namespace);
					return themeSettings;
				},
			},
		},
		'./src/user': { getSettings: async () => userSettings },
		'./src/routes/helpers': {
			setupAdminPageRoute: (router, route) => calls.routes.push(route),
			setupPageRoute: (router, route) => calls.routes.push(route),
		},
	};
	const context = {
		module: { exports: {} },
		nodebb: {
			require: (name) => {
				assert(Object.hasOwn(dependencies, name), `Unexpected NodeBB dependency: ${name}`);
				return dependencies[name];
			},
		},
		require: (name) => {
			assert.equal(name, './lib/controllers');
			return controllers;
		},
	};
	vm.runInNewContext(read('library.js'), context, { filename: 'library.js' });
	return { library: context.module.exports, calls };
}

test('package identity, entrypoints and font URLs are independent of Harmony', () => {
	const pkg = readJSON('package.json');
	const plugin = readJSON('plugin.json');
	const theme = readJSON('theme.json');
	const lock = readJSON('package-lock.json');
	assert.equal(pkg.name, 'nodebb-theme-wno-alyx');
	assert.equal(plugin.id, pkg.name);
	assert.equal(theme.id, pkg.name);
	assert.equal(theme.name, 'WNO Alyx');
	assert.equal(lock.name, pkg.name);
	assert.equal(lock.packages[''].name, pkg.name);
	assert.equal(lock.version, pkg.version);
	assert.equal(lock.packages[''].version, pkg.version);
	assert.equal(pkg.dependencies['nodebb-theme-harmony'], undefined);
	for (const file of [pkg.main, ...plugin.scripts, ...Object.values(plugin.modules)]) {
		assert(fs.existsSync(path.join(root, file)), `Missing package entrypoint: ${file}`);
	}
	for (const [moduleName, file] of Object.entries(plugin.modules)) {
		const name = moduleName.replace('../client/', 'forum/').replace('../admin/', 'admin/').replace(/\.js$/, '');
		assert(read(file).includes(`define('${name}'`), `AMD module mismatch: ${name}`);
	}
	assert(read('theme.scss').includes('./scss/wno-alyx'));
	assert(read('scss/fonts.scss').includes('./plugins/nodebb-theme-wno-alyx'));
	assert(!read('scss/fonts.scss').includes('./plugins/nodebb-theme-harmony'));
});

test('routes, navigation and hook handlers point to WNO Alyx', async () => {
	const { library, calls } = loadLibrary();
	await library.init({ router: {}, middleware: {} });
	assert.deepEqual(calls.routes, ['/admin/plugins/wno-alyx', '/user/:userslug/wno-alyx']);
	const admin = await library.addAdminNavigation({ plugins: [] });
	assert.equal(admin.plugins[0].route, '/plugins/wno-alyx');
	assert.equal(admin.plugins[0].name, 'WNO Alyx');
	const profile = await library.addProfileItem({ links: [] });
	assert.equal(profile.links[0].route, 'wno-alyx');
	for (const hook of readJSON('plugin.json').hooks) {
		assert.equal(typeof library[hook.method], 'function', `Missing hook: ${hook.method}`);
	}
	assert(read('lib/controllers.js').includes("res.render('admin/plugins/wno-alyx'"));
	assert(read('lib/controllers.js').includes("res.render('account/wno-alyx'"));
});

test('theme settings ignore Harmony user fields and read only their own namespace', async () => {
	const { library, calls } = loadLibrary({
		themeSettings: { enableQuickReply: 'off', openSidebars: 'on' },
		userSettings: {
			enableQuickReply: 'on',
			openSidebars: 'off',
			wnoAlyx_enableQuickReply: 'on',
			wnoAlyx_mobileTopicTeasers: 'on',
		},
	});
	const config = await library.loadThemeConfig(1);
	assert.deepEqual(calls.namespaces, ['wno-alyx']);
	assert.equal(config.enableQuickReply, true);
	assert.equal(config.openSidebars, true);
	assert.equal(config.mobileTopicTeasers, true);
	assert.equal(config.chatModals, false);
	const ownAdmin = await library.getAdminSettings({ plugin: 'wno-alyx', values: { openSidebars: 'on' } });
	assert.equal(ownAdmin.values.openSidebars, 'on');
	assert.equal(ownAdmin.values.enableQuickReply, 'on');
	const harmonyAdmin = { plugin: 'harmony', values: {} };
	assert.equal(await library.getAdminSettings(harmonyAdmin), harmonyAdmin);
	assert.deepEqual(harmonyAdmin.values, {});
});

test('all user preferences are independently saved without changing Harmony settings', async () => {
	assert.equal(userKeys.length, 10);
	const { library } = loadLibrary();
	const data = Object.fromEntries(userKeys.map(key => [key, 'on']));
	const hookData = {
		data: { ...data, enableQuickReply: 'off', openSidebars: 'off' },
		settings: { enableQuickReply: 'on', openSidebars: 'on' },
	};
	await library.saveUserSettings(hookData);
	for (const key of userKeys) {
		assert.equal(hookData.settings[key], 'on');
	}
	assert.equal(hookData.settings.enableQuickReply, 'on');
	assert.equal(hookData.settings.openSidebars, 'on');
	assert(read('public/wno-alyx.js').includes("wnoAlyx_openSidebars: sidebarEl.hasClass('open')"));
	const reset = await library.saveUserSettings({ data: { wnoAlyx_chatModals: '' }, settings: {} });
	assert(Object.hasOwn(reset.settings, 'wnoAlyx_chatModals'));
	assert.equal(reset.settings.wnoAlyx_chatModals, undefined);
	const legacy = await library.saveUserSettings({ data: { chatModals: 'on' }, settings: {} });
	assert.deepEqual(legacy.settings, {});
});

test('colour-mode state uses the same WNO Alyx namespace everywhere', () => {
	const header = read('templates/header.tpl');
	const client = read('public/wno-alyx.js');
	for (const source of [header, client]) {
		assert(source.includes('wno-alyx-color-mode='));
		assert(source.includes('app.wnoAlyxColorMode'));
		assert(!source.includes('harmony-color-mode='));
	}
	for (const file of ['templates/partials/color-modes.tpl', 'public/wno-alyx.js', 'scss/alyx.scss']) {
		assert(read(file).includes('component="wno-alyx/color-modes"'));
	}
});
