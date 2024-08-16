import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import Adw from 'gi://Adw';

export const CncForm = GObject.registerClass({
    GTypeName: 'CncForm',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/Form.ui',
    InternalChildren: [
        'numeric',
        'symbolic'
    ]
}, class extends Gtk.Widget {
    _validateSymbolic(symbolic) {
        return symbolic.length === 9 && /^[r-][w-][x-][r-][w-][x-][r-][w-][x-]$/.test(symbolic);
    }

    _validateNumeric(numeric) {
        return numeric.length === 3 && /^[0-7]+$/.test(numeric);
    }

    _removeErrorClass(_entry) {
        _entry.remove_css_class("error");
    }

    _copyToClipboard(_entry) {
        const display = Gdk.Display.get_default();
        const clipboard = display.get_clipboard();

        if (_entry.get_text().length > 0 && !_entry.has_css_class("error")) {
            const content = Gdk.ContentProvider.new_for_value(_entry.get_text());
            clipboard.set_content(content);
            const toast = new Adw.Toast({ title: _("Copied to clipboard!") });
            this.toastOverlay.add_toast(toast);
        }
    }

    setOverlay(overlay) {
        this.toastOverlay = overlay;
    }
});
