'use strict';

const Controllers = module.exports;

const accountHelpers = nodebb.require('./src/controllers/accounts/helpers');
const helpers = nodebb.require('./src/controllers/helpers');

Controllers.renderAdminPage = (req, res) => {
	res.render('admin/plugins/wno-alyx', {
		title: 'WNO Alyx',
	});
};

Controllers.renderThemeSettings = async (req, res, next) => {
	const userData = await accountHelpers.getUserDataByUserSlug(req.params.userslug, req.uid, req.query);
	if (!userData) {
		return next();
	}
	const lib = require('../library');
	userData.theme = await lib.loadThemeConfig(userData.uid);

	userData.title = 'WNO Alyx';
	userData.breadcrumbs = helpers.buildBreadcrumbs([
		{ text: userData.username, url: `/user/${userData.userslug}` },
		{ text: 'WNO Alyx' },
	]);

	res.render('account/wno-alyx', userData);
};
