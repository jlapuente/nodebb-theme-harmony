'use strict';

define('admin/plugins/wno-alyx', ['settings'], function (Settings) {
	const ACP = {};

	ACP.init = function () {
		Settings.load('wno-alyx', $('.wno-alyx-settings'));

		$('#save').on('click', function () {
			Settings.save('wno-alyx', $('.wno-alyx-settings'));
		});
	};

	return ACP;
});
