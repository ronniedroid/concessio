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
    private unowned Gtk.DropDown input_type;
    [GtkChild]
    private unowned Gtk.Label umask_target_label;
    [GtkChild]
    private unowned Gtk.Label files_target_label;
    [GtkChild]
    private unowned Gtk.Label dirs_target_label;

    public uint umask { get; set; default = 0022; }

    private const uint FILES_BASE = 0666;
    private const uint DIRS_BASE = 0777;
    private const uint ALL_BITS = 0777;

    private enum InputType {
        UMASK,
        FILES,
        DIRECTORIES
    }

    private uint files_permission;
    private uint dirs_permission;

    construct {
        notify["umask"].connect (() => {
            update_ui_from_umask ();
        });

        umask_entry.activate.connect (update_umask_from_entry);
        input_type.notify["selected"].connect (update_entry_from_selection);

        update_ui_from_umask ();
    }

    private void update_ui_from_umask () {
        files_permission = FILES_BASE & ~umask & ALL_BITS;
        dirs_permission = DIRS_BASE & ~umask & ALL_BITS;
        umask_target_label.label = "%03o".printf (umask & ALL_BITS);
        files_target_label.label = "%03o".printf (files_permission);
        dirs_target_label.label = "%03o".printf (dirs_permission);
        update_entry_from_selection ();
    }

    private void update_entry_from_selection () {
        uint value;
        string label;
        switch ((InputType) input_type.selected) {
        case InputType.FILES:
            value = files_permission;
            label = _("File permissions");
            umask_entry.placeholder_text = _("644");
            break;
        case InputType.DIRECTORIES:
            value = dirs_permission;
            label = _("Directory permissions");
            umask_entry.placeholder_text = _("755");
            break;
        default:
            value = umask & ALL_BITS;
            label = _("Umask value");
            umask_entry.placeholder_text = _("022");
            break;
        }
        umask_entry.text = "%03o".printf (value);
        umask_entry.update_property (Gtk.AccessibleProperty.LABEL, label, -1);
        clear_entry_error ();
    }

    private void update_umask_from_entry () {
        uint parsed;
        if (!Concessio.Util.try_parse_octal (umask_entry.text, out parsed, ALL_BITS)) {
            show_entry_error (_("Enter an octal value from 000 to 777."));
            return;
        }

        switch ((InputType) input_type.selected) {
        case InputType.FILES:
            if ((parsed & 0111) != 0) {
                show_entry_error (_("A umask cannot add execute permission to new files."));
                return;
            }
            umask = FILES_BASE & ~parsed & ALL_BITS;
            break;
        case InputType.DIRECTORIES:
            umask = DIRS_BASE & ~parsed & ALL_BITS;
            break;
        default:
            umask = parsed;
            break;
        }
        clear_entry_error ();
    }

    private void show_entry_error (string message) {
        umask_entry.add_css_class ("error");
        umask_entry.tooltip_text = message;
    }

    private void clear_entry_error () {
        umask_entry.remove_css_class ("error");
        umask_entry.tooltip_text = null;
    }

    // Callbacks

    [GtkCallback]
    private void commit_umask_value () {
        umask_entry.activate ();
    }
}
