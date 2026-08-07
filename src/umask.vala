/* umask.vala
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

[GtkTemplate (ui = "/io/github/ronniedroid/concessio/umask.ui")]
public class Concessio.UMask : Gtk.Box {
    [GtkChild]
    private unowned Gtk.Entry umask_entry;
    [GtkChild]
    private unowned Gtk.Label files_target_label;
    [GtkChild]
    private unowned Gtk.Label dirs_target_label;

    public uint umask { get; set; default = 0022; }
    public signal void copied (string text);

    private const uint FILES_BASE = 0666;
    private const uint DIRS_BASE = 0777;
    private const uint ALL_BITS = 0777;

    construct {
        notify["umask"].connect (() => {
            update_ui_from_umask ();
        });

        umask_entry.activate.connect (update_umask_from_entry);

        update_ui_from_umask ();
    }

    private void update_ui_from_umask () {
        umask_entry.text = "%03o".printf (umask & ALL_BITS);
        umask_entry.remove_css_class ("error");

        files_target_label.label = "%03o".printf (FILES_BASE & ~umask & ALL_BITS);
        dirs_target_label.label = "%03o".printf (DIRS_BASE & ~umask & ALL_BITS);
    }

    private void update_umask_from_entry () {
        uint parsed;
        if (Concessio.Util.try_parse_octal (umask_entry.text, out parsed, 0777)) {
            umask = parsed & ALL_BITS;
            umask_entry.remove_css_class ("error");
        } else {
            umask_entry.add_css_class ("error");
        }
    }

    // Callbacks

    [GtkCallback]
    private void commit_umask_value () {
        umask_entry.activate ();
    }

    [GtkCallback]
    private void copy_umask_value () {
        Concessio.Util.copy_to_clipboard (this, umask_entry.text);
    }
}
