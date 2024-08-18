import GObject from 'gi://GObject';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gdk from 'gi://Gdk';
import GdkPixbuf from 'gi://GdkPixbuf';

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
    }

    #setupActions() {
        ['u1', 'u2', 'u4', 'g1', 'g2', 'g4', 'o1', 'o2', 'o4'].forEach(id => {
            const action = new Gio.SimpleAction({name: id, state: GLib.Variant.new_boolean(false)});
            action.connect('notify::state', (act) => {
                this._onActionActivated(act);
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

        const copyToClipboardAction = new Gio.SimpleAction({
            name: "copyToClipboard",
            parameterType: GLib.VariantType.new('s')
        });

        copyToClipboardAction.connect("activate", (_action, params) => {
            this._copyToClipboard(params.unpack());
            console.log("here");
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

    _onActionActivated(act) {
        const button = this._boxedList[`_${act.name}`];
        button.active = act.state.unpack();

        button.connect('toggled', () => {
            act.set_state(GLib.Variant.new_boolean(button.active));
        });
        
        const symbolicValue = this._boxedList.getSymbolicValue();
        const numericValue = symbolicToNumeric(symbolicValue);
        this._form._symbolic.set_text(symbolicValue);
        this._form._numeric.set_text(numericValue);
    }

    _copyToClipboard(text) {
        const display = Gdk.Display.get_default();
        const clipboard = display.get_clipboard();

        const content = Gdk.ContentProvider.new_for_value(text);
        clipboard.set_content(content);
        const toast = new Adw.Toast({ title: _("Copied to clipboard!") });
        this._toastOverlay.add_toast(toast);
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
