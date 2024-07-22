import Adw from 'gi://Adw';
import GObject from 'gi://GObject';

import './Form.js'
import './CheckBoxes.js'
import { CncWindow } from './Window.js'

export const CncApplication = GObject.registerClass({
    GTypeName: 'CncApplication'
}, class extends Adw.Application {
    vfunc_activate() {
        const window = new CncWindow({ application: this });
        window.present()
    }
})