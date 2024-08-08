import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

export const CncForm = GObject.registerClass({
    GTypeName: 'CncForm',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/Form.ui',
}, class extends Gtk.Widget { });
