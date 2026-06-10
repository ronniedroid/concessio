/* application.vala
 *
 * Copyright 2025 Ronnie Nissan Yousif
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

public class Concessio.Application : Adw.Application {
	public Application () {
		Object (
		        application_id: "io.github.ronniedroid.concessio",
		        flags: ApplicationFlags.DEFAULT_FLAGS,
		        resource_base_path: "/io/github/ronniedroid/concessio"
		);
	}

	construct {
		ActionEntry[] action_entries = {
			{ "about", this.on_about_action },
			{ "quit", this.quit },
			{ "help", this.on_help_action }
		};
		this.add_action_entries (action_entries, this);
		this.set_accels_for_action ("app.quit", { "<primary>q" });
		this.set_accels_for_action ("window.close", { "<Primary>w" });
        this.set_accels_for_action ("app.help", {"<Primary>h"});
	}

	public override void activate () {
		base.activate ();
        // var _ = typeof (Concessio.Permissions);
		var win = this.active_window ?? new Concessio.Window (this);
		win.present ();
	}

	private void on_help_action () {
        var help_dialog = new HelpDialog();
        help_dialog.present (this.active_window);
    }

	private void on_about_action () {
		string[] developers = { "Ronnie Nissan https://ronnienissan.pages.dev/" };
		string[] designers = { "Brage Fuglseth https://bragefuglseth.dev" };
		string[] artists = { "Dominik Baran https://github.com/drpetrikov", };
        string[] acknowledged = {"Alice Mikhaylenko", "Jakub Steiner https://jimmac.eu/"};
		var about = new Adw.AboutDialog () {
			application_name = _("Concessio"),
			comments = _(
			             "Concessio helps you understand and convert between unix permissions representations"
			    ),
			website = "https://github.com/ronniedroid/concessio",
			issue_url = "https://github.com/ronniedroid/concessio/issues/new",
			license_type = Gtk.License.GPL_3_0,
			application_icon = "io.github.ronniedroid.concessio",
			developer_name = "Ronnie Nissan",
			translator_credits = _("translator-credits"),
			version = Config.PACKAGE_VERSION,
			developers = developers,
			designers = designers,
			artists = artists,
			copyright = "© 2024 Ronnie Nissan",
		};

		about.add_other_app ("io.github.getnf.embellish", _("Embellish"), _("Install nerd fonts"));
		about.add_other_app ("io.github.sitraorg.sitra", _("Sitra"), _("Get fonts from online sources"));
        about.add_acknowledgement_section(_("Special thanks to"), acknowledged);

		about.present (this.active_window);
	}
}
