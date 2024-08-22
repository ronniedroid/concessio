import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gdk from 'gi://Gdk';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';

import './form.js';
import './boxedList.js';
import { CncWindow } from './window.js';
import { CncHelpDialog } from "./helpDialog.js";

export const CncApplication = GObject.registerClass({
    GTypeName: 'CncApplication'
}, class extends Adw.Application {
    vfunc_startup() {
	super.vfunc_startup();
        this.#loadSettings();
	this.#loadStylesheet();
        this.#setupActions();
    }
    
    vfunc_activate() {
        const window = new CncWindow({ application: this });
        window.present();
    }

    #loadSettings() {
	globalThis.settings = new Gio.Settings({ schemaId: this.applicationId });
    }

    #setupActions() {
        const HelpDialog = new CncHelpDialog();

        const helpAction = new Gio.SimpleAction({name: 'help'});
        const aboutAction = new Gio.SimpleAction({name: 'about'});
        aboutAction.connect("activate", () => this._openAboutDialog());
        helpAction.connect("activate", () => HelpDialog.present(this.get_active_window()));
        this.add_action(aboutAction);
        this.add_action(helpAction);
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
            comments: (_(
                "Concessio helps you understand and convert between unix permessions representations"
            )
            ),
            website: "https://github.com/ronniedroid/concessio",
            issue_url: "https://github.com/ronniedroid/concessio/issues/new",
            copyright: "© 2024 Ronnie Nissan",
            license_type: Gtk.License.GPL_3_0,
            developers: ["Ronnie Nissan <ronnie.nissan@proton.me>"],
            designers: ["Brage Fuglseth https://bragefuglseth.dev"],
            artists: ["Domenik https://github.com/drpetrikov"],
        });

        dialog.add_acknowledgement_section(_("Special thanks to"), [_("GNOME Desgin Team")]);
        
        dialog.present(this.get_active_window());
    }
});
