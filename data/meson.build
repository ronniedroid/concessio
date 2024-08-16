# Compile the resources
gnome.compile_resources(
	APP_ID + '.data',
	APP_ID + '.data.gresource.xml',
	gresource_bundle: true,
	install: true,
	install_dir: get_option('datadir') / APP_ID
)

# Install the application icons
install_data(
	'icons' / APP_ID + '.svg',
	install_dir: get_option('datadir') / 'icons' / 'hicolor' / 'scalable' / 'apps'
)
install_data(
	'icons' / APP_ID + '-symbolic.svg',
	install_dir: get_option('datadir') / 'icons' / 'hicolor' / 'symbolic' / 'apps'
)

# Install the D-Bus service file
configure_file(
	input: APP_ID + '.service',
	output: APP_ID + '.service',
	configuration: {
		'APP_ID': APP_ID,
		'BINDIR': get_option('prefix') / get_option('bindir')
	},
	install: true,
	install_dir: get_option('datadir') / 'dbus-1' / 'services'
)

i18n.merge_file(
	type: 'desktop',
	input: configure_file(
		input: APP_ID + '.desktop',
		output: APP_ID + '.desktop.in',
		configuration: {
			'APP_ID': APP_ID,
			'BINDIR': get_option('prefix') / get_option('bindir')
		}
	),
	output: APP_ID + '.desktop',
	po_dir: meson.project_source_root() / 'po',
	install: true,
	install_dir: get_option('datadir') / 'applications'
)