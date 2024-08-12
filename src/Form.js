import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';

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

        this._symbolic.connect('changed', () => this._symbolic.remove_css_class("error"));

        this._numeric.connect('changed', () => this._numeric.remove_css_class("error"));

        this._symbolic.connect("icon-press", () => this._copyToClipboard(this._symbolic.get_text()));
        this._numeric.connect("icon-press", () => this._copyToClipboard(this._numeric.get_text()));
    }

    _validateSymbolic(symbolic) {
        return symbolic.length === 9 && /^[r-][w-][x-][r-][w-][x-][r-][w-][x-]$/.test(symbolic);
    }

    _validateNumeric(numeric) {
        return numeric.length === 3 && /^[0-7]+$/.test(numeric);
    }

    _copyToClipboard(text) {
        const display = Gdk.Display.get_default();
        const clipboard = display.get_clipboard();

        if (text.length > 0) {
        const content = Gdk.ContentProvider.new_for_value(text);
            clipboard.set_content(content);
        }
    }
});
