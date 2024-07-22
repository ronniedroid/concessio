import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

export const CncForm = GObject.registerClass({
    GTypeName: 'CncForm',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/Form.ui',
    Properties: {
        Header: GObject.ParamSpec.string(
            'title',
            'Title text',
            'Title text to display by the widget',
            GObject.ParamFlags.READWRITE,
            ''
        ),
        Desctiption: GObject.ParamSpec.string(
            'subtitle',
            'Subtitle Text',
            'Subtitle text displayed by the widget',
            GObject.ParamFlags.READWRITE,
            ''
        ),
        Placeholder: GObject.ParamSpec.string(
            'placeholder',
            'Placeholder Text',
            'Placeholder text displayed by an entery',
            GObject.ParamFlags.READWRITE,
            ''
        ),
    },
}, class extends Gtk.Widget { })