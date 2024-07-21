// import Gio from 'gi://Gio';
// import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Adw from 'gi://Adw';

export const CncWindow = GObject.registerClass({
    GTypeName: 'CncWindow',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/Window.ui',
    // InternalChildren: ['viewStack'],
}, class extends Adw.ApplicationWindow {
    constructor(params = {}) {
        super(params);
        // this.#setupActions();
    }

    vfunc_close_request() {
        super.vfunc_close_request();
        this.run_dispose();
    }

    // #setupActions() {
    //     // Create the action
    //     const changeViewAction = new Gio.SimpleAction({
    //         name: 'change-view',
    //         parameterType: GLib.VariantType.new('s'),
    //     });

    //     // Connect to the activate signal to run the callback
    //     changeViewAction.connect('activate', (_action, params) => {
    //         this._viewStack.visibleChildName = params.unpack();
    //     });

    //     // Add the action to the window
    //     this.add_action(changeViewAction);
    // }
});
