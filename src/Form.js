import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

export const CncForm = GObject.registerClass({
    GTypeName: 'CncForm',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/Form.ui',
    InternalChildren: [
        'numeric',
        'symbolic'
    ]
}, class extends Gtk.Widget {
    _init() {
        super._init();

        this._symbolic.connect('activate', this._onSymbolicActivated.bind(this));
        this._symbolic.connect('changed', () => this._symbolic.remove_css_class("error"));

        this._numeric.connect('activate', this._onNumericActivated.bind(this));
        this._numeric.connect('changed', () => this._numeric.remove_css_class("error"));
    }

    _onSymbolicActivated(entry) {
        const symbolicValue = entry.get_text();

        if (this._validateSymbolic(symbolicValue)) {
            const numericValue = this._symbolicToNumeric(symbolicValue);
            this._numeric.set_text(numericValue);
        } else {
            this._symbolic.add_css_class("error");
        }
    }

    _onNumericActivated(entry) {
        const numericValue = entry.get_text();

        if (this._validateNumeric(numericValue)) {
            const symbolicValue = this._numericToSymbolic(numericValue);
            this._symbolic.set_text(symbolicValue);
        } else {
            this._numeric.add_css_class("error");
        }
    }

    _validateSymbolic(symbolic) {
        return symbolic.length === 9 && /^[r-][w-][x-][r-][w-][x-][r-][w-][x-]$/.test(symbolic);
    }

    _validateNumeric(numeric) {
        return numeric.length === 3 && /^[0-7]+$/.test(numeric);
    }

    _symbolicToNumeric(symbolic) {
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

    _numericToSymbolic(numeric) {
        const permMap = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];

        return numeric
            .toString()
            .split('')
            .map(digit => permMap[parseInt(digit)])
            .join('');
    };
});
