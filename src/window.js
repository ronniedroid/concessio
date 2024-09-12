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
        ['u1', 'u2', 'u4', 'g1', 'g2', 'g4', 'o1', 'o2', 'o4', 'suid', 'sgid', 'sticky'].forEach(id => {
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

        if (button.get_active() !== act.state.unpack()) {
            button.set_active(act.state.unpack());
        }

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
            if (error instanceof Gtk.DialogError) {
                if (error.code === Gtk.DialogError.DISMISSED) {
                }
            } else {
                console.error("Error opening file dialog:", error.message);
                const toast = new Adw.Toast({ title: _("Failed to open file.") });
                this._toastOverlay.add_toast(toast);
            }
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
    const permMap = { 'r': 4, 'w': 2, 'x': 1, '-': 0, 's': 1, 'S': 0, 't': 1, 'T': 0 };
    let suid = 0, sgid = 0, sticky = 0;

    if (symbolic[2] === 's') suid = 4;
    if (symbolic[2] === 'S') suid = 4;
    if (symbolic[5] === 's') sgid = 2;
    if (symbolic[5] === 'S') sgid = 2;
    if (symbolic[8] === 't') sticky = 1;
    if (symbolic[8] === 'T') sticky = 1;

    const specialBits = suid + sgid + sticky;

    const numeric = symbolic
        .slice(0, 9)
        .split('')
        .map(char => permMap[char])
        .reduce((acc, curr, idx) => {
            if (idx % 3 === 0) acc.push(0);
            acc[acc.length - 1] += curr;
            return acc;
        }, [])
        .join('');

    return specialBits.toString() + numeric;
}

function numericToSymbolic(numeric) {
    const permMap = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];

    const specialBits = numeric.length === 4 ? numeric[0] : '0';
    const perms = numeric.slice(-3);

    const symbolic = perms
        .split('')
        .map(digit => permMap[parseInt(digit)])
          .join('');

    let symbolicWithSpecial = symbolic.split('');
    if (specialBits & 4) {
        symbolicWithSpecial[2] = (perms[0] === '1' || perms[0] === '3' || perms[0] === '5' || perms[0] === '7') ? 's' : 'S';
    }

    if (specialBits & 2 ) {
        symbolicWithSpecial[5] = (perms[1] === '1' || perms[1] === '3' || perms[1] === '5' || perms[1] === '7') ? 's' : 'S';
    }

    if (specialBits & 1) {
        symbolicWithSpecial[8] = (perms[2] === '1' || perms[2] === '3' || perms[2] === '5' || perms[2] === '7') ? 't' : 'T';
    }

    return symbolicWithSpecial.join('');
}


function getFilePermission(file) {
  const info = file.query_info("unix::mode", Gio.FileQueryInfoFlags.NONE, null);
  const mode = info.get_attribute_uint32("unix::mode") & 0o777;
  return mode.toString(8);
}
