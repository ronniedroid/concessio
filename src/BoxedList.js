import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

export const CncBoxedList = GObject.registerClass({
    GTypeName: 'CncBoxedList',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/BoxedList.ui'
}, class extends Gtk.ListBox { });
