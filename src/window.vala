/* window.vala
 *
 * Copyright 2026 Ronnie Nissan Yousif
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

using Gee;

[GtkTemplate (ui = "/io/github/ronniedroid/concessio/window.ui")]
public class Concessio.Window : Adw.ApplicationWindow {
    [GtkChild]
    private unowned Adw.ToastOverlay toast_overlay;
    [GtkChild]
    private unowned Gtk.Stack stack;
    [GtkChild]
    private unowned Concessio.Permissions permissions;
    [GtkChild]
    private unowned Concessio.UMask umask;
    [GtkChild]
    private unowned Gtk.Overlay permissions_overlay;
    [GtkChild]
    private unowned Gtk.Revealer drag_revealer;
    [GtkChild]
    private unowned Adw.StatusPage drag_status_page;

    private GLib.Settings settings = new GLib.Settings ("io.github.ronniedroid.concessio");

    static construct {
        typeof (Concessio.Permissions).ensure ();
        typeof (Concessio.UMask).ensure ();
    }

    public Window (Adw.Application app) {
        Object (application: app);

        setup_welcome_screen ();
        setup_actions ();
        setup_file_drop ();

        permissions.copied.connect ((text) => {
            var toast = new Adw.Toast (_("Copied “%s”").printf (text));
            toast.timeout = 2;
            toast_overlay.add_toast (toast);
        });

        umask.copied.connect ((text) => {
            var toast = new Adw.Toast (_("Copied “%s”").printf (text));
            toast.timeout = 2;
            toast_overlay.add_toast (toast);
        });
    }

    private void setup_welcome_screen () {
        if (settings.get_boolean ("welcome-screen-shown")) {
            stack.set_visible_child_name ("main_page");
        } else {
            stack.set_visible_child_name ("welcome_page");
        }
    }

    private void setup_actions () {
        var change_view_action =
            new SimpleAction ("change-view",
                              new GLib.VariantType ("s"));

        change_view_action.activate.connect ((action, param) => {
            if (param == null)
                return;

            var view = param.get_string ();
            this.stack.visible_child_name =
                view;
            settings.set_boolean ("welcome-screen-shown", true);
        });
        this.add_action (change_view_action);

        var open_action = new SimpleAction ("open", null);
        open_action.activate.connect (() => {
            open_file.begin ();
        });
        this.add_action (open_action);
    }

    private void setup_file_drop () {
        var target = new Gtk.DropTarget (typeof (Gdk.FileList), Gdk.DragAction.COPY);
        target.preload = true;
        target.notify["value"].connect (() => {
            if (target.current_drop != null) {
                update_file_drop_message (target.get_value ());
            }
        });
        target.notify["current-drop"].connect (() => {
            bool active = target.current_drop != null;
            if (active) {
                update_file_drop_message (target.get_value ());
            }
            set_file_drop_active (active);
        });
        target.drop.connect ((value, x, y) => {
            set_file_drop_active (false);
            var file = get_single_dropped_file (value);
            if (file == null) {
                return false;
            }
            try {
                permissions.load_file (file);
                return true;
            } catch (Error e) {
                warning ("Failed to open dropped file: %s", e.message);
                toast_overlay.add_toast (new Adw.Toast (_("Failed to open file.")));
                return false;
            }
        });
        permissions_overlay.unmap.connect (() => {
            set_file_drop_active (false);
        });
        permissions_overlay.add_controller (target);
    }

    private File ? get_single_dropped_file (Value? value) {
        if (value == null || !value.holds (typeof (Gdk.FileList))) {
            return null;
        }

        var files = ((Gdk.FileList) value).get_files ();
        if (files == null || files.next != null) {
            return null;
        }

        return files.data;
    }

    private void update_file_drop_message (Value? value) {
        bool invalid = value != null && get_single_dropped_file (value) == null;
        drag_status_page.title = invalid
            ? _("Drop one file at a time")
            : _("Drop to view permissions");
        if (invalid) {
            drag_status_page.add_css_class ("drop-error");
        } else {
            drag_status_page.remove_css_class ("drop-error");
        }
    }

    private void set_file_drop_active (bool active) {
        drag_revealer.reveal_child = active;
        if (active) {
            permissions_overlay.child.add_css_class ("drop-blurred");
        } else {
            permissions_overlay.child.remove_css_class ("drop-blurred");
            drag_status_page.remove_css_class ("drop-error");
        }
    }

    private async void open_file () {
        var dialog = new Gtk.FileDialog ();

        try {
            File file = yield dialog.open (this, null);

            permissions.load_file (file);
        } catch (Error e) {
            if (!(e is Gtk.DialogError.DISMISSED)) {
                toast_overlay.add_toast (
                                         new Adw.Toast (_("Failed to open file."))
                );
            }
        }
    }
}
