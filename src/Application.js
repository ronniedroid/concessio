import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gdk from 'gi://Gdk';
import Gtk from 'gi://Gtk';

import './Form.js';
import './BoxedList.js';
import { CncWindow } from './Window.js';

export const CncApplication = GObject.registerClass({
    GTypeName: 'CncApplication'
}, class extends Adw.Application {
    vfunc_startup() {
	super.vfunc_startup();
	this.#loadStylesheet();
    }
    
    vfunc_activate() {
        const window = new CncWindow({ application: this });
        window.present();
    }

    #loadStylesheet() {
		const provider = new Gtk.CssProvider();
		provider.load_from_resource('/io/github/ronniedroid/concessio/css/style.css');

		Gtk.StyleContext.add_provider_for_display(
			Gdk.Display.get_default(),
			provider,
			Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
		);
	}
})
