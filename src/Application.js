import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gdk from 'gi://Gdk';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';

import {CncForm} from './Form.js';
import './BoxedList.js';
import { CncWindow } from './Window.js';

export const CncApplication = GObject.registerClass({
    GTypeName: 'CncApplication'
}, class extends Adw.Application {
    vfunc_startup() {
	super.vfunc_startup();
	this.#loadStylesheet();
        this.#setupActions();
    }
    
    vfunc_activate() {
        const window = new CncWindow({ application: this });
        window.present();
    }

    #setupActions() {
        const aboutAction = new Gio.SimpleAction({name: 'about'});
        aboutAction.connect("activate", () => this._openAboutDialog());
        this.add_action(aboutAction);
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

    _openAboutDialog() {
        const dialog = new Adw.AboutDialog({
            application_icon: "io.github.ronniedroid.concessio",
            application_name: "Concessio",
            developer_name: "Ronnie Nissan",
            version: pkg.version,
            comments: (
                "Typeset is an app that doesn’t exist and is used as an example content for About Dialog."
            ),
            website: "https://github.com/ronniedroid/concessio",
            issue_url: "https://github.com/ronniedroid/concessio/issues",
            copyright: "© 2024 Ronnie Nissan",
            license_type: Gtk.License.GPL_3_0,
            developers: ["Ronnie Nissan <ronnie.nissan@proton.me>"],
            designers: ["Brage Fuglseth <bragefuglseth@gnome.org>"],
        });

        dialog.present(this.get_active_window());
    }
});
