import '@babel/polyfill';
import 'whatwg-fetch';

import components from 'marko/components';

import '../css/base.scss';

import '../components/device-view'
import 'ota-device-updates'
import 'ota-device-info';

components.init();
