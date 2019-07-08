/*! Copyright (c) 2015 RICOH IMAGING COMPANY, LTD. */

"use strict";

/*--------------------------------------------------------------------------*/
/**
 * 繝�Δ繧ｷ繝翫Μ繧ｪ
 */
$(function(){
	$.gr.demoScenarios = {
		basic: [
			{ target: "a:contains('Menu')" }, { target: "#gr-menu a:contains('Commander')" },

			{ target: "#gr-control-navbar li:eq(1) a" },
			{ target: "option:textIs('P')" },
			{ target: "a:contains('Focus')" }, { target: "a:textIs('Shutter')", interval: 2 },
			{ target: "a:contains('Focus')" }, { target: "a:textIs('Shutter')", interval: 2 },
			{ target: "a:contains('Focus')" }, { target: "a:textIs('Shutter')", interval: 2 },

			{ target: "option:textIs('MY1')" },
			{ target: "a:contains('Settings')" },
			{ target: "a:contains('Clear')" },
			{ target: "label:contains('ISO') + .ui-select option:contains('Auto-Hi')" },
			{ target: "label:contains('WB') + .ui-select option:contains('MP Auto')" },
			{ target: "label:contains('Focus') + .ui-select option:contains('Spot')" },
			{ target: "a:contains('Transmit')" },
			{ target: "a:contains('Focus')" }, { target: "a:textIs('Shutter')", interval: 2 },

			{ target: "a:contains('Settings')" },
			{ target: "label:contains('Aspect') + .ui-select option:contains('1:1')" },
			{ target: "label:contains('Crop') + .ui-select option:contains('35mm')" },
			{ target: "label:contains('Effect') + .ui-select option:contains('X Process')" },
			{ target: "a:contains('Transmit')" },
			{ target: "a:contains('Focus')" }, { target: "a:textIs('Shutter')", interval: 2 },

//			{ target: "a:contains('Settings')" },
//			{ target: "label:contains('ISO') + .ui-select option:contains('Auto')" },
//			{ target: "label:contains('WB') + .ui-select option:contains('MP Auto')" },
//			{ target: "label:contains('Flash') + .ui-select option:contains('Auto')" },
//			{ target: "label:contains('Focus') + .ui-select option:contains('Multi')" },
//			{ target: "label:contains('Metering') + .ui-select option:contains('Multi')" },
//			{ target: "label:contains('BKT') + .ui-select option:contains('Off')" },
//			{ target: "label:contains('Format') + .ui-select option:contains('L')" },
//			{ target: "label:contains('Aspect') + .ui-select option:contains('3:2')" },
//			{ target: "label:contains('Crop') + .ui-select option:contains('Off')" },
//			{ target: "label:contains('Effect') + .ui-select option:contains('Off')" },
//			{ target: "label:contains('Image') + .ui-select option:contains('Standard')" },
//			{ target: "label:contains('DR') + .ui-select option:contains('Off')" },
//			{ target: "a:contains('Transmit')" },

			{ target: "option:textIs('P')" },
			{ target: "label:contains('Selftimer') + select option:contains('2 Sec')" },
			{ target: "a:contains('Focus')" }, { target: "a:textIs('Shutter')", interval: 3 },
			{ target: "label:contains('Selftimer') + select option:contains('Off')" },

			{ target: "a:contains('Quickview')" },
			{ target: "a:contains('Latest')", interval: 3 },
			{ target: "#gr-quick-single a:first" },
			{ target: "div.pswp button[title*=Previous]" },
			{ target: "div.pswp button[title*=Previous]" },
			{ target: "div.pswp button[title*=Previous]" },
			{ target: "div.pswp button[title*=Close]" },

			{ target: "a:contains('Recent')", interval: 3 },
			{ target: "a:contains('Download')", interval: 3 },
			{ target: "#gr-quick-multi a:eq(0)" },
			{ target: "#gr-quick-multi a:eq(1)", optional: true },
			{ target: "#gr-quick-multi a:eq(2)", optional: true, interval: 3 },
			{ target: "a:contains('Done')" },
			{ target: "a:contains('Close')" },

			{ target: "option:textIs('Av')" },
			{ target: "#gr-control-navbar li:eq(0) a" },
			{ target: "a:contains('Dial-R')" },
			{ target: "a:contains('Dial-R')" },
			{ target: "a:contains('Dial-R')" },
			{ target: "a:contains('Dial-L')" },
			{ target: "a:contains('Dial-L')" },
			{ target: "a:contains('Dial-L')" },

			{ target: "#gr-control-navbar li:eq(2) a" },
			{ target: "a:textIs('OK')" },
			{ target: "a:contains('WB')" },
			{ target: "a:contains('WB')" },
			{ target: "a:contains('WB')" },
			{ target: "a:contains('Macro')" },
			{ target: "a:contains('Macro')" },
			{ target: "a:contains('Macro')" },

			{ target: "#gr-control-navbar li:eq(1) a" },
			{ target: "label:contains('Lens Lock') + select option:contains('Lock')" },
			{ target: "label:contains('Lens Lock') + select option:contains('Off')" },

			{ target: "a:contains('Menu')" }, { target: "#gr-menu a:contains('Viewer')", interval: 3 },
			{ target: "#gr-folderview a:last", interval: 3 },
			{ target: "#gr-thumbview a:last" },
			{ target: "div.pswp button[title*=Previous]" },
			{ target: "div.pswp button[title*=Previous]" },
			{ target: "div.pswp button[title*=Previous]" },
			{ target: "div.pswp button[title*=Previous]" },
			{ target: "div.pswp button[title*=Previous]" },
			{ target: "div.pswp button[title*=Zoom]" },
			{ target: "div.pswp button[title*=Zoom]" },
			{ target: "div.pswp button[title*=Close]" },

			{ target: "a:contains('Download')" },
			{ target: ".ui-popup-active a:contains('Download')", optional: true },
			{ target: "#gr-thumbview a:eq(0)" },
			{ target: "#gr-thumbview a:eq(1)", optional: true },
			{ target: "#gr-thumbview a:eq(2)", optional: true, interval: 3 },
			{ target: "a:contains('Done')" },
			{ target: "a:contains('Back')" },

			{ target: "a:contains('Menu')" }, { target: "#gr-menu a:contains('Presets')", interval: 3 },
			{ target: "a:contains('Interval Shooting')", interval: 5 },
			{ target: "a:contains('Interval Shooting')", interval: 3 },
			{ target: "a:contains('Sleep')", interval: 3 },

			{ target: "a:contains('Menu')" }, { target: "#gr-menu a:contains('Utilities')", interval: 3 },
			{ target: "a:contains('Wi-Fi')", interval: 3 },
			{ target: "a:contains('Close')" },

			{ target: "a:contains('Menu')" }, { target: "#gr-menu a:contains('Configuration')", interval: 3 },

			{ target: "a:contains('Menu')" }, { target: "#gr-menu a:contains('About')", interval: 10 }
		]
	};
});

/**
 * 繝�せ繝医こ繝ｼ繧ｹ
 */
$(function(){
	$.gr.testCases = {
		quickCheck: [
			{ target: "a:contains('Menu')" }, { target: "#gr-menu a:contains('Commander')" },
			{ target: "#gr-control-navbar li:eq(0) a" },
			{ target: "#gr-control-navbar li:eq(2) a" },
			{ target: "#gr-control-navbar li:eq(1) a" },
			{ target: "a:contains('Focus')" },
			{ target: "a:textIs('Shutter')" },
			{ target: "a:contains('Settings')" },
			{ target: "a:contains('Cancel')" },
			{ target: "a:contains('Quickview')" },
			{ target: "a:contains('Recent')" },
			{ target: "a:contains('Latest')" },
			{ target: "a:contains('Close')" },

			{ target: "a:contains('Menu')" }, { target: "#gr-menu a:contains('Viewer')" },
			{ target: "#gr-folderview a:first" },
			{ target: "#gr-thumbview a:first"},
			{ target: "button[title*=Close]" },
			{ target: "a:contains('Back')" },

			{ target: "a:contains('Menu')" }, { target: "#gr-menu a:contains('Presets')" },

			{ target: "a:contains('Menu')" }, { target: "#gr-menu a:contains('Utilities')" },
			{ target: "a:contains('Wi-Fi')" },
			{ target: "a:contains('Close')" },
			{ target: "a:contains('Security')" },
			{ target: "a:contains('Close')" },
			{ target: "a:contains('Reset GR')" },
			{ target: "a:contains('Cancel')" },

			{ target: "a:contains('Menu')" }, { target: "#gr-menu a:contains('Configuration')" },

			{ target: "a:contains('Menu')" }, { target: "#gr-menu a:contains('About')" }
		]
	};
});
