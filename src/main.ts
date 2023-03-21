import './style.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

import { library } from '@fortawesome/fontawesome-svg-core';

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

/* import specific icons */
import {
  faGlobe,
  faPlug,
  faTrash,
  faFlagCheckered,
  faCirclePlus,
  faFilter,
  faPersonRunning,
  faArrowDownWideShort,
  faArrowUpWideShort,
  faFilterCircleXmark,
  faArrowRotateRight,
  faWifi,
} from '@fortawesome/free-solid-svg-icons';
import { faCirclePause, faCirclePlay } from '@fortawesome/free-regular-svg-icons';

/* add icons to the library */
library.add(
  faGlobe,
  faPlug,
  faCirclePlay,
  faCirclePause,
  faFlagCheckered,
  faTrash,
  faCirclePlus,
  faFilter,
  faPersonRunning,
  faArrowUpWideShort,
  faArrowDownWideShort,
  faFilterCircleXmark,
  faArrowRotateRight,
  faWifi,
);

const app = createApp(App);

app.use(createPinia());
app.component('FontAwesomeIcon', FontAwesomeIcon);
app.mount('#app');
