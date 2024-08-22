import GObject from 'gi://GObject';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gdk from 'gi://Gdk';
import Gtk from 'gi://Gtk';

export const CncWindow = GObject.registerClass({
    GTypeName: 'CncWindow',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/Window.ui',
    InternalChildren: [
        "toastOverlay",
        'form',
        "boxedList",
        "stack",
    ]
}, class extends Adw.ApplicationWindow {
    constructor(params = {}) {
        super(params);
        this.#setupActions();
        this.#setupWelcomeScreen();

        Gio._promisify(Gtk.FileDialog.prototype, "open", "open_finish");
    }

    #setupWelcomeScreen() {
        if (globalThis.settings.get_boolean('welcome-screen-shown')) {
            this._stack.set_visible_child_name('mainPage');
        } else {
            this._stack.set_visible_child_name('welcomePage');
            globalThis.settings.set_boolean('welcome-screen-shown', true);
        }
    }

    #setupActions() {
        ['u1', 'u2', 'u4', 'g1', 'g2', 'g4', 'o1', 'o2', 'o4'].forEach(id => {
            const action = new Gio.SimpleAction({name: id, state: GLib.Variant.new_boolean(false)});
            action.connect('notify::state', (act) => {
                this._onButtonToggleAction(act);
            });
            this.add_action(action);
        });

        const changeViewAction = new Gio.SimpleAction({
            name: "changeView",
            parameterType: GLib.VariantType.new('s')
        });

        changeViewAction.connect("activate", (_action, params) => {
            this._stack.visibleChildName = params.unpack();
        });

        this.add_action(changeViewAction);

        const openAction = new Gio.SimpleAction({
            name: "open"
        });

        openAction.connect("activate", () => {
            this._openFileChooser();
        });

        this.add_action(openAction);

        const copyToClipboardAction = new Gio.SimpleAction({
            name: "copyToClipboard",
            parameterType: GLib.VariantType.new('s')
        });

        copyToClipboardAction.connect("activate", (_action, params) => {
            this._copyToClipboard(params.unpack());
        });

        this.add_action(copyToClipboardAction);

        this._form._symbolic.connect('activate', () => {
            const symbolicValue = this._form._symbolic.get_text();
            if (this._form._validateSymbolic(symbolicValue)) {
                const numericValue = symbolicToNumeric(symbolicValue);
                this._form._numeric.set_text(numericValue);
                this._boxedList.updateFromSymbolic(symbolicValue);
            } else {
                this._form._symbolic.add_css_class("error");
            }
        });

        this._form._numeric.connect('activate', () => {
            const numericValue = this._form._numeric.get_text();
            if (this._form._validateNumeric(numericValue)) {
                const symbolicValue = numericToSymbolic(numericValue);
                this._form._symbolic.set_text(symbolicValue);
                this._boxedList.updateFromSymbolic(symbolicValue);
            } else {
                this._form._numeric.add_css_class("error");
            }
        });
    }

    _onButtonToggleAction(act) {
        const button = this._boxedList[`_${act.name}`];
        button.active = act.state.unpack();

        button.connect('toggled', () => {
            act.set_state(GLib.Variant.new_boolean(button.active));
        });
        
        this._updateFormValues(this._boxedList.getSymbolicValue());
    }

    _copyToClipboard(text) {
        const display = Gdk.Display.get_default();
        const clipboard = display.get_clipboard();

        const content = Gdk.ContentProvider.new_for_value(text);
        clipboard.set_content(content);
        const toast = new Adw.Toast({ title: _("Copied to clipboard!") });
        this._toastOverlay.add_toast(toast);
    }

    async _openFileChooser() {
        const file_dialog = new Gtk.FileDialog();

        try {
            const file = await file_dialog.open(this, null);

            const numeric = getFilePermission(file);
            const symbolic = numericToSymbolic(numeric);
            this._updateFormValues(symbolic);
            this._boxedList.updateFromSymbolic(symbolic);

        } catch (error) {
            console.error("Error opening file dialog:", error.message);
        }
    }

    _updateFormValues(symbolic) {
        const numeric = symbolicToNumeric(symbolic);

        this._form._symbolic.set_text(symbolic);
        this._form._numeric.set_text(numeric);
    }

    vfunc_close_request() {
        super.vfunc_close_request();
        this.run_dispose();
    }
});

function symbolicToNumeric(symbolic) {
        const permMap = { 'r': 4, 'w': 2, 'x': 1, '-': 0 };

        return symbolic
            .split('')
            .map(char => permMap[char])
            .reduce((acc, curr, idx) => {
                if (idx % 3 === 0) acc.push(0);
                acc[acc.length - 1] += curr;
                return acc;
            }, [])
            .join('');
    };

function numericToSymbolic(numeric) {
        const permMap = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];

        return numeric
            .toString()
            .split('')
            .map(digit => permMap[parseInt(digit)])
            .join('');
};

function getFilePermission(file) {
  const info = file.query_info("unix::mode", Gio.FileQueryInfoFlags.NONE, null);
  const mode = info.get_attribute_uint32("unix::mode") & 0o777;
  return mode.toString(8);
}
