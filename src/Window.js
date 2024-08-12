import GObject from 'gi://GObject';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export const CncWindow = GObject.registerClass({
    GTypeName: 'CncWindow',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/Window.ui',
    InternalChildren: [
        'form',
        "boxedList"
    ]
}, class extends Adw.ApplicationWindow {
    constructor(params = {}) {
        super(params);
        this.#setupActions();
    }

    #setupActions() {
        ['u1', 'u2', 'u4', 'g1', 'g2', 'g4', 'o1', 'o2', 'o4'].forEach(id => {
            const action = Gio.SimpleAction.new_stateful(id, null, new GLib.Variant('b', false));
            action.connect('activate', () => this._onActionActivated(id));
            this.add_action(action);
        });

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

    _onActionActivated(id) {
        const action = this.lookup_action(id);
        const currentState = action.get_state().get_boolean();
        const newState = !currentState;

        action.change_state(new GLib.Variant('b', newState));
        
        const symbolicValue = this._boxedList.getSymbolicValue();
        const numericValue = symbolicToNumeric(symbolicValue);
        this._form._symbolic.set_text(symbolicValue);
        this._form._numeric.set_text(numericValue);
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
